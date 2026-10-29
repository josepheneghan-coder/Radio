import React from 'react';

export type ClubBadgeType = 
  | 'berghain' 
  | 'tresor' 
  | 'dc10' 
  | 'amnesia' 
  | 'pacha' 
  | 'hi' 
  | 'zamna' 
  | 'timewarp' 
  | 'awakenings' 
  | 'scorpios' 
  | 'printworks'
  | 'movement'
  | 'warung'
  | 'savaya'
  | 'sonus'
  | 'afterlife'
  | 'robotheart';

interface OfficialLogoProps {
  badge?: ClubBadgeType | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

export const OfficialEventLogo: React.FC<OfficialLogoProps> = ({ 
  badge, 
  size = 'md',
  className = '',
  showLabel = true 
}) => {
  if (!badge) return null;

  const sizeClasses = {
    sm: 'h-5 px-1.5 text-[9px]',
    md: 'h-7 sm:h-8 px-2 sm:px-2.5 text-[10px] sm:text-[11px]',
    lg: 'h-9 sm:h-10 px-3 text-xs'
  }[size];

  switch (badge.toLowerCase()) {
    case 'berghain':
      return (
        <span 
          className={`inline-flex items-center gap-1.5 bg-black border border-neutral-600 font-mono font-black tracking-widest text-white select-none shrink-0 ${sizeClasses} ${className}`}
          title="Berghain Berlin (Official Club Emblem)"
        >
          {/* Authentic Berghain Monolithic Brutalist Cross / Door Glyph */}
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10 2h4v7h7v4h-7v9h-4v-9H3v-4h7V2z" />
          </svg>
          {showLabel && <span className="font-display font-black tracking-tight text-white uppercase">BERGHAIN</span>}
        </span>
      );

    case 'tresor':
      return (
        <span 
          className={`inline-flex items-center gap-1.5 bg-[#0a0102] border border-red-600 font-mono font-bold tracking-widest text-red-500 select-none shrink-0 ${sizeClasses} ${className}`}
          title="Tresor Berlin (Official Vault 33 Emblem)"
        >
          {/* Authentic Tresor Vault Radial Safe Dial SVG */}
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-red-500 fill-none shrink-0" viewBox="0 0 24 24" strokeWidth="2.4" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="3" fill="#ef4444" />
            <path d="M12 3v4M12 17v4M3 12h4M17 12h4" strokeLinecap="square" />
          </svg>
          {showLabel && <span className="font-display font-black tracking-tight text-red-400 uppercase">TRESOR 33</span>}
        </span>
      );

    case 'dc10':
      return (
        <span 
          className={`inline-flex items-center gap-1.5 bg-[#180406] border border-red-600 font-mono font-black tracking-widest text-white select-none shrink-0 ${sizeClasses} ${className}`}
          title="DC-10 Ibiza (Official Runway Aircraft Logo)"
        >
          {/* DC-10 Aircraft Wing / Circoloco Flight Emblem */}
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-red-500 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
          </svg>
          {showLabel && <span className="font-display font-black tracking-tight text-white uppercase">DC-10 IBIZA</span>}
        </span>
      );

    case 'amnesia':
      return (
        <span 
          className={`inline-flex items-center gap-1.5 bg-[#0e0e12] border border-yellow-500 font-mono font-black tracking-widest text-yellow-300 select-none shrink-0 ${sizeClasses} ${className}`}
          title="Amnesia Ibiza (Official Pyramid Emblem)"
        >
          {/* Iconic Amnesia Pyramid Icon */}
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-none stroke-yellow-400 shrink-0" viewBox="0 0 24 24" strokeWidth="2.5" aria-hidden="true">
            <polygon points="12,2 22,21 2,21" strokeLinejoin="round" />
            <circle cx="12" cy="14" r="2.5" fill="#facc15" />
          </svg>
          {showLabel && <span className="font-display font-black tracking-tight text-yellow-300 uppercase">AMNESIA</span>}
        </span>
      );

    case 'pacha':
      return (
        <span 
          className={`inline-flex items-center gap-1.5 bg-[#0c0c10] border border-red-500 font-mono font-black tracking-widest text-white select-none shrink-0 ${sizeClasses} ${className}`}
          title="Pacha Ibiza (Official Twin Cherries Emblem)"
        >
          {/* Authentic Pacha Twin Cherries SVG */}
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            {/* Stems */}
            <path d="M12 3 C12 7, 7 9, 6.5 14 M12 3 C13 7, 17 9, 17.5 14" stroke="#22c55e" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M12 3 L15 1" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
            {/* Cherries */}
            <circle cx="7" cy="16.5" r="4.5" fill="#ef4444" />
            <circle cx="17" cy="16.5" r="4.5" fill="#ef4444" />
            {/* Gloss Highlight */}
            <circle cx="5.5" cy="15" r="1.2" fill="#ffffff" opacity="0.7" />
            <circle cx="15.5" cy="15" r="1.2" fill="#ffffff" opacity="0.7" />
          </svg>
          {showLabel && <span className="font-display font-black tracking-tight text-white uppercase">PACHA</span>}
        </span>
      );

    case 'hi':
      return (
        <span 
          className={`inline-flex items-center gap-1.5 bg-neutral-950 border border-white font-mono font-black tracking-widest text-white select-none shrink-0 ${sizeClasses} ${className}`}
          title="Hï Ibiza (Official Minimalist Monogram)"
        >
          <span className="bg-white text-black font-display font-black px-1 leading-tight text-[11px] sm:text-xs">
            HÏ
          </span>
          {showLabel && <span className="font-display font-black tracking-tight text-white uppercase">IBIZA</span>}
        </span>
      );

    case 'timewarp':
      return (
        <span 
          className={`inline-flex items-center gap-1.5 bg-[#120004] border border-red-500 font-mono font-black tracking-widest text-white select-none shrink-0 ${sizeClasses} ${className}`}
          title="Time Warp (Official Techno Grid Emblem)"
        >
          {/* Time Warp Signature Solid Red Square & Slash */}
          <span className="w-3 h-3 bg-red-600 inline-block shrink-0" />
          {showLabel && <span className="font-display font-black tracking-tight text-white uppercase">TIME WARP</span>}
        </span>
      );

    case 'awakenings':
      return (
        <span 
          className={`inline-flex items-center gap-1.5 bg-[#0a0a0f] border border-amber-400 font-mono font-black tracking-widest text-amber-300 select-none shrink-0 ${sizeClasses} ${className}`}
          title="Awakenings Festival (Official Concentric Rings Logo)"
        >
          {/* Awakenings Concentric Rings SVG */}
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-amber-400 fill-none shrink-0" viewBox="0 0 24 24" strokeWidth="2.5" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="12" cy="12" r="1.5" fill="#f59e0b" />
          </svg>
          {showLabel && <span className="font-display font-black tracking-tight text-amber-300 uppercase">AWAKENINGS</span>}
        </span>
      );

    case 'printworks':
      return (
        <span 
          className={`inline-flex items-center gap-1.5 bg-black border border-neutral-500 font-mono font-black tracking-widest text-neutral-200 select-none shrink-0 ${sizeClasses} ${className}`}
          title="Printworks London (Official Architectural Press Stamp)"
        >
          <span className="font-mono text-red-500 font-black tracking-tighter">PW</span>
          {showLabel && <span className="font-display font-black tracking-tight text-white uppercase">PRINTWORKS</span>}
        </span>
      );

    case 'zamna':
      return (
        <span 
          className={`inline-flex items-center gap-1.5 bg-[#0e0c06] border border-amber-500 font-mono font-black tracking-widest text-amber-200 select-none shrink-0 ${sizeClasses} ${className}`}
          title="Zamna Tulum (Official Cenote Wood Totem)"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-amber-400 fill-none shrink-0" viewBox="0 0 24 24" strokeWidth="2.2" aria-hidden="true">
            <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" />
            <circle cx="12" cy="12" r="3" fill="#f59e0b" />
          </svg>
          {showLabel && <span className="font-display font-black tracking-tight text-amber-200 uppercase">ZAMNA TULUM</span>}
        </span>
      );

    case 'scorpios':
      return (
        <span 
          className={`inline-flex items-center gap-1.5 bg-[#0f0e0c] border border-neutral-400 font-mono font-black tracking-widest text-amber-100 select-none shrink-0 ${sizeClasses} ${className}`}
          title="Scorpios Mykonos (Official Sun Ritual Seal)"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-300 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1l2.1-2.1M17 7l2.1-2.1" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {showLabel && <span className="font-display font-black tracking-tight text-neutral-200 uppercase">SCORPIOS</span>}
        </span>
      );

    case 'movement':
      return (
        <span 
          className={`inline-flex items-center gap-1.5 bg-[#0b0b0e] border border-cyan-400 font-mono font-black tracking-widest text-cyan-300 select-none shrink-0 ${sizeClasses} ${className}`}
          title="Movement Detroit (313 Techno Cube)"
        >
          <span className="font-mono font-black text-cyan-400 text-[10px] leading-none">313</span>
          {showLabel && <span className="font-display font-black tracking-tight text-white uppercase">MOVEMENT DETROIT</span>}
        </span>
      );

    case 'warung':
      return (
        <span 
          className={`inline-flex items-center gap-1.5 bg-[#0a0f0a] border border-emerald-500 font-mono font-black tracking-widest text-emerald-300 select-none shrink-0 ${sizeClasses} ${className}`}
          title="Warung Beach Club (Temple of Techno)"
        >
          <span className="text-emerald-400 text-xs">⛩</span>
          {showLabel && <span className="font-display font-black tracking-tight text-white uppercase">WARUNG BRAZIL</span>}
        </span>
      );

    case 'savaya':
      return (
        <span 
          className={`inline-flex items-center gap-1.5 bg-[#090b10] border border-blue-400 font-mono font-black tracking-widest text-blue-200 select-none shrink-0 ${sizeClasses} ${className}`}
          title="Savaya Bali (The Cliff Cantilever Cube)"
        >
          <span className="w-3 h-3 border border-blue-400 rotate-45 inline-block shrink-0" />
          {showLabel && <span className="font-display font-black tracking-tight text-white uppercase">SAVAYA BALI</span>}
        </span>
      );

    case 'sonus':
      return (
        <span 
          className={`inline-flex items-center gap-1.5 bg-[#080b12] border border-sky-400 font-mono font-black tracking-widest text-sky-200 select-none shrink-0 ${sizeClasses} ${className}`}
          title="Sonus Festival (Adriatic Sea Wave)"
        >
          <span className="text-sky-400 font-black text-xs leading-none">≈</span>
          {showLabel && <span className="font-display font-black tracking-tight text-white uppercase">SONUS CROATIA</span>}
        </span>
      );

    case 'afterlife':
      return (
        <span 
          className={`inline-flex items-center gap-1.5 bg-black border border-neutral-300 font-mono font-black tracking-widest text-white select-none shrink-0 ${sizeClasses} ${className}`}
          title="Afterlife (Official Falling Figure)"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="18" r="2" />
            <path d="M12 15V6M8 10l4 4 4-4" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          {showLabel && <span className="font-display font-black tracking-tight text-white uppercase">AFTERLIFE</span>}
        </span>
      );

    default:
      return (
        <span 
          className={`inline-flex items-center gap-1.5 bg-neutral-900 border border-neutral-600 font-mono font-bold tracking-widest text-neutral-300 select-none shrink-0 ${sizeClasses} ${className}`}
        >
          <span className="w-2 h-2 bg-red-500 rounded-full shrink-0" />
          {showLabel && <span className="font-display font-bold uppercase">{badge}</span>}
        </span>
      );
  }
};
