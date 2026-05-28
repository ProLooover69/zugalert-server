const axios = require('axios');

class HafasAPI {
  constructor() {
    this.baseUrl = 'https://v5.bahn.de/bin/rest.exe';
    // Mock Stationen für schnelle Tests
    this.mockStations = {
      'Hamburg': [
        { id: '8002549', name: 'Hamburg Hbf', latitude: 53.552407, longitude: 10.006911 },
        { id: '8002550', name: 'Hamburg-Harburg', latitude: 53.462222, longitude: 9.975278 },
        { id: '8002557', name: 'Hamburg-Altona', latitude: 53.548333, longitude: 9.936111 }
      ],
      'Uelzen': [
        { id: '8000152', name: 'Uelzen', latitude: 52.961944, longitude: 10.553056 }
      ],
      'Berlin': [
        { id: '8011160', name: 'Berlin Hbf', latitude: 52.524611, longitude: 13.369722 }
      ],
      'Lüneburg': [
        { id: '8000156', name: 'Lüneburg', latitude: 53.254167, longitude: 10.413889 }
      ]
    };
  }

  async getConnections(from, to, date = new Date()) {
    try {
      console.log(`🚂 Fetching: ${from} → ${to}`);
      
      // Mock-Daten für Demo (echte HAFAS braucht komplexere Auth)
      const mockConnections = [
        {
          id: '1',
          from: from,
          to: to,
          departure: new Date(date.getTime() + 30 * 60000).toISOString(),
          arrival: new Date(date.getTime() + 90 * 60000).toISOString(),
          delay: 0,
          cancelled: false,
          line: 'RE 3',
          platform: '4'
        },
        {
          id: '2',
          from: from,
          to: to,
          departure: new Date(date.getTime() + 60 * 60000).toISOString(),
          arrival: new Date(date.getTime() + 120 * 60000).toISOString(),
          delay: 15,
          cancelled: false,
          line: 'RE 10',
          platform: '2'
        }
      ];
      
      console.log(`✅ Found ${mockConnections.length} connections`);
      return mockConnections;
    } catch (error) {
      console.error('❌ Error:', error.message);
      throw error;
    }
  }

  async searchStation(query) {
    try {
      console.log(`🔍 Searching: "${query}"`);
      
      // Suche in Mock-Daten
      const results = [];
      for (const [key, stations] of Object.entries(this.mockStations)) {
        const matching = stations.filter(s => 
          s.name.toLowerCase().includes(query.toLowerCase())
        );
        results.push(...matching);
      }
      
      console.log(`✅ Found ${results.length} stations`);
      return results.length > 0 ? results : this.mockStations[query] || [];
    } catch (error) {
      console.error('❌ Error:', error.message);
      throw error;
    }
  }

  async getDisruptions(stationId) {
    try {
      console.log(`⚠️  Checking disruptions for: ${stationId}`);
      
      // Mock Störungen
      const mockDisruptions = [
        {
          id: '1',
          line: 'RE 3',
          direction: 'Hamburg-Harburg',
          departure: new Date().toISOString(),
          delay: 25,
          cancelled: false,
          reason: 'Signalstörung bei Lüneburg'
        },
        {
          id: '2',
          line: 'RE 10',
          direction: 'Uelzen',
          departure: new Date(Date.now() + 3600000).toISOString(),
          delay: 0,
          cancelled: true,
          reason: 'Personalmangel'
        }
      ];
      
      console.log(`✅ Found ${mockDisruptions.length} disruptions`);
      return mockDisruptions;
    } catch (error) {
      console.error('❌ Error:', error.message);
      throw error;
    }
  }
}

module.exports = new HafasAPI();
