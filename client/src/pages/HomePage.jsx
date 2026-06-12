import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { StationSearch } from '../components/StationSearch';
import { ArrowRight, Train, AlertTriangle, Clock, Navigation, Euro, Star, MapPin } from 'lucide-react';
import AdSlot from '../components/AdSlot';

export default function HomePage() {
    const navigate = useNavigate();
    const [fromStation, setFromStation] = useState(null);
    const [toStation, setToStation] = useState(null);
    const [onlyRegional, setOnlyRegional] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [lastUpdate, setLastUpdate] = useState(new Date());

    const [lastRoute, setLastRoute] = useState(null);
    const [nextConnection, setNextConnection] = useState(null);
    const [loadingRoute, setLoadingRoute] = useState(false);

    const [homeStation, setHomeStation] = useState(null);
    const [workStation, setWorkStation] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        const updateTimer = setInterval(() => setLastUpdate(new Date()), 30000);

        // Load last route
        const savedRoute = localStorage.getItem('lastRoute');
        if (savedRoute) {
            setLastRoute(JSON.parse(savedRoute));
        }

        // Load commuter settings
        const savedHome = localStorage.getItem('homeStation');
        if (savedHome) {
            const home = JSON.parse(savedHome);
            setHomeStation(home);
            // Pre-fill from station if not already set
            if (!fromStation) setFromStation(home);
        }

        const savedWork = localStorage.getItem('workStation');
        if (savedWork) setWorkStation(JSON.parse(savedWork));

        return () => {
            clearInterval(timer);
            clearInterval(updateTimer);
        };
    }, []);

    useEffect(() => {
        const fetchNextConnection = async () => {
            if (!lastRoute) return;

            setLoadingRoute(true);
            try {
                // Import getConnections dynamically or assume it's available in scope if imported at top
                // We need to ensure getConnections is imported. 
                // Since I cannot see imports here, I will assume I need to add the import in a separate step or rely on existing imports if any.
                // Checking file content again... I need to import getConnections.
                const { getConnections } = await import('../services/api');
                const data = await getConnections(lastRoute.from.id, lastRoute.to.id, lastRoute.onlyRegional);

                if (data.connections && data.connections.journeys && data.connections.journeys.length > 0) {
                    // Find the first future connection
                    const now = new Date();
                    const next = data.connections.journeys.find(j => new Date(j.legs[0].departure) > now) || data.connections.journeys[0];
                    setNextConnection(next);
                }
            } catch (err) {
                console.error("Failed to fetch next connection", err);
            } finally {
                setLoadingRoute(false);
            }
        };

        fetchNextConnection();
        // Refresh every minute
        const interval = setInterval(fetchNextConnection, 60000);
        return () => clearInterval(interval);
    }, [lastRoute]);

    const handleSearch = () => {
    if (fromStation && toStation) {
      // Check if stations are objects with id property
      const fromId = typeof fromStation === 'object' && fromStation.id ? fromStation.id : null;
      const toId = typeof toStation === 'object' && toStation.id ? toStation.id : null;
      const fromName = typeof fromStation === 'object' && fromStation.name ? fromStation.name : fromStation;
      const toName = typeof toStation === 'object' && toStation.name ? toStation.name : toStation;

      if (!fromId || !toId) {
        alert('Bitte wähle Start- und Zielbahnhof aus den Vorschlägen aus.');
        return;
      }

      // Save to local storage
      const routeData = { from: fromStation, to: toStation, onlyRegional };
      localStorage.setItem('lastRoute', JSON.stringify(routeData));
      setLastRoute(routeData);

      navigate(`/connections?from=${fromId}&to=${toId}&fromName=${encodeURIComponent(fromName)}&toName=${encodeURIComponent(toName)}&onlyRegional=${onlyRegional}`);
    }
  };
    const handleCommuteClick = () => {
        if (!homeStation || !workStation) {
            navigate('/settings');
            return;
        }

        const currentHour = new Date().getHours();
        // Simple logic: Morning (4-12) -> Work, Afternoon/Evening -> Home
        const isMorning = currentHour >= 4 && currentHour < 12;

        const from = isMorning ? homeStation : workStation;
        const to = isMorning ? workStation : homeStation;

        setFromStation(from);
        setToStation(to);

        // Auto-navigate
        const routeData = { from, to, onlyRegional };
        localStorage.setItem('lastRoute', JSON.stringify(routeData));
        setLastRoute(routeData);
        navigate(`/connections?from=${from.id}&to=${to.id}&fromName=${encodeURIComponent(from.name)}&toName=${encodeURIComponent(to.name)}&onlyRegional=${onlyRegional}`);
    };

    const formatTime = (date) => date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    const formatTimeWithSeconds = (date) => date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return (
        <div className="space-y-4">
            {/* Last Update */}
            <div className="bg-gray-50 px-3 py-2 rounded-lg flex items-center justify-between text-sm border border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-600">Letzte Aktualisierung:</span>
                </div>
                <span className="font-medium text-gray-900">{formatTimeWithSeconds(lastUpdate)}</span>
            </div>

            {/* Advertising Slot */}
            <div className="mt-4 mb-2">
                <AdSlot format="horizontal" />
            </div>

            {/* Commute Quick Action (if configured) */}
            {homeStation && workStation && (
                <button
                    onClick={handleCommuteClick}
                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-between group"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <Train className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <div className="font-bold text-lg">Jetzt Pendeln</div>
                            <div className="text-blue-100 text-sm">
                                {new Date().getHours() < 12 ? `${homeStation.name} → ${workStation.name}` : `${workStation.name} → ${homeStation.name}`}
                            </div>
                        </div>
                    </div>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
            )}

            {/* Search Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                <h2 className="font-semibold text-gray-900">Verbindung suchen</h2>
                <div className="space-y-4">
                    <StationSearch
                        label="Von"
                        placeholder="Startbahnhof"
                        initialValue={fromStation}
                        onSelect={setFromStation}
                    />

                    <div className="flex justify-center -my-3 relative z-10">
                        <div className="bg-gray-50 p-2 rounded-full border border-gray-200">
                            <ArrowRight className="w-4 h-4 text-gray-400 transform rotate-90" />
                        </div>
                    </div>

                    <StationSearch
                        label="Nach"
                        placeholder="Zielbahnhof"
                        initialValue={toStation}
                        onSelect={setToStation}
                    />

                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200 cursor-pointer" onClick={() => setOnlyRegional(!onlyRegional)}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${onlyRegional ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                            {onlyRegional && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span className="text-sm text-gray-700 font-medium select-none">Nur Nahverkehr / Regional</span>
                    </div>

                    <button
                        onClick={handleSearch}
                        disabled={!fromStation || !toStation}
                        className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shadow-blue-200"
                    >
                        Verbindungen suchen
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Next Departure Card (Dynamic) */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 rounded-2xl shadow-lg shadow-blue-200">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold">Nächste Abfahrt</h2>
                        {lastRoute ? (
                            <p className="text-blue-100 text-sm">{lastRoute.from.name} → {lastRoute.to.name}</p>
                        ) : (
                            <p className="text-blue-100 text-sm">Keine letzte Suche</p>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-blue-100">Jetzt</div>
                        <div className="text-2xl font-bold tracking-tight">{formatTime(currentTime)}</div>
                    </div>
                </div>

                {lastRoute && nextConnection ? (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-blue-100">Von {nextConnection.legs[0].origin.name}</span>
                            {/* Walking time calculation could be added here if geolocation was available */}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-100">Abfahrt:</span>
                            <span className="text-lg font-bold">{formatTime(new Date(nextConnection.legs[0].departure))}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                            <span className="text-sm text-blue-100">Status:</span>
                            {nextConnection.cancelled ? (
                                <span className="text-lg font-bold text-red-200 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    AUSFALL
                                </span>
                            ) : (
                                <span className={`text-lg font-bold flex items-center gap-2 ${nextConnection.legs[0].departureDelay >= 60 ? 'text-red-200' : 'text-green-200'}`}>
                                    {nextConnection.legs[0].departureDelay >= 60 ? `+${Math.floor(nextConnection.legs[0].departureDelay / 60)} Min` : 'Pünktlich'}
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center text-blue-100">
                        {loadingRoute ? 'Lade Verbindung...' : 'Suche eine Verbindung, um hier Updates zu sehen.'}
                    </div>
                )}
            </div>



            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-3 mt-4">
                <button
                    onClick={() => navigate('/connections')}
                    className="bg-green-600 text-white p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-green-700 transition-colors shadow-sm shadow-green-200"
                >
                    <Navigation className="w-6 h-6" />
                    <span className="text-xs font-bold">Route</span>
                </button>
                <button
                    onClick={() => navigate('/alert')}
                    className="bg-orange-600 text-white p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-orange-700 transition-colors shadow-sm shadow-orange-200"
                >
                    <Euro className="w-6 h-6" />
                    <span className="text-xs font-bold">Alert</span>
                </button>
                <button
                    onClick={() => alert('Teilen Dialog öffnen')}
                    className="bg-purple-600 text-white p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-purple-700 transition-colors shadow-sm shadow-purple-200"
                >
                    <Star className="w-6 h-6" />
                    <span className="text-xs font-bold">Teilen</span>
                </button>
            </div>
        </div>
    );
}
