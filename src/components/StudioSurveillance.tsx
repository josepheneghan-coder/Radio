import React, { useState, useEffect } from 'react';
import { Camera, RefreshCw, ListMusic } from 'lucide-react';
import { Channel, StreamStatus } from '../types/radio';
import { audioEngine } from '../utils/audioEngine';

interface StudioSurveillanceProps {
  channel: Channel;
  isPlaying: boolean;
  streamStatus?: StreamStatus;
  onOpenTracklistModal: () => void;
  className?: string;
}

const CAM_ANGLES = [
  { id: 'cam1', name: 'CAM 01: DJ TURNTABLES', desc: 'Technics 1200MK7 & Rotary Mixer' },
  { id: 'cam2', name: 'CAM 02: KIOSK INTERIOR', desc: 'Shipping Container Wide Angle' },
  { id: 'cam3', name: 'CAM 03: VINYL CRATES', desc: 'Selector Dubplate Stacks' },
];

export const StudioSurveillance: React.FC<StudioSurveillanceProps> = ({
  channel,
  isPlaying,
  streamStatus = 'standby',
  onOpenTracklistModal,
  className = '',
}) => {
  const [activeCam, setActiveCam] = useState<string>('cam1');
  const [filterMode, setFilterMode] = useState<'normal' | 'monochrome' | 'night'>('normal');
  const [isVideoGlitching, setIsVideoGlitching] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
          now.getDate()
        ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
          now.getMinutes()
        ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} CET`
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const triggerTimeoutGlitch = () => {
    setIsVideoGlitching(true);
    audioEngine.playFX('scratch');
    setTimeout(() => {
      setIsVideoGlitching(false);
    }, 1800);
  };

  const isLive = isPlaying && streamStatus === 'live';

  return (
    <div 
      id="surveillance"
      className={`w-full bg-[#0b0b0e] border border-[#1f1f2a] flex flex-col shadow-lg select-none ${className}`}
      aria-label="Studio Surveillance CCTV"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-[#0e0e12] border-b border-[#1c1c28]">
        <div className="flex items-center gap-2 min-w-0">
          <Camera size={14} className="text-red-500 shrink-0" />
          <h3 className="font-display font-black text-xs sm:text-sm uppercase tracking-tight text-white truncate">
            STUDIO SURVEILLANCE · CCTV
          </h3>
          <span className="text-[9px] font-mono text-neutral-400 hidden sm:inline uppercase pl-1 border-l border-neutral-700">
            BERLIN CONTAINER
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Cam switcher CAM1 / CAM2 / CAM3 */}
          <div className="flex items-center bg-[#101016] border border-[#222230] p-0.5 font-mono text-xs">
            {CAM_ANGLES.map((cam) => (
              <button
                key={cam.id}
                onClick={() => {
                  setActiveCam(cam.id);
                  audioEngine.playFX('scratch');
                }}
                className={`px-1.5 sm:px-2 py-0.5 transition-colors cursor-pointer text-[9px] sm:text-[10px] ${
                  activeCam === cam.id
                    ? 'bg-white text-black font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {cam.id.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Signal test button */}
          <button
            onClick={triggerTimeoutGlitch}
            title="Test video signal glitch"
            className="px-1.5 sm:px-2 py-0.5 border border-[#222230] bg-[#101016] hover:bg-[#181822] text-neutral-300 hover:text-white font-mono text-[9px] sm:text-[10px] flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw size={10} className={isVideoGlitching ? 'animate-spin' : ''} />
            <span className="hidden xs:inline">TEST</span>
          </button>
        </div>
      </div>

      {/* Video Frame */}
      <div className="relative w-full h-[220px] xs:h-[260px] sm:h-[280px] md:h-[300px] lg:h-[310px] bg-black overflow-hidden flex items-center justify-center">
        {!isVideoGlitching ? (
          <div
            className={`w-full h-full relative transition-all duration-300 ${
              filterMode === 'monochrome'
                ? 'grayscale contrast-125'
                : filterMode === 'night'
                ? 'hue-rotate-90 saturate-200 contrast-150'
                : ''
            }`}
          >
            <img
              src="/src/assets/images/techno_dj_booth_night_1793176235848.jpg"
              alt="Underground Radio DJ Booth Studio Live Feed"
              className="w-full h-full object-cover object-center"
              fetchPriority="low"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/dj_booth_live_stream_1792936491764.jpg';
              }}
            />

            {activeCam === 'cam2' && (
              <div className="absolute inset-0 bg-black/35 backdrop-blur-[0.5px] pointer-events-none" />
            )}
            {activeCam === 'cam3' && (
              <div className="absolute inset-0 scale-105 transition-transform duration-700 pointer-events-none" />
            )}

            <div className="absolute inset-0 crt-overlay pointer-events-none" />

            {/* CCTV HUD */}
            <div className="absolute top-2 left-2.5 font-mono text-[9px] sm:text-[10px] text-white/90 drop-shadow flex flex-col gap-0.5 pointer-events-none">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-red-600 shrink-0" />
                <span className="font-bold tracking-wider">REC · BERLIN KREUZBERG</span>
              </div>
              <div className="text-neutral-300 tabular-nums text-[8px] sm:text-[9px]">{currentTime}</div>
            </div>

            {/* Status Badge */}
            <div className={`absolute top-2 right-2.5 font-mono text-[9px] sm:text-[10px] px-2 py-0.5 border backdrop-blur flex items-center gap-1.5 pointer-events-none ${
              isLive
                ? 'bg-black/90 border-emerald-500/80 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                : 'bg-black/85 border-neutral-700/80 text-neutral-400'
            }`}>
              {isLive ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="font-bold tracking-wider text-emerald-400">AUDIO: LIVE</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 shrink-0" />
                  <span className="font-medium tracking-wider text-neutral-400">
                    {streamStatus === 'buffering' ? 'CONNECTING' : 'STANDBY'}
                  </span>
                </>
              )}
            </div>

            {/* Bottom bar overlay */}
            <div className="absolute bottom-2 left-2 right-2 bg-black/90 border border-neutral-700 px-2.5 py-1.5 backdrop-blur flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-1.5 h-1.5 bg-yellow-400 shrink-0" />
                <div className="font-mono text-[10px] sm:text-[11px] truncate">
                  <span className="text-neutral-400 uppercase">ON AIR: </span>
                  <strong className="text-white font-bold">{channel.currentShow}</strong>
                  <span className="text-neutral-400 hidden sm:inline"> · {channel.dj}</span>
                </div>
              </div>
              <button
                onClick={onOpenTracklistModal}
                className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 text-[9px] sm:text-[10px] font-mono text-white flex items-center gap-1 border border-neutral-600 transition-colors shrink-0 cursor-pointer"
              >
                <ListMusic size={11} />
                <span>TRACKLIST</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-black p-6 font-mono text-center">
            <span className="text-red-500 font-bold text-xs uppercase animate-pulse">
              [VIDEO SIGNAL RE-CALIBRATING · CAMERA SYNC]
            </span>
          </div>
        )}
      </div>

      {/* Filters Bar */}
      <div className="border-t border-[#1c1c28] bg-[#0c0c10] px-3 py-1.5 flex items-center justify-between font-mono text-[9px] sm:text-[10px] text-neutral-400">
        <div className="flex items-center gap-1.5">
          <span>FILTER:</span>
          <button
            onClick={() => setFilterMode('normal')}
            className={`px-1.5 py-0.5 cursor-pointer ${filterMode === 'normal' ? 'bg-white text-black font-bold' : 'hover:text-white'}`}
          >
            Raw
          </button>
          <button
            onClick={() => setFilterMode('monochrome')}
            className={`px-1.5 py-0.5 cursor-pointer ${filterMode === 'monochrome' ? 'bg-white text-black font-bold' : 'hover:text-white'}`}
          >
            B&W
          </button>
          <button
            onClick={() => setFilterMode('night')}
            className={`px-1.5 py-0.5 cursor-pointer ${filterMode === 'night' ? 'bg-emerald-400 text-black font-bold' : 'hover:text-white'}`}
          >
            Night
          </button>
        </div>
        <span className="text-neutral-400">HOLZMARKTSTR, BERLIN</span>
      </div>
    </div>
  );
};
