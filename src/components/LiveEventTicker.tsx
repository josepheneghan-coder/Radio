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

  // Active fail-safe watchdog: Verifies that the CSS hardware marquee is running.
  // If an aggressive OS battery saver or browser setting halts CSS keyframes,
  // this automatically engages an unkillable linear motion loop so it never hangs.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let fallbackRafId: number | null = null;
    const initialX = track.getBoundingClientRect().left;

    const timer = setTimeout(() => {
      if (!track) return;
      const currentX = track.getBoundingClientRect().left;
      const computed = window.getComputedStyle(track);
      
      // If after 350ms the position has not moved, or animation is suppressed by OS:
      const isMotionHalted = Math.abs(currentX - initialX) < 1 || 
                             computed.animationPlayState !== 'running' ||
                             computed.animationDuration === '0s' ||
                             computed.animationDuration === '0.01ms';

      if (isMotionHalted) {
        track.style.setProperty('animation', 'none', 'important');
        let x = 0;
        let lastTime = performance.now();
        const halfWidth = track.scrollWidth / 2 || 1500;

        const loop = (now: number) => {
          const dt = Math.min((now - lastTime) / 1000, 0.1);
          lastTime = now;
          x -= 34 * dt;
          if (x <= -halfWidth) {
            x += halfWidth;
          }
          track.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
          fallbackRafId = requestAnimationFrame(loop);
        };
        fallbackRafId = requestAnimationFrame(loop);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      if (fallbackRafId) cancelAnimationFrame(fallbackRafId);
    };
  }, []);

  return (
    <div 
      className="w-full bg-[#f8f8fa] border-y border-neutral-300 text-black select-none relative z-30 transition-colors pointer-events-none"
      role="region"
      aria-label="RADIO KONTROLLE Live Global Event Ticker"
    >
      {/* WHITE EVENT BROADCAST — GPU HARDWARE COMPOSITOR STREAM */}
      <div 
        className="banner-container relative overflow-hidden h-[48px] sm:h-[52px] md:h-[56px] min-h-[48px] sm:min-h-[52px] md:min-h-[56px] flex items-center bg-gradient-to-r from-[#f0f0f4] via-[#ffffff] to-[#f0f0f4] cursor-default pointer-events-none"
      >
        {/* Foreground Scrolling Content Layer (Off-Main-Thread GPU Compositor Animation with Fail-Safe) */}
        <div 
          ref={trackRef}
          className="ticker-track-css relative z-10 flex items-center shrink-0 pointer-events-none"
        >
          {/* Segment 1 */}
          <div className="flex items-center shrink-0">
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
