import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Flame } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

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

export const Header: React.FC<HeaderProps> = ({
  isMuted: propIsMuted,
  onToggleMute: propOnToggleMute,
  onNavigate,
}) => {
  const [volume, setVolume] = useState<number>(() => audioEngine.getVolume());
  const [isMuted, setIsMuted] = useState<boolean>(() => propIsMuted ?? audioEngine.getIsMuted());

  useEffect(() => {
    if (propIsMuted !== undefined) {
      setIsMuted(propIsMuted);
    }
  }, [propIsMuted]);

  const handleLogoClick = () => {
    if (onNavigate) {
      onNavigate('top');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleToggleMute = () => {
    if (propOnToggleMute) {
      propOnToggleMute();
    } else {
      const muted = audioEngine.toggleMute();
      setIsMuted(muted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioEngine.setVolume(val);
    if (isMuted && val > 0) {
      setIsMuted(false);
      audioEngine.toggleMute();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#000000] text-white border-b border-[#1a1a1f] px-3 sm:px-6 md:px-8 py-2 sm:py-2.5 transition-colors select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* 1. Left: Optimized Logo Icon & Scaled Typography */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer shrink-0"
          aria-label="RADIO KONTROLLE Home"
        >
          <img
            src="/assets/aistudio/images_lllogo-removebg-preview_46d3cb66.png"
            alt="Radio Kontrolle Icon"
            className="w-6 h-6 sm:w-7 sm:h-7 object-contain shrink-0 filter brightness-100 group-hover:brightness-125 transition-all drop-shadow-[0_0_8px_rgba(255,255,255,0.25)]"
          />
          <span className="text-base sm:text-lg md:text-xl font-bold tracking-wider text-white uppercase font-mono group-hover:text-neutral-200 transition-colors">
            RADIO KONTROLLE
          </span>
        </button>

        {/* 2. Right: Relocated Status (PEAK / RAVE: ACTIVE) & Audio Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Status Pill: PEAK & RAVE ACTIVE */}
          <div className="flex items-center gap-1 font-mono text-[9px] sm:text-[10px] bg-[#101016] border border-red-600/70 px-2 py-0.5 sm:py-1 text-white shadow-[0_0_8px_rgba(220,38,38,0.25)]">
            <span className="px-1 py-0.2 bg-red-600 text-white font-bold text-[8px] uppercase tracking-wider">
              PEAK
            </span>
            <span className="flex items-center gap-1 text-red-400 font-bold uppercase text-[9px] sm:text-[10px]">
              <Flame size={11} className="text-red-500 animate-pulse" />
              <span className="hidden xs:inline">RAVE:</span> ACTIVE
            </span>
          </div>

          {/* Audio Mute & Volume Control */}
          <div className="flex items-center gap-1.5 pl-1.5 border-l border-[#222230]">
            <button
              onClick={handleToggleMute}
              aria-label={isMuted ? 'Unmute stream' : 'Mute stream'}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border border-[#222230] text-neutral-300 hover:text-white bg-[#101016] transition-colors cursor-pointer shrink-0"
            >
              {isMuted || volume === 0 ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              aria-label="Master volume slider"
              className="hidden sm:block w-16 lg:w-20 accent-red-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
