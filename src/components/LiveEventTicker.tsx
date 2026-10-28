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
      className="w-full bg-[#070709] border-b border-[#22222c] text-white select-none relative z-30 transition-colors"
      role="region"
      aria-label="RADIO KONTROLLE Live Global Event Ticker"
    >
      {/* PURE ENLARGED CONTINUOUS MARQUEE STREAM (Top controls/filters removed as requested) */}
      <div 
        className="relative overflow-hidden h-14 sm:h-16 md:h-16 flex items-center bg-[#07070a] border-t border-b border-[#1c1c26] group cursor-pointer"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div 
          className={`animate-ticker-marquee flex items-center gap-10 sm:gap-14 ${isPaused ? 'pause-animation' : 'pause-on-hover'}`}
          style={{ '--ticker-duration': `${Math.max(80, LIVE_EVENTS_DATA.length * 12)}s` } as React.CSSProperties}
        >
          {/* Run 1 */}
          <div className="flex items-center gap-10 sm:gap-14 pr-10 sm:pr-14">
            {LIVE_EVENTS_DATA.map((event) => (
              <TickerItem 
                key={event.id} 
                event={event} 
                onInspect={() => setInspectEvent(event)} 
              />
            ))}
          </div>
          {/* Run 2 for seamless infinite marquee loop */}
          <div className="flex items-center gap-10 sm:gap-14 pr-10 sm:pr-14" aria-hidden="true">
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

// Component to render individual ticker node with enlarged mobile dimensions and official logos
interface TickerItemProps {
  event: LiveEventEntry;
  onInspect: () => void;
  isAriaHidden?: boolean;
}

const TickerItem: React.FC<TickerItemProps> = ({ event, onInspect, isAriaHidden = false }) => {
  const statusConfig = STATUS_STYLE_CONFIG[event.status];

  return (
    <div
      className="flex items-center gap-3 sm:gap-4 whitespace-nowrap cursor-pointer group/item hover:opacity-95 transition-opacity py-1"
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
      {/* Official Verified Club/Festival Logo Emblem */}
      <OfficialEventLogo badge={event.clubBadge} size="md" />

      {/* Verification Status Pill */}
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider border shrink-0 ${
        statusConfig?.badgeBg || 'bg-neutral-900'
      } ${statusConfig?.badgeBorder || 'border-neutral-700'} ${statusConfig?.badgeText || 'text-neutral-300'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig?.dotColor || 'bg-neutral-500'}`} />
        {event.status}
      </span>

      {/* Destination Badge */}
      <span className="text-[10px] sm:text-[11px] font-mono uppercase px-2 py-0.5 bg-[#14141d] text-neutral-300 border border-[#252535] shrink-0">
        {event.destination.split(',')[0].toUpperCase()}
      </span>

      {/* Enlarged Event Name for Smartphones (~16px on mobile, bold condensed club font) */}
      <span className="text-white font-display font-black text-[15px] sm:text-[16px] md:text-[18px] tracking-wide group-hover/item:text-red-400 transition-colors uppercase">
        {event.eventName}
      </span>

      {/* Confirmed Selectors */}
      <span className="text-neutral-300 font-mono text-[11px] sm:text-[12px] flex items-center gap-1.5 shrink-0">
        <span className="text-neutral-400 text-[9px] uppercase tracking-wider">SELECTORS:</span>
        <strong className="text-yellow-400 font-semibold">
          {event.headliners.slice(0, 2).join(' · ')}
        </strong>
      </span>

      {/* Date */}
      <span className="text-neutral-300 font-mono text-[10px] sm:text-[11px] bg-[#121218] px-2 py-0.5 border border-[#222230] shrink-0">
        {event.dateDisplay}
      </span>

      {/* External Link */}
      <a
        href={event.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-neutral-400 hover:text-white transition-colors p-1 shrink-0"
        title={`Open official source (${event.officialSource})`}
      >
        <ExternalLink size={12} />
      </a>

      {/* Industrial Separator */}
      <span className="text-[#3a3a4c] font-black text-sm select-none pl-2">///</span>
    </div>
  );
};
