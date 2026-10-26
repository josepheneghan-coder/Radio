import React, { useState } from 'react';
import { Volume2, VolumeX, Play, Pause, Menu, X } from 'lucide-react';
import { Channel } from '../types/radio';

interface HeaderProps {
  isPlaying: boolean;
  streamStatus?: string;
  onTogglePlay: () => void;
  activeChannel: Channel;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSoundboard: () => void;
  onNavigate: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isPlaying,
  streamStatus = 'idle',
  onTogglePlay,
  activeChannel,
  isMuted,
  onToggleMute,
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    onNavigate(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#000000] text-white border-b border-[#222222] px-3 md:px-8 py-3 flex items-center justify-between gap-4 transition-colors">
        {/* Zone 1: Single text element wordmark with live indicator */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            onClick={() => handleNavClick('hero')}
            className="flex items-center gap-2 text-left group focus:outline-none focus-visible:ring-1 focus-visible:ring-white cursor-pointer"
          >
            <span className="font-display font-black text-xl md:text-2xl tracking-tight text-white group-hover:text-yellow-400 transition-colors uppercase">
              KONTROLL
            </span>
            <span className="font-mono text-[10px] md:text-[11px] tracking-wider text-neutral-400 hidden sm:inline">
              // 104.5 FM
            </span>
          </button>

          {/* Real Live Signal Indicator */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-neutral-800">
            <span
              className={`w-2 h-2 rounded-full ${
                isPlaying && streamStatus === 'live'
                  ? 'bg-red-500 animate-ping'
                  : streamStatus === 'buffering'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-red-600'
              }`}
            />
            <span className="font-mono text-[10px] font-bold tracking-widest text-red-500 uppercase">
              {streamStatus === 'buffering' ? 'CONNECTING' : 'LIVE'}
            </span>
          </div>
        </div>

        {/* Zone 2: Interface Navigation Links with Contemporary Typography */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 font-ui font-semibold text-xs tracking-wider uppercase text-neutral-400">
          <button
            onClick={() => handleNavClick('booth')}
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap py-1"
          >
            Live Booth
          </button>
          <button
            onClick={() => handleNavClick('shows')}
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap py-1"
          >
            Shows & Mixes
          </button>
          <button
            onClick={() => handleNavClick('schedule')}
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap py-1"
          >
            Schedule
          </button>
          <button
            onClick={() => handleNavClick('merch')}
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap py-1"
          >
            Shop & Tapes
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap py-1"
          >
            Manifesto
          </button>
        </nav>

        {/* Zone 3: Quick Stream Control & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Stream info preview (desktop) */}
          <div className="hidden xl:flex flex-col text-right font-mono text-[10px] leading-tight text-neutral-400">
            <span className="text-white font-bold truncate max-w-[130px]">
              {activeChannel.currentShow}
            </span>
            <span className="text-neutral-500">{activeChannel.location}</span>
          </div>

          {/* Quick Audio Mute */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute stream' : 'Mute stream'}
            className="w-9 h-9 flex items-center justify-center border border-neutral-800 rounded hover:border-neutral-500 text-neutral-300 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          {/* Primary Play Button (Thumb-Friendly, >= 44px on mobile) */}
          <button
            onClick={onTogglePlay}
            className={`min-h-[38px] md:min-h-[36px] flex items-center gap-1.5 px-3 md:px-4 py-2 rounded font-ui font-bold text-xs tracking-wider uppercase transition-all cursor-pointer ${
              isPlaying
                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                : 'bg-white text-black hover:bg-neutral-200'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause size={13} className="fill-current" />
                <span>ON AIR</span>
              </>
            ) : (
              <>
                <Play size={13} className="fill-current" />
                <span>TUNE IN</span>
              </>
            )}
          </button>

          {/* Mobile Navigation Toggle (min 40x40px touch area) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="lg:hidden w-10 h-10 flex items-center justify-center border border-neutral-800 rounded text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-Down Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-black/95 border-b border-neutral-800 px-4 py-5 font-ui font-semibold text-sm uppercase tracking-wider space-y-3 z-40 fixed top-[57px] left-0 right-0 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => handleNavClick('booth')}
              className="text-left py-2.5 px-3 rounded hover:bg-neutral-900 text-neutral-300 hover:text-yellow-400 transition-colors"
            >
              01 // Live Booth & Studio Cam
            </button>
            <button
              onClick={() => handleNavClick('shows')}
              className="text-left py-2.5 px-3 rounded hover:bg-neutral-900 text-neutral-300 hover:text-yellow-400 transition-colors"
            >
              02 // Shows & Recent Mixes
            </button>
            <button
              onClick={() => handleNavClick('schedule')}
              className="text-left py-2.5 px-3 rounded hover:bg-neutral-900 text-neutral-300 hover:text-yellow-400 transition-colors"
            >
              03 // Transmission Schedule
            </button>
            <button
              onClick={() => handleNavClick('merch')}
              className="text-left py-2.5 px-3 rounded hover:bg-neutral-900 text-neutral-300 hover:text-yellow-400 transition-colors"
            >
              04 // Station Supply & Tapes
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className="text-left py-2.5 px-3 rounded hover:bg-neutral-900 text-neutral-300 hover:text-yellow-400 transition-colors"
            >
              05 // Manifesto & Architecture
            </button>
          </div>

          <div className="pt-3 border-t border-neutral-800 flex items-center justify-between font-mono text-[11px] text-neutral-400">
            <span>BITRATE: {activeChannel.bitrate}</span>
            <span className="text-yellow-400 font-bold">{activeChannel.frequency}</span>
          </div>
        </div>
      )}
    </>
  );
};
