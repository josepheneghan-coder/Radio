import React from 'react';
import { Volume2, VolumeX, Play, Pause, Radio } from 'lucide-react';
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
  return (
    <header className="sticky top-0 z-50 bg-[#000000] text-white border-b border-[#222222] px-4 md:px-8 py-3.5 flex items-center justify-between gap-6 transition-colors">
      {/* Zone 1: Single text element wordmark with live indicator */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onNavigate('hero')}
          className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
        >
          <span className="font-display font-black text-xl md:text-2xl tracking-tighter text-white group-hover:text-yellow-400 transition-colors uppercase">
            KONTROLL
          </span>
          <span className="font-mono text-[11px] tracking-wider text-neutral-400 hidden sm:inline">
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
            {streamStatus === 'buffering' ? 'CONNECTING...' : 'LIVE'}
          </span>
        </div>
      </div>

      {/* Zone 2: Concise single-line navigation links */}
      <nav className="hidden lg:flex items-center gap-7 text-xs font-mono uppercase tracking-wider text-neutral-400">
        <button
          onClick={() => onNavigate('booth')}
          className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
        >
          Live Booth
        </button>
        <button
          onClick={() => onNavigate('shows')}
          className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
        >
          Shows & Mixes
        </button>
        <button
          onClick={() => onNavigate('schedule')}
          className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
        >
          Schedule
        </button>
        <button
          onClick={() => onNavigate('merch')}
          className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
        >
          Shop & Tapes
        </button>
        <button
          onClick={() => onNavigate('about')}
          className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
        >
          Manifesto
        </button>
      </nav>

      {/* Zone 3: 1 primary action & Quick Stream Control */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Stream info preview */}
        <div className="hidden md:flex flex-col text-right font-mono text-[10px] leading-tight text-neutral-400">
          <span className="text-white font-bold truncate max-w-[140px]">
            {activeChannel.currentShow}
          </span>
          <span className="text-neutral-500">{activeChannel.location}</span>
        </div>

        {/* Quick Audio Mute */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute stream' : 'Mute stream'}
          className="p-2 border border-neutral-800 rounded hover:border-neutral-500 text-neutral-300 hover:text-white transition-colors"
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>

        {/* Primary Play Button */}
        <button
          onClick={onTogglePlay}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded font-mono text-xs font-bold transition-all ${
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
      </div>
    </header>
  );
};
