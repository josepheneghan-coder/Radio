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
  const isHoveredRef = useRef<boolean>(false);

  // Single requestAnimationFrame loop: frame-consistent, zero React state re-renders
  useEffect(() => {
    const track = trackRef.current;
    const segment = segmentRef.current;
    if (!track || !segment) return;

    // Honor prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      track.style.transform = 'translate3d(0px, 0, 0)';
      return;
    }

    // Dynamic measurement with ResizeObserver
    let segmentWidth = segment.getBoundingClientRect().width || segment.offsetWidth;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect && entry.contentRect.width > 0) {
          segmentWidth = entry.target.getBoundingClientRect().width || entry.contentRect.width;
        }
      }
    });
    resizeObserver.observe(segment);

    let x = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    // Linear speed in pixels per second (uniform across 60Hz, 90Hz, 120Hz)
    const SPEED_PX_PER_SEC = 28;

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Only advance when page is active and not hovering
      const isPaused = isHoveredRef.current || document.hidden;

      if (!isPaused && segmentWidth > 0) {
        x -= SPEED_PX_PER_SEC * dt;
        // Seamless loop wrap: when x <= -segmentWidth, wrap by exact measured width
        if (x <= -segmentWidth) {
          x += segmentWidth;
        }
        track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    const handleVisibilityChange = () => {
      lastTime = performance.now();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div 
      className="w-full bg-[#f8f8fa] border-y border-neutral-300 text-black select-none relative z-30 transition-colors"
      role="region"
      aria-label="RADIO KONTROLLE Live Global Event Ticker"
    >
      {/* WHITE EVENT BROADCAST — RAF-DRIVEN MARQUEE STREAM (NO WATERMARK, ZERO CLICKS/LINKS) */}
      <div 
        className="banner-container relative overflow-hidden h-[74px] sm:h-[82px] md:h-[88px] min-h-[74px] sm:min-h-[82px] md:min-h-[88px] flex items-center bg-gradient-to-r from-[#f0f0f4] via-[#ffffff] to-[#f0f0f4] cursor-default"
        onMouseEnter={() => {
          if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            isHoveredRef.current = true;
          }
        }}
        onMouseLeave={() => {
          isHoveredRef.current = false;
        }}
      >
        {/* Foreground Scrolling Content Layer (Single moving track driven by RAF) */}
        <div 
          ref={trackRef}
          className="ticker-track-raf relative z-10 flex items-center shrink-0"
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

// Component to render individual ticker node in pure typography broadcast layout (non-interactive, no links/clicks)
interface TickerItemProps {
  event: LiveEventEntry;
}

const TickerItem: React.FC<TickerItemProps> = ({ event }) => {
  return (
    <div className="flex items-center whitespace-nowrap cursor-default py-1 pr-8 sm:pr-14 shrink-0 select-none">
      {/* Pure Typography Broadcast Layout — High Density & Sleek */}
      <div className="flex flex-col justify-center gap-0.5 sm:gap-1 leading-tight">
        {/* Top: Status Label (LIVE in Magenta + ONLINE BROADCAST in black box) */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-mono font-black text-[9px] sm:text-[10px] text-[#db2777] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#db2777] inline-block shrink-0" />
            LIVE
          </span>
          <span className="text-neutral-400 text-[9px] font-bold">&</span>
          <span className="bg-black text-white px-1.5 py-0.5 text-[8px] sm:text-[9px] font-mono font-bold tracking-widest uppercase shrink-0">
            ONLINE BROADCAST
          </span>
          <span className="text-neutral-500 text-[8.5px] sm:text-[9.5px] font-mono uppercase tracking-wide">
            · {event.status}
          </span>
        </div>

        {/* Middle: Big Black Bold Display Typography + Solid Black Destination Box */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <h4 className="font-display font-black text-black text-lg sm:text-xl md:text-2xl tracking-tight uppercase leading-none">
            {event.eventName}
          </h4>
          <span className="bg-black text-white px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs font-mono font-black tracking-wider uppercase shrink-0">
            {event.destination.split(',')[0].toUpperCase()}
          </span>
        </div>

        {/* Bottom: Date & Venue Badges in compact solid black surfaces with white text */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-[9.5px] sm:text-[10.5px] font-mono font-bold uppercase">
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
        </div>
      </div>
    </div>
  );
};
