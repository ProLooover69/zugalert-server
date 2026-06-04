// Die Deutsche Bahn hat ihre alte HAFAS-API (reiseauskunft.bahn.de) abgeschaltet.
// Wir nutzen db-vendo-client – den gepflegten Nachfolger, der DBs neue "vendo/movas"-API
// direkt anspricht (kein öffentlicher Proxy). Antworten sind FPTF-konform, also genau die
// Form, die das Frontend erwartet (journeys[].legs[], stopovers[], line.name, delay in Sek.).
const { createClient } = require('db-vendo-client');

let dbProfile = require('db-vendo-client/p/db');
if (dbProfile && dbProfile.profile) dbProfile = dbProfile.profile;

const client = createClient(
  dbProfile,
  process.env.DB_USER_AGENT || 'zugalert-backend (github.com/ProLooover69/zugalert-server)'
);

class HafasAPI {
  // ── Stationssuche → Array von { id, name, latitude, longitude } ──
  async searchStation(query) {
    console.log(`🔍 locations: "${query}"`);
    const results = await client.locations(query, {
      results: 10, stops: true, addresses: false, poi: false
    });
    const list = Array.isArray(results) ? results : [];
    return list
      .filter(item => item.type === 'stop' || item.type === 'station')
      .map(item => ({
        id: item.id,
        name: item.name,
        latitude: item.location ? item.location.latitude : undefined,
        longitude: item.location ? item.location.longitude : undefined
      }));
  }

  // ── Verbindungen → FPTF-Antwort { journeys: [...], ... } durchreichen (reiche legs) ──
  async getConnections(from, to, date = new Date(), onlyRegional = false) {
    const departure = date instanceof Date ? date : new Date(date);
    const opts = { results: 5, stopovers: true, remarks: true, departure };
    if (onlyRegional) {
      opts.nationalExpress = false; // ICE ausschließen
      opts.national = false;        // IC/EC ausschließen
    }
    console.log(`🚂 journeys: ${from} → ${to}${onlyRegional ? ' (nur Regional)' : ''}`);
    const res = await client.journeys(from, to, opts);
    return res; // { journeys: [...], earlierRef, laterRef, ... }
  }

  // ── Abfahrtstafel → Array (FPTF departures) ──
  async getDepartures(stationId) {
    console.log(`🕐 departures: ${stationId}`);
    const res = await client.departures(stationId, { duration: 120, results: 30, remarks: true });
    return Array.isArray(res) ? res : (res.departures || []);
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
