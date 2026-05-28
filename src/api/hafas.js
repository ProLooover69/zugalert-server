const { createClient } = require('hafas-client');

// Importiere dbProfile korrekt und behandle den ES-Modul Wrapper im CommonJS Kontext
let dbProfile = require('hafas-client/p/db');
if (dbProfile && dbProfile.profile) {
  dbProfile = dbProfile.profile;
}

// Ergänze locale falls fehlend
if (!dbProfile.locale) {
  dbProfile.locale = 'de-DE';
}

class HafasAPI {
  constructor() {
    try {
      this.client = createClient(dbProfile, 'zugalert-backend');
      console.log('✅ HAFAS Client initialisiert mit DB-Profil');
    } catch (error) {
      console.error('❌ HAFAS Client Initialisierungsfehler:', error.message);
      this.client = null;
    }

    // Mock Stationen für schnelle Tests & Fallback
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
      if (!this.client) {
        throw new Error('HAFAS Client ist nicht initialisiert');
      }

      console.log(`🚂 Echter HAFAS Abruf: ${from} → ${to}`);
      const res = await this.client.journeys(from, to, {
        departure: date,
        results: 3
      });

      if (!res || !res.journeys || res.journeys.length === 0) {
        throw new Error('Keine Verbindungen von HAFAS zurückgegeben');
      }

      const connections = res.journeys.map((journey, idx) => {
        const firstLeg = journey.legs[0];
        const lastLeg = journey.legs[journey.legs.length - 1];

        const departureTime = firstLeg.departure || firstLeg.plannedDeparture;
        const arrivalTime = lastLeg.arrival || lastLeg.plannedArrival;

        // Delay in Minuten
        const delay = typeof firstLeg.departureDelay === 'number'
          ? Math.round(firstLeg.departureDelay / 60)
          : 0;

        const cancelled = journey.legs.some(leg => leg.cancelled === true);
        const lines = journey.legs
          .map(leg => (leg.line ? leg.line.name : ''))
          .filter(Boolean)
          .join(' -> ');

        return {
          id: journey.refreshToken || String(idx + 1),
          from: from,
          to: to,
          departure: departureTime,
          arrival: arrivalTime,
          delay: delay,
          cancelled: cancelled,
          line: lines || 'Zug',
          platform: firstLeg.platform || firstLeg.plannedPlatform || '-'
        };
      });

      console.log(`✅ Gefunden: ${connections.length} Verbindungen (HAFAS)`);
      return connections;
    } catch (error) {
      console.warn(`⚠️ HAFAS Verbindungsabruf fehlgeschlagen (${error.message}). Nutze Mock-Fallbacks.`);
      
      const mockConnections = [
        {
          id: '1',
          from: from,
          to: to,
          departure: new Date(date.getTime() + 30 * 60000).toISOString(),
          arrival: new Date(date.getTime() + 90 * 60000).toISOString(),
          delay: 0,
          cancelled: false,
          line: 'RE 3 (Mock)',
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
          line: 'RE 10 (Mock)',
          platform: '2'
        }
      ];

      return mockConnections;
    }
  }

  async searchStation(query) {
    try {
      if (!this.client) {
        throw new Error('HAFAS Client ist nicht initialisiert');
      }

      console.log(`🔍 Echte HAFAS Stationensuche: "${query}"`);
      const results = await this.client.locations(query, { results: 10 });
      
      if (!results || results.length === 0) {
        throw new Error('Keine Stationen von HAFAS gefunden');
      }

      const stations = results
        .filter(item => item.type === 'stop' || item.type === 'station')
        .map(item => ({
          id: item.id,
          name: item.name,
          latitude: item.location ? item.location.latitude : undefined,
          longitude: item.location ? item.location.longitude : undefined
        }));

      console.log(`✅ Gefunden: ${stations.length} Stationen (HAFAS)`);
      return stations;
    } catch (error) {
      console.warn(`⚠️ HAFAS Stationensuche fehlgeschlagen (${error.message}). Nutze Mock-Fallbacks.`);

      const results = [];
      for (const [key, stations] of Object.entries(this.mockStations)) {
        const matching = stations.filter(s =>
          s.name.toLowerCase().includes(query.toLowerCase()) || s.id === query
        );
        results.push(...matching);
      }

      return results.length > 0 ? results : this.mockStations[query] || [];
    }
  }

  async getDisruptions(stationId) {
    try {
      if (!this.client) {
        throw new Error('HAFAS Client ist nicht initialisiert');
      }

      console.log(`⚠️ Echte HAFAS Abfahrt-Störungssuche für Station: ${stationId}`);
      const departures = await this.client.departures(stationId, {
        duration: 60,
        remarks: true
      });

      const disruptions = [];
      departures.forEach((dep, idx) => {
        const delayMinutes = typeof dep.delay === 'number' ? Math.round(dep.delay / 60) : 0;
        const cancelled = dep.cancelled === true;

        const warnings = dep.remarks
          ? dep.remarks.filter(r => r.type === 'warning' || r.type === 'status')
          : [];

        const reason = warnings.map(w => w.text || w.summary).filter(Boolean).join(', ')
          || (cancelled ? 'Zug fällt aus' : delayMinutes > 0 ? 'Verspätung' : '');

        if (delayMinutes > 0 || cancelled || warnings.length > 0) {
          disruptions.push({
            id: dep.tripId || String(idx + 1),
            line: dep.line ? dep.line.name : 'Zug',
            direction: dep.direction || 'Unbekannt',
            departure: dep.when || dep.plannedWhen,
            delay: delayMinutes,
            cancelled: cancelled,
            reason: reason || 'Verspätung oder Störung gemeldet'
          });
        }
      });

      console.log(`✅ Gefunden: ${disruptions.length} Störungen (HAFAS)`);
      return disruptions;
    } catch (error) {
      console.warn(`⚠️ HAFAS Störungssuche fehlgeschlagen (${error.message}). Nutze Mock-Fallbacks.`);

      const mockDisruptions = [
        {
          id: '1',
          line: 'RE 3 (Mock)',
          direction: 'Hamburg-Harburg',
          departure: new Date().toISOString(),
          delay: 25,
          cancelled: false,
          reason: 'Signalstörung bei Lüneburg'
        },
        {
          id: '2',
          line: 'RE 10 (Mock)',
          direction: 'Uelzen',
          departure: new Date(Date.now() + 3600000).toISOString(),
          delay: 0,
          cancelled: true,
          reason: 'Personalmangel'
        }
      ];

      return mockDisruptions;
    }
  }
}

module.exports = new HafasAPI();
