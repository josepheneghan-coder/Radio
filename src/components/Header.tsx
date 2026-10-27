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
  streamStatus = 'standby',
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

  const isLive = isPlaying && streamStatus === 'live';

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#000000] text-white border-b border-[#1f1f1f] px-3 sm:px-6 md:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 transition-colors overflow-x-hidden">
        {/* Zone 1: Brand Wordmark + Static Status Indicator (No Blinking, No Pulse) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => handleNavClick('top')}
            className="flex items-center gap-2 text-left group focus:outline-none focus-visible:ring-1 focus-visible:ring-white cursor-pointer"
          >
            <span className="font-display font-black text-lg sm:text-xl md:text-2xl tracking-[-0.04em] text-white group-hover:text-neutral-300 transition-colors uppercase">
              KONTROLL
            </span>
            <span className="font-mono text-[10px] md:text-[11px] tracking-widest text-neutral-400 border-l border-neutral-800 pl-2.5 hidden xs:inline uppercase">
              104.5 MHz
            </span>
          </button>

          {/* Understated Static Status Indicator (No ping, no pulse) */}
          <div className="flex items-center gap-1.5 pl-2.5 border-l border-neutral-800">
            <span
              className={`w-2 h-2 shrink-0 ${
                isLive
                  ? 'bg-red-600'
                  : streamStatus === 'buffering'
                  ? 'bg-amber-400'
                  : 'bg-neutral-600'
              }`}
            />
            <span
              className={`font-mono text-[10px] font-bold tracking-widest uppercase ${
                isLive
                  ? 'text-red-500'
                  : streamStatus === 'buffering'
                  ? 'text-amber-400'
                  : 'text-neutral-400'
              }`}
            >
              {isLive ? 'LIVE' : streamStatus === 'buffering' ? 'CONNECTING' : 'STANDBY'}
            </span>
          </div>
        </div>

        {/* Zone 2: Interface Navigation Links — Refined Editorial Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 font-ui font-semibold text-xs tracking-wider uppercase text-neutral-400">
          <button
            onClick={() => handleNavClick('booth')}
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap py-1 relative group"
          >
            <span>Live Booth</span>
            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-white group-hover:w-full transition-all duration-200" />
          </button>
          <button
            onClick={() => handleNavClick('reactor')}
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap py-1 relative group"
          >
            <span>Audio Reactor</span>
            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-red-500 group-hover:w-full transition-all duration-200" />
          </button>
          <button
            onClick={() => handleNavClick('shows')}
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap py-1 relative group"
          >
            <span>Tape Archive</span>
            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-white group-hover:w-full transition-all duration-200" />
          </button>
          <button
            onClick={() => handleNavClick('schedule')}
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap py-1 relative group"
          >
            <span>Schedule</span>
            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-white group-hover:w-full transition-all duration-200" />
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap py-1 relative group"
          >
            <span>Manifesto</span>
            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-white group-hover:w-full transition-all duration-200" />
          </button>
        </nav>

        {/* Zone 3: Quick Stream Control & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Quick Audio Mute */}
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute stream' : 'Mute stream'}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center border border-neutral-800 hover:border-neutral-500 text-neutral-300 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          {/* Primary Action Button — Architectural tactile button */}
          <button
            onClick={onTogglePlay}
            className={`min-h-[38px] sm:min-h-[40px] flex items-center gap-2 px-3.5 sm:px-4 py-2 font-ui font-bold text-xs tracking-wider uppercase transition-all cursor-pointer ${
              isPlaying
                ? 'bg-yellow-400 text-black hover:bg-yellow-300 border border-yellow-300'
                : 'bg-white text-black hover:bg-neutral-200 border border-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause size={13} className="fill-current" />
                <span className="hidden xs:inline">ON AIR</span>
              </>
            ) : (
              <>
                <Play size={13} className="fill-current" />
                <span className="hidden xs:inline">TUNE IN</span>
              </>
            )}
          </button>

          {/* Mobile Navigation Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="lg:hidden w-10 h-10 flex items-center justify-center border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors cursor-pointer shrink-0"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-Down Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-black/95 border-b border-neutral-800 px-4 py-5 font-ui font-semibold text-sm uppercase tracking-wider space-y-3 z-40 fixed top-[54px] sm:top-[57px] left-0 right-0 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => handleNavClick('booth')}
              className="text-left py-3 px-3 hover:bg-neutral-900 text-neutral-300 hover:text-white transition-colors flex items-center justify-between"
            >
              <span>Live Booth · CCTV</span>
              <span className="font-mono text-xs text-neutral-500">01</span>
            </button>
            <button
              onClick={() => handleNavClick('reactor')}
              className="text-left py-3 px-3 hover:bg-neutral-900 text-neutral-300 hover:text-white transition-colors flex items-center justify-between"
            >
              <span className="text-white font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500" />
                <span>Audio Reactor · Spectrum</span>
              </span>
              <span className="font-mono text-xs text-red-500 font-bold">DSP</span>
            </button>
            <button
              onClick={() => handleNavClick('shows')}
              className="text-left py-3 px-3 hover:bg-neutral-900 text-neutral-300 hover:text-white transition-colors flex items-center justify-between"
            >
              <span>Tape Archive · Shows</span>
              <span className="font-mono text-xs text-neutral-500">02</span>
            </button>
            <button
              onClick={() => handleNavClick('schedule')}
              className="text-left py-3 px-3 hover:bg-neutral-900 text-neutral-300 hover:text-white transition-colors flex items-center justify-between"
            >
              <span>Transmission Schedule</span>
              <span className="font-mono text-xs text-neutral-500">03</span>
            </button>
            <button
              onClick={() => handleNavClick('merch')}
              className="text-left py-3 px-3 hover:bg-neutral-900 text-neutral-300 hover:text-white transition-colors flex items-center justify-between"
            >
              <span>Station Supply & Releases</span>
              <span className="font-mono text-xs text-neutral-500">04</span>
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className="text-left py-3 px-3 hover:bg-neutral-900 text-neutral-300 hover:text-white transition-colors flex items-center justify-between"
            >
              <span>Manifesto & Architecture</span>
              <span className="font-mono text-xs text-neutral-500">05</span>
            </button>
          </div>

          <div className="pt-3 border-t border-neutral-800 flex items-center justify-between font-mono text-[11px] text-neutral-400">
            <span>BITRATE: {activeChannel.bitrate}</span>
            <span className="text-white font-bold">{activeChannel.frequency}</span>
          </div>
        </div>
      )}
    </>
  );
};
