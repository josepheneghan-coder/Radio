/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * RADIO KONTROLLE — Realtime Dispatch Engine & Scalable Client Architecture
 * 
 * Features:
 * 1. Time-Based Viewer Logic (Europe/Berlin Time):
 *    - Daytime (08:00 - 20:00 CET): 7,000 to 8,000 viewers
 *    - Nighttime (20:00 - 08:00 CET): 11,000 to 13,000 peak rave viewers
 *    - Subtle live jumps (+/- 3 to 18 viewers every 4s)
 * 2. 200 Curated Multilingual Comments Auto-Rotation (European + subtle Asian mix, strictly no Arabic).
 * 3. Scalable Incremental Diff Streaming with LRU deduplication & sliding window.
 */

import { CLUB_DISPATCH_COMMENTS, PresetComment } from '../data/clubComments';

export interface DispatchMessage {
  id: string;
  user: string;
  text: string;
  emoji?: string;
  city?: string;
  lang?: 'en' | 'de' | 'es' | 'pt' | 'pl' | 'ja' | 'th';
  timestamp: string;
  timestampMs: number;
  isOwn?: boolean;
  isFresh?: boolean;
}

export type ConnectionState = 'connected' | 'reconnecting' | 'connecting' | 'offline';

type EventListener = {
  onMessage?: (msg: DispatchMessage) => void;
  onListenersCount?: (count: number) => void;
  onStatusChange?: (status: ConnectionState) => void;
  onInitialHistory?: (history: DispatchMessage[]) => void;
};

function getBerlinHour(): number {
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Berlin',
      hour: 'numeric',
      hour12: false,
    });
    return parseInt(formatter.format(new Date()), 10);
  } catch {
    const now = new Date();
    return (now.getUTCHours() + 1) % 24;
  }
}

function getTargetListenerRange(): { min: number; max: number } {
  const hour = getBerlinHour();
  const isDaytime = hour >= 8 && hour < 20; // 08:00 - 20:00 CET
  if (isDaytime) {
    return { min: 7000, max: 8000 };
  }
  // Nighttime (20:00 - 08:00 CET): Peak global clubbing & rave hours
  return { min: 11000, max: 13000 };
}

class RealtimeDispatchManager {
  private listeners: Set<EventListener> = new Set();
  private connectionState: ConnectionState = 'connecting';
  private seenMessageIds: Set<string> = new Set();
  private messageHistory: DispatchMessage[] = [];
  private maxHistorySize = 50;
  private currentListenerCount: number;
  
  // Reconnect & Jitter configuration
  private reconnectAttempt = 0;
  private readonly baseBackoffMs = 1000;
  private readonly maxBackoffMs = 15000;
  private readonly backoffMultiplier = 1.5;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private streamTimer: NodeJS.Timeout | null = null;
  private listenerCountTimer: NodeJS.Timeout | null = null;

  // Local comments pool
  private availablePool: PresetComment[] = [];
  private lastSpeaker = '';

  constructor() {
    const initialRange = getTargetListenerRange();
    this.currentListenerCount = Math.floor(initialRange.min + Math.random() * (initialRange.max - initialRange.min));
    
    this.initPool();
    this.seedInitialHistory();
    this.setupVisibilityListener();
    this.startStreaming();
    this.startListenerAggregator();
  }

  private initPool() {
    this.availablePool = this.shuffle([...CLUB_DISPATCH_COMMENTS]);
  }

  private shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  private seedInitialHistory() {
    const initialSlice = this.availablePool.slice(0, 14);
    this.availablePool = this.availablePool.slice(14);
    const now = Date.now();

    initialSlice.forEach((item, idx) => {
      const offsetMs = (14 - idx) * 32000 + Math.floor(Math.random() * 5000);
      const msgDate = new Date(now - offsetMs);
      const timeStr = `${String(msgDate.getHours()).padStart(2, '0')}:${String(msgDate.getMinutes()).padStart(2, '0')}`;
      const id = `init-${msgDate.getTime()}-${idx}`;

      const msg: DispatchMessage = {
        id,
        user: item.user,
        text: item.text,
        emoji: item.emoji,
        city: item.city,
        lang: item.lang,
        timestamp: timeStr,
        timestampMs: msgDate.getTime(),
        isFresh: false,
      };

      this.seenMessageIds.add(id);
      this.messageHistory.push(msg);
      this.lastSpeaker = item.user;
    });

    this.connectionState = 'connected';
  }

  private setupVisibilityListener() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          if (this.connectionState !== 'connected') {
            this.reconnect();
          }
        }
      });
    }
  }

  private calculateJitteredBackoff(): number {
    const exponential = Math.min(
      this.maxBackoffMs,
      this.baseBackoffMs * Math.pow(this.backoffMultiplier, this.reconnectAttempt)
    );
    const jitter = 0.8 + Math.random() * 0.4;
    return Math.floor(exponential * jitter);
  }

  private reconnect() {
    this.reconnectAttempt++;
    this.setConnectionState('reconnecting');
    const delay = this.calculateJitteredBackoff();

    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.setConnectionState('connected');
      this.reconnectAttempt = 0;
      this.startStreaming();
    }, delay);
  }

  private setConnectionState(state: ConnectionState) {
    this.connectionState = state;
    this.listeners.forEach((l) => l.onStatusChange?.(state));
  }

  /**
   * Continuous incremental dispatch event loop.
   */
  private startStreaming() {
    if (this.streamTimer) clearTimeout(this.streamTimer);

    const scheduleNext = () => {
      // Stream interval: randomized between 3.4s and 6.2s for lively live chat
      const delay = Math.floor(Math.random() * 2800) + 3400;
      this.streamTimer = setTimeout(() => {
        if (typeof document !== 'undefined' && document.hidden) {
          scheduleNext();
          return;
        }

        if (this.availablePool.length === 0) {
          this.initPool();
        }

        let nextItem = this.availablePool.shift();
        if (!nextItem) {
          this.initPool();
          nextItem = this.availablePool.shift();
        }

        if (nextItem && nextItem.user === this.lastSpeaker && this.availablePool.length > 0) {
          const alternate = this.availablePool.shift()!;
          this.availablePool.push(nextItem);
          nextItem = alternate;
        }

        if (nextItem) {
          this.lastSpeaker = nextItem.user;
          const now = new Date();
          const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          const id = `live-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

          if (!this.seenMessageIds.has(id)) {
            this.seenMessageIds.add(id);

            const newMsg: DispatchMessage = {
              id,
              user: nextItem.user,
              text: nextItem.text,
              emoji: nextItem.emoji,
              city: nextItem.city,
              lang: nextItem.lang,
              timestamp: timeStr,
              timestampMs: Date.now(),
              isFresh: true,
            };

            this.messageHistory.push(newMsg);
            if (this.messageHistory.length > this.maxHistorySize) {
              const removed = this.messageHistory.shift();
              if (removed && this.seenMessageIds.size > 200) {
                this.seenMessageIds.delete(removed.id);
              }
            }

            this.listeners.forEach((l) => l.onMessage?.(newMsg));
          }
        }

        scheduleNext();
      }, delay);
    };

    scheduleNext();
  }

  /**
   * Time-Based Viewer Logic (Europe/Berlin Time):
   * - Daytime (08:00 - 20:00 CET): 7,000 - 8,000
   * - Nighttime (20:00 - 08:00 CET): 11,000 - 13,000
   * - Subtle live jumps (+/- 3 to 18 viewers every 4-5s)
   */
  private startListenerAggregator() {
    if (this.listenerCountTimer) clearInterval(this.listenerCountTimer);

    this.listenerCountTimer = setInterval(() => {
      const range = getTargetListenerRange();
      
      // Calculate realistic subtle fluctuation (+/- 3 to 18 viewers)
      const delta = Math.floor(Math.random() * 16) + 3; // 3 to 18
      let direction: number;

      if (this.currentListenerCount < range.min) {
        direction = 1; // Pull up into range
      } else if (this.currentListenerCount > range.max) {
        direction = -1; // Pull down into range
      } else {
        // Natural gentle drift
        direction = Math.random() > 0.48 ? 1 : -1;
      }

      this.currentListenerCount = Math.max(
        range.min - 40,
        Math.min(range.max + 40, this.currentListenerCount + direction * delta)
      );

      this.listeners.forEach((l) => l.onListenersCount?.(this.currentListenerCount));
    }, 4200);
  }

  public subscribe(callbacks: EventListener): () => void {
    this.listeners.add(callbacks);

    callbacks.onInitialHistory?.([...this.messageHistory]);
    callbacks.onListenersCount?.(this.currentListenerCount);
    callbacks.onStatusChange?.(this.connectionState);

    return () => {
      this.listeners.delete(callbacks);
    };
  }

  public sendUserMessage(text: string, user = 'SELECTOR_LOCAL', city = 'Local'): DispatchMessage {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newMsg: DispatchMessage = {
      id,
      user,
      text: text.trim(),
      city,
      lang: 'de',
      timestamp: timeStr,
      timestampMs: Date.now(),
      isOwn: true,
      isFresh: true,
    };

    this.seenMessageIds.add(id);
    this.messageHistory.push(newMsg);
    if (this.messageHistory.length > this.maxHistorySize) {
      this.messageHistory.shift();
    }

    this.listeners.forEach((l) => l.onMessage?.(newMsg));
    return newMsg;
  }

  public getSnapshot(): { history: DispatchMessage[]; listeners: number; status: ConnectionState } {
    return {
      history: [...this.messageHistory],
      listeners: this.currentListenerCount,
      status: this.connectionState,
    };
  }
}

export const realtimeDispatchClient = new RealtimeDispatchManager();
