import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Activity,
  Flame,
  Radio,
  Sliders,
  Volume2,
  RefreshCw,
  Info,
  Maximize2,
  Minimize2,
  Play,
  Pause,
} from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { AnalysisMode, ReactorMetrics, StreamStatus } from '../types/radio';

interface UndergroundReactorProps {
  isPlaying: boolean;
  streamStatus: StreamStatus;
  onTogglePlay: () => void;
  className?: string;
}

const FREQ_LABELS = [
  { label: '30Hz', pos: 0.04 },
  { label: '63Hz', pos: 0.14 },
  { label: '125Hz', pos: 0.25 },
  { label: '250Hz', pos: 0.38 },
  { label: '500Hz', pos: 0.50 },
  { label: '1kHz', pos: 0.62 },
  { label: '2kHz', pos: 0.74 },
  { label: '4kHz', pos: 0.84 },
  { label: '8kHz', pos: 0.92 },
  { label: '16kHz', pos: 0.98 },
];

const DB_MARKS = [
  { db: '+3dB CLIP', ratio: 0.06, color: '#ff0033' },
  { db: '0dB REF', ratio: 0.18, color: '#ffffff' },
  { db: '-6dB', ratio: 0.36, color: '#71717a' },
  { db: '-12dB', ratio: 0.52, color: '#52525b' },
  { db: '-24dB', ratio: 0.70, color: '#3f3f46' },
  { db: '-36dB', ratio: 0.86, color: '#27272a' },
  { db: '-48dB NOISE', ratio: 0.98, color: '#18181b' },
];

export const UndergroundReactor: React.FC<UndergroundReactorProps> = ({
  isPlaying,
  streamStatus,
  onTogglePlay,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // User Interactive Toggles
  const [ravePressure, setRavePressure] = useState<boolean>(() => audioEngine.getRavePressure());
  const [bandResolution, setBandResolution] = useState<64 | 32>(64);
  const [decaySpeed, setDecaySpeed] = useState<'club' | 'fast'>('club');
  const [expandedView, setExpandedView] = useState<boolean>(false);
  const [showTechInfo, setShowTechInfo] = useState<boolean>(false);

  // Live Technical Metrics Readout
  const [metrics, setMetrics] = useState<ReactorMetrics>({
    bpm: 142.0,
    subDb: -48,
    midDb: -48,
    highDb: -48,
    peakDb: -48,
    ravePressure: false,
    analysisMode: 'standby',
    clipDetected: false,
  });

  // Sync Rave Pressure from AudioEngine
  useEffect(() => {
    const unsubRave = audioEngine.subscribeRave((isRave) => {
      setRavePressure(isRave);
    });
    return () => {
      unsubRave();
    };
  }, []);

  const handleToggleRave = useCallback(() => {
    const next = audioEngine.toggleRavePressure();
    setRavePressure(next);
  }, []);

  // Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastMetricUpdate = 0;

    // Responsive Canvas Resize Observer
    const updateCanvasSize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const displayWidth = Math.floor(rect.width);
      const displayHeight = expandedView ? 340 : 220;

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Number of bands adapts to screen size
    const getActiveBandCount = (): number => {
      if (typeof window === 'undefined') return 32;
      const w = window.innerWidth;
      if (w < 640) return 32;
      if (w < 1024) return bandResolution === 64 ? 48 : 32;
      return bandResolution;
    };

    const render = (time: number) => {
      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      const numBands = getActiveBandCount();
      const reactor = audioEngine.getReactorData(numBands);

      // Periodically update React state metrics (every ~120ms to save renders)
      if (time - lastMetricUpdate > 120) {
        lastMetricUpdate = time;
        setMetrics(reactor.metrics);
      }

      // 1. Clear Canvas with Deep Charcoal / Black
      ctx.fillStyle = '#08080a';
      ctx.fillRect(0, 0, w, h);

      // 2. Render Graticule / dB Grid Lines
      ctx.lineWidth = 1;
      DBMarksLoop: for (let m = 0; m < DB_MARKS.length; m++) {
        const mark = DB_MARKS[m];
        const y = Math.floor(h * mark.ratio) + 0.5;

        ctx.strokeStyle = mark.ratio <= 0.06 ? 'rgba(255, 0, 51, 0.22)' : 'rgba(255, 255, 255, 0.07)';
        ctx.beginPath();
        ctx.setLineDash(mark.ratio <= 0.06 ? [4, 4] : [2, 3]);
        ctx.moveTo(35, y);
        ctx.lineTo(w - 10, y);
        ctx.stroke();

        // Left dB scale label
        ctx.fillStyle = mark.color;
        ctx.font = '10px "IBM Plex Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(mark.db.replace(' NOISE', ''), 6, y + 3);
      }
      ctx.setLineDash([]); // Reset line dash

      // 3. Frequency Band Calculations
      const leftGutter = 42;
      const rightGutter = 14;
      const bottomGutter = 20;
      const topGutter = 12;

      const plotWidth = w - leftGutter - rightGutter;
      const plotHeight = h - topGutter - bottomGutter;

      const gap = numBands >= 48 ? 2.5 : 4;
      const barWidth = Math.max(3, (plotWidth - (numBands - 1) * gap) / numBands);
      const totalSegments = 24; // 24 vertical LED segments per bar
      const segGap = 1.5;
      const segHeight = Math.max(2, (plotHeight - (totalSegments - 1) * segGap) / totalSegments);

      const isLive = isPlaying && streamStatus === 'live';
      const isRave = reactor.metrics.ravePressure;

      // 4. Render Spectrum Bars as Discrete Segmented LED Blocks
      for (let i = 0; i < numBands; i++) {
        const x = Math.floor(leftGutter + i * (barWidth + gap));
        const val = isLive ? reactor.bands[i] : 0;
        const peakVal = isLive ? reactor.peaks[i] : 0;
        const isClipped = reactor.clipFlags[i];

        // Active segment count based on amplitude
        const activeSegments = Math.round(val * totalSegments);

        // Render LED segments vertically from bottom (segIndex 0) to top (segIndex 23)
        for (let s = 0; s < totalSegments; s++) {
          const segY = Math.floor(topGutter + plotHeight - (s + 1) * (segHeight + segGap));
          const isActive = s < activeSegments;

          if (isActive) {
            // Segment Color Hierarchy:
            // Top 3 segments (>0dB): Signal Red overload
            if (s >= 21) {
              ctx.fillStyle = '#ff0033';
              if (isRave) {
                ctx.shadowColor = '#ff0033';
                ctx.shadowBlur = 4;
              }
            }
            // Next 5 segments (-6dB to 0dB): Warm studio amber / bright white
            else if (s >= 16) {
              ctx.fillStyle = isRave ? '#f59e0b' : '#f4f4f5';
              ctx.shadowBlur = 0;
            }
            // Lower segments: Crisp industrial white / zinc
            else {
              ctx.fillStyle = i % 4 === 0 ? '#ffffff' : '#d4d4d8';
              ctx.shadowBlur = 0;
            }

            ctx.fillRect(x, segY, barWidth, segHeight);
            ctx.shadowBlur = 0; // reset
          } else {
            // Inactive dark LED segment slot
            ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
            ctx.fillRect(x, segY, barWidth, segHeight);
          }
        }

        // 5. Render Peak Hold Marker
        if (isLive && peakVal > 0.05) {
          const peakSegmentIndex = Math.min(totalSegments - 1, Math.round(peakVal * totalSegments));
          const peakY = Math.floor(topGutter + plotHeight - (peakSegmentIndex + 1) * (segHeight + segGap));

          ctx.fillStyle = peakSegmentIndex >= 21 || isClipped ? '#ff0033' : '#ffffff';
          ctx.fillRect(x, peakY, barWidth, Math.max(2, segHeight * 0.9));
        }

        // 6. Sub-bass Ground Glow for left bands during kicks
        if (isLive && i < 10 && val > 0.65) {
          ctx.fillStyle = 'rgba(255, 0, 51, 0.12)';
          ctx.fillRect(x - 1, topGutter, barWidth + 2, plotHeight);
        }
      }

      // 7. Render Bottom Frequency Labels
      ctx.font = '9px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      for (let f = 0; f < FREQ_LABELS.length; f++) {
        const item = FREQ_LABELS[f];
        const freqX = leftGutter + item.pos * plotWidth;
        ctx.fillStyle = '#71717a';
        ctx.fillText(item.label, freqX, h - 5);

        // Tiny tick mark
        ctx.strokeStyle = '#3f3f46';
        ctx.beginPath();
        ctx.moveTo(freqX, topGutter + plotHeight + 1);
        ctx.lineTo(freqX, topGutter + plotHeight + 4);
        ctx.stroke();
      }

      // 8. Standby Watermark when not transmitting
      if (!isLive) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.font = '11px "IBM Plex Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(
          streamStatus === 'buffering'
            ? '[CONNECTING TO LIVE TRANSMISSION BUS...]'
            : '[SPECTRUM STANDBY // TRANSMITTER READY 104.5 MHz]',
          w / 2,
          h / 2
        );
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [isPlaying, streamStatus, bandResolution, expandedView]);

  const isLive = isPlaying && streamStatus === 'live';

  return (
    <section
      id="reactor"
      className={`w-full bg-[#050507] text-white border-y border-neutral-800 py-8 px-3 sm:px-6 md:px-8 transition-all ${className}`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Hardware Control Top Bar */}
        <div className="bg-[#0b0b0e] border border-neutral-800 p-3 sm:p-4 mb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Rack Title & Status Indicator */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-neutral-900 border border-neutral-700 flex items-center justify-center shrink-0">
              <Activity size={18} className={isLive ? 'text-red-500 animate-pulse' : 'text-neutral-500'} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 font-mono text-[10px] tracking-wider text-neutral-400">
                <span className="uppercase text-white font-bold">RACK 01 · MASTER DSP</span>
                <span>·</span>
                {/* Live Analysis Mode Indicator */}
                {metrics.analysisMode === 'dsp' ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span>LIVE DSP TAP (2048 FFT)</span>
                  </span>
                ) : metrics.analysisMode === 'modeled' ? (
                  <span
                    className="text-amber-400 font-bold flex items-center gap-1"
                    title="Audio stream lacks permissive CORS headers; running dedicated Berlin Underground acoustic synthesis reactor"
                  >
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                    <span>CORS RESTRICTED · FALLBACK ACOUSTIC ENGINE</span>
                  </span>
                ) : (
                  <span className="text-neutral-500">STANDBY // SENSING CARRIER</span>
                )}
              </div>

              <h2 className="font-display font-black text-lg sm:text-xl tracking-tight uppercase truncate">
                UNDERGROUND AUDIO REACTOR
              </h2>
            </div>
          </div>

          {/* Interactive Hardware Switches (RAVE PRESSURE, Bands, View) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* RAVE PRESSURE Mode Toggle — Core Requirement */}
            <button
              onClick={handleToggleRave}
              title="RAVE PRESSURE: Escalates visual dynamic range, transient attack and red clip saturation. (Audio volume remains strictly unchanged at 0dB)."
              className={`min-h-[36px] sm:min-h-[38px] px-3.5 py-1.5 font-mono text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                ravePressure
                  ? 'bg-red-600 border-red-500 text-white shadow-[0_0_14px_rgba(255,0,51,0.5)]'
                  : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500'
              }`}
            >
              <Flame size={14} className={ravePressure ? 'animate-bounce' : 'text-red-500'} />
              <span>RAVE PRESSURE:</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${ravePressure ? 'bg-black text-red-400' : 'bg-neutral-800 text-neutral-400'}`}>
                {ravePressure ? 'ACTIVE' : 'OFF'}
              </span>
            </button>

            {/* Band Resolution Toggle (64 vs 32) */}
            <div className="hidden sm:flex items-center bg-neutral-900 border border-neutral-800 p-0.5 font-mono text-[11px]">
              <button
                onClick={() => setBandResolution(64)}
                className={`px-2.5 py-1 font-bold cursor-pointer transition-colors ${
                  bandResolution === 64 ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                64 BANDS
              </button>
              <button
                onClick={() => setBandResolution(32)}
                className={`px-2.5 py-1 font-bold cursor-pointer transition-colors ${
                  bandResolution === 32 ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                32 BANDS
              </button>
            </div>

            {/* Technical Info Drawer Toggle */}
            <button
              onClick={() => setShowTechInfo(!showTechInfo)}
              title="Toggle DSP technical routing notes"
              className={`w-9 h-9 sm:w-9 sm:h-9 flex items-center justify-center border font-mono text-xs transition-colors cursor-pointer ${
                showTechInfo
                  ? 'bg-white text-black border-white'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border-neutral-700'
              }`}
            >
              <Info size={14} />
            </button>

            {/* Expand / Minimize View Toggle */}
            <button
              onClick={() => setExpandedView(!expandedView)}
              title={expandedView ? 'Compress reactor height' : 'Expand reactor viewport'}
              className="w-9 h-9 sm:w-9 sm:h-9 flex items-center justify-center border border-neutral-700 bg-neutral-900 hover:text-white text-neutral-400 transition-colors cursor-pointer"
            >
              {expandedView ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>

            {/* Tune in / Stop Quick Button */}
            <button
              onClick={onTogglePlay}
              className={`min-h-[36px] sm:min-h-[38px] px-3.5 py-1.5 font-ui font-bold text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
                isPlaying
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                  : 'bg-white text-black hover:bg-neutral-200'
              }`}
            >
              {isPlaying ? <Pause size={13} className="fill-current" /> : <Play size={13} className="fill-current" />}
              <span>{isPlaying ? 'PAUSE' : 'REACT'}</span>
            </button>
          </div>
        </div>

        {/* Technical Architecture Notes Dropdown (When toggled) */}
        {showTechInfo && (
          <div className="bg-[#101014] border border-neutral-800 p-4 mb-3 font-mono text-xs text-neutral-300 space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-white font-bold pb-2 border-b border-neutral-800">
              <span className="flex items-center gap-2">
                <Radio size={14} className="text-red-500" />
                <span>DSP ROUTING & CROSS-ORIGIN ARCHITECTURE SPEC</span>
              </span>
              <span className="text-[10px] text-neutral-500">[KONTROLL_AUDIO_CORE_v2]</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] leading-relaxed pt-1">
              <div>
                <strong className="text-white">STREAM CONTINUITY FIRST:</strong>
                <p className="text-neutral-400 mt-0.5">
                  Remote Icecast and Shoutcast MP3 radio streams enforce CORS restrictions in browsers. Rather than
                  risking audio dropouts or failed connections with speculative cross-origin flags, the player guarantees
                  uninterrupted high-fidelity audio playback.
                </p>
              </div>
              <div>
                <strong className="text-white">ACOUSTIC FREQUENCY SYNTHESIZER:</strong>
                <p className="text-neutral-400 mt-0.5">
                  When CORS restricts direct FFT inspection, the reactor engages an authentic 142 BPM Industrial
                  Techno & Schranz kinetic acoustic model: heavy 4-on-the-floor sub-bass inertia (30-80Hz), industrial
                  mid clatter (250-2kHz), and agile 16th hats (4-16kHz).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* The Main Reactor Screen Container */}
        <div
          ref={containerRef}
          className="relative bg-black border border-neutral-800 shadow-[inset_0_0_30px_rgba(0,0,0,0.9)] overflow-hidden"
        >
          {/* Canvas Viewport */}
          <canvas
            ref={canvasRef}
            className="w-full block"
          />

          {/* Top-Right HUD Badge: Overload & Dynamic Status */}
          <div className="absolute top-2.5 right-3 flex items-center gap-2 font-mono text-[10px] pointer-events-none select-none">
            {metrics.clipDetected && (
              <span className="bg-red-600/90 text-white font-bold px-2 py-0.5 border border-red-400 tracking-wider animate-pulse">
                CLIP +3dB
              </span>
            )}
            {ravePressure && (
              <span className="bg-black/80 text-red-400 border border-red-600/60 px-2 py-0.5 font-bold tracking-widest uppercase">
                PRESSURE BOOST ACTIVE
              </span>
            )}
          </div>
        </div>

        {/* Realtime Telemetry Strip Below Reactor */}
        <div className="bg-[#0b0b0e] border-x border-b border-neutral-800 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] sm:text-[11px] text-neutral-400">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500">SUB (30-120Hz):</span>
              <span className={`font-bold tabular-nums ${metrics.subDb > -12 ? 'text-white' : 'text-neutral-400'}`}>
                {metrics.subDb > -48 ? `${metrics.subDb} dB` : '-INF'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500">MIDS (250-2kHz):</span>
              <span className={`font-bold tabular-nums ${metrics.midDb > -18 ? 'text-white' : 'text-neutral-400'}`}>
                {metrics.midDb > -48 ? `${metrics.midDb} dB` : '-INF'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500">HIGHS (4-16kHz):</span>
              <span className={`font-bold tabular-nums ${metrics.highDb > -24 ? 'text-white' : 'text-neutral-400'}`}>
                {metrics.highDb > -48 ? `${metrics.highDb} dB` : '-INF'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500">PEAK:</span>
              <span
                className={`font-bold tabular-nums ${
                  metrics.peakDb >= 0 ? 'text-red-500' : metrics.peakDb > -6 ? 'text-amber-400' : 'text-white'
                }`}
              >
                {metrics.peakDb > -48 ? `${metrics.peakDb >= 0 ? '+' : ''}${metrics.peakDb} dB` : '-INF'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-neutral-500 text-[10px]">
            <span>TEMPO: <strong className="text-white tabular-nums">{metrics.bpm.toFixed(1)} BPM</strong></span>
            <span>·</span>
            <span>PROFILE: <strong className="text-white">BERLIN INDUSTRIAL TECHNO</strong></span>
          </div>
        </div>
      </div>
    </section>
  );
};
