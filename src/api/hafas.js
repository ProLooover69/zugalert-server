const axios = require('axios');
const { createClient } = require('db-vendo-client');

// Hintergrund: Die Deutsche Bahn hat ihre alte HAFAS-API abgeschaltet und blockt von
// Cloud-IPs (wie Railway) gezielt die Journey-/Departure-Endpoints (403 Forbidden).
// Die Stationssuche (autocomplete) ist hingegen offen.
//
// Strategie:
//  • Suche  → direkt via db-vendo-client (Profil 'dbweb'), funktioniert von Railway aus.
//  • Verbindungen/Abfahrten → über eine öffentliche db-rest-Instanz proxen (deren Server-IP
//    ist nicht geblockt), mit Retry/Backoff gegen zeitweise 503er.

// ── Direkt-Client für die Suche ──
// Profile STATISCH laden – ein dynamisches require(`.../p/${x}`) kann der Vercel-Bundler
// (statische Analyse) nicht auflösen → die Function crasht zur Laufzeit (FUNCTION_INVOCATION_FAILED).
const PROFILES = {
  dbweb: require('db-vendo-client/p/dbweb'),
  dbnav: require('db-vendo-client/p/dbnav'),
  db: require('db-vendo-client/p/db'),
};
const PROFILE = process.env.DB_PROFILE || 'dbweb';
let dbProfile = PROFILES[PROFILE] || PROFILES.dbweb;
if (dbProfile && dbProfile.profile) dbProfile = dbProfile.profile;
console.log(`🚉 Suche: db-vendo-client (Profil '${PROFILE}')`);
const client = createClient(
  dbProfile,
  process.env.DB_USER_AGENT || 'zugalert-backend (github.com/ProLooover69/zugalert-server)'
);

// ── db-rest Proxy für Verbindungen/Abfahrten ──
const DB_REST_URLS = (process.env.DB_REST_URLS || 'https://v6.db.transport.rest')
  .split(',').map(s => s.trim()).filter(Boolean);
console.log(`🌐 Verbindungen/Abfahrten via db-rest: ${DB_REST_URLS.join(', ')}`);

const http = axios.create({
  timeout: 13000,
  headers: { 'User-Agent': 'zugalert-backend (github.com/ProLooover69/zugalert-server)', Accept: 'application/json' }
});

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Fragt db-rest ab; probiert Instanzen der Reihe nach und macht bei 5xx/429/Netzfehler Retries.
async function dbRestGet(path, params) {
  let lastErr;
  for (const baseURL of DB_REST_URLS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const { data } = await http.get(baseURL + path, { params });
        return data;
      } catch (err) {
        lastErr = err;
        const status = err.response && err.response.status;
        // Nicht-retrybare Client-Fehler (4xx außer 429) → nächste Instanz
        if (status && status < 500 && status !== 429) break;
        await sleep(500 * attempt); // 0.5s, 1s, 1.5s Backoff
      }
    }
  }
  const detail = lastErr && lastErr.response ? `HTTP ${lastErr.response.status}` : (lastErr ? lastErr.message : 'unbekannt');
  throw new Error(`db-rest nicht erreichbar (${detail})`);
}

function mapStations(list) {
  return (Array.isArray(list) ? list : [])
    .filter(item => item.type === 'stop' || item.type === 'station')
    .map(item => ({
      id: item.id,
      name: item.name,
      latitude: item.location ? item.location.latitude : undefined,
      longitude: item.location ? item.location.longitude : undefined
    }));
}

class HafasAPI {
  // ── Stationssuche → Array von { id, name, latitude, longitude } ──
  async searchStation(query) {
    const opts = { results: 10, stops: true, addresses: false, poi: false };
    try {
      console.log(`🔍 locations (direkt): "${query}"`);
      return mapStations(await client.locations(query, opts));
    } catch (err) {
      console.warn(`⚠️  Direkt-Suche fehlgeschlagen (${err.message}), Fallback db-rest`);
      return mapStations(await dbRestGet('/locations', { query, ...opts }));
    }
  }

  // ── Verbindungen → { journeys: [...], ... } mit reichen legs ──
  // Erst direkt via db-vendo-client (funktioniert von Nicht-Cloud-IPs), Fallback db-rest-Proxy.
  async getConnections(from, to, date = new Date(), onlyRegional = false) {
    const departure = (date instanceof Date ? date : new Date(date)).toISOString();
    try {
      const opts = { results: 5, stopovers: true, remarks: true, departure };
      if (onlyRegional) opts.products = { nationalExpress: false, national: false }; // ICE/IC/EC ausschließen
      console.log(`🚂 journeys (direkt): ${from} → ${to}${onlyRegional ? ' (nur Regional)' : ''}`);
      const res = await client.journeys(from, to, opts);
      let journeys = res.journeys || [];
      if (onlyRegional) {
        // Backstop, falls das Profil den products-Filter ignoriert
        journeys = journeys.filter(j => !(j.legs || []).some(l =>
          l.line && (l.line.product === 'nationalExpress' || l.line.product === 'national')));
      }
      return { ...res, journeys };
    } catch (err) {
      console.warn(`⚠️  Direkt-journeys fehlgeschlagen (${err.message}), Fallback db-rest`);
      const params = { from, to, results: 5, stopovers: true, remarks: true, departure };
      if (onlyRegional) { params.nationalExpress = false; params.national = false; }
      return await dbRestGet('/journeys', params); // { journeys: [...], ... }
    }
  }

  // ── Abfahrtstafel → Array (FPTF departures) ──
  // Erst direkt via db-vendo-client, Fallback db-rest-Proxy.
  async getDepartures(stationId) {
    try {
      console.log(`🕐 departures (direkt): ${stationId}`);
      const res = await client.departures(stationId, { duration: 120, results: 30 });
      return Array.isArray(res) ? res : (res.departures || []);
    } catch (err) {
      console.warn(`⚠️  Direkt-departures fehlgeschlagen (${err.message}), Fallback db-rest`);
      const data = await dbRestGet(`/stops/${encodeURIComponent(stationId)}/departures`, {
        duration: 120, results: 30
      });
      return Array.isArray(data) ? data : (data.departures || []);
    }
  }

  // ── Störungen → aus den Abfahrten abgeleitet (verspätet ≥5 Min oder ausgefallen) ──
  async getDisruptions(stationId) {
    const departures = await this.getDepartures(stationId);
    return departures
      .filter(dep => dep.cancelled === true || (typeof dep.delay === 'number' && dep.delay >= 300))
      .map((dep, idx) => {
        const delayMinutes = typeof dep.delay === 'number' ? Math.round(dep.delay / 60) : 0;
        const remarks = Array.isArray(dep.remarks)
          ? dep.remarks.filter(r => r.type === 'warning' || r.type === 'status')
          : [];
        const reason = remarks.map(r => r.text || r.summary).filter(Boolean).join(', ')
          || (dep.cancelled ? 'Zug fällt aus' : `Verspätung +${delayMinutes} Min`);
        return {
          id: dep.tripId || String(idx + 1),
          line: dep.line ? dep.line.name : 'Zug',
          direction: dep.direction || (dep.destination ? dep.destination.name : 'Unbekannt'),
          departure: dep.when || dep.plannedWhen,
          delay: delayMinutes,
          cancelled: dep.cancelled === true,
          reason
        };
      });
  }
}

module.exports = new HafasAPI();
