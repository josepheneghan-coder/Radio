import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Radio,
  Sliders,
  Sparkles,
  Zap,
  Disc,
  RotateCcw,
  Volume1,
  Wifi,
  RadioTower,
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
      {/* Persistent Bottom Audio Player Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#000000] text-white border-t-2 border-neutral-800 shadow-2xl">
        {/* DJ Soundboard Drawer (Collapsible) */}
        {showFXDrawer && (
          <div className="bg-[#0f0f0f] border-b border-neutral-800 px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-2 text-yellow-400 font-bold uppercase">
              <Zap size={14} />
              <span>DJ BOOTH SOUNDBOARD FX:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => triggerFX('scratch')}
                className="px-3 py-1 bg-neutral-800 hover:bg-white hover:text-black font-bold border border-neutral-700 transition-colors"
              >
                VINYL SCRATCH
              </button>
              <button
                onClick={() => triggerFX('airhorn')}
                className="px-3 py-1 bg-neutral-800 hover:bg-yellow-400 hover:text-black font-bold border border-neutral-700 transition-colors"
              >
                RAVE AIRHORN
              </button>
              <button
                onClick={() => triggerFX('rewind')}
                className="px-3 py-1 bg-neutral-800 hover:bg-red-500 hover:text-white font-bold border border-neutral-700 transition-colors"
              >
                TURNTABLE REWIND
              </button>
              <button
                onClick={() => triggerFX('sub_drop')}
                className="px-3 py-1 bg-neutral-800 hover:bg-green-400 hover:text-black font-bold border border-neutral-700 transition-colors"
              >
                808 SUB DROP
              </button>
              <button
                onClick={() => triggerFX('radio_drop')}
                className="px-3 py-1 bg-neutral-800 hover:bg-blue-400 hover:text-black font-bold border border-neutral-700 transition-colors"
              >
                STATION ID CHIME
              </button>
            </div>

            <button
              onClick={() => setShowFXDrawer(false)}
              className="text-neutral-500 hover:text-white uppercase text-[10px]"
            >
              [CLOSE]
            </button>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Play/Pause & Now Playing Details */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Master Play Button */}
            <button
              onClick={onTogglePlay}
              aria-label={isPlaying ? 'Pause stream' : 'Play stream'}
              className={`w-12 h-12 rounded-none flex items-center justify-center shrink-0 border-2 border-black font-bold transition-all ${
                isPlaying
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                  : 'bg-white text-black hover:bg-neutral-200'
              }`}
            >
              {isPlaying ? (
                <Pause size={20} className="fill-current" />
              ) : (
                <Play size={20} className="fill-current ml-0.5" />
              )}
            </button>

            {/* Track / Show Info */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-400">
                {/* Live Status indicator */}
                {isPlaying && streamStatus === 'live' ? (
                  <span className="flex items-center gap-1 text-green-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                    <span>LIVE STREAM ON AIR</span>
                  </span>
                ) : isPlaying && streamStatus === 'buffering' ? (
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>BUFFERING STREAM...</span>
                  </span>
                ) : isPlaying && streamStatus === 'error' ? (
                  <span className="flex items-center gap-1 text-red-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span>RECONNECTING...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-neutral-400">
                    <span className="w-2 h-2 rounded-full bg-neutral-600" />
                    <span>STANDBY</span>
                  </span>
                )}

                <span>·</span>
                <span className="text-yellow-400 font-bold uppercase truncate">
                  {activeChannel.name}
                </span>
                <span>·</span>
                <span className="text-neutral-400 hidden sm:inline">{activeChannel.bitrate}</span>
              </div>

              <div className="font-display font-black text-sm md:text-base text-white truncate uppercase tracking-tight">
                {activeChannel.currentShow}
              </div>

              <div className="font-mono text-[11px] text-neutral-400 truncate flex items-center gap-1">
                <span>Selector: <strong className="text-neutral-200">{activeChannel.dj}</strong></span>
                <span>·</span>
                <span className="text-neutral-400">{activeChannel.location}</span>
                {activeChannel.relayAttribution && (
                  <span className="hidden lg:inline text-yellow-400/90 ml-1">
                    ({activeChannel.relayAttribution})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center: Live Audio Waveform Canvas */}
          <div className="flex items-center gap-3 w-full md:w-56 shrink-0">
            <canvas
              ref={canvasRef}
              width={160}
              height={32}
              className="w-full h-8 bg-neutral-950 border border-neutral-800 rounded"
            />
          </div>

          {/* Right: Channel Switcher, Tape Mode, Soundboard & Volume */}
          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto shrink-0 font-mono text-xs">
            {/* Channel Select Buttons */}
            <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded p-0.5">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => onChangeChannel(ch)}
                  className={`px-2 py-1 text-[11px] font-bold rounded transition-colors ${
                    activeChannel.id === ch.id
                      ? 'bg-white text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title={`${ch.name} - ${ch.genre}`}
                >
                  {ch.id === 'live-relay' ? 'LIVE RELAY' : ch.id.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Tape Saturation Toggle */}
            <button
              onClick={handleToggleTape}
              title="Toggle analog tape filter (lowpass warm cut)"
              className={`px-2 py-1 border text-[11px] font-bold rounded transition-colors ${
                tapeSaturation
                  ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
                  : 'border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              TAPE WARMTH
            </button>

            {/* Soundboard Button */}
            <button
              onClick={() => setShowFXDrawer(!showFXDrawer)}
              className={`px-2 py-1 border text-[11px] font-bold rounded flex items-center gap-1 transition-colors ${
                showFXDrawer
                  ? 'border-white bg-white text-black'
                  : 'border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Zap size={12} />
              <span className="hidden sm:inline">FX</span>
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
              <button
                onClick={handleToggleMute}
                className="text-neutral-400 hover:text-white transition-colors"
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
                className="w-16 md:w-20 accent-white cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
