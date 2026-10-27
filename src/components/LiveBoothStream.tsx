import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, Send, AlertTriangle, ListMusic, Users, ArrowDown } from 'lucide-react';
import { Channel, StreamStatus } from '../types/radio';
import { audioEngine } from '../utils/audioEngine';
import { CLUB_DISPATCH_COMMENTS, PresetComment } from '../data/clubComments';

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
  emoji?: string;
  city?: string;
  timestamp: string;
  isOwn?: boolean;
}

const CAM_ANGLES = [
  { id: 'cam1', name: 'CAM 01: DJ TURNTABLES', desc: 'Technics 1200MK7 & Rotary Mixer' },
  { id: 'cam2', name: 'CAM 02: KIOSK INTERIOR', desc: 'Shipping Container Wide Angle' },
  { id: 'cam3', name: 'CAM 03: VINYL CRATES', desc: 'Selector Dubplate Stacks' },
];

/**
 * Modern Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate a realistic initial chat history with staggered timestamps leading to now
 */
function generateInitialChatSession(): {
  history: Reaction[];
  lastUser: string;
  remainingPool: PresetComment[];
} {
  const shuffled = shuffleArray(CLUB_DISPATCH_COMMENTS);
  const initialCount = 14;
  const initialSlice = shuffled.slice(0, initialCount);
  const remaining = shuffled.slice(initialCount);
  const now = Date.now();

  const history: Reaction[] = initialSlice.map((item, idx) => {
    // Stagger timestamps backwards from ~7 minutes ago up to now
    const timeOffsetMs = (initialCount - idx) * 31000 + Math.floor(Math.random() * 6000);
    const date = new Date(now - timeOffsetMs);
    const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    return {
      id: `init-${idx}-${date.getTime()}`,
      user: item.user,
      text: item.text,
      emoji: item.emoji,
      city: item.city,
      timestamp: timeStr,
    };
  });

  return {
    history,
    lastUser: initialSlice[initialSlice.length - 1]?.user || '',
    remainingPool: remaining,
  };
}

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
  
  // 5-Digit organic listener counter (Around 11.497 as requested, with slow drift)
  const [listeners, setListeners] = useState<number>(11497);

  // Live Chat Engine State
  const [initialSession] = useState(() => generateInitialChatSession());
  const [reactions, setReactions] = useState<Reaction[]>(() => initialSession.history);
  const poolRef = useRef<PresetComment[]>(initialSession.remainingPool);
  const lastUserRef = useRef<string>(initialSession.lastUser);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isScrolledUp, setIsScrolledUp] = useState<boolean>(false);

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

  // Initial scroll to bottom on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Organic 5-Digit Listener Counter simulation (Gentle drift around 11.497)
  useEffect(() => {
    const interval = setInterval(() => {
      setListeners((prev) => {
        const isShift = Math.random() < 0.2;
        const delta = isShift
          ? (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 22 + 6)
          : (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 7 + 1);
        
        const next = prev + delta;
        return Math.max(10900, Math.min(12400, next));
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Continuous, randomized live chat feed (2s to 7s variable intervals, perpetual reshuffling)
  useEffect(() => {
    let timeoutId: number;
    let isMounted = true;

    const scheduleNextComment = () => {
      // Variable random delay between 2000ms and 7000ms
      const interval = Math.floor(Math.random() * 5000) + 2000;

      timeoutId = window.setTimeout(() => {
        if (!isMounted) return;

        // If pool is exhausted, re-shuffle full 165+ items and continue indefinitely
        if (poolRef.current.length === 0) {
          const lastUsed = lastUserRef.current;
          let newPool = shuffleArray(CLUB_DISPATCH_COMMENTS);
          // Prevent immediate repetition across cycle boundaries
          if (newPool.length > 1 && newPool[0].user === lastUsed) {
            [newPool[0], newPool[1]] = [newPool[1], newPool[0]];
          }
          poolRef.current = newPool;
        }

        const nextPreset = poolRef.current.shift();
        if (!nextPreset) {
          scheduleNextComment();
          return;
        }

        lastUserRef.current = nextPreset.user;
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const newComment: Reaction = {
          id: `live-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          user: nextPreset.user,
          text: nextPreset.text,
          emoji: nextPreset.emoji,
          city: nextPreset.city,
          timestamp: timeStr,
        };

        setReactions((prev) => {
          // Bounded window: keep latest 100 messages for smooth performance and deep scrollback
          const updated = [...prev, newComment];
          if (updated.length > 100) {
            return updated.slice(updated.length - 100);
          }
          return updated;
        });

        // Auto-scroll logic: If user is at/near bottom, scroll down; otherwise, notify user
        if (chatScrollRef.current) {
          const el = chatScrollRef.current;
          const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 65;
          if (isNearBottom) {
            setTimeout(() => {
              if (chatScrollRef.current) {
                chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
              }
            }, 30);
          } else {
            setUnreadCount((c) => c + 1);
          }
        }

        scheduleNextComment();
      }, interval);
    };

    scheduleNextComment();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // Handle user scroll detection
  const handleChatScroll = () => {
    if (!chatScrollRef.current) return;
    const el = chatScrollRef.current;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 45;
    if (isNearBottom) {
      setIsScrolledUp(false);
      setUnreadCount(0);
    } else {
      setIsScrolledUp(true);
    }
  };

  // Jump to newest messages on request
  const scrollToBottom = () => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
      setUnreadCount(0);
      setIsScrolledUp(false);
    }
  };

  // Video Load Timeout Easter Egg
  const triggerTimeoutGlitch = () => {
    setIsVideoGlitching(true);
    audioEngine.playFX('rewind');
    setTimeout(() => {
      setIsVideoGlitching(false);
    }, 4500);
  };

  // User message submit handler
  const handleSendReaction = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customMsg.trim();
    if (!trimmed) return;

    const emojis = ['⚡', '🔊', '🖤', '🔥', '🎛️'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newReaction: Reaction = {
      id: `own-${Date.now()}`,
      user: 'You',
      text: trimmed,
      emoji: randomEmoji,
      city: 'Local',
      timestamp: timeStr,
      isOwn: true,
    };

    setReactions((prev) => {
      const updated = [...prev, newReaction];
      if (updated.length > 100) {
        return updated.slice(updated.length - 100);
      }
      return updated;
    });

    setCustomMsg('');
    setUnreadCount(0);
    setIsScrolledUp(false);
    audioEngine.playFX('scratch');

    // Instantly scroll to user's own sent message
    setTimeout(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }, 30);
  };

  const isLive = isPlaying && streamStatus === 'live';

  return (
    <section id="booth" className="w-full bg-[#000000] text-white pt-2 sm:pt-2.5 pb-2.5 sm:pb-3 px-3 sm:px-6 md:px-8 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto">
        {/* Desktop Section Header (Visible on Desktop >= lg) */}
        <div className="hidden lg:flex items-center justify-between gap-4 mb-2.5 sm:mb-3 pb-2 sm:pb-2.5 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-neutral-400 font-mono text-xs uppercase tracking-widest leading-none mb-1">
              <Camera size={13} className="text-red-500" />
              <span>STUDIO CAM · 24/7 DIRECT CCTV FEED</span>
            </div>
            <h2 className="font-display font-black text-xl lg:text-2xl uppercase tracking-tight leading-tight">
              STUDIO SURVEILLANCE & DISPATCH LOG
            </h2>
          </div>

          <div className="flex items-center gap-2">
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
              title="Test video signal glitch effect"
              className="min-h-[28px] sm:min-h-[30px] px-2.5 sm:px-3 py-0.5 border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white font-ui font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw size={12} className={isVideoGlitching ? 'animate-spin' : ''} />
              <span>TEST SIGNAL</span>
            </button>
          </div>
        </div>

        {/* Responsive Grid: On mobile, Dispatch Log is order-1 (directly below Equalizer), Studio Cam is order-2 (below chat) */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
          {/* Main Video Viewport (Col 8 on desktop, order-2 on mobile below community) */}
          <div className="order-2 lg:order-1 lg:col-span-8 bg-[#0a0a0a] border border-neutral-800 relative overflow-hidden group flex flex-col justify-between">
            {/* Mobile Header for Studio Cam (Visible only < lg when placed below community) */}
            <div className="flex lg:hidden items-center justify-between gap-2 p-2 sm:p-2.5 bg-neutral-950 border-b border-neutral-800 font-mono text-[10px] sm:text-[11px]">
              <div className="flex items-center gap-1.5">
                <Camera size={12} className="text-red-500" />
                <span className="font-bold text-white uppercase tracking-wider">STUDIO SURVEILLANCE CAM</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-[9px] text-neutral-400">
                <span>BERLIN CONTAINER</span>
              </div>
            </div>

            {/* The Video / Image Frame with guaranteed height */}
            <div className="relative w-full h-[250px] xs:h-[280px] sm:h-[340px] md:h-[380px] lg:h-[420px] xl:h-[450px] bg-black overflow-hidden flex items-center justify-center">
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
                    className="w-full h-full object-cover object-center"
                    fetchPriority="high"
                  />

                  {/* CAM Angle Subtle Transformations */}
                  {activeCam === 'cam2' && (
                    <div className="absolute inset-0 bg-black/25 backdrop-blur-[0.5px] pointer-events-none" />
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

          {/* Live Studio Chat & Reaction Shoutbox (Col 4) — order-1 on mobile, order-2 on desktop */}
          <div className="order-1 lg:order-2 lg:col-span-4 bg-[#0d0d0d] border border-neutral-800 flex flex-col h-[340px] sm:h-[380px] lg:h-[480px] xl:h-[510px] relative">
            {/* Chat Header with 5-Digit Organic Listener Count */}
            <div className="border-b border-neutral-800 px-3 py-1.5 sm:py-2 bg-neutral-900/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5 font-mono text-[11px] min-w-0">
                <span className="w-1.5 h-1.5 bg-red-500 shrink-0" />
                <span className="font-bold uppercase tracking-wider text-white truncate">DISPATCH LOG · BOOTH</span>
                <span className="text-[9px] font-mono text-neutral-500 hidden xl:inline uppercase tracking-widest pl-1">
                  [DEMO STREAM]
                </span>
              </div>
              <div 
                className="flex items-center gap-1 font-mono text-[10px] text-neutral-300 tabular-nums bg-neutral-950/80 px-2 py-0.5 border border-neutral-800 shrink-0"
                title="Simulated estimated listeners · Demo Mode"
              >
                <Users size={11} className="text-red-500 shrink-0" />
                <span className="font-bold text-white">{listeners.toLocaleString()}</span>
                <span className="text-neutral-500 text-[9px] uppercase hidden xs:inline">TUNED IN</span>
              </div>
            </div>

            {/* Reactions Stream Container */}
            <div 
              ref={chatScrollRef}
              onScroll={handleChatScroll}
              className="flex-1 overflow-y-auto p-2 sm:p-2.5 space-y-1.5 font-mono text-[11px] scroll-smooth"
            >
              {reactions.map((r) => (
                <div 
                  key={r.id} 
                  className={`p-1.5 sm:p-2 border transition-colors ${
                    r.isOwn 
                      ? 'bg-neutral-900 border-neutral-600' 
                      : 'bg-neutral-950/90 border-neutral-900 hover:border-neutral-800'
                  }`}
                >
                  <div className="flex items-baseline justify-between text-[10px] text-neutral-400 mb-0.5 gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 truncate">
                      {r.isOwn && (
                        <span className="px-1 py-0.2 bg-white text-black font-mono font-bold text-[8px] uppercase shrink-0">
                          YOU
                        </span>
                      )}
                      <span className={`font-mono font-bold tracking-wide uppercase truncate ${r.isOwn ? 'text-white' : 'text-neutral-200'}`}>
                        {r.user}
                      </span>
                      {r.city && !r.isOwn && (
                        <span className="text-neutral-500 text-[9px] font-mono shrink-0">({r.city})</span>
                      )}
                    </div>
                    <span className="tabular-nums font-mono text-[9px] text-neutral-500 shrink-0">{r.timestamp}</span>
                  </div>
                  <p className="text-neutral-300 font-ui text-[11px] leading-snug break-words">
                    <span className={r.isOwn ? 'text-white font-medium' : ''}>{r.text}</span>
                    {r.emoji && <span className="ml-1.5 inline-block text-xs">{r.emoji}</span>}
                  </p>
                </div>
              ))}
            </div>

            {/* Floating "New Messages" Notification Pill when user is scrolled up */}
            {unreadCount > 0 && isScrolledUp && (
              <button
                type="button"
                onClick={scrollToBottom}
                aria-label="Jump to latest dispatches"
                className="absolute bottom-13 left-1/2 -translate-x-1/2 z-20 bg-neutral-900/95 hover:bg-neutral-800 text-white border border-red-500/80 px-3 py-1 font-mono text-[10px] tracking-wider uppercase flex items-center gap-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.8)] backdrop-blur cursor-pointer transition-all animate-bounce"
              >
                <ArrowDown size={11} className="text-red-500" />
                <span>NEW MESSAGES ({unreadCount})</span>
              </button>
            )}

            {/* Send reaction form */}
            <form onSubmit={handleSendReaction} className="p-1.5 sm:p-2 border-t border-neutral-800 bg-neutral-950 flex gap-1.5 shrink-0">
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                maxLength={180}
                placeholder="Send dispatch to the booth..."
                className="flex-1 bg-neutral-900 border border-neutral-700 px-2.5 py-1 text-[11px] font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-white"
              />
              <button
                type="submit"
                aria-label="Send message"
                className="px-3 py-1 bg-white text-black hover:bg-neutral-200 font-mono text-xs font-bold transition-colors flex items-center justify-center cursor-pointer shrink-0"
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
