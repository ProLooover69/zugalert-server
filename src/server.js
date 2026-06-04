require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./db');

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Services
const hafas = require('./api/hafas.js');
const cache = require('./services/cache.js');
const authRouter = require('./routes/auth.js');
const userRouter = require('./routes/users.js');

// ============ ROUTES ============

// Auth Routes
app.use('/api/auth', authRouter);

// User Routes
app.use('/api/users', userRouter);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
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
app.listen(PORT, () => {
  console.log(`
🚂 ZugAlert Server läuft! (Datenquelle: db-rest / ${process.env.DB_REST_URL || 'v6.db.transport.rest'})
📍 http://localhost:${PORT}
✅ Health:       http://localhost:${PORT}/health
📍 Stationen:    http://localhost:${PORT}/api/trains/search?query=Hamburg
🚂 Verbindungen: http://localhost:${PORT}/api/trains/connections?from=8000152&to=8002549
🕐 Abfahrten:    http://localhost:${PORT}/api/trains/departures?station=8002549
⚠️  Störungen:    http://localhost:${PORT}/api/disruptions/8002549
  `);
});

module.exports = app;
