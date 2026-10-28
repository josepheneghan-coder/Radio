import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../utils/audioEngine';

interface EqualizerVisualizerProps {
  isPlaying: boolean;
  isLive: boolean;
  className?: string;
  barCount?: number;
}

export const EqualizerVisualizer: React.FC<EqualizerVisualizerProps> = ({
  isPlaying,
  isLive,
  className = '',
  barCount = 24,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const totalBars = barCount;
      const reactor = audioEngine.getReactorData(totalBars);
      const isRave = reactor.metrics.ravePressure;

      const padding = 2;
      const totalWidth = canvas.width - padding * 2;
      const gap = 2;
      const barWidth = Math.max(2, Math.floor((totalWidth - (totalBars - 1) * gap) / totalBars));
      const totalSegments = 10;
      const segGap = 1;
      const segHeight = Math.max(1.5, Math.floor((canvas.height - 4 - (totalSegments - 1) * segGap) / totalSegments));

      for (let i = 0; i < totalBars; i++) {
        const x = padding + i * (barWidth + gap);

        if (isPlaying && isLive) {
          const val = reactor.bands[i] || 0;
          const peak = reactor.peaks[i] || 0;
          const activeSegments = Math.round(val * totalSegments);

          // Render LED segments vertically from bottom to top with club progression
          for (let s = 0; s < totalSegments; s++) {
            const segY = canvas.height - 2 - (s + 1) * (segHeight + segGap);
            const isActive = s < activeSegments;

            if (isActive) {
              if (s >= 9) {
                ctx.fillStyle = '#ff2a5f'; // Luminous hot red top
              } else if (s >= 8) {
                ctx.fillStyle = '#dc2626'; // Bold signal red
              } else if (s >= 7) {
                ctx.fillStyle = '#991b1b'; // Dark wine red
              } else if (s >= 5) {
                ctx.fillStyle = isRave ? '#f59e0b' : '#f4f4f5'; // Amber warning
              } else {
                ctx.fillStyle = i % 4 === 0 ? '#ffffff' : '#d4d4d8';
              }
              ctx.fillRect(x, segY, barWidth, segHeight);
            } else {
              // Dim slot
              ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
              ctx.fillRect(x, segY, barWidth, segHeight);
            }
          }

          // Peak marker
          if (peak > 0.06) {
            const peakSeg = Math.min(totalSegments - 1, Math.round(peak * totalSegments));
            const peakY = canvas.height - 2 - (peakSeg + 1) * (segHeight + segGap);
            ctx.fillStyle = peakSeg >= 9 ? '#ff2a5f' : peakSeg >= 7 ? '#dc2626' : '#ffffff';
            ctx.fillRect(x, peakY, barWidth, Math.max(1.5, segHeight));
          }
        } else {
          // Resting standby floor (gentle breathing wave)
          const val = reactor.bands[i] || 0.03;
          const restingHeight = Math.max(2, Math.floor(val * canvas.height * 0.4));
          const y = canvas.height - restingHeight - 2;
          ctx.fillStyle = '#27272a';
          ctx.fillRect(x, y, barWidth, restingHeight);
        }
      }

      if (isPlaying && isLive) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    if (isPlaying && isLive) {
      animId = requestAnimationFrame(render);
    }

    return () => {
      if (animId) {
        cancelAnimationFrame(animId);
      }
    };
  }, [isPlaying, isLive, barCount]);

  return (
    <div
      className={`relative flex items-center justify-center bg-[#070709] border border-neutral-800 rounded px-2 py-1 ${className}`}
      title={
        isPlaying && isLive
          ? 'RADIO KONTROLLE Realtime Spectrum Reactor · Segmented LED'
          : 'Reactor on standby'
      }
    >
      <canvas
        ref={canvasRef}
        width={180}
        height={32}
        className="w-full h-7 block"
      />
      {!isPlaying && (
        <span className="absolute inset-0 flex items-center justify-center font-mono text-[9px] tracking-wider text-neutral-600 pointer-events-none select-none uppercase">
          [SPECTRUM STANDBY]
        </span>
      )}
    </div>
  );
};
