import React, { useState, useEffect } from 'react';
import { Camera, RefreshCw, Send, AlertTriangle, ListMusic } from 'lucide-react';
import { Channel, StreamStatus } from '../types/radio';
import { audioEngine } from '../utils/audioEngine';

interface LiveBoothStreamProps {
  channel: Channel;
  isPlaying: boolean;
  streamStatus?: StreamStatus;
  onTogglePlay: () => void;
  onOpenTracklistModal: () => void;
}

interface Reaction {
  id: string;
  user: string;
  text: string;
  emoji: string;
  timestamp: string;
}

const CAM_ANGLES = [
  { id: 'cam1', name: 'CAM 01: DJ TURNTABLES', desc: 'Technics 1200MK7 & Rotary Mixer' },
  { id: 'cam2', name: 'CAM 02: KIOSK INTERIOR', desc: 'Shipping Container Wide Angle' },
  { id: 'cam3', name: 'CAM 03: VINYL CRATES', desc: 'Selector Dubplate Stacks' },
];

export const LiveBoothStream: React.FC<LiveBoothStreamProps> = ({
  channel,
  isPlaying,
  streamStatus = 'standby',
  onOpenTracklistModal,
}) => {
  const [activeCam, setActiveCam] = useState<string>('cam1');
  const [filterMode, setFilterMode] = useState<'normal' | 'monochrome' | 'night'>('normal');
  const [isVideoGlitching, setIsVideoGlitching] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [customMsg, setCustomMsg] = useState<string>('');
  const [reactions, setReactions] = useState<Reaction[]>([
    { id: 'r1', user: 'selector_99', text: 'That minimal bassline is heavy!', emoji: '⚡', timestamp: '14:52' },
    { id: 'r2', user: 'berlin_dub', text: 'Track ID on this vinyl please?', emoji: '🔊', timestamp: '14:53' },
    { id: 'r3', user: 'kaya_ldn', text: 'Container booth looking moody tonight', emoji: '🖤', timestamp: '14:54' },
  ]);

  // Realtime CCTV Clock
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

  // Video Load Timeout Easter Egg
  const triggerTimeoutGlitch = () => {
    setIsVideoGlitching(true);
    audioEngine.playFX('rewind');
    setTimeout(() => {
      setIsVideoGlitching(false);
    }, 4500);
  };

  const handleSendReaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;

    const emojis = ['⚡', '🔊', '🖤', '🔥', '📻'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    const newReaction: Reaction = {
      id: `r-${Date.now()}`,
      user: 'You',
      text: customMsg.trim(),
      emoji: randomEmoji,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setReactions((prev) => [newReaction, ...prev.slice(0, 15)]);
    setCustomMsg('');
    audioEngine.playFX('scratch');
  };

  const isLive = isPlaying && streamStatus === 'live';

  return (
    <section id="booth" className="w-full bg-[#000000] text-white pt-2 sm:pt-2.5 pb-2.5 sm:pb-3 px-3 sm:px-6 md:px-8 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto">
        {/* Section Header: Compact directly beneath header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-2.5 sm:mb-3 pb-2 sm:pb-2.5 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-neutral-400 font-mono text-[10px] sm:text-xs uppercase tracking-widest leading-none mb-1">
              <Camera size={13} className="text-red-500" />
              <span>STUDIO CAM · 24/7 DIRECT CCTV FEED</span>
            </div>
            <h2 className="font-display font-black text-lg sm:text-xl lg:text-2xl uppercase tracking-tight leading-tight">
              STUDIO SURVEILLANCE
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Camera angle switcher — Precision hardware tabs */}
            <div className="flex items-center bg-neutral-900 border border-neutral-800 p-0.5 font-ui font-semibold text-xs">
              {CAM_ANGLES.map((cam) => (
                <button
                  key={cam.id}
                  onClick={() => {
                    setActiveCam(cam.id);
                    audioEngine.playFX('scratch');
                  }}
                  className={`min-h-[28px] sm:min-h-[30px] px-2.5 sm:px-3 py-0.5 transition-colors cursor-pointer text-xs ${
                    activeCam === cam.id
                      ? 'bg-white text-black font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {cam.id.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Video Signal Test Button */}
            <button
              onClick={triggerTimeoutGlitch}
              title="Test video signal glitch gimmick"
              className="min-h-[28px] sm:min-h-[30px] px-2.5 sm:px-3 py-0.5 border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white font-ui font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw size={12} className={isVideoGlitching ? 'animate-spin' : ''} />
              <span>TEST SIGNAL</span>
            </button>
          </div>
        </div>

        {/* Video Player & DJ Booth Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
          {/* Main Video Viewport (Col 8) */}
          <div className="lg:col-span-8 bg-[#0a0a0a] border border-neutral-800 relative overflow-hidden group flex flex-col justify-between">
            {/* The Video / Image Frame */}
            <div className="relative aspect-[16/9] lg:aspect-auto lg:h-[250px] xl:h-[280px] w-full bg-black overflow-hidden flex items-center justify-center">
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
                    src="/images/dj_booth_live_stream_1792936491764.jpg"
                    alt="Underground Radio DJ Booth Live Studio"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />

                  {/* CAM Angle Subtle Transformations */}
                  {activeCam === 'cam2' && (
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[0.5px] pointer-events-none" />
                  )}
                  {activeCam === 'cam3' && (
                    <div className="absolute inset-0 scale-105 transition-transform duration-700 pointer-events-none" />
                  )}

                  {/* Scanline CRT overlay */}
                  <div className="absolute inset-0 crt-overlay pointer-events-none" />

                  {/* Retro CCTV HUD Elements — Architectural surveillance styling */}
                  <div className="absolute top-2 left-2 sm:top-2.5 sm:left-3 font-mono text-[9px] sm:text-[10px] text-white/90 drop-shadow flex flex-col gap-0.5 pointer-events-none">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-red-600 shrink-0" />
                      <span className="font-bold tracking-wider">REC · BERLIN KREUZBERG CONTAINER</span>
                    </div>
                    <div className="text-neutral-300 tabular-nums">{currentTime}</div>
                    <div className="text-neutral-400 hidden xs:block">
                      CAM: {activeCam.toUpperCase()} · BITRATE: 320 KBPS · 104.5 MHz
                    </div>
                  </div>

                  {/* Static Audio Status Badge */}
                  <div className="absolute top-2 right-2 sm:top-2.5 sm:right-3 font-mono text-[9px] sm:text-[10px] text-white/90 bg-black/85 px-2 py-0.5 border border-neutral-700/80 backdrop-blur flex items-center gap-1.5 pointer-events-none">
                    <span
                      className={`w-1.5 h-1.5 shrink-0 ${
                        isLive
                          ? 'bg-emerald-500'
                          : streamStatus === 'buffering'
                          ? 'bg-amber-400'
                          : 'bg-neutral-600'
                      }`}
                    />
                    <span>
                      {isLive
                        ? 'AUDIO: LIVE'
                        : streamStatus === 'buffering'
                        ? 'AUDIO: BUFFERING'
                        : 'AUDIO: STANDBY'}
                    </span>
                  </div>

                  {/* Active Track Overlay at bottom */}
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-2 sm:left-2 sm:right-2 bg-black/90 border border-neutral-700 px-2 sm:px-2.5 py-1 sm:py-1.5 backdrop-blur flex flex-col xs:flex-row xs:items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-1.5 h-1.5 bg-yellow-400 shrink-0" />
                      <div className="font-mono text-[10px] sm:text-[11px] truncate">
                        <span className="text-neutral-400 uppercase tracking-wider">ON AIR: </span>
                        <strong className="text-white font-bold">{channel.currentShow}</strong>
                        <span className="text-neutral-400 hidden sm:inline"> · {channel.dj}</span>
                      </div>
                    </div>
                    <button
                      onClick={onOpenTracklistModal}
                      className="self-end xs:self-auto px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 text-[10px] font-mono text-white flex items-center gap-1 border border-neutral-600 transition-colors shrink-0 cursor-pointer"
                    >
                      <ListMusic size={11} />
                      <span>TRACKLIST & ID</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* RETRO VIDEO LOAD TIMEOUT / SMPTE COLOR BARS GIMMICK */
                <div className="w-full h-full flex flex-col items-center justify-center bg-black relative p-6 font-mono">
                  {/* SMPTE Color Bars */}
                  <div className="absolute inset-0 grid grid-cols-7 opacity-85">
                    <div className="bg-[#c0c0c0]" />
                    <div className="bg-[#c0c000]" />
                    <div className="bg-[#00c0c0]" />
                    <div className="bg-[#00c000]" />
                    <div className="bg-[#c000c0]" />
                    <div className="bg-[#c00000]" />
                    <div className="bg-[#0000c0]" />
                  </div>

                  <div className="relative z-10 bg-black/95 border-2 border-red-500 p-5 sm:p-6 max-w-md text-center text-white sticker-shadow">
                    <div className="flex items-center justify-center gap-2 text-red-500 font-bold text-sm mb-2">
                      <AlertTriangle size={18} />
                      <span>VIDEO SIGNAL INTERRUPTED</span>
                    </div>
                    <p className="text-xs text-neutral-300 mb-3 leading-relaxed">
                      [ERROR 408: VIDEO LOAD TIMEOUT]
                      <br />
                      The container cam lost microwave handshake. Telemetry reconnecting...
                    </p>
                    <div className="w-full bg-neutral-800 h-2 rounded overflow-hidden">
                      <div className="bg-red-500 h-full w-2/3" />
                    </div>
                    <span className="text-[10px] text-neutral-500 mt-2 block">
                      Transmission carrier standby on 104.5 MHz.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Video Controls bar */}
            <div className="border-t border-neutral-800 bg-neutral-950 px-2.5 sm:px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] sm:text-[11px]">
              <div className="flex items-center gap-1.5 text-neutral-400">
                <span>FILTERS:</span>
                <button
                  onClick={() => setFilterMode('normal')}
                  className={`px-1.5 py-0.5 text-[10px] cursor-pointer transition-colors ${
                    filterMode === 'normal' ? 'bg-white text-black font-bold' : 'hover:text-white'
                  }`}
                >
                  Raw
                </button>
                <button
                  onClick={() => setFilterMode('monochrome')}
                  className={`px-1.5 py-0.5 text-[10px] cursor-pointer transition-colors ${
                    filterMode === 'monochrome' ? 'bg-white text-black font-bold' : 'hover:text-white'
                  }`}
                >
                  Grain B&W
                </button>
                <button
                  onClick={() => setFilterMode('night')}
                  className={`px-1.5 py-0.5 text-[10px] cursor-pointer transition-colors ${
                    filterMode === 'night' ? 'bg-emerald-400 text-black font-bold' : 'hover:text-white'
                  }`}
                >
                  Night-Vision
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-neutral-500 text-[10px] hidden sm:inline">STUDIO: HOLZMARKTSTR, BERLIN</span>
              </div>
            </div>
          </div>

          {/* Live Studio Chat & Reaction Shoutbox (Col 4) */}
          <div className="lg:col-span-4 bg-[#0d0d0d] border border-neutral-800 flex flex-col h-[280px] sm:h-[320px] lg:h-auto">
            {/* Chat Header */}
            <div className="border-b border-neutral-800 px-3 py-1.5 sm:py-2 bg-neutral-900/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <span className="w-1.5 h-1.5 bg-red-500" />
                <span className="font-bold uppercase tracking-wider text-white">DISPATCH LOG · BOOTH</span>
              </div>
              <span className="font-mono text-[9px] sm:text-[10px] text-neutral-400 tabular-nums">342 LISTENERS</span>
            </div>

            {/* Reactions Stream */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-2.5 space-y-1.5 font-mono text-[11px]">
              {reactions.map((r) => (
                <div key={r.id} className="p-1.5 sm:p-2 bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center justify-between text-[9px] text-neutral-400 mb-0.5">
                    <span className="font-bold text-white tracking-wide">{r.user}</span>
                    <span className="tabular-nums text-neutral-500">{r.timestamp}</span>
                  </div>
                  <p className="text-neutral-300 font-ui text-[11px] flex items-center gap-1 leading-snug">
                    <span>{r.text}</span>
                    <span className="text-xs">{r.emoji}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Send reaction form */}
            <form onSubmit={handleSendReaction} className="p-1.5 sm:p-2 border-t border-neutral-800 bg-neutral-950 flex gap-1.5 shrink-0">
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Send transmission to the booth..."
                className="flex-1 bg-neutral-900 border border-neutral-700 px-2.5 py-1 text-[11px] font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-white"
              />
              <button
                type="submit"
                aria-label="Send message"
                className="px-2.5 py-1 bg-white text-black hover:bg-yellow-400 font-mono text-xs font-bold transition-colors flex items-center justify-center cursor-pointer shrink-0"
              >
                <Send size={11} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
