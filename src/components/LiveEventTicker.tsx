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
  // Off-Main-Thread Animation (OMTA) completely eliminates main-thread contention
  useEffect(() => {
    const track = trackRef.current;
    const segment = segmentRef.current;
    if (!track || !segment) return;

    const computeDuration = () => {
      const width = segment.getBoundingClientRect().width || segment.offsetWidth;
      if (width > 0) {
        // Linear velocity: 28px/s
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
      {/* WHITE EVENT BROADCAST — COMPACT STREAMLINED VIEW */}
      <div 
        className="banner-container relative overflow-hidden h-[48px] sm:h-[52px] md:h-[56px] min-h-[48px] sm:min-h-[52px] md:min-h-[56px] flex items-center bg-gradient-to-r from-[#f0f0f4] via-[#ffffff] to-[#f0f0f4] cursor-default"
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
    <div className="flex items-center whitespace-nowrap cursor-default py-1 pr-6 sm:pr-8 shrink-0 select-none">
      {/* Streamlined Compact View: Strictly Event Name, Venue, Date */}
      <div className="flex flex-col justify-center gap-1 leading-tight">
        {/* Event Name */}
        <h4 className="font-display font-black text-black text-sm sm:text-base md:text-[17px] tracking-tight uppercase leading-none">
          {event.eventName}
        </h4>

        {/* Venue & Date */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-mono font-bold uppercase">
          <span className="bg-black text-white px-1.5 py-0.5 shrink-0">
            {event.venue}
          </span>
          <span className="bg-neutral-800 text-neutral-100 px-1.5 py-0.5 shrink-0">
            {event.dateDisplay}
          </span>
        </div>
      </div>
      <span className="ml-6 sm:ml-8 text-neutral-300 font-mono text-xs select-none">/</span>
    </div>
  );
};
