import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Clock, AlertTriangle, Train, MapPin, Wifi, Coffee, HelpCircle, Briefcase, ChevronLeft, Info } from 'lucide-react';
import { getDepartures } from '../services/api';
import AdSlot from '../components/AdSlot';

const StationPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const stationName = searchParams.get('name') || 'Bahnhof';

  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDepartures = async () => {
      try {
        setLoading(true);
        const data = await getDepartures(id);
        if (data.status === 'success') {
          setDepartures(data.departures || []);
        } else {
          setError(data.error || 'Fehler beim Laden der Abfahrten.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDepartures();
    }
  }, [id]);

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  const getDelayColor = (delay) => {
    if (delay === null || delay === undefined || delay === 0) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (delay < 5) return 'text-orange-600 bg-orange-50 border-orange-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link to="/" className="hover:text-orange-500 flex items-center transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Zurück zur Suche
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold uppercase tracking-wider mb-3">
              <MapPin className="w-3.5 h-3.5" />
              ZugAlert Station Hub
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              {stationName}
            </h1>
            <p className="text-gray-500 mt-2">Live-Abfahrtszeiten, Störungsmeldungen & Bahnhofsinformationen.</p>
          </div>
          
          <div className="flex items-center gap-2 text-sm bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="font-medium text-gray-700">Live Daten aktiv</span>
          </div>
        </div>
      </div>

      <AdSlot format="horizontal" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Departure Board */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-400" />
                Live Abfahrtstafel
              </h2>
              <span className="text-gray-400 text-sm">Jetzt · Nächste 2 Stunden</span>
            </div>

            <div className="p-0">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                   <div className="animate-spin w-8 h-8 rounded-full border-4 border-gray-200 border-t-orange-500"></div>
                </div>
              ) : error ? (
                <div className="p-8 text-center text-red-500">
                  <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>{error}</p>
                </div>
              ) : departures.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Train className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>Keine anstehenden Abfahrten gefunden.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {departures.map((dep, idx) => {
                    const plannedTime = formatTime(dep.plannedWhen);
                    const isCancelled = dep.cancelled;
                    const delayInMinutes = dep.delay / 60;
                    const delayText = delayInMinutes > 0 ? `+${delayInMinutes}` : 'Pünktlich';
                    
                    return (
                      <div key={dep.journeyId || idx} className="p-4 sm:p-5 hover:bg-gray-50 flex items-center gap-4 transition-colors">
                        <div className="flex-shrink-0 w-16 text-center">
                          <div className={`text-lg font-bold ${isCancelled ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                            {plannedTime}
                          </div>
                        </div>

                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                              {dep.line?.name || 'Zug'}
                            </span>
                            <span className={`text-xs ml-auto sm:ml-0 font-medium px-2 py-0.5 rounded border ${isCancelled ? 'text-red-700 bg-red-100 border-red-200' : getDelayColor(dep.delay)}`}>
                              {isCancelled ? 'Fällt aus' : delayText}
                            </span>
                          </div>
                          
                          <div className="font-semibold text-gray-900 truncate text-lg">
                            {dep.direction || dep.destination?.name || 'Unbekannt'}
                          </div>
                          
                          {(dep.platform || dep.plannedPlatform) && (
                            <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                              Gleis <strong className="text-gray-700">{dep.platform || dep.plannedPlatform}</strong>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Quelle / Source Footer */}
            {!loading && !error && departures.length > 0 && (
              <div className="bg-gray-50 border-t border-gray-100 px-6 py-3 text-xs text-gray-500 text-center">
                Quelle der Fahrplandaten: <a href="https://github.com/public-transport/hafas-client" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-orange-500 underline transition-colors">HAFAS / Deutsche Bahn</a> (leicht verändert von ZugAlert)
              </div>
            )}
            </div>
          </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-500" />
              Bahnhofs-Ausstattung
            </h3>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">WLAN Verfügbar</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Kostenloses WIFI im Empfangsgebäude.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-600">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">Schließfächer</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Gepäckschließfächer 24/7 zugänglich.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 text-orange-600">
                  <Coffee className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">Gastronomie & Shops</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Kaffee und kleine Snacks auf dem Gelände.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0 text-purple-600">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">Mobilitätsservice</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Vorab anmeldbar für Unterstützung am Gleis.</p>
                </div>
              </li>
            </ul>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-center text-gray-400">
                Diese Daten werden durch den <span className="font-semibold text-gray-500">ZugAlert Station Hub</span> dynamisch zusammengestellt und können von der Realität abweichen.
              </p>
            </div>
          </div>

          <AdSlot format="vertical" />
        </div>
      </div>
      
    </div>
  );
};

export default StationPage;
