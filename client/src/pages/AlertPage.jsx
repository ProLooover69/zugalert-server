import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Euro, CheckCircle, Clock, ArrowLeft, AlertTriangle, FileText, Train, HelpCircle } from 'lucide-react';
import FAQItem from '../components/FAQItem';
import { getConnections } from '../services/api';

export default function AlertPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // Compensation State
    const [journeyData, setJourneyData] = useState(null);

    // Route/Commute State
    const [lastRoute, setLastRoute] = useState(null);
    const [nextConnection, setNextConnection] = useState(null);
    const [loadingRoute, setLoadingRoute] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        // Load journey data for compensation if passed via state
        if (location.state?.journey) {
            setJourneyData(location.state.journey);
        }

        // Load last route or commuter route
        const savedRoute = localStorage.getItem('lastRoute');
        if (savedRoute) {
            setLastRoute(JSON.parse(savedRoute));
        }

        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, [location]);

    // Fetch next connection for route overview
    useEffect(() => {
        const fetchNextConnection = async () => {
            if (!lastRoute) return;

            setLoadingRoute(true);
            try {
                const data = await getConnections(lastRoute.from.id, lastRoute.to.id, lastRoute.onlyRegional);

                if (data.connections && data.connections.journeys && data.connections.journeys.length > 0) {
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
        const interval = setInterval(fetchNextConnection, 60000);
        return () => clearInterval(interval);
    }, [lastRoute]);

    const formatTime = (date) => date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

    // Compensation Logic
    const delayMinutes = journeyData ? Math.floor(journeyData.delay / 60) : 0;
    const isEligible = journeyData ? (journeyData.cancelled || delayMinutes >= 60) : false;
    let refundPercentage = 0;
    if (journeyData) {
        if (journeyData.cancelled || delayMinutes >= 120) refundPercentage = 50;
        else if (delayMinutes >= 60) refundPercentage = 25;
    }
    const estimatedPrice = 24.90;
    const refundAmount = (estimatedPrice * (refundPercentage / 100)).toFixed(2);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-full">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Alert Center</h3>
            </div>

            {/* 1. Streckenübersicht (Route Overview) */}
            <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 px-1">Streckenübersicht</h4>
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 rounded-2xl shadow-lg shadow-blue-200">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold">Nächste Verbindung</h2>
                            {lastRoute ? (
                                <p className="text-blue-100 text-sm">{lastRoute.from.name} → {lastRoute.to.name}</p>
                            ) : (
                                <p className="text-blue-100 text-sm">Keine Route gespeichert</p>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-blue-100">Jetzt</div>
                            <div className="text-2xl font-bold tracking-tight">{formatTime(currentTime)}</div>
                        </div>
                    </div>

                    {lastRoute && nextConnection ? (
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
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
                            {loadingRoute ? 'Lade Verbindung...' : 'Suche eine Verbindung auf der Startseite.'}
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Entschädigungsrechner (Compensation Calculator) - Only show if data exists */}
            {journeyData && (
                <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 px-1">Entschädigung prüfen</h4>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-4 space-y-4">
                        {isEligible ? (
                            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Anspruch bestätigt
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-green-700">Grund:</span>
                                        <span className="font-medium text-green-900">
                                            {journeyData.cancelled ? 'Zugausfall' : `Verspätung (${delayMinutes} Min)`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-yellow-800">
                                <div className="flex items-center gap-2 font-medium mb-1">
                                    <AlertTriangle className="w-4 h-4" />
                                    Kein Anspruch
                                </div>
                                <p className="text-sm">Erst ab 60 Min. Verspätung am Zielort.</p>
                            </div>
                        )}

                        {isEligible && (
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <h4 className="font-medium text-blue-900 mb-2">💰 Dein Anspruch</h4>
                                <div className="text-3xl font-bold text-blue-900 mb-2">{refundPercentage}% Erstattung</div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-blue-700">Geschätzt:</span>
                                    <span className="font-bold text-green-600">{refundAmount.replace('.', ',')}€</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 3. Formular Download */}
            <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 px-1">Formulare</h4>
                <a
                    href="https://assets.static-bahn.de/dam/jcr:1a95333e-110c-4509-96e6-99c27553a98b/Fahrgastrechte-Formular_2024_barrierefrei.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-2 rounded-lg group-hover:bg-white transition-colors">
                            <FileText className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="text-left">
                            <div className="font-medium text-gray-900">Fahrgastrechte-Formular</div>
                            <div className="text-xs text-gray-500">Offizielles PDF der DB</div>
                        </div>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
                </a>
            </div>

            {/* 4. Deine Rechte & FAQ */}
            <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 px-1">Deine Rechte & FAQ (Stand 2025)</h4>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                    <FAQItem
                        question="Wann bekomme ich Geld zurück?"
                        answer="Ab 60 Min. Verspätung am Zielbahnhof gibt es 25% des Fahrpreises. Ab 120 Min. sind es 50%. Bei Zeitkarten (z.B. Deutschlandticket) gibt es Pauschalen (1,50€ pro Fall, sammeln bis 4€)."
                    />
                    <FAQItem
                        question="Darf ich einen anderen Zug nehmen?"
                        answer="Ja. Wenn eine Verspätung von mehr als 20 Min. am Zielort erwartet wird, ist die Zugbindung aufgehoben. Du darfst auch höherwertige Züge (ICE/IC) nutzen (außer bei stark ermäßigten Tickets wie dem Deutschlandticket)."
                    />
                    <FAQItem
                        question="Taxi oder Hotel?"
                        answer="Wenn die letzte geplante Verbindung ausfällt oder du zwischen 0 und 5 Uhr mit >60 Min. Verspätung ankommen würdest, zahlt die Bahn Taxi (bis 120€) oder Hotel, wenn keine Weiterfahrt möglich ist."
                    />
                    <FAQItem
                        question="Gibt es Ausnahmen?"
                        answer="Ja. Bei 'außergewöhnlichen Umständen' (z.B. extremes Wetter, Naturkatastrophen, Personen im Gleis) muss keine Entschädigung gezahlt werden. Streiks gelten jedoch NICHT als Ausnahme – hier hast du Anspruch!"
                    />
                </div>
            </div>
        </div>
    );
}

