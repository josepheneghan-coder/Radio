import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Zap,
  Radio,
  Sliders,
  AlertCircle,
  Flame,
} from 'lucide-react';
import { Channel, StreamStatus, EqualizerPresetId } from '../types/radio';
import { CHANNELS } from '../data/radioData';
import { audioEngine } from '../utils/audioEngine';
import { EqualizerVisualizer } from './EqualizerVisualizer';

interface PersistentAudioPlayerProps {
  isPlaying: boolean;
  streamStatus: StreamStatus;
  statusMessage?: string;
  onTogglePlay: () => void;
  activeChannel: Channel;
  onChangeChannel: (ch: Channel) => void;
}

export const PersistentAudioPlayer: React.FC<PersistentAudioPlayerProps> = ({
  isPlaying,
  streamStatus,
  statusMessage,
  onTogglePlay,
  activeChannel,
  onChangeChannel,
}) => {
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [tapeSaturation, setTapeSaturation] = useState<boolean>(false);
  const [ravePressure, setRavePressure] = useState<boolean>(() => audioEngine.getRavePressure());
  const [activePreset, setActivePreset] = useState<EqualizerPresetId>(() => audioEngine.getPreset());
  const [offlineToast, setOfflineToast] = useState<string | null>(null);

  useEffect(() => {
    const unsubRave = audioEngine.subscribeRave((isRave) => {
      setRavePressure(isRave);
    });
    const unsubPreset = audioEngine.subscribePreset((p) => {
      setActivePreset(p);
    });
    return () => {
      unsubRave();
      unsubPreset();
    };
  }, []);

  const handleToggleRave = () => {
    const next = audioEngine.toggleRavePressure();
    setRavePressure(next);
  };

  const handleSelectPreset = (preset: EqualizerPresetId) => {
    audioEngine.setPreset(preset);
  };

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

  const handleToggleTape = () => {
    const active = audioEngine.toggleTapeSaturation();
    setTapeSaturation(active);
  };

  const handlePlayClick = () => {
    if (!activeChannel.streamUrl && !isPlaying) {
      setOfflineToast('SIGNAL OFFLINE · TRANSMISSION NOT CONFIGURED');
      setTimeout(() => setOfflineToast(null), 4000);
    }
    onTogglePlay();
  };

  const isLive = isPlaying && streamStatus === 'live';

  return (
    <>
      {/* Offline Toast Notification when URL is empty */}
      {offlineToast && (
        <div className="fixed bottom-24 sm:bottom-20 left-1/2 -translate-x-1/2 z-50 bg-black text-white border-2 border-red-600 px-4 py-2.5 font-mono text-xs flex items-center gap-2.5 shadow-2xl max-w-[90vw]">
          <AlertCircle size={16} className="text-red-500 shrink-0" />
          <span>{offlineToast}</span>
          <button
            onClick={() => setOfflineToast(null)}
            className="text-neutral-400 hover:text-white text-[10px] uppercase ml-2"
          >
            [DISMISS]
          </button>
        </div>
      )}

      {/* Persistent Bottom Audio Player Dock with Safe Area for Mobile */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-[#000000] text-white border-t border-neutral-800 shadow-[0_-8px_24px_rgba(0,0,0,0.85)] pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]">
        <div className="max-w-7xl mx-auto px-3 md:px-8 py-2 sm:py-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4">
          {/* Top Row on Mobile: Master Play Button + Channel/Show Info + Mute */}
          <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-4 min-w-0 flex-1">
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
              {/* Master Play Button — Tactile hardware button */}
              <button
                onClick={handlePlayClick}
                aria-label={isPlaying ? 'Pause stream' : 'Play stream'}
                className={`w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center shrink-0 border font-ui font-black transition-all cursor-pointer ${
                  isPlaying
                    ? 'bg-yellow-400 border-yellow-300 text-black hover:bg-yellow-300'
                    : 'bg-white border-white text-black hover:bg-neutral-200'
                }`}
              >
                {isPlaying ? (
                  <Pause size={18} className="fill-current" />
                ) : (
                  <Play size={18} className="fill-current ml-0.5" />
                )}
              </button>

              {/* Transmission Metadata & Static Status Indicator */}
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-[10px] sm:text-[11px] leading-tight text-neutral-400 truncate">
                  {/* Understated Static Status Indicator */}
                  {isLive ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold shrink-0">
                      <span className="w-1.5 h-1.5 bg-emerald-500" />
                      <span>LIVE FEED</span>
                    </span>
                  ) : streamStatus === 'buffering' ? (
                    <span className="flex items-center gap-1.5 text-amber-400 font-bold shrink-0">
                      <span className="w-1.5 h-1.5 bg-amber-400" />
                      <span>CONNECTING</span>
                    </span>
                  ) : streamStatus === 'offline' ? (
                    <span className="flex items-center gap-1.5 text-neutral-400 font-bold shrink-0">
                      <span className="w-1.5 h-1.5 bg-red-600" />
                      <span>OFFLINE</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-neutral-400 shrink-0">
                      <span className="w-1.5 h-1.5 bg-neutral-600" />
                      <span>STANDBY</span>
                    </span>
                  )}

                  <span>·</span>
                  <span className="text-white font-bold uppercase truncate">
                    {activeChannel.frequency}
                  </span>
                  <span className="hidden md:inline">·</span>
                  <span className="text-neutral-400 hidden lg:inline">{activeChannel.bitrate}</span>
                </div>

                {/* Show Title */}
                <div className="font-display font-black text-xs sm:text-sm text-white truncate uppercase tracking-tight leading-snug">
                  {activeChannel.currentShow}
                </div>

                {/* DJ Selector & Location */}
                <div className="font-ui text-[10px] sm:text-[11px] text-neutral-300 truncate">
                  <span>Selector: <strong className="text-white">{activeChannel.dj}</strong></span>
                  <span className="text-neutral-500 mx-1">·</span>
                  <span className="text-neutral-400">{activeChannel.location}</span>
                </div>
              </div>
            </div>

            {/* Quick Mute on Mobile */}
            <div className="flex sm:hidden items-center shrink-0">
              <button
                onClick={handleToggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                className="w-10 h-10 flex items-center justify-center border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>
          </div>

          {/* Center: 24-Bar Equalizer Visualizer (Hidden on narrow mobile, visible >= md) */}
          <div className="hidden md:flex items-center gap-3 w-44 lg:w-52 shrink-0">
            <EqualizerVisualizer isPlaying={isPlaying} isLive={isLive} barCount={24} />
          </div>

          {/* Right Controls: MAIN Channel, 3 EQ Presets, RAVE, Desktop Volume */}
          <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2.5 shrink-0 font-ui font-semibold text-xs border-t border-neutral-900 sm:border-0 pt-1 sm:pt-0">
            {/* Primary MAIN Channel Indicator */}
            <div className="flex items-center bg-neutral-900 border border-neutral-800 p-0.5">
              <span className="px-2.5 py-1 text-[10px] sm:text-[11px] font-bold bg-white text-black">
                MAIN
              </span>
            </div>

            {/* 3 Authentic Sound / Equalizer Presets */}
            <div className="flex items-center bg-neutral-900 border border-neutral-800 p-0.5 font-mono text-[10px]">
              <button
                onClick={() => handleSelectPreset('deep_house')}
                title="PRESET 01: Deep House (122 BPM) — Warm deep bass, soft rolling dynamics"
                className={`min-h-[30px] sm:min-h-[32px] px-2 sm:px-2.5 py-1 font-bold transition-colors cursor-pointer ${
                  activePreset === 'deep_house'
                    ? 'bg-neutral-200 text-black font-extrabold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                DEEP
              </button>
              <button
                onClick={() => handleSelectPreset('tech_house')}
                title="PRESET 02: Tech House (126 BPM) — Punchy 4/4 kick, snappy driving groove"
                className={`min-h-[30px] sm:min-h-[32px] px-2 sm:px-2.5 py-1 font-bold transition-colors cursor-pointer ${
                  activePreset === 'tech_house'
                    ? 'bg-neutral-200 text-black font-extrabold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                TECH
              </button>
              <button
                onClick={() => handleSelectPreset('peak_techno')}
                title="PRESET 03: Peak Techno (138 BPM) — Heavy attack, maximum peaks, intense red tips"
                className={`min-h-[30px] sm:min-h-[32px] px-2 sm:px-2.5 py-1 font-bold transition-colors cursor-pointer ${
                  activePreset === 'peak_techno'
                    ? 'bg-red-600 text-white font-extrabold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                PEAK
              </button>
            </div>

            {/* RAVE Pressure Toggle (Visual dynamic transient booster) */}
            <button
              onClick={handleToggleRave}
              title="Toggle RAVE PRESSURE visual dynamics (Audio 0dB output remains strictly untouched)"
              className={`min-h-[30px] sm:min-h-[32px] px-2.5 sm:px-3 py-1 border text-[10px] sm:text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                ravePressure
                  ? 'border-red-500 bg-red-600 text-white shadow-[0_0_10px_rgba(255,42,95,0.5)]'
                  : 'border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Flame size={12} className={ravePressure ? 'text-white animate-pulse' : 'text-red-500'} />
              <span>RAVE</span>
            </button>

            {/* Tape Filter Toggle */}
            <button
              onClick={handleToggleTape}
              title="Toggle analog tape warmth filter (gentle high roll-off)"
              className={`hidden sm:flex min-h-[30px] sm:min-h-[32px] items-center px-2.5 sm:px-3 py-1 border text-[10px] sm:text-[11px] font-bold transition-colors cursor-pointer ${
                tapeSaturation
                  ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
                  : 'border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              TAPE
            </button>

            {/* Volume Control / Mute (Desktop) */}
            <div className="hidden sm:flex items-center gap-1.5 pl-1.5 border-l border-neutral-800">
              <button
                onClick={handleToggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                aria-label="Stream volume"
                className="hidden lg:block w-16 xl:w-20 accent-white cursor-pointer"
              />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
