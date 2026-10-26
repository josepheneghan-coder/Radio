import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { Channel, StreamStatus } from '../types/radio';
import { CHANNELS } from '../data/radioData';
import { audioEngine } from '../utils/audioEngine';

interface PersistentAudioPlayerProps {
  isPlaying: boolean;
  streamStatus: StreamStatus;
  onTogglePlay: () => void;
  activeChannel: Channel;
  onChangeChannel: (ch: Channel) => void;
}

export const PersistentAudioPlayer: React.FC<PersistentAudioPlayerProps> = ({
  isPlaying,
  streamStatus,
  onTogglePlay,
  activeChannel,
  onChangeChannel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [tapeSaturation, setTapeSaturation] = useState<boolean>(false);
  const [showFXDrawer, setShowFXDrawer] = useState<boolean>(false);

  // Live Canvas Audio Visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      animId = requestAnimationFrame(render);
      const data = audioEngine.getAnalyserData();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = 3;
      const gap = 2;
      const count = Math.floor(canvas.width / (barWidth + gap));

      for (let i = 0; i < count; i++) {
        const val =
          isPlaying && streamStatus !== 'buffering'
            ? data[i % data.length] || (Math.sin(Date.now() / 250 + i * 0.5) * 60 + 120)
            : streamStatus === 'buffering'
            ? Math.sin(Date.now() / 150 + i * 0.3) * 30 + 40
            : 6;

        const percent = Math.min(1, Math.max(0.04, val / 255));
        const barHeight = Math.max(2, percent * canvas.height);

        // Styling: yellow / white frequency bars
        ctx.fillStyle =
          isPlaying && streamStatus === 'live'
            ? i % 4 === 0
              ? '#FFE500'
              : '#FFFFFF'
            : streamStatus === 'buffering'
            ? '#FF9900'
            : '#333333';

        ctx.fillRect(i * (barWidth + gap), canvas.height - barHeight, barWidth, barHeight);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, streamStatus]);

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

  const triggerFX = (type: 'scratch' | 'airhorn' | 'rewind' | 'radio_drop' | 'sub_drop') => {
    audioEngine.playFX(type);
  };

  return (
    <>
      {/* Persistent Bottom Audio Player Dock with Safe Area for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#000000] text-white border-t-2 border-neutral-800 shadow-[0_-8px_24px_rgba(0,0,0,0.85)] pb-[env(safe-area-inset-bottom,0px)]">
        {/* DJ Soundboard Drawer (Collapsible) */}
        {showFXDrawer && (
          <div className="bg-[#0f0f0f] border-b border-neutral-800 px-3 md:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 font-mono text-xs animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 text-yellow-400 font-bold uppercase text-[11px]">
              <Zap size={13} />
              <span>BOOTH FX TRIGGER:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 font-ui font-bold text-[11px]">
              <button
                onClick={() => triggerFX('scratch')}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-white hover:text-black border border-neutral-700 transition-colors cursor-pointer"
              >
                SCRATCH
              </button>
              <button
                onClick={() => triggerFX('airhorn')}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-yellow-400 hover:text-black border border-neutral-700 transition-colors cursor-pointer"
              >
                AIRHORN
              </button>
              <button
                onClick={() => triggerFX('rewind')}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-red-500 hover:text-white border border-neutral-700 transition-colors cursor-pointer"
              >
                REWIND
              </button>
              <button
                onClick={() => triggerFX('sub_drop')}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-green-400 hover:text-black border border-neutral-700 transition-colors cursor-pointer"
              >
                808 SUB
              </button>
              <button
                onClick={() => triggerFX('radio_drop')}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-blue-400 hover:text-black border border-neutral-700 transition-colors cursor-pointer"
              >
                STATION ID
              </button>
            </div>

            <button
              onClick={() => setShowFXDrawer(false)}
              className="text-neutral-400 hover:text-white uppercase font-ui font-bold text-[10px] cursor-pointer"
            >
              [CLOSE]
            </button>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-3 md:px-8 py-2 md:py-3 flex items-center justify-between gap-3 md:gap-4">
          {/* Left: Prominent Thumb-Friendly Play/Pause Button (min 48x48px) + Show Metadata */}
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
            {/* Master Play Button — High-visibility, tactile, minimum 48px touch target */}
            <button
              onClick={onTogglePlay}
              aria-label={isPlaying ? 'Pause stream' : 'Play stream'}
              className={`w-12 h-12 sm:w-13 sm:h-13 rounded flex items-center justify-center shrink-0 border-2 font-ui font-black transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-yellow-400 border-yellow-300 text-black hover:bg-yellow-300'
                  : 'bg-white border-neutral-300 text-black hover:bg-neutral-200'
              }`}
            >
              {isPlaying ? (
                <Pause size={22} className="fill-current" />
              ) : (
                <Play size={22} className="fill-current ml-0.5" />
              )}
            </button>

            {/* Track / Show Info & Live Status */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-[10px] sm:text-[11px] leading-tight text-neutral-400 truncate">
                {/* Live Status indicator */}
                {isPlaying && streamStatus === 'live' ? (
                  <span className="flex items-center gap-1 text-green-400 font-bold shrink-0">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                    <span>LIVE ON AIR</span>
                  </span>
                ) : isPlaying && streamStatus === 'buffering' ? (
                  <span className="flex items-center gap-1 text-amber-400 font-bold shrink-0">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>CONNECTING...</span>
                  </span>
                ) : isPlaying && streamStatus === 'error' ? (
                  <span className="flex items-center gap-1 text-red-400 font-bold shrink-0">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span>RETRYING...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-neutral-400 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-neutral-600" />
                    <span>STANDBY</span>
                  </span>
                )}

                <span className="hidden sm:inline">·</span>
                <span className="text-yellow-400 font-bold uppercase truncate hidden xs:inline">
                  {activeChannel.frequency}
                </span>
                <span className="hidden md:inline">·</span>
                <span className="text-neutral-400 hidden lg:inline">{activeChannel.bitrate}</span>
              </div>

              {/* Show Headline with Contemporary Extended Typography */}
              <div className="font-display font-black text-xs sm:text-base text-white truncate uppercase tracking-tight leading-snug">
                {activeChannel.currentShow}
              </div>

              {/* Host & Location Metadata */}
              <div className="font-ui text-[10px] sm:text-[11px] text-neutral-300 truncate flex items-center gap-1">
                <span>Selector: <strong className="text-white">{activeChannel.dj}</strong></span>
                <span className="hidden sm:inline">·</span>
                <span className="text-neutral-400 hidden sm:inline">{activeChannel.location}</span>
                {activeChannel.relayAttribution && (
                  <span className="hidden xl:inline text-yellow-400/90 ml-1">
                    ({activeChannel.relayAttribution})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center: Live Audio Waveform Canvas (Desktop & Tablets) */}
          <div className="hidden md:flex items-center gap-3 w-44 lg:w-56 shrink-0">
            <canvas
              ref={canvasRef}
              width={160}
              height={32}
              className="w-full h-8 bg-neutral-950 border border-neutral-800 rounded"
            />
          </div>

          {/* Right: Channel Switcher, Tape Mode, Soundboard & Volume */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0 font-ui font-semibold text-xs">
            {/* Channel Select Buttons */}
            <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded p-0.5">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => onChangeChannel(ch)}
                  className={`min-h-[36px] px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-bold rounded transition-colors cursor-pointer ${
                    activeChannel.id === ch.id
                      ? 'bg-white text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title={`${ch.name} - ${ch.genre}`}
                >
                  {ch.id === 'live-relay' ? 'LIVE' : ch.id.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Tape Saturation Toggle (Hidden on narrow mobile, available on desktop) */}
            <button
              onClick={handleToggleTape}
              title="Toggle analog tape filter (lowpass warm cut)"
              className={`hidden sm:flex min-h-[36px] items-center px-2.5 py-1 border text-[11px] font-bold rounded transition-colors cursor-pointer ${
                tapeSaturation
                  ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
                  : 'border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              TAPE
            </button>

            {/* Soundboard Button */}
            <button
              onClick={() => setShowFXDrawer(!showFXDrawer)}
              aria-label="Toggle DJ soundboard"
              className={`min-h-[36px] px-2.5 py-1 border text-[11px] font-bold rounded flex items-center gap-1 transition-colors cursor-pointer ${
                showFXDrawer
                  ? 'border-white bg-white text-black'
                  : 'border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Zap size={12} />
              <span className="hidden sm:inline">FX</span>
            </button>

            {/* Volume Control / Mute */}
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-neutral-800">
              <button
                onClick={handleToggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
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
      </div>
    </>
  );
};
