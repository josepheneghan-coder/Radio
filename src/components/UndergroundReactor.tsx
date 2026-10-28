import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../utils/audioEngine';
import { StreamStatus } from '../types/radio';

interface UndergroundReactorProps {
  isPlaying: boolean;
  streamStatus: StreamStatus;
  onTogglePlay?: () => void;
  className?: string;
}

export const UndergroundReactor: React.FC<UndergroundReactorProps> = ({
  isPlaying,
  streamStatus,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Responsive High-DPI Canvas Rendering Loop (Strictly Pure Visualization — Zero Text/Controls)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const updateCanvasSize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const displayWidth = Math.floor(rect.width);
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
      const displayHeight = isMobile ? 180 : 220;

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Band count scales with screen width for dense club visualizer feel
    const getActiveBandCount = (): number => {
      if (typeof window === 'undefined') return 32;
      const w = window.innerWidth;
      if (w < 640) return 32;
      if (w < 1024) return 48;
      return 64;
    };

    const render = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
      const w = Math.floor(canvas.width / dpr);
      const h = Math.floor(canvas.height / dpr);

      if (w === 0 || h === 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      const numBands = getActiveBandCount();
      const reactor = audioEngine.getReactorData(numBands);

      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Deep Black / Charcoal Canvas Fill
      ctx.fillStyle = '#08080a';
      ctx.fillRect(0, 0, w, h);

      // 2. Faint, Clean Reference Grid (Pure lines — strictly NO numbers, NO dB labels)
      const topGutter = 8;
      const bottomGutter = 8;
      const leftGutter = isMobile ? 8 : 12;
      const rightGutter = isMobile ? 8 : 12;
      const plotWidth = w - leftGutter - rightGutter;
      const plotHeight = h - topGutter - bottomGutter;

      // Subtle horizontal guides
      ctx.lineWidth = 1;
      const guideRatios = [0.08, 0.22, 0.40, 0.60, 0.80];
      for (let g = 0; g < guideRatios.length; g++) {
        const y = Math.floor(topGutter + plotHeight * guideRatios[g]) + 0.5;
        ctx.strokeStyle = g === 0 ? 'rgba(255, 42, 95, 0.25)' : 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        ctx.setLineDash(g === 0 ? [4, 4] : [2, 4]);
        ctx.moveTo(leftGutter, y);
        ctx.lineTo(w - rightGutter, y);
        ctx.stroke();
      }
      ctx.setLineDash([]); // Reset line dash

      // 3. Segmented LED Bars Hierarchy
      const gap = isMobile ? 2 : (numBands >= 48 ? 2.5 : 4);
      const barWidth = Math.max(2.5, (plotWidth - (numBands - 1) * gap) / numBands);
      const isLive = isPlaying && streamStatus === 'live';
      const isRave = reactor.metrics.ravePressure;
      const totalSegments = 24;
      const segGap = 1.2;
      const segHeight = Math.max(2, (plotHeight - (totalSegments - 1) * segGap) / totalSegments);

      // 4. Render Discrete LED Segments across all frequency bands
      for (let i = 0; i < numBands; i++) {
        const x = Math.floor(leftGutter + i * (barWidth + gap));
        const val = reactor.bands[i] || 0;
        const peakVal = reactor.peaks[i] || 0;
        const isClipped = reactor.clipFlags[i];
        const activeSegments = Math.round(val * totalSegments);

        for (let s = 0; s < totalSegments; s++) {
          const segY = Math.floor(topGutter + plotHeight - (s + 1) * (segHeight + segGap));
          const isActive = s < activeSegments;

          if (isActive) {
            // Segment Color Progression (Zinc/White -> Amber -> Dark Red -> Signal Red -> Luminous Hot Red)
            if (s >= 22) {
              ctx.fillStyle = '#ff2a5f';
              if (isRave) {
                ctx.shadowColor = '#ff2a5f';
                ctx.shadowBlur = 6;
              }
            } else if (s >= 19) {
              ctx.fillStyle = '#dc2626';
              if (isRave) {
                ctx.shadowColor = '#dc2626';
                ctx.shadowBlur = 4;
              }
            } else if (s >= 16) {
              ctx.fillStyle = '#991b1b';
              ctx.shadowBlur = 0;
            } else if (s >= 12) {
              ctx.fillStyle = isRave ? '#f59e0b' : '#f4f4f5';
              ctx.shadowBlur = 0;
            } else {
              ctx.fillStyle = i % 4 === 0 ? '#ffffff' : '#d4d4d8';
              ctx.shadowBlur = 0;
            }

            ctx.fillRect(x, segY, barWidth, segHeight);
            ctx.shadowBlur = 0;
          } else {
            // Dark inactive LED segment
            ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
            ctx.fillRect(x, segY, barWidth, segHeight);
          }
        }

        // Peak Hold Marker
        if (peakVal > 0.04) {
          const peakSegmentIndex = Math.min(totalSegments - 1, Math.round(peakVal * totalSegments));
          const peakY = Math.floor(topGutter + plotHeight - (peakSegmentIndex + 1) * (segHeight + segGap));

          ctx.fillStyle = peakSegmentIndex >= 22 
            ? '#ff2a5f' 
            : peakSegmentIndex >= 19 || isClipped 
            ? '#dc2626' 
            : peakSegmentIndex >= 16 
            ? '#ef4444' 
            : '#ffffff';
          ctx.fillRect(x, peakY, barWidth, Math.max(2, segHeight * 0.95));
        }

        // Sub-bass ground glow for kick transients
        if (isLive && i < 12 && val > 0.6) {
          ctx.fillStyle = 'rgba(220, 38, 38, 0.12)';
          ctx.fillRect(x - 1, topGutter, barWidth + 2, plotHeight);
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [isPlaying, streamStatus]);

  return (
    <section
      id="reactor"
      className={`w-full bg-[#050507] text-white border-b border-[#1a1a24] py-1.5 sm:py-2 px-2 sm:px-4 md:px-6 transition-all ${className}`}
      aria-label="Hypnotic Audio Equalizer"
    >
      <div className="max-w-7xl mx-auto">
        {/* Pure Animated Equalizer Viewport — Full available width, zero text or overlays */}
        <div
          ref={containerRef}
          className="relative w-full bg-[#08080a] border border-[#1f1f2a] shadow-[inset_0_0_30px_rgba(0,0,0,0.95)] overflow-hidden"
        >
          <canvas
            ref={canvasRef}
            className="w-full block"
          />
        </div>
      </div>
    </section>
  );
};
