const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Services
const hafas = require('./api/hafas.js');
const cache = require('./services/cache.js');

// ============ ROUTES ============

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Bahnhof suchen
app.get('/api/trains/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    console.log(`📍 Search requested: ${query}`);
    
    // Cache prüfen
    const cacheKey = `station:${query}`;
    let stations = await cache.get(cacheKey);
    
    if (!stations) {
      // Nicht im Cache → von HAFAS abrufen
      stations = await hafas.searchStation(query);
      await cache.set(cacheKey, stations, 600); // 10 Min TTL
    }

    res.json({
      success: true,
      query: query,
      count: stations.length,
      data: stations
    });
  } catch (error) {
    console.error('Search Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Verbindungen abrufen
app.get('/api/trains/connections', async (req, res) => {
  try {
    const { from, to, date } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({ error: 'from and to parameters required' });
    }

    console.log(`🚂 Connections: ${from} → ${to}`);
    
    // Cache prüfen
    const cacheKey = `connection:${from}:${to}:${date || 'today'}`;
    let connections = await cache.get(cacheKey);
    
    if (!connections) {
      // Nicht im Cache → von HAFAS abrufen
      const departDate = date ? new Date(date) : new Date();
      connections = await hafas.getConnections(from, to, departDate);
      await cache.set(cacheKey, connections, 300); // 5 Min TTL
    }

    res.json({
      success: true,
      from: from,
      to: to,
      count: connections.length,
      data: connections
    });
  } catch (error) {
    console.error('Connections Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Störungen abrufen
app.get('/api/trains/disruptions/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params;
    
    if (!stationId) {
      return res.status(400).json({ error: 'stationId required' });
    }

    console.log(`⚠️  Disruptions for: ${stationId}`);
    
    // Cache prüfen
    const cacheKey = `disruptions:${stationId}`;
    let disruptions = await cache.get(cacheKey);
    
    if (!disruptions) {
      // Nicht im Cache → von HAFAS abrufen
      disruptions = await hafas.getDisruptions(stationId);
      await cache.set(cacheKey, disruptions, 60); // 1 Min TTL (schneller updaten)
    }

    res.json({
      success: true,
      stationId: stationId,
      count: disruptions.length,
      data: disruptions
    });
  } catch (error) {
    console.error('Disruptions Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Fallback 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ============ ERROR HANDLING ============
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ============ START SERVER ============
app.listen(PORT, () => {
  console.log(`
🚂 ZugAlert Server läuft!
📍 http://localhost:${PORT}
✅ Health: http://localhost:${PORT}/health
📍 Stationen: http://localhost:${PORT}/api/trains/search?query=Hamburg
🚂 Verbindungen: http://localhost:${PORT}/api/trains/connections?from=8000152&to=8002549
⚠️  Störungen: http://localhost:${PORT}/api/trains/disruptions/8002549
  `);
});

module.exports = app;
