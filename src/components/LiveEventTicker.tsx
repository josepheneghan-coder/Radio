import React, { useRef } from 'react';
import { 
  LIVE_EVENTS_DATA, 
  LiveEventEntry 
} from '../data/liveEventsData';

interface LiveEventTickerProps {
  onNavigate?: (sectionId: string) => void;
}

// Component to render individual ticker node strictly focusing on event name, date, and venue
// Memoized with React.memo to prevent player audio/visualizer state changes from re-rendering ticker items
interface TickerItemProps {
  event: LiveEventEntry;
}

const TickerItem = React.memo<TickerItemProps>(({ event }) => {
  return (
    <div className="flex items-center whitespace-nowrap cursor-default py-1 pr-6 sm:pr-8 shrink-0 select-none">
      {/* BNG Logo: Hardware-composited wrapper with fixed height (h-6 sm:h-7) and translate3d(0, 0, 0) */}
      <div 
        className="mr-2.5 sm:mr-3.5 shrink-0 flex items-center justify-center"
        style={{ transform: 'translate3d(0, 0, 0)', willChange: 'transform' }}
      >
        <img 
          src="/assets/aistudio/lllogo-removebg-preview__1__14e0ee15.svg"
          alt="BNG"
          className="h-6 sm:h-7 w-auto object-contain block select-none pointer-events-none"
          loading="eager"
          decoding="async"
          width="28"
          height="28"
        />
      </div>

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
});

TickerItem.displayName = 'TickerItem';

export const LiveEventTicker: React.FC<LiveEventTickerProps> = React.memo(() => {
  const trackRef = useRef<HTMLDivElement>(null);

  // Interaction isolation: Touch events mutate animationPlayState directly on the DOM ref
  // without triggering any React state updates, re-renders, or event dispatch hitches.
  const handleTouchStart = () => {
    if (trackRef.current) {
      trackRef.current.style.animationPlayState = 'paused';
    }
  };

  const handleTouchEnd = () => {
    if (trackRef.current) {
      trackRef.current.style.animationPlayState = 'running';
    }
  };

  return (
    <div 
      className="w-full bg-[#f8f8fa] border-y border-neutral-300 text-black select-none relative z-30"
      style={{ 
        contain: 'content',
        contentVisibility: 'auto'
      }}
      role="region"
      aria-label="RADIO KONTROLLE Live Global Event Ticker"
    >
      {/* WHITE EVENT BROADCAST — GPU HARDWARE COMPOSITOR STREAM */}
      <div 
        className="banner-container relative overflow-hidden h-[48px] sm:h-[52px] md:h-[56px] min-h-[48px] sm:min-h-[52px] md:min-h-[56px] flex items-center bg-[#ffffff] cursor-default"
        style={{ 
          contain: 'strict',
          touchAction: 'pan-y'
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {/* Foreground Scrolling Content Layer (Off-Main-Thread GPU Compositor Animation) */}
        <div 
          ref={trackRef}
          className="ticker-track-css relative z-10 flex items-center shrink-0"
          style={{
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform',
            backfaceVisibility: 'hidden'
          }}
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
});

LiveEventTicker.displayName = 'LiveEventTicker';
