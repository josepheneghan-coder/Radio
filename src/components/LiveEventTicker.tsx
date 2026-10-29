import React from 'react';
import { LIVE_EVENTS_DATA } from '../data/liveEventsData';

interface LiveEventTickerProps {
  onNavigate?: (sectionId: string) => void;
}

export const LiveEventTicker: React.FC<LiveEventTickerProps> = React.memo(() => {
  // Retrieve events from database or fallback to canonical data
  const tulumEvent = LIVE_EVENTS_DATA.find((e) => e.id === 'ev-tlm-01') || {
    eventName: 'ZAMNA TULUM · KEINEMUSIK GATHERING',
    venue: 'Cenote Zamna Tulum',
    dateDisplay: 'JAN 08, 2026',
  };

  const berghainEvent = LIVE_EVENTS_DATA.find((e) => e.id === 'ev-ber-01') || {
    eventName: 'BERGHAIN KLUBNACHT',
    venue: 'Berghain & Panorama Bar',
    dateDisplay: 'EVERY SATURDAY 23:59',
  };

  const blackCoffeeEvent = LIVE_EVENTS_DATA.find((e) => e.id === 'ev-ibz-02') || {
    eventName: 'BLACK COFFEE HI IBIZA',
    venue: 'Hï Ibiza',
    dateDisplay: 'MAY 17 — OCT 04, 2025',
  };

  return (
    <div 
      className="w-full bg-[#ffffff] border-y border-neutral-300 text-black select-none relative z-30"
      role="region"
      aria-label="RADIO KONTROLLE Event Banner"
    >
      {/* MOBILE DISPLAY (< 768px): Strictly Tulum Live Event (Stationary, Fixed Banner) */}
      <div className="flex md:hidden items-center justify-center px-3 py-2 w-full min-h-[46px]">
        <div className="flex items-center justify-center flex-wrap gap-x-2.5 gap-y-1 text-center">
          {/* Category Tag */}
          <span className="bg-black text-[#e7fb04] text-[9px] font-mono font-bold px-1.5 py-0.5 tracking-wider uppercase shrink-0">
            TULUM
          </span>

          {/* Event Title */}
          <h4 className="font-display font-black text-black text-xs sm:text-sm tracking-tight uppercase leading-tight">
            Zamna Tulum · Keinemusik Gathering
          </h4>

          {/* Venue & Date */}
          <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase shrink-0">
            <span className="bg-black text-white px-1.5 py-0.5 shrink-0">
              Cenote Zamna
            </span>
            <span className="bg-neutral-800 text-neutral-100 px-1.5 py-0.5 shrink-0">
              JAN 08, 2026
            </span>
          </div>
        </div>
      </div>

      {/* DESKTOP DISPLAY (>= 768px): 3 Events — Tulum, Berghain Klubnacht & Black Coffee Ibiza */}
      <div className="hidden md:flex items-center justify-between gap-3 lg:gap-5 px-4 lg:px-8 py-2.5 w-full max-w-7xl mx-auto min-h-[50px]">
        {/* 1. Tulum Event */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="bg-black text-[#e7fb04] text-[9px] font-mono font-bold px-1.5 py-0.5 tracking-wider uppercase shrink-0">
            TULUM
          </span>
          <div className="flex items-center gap-2 min-w-0">
            <h4 className="font-display font-black text-black text-xs lg:text-[14px] tracking-tight uppercase truncate">
              Zamna Tulum<span className="hidden xl:inline"> · Keinemusik</span>
            </h4>
            <div className="flex items-center gap-1.5 text-[9px] lg:text-[10px] font-mono font-bold uppercase shrink-0">
              <span className="bg-black text-white px-1.5 py-0.5">
                Cenote Zamna
              </span>
              <span className="bg-neutral-800 text-neutral-100 px-1.5 py-0.5">
                JAN 08, 2026
              </span>
            </div>
          </div>
        </div>

        {/* Separator */}
        <span className="text-neutral-300 font-mono text-sm select-none shrink-0">/</span>

        {/* 2. Berghain Klubnacht Berlin */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="bg-black text-[#e7fb04] text-[9px] font-mono font-bold px-1.5 py-0.5 tracking-wider uppercase shrink-0">
            BERLIN
          </span>
          <div className="flex items-center gap-2 min-w-0">
            <h4 className="font-display font-black text-black text-xs lg:text-[14px] tracking-tight uppercase truncate">
              Berghain Klubnacht
            </h4>
            <div className="flex items-center gap-1.5 text-[9px] lg:text-[10px] font-mono font-bold uppercase shrink-0">
              <span className="bg-black text-white px-1.5 py-0.5">
                Berghain<span className="hidden xl:inline"> Berlin</span>
              </span>
              <span className="bg-neutral-800 text-neutral-100 px-1.5 py-0.5">
                EVERY SATURDAY<span className="hidden xl:inline"> · 23:59</span>
              </span>
            </div>
          </div>
        </div>

        {/* Separator */}
        <span className="text-neutral-300 font-mono text-sm select-none shrink-0">/</span>

        {/* 3. Black Coffee Hï Ibiza */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="bg-black text-[#e7fb04] text-[9px] font-mono font-bold px-1.5 py-0.5 tracking-wider uppercase shrink-0">
            IBIZA
          </span>
          <div className="flex items-center gap-2 min-w-0">
            <h4 className="font-display font-black text-black text-xs lg:text-[14px] tracking-tight uppercase truncate">
              Black Coffee Hï Ibiza
            </h4>
            <div className="flex items-center gap-1.5 text-[9px] lg:text-[10px] font-mono font-bold uppercase shrink-0">
              <span className="bg-black text-white px-1.5 py-0.5">
                Hï Ibiza
              </span>
              <span className="bg-neutral-800 text-neutral-100 px-1.5 py-0.5">
                MAY 17 — OCT 04<span className="hidden xl:inline">, 2025</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

LiveEventTicker.displayName = 'LiveEventTicker';
