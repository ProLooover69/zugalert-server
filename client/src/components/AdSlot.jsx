import React, { useState, useEffect, useCallback } from 'react';
import { X, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

// --- Ad Inventory ---
const ADS = [
  {
    id: 'bahn-spar',
    bg: 'linear-gradient(135deg, #003189 0%, #c0392b 100%)',
    badge: '🎟️ Bahn-Angebot',
    headline: 'Deutschland für 49 €',
    sub: 'Deutschlandticket jetzt im Abo – unbegrenzt Bus & Bahn.',
    cta: 'Jetzt buchen',
    url: 'https://www.bahn.de',
    emoji: '🚄',
  },
  {
    id: 'flixbus',
    bg: 'linear-gradient(135deg, #4aa800 0%, #73d700 100%)',
    badge: '🚌 FlixBus Partner',
    headline: 'Bus ab 4,99 €',
    sub: 'Günstig quer durch Europa reisen – jetzt vergleichen.',
    cta: 'Preise checken',
    url: 'https://www.flixbus.de',
    emoji: '🚌',
  },
  {
    id: 'hotel-bonus',
    bg: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
    badge: '🏨 Reise-Tipp',
    headline: 'Hotel am Bahnhof',
    sub: 'Übernachte günstig direkt am Gleis. Früh buchen = mehr sparen.',
    cta: 'Hotel finden',
    url: 'https://www.booking.com',
    emoji: '🏨',
  },
  {
    id: 'insurance',
    bg: 'linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%)',
    badge: '🛡️ Reiseschutz',
    headline: 'Reiseversicherung ab 1 €',
    sub: 'Bei Zugausfall sofort entschädigt. Jetzt absichern.',
    cta: 'Schutz sichern',
    url: 'https://www.check24.de',
    emoji: '🛡️',
  },
  {
    id: 'luggage',
    bg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    badge: '🧳 Reise-Gadget',
    headline: 'Kofferset ab 39 €',
    sub: 'Leichte Hartschalen-Koffer – perfekt für Zugreisende.',
    cta: 'Jetzt ansehen',
    url: 'https://www.amazon.de',
    emoji: '🧳',
  },
];

const ROTATION_MS = 8000;

export default function AdSlot({ format = 'horizontal', className = '', dismissible = true }) {
  const [adIndex, setAdIndex] = useState(() => Math.floor(Math.random() * ADS.length));
  const [dismissed, setDismissed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  const ad = ADS[adIndex];

  const goToAd = useCallback((next) => {
    setFading(true);
    setTimeout(() => {
      setAdIndex(next);
      setProgress(0);
      setFading(false);
    }, 220);
  }, []);

  const nextAd = useCallback(() => goToAd((adIndex + 1) % ADS.length), [adIndex, goToAd]);
  const prevAd = useCallback(() => goToAd((adIndex - 1 + ADS.length) % ADS.length), [adIndex, goToAd]);

  useEffect(() => {
    if (dismissed) return;
    const step = 100 / (ROTATION_MS / 100);
    const tick = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { nextAd(); return 0; }
        return p + step;
      });
    }, 100);
    return () => clearInterval(tick);
  }, [dismissed, nextAd]);

  if (dismissed) return null;

  const isVertical = format === 'vertical';
  const isBanner = format === 'banner';

  const containerStyle = {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '16px',
    background: ad.bg,
    minHeight: isBanner ? '64px' : isVertical ? '280px' : '110px',
    opacity: fading ? 0 : 1,
    transition: 'opacity 0.22s ease',
    width: '100%',
  };

  const handleCta = (e) => {
    e.stopPropagation();
    window.open(ad.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={containerStyle} className={className}>

      {/* Progress bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.2)', zIndex: 10 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'rgba(255,255,255,0.7)', transition: 'none' }} />
      </div>

      {/* "Anzeige" label */}
      <span style={{ position: 'absolute', top: '8px', left: '12px', fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', textTransform: 'uppercase', zIndex: 10 }}>
        Anzeige
      </span>

      {/* Dismiss */}
      {dismissible && (
        <button
          onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
          aria-label="Anzeige schließen"
          style={{ position: 'absolute', top: '6px', right: '8px', zIndex: 20, width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(0,0,0,0.25)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
        >
          <X style={{ width: '11px', height: '11px', color: '#fff' }} />
        </button>
      )}

      {/* Main content */}
      <div style={{
        position: 'relative',
        zIndex: 5,
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row',
        alignItems: isVertical ? 'flex-start' : 'center',
        gap: '14px',
        padding: isVertical ? '28px 20px 48px' : '20px 16px',
        height: '100%',
        boxSizing: 'border-box',
      }}>
        {/* Emoji */}
        <div style={{ flexShrink: 0, width: isVertical ? '52px' : '46px', height: isVertical ? '52px' : '46px', borderRadius: '14px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isVertical ? '26px' : '22px' }}>
          {ad.emoji}
        </div>

        {/* Text block */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '3px' }}>
            {ad.badge}
          </div>
          <h3 style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: isVertical ? '18px' : '14px', lineHeight: 1.3 }}>
            {ad.headline}
          </h3>
          {!isBanner && (
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.45 }}>
              {ad.sub}
            </p>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={handleCta}
          style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.92)', color: '#1a1a2e', fontWeight: 700, fontSize: '13px', border: 'none', borderRadius: '12px', padding: isVertical ? '12px 18px' : '9px 14px', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', transition: 'transform 0.15s ease', alignSelf: isVertical ? 'stretch' : 'center', justifyContent: 'center' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {ad.cta}
          <ExternalLink style={{ width: '12px', height: '12px', opacity: 0.6 }} />
        </button>
      </div>

      {/* Navigation — hidden in banner mode */}
      {!isBanner && (
        <>
          {/* Prev arrow */}
          <button
            onClick={(e) => { e.stopPropagation(); prevAd(); }}
            style={{ position: 'absolute', bottom: '8px', left: '8px', zIndex: 20, width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(0,0,0,0.25)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
          >
            <ChevronLeft style={{ width: '14px', height: '14px', color: '#fff' }} />
          </button>

          {/* Next arrow */}
          <button
            onClick={(e) => { e.stopPropagation(); nextAd(); }}
            style={{ position: 'absolute', bottom: '8px', right: '8px', zIndex: 20, width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(0,0,0,0.25)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
          >
            <ChevronRight style={{ width: '14px', height: '14px', color: '#fff' }} />
          </button>

          {/* Dot indicators */}
          <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 20, display: 'flex', gap: '5px', alignItems: 'center' }}>
            {ADS.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); goToAd(i); }}
                style={{ border: 'none', cursor: 'pointer', borderRadius: '99px', padding: 0, background: i === adIndex ? '#fff' : 'rgba(255,255,255,0.35)', width: i === adIndex ? '16px' : '7px', height: '7px', transition: 'all 0.2s ease' }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
