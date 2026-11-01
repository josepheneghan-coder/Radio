import React, { useState } from 'react';
import { 
  ExternalLink, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  UserCheck, 
  Sparkles,
  Ticket,
  X
} from 'lucide-react';
import { 
  LIVE_EVENTS_DATA, 
  LiveEventEntry, 
  STATUS_STYLE_CONFIG 
} from '../data/liveEventsData';
import { OfficialEventLogo } from './OfficialEventLogos';

interface LiveEventTickerProps {
  onNavigate?: (sectionId: string) => void;
}

// Static lookup map for instant O(1) lookup without searching array on every inspection
const LIVE_EVENTS_MAP = new Map<string, LiveEventEntry>(
  LIVE_EVENTS_DATA.map((event) => [event.id, event])
);

export const LiveEventTicker: React.FC<LiveEventTickerProps> = () => {
  const [mobileEventIndex, setMobileEventIndex] = useState<number>(0);
  const [inspectEvent, setInspectEvent] = useState<LiveEventEntry | null>(null);

  const totalEvents = LIVE_EVENTS_DATA.length;
  const currentMobileEvent = LIVE_EVENTS_DATA[mobileEventIndex] || LIVE_EVENTS_DATA[0];

  // Stabile Referenz für Event-Details-Inspektion via ID (verhindert Re-Renders aller 42 Ticker-Items)
  const handleInspectById = React.useCallback((eventId: string) => {
    const target = LIVE_EVENTS_MAP.get(eventId);
    if (target) {
      setInspectEvent(target);
    }
  }, []);

  // Memoisierte Ticker-Runs: Erzeugen bei Modal-Öffnen/-Schließen 0 neue VDOM-Knoten
  const desktopRun1 = React.useMemo(() => (
    LIVE_EVENTS_DATA.map((event) => (
      <DesktopTickerItem 
        key={event.id} 
        event={event} 
        onInspect={handleInspectById} 
      />
    ))
  ), [handleInspectById]);

  const desktopRun2 = React.useMemo(() => (
    LIVE_EVENTS_DATA.map((event) => (
      <DesktopTickerItem 
        key={`${event.id}-dup`} 
        event={event} 
        onInspect={handleInspectById} 
        isAriaHidden 
      />
    ))
  ), [handleInspectById]);

  // Wechsel ausschließlich durch Klicken / Tippen auf die Tickerfläche für Mobile
  const handleNextEvent = () => {
    if (totalEvents <= 1) return;
    setMobileEventIndex((previous) => (previous + 1) % totalEvents);
  };

  return (
    <div 
      className="w-full bg-[#f8f8fa] border-y border-neutral-300 text-black select-none relative z-30 transition-colors"
      role="region"
      aria-label="RADIO KONTROLLE Live Global Event Ticker"
    >
      {/* ============================================================== */}
      {/* 1. DESKTOP VERSION (hidden md:flex)                            */}
      {/* Laufender Marquee & sich langsam bewegendes SVG-Wasserzeichen  */}
      {/* ============================================================== */}
      <div 
        className="hidden md:flex banner-container relative overflow-hidden h-28 sm:h-32 md:h-36 min-h-[112px] sm:min-h-[128px] md:min-h-[140px] items-center bg-gradient-to-r from-[#f0f0f4] via-[#ffffff] to-[#f0f0f4] group"
      >
        {/* Sich langsam von rechts nach links bewegende Wasserzeichen-Ebene (Optimierte CSS-Tile-Ebene, 0 Layout/Paint) */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden flex items-center"
          aria-hidden="true"
        >
          <div 
            className={`animate-watermark-slow flex h-full w-[200%] shrink-0 opacity-10 ${inspectEvent ? 'pause-animation' : ''}`}
            style={{ 
              '--watermark-duration': '280s',
            } as React.CSSProperties}
          >
            <div className="w-1/2 h-full ticker-watermark-tile shrink-0" />
            <div className="w-1/2 h-full ticker-watermark-tile shrink-0" aria-hidden="true" />
          </div>
        </div>

        {/* Im Vordergrund flüssig von rechts nach links laufender Marquee */}
        <div 
          className={`animate-ticker-marquee relative z-10 flex items-center shrink-0 ${inspectEvent ? 'pause-animation' : ''}`}
          style={{ 
            '--ticker-duration': '280s',
          } as React.CSSProperties}
        >
          {/* Run 1 */}
          <div className="flex items-center shrink-0">
            {desktopRun1}
          </div>
          {/* Run 2 für nahtlosen Endlos-Loop */}
          <div className="flex items-center shrink-0" aria-hidden="true">
            {desktopRun2}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MOBILE VERSION (flex md:hidden)                             */}
      {/* Super flach (h-16), starr, Wechsel nur durch Klick/Tipp        */}
      {/* ============================================================== */}
      <div 
        className="relative flex h-16 w-full shrink-0 cursor-pointer items-center overflow-hidden bg-gradient-to-r from-[#f0f0f4] via-white to-[#f0f0f4] px-3 md:hidden select-none"
        onClick={handleNextEvent}
        role="button"
        tabIndex={0}
        aria-label="Zum nächsten Live-Event wechseln"
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleNextEvent();
          }
        }}
      >
        {/* Dezent eingepasstes Logo im Hintergrund */}
        <div 
          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none z-0"
          aria-hidden="true"
        >
          <img
            src="/assets/lllogo-removebg-preview (1).svg"
            alt=""
            decoding="async"
            className="h-10 w-auto object-contain pointer-events-none select-none"
          />
        </div>

        {/* Single Event Content (Zero-Shift Fixed Layout) */}
        <div className="relative z-10 w-full flex items-center gap-2.5 min-w-0">
          <div className="shrink-0 scale-75 origin-left">
            <OfficialEventLogo badge={currentMobileEvent.clubBadge} size="sm" />
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-center leading-tight">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e11d48] inline-block shrink-0 animate-pulse" />
              <span className="font-mono font-bold text-[8px] text-[#e11d48] uppercase tracking-wider">
                LIVE & BROADCAST
              </span>
              <span className="bg-black text-white px-1 py-[0.5px] text-[7.5px] font-mono font-bold uppercase tracking-widest shrink-0">
                {currentMobileEvent.destination.split(',')[0]}
              </span>
            </div>

            <h4 className="font-display font-black text-black text-[11.5px] tracking-tight uppercase truncate">
              {currentMobileEvent.eventName}
            </h4>

            <div className="flex items-center gap-1 mt-0.5 text-[8px] font-mono font-bold uppercase text-neutral-700 truncate">
              <span className="bg-neutral-200 text-black px-1 py-[0.5px]">{currentMobileEvent.venue}</span>
              <span className="bg-black text-white px-1 py-[0.5px]">{currentMobileEvent.dateDisplay.split('—')[0].split('[')[0].trim()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. EVENT INSPECT DRAWER / MODAL (Desktop Only)                 */}
      {/* ============================================================== */}
      {inspectEvent && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
          onClick={() => setInspectEvent(null)}
        >
          <div 
            className="w-full max-w-xl bg-[#0c0c10] border-2 border-red-600 shadow-[0_0_40px_rgba(220,38,38,0.35)] text-white font-mono p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-[#242432] pb-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <OfficialEventLogo badge={inspectEvent.clubBadge} size="md" />
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider uppercase border ${
                    STATUS_STYLE_CONFIG[inspectEvent.status]?.badgeBg || 'bg-neutral-900'
                  } ${STATUS_STYLE_CONFIG[inspectEvent.status]?.badgeBorder || 'border-neutral-700'} ${
                    STATUS_STYLE_CONFIG[inspectEvent.status]?.badgeText || 'text-neutral-300'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLE_CONFIG[inspectEvent.status]?.dotColor || 'bg-neutral-500'}`} />
                    {inspectEvent.status}
                  </span>
                  <span className="text-[10px] text-neutral-400 bg-[#161622] px-2 py-0.5 border border-[#222232]">
                    {inspectEvent.region} · {inspectEvent.country.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <ShieldCheck size={11} /> VERIFIED {inspectEvent.lastVerified}
                  </span>
                </div>
                
                <h3 className="text-xl sm:text-2xl font-display font-black tracking-tight text-white uppercase leading-tight">
                  {inspectEvent.eventName}
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Promoted & Curated by <span className="text-neutral-200 font-semibold">{inspectEvent.organizer}</span>
                </p>
              </div>

              <button
                onClick={() => setInspectEvent(null)}
                className="w-8 h-8 flex items-center justify-center bg-[#181824] hover:bg-red-600 text-neutral-300 hover:text-white border border-[#2b2b3d] transition-colors cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
              <div className="bg-[#12121a] p-3 border border-[#20202c]">
                <div className="text-[10px] text-neutral-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                  <Calendar size={12} className="text-yellow-400" />
                  DATE & SCHEDULE
                </div>
                <div className="font-bold text-yellow-300 text-sm">
                  {inspectEvent.dateDisplay}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5">
                  Target: {inspectEvent.startDate}
                </div>
              </div>

              <div className="bg-[#12121a] p-3 border border-[#20202c]">
                <div className="text-[10px] text-neutral-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                  <MapPin size={12} className="text-red-500" />
                  VENUE & LOCATION
                </div>
                <div className="font-bold text-white text-sm">
                  {inspectEvent.venue}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  {inspectEvent.destination}
                </div>
              </div>
            </div>

            <div className="bg-[#12121a] p-3 border border-[#20202c] mb-4">
              <div className="text-[10px] text-neutral-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                <UserCheck size={12} className="text-emerald-400" />
                CONFIRMED SELECTORS & HEADLINERS
              </div>
              <div className="flex flex-wrap gap-1.5">
                {inspectEvent.artistsConfirmed.map((artist, idx) => (
                  <span 
                    key={idx}
                    className={`px-2 py-1 text-xs font-mono font-medium border ${
                      inspectEvent.headliners.includes(artist)
                        ? 'bg-red-950/70 border-red-600/70 text-white font-bold'
                        : 'bg-[#181824] border-[#29293a] text-neutral-300'
                    }`}
                  >
                    {artist}
                  </span>
                ))}
              </div>
              <div className="mt-2 text-[10px] text-neutral-400">
                Acoustic Genre: <span className="text-neutral-200">{inspectEvent.genre}</span>
              </div>
            </div>

            {inspectEvent.notes && (
              <div className="bg-[#12121a] p-3 border border-[#20202c] mb-5 text-xs text-neutral-300 leading-relaxed">
                <div className="text-[10px] text-neutral-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                  <Sparkles size={11} className="text-amber-400" />
                  EVENT DISPATCH NOTES
                </div>
                {inspectEvent.notes}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#222230]">
              <div className="text-[10px] text-neutral-400">
                Official Verification: <span className="text-white font-semibold">{inspectEvent.officialSource}</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {inspectEvent.ticketUrl && (
                  <a
                    href={inspectEvent.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial px-3 py-1.5 text-xs font-mono font-bold uppercase bg-yellow-400 hover:bg-yellow-300 text-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Ticket size={12} />
                    <span>TICKETS / PASSES</span>
                  </a>
                )}
                <a
                  href={inspectEvent.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial px-3 py-1.5 text-xs font-mono font-bold uppercase bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-1.5 transition-colors shadow-[0_0_12px_rgba(220,38,38,0.5)] cursor-pointer"
                >
                  <span>VISIT SOURCE</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==============================================================
// Component to render individual ticker node in Desktop Stream
// ==============================================================
interface TickerItemProps {
  event: LiveEventEntry;
  onInspect: (id: string) => void;
  isAriaHidden?: boolean;
}

const DesktopTickerItem: React.FC<TickerItemProps> = React.memo(({ event, onInspect, isAriaHidden = false }) => {
  const handleClick = React.useCallback(() => {
    onInspect(event.id);
  }, [event.id, onInspect]);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onInspect(event.id);
    }
  }, [event.id, onInspect]);

  return (
    <div
      className="ticker-item-card flex flex-col justify-center gap-1 sm:gap-1.5 whitespace-nowrap cursor-pointer group/item py-2 pr-10 sm:pr-14 shrink-0 select-none leading-tight transition-opacity hover:opacity-90"
      onClick={handleClick}
      role="button"
      tabIndex={isAriaHidden ? -1 : 0}
      onKeyDown={handleKeyDown}
    >
      {/* Row 1: Live indicator, online broadcast badge, and status */}
      <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-mono font-bold text-black uppercase tracking-wide">
        <span className="inline-flex items-center font-black text-[10px] sm:text-[11px] text-[#e11d48] tracking-wider before:inline-block before:w-2 before:h-2 before:rounded-full before:bg-[#e11d48] before:mr-1.5 before:shrink-0">
          LIVE
        </span>
        <span className="text-black font-bold">&</span>
        <span className="bg-black text-white px-1.5 py-0.5 text-[9px] sm:text-[10px] font-mono font-bold tracking-widest uppercase shrink-0">
          ONLINE BROADCAST
        </span>
        <span className="text-black font-mono font-bold text-[9px] sm:text-[10px] uppercase tracking-wide">
          · {event.status}
        </span>
      </div>

      {/* Row 2: Event Title and Destination City badge (streamlined without redundant container) */}
      <h4 className="font-display font-black text-black text-xl sm:text-2xl md:text-3xl tracking-tight uppercase leading-none group-hover/item:text-neutral-800 transition-colors flex items-center gap-2.5 sm:gap-3">
        {event.eventName}
        <span className="bg-black text-white px-2 sm:px-2.5 py-1 text-xs sm:text-sm font-mono font-black tracking-wider uppercase shrink-0">
          {event.destination.split(',')[0].toUpperCase()}
        </span>
      </h4>

      {/* Row 3: Venue, Date, and Curated Selectors badge */}
      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono font-bold uppercase">
        <span className="bg-black text-white px-2 py-0.5 shrink-0">
          {event.venue}
        </span>
        <span className="bg-black text-white px-2 py-0.5 shrink-0">
          {event.dateDisplay}
        </span>
        <span className="bg-black text-neutral-100 px-2 py-0.5 shrink-0 inline-flex items-center before:content-['SELECTORS:'] before:text-[#eab308] before:font-black before:mr-1.5">
          {event.headliners.join(', ') || event.artistsConfirmed.slice(0, 3).join(', ')}
        </span>
      </div>
    </div>
  );
});

DesktopTickerItem.displayName = 'DesktopTickerItem';
