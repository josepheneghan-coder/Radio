import React, { useEffect, useRef } from 'react';
import { 
  LIVE_EVENTS_DATA, 
  LiveEventEntry 
} from '../data/liveEventsData';

interface LiveEventTickerProps {
  onNavigate?: (sectionId: string) => void;
}

export const LiveEventTicker: React.FC<LiveEventTickerProps> = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const segmentRef = useRef<HTMLDivElement>(null);
  // Hardware Compositor Animation: Sets exact linear speed (28px/s) on GPU compositor
  // Off-Main-Thread Animation (OMTA) completely eliminates main-thread JS contention on 120Hz/60Hz VRR displays
  useEffect(() => {
    const track = trackRef.current;
    const segment = segmentRef.current;
    if (!track || !segment) return;

    const computeDuration = () => {
      const width = segment.getBoundingClientRect().width || segment.offsetWidth;
      if (width > 0) {
        // Linear velocity: 28px/s (exact match to target speed)
        const durationSeconds = width / 28;
        track.style.setProperty('--ticker-duration', `${durationSeconds.toFixed(1)}s`);
      }
    };

    computeDuration();
    const resizeObserver = new ResizeObserver(() => {
      computeDuration();
    });
    resizeObserver.observe(segment);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div 
      className="w-full bg-[#f8f8fa] border-y border-neutral-300 text-black select-none relative z-30 transition-colors"
      role="region"
      aria-label="RADIO KONTROLLE Live Global Event Ticker"
    >
      {/* WHITE EVENT BROADCAST — GPU HARDWARE COMPOSITOR STREAM (STREAMLINED COMPACT VIEW) */}
      <div 
        className="banner-container relative overflow-hidden h-[58px] sm:h-[64px] md:h-[68px] min-h-[58px] sm:min-h-[64px] md:min-h-[68px] flex items-center bg-gradient-to-r from-[#f0f0f4] via-[#ffffff] to-[#f0f0f4] cursor-default"
      >
        {/* Foreground Scrolling Content Layer (Off-Main-Thread GPU Compositor Animation) */}
        <div 
          ref={trackRef}
          className="ticker-track-css relative z-10 flex items-center shrink-0"
        >
          {/* Segment 1 */}
          <div ref={segmentRef} className="flex items-center shrink-0">
            {LIVE_EVENTS_DATA.map((event) => (
              <TickerItem 
                key={event.id} 
                event={event} 
              />
            ))}
          </div>
          {/* Segment 2 for seamless infinite marquee loop */}
          <div className="flex items-center shrink-0" aria-hidden="true">
            {LIVE_EVENTS_DATA.map((event) => (
              <TickerItem 
                key={`${event.id}-dup`} 
                event={event} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Component to render individual ticker node strictly focusing on event name, date, and venue
interface TickerItemProps {
  event: LiveEventEntry;
}

const TickerItem: React.FC<TickerItemProps> = ({ event }) => {
  return (
    <div className="flex items-center whitespace-nowrap cursor-default py-0.5 pr-8 sm:pr-12 shrink-0 select-none">
      {/* Pure Typography Broadcast Layout — Streamlined & Compact */}
      <div className="flex flex-col justify-center gap-0.5 leading-tight">
        {/* Top: Status Label (LIVE in Magenta + ONLINE BROADCAST in black box) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="flex items-center gap-1 font-mono font-black text-[8.5px] sm:text-[9.5px] text-[#db2777] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#db2777] inline-block shrink-0" />
            LIVE
          </span>
          <span className="text-neutral-400 text-[8px] font-bold">&</span>
          <span className="bg-black text-white px-1.5 py-0.5 text-[7.5px] sm:text-[8.5px] font-mono font-bold tracking-widest uppercase shrink-0">
            ONLINE BROADCAST
          </span>
          <span className="text-neutral-500 text-[8px] sm:text-[9px] font-mono uppercase tracking-wide">
            · {event.status}
          </span>
        </div>

        {/* Middle: Big Black Bold Display Typography + Destination Box */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <h4 className="font-display font-black text-black text-base sm:text-lg md:text-xl tracking-tight uppercase leading-none">
            {event.eventName}
          </h4>
          <span className="bg-black text-white px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-mono font-black tracking-wider uppercase shrink-0">
            {event.destination.split(',')[0].toUpperCase()}
          </span>
        </div>

        {/* Bottom: Strictly Event Date & Venue Badges */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-mono font-bold uppercase">
          <span className="bg-black text-white px-1.5 sm:px-2 py-0.5 shrink-0">
            {event.venue}
          </span>
          <span className="bg-black text-white px-1.5 sm:px-2 py-0.5 shrink-0">
            {event.dateDisplay}
          </span>
        </div>
      </div>
    </div>
  );
};
