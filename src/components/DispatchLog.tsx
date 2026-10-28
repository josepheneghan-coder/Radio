import React, { useState, useEffect, useRef, useTransition } from 'react';
import { Users, Send, ArrowDown } from 'lucide-react';
import { realtimeDispatchClient, DispatchMessage, ConnectionState } from '../utils/realtimeDispatch';

interface DispatchLogProps {
  className?: string;
}

export const DispatchLog: React.FC<DispatchLogProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<DispatchMessage[]>([]);
  const [listeners, setListeners] = useState<number>(11482);
  const [, setConnectionStatus] = useState<ConnectionState>('connected');
  const [customMsg, setCustomMsg] = useState<string>('');
  const [latestIncomingId, setLatestIncomingId] = useState<string | null>(null);

  // Desktop scrolling state
  const [isScrolledUp, setIsScrolledUp] = useState<boolean>(false);
  const [unreadDesktopCount, setUnreadDesktopCount] = useState<number>(0);
  const desktopChatScrollRef = useRef<HTMLDivElement | null>(null);

  const [, startTransition] = useTransition();

  // Subscribe to centralized Realtime Dispatch Engine
  useEffect(() => {
    const unsubscribe = realtimeDispatchClient.subscribe({
      onInitialHistory: (history) => {
        setMessages(history);
      },
      onListenersCount: (count) => {
        setListeners(count);
      },
      onStatusChange: (status) => {
        setConnectionStatus(status);
      },
      onMessage: (newMsg) => {
        setLatestIncomingId(newMsg.id);
        
        // Clear highlight flash after 2.5s
        setTimeout(() => {
          setLatestIncomingId((curr) => (curr === newMsg.id ? null : curr));
        }, 2500);

        startTransition(() => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            const updated = [...prev, newMsg];
            // Enforce sliding window (bounded memory)
            if (updated.length > 50) return updated.slice(updated.length - 50);
            return updated;
          });
        });

        // Desktop auto-scroll handling
        if (desktopChatScrollRef.current) {
          if (isScrolledUp) {
            setUnreadDesktopCount((c) => c + 1);
          } else {
            requestAnimationFrame(() => {
              if (desktopChatScrollRef.current) {
                desktopChatScrollRef.current.scrollTop = desktopChatScrollRef.current.scrollHeight;
              }
            });
          }
        }
      },
    });

    return () => {
      unsubscribe();
    };
  }, [isScrolledUp]);

  // Initial scroll to bottom for desktop chat
  useEffect(() => {
    if (desktopChatScrollRef.current) {
      desktopChatScrollRef.current.scrollTop = desktopChatScrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleDesktopScroll = () => {
    if (!desktopChatScrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = desktopChatScrollRef.current;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    const scrolledUp = distanceFromBottom > 60;
    setIsScrolledUp(scrolledUp);
    if (!scrolledUp) setUnreadDesktopCount(0);
  };

  const scrollToBottomDesktop = () => {
    if (desktopChatScrollRef.current) {
      desktopChatScrollRef.current.scrollTop = desktopChatScrollRef.current.scrollHeight;
      setIsScrolledUp(false);
      setUnreadDesktopCount(0);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;

    realtimeDispatchClient.sendUserMessage(customMsg);
    setCustomMsg('');

    if (desktopChatScrollRef.current) {
      requestAnimationFrame(() => {
        if (desktopChatScrollRef.current) {
          desktopChatScrollRef.current.scrollTop = desktopChatScrollRef.current.scrollHeight;
          setIsScrolledUp(false);
          setUnreadDesktopCount(0);
        }
      });
    }
  };

  // Recent 3 dispatches for the compact mobile vertical action ticker (newest first)
  const mobileRecentDispatches = [...messages].reverse().slice(0, 3);

  return (
    <section 
      id="booth"
      className={`w-full bg-[#0b0b0e] border border-[#1f1f2a] flex flex-col justify-between shadow-lg select-none relative ${className}`}
      aria-label="Dispatch Log & Community Feed"
    >
      {/* ============================================================== */}
      {/* 1. DESKTOP VIEW: FULL-HEIGHT SCROLLABLE FEED (lg:flex)        */}
      {/* ============================================================== */}
      <div className="hidden lg:flex flex-col h-full justify-between">
        {/* Desktop Header */}
        <div className="border-b border-[#1c1c26] px-4 py-2.5 bg-[#0e0e12] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
            </span>
            <span className="font-bold uppercase tracking-wider text-white">
              DISPATCH LOG · BOOTH
            </span>
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest pl-1 border-l border-neutral-700 ml-1">
              LIVE SHOUTBOX
            </span>
          </div>

          {/* 11,000+ Listener Counter */}
          <div 
            className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-300 tabular-nums bg-[#121217] px-2.5 py-1 border border-[#22222e] shrink-0"
            title="Aggregated concurrent listeners tuned in globally"
          >
            <Users size={12} className="text-red-500 shrink-0" />
            <span className="font-bold text-white">{listeners.toLocaleString()}</span>
            <span className="text-neutral-400 text-[9px] uppercase">TUNED IN</span>
          </div>
        </div>

        {/* Desktop Scrollable Message Stream */}
        <div 
          ref={desktopChatScrollRef}
          onScroll={handleDesktopScroll}
          className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-xs scroll-smooth max-h-[380px] xl:max-h-[420px]"
        >
          {messages.map((r) => {
            const isHighlight = latestIncomingId === r.id;
            return (
              <div 
                key={r.id} 
                className={`p-2 border transition-all duration-300 ${
                  r.isOwn 
                    ? 'bg-[#181826] border-neutral-500' 
                    : isHighlight
                      ? 'bg-red-950/30 border-red-500 shadow-[inset_0_0_10px_rgba(239,68,68,0.25)]'
                      : 'bg-[#0d0d12]/95 border-[#1a1a24] hover:border-[#2a2a38]'
                }`}
              >
                <div className="flex items-baseline justify-between text-[10px] text-neutral-400 mb-0.5 gap-2">
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    {r.isOwn ? (
                      <span className="px-1 py-0.2 bg-white text-black font-mono font-bold text-[8px] uppercase shrink-0">
                        YOU
                      </span>
                    ) : isHighlight ? (
                      <span className="px-1 py-0.2 bg-red-600 text-white font-mono font-bold text-[8px] uppercase shrink-0 animate-pulse">
                        NEW
                      </span>
                    ) : null}
                    
                    <span className={`font-mono font-bold tracking-wide uppercase truncate ${r.isOwn ? 'text-white' : 'text-neutral-200'}`}>
                      {r.user}
                    </span>
                    {r.city && !r.isOwn && (
                      <span className="text-neutral-400 text-[9px] font-mono shrink-0">({r.city})</span>
                    )}
                  </div>
                  <span className="tabular-nums font-mono text-[9px] text-neutral-400 shrink-0">{r.timestamp}</span>
                </div>
                
                <p className="text-neutral-200 font-ui text-xs leading-snug break-words">
                  <span className={r.isOwn ? 'text-white font-medium' : ''}>{r.text}</span>
                  {r.emoji && <span className="ml-1.5 inline-block text-xs">{r.emoji}</span>}
                </p>
              </div>
            );
          })}
        </div>

        {/* Floating Desktop "New Messages" Pill */}
        {isScrolledUp && unreadDesktopCount > 0 && (
          <button
            type="button"
            onClick={scrollToBottomDesktop}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 bg-red-600 hover:bg-red-500 text-white border border-white/30 px-3.5 py-1 font-mono text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-[0_4px_16px_rgba(220,38,38,0.6)] cursor-pointer animate-bounce"
          >
            <ArrowDown size={12} />
            <span>{unreadDesktopCount} NEW DISPATCHES</span>
          </button>
        )}

        {/* Desktop Fixed Bottom Input Form */}
        <form onSubmit={handleSendMessage} className="p-2.5 border-t border-[#1c1c26] bg-[#0c0c10] flex gap-2 shrink-0">
          <input
            type="text"
            value={customMsg}
            onChange={(e) => setCustomMsg(e.target.value)}
            maxLength={180}
            placeholder="Send dispatch to the booth..."
            className="flex-1 bg-[#121218] border border-[#262635] px-3 py-1.5 text-xs font-mono text-white placeholder-neutral-400 focus:outline-none focus:border-red-500 transition-colors"
          />
          <button
            type="submit"
            aria-label="Send message to booth"
            className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition-colors flex items-center justify-center cursor-pointer shrink-0 shadow-[0_0_8px_rgba(220,38,38,0.4)]"
          >
            <Send size={12} />
          </button>
        </form>
      </div>

      {/* ============================================================== */}
      {/* 2. MOBILE VIEW: COMPACT VERTICAL ACTION TICKER (lg:hidden)    */}
      {/* ============================================================== */}
      <div className="flex lg:hidden flex-col w-full">
        {/* Mobile Header Bar */}
        <div className="border-b border-[#1c1c26] px-3 py-2 bg-[#0e0e12] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 font-mono text-[11px] min-w-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
            </span>
            <span className="font-bold uppercase tracking-wider text-white truncate">
              DISPATCH TICKER
            </span>
            <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest pl-1 border-l border-neutral-700">
              ● LIVE
            </span>
          </div>

          <div 
            className="flex items-center gap-1 font-mono text-[10px] text-neutral-300 tabular-nums bg-[#121217] px-2 py-0.5 border border-[#22222e] shrink-0"
          >
            <Users size={11} className="text-red-500 shrink-0" />
            <span className="font-bold text-white">{listeners.toLocaleString()}</span>
          </div>
        </div>

        {/* Compact Vertical Action Ticker (Shows newest 2-3 dispatches with bottom fade mask) */}
        <div className="relative overflow-hidden h-[120px] p-2 space-y-1.5 font-mono text-[11px] mask-fade-bottom pointer-events-none select-none">
          {mobileRecentDispatches.map((r, index) => {
            const isLatest = index === 0;
            return (
              <div 
                key={r.id} 
                className={`p-1.5 border transition-all duration-300 ${
                  isLatest ? 'animate-dispatch-in' : ''
                } ${
                  r.isOwn 
                    ? 'bg-[#181826] border-neutral-500' 
                    : isLatest
                      ? 'bg-red-950/30 border-red-500/80'
                      : 'bg-[#0d0d12]/80 border-[#1a1a24] opacity-75'
                }`}
              >
                <div className="flex items-baseline justify-between text-[9px] text-neutral-400 mb-0.5 gap-2">
                  <div className="flex items-center gap-1 min-w-0 truncate">
                    {r.isOwn ? (
                      <span className="px-1 py-0.1 bg-white text-black font-mono font-bold text-[7px] uppercase shrink-0">
                        YOU
                      </span>
                    ) : isLatest ? (
                      <span className="px-1 py-0.1 bg-red-600 text-white font-mono font-bold text-[7px] uppercase shrink-0">
                        NEW
                      </span>
                    ) : null}
                    
                    <span className={`font-mono font-bold tracking-wide uppercase truncate ${r.isOwn ? 'text-white' : 'text-neutral-200'}`}>
                      {r.user}
                    </span>
                    {r.city && !r.isOwn && (
                      <span className="text-neutral-400 text-[8px] font-mono shrink-0">({r.city})</span>
                    )}
                  </div>
                  <span className="tabular-nums font-mono text-[8px] text-neutral-400 shrink-0">{r.timestamp}</span>
                </div>
                
                <p className="text-neutral-200 font-ui text-[11px] leading-tight truncate">
                  <span className={r.isOwn ? 'text-white font-medium' : ''}>{r.text}</span>
                  {r.emoji && <span className="ml-1 inline-block text-xs">{r.emoji}</span>}
                </p>
              </div>
            );
          })}
        </div>

        {/* Mobile Fixed Bottom Input Form (Directly below ticker, fully interactive) */}
        <form onSubmit={handleSendMessage} className="p-2 border-t border-[#1c1c26] bg-[#0c0c10] flex gap-2 shrink-0 pointer-events-auto">
          <input
            type="text"
            value={customMsg}
            onChange={(e) => setCustomMsg(e.target.value)}
            maxLength={180}
            placeholder="Send dispatch to the booth..."
            className="flex-1 bg-[#121218] border border-[#262635] px-2.5 py-1.5 text-[11px] font-mono text-white placeholder-neutral-400 focus:outline-none focus:border-red-500 transition-colors"
          />
          <button
            type="submit"
            aria-label="Send message"
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition-colors flex items-center justify-center cursor-pointer shrink-0 shadow-[0_0_8px_rgba(220,38,38,0.4)]"
          >
            <Send size={12} />
          </button>
        </form>
      </div>
    </section>
  );
};
