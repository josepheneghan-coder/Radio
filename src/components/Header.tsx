import React from 'react';

interface HeaderProps {
  isPlaying?: boolean;
  streamStatus?: string;
  onTogglePlay?: () => void;
  activeChannel?: unknown;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onOpenSoundboard?: () => void;
  onNavigate?: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const handleLogoClick = () => {
    if (onNavigate) {
      onNavigate('top');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#000000] text-white border-b border-[#1a1a1f] px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 transition-colors select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Only RADIO KONTROLLE and the Logo */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 sm:gap-3.5 text-left group focus:outline-none cursor-pointer"
          aria-label="RADIO KONTROLLE Home"
        >
          <img
            src="/assets/aistudio/images_lllogo-removebg-preview_46d3cb66.png"
            alt="RADIO KONTROLLE Logo"
            className="h-8 sm:h-9 md:h-10 w-auto object-contain shrink-0 filter brightness-100 group-hover:brightness-125 transition-all drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
          />
          <span className="font-display font-black text-xl sm:text-2xl md:text-3xl tracking-tight text-white group-hover:text-neutral-200 transition-colors uppercase">
            RADIO KONTROLLE
          </span>
        </button>
      </div>
    </header>
  );
};
