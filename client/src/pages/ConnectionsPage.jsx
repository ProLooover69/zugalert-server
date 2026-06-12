import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getConnections } from '../services/api';
import { ArrowLeft, Clock, AlertTriangle, ChevronRight, Train, Euro } from 'lucide-react';
import AdSlot from '../components/AdSlot';

export default function ConnectionsPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const fromId = searchParams.get('from');
    const toId = searchParams.get('to');
    const fromName = searchParams.get('fromName');
    const toName = searchParams.get('toName');

    const onlyRegional = searchParams.get('onlyRegional') === 'true';
    const [expandedJourney, setExpandedJourney] = useState(null);

    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchConnections = async () => {
            try {
                const data = await getConnections(fromId, toId, onlyRegional);
                if (data.status === 'success' && data.connections && data.connections.journeys) {
                    setConnections(data.connections.journeys);
                } else {
                    setError('Keine Verbindungen gefunden');
                }
            } catch (err) {
                setError('Fehler beim Laden der Verbindungen: ' + (err.message || JSON.stringify(err))); console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (fromId && toId) {
            fetchConnections();
        }
    }, [fromId, toId, onlyRegional]);

    const formatTime = (isoString) => {
        return new Date(isoString).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    };

    const getDuration = (start, end) => {
        const diff = new Date(end) - new Date(start);
        const minutes = Math.floor(diff / 60000);
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    };

    const getMinutes = (start, end) => {
        const diff = new Date(end) - new Date(start);
        return Math.floor(diff / 60000);
    };

    const formatDelay = (seconds) => {
        if (!seconds) return null;
        return Math.floor(seconds / 60);
    };

    const toggleDetails = (index) => {
        setExpandedJourney(expandedJourney === index ? null : index);
    };

    return (
        <div className="space-y-4">
            {/* Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-3 mb-2">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h2 className="font-semibold text-gray-900">Verbindungen</h2>
                        <p className="text-sm text-gray-500">
                            <Link to={`/station/${fromId}?name=${encodeURIComponent(fromName)}`} className="text-blue-600 hover:underline font-medium">{fromName}</Link>
                            {' → '}
                            <Link to={`/station/${toId}?name=${encodeURIComponent(toName)}`} className="text-blue-600 hover:underline font-medium">{toName}</Link>
                        </p>
                        {onlyRegional && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mt-1 inline-block">Nur Nahverkehr</span>}
                    </div>
                </div>
            </div>

            {/* Advertising Slot */}
            {!loading && !error && connections.length > 0 && (
                <div className="my-2">
                    <AdSlot format="horizontal" />
                </div>
            )}

            {/* Content */}
            <div className="space-y-3">
                {loading && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p>Suche Verbindungen...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 border border-red-100">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && connections.map((journey, index) => {
                    const firstLeg = journey.legs[0];
                    const lastLeg = journey.legs[journey.legs.length - 1];
                    const isDelayed = journey.legs.some(l => (l.departureDelay && l.departureDelay >= 60) || (l.arrivalDelay && l.arrivalDelay >= 60));

                    // Robust check: Compare IDs (string) OR Names (normalized)
                    const isSameId = String(lastLeg.destination.id) === String(toId);
                    const isSameName = lastLeg.destination.name?.toLowerCase().trim() === toName?.toLowerCase().trim();
                    const isDifferentDestination = !isSameId && !isSameName;
                    const isExpanded = expandedJourney === index;

                    return (
                        <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all">
                            <div
                                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => toggleDetails(index)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-50 p-2 rounded-xl">
                                            <Train className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">{firstLeg.line?.name || 'Zug'}</div>
                                            {isDelayed && (
                                                <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1 mt-0.5">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    Verspätung
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {journey.price?.amount ? (
                                            <div className="font-semibold text-gray-900">ab {journey.price.amount.toFixed(2)}€</div>
                                        ) : null}
                                        <div className="text-sm text-gray-500 flex items-center justify-end gap-1">
                                            <Clock className="w-3 h-3" />
                                            {getDuration(firstLeg.departure, lastLeg.arrival)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center relative">
                                    {/* Timeline Line */}
                                    <div className="absolute left-[60px] right-[60px] top-1/2 h-0.5 bg-gray-100 -z-0"></div>

                                    <div className="relative z-10 bg-white pr-2">
                                        <div className="text-2xl font-bold text-gray-900">{formatTime(firstLeg.departure)}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-[80px]">{firstLeg.origin.name}</div>
                                    </div>

                                    <div className="relative z-10 bg-white px-2">
                                        <div className="w-16 flex justify-center flex-col items-center gap-1">
                                            <div className="h-1 w-8 bg-gray-200 rounded-full"></div>
                                            {journey.legs.length > 1 && (
                                                <span className="text-[10px] text-gray-400 font-medium">{journey.legs.length - 1} Umstieg(e)</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="relative z-10 bg-white pl-2 text-right">
                                        <div className={`text-2xl font-bold ${isDifferentDestination ? 'text-red-600' : 'text-gray-900'}`}>{formatTime(lastLeg.arrival)}</div>
                                        <div className={`text-xs truncate max-w-[80px] ml-auto ${isDifferentDestination ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                                            {lastLeg.destination.name}
                                        </div>
                                    </div>
                                </div>

                                {isDifferentDestination && (
                                    <div className="mt-3 bg-red-50 text-red-700 text-xs p-2 rounded-lg flex items-start gap-2">
                                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <strong>Achtung:</strong> Zielbahnhof weicht ab ({lastLeg.destination.name}).
                                            <br />
                                            Bitte prüfen Sie die Verbindung im Detail.
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 flex justify-center">
                                    <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : 'rotate-0'}`} />
                                </div>
                            </div>

                            {/* Detailed Itinerary */}
                            {isExpanded && (
                                <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                                    {journey.legs.map((leg, legIndex) => {
                                        const isWalking = leg.walking || leg.mode === 'walking';
                                        const isLastLeg = legIndex === journey.legs.length - 1;

                                        if (isWalking) {
                                            const prevLeg = journey.legs[legIndex - 1];
                                            const nextLeg = journey.legs[legIndex + 1];
                                            let transferInfo = null;

                                            if (prevLeg && nextLeg) {
                                                const totalTransferMinutes = getMinutes(prevLeg.arrival, nextLeg.departure);
                                                const walkingMinutes = getMinutes(leg.departure, leg.arrival);
                                                const netMinutes = totalTransferMinutes - walkingMinutes;

                                                transferInfo = (
                                                    <div className="mt-1 text-xs font-medium space-y-0.5 bg-white p-2 rounded border border-gray-200 inline-block">
                                                        <div className="text-gray-900">Umsteigezeit: {totalTransferMinutes} Min.</div>
                                                        <div className="text-red-600">- Fußweg: {walkingMinutes} Min.</div>
                                                        <div className="border-t border-gray-200 pt-0.5 mt-0.5 text-green-600 font-bold">= Puffer: {netMinutes} Min.</div>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div key={legIndex} className="pl-8 py-4 relative">
                                                    {/* Dotted Line for Walking */}
                                                    <div className="absolute left-[29px] top-0 bottom-0 border-l-2 border-dotted border-gray-300"></div>

                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                                            <div className="bg-gray-200 p-1.5 rounded-full z-10 relative">
                                                                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">Fußweg / Umstieg</span>
                                                                <span className="text-xs text-gray-500">{getDuration(leg.departure, leg.arrival)}</span>
                                                            </div>
                                                        </div>
                                                        {transferInfo && <div className="ml-9">{transferInfo}</div>}
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div key={legIndex} className="relative pl-8 pb-8 last:pb-0">
                                                {/* Continuous Line */}
                                                {!isLastLeg && (
                                                    <div className="absolute left-[29px] top-4 bottom-0 w-0.5 bg-gray-300"></div>
                                                )}

                                                {/* Leg Header (Line Info) */}
                                                <div className="mb-4 flex items-center gap-2">
                                                    <span className="font-bold text-gray-900 bg-gray-200 px-2 py-0.5 rounded text-sm">
                                                        {leg.line?.name || 'Zug'}
                                                    </span>
                                                    <span className="text-sm text-gray-600">
                                                        Richtung {leg.destination.name}
                                                    </span>
                                                </div>

                                                {/* Origin */}
                                                <div className="relative mb-6">
                                                    <div className="absolute -left-[39px] top-1 w-4 h-4 rounded-full border-2 border-gray-800 bg-white"></div>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="font-bold text-gray-900 text-lg">{formatTime(leg.departure)}</div>
                                                            <div className="font-medium text-gray-900">{leg.origin.name}</div>
                                                            {leg.departurePlatform && <div className="text-sm text-gray-500">Gl. {leg.departurePlatform}</div>}
                                                        </div>
                                                        {leg.departureDelay !== undefined && leg.departureDelay !== null ? (
                                                            formatDelay(leg.departureDelay) > 0 ? (
                                                                <div className="text-sm text-red-600 font-medium">+{formatDelay(leg.departureDelay)}</div>
                                                            ) : (
                                                                <div className="text-sm text-green-600 font-medium">Pünktlich</div>
                                                            )
                                                        ) : null}
                                                    </div>
                                                </div>

                                                {/* Intermediate Stops (Collapsible or List) */}
                                                {leg.stopovers && leg.stopovers.length > 0 && (
                                                    <div className="ml-2 pl-4 border-l-2 border-gray-200 space-y-3 mb-6 py-2">
                                                        {leg.stopovers.map((stop, stopIndex) => (
                                                            <div key={stopIndex} className="flex justify-between text-sm text-gray-500">
                                                                <span>{stop.stop.name}</span>
                                                                <div className="flex gap-2">
                                                                    <span>{formatTime(stop.departure || stop.arrival)}</span>
                                                                    {(stop.departureDelay !== undefined && stop.departureDelay !== null) || (stop.arrivalDelay !== undefined && stop.arrivalDelay !== null) ? (
                                                                        Math.max(formatDelay(stop.departureDelay) || 0, formatDelay(stop.arrivalDelay) || 0) > 0 ? (
                                                                            <span className="text-red-600 font-medium">+{Math.max(formatDelay(stop.departureDelay) || 0, formatDelay(stop.arrivalDelay) || 0)}</span>
                                                                        ) : (
                                                                            <span className="text-green-600 font-medium">Pünktlich</span>
                                                                        )
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Destination */}
                                                <div className="relative">
                                                    <div className="absolute -left-[39px] top-1 w-4 h-4 rounded-full border-2 border-gray-800 bg-gray-800"></div>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="font-bold text-gray-900 text-lg">{formatTime(leg.arrival)}</div>
                                                            <div className="font-medium text-gray-900">{leg.destination.name}</div>
                                                            {leg.arrivalPlatform && <div className="text-sm text-gray-500">Gl. {leg.arrivalPlatform}</div>}
                                                        </div>
                                                        {leg.arrivalDelay !== undefined && leg.arrivalDelay !== null ? (
                                                            formatDelay(leg.arrivalDelay) > 0 ? (
                                                                <div className="text-sm text-red-600 font-medium">+{formatDelay(leg.arrivalDelay)}</div>
                                                            ) : (
                                                                <div className="text-sm text-green-600 font-medium">Pünktlich</div>
                                                            )
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Compensation Button for Delayed Journeys */}
                                    {(isDelayed || journey.cancelled) && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate('/compensation', {
                                                        state: {
                                                            journey: {
                                                                from: firstLeg.origin.name,
                                                                to: lastLeg.destination.name,
                                                                scheduledArrival: lastLeg.arrival,
                                                                realArrival: lastLeg.arrival, // In a real scenario, this would be the actual arrival time
                                                                delay: Math.max(
                                                                    ...journey.legs.map(l => l.arrivalDelay || 0),
                                                                    ...journey.legs.map(l => l.departureDelay || 0)
                                                                ),
                                                                cancelled: journey.cancelled
                                                            }
                                                        }
                                                    });
                                                }}
                                                className="w-full bg-green-50 text-green-700 py-3 rounded-xl font-medium hover:bg-green-100 transition-colors flex items-center justify-center gap-2 border border-green-200"
                                            >
                                                <Euro className="w-5 h-5" />
                                                Entschädigung prüfen
                                            </button>
                                            <p className="text-xs text-center text-gray-500 mt-2">
                                                Bei Verspätung ab 60 Min. oder Zugausfall
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div >
    );
}
