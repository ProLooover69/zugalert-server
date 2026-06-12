import React, { useState, useEffect, useRef } from 'react';
import { Search, History, MapPin } from 'lucide-react';
import { searchStations } from '../services/api';


const ALIASES = {
    'har': 'Hamburg-Harburg (DB)',
    'jungf': 'Jungfernstieg',
};

const POPULAR_STATIONS_MAP = {
    vbb: [
        { name: 'Berlin Hbf', id: '900000013201' },
        { name: 'Berlin Friedrichstraße', id: '900000100001' },
        { name: 'Potsdam Hbf', id: '900000230000' },
        { name: 'Berlin Ostbahnhof', id: '900000120005' },
    ],
    rmv: [
        { name: 'Frankfurt (Main) Hbf', id: '3000010' },
        { name: 'Wiesbaden Hbf', id: '3000011' },
        { name: 'Mainz Hbf', id: '3000009' },
        { name: 'Darmstadt Hbf', id: '3000001' },
    ],
    nahsh: [
        { name: 'Kiel Hbf', id: '8000199' },
        { name: 'Lübeck Hbf', id: '8000237' },
        { name: 'Flensburg', id: '8000103' },
        { name: 'Neumünster', id: '8000271' },
        { name: 'Hamburg Hbf', id: '8002549' },
    ],
    vbn: [
        { name: 'Bremen Hbf', id: '8000050' },
        { name: 'Oldenburg (Oldb)', id: '8000291' },
        { name: 'Bremerhaven Hbf', id: '8000051' },
    ],
    kvb: [
        { name: 'Köln Hbf', id: '8000207' },
        { name: 'Bonn Hbf', id: '8000044' },
    ],
    sbahnMuenchen: [
        { name: 'München Hbf (tief)', id: '8000261' },
        { name: 'München Marienplatz', id: '8005315' },
        { name: 'München Ost', id: '8000262' }
    ],
    db: [
        { name: 'Hamburg Hbf', id: '8002549' },
        { name: 'Berlin Hbf', id: '8011160' },
        { name: 'München Hbf', id: '8000261' },
        { name: 'Frankfurt (Main) Hbf', id: '8000105' },
        { name: 'Köln Hbf', id: '8000207' },
        { name: 'Hannover Hbf', id: '8000152' },
        { name: 'Stuttgart Hbf', id: '8000096' },
        { name: 'Düsseldorf Hbf', id: '8000085' },
        { name: 'Leipzig Hbf', id: '8010205' },
    ]
};

export function StationSearch({ label, onSelect, placeholder, initialValue }) {
    const [query, setQuery] = useState(initialValue ? initialValue.name : '');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [recentStations, setRecentStations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const wrapperRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            const saved = localStorage.getItem('recentStations');
            if (saved) {
                try {
                    setRecentStations(JSON.parse(saved));
                } catch (e) {
                    console.error('Failed to parse recent stations', e);
                }
            }
        }
    }, [isOpen]);

    useEffect(() => {
        if (initialValue) {
            setQuery(initialValue.name);
        }
    }, [initialValue]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (val) => {
        let typedVal = val;
        
        // Alias Check (har -> Hamburg-Harburg (DB))
        if (ALIASES[typedVal.toLowerCase()]) {
            typedVal = ALIASES[typedVal.toLowerCase()];
        }

        setQuery(typedVal);

        if (typedVal.length < 2) {
            setResults([]);
            setIsOpen(true);
            return;
        }

        // Debounced API Request
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        setIsLoading(true);
        setIsOpen(true);

        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const data = await searchStations(typedVal);
                if (data.status === 'success' && data.stations) {
                    setResults(data.stations.map(m => ({ id: m.id, name: m.name })));
                } else {
                    setResults([]);
                }
            } catch (err) {
                console.error("Search API returned an error:", err);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 300); // 300ms debounce
    };

    const handleSelect = (station) => {
        setQuery(station.name);
        setIsOpen(false);
        onSelect(station);

        // Update recent stations
        const newRecent = [station, ...recentStations.filter(s => s.id !== station.id)].slice(0, 5);
        setRecentStations(newRecent);
        localStorage.setItem('recentStations', JSON.stringify(newRecent));
    };

    const showSuggestions = isOpen && (isLoading || results.length > 0 || query.length < 2);

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="relative">
                <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 outline-none transition-colors border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    autoComplete="off"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            {showSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-auto">

                    {/* Loading Spinner */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-6 gap-2 text-sm text-gray-500">
                            <div className="w-4 h-4 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin" />
                            Suche läuft...
                        </div>
                    )}

                    {/* Search Results */}
                    {!isLoading && results.length > 0 && (
                        <div className="py-2">
                            <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Suchergebnisse</div>
                            {results.map((station) => (
                                <button
                                    key={station.id}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                                    onClick={() => handleSelect(station)}
                                >
                                    <div className="font-medium text-gray-900">{station.name}</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* No results found */}
                    {!isLoading && results.length === 0 && query.length >= 2 && (
                        <div className="px-4 py-4 text-sm text-gray-500 text-center">
                            Keine Bahnhöfe für „{query}" gefunden.
                        </div>
                    )}

                    {/* Recent Searches – only when no query typed */}
                    {!isLoading && results.length === 0 && query.length < 2 && recentStations.length > 0 && (
                        <div className="py-2 border-b border-gray-100">
                            <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                <History className="w-3 h-3" /> Zuletzt gesucht
                            </div>
                            {recentStations.map((station) => (
                                <button
                                    key={station.id}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                                    onClick={() => handleSelect(station)}
                                >
                                    <div className="font-medium text-gray-900">{station.name}</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Popular Stations – only when no query typed */}
                    {!isLoading && results.length === 0 && query.length < 2 && (
                        <div className="py-2">
                            <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> Beliebte Bahnhöfe
                            </div>
                            {(POPULAR_STATIONS_MAP[localStorage.getItem('hafasProfile') || 'db'] || POPULAR_STATIONS_MAP.db).map((station) => (
                                <button
                                    key={station.id}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                                    onClick={() => handleSelect(station)}
                                >
                                    <div className="font-medium text-gray-900">{station.name}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
