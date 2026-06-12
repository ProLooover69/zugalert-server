export const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getProfile() {
    return localStorage.getItem('hafasProfile') || 'db';
}

export async function searchStations(query) {
    const profile = getProfile();
    const res = await fetch(`${API_BASE}/trains/search?query=${encodeURIComponent(query)}&profile=${profile}`);
    if (!res.ok) throw new Error('Failed to search stations');
    return res.json();
}

export async function getConnections(from, to, onlyRegional = false) {
    const profile = getProfile();
    const res = await fetch(`${API_BASE}/trains/connections?from=${from}&to=${to}&profile=${profile}&onlyRegional=${onlyRegional}`);
    if (!res.ok) throw new Error('Failed to fetch connections');
    return res.json();
}

export async function getDisruptions(stationId) {
    const profile = getProfile();
    const res = await fetch(`${API_BASE}/disruptions/${stationId}?profile=${profile}`);
    if (!res.ok) throw new Error('Failed to fetch disruptions');
    return res.json();
}

export async function getDepartures(stationId) {
    const profile = getProfile();
    const res = await fetch(`${API_BASE}/trains/departures?station=${stationId}&profile=${profile}`);
    if (!res.ok) throw new Error('Failed to fetch departures');
    return res.json();
}
