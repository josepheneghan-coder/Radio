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

export const LiveEventTicker: React.FC<LiveEventTickerProps> = () => {
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [inspectEvent, setInspectEvent] = useState<LiveEventEntry | null>(null);

  return (
    <div 
      className="banner-container w-full bg-[#f8f8fa] border-y border-neutral-300 text-black select-none relative z-30 transition-colors"
      role="region"
      aria-label="RADIO KONTROLLE Live Global Event Ticker"
    >
      {/* WHITE EVENT BROADCAST — GPU-ACCELERATED ENLARGED CONTINUOUS MARQUEE STREAM */}
      <div 
        className="banner-container relative overflow-hidden h-28 sm:h-32 md:h-36 min-h-[112px] sm:min-h-[128px] md:min-h-[140px] flex items-center bg-gradient-to-r from-[#f0f0f4] via-[#ffffff] to-[#f0f0f4] group cursor-pointer"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div 
          className={`banner-container animate-ticker-marquee flex items-center gap-8 sm:gap-12 ${isPaused ? 'pause-animation' : 'pause-on-hover'}`}
          style={{ '--ticker-duration': `${Math.max(160, LIVE_EVENTS_DATA.length * 24)}s` } as React.CSSProperties}
        >
          {/* Run 1 */}
          <div className="flex items-center gap-8 sm:gap-12 pr-8 sm:pr-12">
            {LIVE_EVENTS_DATA.map((event) => (
              <TickerItem 
                key={event.id} 
                event={event} 
                onInspect={() => setInspectEvent(event)} 
              />
            ))}
          </div>
          {/* Run 2 for seamless infinite marquee loop */}
          <div className="flex items-center gap-8 sm:gap-12 pr-8 sm:pr-12" aria-hidden="true">
            {LIVE_EVENTS_DATA.map((event) => (
              <TickerItem 
                key={`${event.id}-dup`} 
                event={event} 
                onInspect={() => setInspectEvent(event)} 
                isAriaHidden 
              />
            ))}
          </div>
        </div>
      </div>

      {/* EVENT INSPECT DRAWER / MODAL */}
      {inspectEvent && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
          onClick={() => setInspectEvent(null)}
        >
          <div 
            className="w-full max-w-xl bg-[#0c0c10] border-2 border-red-600 shadow-[0_0_40px_rgba(220,38,38,0.35)] text-white font-mono p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#242432] pb-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {/* Official Emblem */}
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

            {/* Event Specs Grid */}
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

            {/* Confirmed Selectors Roster */}
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

            {/* Notes / Technical Specs */}
            {inspectEvent.notes && (
              <div className="bg-[#12121a] p-3 border border-[#20202c] mb-5 text-xs text-neutral-300 leading-relaxed">
                <div className="text-[10px] text-neutral-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                  <Sparkles size={11} className="text-amber-400" />
                  EVENT DISPATCH NOTES
                </div>
                {inspectEvent.notes}
              </div>
            )}

            {/* Action Links Bar */}
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

// Component to render individual ticker node in WHITE EVENT BROADCAST aesthetic
interface TickerItemProps {
  event: LiveEventEntry;
  onInspect: () => void;
  isAriaHidden?: boolean;
}

const TickerItem: React.FC<TickerItemProps> = ({ event, onInspect, isAriaHidden = false }) => {
  return (
    <div
      className="flex items-center gap-4 sm:gap-6 whitespace-nowrap cursor-pointer group/item py-2 shrink-0 select-none transition-opacity hover:opacity-90 transform-gpu"
      onClick={onInspect}
      role="button"
      tabIndex={isAriaHidden ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onInspect();
        }
      }}
    >
      {/* 1. Official Club / Festival Logo Emblem */}
      <div className="shrink-0 flex items-center">
        <OfficialEventLogo badge={event.clubBadge} size="md" />
      </div>

      {/* 2. Structured White Broadcast Poster Layout */}
      <div className="flex flex-col justify-center gap-1 sm:gap-1.5 leading-tight">
        {/* Top: Status Label (LIVE in Magenta + ONLINE BROADCAST in black box) */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-mono font-black text-[10px] sm:text-[11px] text-[#db2777] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#db2777] inline-block shrink-0" />
            LIVE
          </span>
          <span className="text-neutral-400 text-[10px] font-bold">&</span>
          <span className="bg-black text-white px-1.5 py-0.5 text-[8.5px] sm:text-[9.5px] font-mono font-bold tracking-widest uppercase shrink-0">
            ONLINE BROADCAST
          </span>
          <span className="text-neutral-500 text-[9px] sm:text-[10px] font-mono uppercase tracking-wide">
            · {event.status}
          </span>
        </div>

        {/* Middle: Big Black Bold Display Typography + Solid Black Destination Box */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <h4 className="font-display font-black text-black text-xl sm:text-2xl md:text-3xl tracking-tight uppercase leading-none group-hover/item:text-neutral-800 transition-colors">
            {event.eventName}
          </h4>
          <span className="bg-black text-white px-2 sm:px-2.5 py-1 text-xs sm:text-sm font-mono font-black tracking-wider uppercase shrink-0">
            {event.destination.split(',')[0].toUpperCase()}
          </span>
        </div>

        {/* Bottom: Date & Venue Badges in compact solid black surfaces with white text */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono font-bold uppercase">
          <span className="bg-black text-white px-2 py-0.5 shrink-0">
            {event.venue}
          </span>
          <span className="bg-black text-white px-2 py-0.5 shrink-0">
            {event.dateDisplay}
          </span>
          <span className="bg-neutral-800 text-neutral-100 px-2 py-0.5 hidden md:inline-flex items-center gap-1 shrink-0">
            <span className="text-yellow-400">SELECTORS:</span>
            <span>{event.headliners.slice(0, 2).join(' · ')}</span>
          </span>
          <span className="text-neutral-400 group-hover/item:text-black transition-colors pl-0.5 inline-flex items-center">
            <ExternalLink size={11} />
          </span>
        </div>
      </div>

      {/* BNG Logo Watermark (200% enlarged neon emblem) */}
      <div className="shrink-0 flex items-center px-3 sm:px-6 pointer-events-none">
        <img 
          src="/assets/bng-logo.svg" 
          alt="BNG Logo" 
          className="h-14 sm:h-16 md:h-20 w-auto object-contain opacity-95 drop-shadow-sm select-none"
        />
      </div>
    </div>
  );
};
