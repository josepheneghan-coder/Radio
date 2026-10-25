import React, { useState, useEffect } from 'react';
import { Camera, RefreshCw, Send, AlertTriangle, ListMusic, Radio } from 'lucide-react';
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
  streamStatus = 'idle',
  onTogglePlay,
  onOpenTracklistModal,
}) => {
  const [activeCam, setActiveCam] = useState<string>('cam1');
  const [filterMode, setFilterMode] = useState<'normal' | 'vhs' | 'monochrome' | 'night'>('normal');
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

  return (
    <section id="booth" className="w-full bg-[#000000] text-white py-12 px-4 md:px-8 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-yellow-400 font-mono text-xs uppercase tracking-widest mb-1">
              <Camera size={14} />
              <span>LIVE DJ BOOTH CAM // 24/7 VIDEO FEED</span>
            </div>
            <h2 className="font-display font-black text-3xl md:text-5xl tracking-tight uppercase">
              STUDIO SURVEILLANCE
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Camera angle switcher */}
            <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded p-1 font-mono text-xs">
              {CAM_ANGLES.map((cam) => (
                <button
                  key={cam.id}
                  onClick={() => {
                    setActiveCam(cam.id);
                    audioEngine.playFX('scratch');
                  }}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeCam === cam.id
                      ? 'bg-white text-black font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {cam.id.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Video Timeout Gimmick Button */}
            <button
              onClick={triggerTimeoutGlitch}
              title="Test video signal glitch gimmick"
              className="px-3 py-1.5 border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white font-mono text-xs flex items-center gap-1.5 rounded transition-colors"
            >
              <RefreshCw size={13} className={isVideoGlitching ? 'animate-spin' : ''} />
              <span>TEST TIMEOUT GLITCH</span>
            </button>
          </div>
        </div>

        {/* Video Player & DJ Booth Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Video Viewport (Col 8) */}
          <div className="lg:col-span-8 bg-[#0a0a0a] border border-neutral-800 relative overflow-hidden group">
            {/* The Video / Image Frame */}
            <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
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
                    src="/src/assets/images/dj_booth_live_stream_1792936491764.jpg"
                    alt="Underground Radio DJ Booth Live Studio"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />

                  {/* CAM Angle Subtle Transformations */}
                  {activeCam === 'cam2' && (
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[0.5px] pointer-events-none" />
                  )}
                  {activeCam === 'cam3' && (
                    <div className="absolute inset-0 scale-110 transition-transform duration-700 pointer-events-none" />
                  )}

                  {/* Scanline CRT overlay */}
                  <div className="absolute inset-0 crt-overlay pointer-events-none" />

                  {/* Retro CCTV HUD Elements */}
                  <div className="absolute top-4 left-4 font-mono text-xs text-white/90 drop-shadow flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                      <span className="font-bold tracking-wider">● REC [BERLIN CONTAINER]</span>
                    </div>
                    <div className="text-[11px] text-neutral-300">{currentTime}</div>
                    <div className="text-[10px] text-yellow-400">
                      CAM: {activeCam.toUpperCase()} · BITRATE: 320 KBPS · 104.5 MHz
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 font-mono text-[11px] text-white/80 bg-black/70 px-2.5 py-1 border border-white/20 backdrop-blur flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isPlaying && streamStatus === 'live'
                          ? 'bg-green-500 animate-ping'
                          : streamStatus === 'buffering'
                          ? 'bg-amber-400 animate-pulse'
                          : 'bg-neutral-500'
                      }`}
                    />
                    <span>
                      {isPlaying
                        ? streamStatus === 'live'
                          ? 'AUDIO: STREAMING LIVE'
                          : 'AUDIO: BUFFERING'
                        : 'AUDIO: STANDBY'}
                    </span>
                  </div>

                  {/* Active Track Overlay pill at bottom */}
                  <div className="absolute bottom-4 left-4 right-4 bg-black/90 border border-neutral-700 p-3 backdrop-blur flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-ping shrink-0" />
                      <div className="font-mono text-xs truncate">
                        <span className="text-neutral-400">NOW BROADCASTING: </span>
                        <strong className="text-white">{channel.currentShow}</strong>
                        <span className="text-neutral-400"> // {channel.dj}</span>
                        {channel.relayAttribution && (
                          <span className="text-yellow-400 text-[10px] block truncate">
                            {channel.relayAttribution}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={onOpenTracklistModal}
                      className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-white flex items-center gap-1.5 border border-neutral-600 rounded transition-colors shrink-0"
                    >
                      <ListMusic size={13} />
                      <span>TRACKLIST & ID</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* RETRO VIDEO LOAD TIMEOUT / SMPTE COLOR BARS GIMMICK */
                <div className="w-full h-full flex flex-col items-center justify-center bg-black relative p-8 font-mono">
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

                  <div className="relative z-10 bg-black/90 border-2 border-red-500 p-6 max-w-md text-center text-white sticker-shadow">
                    <div className="flex items-center justify-center gap-2 text-red-500 font-bold text-sm mb-2">
                      <AlertTriangle size={18} />
                      <span>VIDEO SIGNAL INTERRUPTED</span>
                    </div>
                    <p className="text-xs text-neutral-300 mb-3">
                      [ERROR 408: VIDEO LOAD TIMEOUT]
                      <br />
                      The container cam lost microwave handshake. Automatic telemetry re-syncing...
                    </p>
                    <div className="w-full bg-neutral-800 h-2 rounded overflow-hidden">
                      <div className="bg-red-500 h-full w-2/3 animate-pulse" />
                    </div>
                    <span className="text-[10px] text-neutral-500 mt-2 block">
                      Audio carrier remains intact on 104.5 MHz.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Video Controls bar */}
            <div className="border-t border-neutral-800 bg-neutral-950 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-neutral-400">
                <span>CAMERA FILTERS:</span>
                <button
                  onClick={() => setFilterMode('normal')}
                  className={`px-2 py-0.5 rounded ${
                    filterMode === 'normal' ? 'bg-white text-black font-bold' : 'hover:text-white'
                  }`}
                >
                  Raw
                </button>
                <button
                  onClick={() => setFilterMode('monochrome')}
                  className={`px-2 py-0.5 rounded ${
                    filterMode === 'monochrome' ? 'bg-white text-black font-bold' : 'hover:text-white'
                  }`}
                >
                  Grain B&W
                </button>
                <button
                  onClick={() => setFilterMode('night')}
                  className={`px-2 py-0.5 rounded ${
                    filterMode === 'night' ? 'bg-green-400 text-black font-bold' : 'hover:text-white'
                  }`}
                >
                  Night-Vision
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-neutral-500 text-[11px]">STUDIO: HOLZMARKTSTR, BERLIN</span>
              </div>
            </div>
          </div>

          {/* Live Studio Chat & Reaction Shoutbox (Col 4) */}
          <div className="lg:col-span-4 bg-[#0d0d0d] border border-neutral-800 flex flex-col h-[460px] lg:h-[500px]">
            {/* Chat Header */}
            <div className="border-b border-neutral-800 px-4 py-3 bg-neutral-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-bold uppercase tracking-wider text-white">STUDIO SHOUTBOX</span>
              </div>
              <span className="font-mono text-[10px] text-neutral-400">342 LISTENERS</span>
            </div>

            {/* Reactions Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
              {reactions.map((r) => (
                <div key={r.id} className="p-2.5 bg-neutral-900/80 border border-neutral-800/80 rounded">
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
                    <span className="font-bold text-yellow-400">@{r.user}</span>
                    <span>{r.timestamp}</span>
                  </div>
                  <p className="text-neutral-200 text-xs flex items-center gap-1.5">
                    <span>{r.text}</span>
                    <span className="text-sm">{r.emoji}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Send reaction form */}
            <form onSubmit={handleSendReaction} className="p-3 border-t border-neutral-800 bg-neutral-950 flex gap-2">
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Send a shout to the booth..."
                className="flex-1 bg-neutral-900 border border-neutral-700 px-3 py-1.5 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-white rounded"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-white text-black hover:bg-yellow-400 font-mono text-xs font-bold rounded transition-colors flex items-center gap-1"
              >
                <Send size={12} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
