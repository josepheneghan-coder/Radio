import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Globe2, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  UserCheck, 
  Sparkles,
  Ticket,
  X,
  Info
} from 'lucide-react';
import { 
  LIVE_EVENTS_DATA, 
  LiveEventEntry, 
  EventRegion, 
  EventVerificationStatus, 
  STATUS_STYLE_CONFIG 
} from '../data/liveEventsData';

interface LiveEventTickerProps {
  onNavigate?: (sectionId: string) => void;
}

const REGION_TABS: { id: EventRegion; label: string }[] = [
  { id: 'ALL', label: 'ALL DESTINATIONS' },
  { id: 'IBIZA', label: 'IBIZA' },
  { id: 'TULUM', label: 'TULUM' },
  { id: 'MYKONOS', label: 'MYKONOS' },
  { id: 'BRAZIL', label: 'BRAZIL' },
  { id: 'ASIA', label: 'BALI & ASIA' },
  { id: 'FESTIVALS', label: 'FESTIVALS' },
];

export const LiveEventTicker: React.FC<LiveEventTickerProps> = () => {
  const [selectedRegion, setSelectedRegion] = useState<EventRegion>('ALL');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [inspectEvent, setInspectEvent] = useState<LiveEventEntry | null>(null);
  const [displayMode, setDisplayMode] = useState<'ticker' | 'focus'>('ticker');
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Filtered events
  const filteredEvents = useMemo(() => {
    if (selectedRegion === 'ALL') return LIVE_EVENTS_DATA;
    return LIVE_EVENTS_DATA.filter((ev) => ev.region === selectedRegion);
  }, [selectedRegion]);

  // Keep index within bounds
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedRegion]);

  // Auto-advance focused event when not paused
  useEffect(() => {
    if (isPaused || filteredEvents.length <= 1) return;

    autoAdvanceTimerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredEvents.length);
    }, 6500);

    return () => {
      if (autoAdvanceTimerRef.current) clearInterval(autoAdvanceTimerRef.current);
    };
  }, [isPaused, filteredEvents.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredEvents.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredEvents.length) % filteredEvents.length);
  };

  const activeEvent = filteredEvents[currentIndex] || filteredEvents[0];

  return (
    <div 
      className="w-full bg-[#070709] border-b border-[#1f1f26] text-white select-none relative z-30 transition-colors"
      role="region"
      aria-label="Radio Underground Live Global Event Ticker"
    >
      {/* 1. TOP BROADCAST TELETYPE STRIP */}
      <div className="border-b border-[#18181f] bg-[#0c0c10] px-3 sm:px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
          </span>
          <span className="text-[10px] sm:text-[11px] font-mono font-black tracking-widest uppercase text-white flex items-center gap-1.5">
            <Globe2 size={12} className="text-red-500" />
            GLOBAL EVENT DISPATCH
          </span>
          <span className="hidden md:inline text-[9px] text-neutral-300 font-mono tracking-widest uppercase border-l border-neutral-700 pl-2">
            EDITORIAL VERIFIED · 2025/2026 CALENDAR
          </span>
        </div>

        {/* Region Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {REGION_TABS.map((tab) => {
            const count = tab.id === 'ALL' 
              ? LIVE_EVENTS_DATA.length 
              : LIVE_EVENTS_DATA.filter((e) => e.region === tab.id).length;
            const isActive = selectedRegion === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedRegion(tab.id)}
                className={`text-[9px] sm:text-[10px] font-mono uppercase px-2 py-0.5 whitespace-nowrap transition-all border cursor-pointer ${
                  isActive
                    ? 'bg-red-600 text-white font-bold border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                    : 'bg-[#121217] text-neutral-400 hover:text-white border-[#26262f] hover:border-neutral-500'
                }`}
              >
                {tab.label} <span className="opacity-70 text-[8px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Display Mode / Speed / Pause Controls */}
        <div className="flex items-center gap-1.5 ml-auto shrink-0">
          <button
            onClick={() => setDisplayMode((m) => (m === 'ticker' ? 'focus' : 'ticker'))}
            className="text-[9px] font-mono uppercase px-2 py-0.5 bg-[#14141b] text-neutral-300 hover:text-white border border-[#26262f] transition-colors cursor-pointer"
            title="Toggle compact marquee or highlighted event view"
          >
            {displayMode === 'ticker' ? 'HIGHLIGHT VIEW' : 'MARQUEE STREAM'}
          </button>

          <button
            onClick={() => setIsPaused((p) => !p)}
            className={`w-6 h-5 flex items-center justify-center border text-[9px] transition-colors cursor-pointer ${
              isPaused 
                ? 'bg-yellow-400 text-black border-yellow-300 font-bold' 
                : 'bg-[#14141b] text-neutral-400 hover:text-white border-[#26262f]'
            }`}
            title={isPaused ? 'Resume auto-cycle' : 'Pause auto-cycle'}
            aria-label={isPaused ? 'Resume auto-cycle' : 'Pause auto-cycle'}
          >
            {isPaused ? <Play size={10} className="fill-current" /> : <Pause size={10} className="fill-current" />}
          </button>

          <div className="flex items-center border border-[#26262f] bg-[#14141b]">
            <button
              onClick={handlePrev}
              className="px-1.5 py-0.5 text-neutral-400 hover:text-white hover:bg-[#20202a] transition-colors cursor-pointer"
              title="Previous Event"
              aria-label="Previous Event"
            >
              <ChevronLeft size={12} />
            </button>
            <span className="px-1.5 text-[9px] text-neutral-400 font-mono">
              {currentIndex + 1}/{filteredEvents.length}
            </span>
            <button
              onClick={handleNext}
              className="px-1.5 py-0.5 text-neutral-400 hover:text-white hover:bg-[#20202a] transition-colors cursor-pointer"
              title="Next Event"
              aria-label="Next Event"
            >
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC BROADCAST CONTENT AREA */}
      {displayMode === 'ticker' ? (
        /* MARQUEE CONTINUOUS STREAM */
        <div 
          className="relative overflow-hidden h-10 sm:h-11 flex items-center bg-[#07070a] group cursor-default"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            className={`animate-ticker-marquee flex items-center gap-8 ${isPaused ? 'pause-animation' : 'pause-on-hover'}`}
            style={{ '--ticker-duration': `${Math.max(35, filteredEvents.length * 5)}s` } as React.CSSProperties}
          >
            {/* Run 1 */}
            <div className="flex items-center gap-8 pr-8">
              {filteredEvents.map((event) => renderTickerNode(event, () => setInspectEvent(event)))}
            </div>
            {/* Run 2 for continuous smooth infinite loop */}
            <div className="flex items-center gap-8 pr-8" aria-hidden="true">
              {filteredEvents.map((event) => renderTickerNode(event, () => setInspectEvent(event), true))}
            </div>
          </div>
        </div>
      ) : (
        /* HIGHLIGHT FOCUS CARD (CLEAN HIGH DENSITY BROADCAST ROW) */
        activeEvent && (
          <div className="px-3 sm:px-4 py-2.5 bg-[#09090d] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono transition-all">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider uppercase border ${
                STATUS_STYLE_CONFIG[activeEvent.status]?.badgeBg || 'bg-neutral-900'
              } ${STATUS_STYLE_CONFIG[activeEvent.status]?.badgeBorder || 'border-neutral-700'} ${
                STATUS_STYLE_CONFIG[activeEvent.status]?.badgeText || 'text-neutral-300'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLE_CONFIG[activeEvent.status]?.dotColor || 'bg-neutral-500'}`} />
                {activeEvent.status}
              </span>

              <span className="font-display font-black text-white text-sm sm:text-base tracking-tight hover:text-red-400 transition-colors cursor-pointer" onClick={() => setInspectEvent(activeEvent)}>
                {activeEvent.eventName}
              </span>

              <span className="text-neutral-500">·</span>

              <span className="text-neutral-300 flex items-center gap-1 text-[11px]">
                <MapPin size={11} className="text-red-500 shrink-0" />
                <span className="font-semibold text-white">{activeEvent.venue}</span> ({activeEvent.destination})
              </span>

              <span className="text-neutral-500">·</span>

              <span className="text-yellow-400 font-mono text-[11px] flex items-center gap-1">
                <Calendar size={11} className="text-yellow-400 shrink-0" />
                {activeEvent.dateDisplay}
              </span>
            </div>

            {/* Artists Roster & Direct Outlink */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <div className="flex items-center gap-1 text-[11px] text-neutral-300 bg-[#121217] px-2 py-1 border border-[#202029]">
                <UserCheck size={11} className="text-emerald-400 shrink-0" />
                <span className="text-neutral-400 uppercase text-[9px]">Confirmed:</span>
                <span className="text-white font-semibold truncate max-w-[280px] sm:max-w-md">
                  {activeEvent.headliners.join(', ')}
                </span>
              </div>

              <button
                onClick={() => setInspectEvent(activeEvent)}
                className="px-2.5 py-1 text-[10px] font-mono uppercase bg-[#181822] hover:bg-[#232332] text-neutral-200 hover:text-white border border-[#2a2a38] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Info size={11} />
                FULL DETAILS
              </button>

              <a
                href={activeEvent.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase bg-red-600 hover:bg-red-500 text-white transition-colors flex items-center gap-1 shadow-[0_0_10px_rgba(220,38,38,0.4)] cursor-pointer"
                title={`Open official source (${activeEvent.officialSource})`}
              >
                <span>OFFICIAL SOURCE</span>
                <ExternalLink size={10} />
              </a>
            </div>
          </div>
        )
      )}

      {/* 3. EVENT INSPECT DRAWER / MODAL */}
      {inspectEvent && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
          onClick={() => setInspectEvent(null)}
        >
          <div 
            className="w-full max-w-xl bg-[#0d0d12] border-2 border-red-600/80 shadow-[0_0_30px_rgba(220,38,38,0.3)] text-white font-mono p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#242432] pb-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider uppercase border ${
                    STATUS_STYLE_CONFIG[inspectEvent.status]?.badgeBg || 'bg-neutral-900'
                  } ${STATUS_STYLE_CONFIG[inspectEvent.status]?.badgeBorder || 'border-neutral-700'} ${
                    STATUS_STYLE_CONFIG[inspectEvent.status]?.badgeText || 'text-neutral-300'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLE_CONFIG[inspectEvent.status]?.dotColor || 'bg-neutral-500'}`} />
                    {inspectEvent.status}
                  </span>
                  <span className="text-[10px] text-neutral-400 bg-[#161622] px-2 py-0.5 border border-[#222232]">
                    REGION: {inspectEvent.region} · {inspectEvent.country.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <ShieldCheck size={11} /> VERIFIED {inspectEvent.lastVerified}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-display font-black tracking-tight text-white uppercase">
                  {inspectEvent.eventName}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Promoted & Curated by <span className="text-neutral-200 font-semibold">{inspectEvent.organizer}</span>
                </p>
              </div>

              <button
                onClick={() => setInspectEvent(null)}
                className="w-7 h-7 flex items-center justify-center bg-[#181824] hover:bg-red-600 text-neutral-300 hover:text-white border border-[#2b2b3d] transition-colors cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X size={14} />
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
                  Calendar Target: {inspectEvent.startDate}
                </div>
              </div>

              <div className="bg-[#12121a] p-3 border border-[#20202c]">
                <div className="text-[10px] text-neutral-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                  <MapPin size={12} className="text-red-500" />
                  VENUE & CITY
                </div>
                <div className="font-bold text-white text-sm">
                  {inspectEvent.venue}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  {inspectEvent.destination}
                </div>
              </div>
            </div>

            {/* Confirmed Artists Roster */}
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

            {/* Notes / Technical Setup */}
            {inspectEvent.notes && (
              <div className="bg-[#12121a] p-3 border border-[#20202c] mb-5 text-xs text-neutral-300 leading-relaxed">
                <div className="text-[10px] text-neutral-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                  <Sparkles size={11} className="text-amber-400" />
                  EVENT DISPATCH NOTES
                </div>
                {inspectEvent.notes}
              </div>
            )}

            {/* External Links Bar */}
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

// Helper to render individual marquee node
function renderTickerNode(
  event: LiveEventEntry, 
  onClickInspect: () => void,
  isAriaHidden = false
) {
  const statusConfig = STATUS_STYLE_CONFIG[event.status];

  return (
    <div
      key={`${event.id}${isAriaHidden ? '-dup' : ''}`}
      className="flex items-center gap-3 whitespace-nowrap cursor-pointer group/item hover:opacity-90"
      onClick={onClickInspect}
    >
      {/* Verification Status Pill */}
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider border ${
        statusConfig?.badgeBg || 'bg-neutral-900'
      } ${statusConfig?.badgeBorder || 'border-neutral-700'} ${statusConfig?.badgeText || 'text-neutral-300'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig?.dotColor || 'bg-neutral-500'}`} />
        {event.status}
      </span>

      {/* Destination Badge */}
      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-[#14141d] text-neutral-300 border border-[#252535]">
        {event.destination.split(',')[0].toUpperCase()}
      </span>

      {/* Event Name */}
      <span className="text-white font-mono font-bold text-[11px] sm:text-[12px] group-hover/item:text-red-400 transition-colors flex items-center gap-1">
        {event.eventName}
      </span>

      {/* Confirmed Artists */}
      <span className="text-neutral-300 font-mono text-[11px] flex items-center gap-1">
        <span className="text-neutral-400 text-[10px]">LINE-UP:</span>
        <strong className="text-yellow-400 font-medium">
          {event.headliners.slice(0, 2).join(' · ')}
        </strong>
      </span>

      {/* Date */}
      <span className="text-neutral-400 font-mono text-[10px] bg-[#121218] px-1.5 py-0.5 border border-[#222230]">
        {event.dateDisplay}
      </span>

      {/* Direct Outlink icon */}
      <a
        href={event.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-neutral-400 hover:text-white transition-colors p-1"
        title={`Open official source (${event.officialSource})`}
      >
        <ExternalLink size={11} />
      </a>

      {/* Separator */}
      <span className="text-[#333342] font-black">///</span>
    </div>
  );
}
