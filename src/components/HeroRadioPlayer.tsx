import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Flame, 
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
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Permanently lock audio engine to PEAK TECHNO (138 BPM) and RAVE: ACTIVE (Volle Power)
  useEffect(() => {
    audioEngine.setPreset('peak_techno');
    audioEngine.setRavePressure(true);
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioEngine.setVolume(val);
    if (isMuted && val > 0) {
      setIsMuted(false);
    }
  };

  const handleToggleMute = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  const isLive = isPlaying && streamStatus === 'live';
  const isBuffering = streamStatus === 'buffering';

  return (
    <div 
      id="player"
      className={`w-full bg-[#0b0b0e] border border-[#1f1f2a] p-2.5 sm:p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-lg select-none ${className}`}
      aria-label="Radio Transmission Controls"
    >
      {/* Left: Primary Master Action Button & Show Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={onTogglePlay}
          aria-label={isPlaying ? 'Pause transmission' : 'Start transmission'}
          className={`min-h-[42px] sm:min-h-[44px] px-4 sm:px-6 py-2 font-display font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border shrink-0 ${
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
          <div className="flex items-center gap-1.5 font-mono text-[9px] sm:text-[10px] text-neutral-400">
            <span className={`inline-flex items-center gap-1 font-bold uppercase tracking-wider ${
              isLive ? 'text-emerald-400' : isBuffering ? 'text-amber-400' : 'text-neutral-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500' : isBuffering ? 'bg-amber-400 animate-ping' : 'bg-neutral-600'}`} />
              {isLive ? 'ON AIR' : isBuffering ? 'BUFFERING' : 'STANDBY'}
            </span>
            <span>·</span>
            <span className="text-white font-bold">{activeChannel.frequency}</span>
          </div>

          <div className="font-display font-black text-xs sm:text-sm text-white tracking-tight uppercase truncate flex items-center gap-1">
            <Disc size={11} className={`text-red-500 shrink-0 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            <span className="truncate">{activeChannel.currentShow}</span>
          </div>

          <div className="text-[9px] sm:text-[10px] font-mono text-neutral-400 truncate">
            Selector: <strong className="text-neutral-200">{activeChannel.dj}</strong>
          </div>
        </div>
      </div>

      {/* Right: Permanent PEAK + RAVE Status & Master Volume Control */}
      <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1a1a24]">
        {/* Permanent Peak Techno & Rave Active Status */}
        <div className="flex items-center gap-1 font-mono text-[9px] sm:text-[10px] bg-[#121218] border border-red-600/70 px-2 py-1 text-white shadow-[0_0_8px_rgba(220,38,38,0.25)]">
          <span className="px-1 py-0.2 bg-red-600 text-white font-bold text-[8px] uppercase tracking-wider">
            PEAK
          </span>
          <span className="flex items-center gap-1 text-red-400 font-bold uppercase text-[9px]">
            <Flame size={10} className="text-red-500 animate-pulse" />
            RAVE: ACTIVE
          </span>
        </div>

        {/* Volume & Mute Controls */}
        <div className="flex items-center gap-1 pl-1.5 border-l border-[#222230]">
          <button
            onClick={handleToggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="w-7 h-7 flex items-center justify-center border border-[#222230] text-neutral-300 hover:text-white bg-[#101016] transition-colors cursor-pointer"
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
            aria-label="Stream volume slider"
            className="w-14 sm:w-16 accent-red-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
