require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
// CORS: standardmäßig offen (öffentliche, read-only Bahn-Daten – keine Cookies/kein Auth).
// Optional via CORS_ORIGIN (kommagetrennt) einschränken, z. B. auf die Vercel-Domain.
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : true;
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Services
// Reiner Bahn-Daten-Proxy: keine DB, kein Auth. Nutzer/Accounts laufen über Firebase im Frontend.
const hafas = require('./api/hafas.js');
const cache = require('./services/cache.js');

// ============ ROUTES ============

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'zugalert-train-data',
    sources: {
      search: `db-vendo-client (Profil '${process.env.DB_PROFILE || 'dbweb'}')`,
      departures: (process.env.DB_CLIENT_ID && process.env.DB_API_KEY)
        ? 'dbris (RIS::Boards, Key gesetzt)'
        : 'dbweb/db-rest (kein DB-Key)',
      journeys: (process.env.DB_REST_URLS || 'https://v6.db.transport.rest')
    },
    timestamp: new Date()
  });
});

// Bahnhof suchen → { status, count, stations }
app.get('/api/trains/search', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ status: 'error', error: 'Query Parameter erforderlich.' });
    }

    console.log(`📍 Search: ${query}`);

    const cacheKey = `station:${query}`;
    let stations = await cache.get(cacheKey);

    if (!stations) {
      stations = await hafas.searchStation(query);
      await cache.set(cacheKey, stations, 600); // 10 Min TTL
    }

    res.json({ status: 'success', count: stations.length, stations });
  } catch (error) {
    console.error('Search Error:', error.message);
    res.status(502).json({ status: 'error', error: error.message });
  }
});

// Verbindungen → { status, connections: { journeys: [...] } }
app.get('/api/trains/connections', async (req, res) => {
  try {
    const { from, to, date, onlyRegional } = req.query;

    if (!from || !to) {
      return res.status(400).json({ status: 'error', error: 'from und to Parameter erforderlich.' });
    }

    const isRegional = onlyRegional === 'true';
    console.log(`🚂 Connections: ${from} → ${to}${isRegional ? ' (nur Regional)' : ''}`);

    const cacheKey = `connection:${from}:${to}:${date || 'now'}:${isRegional}`;
    let connections = await cache.get(cacheKey);

    if (!connections) {
      const departDate = date ? new Date(date) : new Date();
      connections = await hafas.getConnections(from, to, departDate, isRegional);
      await cache.set(cacheKey, connections, 120); // 2 Min TTL
    }

    res.json({ status: 'success', connections });
  } catch (error) {
    console.error('Connections Error:', error.message);
    res.status(502).json({ status: 'error', error: error.message });
  }
});

// Abfahrtstafel → { status, departures: [...] }
app.get('/api/trains/departures', async (req, res) => {
  try {
    const { station } = req.query;

    if (!station) {
      return res.status(400).json({ status: 'error', error: 'station Parameter erforderlich.' });
    }

    console.log(`🕐 Departures: ${station}`);

    const cacheKey = `departures:${station}`;
    let departures = await cache.get(cacheKey);

    if (!departures) {
      departures = await hafas.getDepartures(station);
      await cache.set(cacheKey, departures, 60); // 1 Min TTL
    }

    res.json({ status: 'success', departures });
  } catch (error) {
    console.error('Departures Error:', error.message);
    res.status(502).json({ status: 'error', error: error.message });
  }
});

// Störungen (an Station, aus Abfahrten abgeleitet) → { status, count, disruptions }
// Unter zwei Pfaden erreichbar: /api/trains/disruptions/:id und /api/disruptions/:id
async function disruptionsHandler(req, res) {
  try {
    const { stationId } = req.params;

    if (!stationId) {
      return res.status(400).json({ status: 'error', error: 'stationId erforderlich.' });
    }

    console.log(`⚠️  Disruptions: ${stationId}`);

    const cacheKey = `disruptions:${stationId}`;
    let disruptions = await cache.get(cacheKey);

    if (!disruptions) {
      disruptions = await hafas.getDisruptions(stationId);
      await cache.set(cacheKey, disruptions, 60); // 1 Min TTL
    }

    res.json({ status: 'success', count: disruptions.length, disruptions });
  } catch (error) {
    console.error('Disruptions Error:', error.message);
    res.status(502).json({ status: 'error', error: error.message });
  }
}

app.get('/api/trains/disruptions/:stationId', disruptionsHandler);
app.get('/api/disruptions/:stationId', disruptionsHandler);

// Fallback 404
app.use((req, res) => {
  res.status(404).json({ status: 'error', error: `Endpoint nicht gefunden: ${req.method} ${req.path}` });
});

// ============ ERROR HANDLING ============
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ status: 'error', error: 'Internal Server Error' });
});

// ============ START SERVER ============
// Nur lauschen, wenn direkt gestartet (lokal / Render via `npm start`).
// Als importiertes Modul (Tests / evtl. Serverless) wird nur die App exportiert.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`
🚂 ZugAlert Bahn-Daten-Proxy läuft! (Suche: db-vendo-client · Verbindungen/Abfahrten: db-rest ${process.env.DB_REST_URLS || 'v6.db.transport.rest'})
📍 http://localhost:${PORT}
✅ Health:       http://localhost:${PORT}/health
📍 Stationen:    http://localhost:${PORT}/api/trains/search?query=Hamburg
🚂 Verbindungen: http://localhost:${PORT}/api/trains/connections?from=8000152&to=8002549
🕐 Abfahrten:    http://localhost:${PORT}/api/trains/departures?station=8002549
⚠️  Störungen:    http://localhost:${PORT}/api/disruptions/8002549
  `);
  });
}

module.exports = app;
