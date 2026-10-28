import React, { useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Disc
} from 'lucide-react';
import { Channel, StreamStatus } from '../types/radio';
import { audioEngine } from '../utils/audioEngine';

interface HeroRadioPlayerProps {
  isPlaying: boolean;
  streamStatus: StreamStatus;
  activeChannel: Channel;
  onTogglePlay: () => void;
  className?: string;
}

export const HeroRadioPlayer: React.FC<HeroRadioPlayerProps> = ({
  isPlaying,
  streamStatus,
  activeChannel,
  onTogglePlay,
  className = '',
}) => {
  // Permanently lock audio engine to PEAK TECHNO (138 BPM) and RAVE: ACTIVE (Volle Power)
  useEffect(() => {
    audioEngine.setPreset('peak_techno');
    audioEngine.setRavePressure(true);
  }, []);

  const isLive = isPlaying && streamStatus === 'live';
  const isBuffering = streamStatus === 'buffering';

  return (
    <div 
      id="player"
      className={`w-full bg-[#0b0b0e] border border-[#1f1f2a] p-2 sm:p-2.5 flex items-center justify-between gap-3 shadow-lg select-none ${className}`}
      aria-label="Radio Transmission Controls"
    >
      {/* Clean Single-Row Transmission Bar: CTA Button + Show Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={onTogglePlay}
          aria-label={isPlaying ? 'Pause transmission' : 'Start transmission'}
          className={`min-h-[40px] px-4 sm:px-6 py-2 font-display font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border shrink-0 ${
            isPlaying
              ? 'bg-yellow-400 border-yellow-300 text-black hover:bg-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.4)]'
              : 'bg-red-600 border-red-500 text-white hover:bg-red-500 shadow-[0_0_12px_rgba(220,38,38,0.4)]'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause size={14} className="fill-current" />
              <span>LIVE</span>
            </>
          ) : isBuffering ? (
            <>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>TUNING</span>
            </>
          ) : (
            <>
              <Play size={14} className="fill-current ml-0.5" />
              <span>START</span>
            </>
          )}
        </button>

        {/* Transmission Metadata */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5 font-mono text-[9px] sm:text-[10px] text-neutral-400 leading-tight">
            <span className={`inline-flex items-center gap-1 font-bold uppercase tracking-wider ${
              isLive ? 'text-emerald-400' : isBuffering ? 'text-amber-400' : 'text-neutral-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500' : isBuffering ? 'bg-amber-400 animate-ping' : 'bg-neutral-600'}`} />
              {isLive ? 'ON AIR' : isBuffering ? 'BUFFERING' : 'STANDBY'}
            </span>
            <span>·</span>
            <span className="text-white font-bold">{activeChannel.frequency}</span>
            <span className="hidden sm:inline">·</span>
            <span className="text-neutral-400 hidden sm:inline">{activeChannel.bitrate}</span>
          </div>

          <div className="font-display font-black text-xs sm:text-sm text-white tracking-tight uppercase truncate flex items-center gap-1 mt-0.5">
            <Disc size={11} className={`text-red-500 shrink-0 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            <span className="truncate">{activeChannel.currentShow}</span>
          </div>

          <div className="text-[9px] sm:text-[10px] font-mono text-neutral-400 truncate">
            Selector: <strong className="text-neutral-200">{activeChannel.dj}</strong>
            <span className="mx-1 text-neutral-600 hidden xs:inline">·</span>
            <span className="hidden xs:inline">{activeChannel.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
