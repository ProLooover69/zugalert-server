
import React, { useState, useEffect } from 'react';
import { MapPin, Settings as SettingsIcon, Globe } from 'lucide-react';

const providers = [
    { id: 'db', name: 'Deutsche Bahn (via NAH.SH)' },
    { id: 'vbb', name: 'VBB (Berlin/Brandenburg)' },
    { id: 'hvv', name: 'HVV (Hamburg - via NAH.SH)' },
    { id: 'rmv', name: 'RMV (Rhein-Main)' },
    { id: 'vbn', name: 'VBN (Bremen/Niedersachsen)' },
    { id: 'vrn', name: 'VRN (Rhein-Neckar - via RMV)' },
    { id: 'avv', name: 'AVV (Augsburg)' },
    { id: 'kvb', name: 'KVB (Köln)' },
    { id: 'nvv', name: 'NVV (Nordhessen)' },
    { id: 'vmt', name: 'VMT (Mittelthüringen)' },
    { id: 'nahsh', name: 'NAH.SH (Schleswig-Holstein)' },
    { id: 'insa', name: 'INSA (Sachsen-Anhalt)' },
    { id: 'saarfahrplan', name: 'Saarfahrplan (Saarland)' },
    { id: 'sbahnMuenchen', name: 'S-Bahn München' },
];

import { StationSearch } from '../components/StationSearch';

export default function SettingsPage() {
    const [selectedProvider, setSelectedProvider] = useState('db');
    const [homeStation, setHomeStation] = useState(null);
    const [workStation, setWorkStation] = useState(null);
    const [commuteTimeStart, setCommuteTimeStart] = useState('08:00');
    const [commuteTimeEnd, setCommuteTimeEnd] = useState('17:00');

    useEffect(() => {
        const savedProfile = localStorage.getItem('hafasProfile');
        if (savedProfile) setSelectedProvider(savedProfile);

        const savedHome = localStorage.getItem('homeStation');
        if (savedHome) setHomeStation(JSON.parse(savedHome));

        const savedWork = localStorage.getItem('workStation');
        if (savedWork) setWorkStation(JSON.parse(savedWork));

        const savedStart = localStorage.getItem('commuteTimeStart');
        if (savedStart) setCommuteTimeStart(savedStart);

        const savedEnd = localStorage.getItem('commuteTimeEnd');
        if (savedEnd) setCommuteTimeEnd(savedEnd);
    }, []);

    const handleProviderChange = (e) => {
        const newVal = e.target.value;
        setSelectedProvider(newVal);
        localStorage.setItem('hafasProfile', newVal);
    };

    const handleHomeSelect = (station) => {
        setHomeStation(station);
        localStorage.setItem('homeStation', JSON.stringify(station));
    };

    const handleWorkSelect = (station) => {
        setWorkStation(station);
        localStorage.setItem('workStation', JSON.stringify(station));
    };

    const handleTimeChange = (type, value) => {
        if (type === 'start') {
            setCommuteTimeStart(value);
            localStorage.setItem('commuteTimeStart', value);
        } else {
            setCommuteTimeEnd(value);
            localStorage.setItem('commuteTimeEnd', value);
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <SettingsIcon className="w-5 h-5 text-gray-600" />
                        Einstellungen
                    </h3>
                </div>
                <div className="p-4 space-y-6">

                    {/* Provider Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Verkehrsverbund</label>
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <Globe className="w-5 h-5 text-blue-600" />
                                <select
                                    value={selectedProvider}
                                    onChange={handleProviderChange}
                                    className="w-full bg-transparent border-none focus:ring-0 text-gray-900 font-medium text-sm p-0"
                                >
                                    {providers.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Wähle deinen lokalen Anbieter für beste Ergebnisse.
                            </p>
                        </div>
                    </div>

                    {/* Commuter Stations */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Deine Stationen</label>
                        <div className="space-y-3">
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <MapPin className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium text-gray-900">Zuhause (Start)</span>
                                </div>
                                <div className="relative">
                                    {homeStation ? (
                                        <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-200">
                                            <span className="text-sm">{homeStation.name}</span>
                                            <button onClick={() => handleHomeSelect(null)} className="text-xs text-red-500 font-medium">Ändern</button>
                                        </div>
                                    ) : (
                                        <StationSearch
                                            placeholder="Heimatbahnhof suchen..."
                                            onSelect={handleHomeSelect}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <MapPin className="w-4 h-4 text-orange-600" />
                                    <span className="text-sm font-medium text-gray-900">Arbeit (Ziel)</span>
                                </div>
                                <div className="relative">
                                    {workStation ? (
                                        <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-200">
                                            <span className="text-sm">{workStation.name}</span>
                                            <button onClick={() => handleWorkSelect(null)} className="text-xs text-red-500 font-medium">Ändern</button>
                                        </div>
                                    ) : (
                                        <StationSearch
                                            placeholder="Arbeitsplatz suchen..."
                                            onSelect={handleWorkSelect}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Commuter Times */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pendelzeiten</label>
                        <div className="space-y-2">
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex justify-between items-center">
                                <span className="text-sm text-gray-600">Hinfahrt (Morgens)</span>
                                <input
                                    type="time"
                                    value={commuteTimeStart}
                                    onChange={(e) => handleTimeChange('start', e.target.value)}
                                    className="text-sm font-semibold text-gray-900 bg-white px-2 py-1 rounded border border-gray-100 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex justify-between items-center">
                                <span className="text-sm text-gray-600">Rückfahrt (Abends)</span>
                                <input
                                    type="time"
                                    value={commuteTimeEnd}
                                    onChange={(e) => handleTimeChange('end', e.target.value)}
                                    className="text-sm font-semibold text-gray-900 bg-white px-2 py-1 rounded border border-gray-100 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Benachrichtigungen</label>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg -mx-2 transition-colors cursor-pointer">
                                <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300" />
                                <span className="text-sm text-gray-700">30 Min vor Abfahrt prüfen</span>
                            </label>
                            <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg -mx-2 transition-colors cursor-pointer">
                                <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300" />
                                <span className="text-sm text-gray-700">Sofort bei Störungen</span>
                            </label>
                            <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg -mx-2 transition-colors cursor-pointer">
                                <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300" />
                                <span className="text-sm text-gray-700">Geplante Bauarbeiten</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-5 rounded-2xl shadow-lg shadow-purple-200">
                <h4 className="font-bold text-lg mb-2">🚀 Hilf der Community</h4>
                <p className="text-sm text-purple-100 mb-4 leading-relaxed">
                    Teile ZugAlert mit anderen Pendlern und hilf uns, den Service zu verbessern!
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <button className="bg-white/20 backdrop-blur-sm text-white px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-white/30 transition-colors border border-white/10">
                        📱 App teilen
                    </button>
                    <button className="bg-white/20 backdrop-blur-sm text-white px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-white/30 transition-colors border border-white/10">
                        ⭐ Bewertung
                    </button>
                </div>
            </div>
        </div>
    );
}
