const PREDEFINED_CHANNELS = ['Nord', 'Süd', 'West', 'Ost'];
const DEFAULT_COLORS = ['#9333ea', '#2563eb', '#16a34a', '#dc2626', '#1f2937'];
const DEFAULT_FONTS = ['Inter, sans-serif', 'Roboto, sans-serif', 'Courier New, monospace', 'Georgia, serif'];

import React, { useState, useEffect, useRef } from 'react';
import { Users, HelpCircle, MessageSquare, Send, SlidersHorizontal } from 'lucide-react';
import FAQItem from '../components/FAQItem';
import { API_BASE } from '../services/api';

export default function CommunityPage() {
    // User Settings
    const [nickname, setNickname] = useState(localStorage.getItem('chat_nickname') || '');
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('chat_settings');
        return saved ? JSON.parse(saved) : {
            color: '#9333ea',
            bgColor: '#f9fafb',
            fontFamily: 'Inter, sans-serif',
            fontSize: 'text-sm',
            msgTtl: 0 // 0 = infinite (default)
        };
    });

    // Chat State
    const [channel, setChannel] = useState('Nord'); // Default channel
    const [customChannel, setCustomChannel] = useState('');
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Temp states for forms
    const [tempNickname, setTempNickname] = useState('');
    const chatContainerRef = useRef(null);

    // Save settings
    useEffect(() => {
        localStorage.setItem('chat_settings', JSON.stringify(settings));
    }, [settings]);

    // Fetch Messages
    const fetchMessages = async () => {
        try {
            const currentChannel = customChannel.trim() ? customChannel : channel;
            const res = await fetch(`${API_BASE}/chat?channel=${encodeURIComponent(currentChannel)}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (err) {
            console.error("Failed to fetch messages", err);
        }
    };

    // Polling
    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [channel, customChannel]); // Refetch when channel changes

    // Auto-scroll
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleNicknameSubmit = (e) => {
        e.preventDefault();
        if (tempNickname.trim()) {
            setNickname(tempNickname);
            localStorage.setItem('chat_nickname', tempNickname);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const currentChannel = customChannel.trim() ? customChannel : channel;

        try {
            await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nickname,
                    text: newMessage,
                    channel: currentChannel,
                    ttlMinutes: settings.msgTtl
                }),
            });
            setNewMessage('');
            fetchMessages();
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                        <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Community & Hilfe</h3>
                        <p className="text-xs text-gray-500">Austausch & Support</p>
                    </div>
                </div>

                {/* Channel Selector */}
                <div className="flex flex-wrap gap-2">
                    {PREDEFINED_CHANNELS.map(ch => (
                        <button
                            key={ch}
                            onClick={() => { setChannel(ch); setCustomChannel(''); }}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${channel === ch && !customChannel ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {ch}
                        </button>
                    ))}
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            placeholder="#Eigener"
                            value={customChannel}
                            onChange={(e) => setCustomChannel(e.target.value)}
                            className={`pl-3 pr-2 py-1 rounded-full text-sm border focus:ring-2 outline-none w-24 transition-all ${customChannel ? 'border-purple-600 ring-purple-100 bg-purple-50' : 'border-gray-200'
                                }`}
                        />
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-gray-900">
                            {customChannel ? `#${customChannel}` : channel} Chat
                        </h3>
                    </div>
                    <div className="flex items-center gap-3">
                        {nickname && (
                            <div className="text-xs text-gray-500 hidden sm:block">
                                Als <span className="font-medium text-gray-900">{nickname}</span>
                            </div>
                        )}
                        <button onClick={toggleSettings} className="p-1 hover:bg-gray-200 rounded-full transition-colors" title="Einstellungen">
                            <SlidersHorizontal className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Settings Panel */}
                {isSettingsOpen && (
                    <div className="bg-gray-50 border-b border-gray-100 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm animate-in slide-in-from-top-2">
                        <div>
                            <label className="block text-gray-600 mb-1">Deine Farbe</label>
                            <div className="flex gap-2">
                                {DEFAULT_COLORS.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setSettings({ ...settings, color: c })}
                                        className={`w-6 h-6 rounded-full border-2 ${settings.color === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-1">Schriftart</label>
                            <select
                                value={settings.fontFamily}
                                onChange={(e) => setSettings({ ...settings, fontFamily: e.target.value })}
                                className="w-full p-1 rounded border border-gray-200"
                            >
                                {DEFAULT_FONTS.map(f => <option key={f} value={f}>{f.split(',')[0]}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-1">Schriftgröße</label>
                            <div className="flex gap-2 bg-white rounded border p-1 border-gray-200">
                                {['text-xs', 'text-sm', 'text-base'].map((size, i) => (
                                    <button
                                        key={size}
                                        onClick={() => setSettings({ ...settings, fontSize: size })}
                                        className={`flex-1 rounded ${settings.fontSize === size ? 'bg-gray-200 font-bold' : ''}`}
                                    >
                                        A{i + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-1">Nachrichten löschen nach</label>
                            <select
                                value={settings.msgTtl}
                                onChange={(e) => setSettings({ ...settings, msgTtl: parseInt(e.target.value) })}
                                className="w-full p-1 rounded border border-gray-200"
                            >
                                <option value={0}>Nie (Standard)</option>
                                <option value={5}>5 Minuten</option>
                                <option value={30}>30 Minuten</option>
                                <option value={60}>1 Stunde</option>
                                <option value={1440}>24 Stunden</option>
                            </select>
                        </div>
                    </div>
                )}

                {!nickname ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <div className="bg-purple-100 p-4 rounded-full mb-4">
                            <Users className="w-8 h-8 text-purple-600" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">Wähle einen Spitznamen</h4>
                        <p className="text-gray-500 text-sm mb-6">Für den {channel}-Chat brauchst du nur einen Namen.</p>
                        <form onSubmit={handleNicknameSubmit} className="w-full max-w-xs space-y-3">
                            <input
                                type="text"
                                value={tempNickname}
                                onChange={(e) => setTempNickname(e.target.value)}
                                placeholder="Dein Spitzname"
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-100 outline-none text-center"
                                maxLength={15}
                            />
                            <button
                                type="submit"
                                disabled={!tempNickname.trim()}
                                className="w-full bg-purple-600 text-white py-2 rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
                            >
                                Chat beitreten
                            </button>
                        </form>
                    </div>
                ) : (
                    <>
                        {/* Messages List */}
                        <div
                            className="flex-1 overflow-y-auto p-4 space-y-4"
                            style={{ backgroundColor: settings.bgColor, fontFamily: settings.fontFamily }}
                            ref={chatContainerRef}
                        >
                            {messages.length === 0 ? (
                                <div className="text-center text-gray-400 text-sm py-10">
                                    Noch keine Nachrichten im <strong>{customChannel || channel}</strong> Kanal.<br />
                                    Sei der Erste!
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isMe = msg.nickname === nickname;
                                    return (
                                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className={`flex items-end gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                                <div
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm`}
                                                    style={{
                                                        backgroundColor: isMe ? settings.color : '#e5e7eb',
                                                        color: isMe ? '#fff' : '#374151'
                                                    }}
                                                >
                                                    {msg.nickname.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div
                                                    className={`p-3 rounded-2xl shadow-sm ${settings.fontSize} ${isMe
                                                        ? 'text-white rounded-tr-none'
                                                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                                                        }`}
                                                    style={{ backgroundColor: isMe ? settings.color : '#ffffff' }}
                                                >
                                                    {msg.text}
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-gray-400 mt-1 px-2 flex gap-2">
                                                {!isMe && <span className="font-medium text-gray-500">{msg.nickname}</span>}
                                                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                {msg.expiresAt && <span className="text-red-300 ml-1" title="Nachricht löscht sich selbst">⏳</span>}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Message Input */}
                        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={`Nachricht an #${customChannel || channel}...`}
                                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-100 outline-none bg-gray-50"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="text-white p-2 rounded-xl hover:opacity-90 disabled:opacity-50 transition-colors shadow-sm"
                                style={{ backgroundColor: settings.color }}
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </>
                )}
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">Deine Rechte & FAQ (Stand 2025)</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    <FAQItem
                        question="Wann bekomme ich Geld zurück?"
                        answer="Ab 60 Min. Verspätung am Zielbahnhof gibt es 25% des Fahrpreises. Ab 120 Min. sind es 50%. Bei Zeitkarten (z.B. Deutschlandticket) gibt es Pauschalen (1,50€ pro Fall, sammeln bis 4€)."
                        hoverColorClass="hover:text-purple-600"
                    />
                    <FAQItem
                        question="Darf ich einen anderen Zug nehmen?"
                        answer="Ja. Wenn eine Verspätung von mehr als 20 Min. am Zielort erwartet wird, ist die Zugbindung aufgehoben. Du darfst auch höherwertige Züge (ICE/IC) nutzen (außer bei stark ermäßigten Tickets wie dem Deutschlandticket)."
                        hoverColorClass="hover:text-purple-600"
                    />
                    <FAQItem
                        question="Taxi oder Hotel?"
                        answer="Wenn die letzte geplante Verbindung ausfällt oder du zwischen 0 und 5 Uhr mit >60 Min. Verspätung ankommen würdest, zahlt die Bahn Taxi (bis 120€) oder Hotel, wenn keine Weiterfahrt möglich ist."
                        hoverColorClass="hover:text-purple-600"
                    />
                    <FAQItem
                        question="Gibt es Ausnahmen?"
                        answer="Ja. Bei 'außergewöhnlichen Umständen' (z.B. extremes Wetter, Naturkatastrophen, Personen im Gleis) muss keine Entschädigung gezahlt werden. Streiks gelten jedoch NICHT als Ausnahme – hier hast du Anspruch!"
                        hoverColorClass="hover:text-purple-600"
                    />
                </div>
            </div>
        </div>
    );
}

