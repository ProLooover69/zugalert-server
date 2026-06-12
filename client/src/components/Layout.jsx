import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, AlertTriangle, Navigation, Euro, Settings, Users } from 'lucide-react';

export default function Layout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const activeTab = location.pathname;

    const navItems = [
        { path: '/', icon: AlertTriangle, label: 'Status' },
        { path: '/connections', icon: Navigation, label: 'Route' },
        { path: '/alert', icon: Euro, label: 'Alert' },
        { path: '/community', icon: Users, label: 'Community' },
        { path: '/settings', icon: Settings, label: 'Settings' }
    ];

    const [showNotifications, setShowNotifications] = React.useState(false);
    const [notifications, setNotifications] = React.useState([
        { id: 1, text: "S-Bahn Störung auf deiner Pendelstrecke behoben", time: "Vor 10 Min", source: "DB Info", read: false },
        { id: 2, text: "Morgen: Streikankündigung GDL", time: "Vor 2 Std", source: "GDL Presse", read: false },
        { id: 3, text: "Dein Entschädigungsantrag wurde genehmigt", time: "Gestern", source: "ZugAlert System", read: true },
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleBellClick = () => {
        if (!showNotifications) {
            // Mark all as read when opening
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        }
        setShowNotifications(!showNotifications);
    };

    return (
        <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-20 relative">
            {/* Offline Indicator Placeholder - can be made functional later */}
            <div className="hidden bg-red-500 text-white text-center py-2 text-sm">
                📵 Offline-Modus - Letzte Daten werden angezeigt
            </div>

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white px-4 py-3 sticky top-0 z-50 shadow-md">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 hover:opacity-90 transition-opacity"
                    >
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <span className="text-blue-600 font-bold text-lg">🚂</span>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">ZugAlert</h1>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <button
                                onClick={handleBellClick}
                                className="p-1 rounded-full hover:bg-white/10 transition-colors relative"
                            >
                                <Bell className="w-6 h-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center border-2 border-purple-700">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notification Popover */}
                            {showNotifications && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowNotifications(false)}
                                    ></div>
                                    <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                            <span className="font-semibold text-gray-900 text-sm">Mitteilungen</span>
                                            <span className="text-xs text-blue-600 font-medium cursor-pointer">Alle gelesen</span>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                notifications.map(n => (
                                                    <div key={n.id} className={`p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/30' : ''}`}>
                                                        <p className="text-sm text-gray-800 leading-snug">{n.text}</p>
                                                        <div className="flex justify-between items-center mt-1">
                                                            <p className="text-xs text-gray-400">{n.time}</p>
                                                            <span className="text-[10px] font-medium px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                                                {n.source}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-gray-500 text-sm">
                                                    Keine neuen Nachrichten
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full backdrop-blur-sm">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                            <span className="text-xs font-medium">Live</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-4 animate-in fade-in duration-300">
                {children}
            </div>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
                <div className="max-w-md mx-auto flex">
                    {navItems.map((item) => {
                        const isActive = activeTab === item.path || (item.path !== '/' && activeTab.startsWith(item.path));
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`flex-1 py-3 px-4 flex flex-col items-center gap-1 transition-all duration-200 ${isActive
                                    ? 'text-blue-600 border-t-2 border-blue-600 bg-blue-50/50'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                                <span className="text-[10px] font-medium uppercase tracking-wide">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
