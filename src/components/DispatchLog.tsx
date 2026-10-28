import React, { useState, useEffect, useRef, useTransition } from 'react';
import { Users, Send, ArrowDown } from 'lucide-react';
import { realtimeDispatchClient, DispatchMessage, ConnectionState } from '../utils/realtimeDispatch';

interface DispatchLogProps {
  className?: string;
}

export const DispatchLog: React.FC<DispatchLogProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<DispatchMessage[]>([]);
  const [listeners, setListeners] = useState<number>(11486);
  const [, setConnectionStatus] = useState<ConnectionState>('connected');
  const [customMsg, setCustomMsg] = useState<string>('');
  const [latestIncomingId, setLatestIncomingId] = useState<string | null>(null);

  // Mobile 2-slot auto-roll state
  const [mobileSlots, setMobileSlots] = useState<{
    current: DispatchMessage | null;
    previous: DispatchMessage | null;
  }>({
    current: null,
    previous: null,
  });

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
        if (history.length > 0) {
          const rev = [...history].reverse();
          setMobileSlots({
            current: rev[0] || null,
            previous: rev[1] || null,
          });
        }
      },
      onListenersCount: (count) => {
        setListeners(count);
      },
      onStatusChange: (status) => {
        setConnectionStatus(status);
      },
      onMessage: (newMsg) => {
        setLatestIncomingId(newMsg.id);
        
        // Update Mobile 2-slot Auto-Roll ("Abmelden & Eintragen")
        setMobileSlots((prev) => ({
          current: newMsg,
          previous: prev.current,
        }));

        // Clear highlight flash after 2.8s
        setTimeout(() => {
          setLatestIncomingId((curr) => (curr === newMsg.id ? null : curr));
        }, 2800);

        startTransition(() => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            const updated = [...prev, newMsg];
            // Enforce sliding window (bounded memory for scalability)
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

    const newMsg = realtimeDispatchClient.sendUserMessage(customMsg);
    setCustomMsg('');

    // Instant update for mobile slots
    setMobileSlots((prev) => ({
      current: newMsg,
      previous: prev.current,
    }));

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

  const { current, previous } = mobileSlots;

  return (
    <section 
      id="booth"
      className={`w-full bg-[#0b0b0e] border border-[#1f1f2a] flex flex-col justify-between shadow-lg select-none relative ${className}`}
      aria-label="Dispatch Log & Community Feed"
    >
      {/* ============================================================== */}
      {/* 1. DESKTOP VIEW: FULL-HEIGHT SCROLLABLE FEED (hidden lg:flex) */}
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

          {/* Dynamic Listener Counter */}
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
      {/* 2. MOBILE VIEW: COMPACT 2-SLOT AUTO-ROLL TICKER (flex lg:hidden) */}
      {/* ============================================================== */}
      <div className="flex lg:hidden flex-col w-full">
        {/* Mobile Header Bar: DISPATCH TICKER • LIVE */}
        <div className="border-b border-[#1c1c26] px-3 py-2 bg-[#0e0e12] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 font-mono text-[11px] min-w-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
            </span>
            <span className="font-bold uppercase tracking-wider text-white truncate">
              DISPATCH TICKER • LIVE
            </span>
          </div>

          <div 
            className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-300 tabular-nums bg-[#121217] px-2 py-0.5 border border-[#22222e] shrink-0"
            title="Current live viewers tuned in"
          >
            <Users size={11} className="text-red-500 shrink-0" />
            <span className="font-bold text-white">{listeners.toLocaleString()}</span>
          </div>
        </div>

        {/* Compact Ticker Slot: Strictly max 2 stacked message slots (no manual vertical scrollbar) */}
        {/* touch-action: pan-y and pointer-events-none allow smooth scrolling past this section without trapping touch */}
        <div 
          className="p-2 space-y-1.5 font-mono text-xs overflow-hidden pointer-events-none select-none"
          style={{ touchAction: 'pan-y' }}
        >
          {/* Top Slot: Highlighted Active Message (NEW badge, bold user, city, red border) */}
          {current ? (
            <div 
              key={current.id} 
              className="animate-slide-in-top p-2 border border-red-600/90 bg-red-950/25 shadow-[0_0_10px_rgba(220,38,38,0.2)] transition-all duration-300"
            >
              <div className="flex items-baseline justify-between text-[10px] mb-0.5 gap-2">
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                  {current.isOwn ? (
                    <span className="px-1.5 py-0.2 bg-white text-black font-mono font-bold text-[8px] uppercase shrink-0">
                      YOU
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 bg-red-600 text-white font-mono font-bold text-[8px] uppercase tracking-wider shrink-0 animate-pulse">
                      NEW
                    </span>
                  )}
                  
                  <span className="font-mono font-black text-white text-xs uppercase tracking-wide truncate">
                    {current.user}
                  </span>
                  {current.city && !current.isOwn && (
                    <span className="text-neutral-400 font-mono text-[9px] shrink-0">({current.city})</span>
                  )}
                </div>
                <span className="tabular-nums font-mono text-[9px] text-neutral-400 shrink-0">{current.timestamp}</span>
              </div>
              
              <p className="text-white font-ui text-[12px] sm:text-xs leading-snug break-words">
                {current.text}
                {current.emoji && <span className="ml-1.5 inline-block text-xs">{current.emoji}</span>}
              </p>
            </div>
          ) : (
            <div className="p-2 border border-[#1f1f2a] bg-[#0c0c10] text-zinc-500 text-[11px]">
              Waiting for next dispatch...
            </div>
          )}

          {/* Bottom Slot: Previous message fading out with reduced opacity (text-zinc-600) */}
          {previous ? (
            <div 
              key={previous.id} 
              className="p-1.5 border border-[#1c1c24] bg-[#09090d]/80 text-zinc-600 opacity-60 transition-all duration-500"
            >
              <div className="flex items-baseline justify-between text-[9px] mb-0.5 gap-2 text-zinc-600">
                <div className="flex items-center gap-1 min-w-0 truncate">
                  <span className="font-mono font-bold text-zinc-500 uppercase truncate">
                    {previous.user}
                  </span>
                  {previous.city && (
                    <span className="text-zinc-600 text-[8px] shrink-0">({previous.city})</span>
                  )}
                </div>
                <span className="tabular-nums font-mono text-[8px] text-zinc-600 shrink-0">{previous.timestamp}</span>
              </div>
              
              <p className="font-ui text-[11px] leading-tight text-zinc-500 truncate">
                {previous.text}
                {previous.emoji && <span className="ml-1 inline-block opacity-75">{previous.emoji}</span>}
              </p>
            </div>
          ) : null}
        </div>

        {/* Direct Input Bar: Placed immediately beneath the ticker box with no margin spacing gap */}
        <form 
          onSubmit={handleSendMessage} 
          className="p-2 border-t border-[#1c1c26] bg-[#0c0c10] flex gap-2 shrink-0 pointer-events-auto"
        >
          <input
            type="text"
            value={customMsg}
            onChange={(e) => setCustomMsg(e.target.value)}
            maxLength={180}
            placeholder="Send dispatch to the booth..."
            className="flex-1 bg-[#121218] border border-[#262635] px-2.5 py-1.5 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition-colors"
          />
          <button
            type="submit"
            aria-label="Send dispatch"
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition-colors flex items-center justify-center cursor-pointer shrink-0 shadow-[0_0_8px_rgba(220,38,38,0.4)]"
          >
            <Send size={12} />
          </button>
        </form>
      </div>
    </section>
  );
};
