const axios = require('axios');

// Die Deutsche Bahn hat ihre alte HAFAS-API (reiseauskunft.bahn.de) abgeschaltet.
// Wir nutzen db-rest (v6.db.transport.rest) – die gepflegte REST-Schnittstelle auf
// Basis von db-vendo-client (DBs neue "vendo/movas"-API). Antworten sind FPTF-konform,
// also genau die Form, die das Frontend erwartet (legs[], stopovers[], line.name, ...).
const DB_REST_URL = process.env.DB_REST_URL || 'https://v6.db.transport.rest';

const http = axios.create({
  baseURL: DB_REST_URL,
  timeout: 13000,
  headers: {
    'User-Agent': 'zugalert-backend (github.com/ProLooover69/zugalert-server)',
    Accept: 'application/json'
  }
});

class HafasAPI {
  // ── Stationssuche → Array von { id, name, latitude, longitude } ──
  async searchStation(query) {
    console.log(`🔍 db-rest /locations: "${query}"`);
    const { data } = await http.get('/locations', {
      params: { query, results: 10, stops: true, addresses: false, poi: false, linesOfStops: false }
    });
    const list = Array.isArray(data) ? data : [];
    return list
      .filter(item => item.type === 'stop' || item.type === 'station')
      .map(item => ({
        id: item.id,
        name: item.name,
        latitude: item.location ? item.location.latitude : undefined,
        longitude: item.location ? item.location.longitude : undefined
      }));
  }

  // ── Verbindungen → db-rest-Antwort { journeys: [...], ... } durchreichen (reiche legs) ──
  async getConnections(from, to, date = new Date(), onlyRegional = false) {
    const departure = (date instanceof Date ? date : new Date(date)).toISOString();
    const params = { from, to, results: 5, stopovers: true, remarks: true, departure };
    if (onlyRegional) {
      params.nationalExpress = false; // ICE ausschließen
      params.national = false;        // IC/EC ausschließen
    }
    console.log(`🚂 db-rest /journeys: ${from} → ${to}${onlyRegional ? ' (nur Regional)' : ''}`);
    const { data } = await http.get('/journeys', { params });
    return data; // { journeys: [...], earlierRef, laterRef, ... }
  }

  // ── Abfahrtstafel → Array (FPTF departures) ──
  async getDepartures(stationId) {
    console.log(`🕐 db-rest /departures: ${stationId}`);
    const { data } = await http.get(`/stops/${encodeURIComponent(stationId)}/departures`, {
      params: { duration: 120, results: 30, remarks: true }
    });
    return Array.isArray(data) ? data : (data.departures || []);
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
