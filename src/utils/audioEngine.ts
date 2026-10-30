/**
 * KONTROLL RADIO Audio Engine
 * Dedicated radio transmission engine & Underground Audio Reactor:
 * - HTML5 Audio stream receiver for custom live feed (Icecast/Shoutcast/HLS)
 * - Safe Web Audio API Analyser tap with seamless CORS fallback
 * - High-precision Berlin Underground Techno / Schranz / Acid acoustic synthesis model
 * - Purely visual RAVE PRESSURE mode (zero volume alteration)
 * - Hardware DJ Soundboard FX triggers (Tactile analog scratch, rewind, 808 sub drops)
 */

import { StreamStatus, AnalysisMode, ReactorMetrics, EqualizerPresetId } from '../types/radio';
import { STREAM_CONFIG } from '../config/streamConfig';

type StateListener = (isPlaying: boolean, status: StreamStatus, message?: string) => void;
type RaveListener = (isRave: boolean) => void;
type PresetListener = (preset: EqualizerPresetId) => void;

class AudioEngine {
  // Web Audio Context for Soundboard FX & Stream Analyser
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaSource: MediaElementAudioSourceNode | null = null;
  private masterGain: GainNode | null = null;
  private tapeFilter: BiquadFilterNode | null = null;
  private analyserFftData: Uint8Array | null = null;

  // Real HTML5 Live Stream Audio Element
  private streamAudio: HTMLAudioElement | null = null;
  private currentStreamUrl: string = STREAM_CONFIG.STREAM_URL;

  // Stream Health & Reconnect Tracking
  private retryCount: number = 0;
  private readonly maxRetries: number = 3;
  private retryTimeout: number | null = null;
  private isUserInitiatedStop: boolean = false;

  // State
  private isRunning: boolean = false;
  private streamStatus: StreamStatus = 'standby';
  private volume: number = 0.85;
  private isMuted: boolean = false;
  private tapeSaturationActive: boolean = false;
  private statusMessage: string = 'STANDBY · SIGNAL READY';
  private analysisMode: AnalysisMode = 'standby';
  private ravePressureActive: boolean = true;
  private currentPreset: EqualizerPresetId = 'peak_techno';

  // Event Listeners
  private listeners: Set<StateListener> = new Set();
  private raveListeners: Set<RaveListener> = new Set();
  private presetListeners: Set<PresetListener> = new Set();

  // Reactor Simulation & Peak Hold Cache
  private lastTime: number = performance.now();
  private reactorBands: Float32Array = new Float32Array(64);
  private reactorPeaks: Float32Array = new Float32Array(64);
  private peakHoldExpiry: Float64Array = new Float64Array(64);
  private clipFlags: boolean[] = new Array(64).fill(false);
  private bpm: number = 138.0; // Peak Techno default: 138 BPM
  private phrasePhase: number = 0; // 0 to 1 for long phrase filter sweeps
  // Screen Wake Lock API (Keep mobile display and audio stream session active)
  private wakeLock: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initStreamAudio();
      this.setupMediaSession();
      this.setupWakeLock();
    }
  }

  // --- Screen Wake Lock API (Prevent Mobile Standby During Broadcast) ---
  private setupWakeLock() {
    if (typeof document === 'undefined') return;

    // Automatically re-request wake lock when returning from background
    document.addEventListener('visibilitychange', async () => {
      if (this.isRunning && document.visibilityState === 'visible') {
        await this.requestWakeLock();
      }
    });
  }

  public async requestWakeLock(): Promise<boolean> {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false;
    }

    try {
      // 1. Standard W3C Screen Wake Lock API (Modern Chrome, Safari 16.4+, Edge, Firefox mobile)
      if ('wakeLock' in navigator && (navigator as any).wakeLock) {
        if (this.wakeLock && !this.wakeLock.released) {
          return true;
        }
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
        this.wakeLock.addEventListener('release', () => {
          this.wakeLock = null;
        });
        return true;
      }
      // 2. Legacy / Vendor method fallback
      if (typeof (navigator as any).requestWakeLock === 'function') {
        this.wakeLock = await (navigator as any).requestWakeLock('screen');
        return true;
      }
    } catch (err: any) {
      console.warn('Screen Wake Lock notice:', err?.message || err);
    }
    return false;
  }

  public async releaseWakeLock() {
    if (this.wakeLock) {
      try {
        if (!this.wakeLock.released && typeof this.wakeLock.release === 'function') {
          await this.wakeLock.release();
        }
      } catch {
        // Safe release
      } finally {
        this.wakeLock = null;
      }
    }
  }

  // --- Native Media Session API (Lockscreen Controls & Background Playback) ---
  private setupMediaSession() {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) {
      return;
    }

    try {
      navigator.mediaSession.setActionHandler('play', () => {
        if (!this.isRunning) {
          if (this.streamAudio && this.streamAudio.src && !this.streamAudio.src.endsWith('/')) {
            const playPromise = this.streamAudio.play();
            if (playPromise !== undefined) {
              playPromise.then(() => {
                this.isRunning = true;
                this.streamStatus = 'live';
                this.statusMessage = 'LIVE ON AIR · 104.5 FM';
                this.updateMediaSessionMetadata();
                this.updateMediaSessionState('playing');
                this.notify();
              }).catch(() => {
                this.startStream(this.currentStreamUrl);
              });
              return;
            }
          }
          this.startStream(this.currentStreamUrl);
        }
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        this.pause();
      });

      navigator.mediaSession.setActionHandler('stop', () => {
        this.stop();
      });
    } catch (err) {
      console.warn('MediaSession handler registration notice:', err);
    }
  }

  public updateMediaSessionMetadata() {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) {
      return;
    }

    try {
      const origin = window.location.origin;
      const icon192 = `${origin}/assets/kontrolle-app-icon-192.png`;
      const icon512 = `${origin}/assets/kontrolle-app-icon-512.png`;

      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'RADIO KONTROLLE',
        artist: 'LIVE BROADCAST',
        album: 'RADIO KONTROLLE',
        artwork: [
          { src: icon192, sizes: '192x192', type: 'image/png' },
          { src: icon512, sizes: '512x512', type: 'image/png' },
        ],
      });
    } catch (err) {
      console.warn('Failed to update mediaSession metadata:', err);
    }
  }

  public updateMediaSessionState(state: 'playing' | 'paused' | 'none') {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) {
      return;
    }
    try {
      navigator.mediaSession.playbackState = state;
    } catch {
      // browser compatibility guard
    }
  }

  private initStreamAudio() {
    if (this.streamAudio) return;

    this.streamAudio = new Audio();
    this.streamAudio.preload = 'none';
    this.streamAudio.volume = this.isMuted ? 0 : this.volume;

    this.streamAudio.addEventListener('loadstart', () => {
      if (this.isRunning) {
        this.streamStatus = 'buffering';
        this.statusMessage = 'CONNECTING TO TRANSMITTER...';
        this.notify();
      }
    });

    this.streamAudio.addEventListener('waiting', () => {
      if (this.isRunning) {
        this.streamStatus = 'buffering';
        this.statusMessage = 'BUFFERING FEED...';
        this.notify();
      }
    });

    this.streamAudio.addEventListener('canplay', () => {
      if (this.isRunning) {
        this.streamStatus = 'live';
        this.statusMessage = 'LIVE ON AIR · 104.5 FM';
        this.retryCount = 0;
        this.updateMediaSessionMetadata();
        this.updateMediaSessionState('playing');
        this.requestWakeLock();
        this.notify();
      }
    });

    this.streamAudio.addEventListener('playing', () => {
      if (this.isRunning) {
        this.streamStatus = 'live';
        this.statusMessage = 'LIVE ON AIR · 104.5 FM';
        this.retryCount = 0;
        this.updateMediaSessionMetadata();
        this.updateMediaSessionState('playing');
        this.requestWakeLock();
        this.notify();
      }
    });

    this.streamAudio.addEventListener('pause', () => {
      this.updateMediaSessionState('paused');
      // Only transition to standby if user explicitly stopped
      if (this.isUserInitiatedStop && !this.isRunning) {
        this.streamStatus = 'standby';
        this.statusMessage = 'STANDBY · SIGNAL READY';
        this.notify();
      }
    });

    this.streamAudio.addEventListener('error', (e) => {
      // Ignore errors when src was cleared intentionally on stop
      if (!this.streamAudio?.src || this.streamAudio.src === window.location.href) {
        return;
      }
      console.warn('Audio stream connection event error:', e);
      if (this.isRunning) {
        this.handleStreamError();
      }
    });
  }

  private handleStreamError() {
    if (!this.isRunning) return;

    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.streamStatus = 'buffering';
      this.statusMessage = `RECONNECTING FEED (ATTEMPT ${this.retryCount}/${this.maxRetries})...`;
      this.notify();

      if (this.retryTimeout !== null) {
        window.clearTimeout(this.retryTimeout);
      }
      this.retryTimeout = window.setTimeout(() => {
        if (this.isRunning) {
          this.startStream(this.currentStreamUrl, true);
        }
      }, 1500);
    } else {
      this.streamStatus = 'offline';
      this.isRunning = false;
      this.analysisMode = 'standby';
      this.statusMessage = 'SIGNAL OFFLINE · TRANSMISSION UNREACHABLE';
      this.notify();
    }
  }

  private initContext() {
    if (!this.ctx) {
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioContextClass();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

        this.tapeFilter = this.ctx.createBiquadFilter();
        this.tapeFilter.type = 'lowpass';
        this.tapeFilter.frequency.setValueAtTime(14000, this.ctx.currentTime);

        this.tapeFilter.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      } catch (err) {
        console.warn('Web Audio initialization error:', err);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.isRunning, this.streamStatus, this.statusMessage);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribeRave(listener: RaveListener): () => void {
    this.raveListeners.add(listener);
    listener(this.ravePressureActive);
    return () => {
      this.raveListeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.isRunning, this.streamStatus, this.statusMessage));
  }

  private notifyRave() {
    this.raveListeners.forEach((l) => l(this.ravePressureActive));
  }

  public getIsPlaying(): boolean {
    return this.isRunning;
  }

  public getStreamStatus(): StreamStatus {
    return this.streamStatus;
  }

  public getStatusMessage(): string {
    return this.statusMessage;
  }

  public getAnalysisMode(): AnalysisMode {
    if (!this.isRunning || this.streamStatus !== 'live') {
      return 'standby';
    }
    return this.analysisMode === 'dsp' ? 'dsp' : 'modeled';
  }

  // --- RAVE PRESSURE (Visual Intensity Only - ZERO audio modification) ---

  public toggleRavePressure(): boolean {
    this.ravePressureActive = !this.ravePressureActive;
    this.notifyRave();
    return this.ravePressureActive;
  }

  public setRavePressure(active: boolean) {
    this.ravePressureActive = active;
    this.notifyRave();
  }

  public getRavePressure(): boolean {
    return this.ravePressureActive;
  }

  // --- Transport Controls ---

  public togglePlay(urlToUse?: string): { success: boolean; message: string } {
    if (this.isRunning) {
      this.pause();
      return { success: true, message: 'SIGNAL PAUSED' };
    }

    const url = (urlToUse !== undefined ? urlToUse : this.currentStreamUrl || STREAM_CONFIG.STREAM_URL).trim();

    if (!url) {
      this.isRunning = false;
      this.streamStatus = 'offline';
      this.analysisMode = 'standby';
      this.statusMessage = 'SIGNAL OFFLINE · TRANSMISSION NOT CONFIGURED';
      this.updateMediaSessionState('none');
      this.notify();
      return {
        success: false,
        message: 'SIGNAL OFFLINE · Custom stream URL not configured yet in streamConfig.ts',
      };
    }

    this.startStream(url);
    return { success: true, message: 'CONNECTING...' };
  }

  public startStream(url: string, forceReconnect: boolean = false) {
    const cleanUrl = url.trim();
    if (!cleanUrl) {
      this.streamStatus = 'offline';
      this.isRunning = false;
      this.analysisMode = 'standby';
      this.statusMessage = 'SIGNAL OFFLINE · TRANSMISSION NOT CONFIGURED';
      this.updateMediaSessionState('none');
      this.notify();
      return;
    }

    // If stream is already actively playing the identical URL, do not cause audio dropout
    if (
      !forceReconnect &&
      this.isRunning &&
      this.streamStatus === 'live' &&
      this.currentStreamUrl === cleanUrl &&
      this.streamAudio &&
      !this.streamAudio.paused
    ) {
      this.updateMediaSessionMetadata();
      this.updateMediaSessionState('playing');
      return;
    }

    // Quick resume if same URL is already loaded and paused
    if (
      !forceReconnect &&
      this.currentStreamUrl === cleanUrl &&
      this.streamAudio &&
      this.streamAudio.src &&
      this.streamAudio.paused
    ) {
      this.isUserInitiatedStop = false;
      this.isRunning = true;
      this.streamStatus = 'buffering';
      this.statusMessage = 'RESUMING TRANSMISSION...';
      this.notify();

      const playPromise = this.streamAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.streamStatus = 'live';
            this.statusMessage = 'LIVE ON AIR · 104.5 FM';
            this.retryCount = 0;
            this.updateMediaSessionMetadata();
            this.updateMediaSessionState('playing');
            this.requestWakeLock();
            this.notify();
          })
          .catch(() => {
            // fallback to fresh load
            this.startStream(cleanUrl, true);
          });
        return;
      }
    }

    this.currentStreamUrl = cleanUrl;
    this.isUserInitiatedStop = false;
    this.initStreamAudio();
    if (!this.streamAudio) return;

    if (this.retryTimeout !== null) {
      window.clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }

    this.isRunning = true;
    this.streamStatus = 'buffering';
    this.statusMessage = 'CONNECTING TO TRANSMITTER...';
    this.analysisMode = 'modeled';
    this.notify();

    try {
      this.streamAudio.src = cleanUrl;
      this.streamAudio.volume = this.isMuted ? 0 : this.volume;
      this.streamAudio.load();

      const playPromise = this.streamAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (!this.isRunning) return;
            this.streamStatus = 'live';
            this.statusMessage = 'LIVE ON AIR · 104.5 FM';
            this.retryCount = 0;
            this.updateMediaSessionMetadata();
            this.updateMediaSessionState('playing');
            this.requestWakeLock();
            this.notify();
          })
          .catch((err) => {
            if (err.name === 'AbortError') {
              // Expected when pause() or channel switch occurred before playback started
              return;
            }
            console.warn('Playback error or abort:', err);
            if (!this.isRunning) return;
            this.handleStreamError();
          });
      }
    } catch (err) {
      console.warn('Audio startStream exception:', err);
      this.handleStreamError();
    }
  }

  public pause() {
    this.isUserInitiatedStop = true;
    this.isRunning = false;
    this.releaseWakeLock();
    if (this.retryTimeout !== null) {
      window.clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    if (this.streamAudio) {
      this.streamAudio.pause();
      // Keep src intact so audio stream buffer & connection context remain ready for instant resume
    }
    this.streamStatus = 'standby';
    this.analysisMode = 'standby';
    this.statusMessage = 'SIGNAL PAUSED';
    this.updateMediaSessionState('paused');
    this.notify();
  }

  public stop() {
    this.isUserInitiatedStop = true;
    this.isRunning = false;
    this.retryCount = 0;
    this.releaseWakeLock();
    if (this.retryTimeout !== null) {
      window.clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    if (this.streamAudio) {
      this.streamAudio.pause();
      // Cleanly teardown Icecast socket to avoid stale connection or hanging HTTP requests
      this.streamAudio.removeAttribute('src');
      this.streamAudio.load();
    }
    this.streamStatus = 'standby';
    this.analysisMode = 'standby';
    this.statusMessage = 'STANDBY · SIGNAL READY';
    this.updateMediaSessionState('none');
    this.notify();
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.streamAudio) {
      this.streamAudio.volume = this.isMuted ? 0 : this.volume;
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.streamAudio) {
      this.streamAudio.volume = this.isMuted ? 0 : this.volume;
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleTapeSaturation(): boolean {
    this.tapeSaturationActive = !this.tapeSaturationActive;
    if (this.tapeFilter && this.ctx) {
      const freq = this.tapeSaturationActive ? 3200 : 14000;
      this.tapeFilter.frequency.exponentialRampToValueAtTime(freq, this.ctx.currentTime + 0.1);
    }
    return this.tapeSaturationActive;
  }

  public getTapeSaturation(): boolean {
    return this.tapeSaturationActive;
  }

  public setPreset(preset: EqualizerPresetId) {
    this.currentPreset = preset;
    if (preset === 'deep_house') {
      this.bpm = 122.0;
    } else if (preset === 'tech_house') {
      this.bpm = 126.0;
    } else if (preset === 'peak_techno') {
      this.bpm = 138.0;
    }
    this.presetListeners.forEach((cb) => cb(preset));
  }

  public getPreset(): EqualizerPresetId {
    return this.currentPreset;
  }

  public subscribePreset(callback: PresetListener): () => void {
    this.presetListeners.add(callback);
    callback(this.currentPreset);
    return () => this.presetListeners.delete(callback);
  }

  // --- KONTROLL UNDERGROUND AUDIO REACTOR DATA PROVIDER ---

  /**
   * High performance spectrum telemetry provider for canvas equalizers.
   * Computes 64 or 32 bands with asymmetric inertia, beat-accurate attack & release, and 3 club presets.
   */
  public getReactorData(numBands: number = 64): {
    bands: Float32Array;
    peaks: Float32Array;
    clipFlags: boolean[];
    metrics: ReactorMetrics;
  } {
    const now = performance.now();
    const dt = Math.min(0.05, Math.max(0.001, (now - this.lastTime) / 1000));
    this.lastTime = now;

    // Resize internal buffers if band resolution changed
    if (this.reactorBands.length !== numBands) {
      this.reactorBands = new Float32Array(numBands);
      this.reactorPeaks = new Float32Array(numBands);
      this.peakHoldExpiry = new Float64Array(numBands);
      this.clipFlags = new Array(numBands).fill(false);
    }

    const isLive = this.isRunning && this.streamStatus === 'live';

    // Standby resting state: calm, subtle breathing baseline (no hectic jumping)
    if (!isLive) {
      const timeSec = now / 1000;
      for (let i = 0; i < numBands; i++) {
        const normIndex = i / numBands;
        // Calm resting curve (0.02 - 0.06 amplitude)
        const idleWave = Math.sin(timeSec * 1.2 + normIndex * 3.0) * 0.015 + 0.035;
        this.reactorBands[i] += (idleWave - this.reactorBands[i]) * Math.min(1.0, dt * 3.5);
        this.reactorPeaks[i] = Math.max(this.reactorBands[i], this.reactorPeaks[i] - dt * 0.5);
        this.clipFlags[i] = false;
      }
      return {
        bands: this.reactorBands,
        peaks: this.reactorPeaks,
        clipFlags: this.clipFlags,
        metrics: {
          bpm: this.bpm,
          subDb: -42,
          midDb: -45,
          highDb: -48,
          peakDb: -40,
          ravePressure: this.ravePressureActive,
          analysisMode: 'standby',
          clipDetected: false,
          preset: this.currentPreset,
        },
      };
    }

    this.analysisMode = 'modeled';

    // Compute target spectrum targets according to active Preset & RAVE mode
    const targetBands = new Float32Array(numBands);
    const raveMult = this.ravePressureActive ? 1.28 : 1.0;
    const beatInterval = 60 / this.bpm; // Beat period in seconds
    const timeSec = now / 1000;
    const beatPos = (timeSec % beatInterval) / beatInterval; // 0.0 to 1.0 within beat
    this.phrasePhase = ((timeSec / beatInterval) % 16) / 16;

    // Club Rhythm Physics based on active Preset:
    let kickDecayRate: number;
    let kickIntensity: number;
    let subWeight: number;
    let midActivity: number;
    let highSizzle: number;
    let peakExcursionScale: number;

    if (this.currentPreset === 'deep_house') {
      // PRESET 01: DEEP HOUSE (122 BPM) - Warm deep rolling bass, softer decay, elegant highs
      kickDecayRate = 6.2;
      kickIntensity = 0.88;
      subWeight = 1.15;
      midActivity = 0.75;
      highSizzle = 0.65;
      peakExcursionScale = 0.86;
    } else if (this.currentPreset === 'tech_house') {
      // PRESET 02: TECH HOUSE (126 BPM) - Punchy 4/4 kick, snappy mids, driving hats
      kickDecayRate = 8.8;
      kickIntensity = 0.98;
      subWeight = 1.0;
      midActivity = 0.95;
      highSizzle = 0.88;
      peakExcursionScale = 0.94;
    } else {
      // PRESET 03: PEAK-TIME TECHNO (138 BPM) - Thunderous kick, heavy excursion, intense red tips
      kickDecayRate = 10.5;
      kickIntensity = 1.18;
      subWeight = 1.22;
      midActivity = 1.15;
      highSizzle = 1.12;
      peakExcursionScale = 1.12;
    }

    // 1. Kick Transient (30Hz - 90Hz): Fast attack, natural exponential release
    const kickEnvelope = Math.exp(-beatPos * kickDecayRate) * kickIntensity;
    const subRumble = (Math.sin(timeSec * 38 * Math.PI) * 0.12 + Math.cos(timeSec * 24 * Math.PI) * 0.08) * subWeight;

    // 2. Offbeat Hi-Hat (6kHz - 14kHz): Hits at beatPos ~0.5
    const offbeatDist = Math.abs(beatPos - 0.5);
    const openHatEnvelope = Math.exp(-offbeatDist * 22.0) * highSizzle;

    // 3. 16th-note rolling Shaker / Percussion:
    const sixteenthPos = (beatPos * 4) % 1.0;
    const sixteenthHat = Math.exp(-sixteenthPos * 14.0) * 0.5 * highSizzle;

    // 4. Snare / Claps on beats 2 and 4
    const measureBeat = (timeSec / beatInterval) % 4;
    const isClapBeat = (measureBeat >= 1 && measureBeat < 2) || (measureBeat >= 3 && measureBeat < 4);
    const clapPos = isClapBeat ? (measureBeat % 1) : 1;
    const clapEnvelope = Math.exp(-clapPos * 9.5) * 0.85 * midActivity;

    // 5. Filter Sweep modulation
    const sweepCenter = 0.25 + Math.sin(timeSec * 0.28) * 0.35;

    // Populate frequency bands
    for (let i = 0; i < numBands; i++) {
      const normFreq = i / numBands;
      let energy = 0;

      // Sub & Bass bands (first 26% of spectrum: 30Hz - 160Hz)
      if (normFreq < 0.26) {
        const bassFalloff = 1.0 - (normFreq / 0.26) * 0.28;
        const kickImpact = kickEnvelope * (0.90 + 0.10 * Math.sin(i * 1.4));
        const rollingBass = Math.max(0, subRumble * 1.1 + 0.38);
        energy = (kickImpact * 0.82 + rollingBass * 0.32) * bassFalloff * subWeight;
      }
      // Low Mids & Body (26% to 50%: 160Hz - 900Hz)
      else if (normFreq < 0.50) {
        const sweepPeak = Math.exp(-Math.pow(normFreq - sweepCenter, 2) * 32.0) * 0.72;
        const clapPunch = clapEnvelope * (0.65 + 0.25 * Math.sin(i * 2.3));
        const grooveTexture = (Math.sin(timeSec * (90 + i * 12)) * 0.5 + 0.5) * 0.22;
        energy = (sweepPeak * 0.42 + clapPunch * 0.40 + grooveTexture * 0.18) * midActivity;
      }
      // Upper Mids & Crisp Stabs (50% to 75%: 900Hz - 4.5kHz)
      else if (normFreq < 0.75) {
        const clapSnap = clapEnvelope * 0.68;
        const hatPresence = openHatEnvelope * 0.52;
        const harmonicGrit = (Math.sin(timeSec * 180 + i * 3.2) * 0.5 + 0.5) * 0.18;
        energy = (clapSnap * 0.45 + hatPresence * 0.38 + harmonicGrit * 0.17) * midActivity;
      }
      // Highs & Air (75% to 100%: 4.5kHz - 16kHz)
      else {
        const hatPeak = openHatEnvelope * 0.90;
        const shaker = sixteenthHat * 0.68;
        const airSizzle = (Math.sin(timeSec * 320 + i * 5.5) * 0.5 + 0.5) * 0.18;
        energy = (hatPeak * 0.58 + shaker * 0.30 + airSizzle * 0.12) * highSizzle;
      }

      // Dynamic subtle variation between adjacent bands
      const microVariance = (Math.sin(timeSec * 7.5 + i * 1.7) * 0.5 + 0.5) * 0.08;
      energy = Math.max(0.04, Math.min(1.0, (energy + microVariance) * raveMult * peakExcursionScale));

      // RAVE PRESSURE expansion: punchier spikes
      if (this.ravePressureActive) {
        energy = Math.pow(energy, 0.82) * 1.18;
      }

      targetBands[i] = Math.min(1.0, energy);
    }

    // Natural Attack & Release Physics with Damped Return
    let subSum = 0;
    let midSum = 0;
    let highSum = 0;
    let maxVal = 0;
    let clipOccurred = false;

    for (let i = 0; i < numBands; i++) {
      const target = targetBands[i];
      const normIndex = i / numBands;

      // Physically damped attack-and-release:
      // Fast attack upwards on transient hit, controlled damped springy return downwards
      let attackSpeed: number;
      let decayFactor: number;

      if (normIndex < 0.26) {
        // Sub bass: Heavy physical mass (rapid attack 0.86, smooth controlled decay 0.84)
        attackSpeed = this.ravePressureActive ? 0.92 : 0.86;
        decayFactor = this.currentPreset === 'deep_house' ? 0.80 : 0.84;
      } else if (normIndex < 0.65) {
        // Mids: Snappy transient (attack 0.90, controlled elastic decay 0.82)
        attackSpeed = 0.90;
        decayFactor = 0.82;
      } else {
        // Highs: High-speed agile sizzle (attack 0.96, snappy decay 0.74)
        attackSpeed = 0.96;
        decayFactor = 0.74;
      }

      // Attack (rising) vs Release (falling)
      if (target > this.reactorBands[i]) {
        this.reactorBands[i] += (target - this.reactorBands[i]) * attackSpeed;
      } else {
        // Controlled, damped downward motion (no harsh drops, no random trembling)
        this.reactorBands[i] += (target - this.reactorBands[i]) * (1.0 - decayFactor);
      }

      const val = Math.max(0, Math.min(1.0, this.reactorBands[i]));
      this.reactorBands[i] = val;

      // Peak Hold Logic:
      if (val >= this.reactorPeaks[i]) {
        this.reactorPeaks[i] = val;
        this.peakHoldExpiry[i] = now + (this.ravePressureActive ? 520 : 420);
      } else if (now > this.peakHoldExpiry[i]) {
        const gravity = (this.ravePressureActive ? 0.022 : 0.030) * (1.0 + normIndex * 0.4);
        this.reactorPeaks[i] = Math.max(val, this.reactorPeaks[i] - gravity);
      }

      // Clip detection (top excursion)
      const clipThreshold = this.currentPreset === 'peak_techno' 
        ? (this.ravePressureActive ? 0.82 : 0.88)
        : (this.ravePressureActive ? 0.85 : 0.93);
      const isClipping = val >= clipThreshold;
      this.clipFlags[i] = isClipping;
      if (isClipping) clipOccurred = true;

      if (normIndex < 0.26) subSum += val;
      else if (normIndex < 0.65) midSum += val;
      else highSum += val;

      if (val > maxVal) maxVal = val;
    }

    const normToDb = (norm: number) => {
      if (norm <= 0.01) return -48;
      return Math.round(20 * Math.log10(norm) * 1.2);
    };

    const subDb = normToDb(subSum / (numBands * 0.26));
    const midDb = normToDb(midSum / (numBands * 0.39));
    const highDb = normToDb(highSum / (numBands * 0.35));
    const peakDb = normToDb(maxVal);

    return {
      bands: this.reactorBands,
      peaks: this.reactorPeaks,
      clipFlags: this.clipFlags,
      metrics: {
        bpm: this.bpm,
        subDb,
        midDb,
        highDb,
        peakDb,
        ravePressure: this.ravePressureActive,
        analysisMode: this.analysisMode,
        clipDetected: clipOccurred,
        preset: this.currentPreset,
      },
    };
  }

  /**
   * Backward-compatible 24-band frequency provider for legacy visualizer components.
   */
  public getAnalyserData(): Uint8Array {
    const data = new Uint8Array(24);
    if (!this.isRunning || this.streamStatus !== 'live') {
      return data;
    }

    const reactor = this.getReactorData(24);
    for (let i = 0; i < 24; i++) {
      data[i] = Math.floor(reactor.bands[i] * 255);
    }
    return data;
  }

  // --- DJ Soundboard FX (Tactile booth triggers) ---

  public playFX(type: 'scratch' | 'airhorn' | 'rewind' | 'radio_drop' | 'sub_drop') {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    switch (type) {
      case 'scratch': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(360, t);
        osc.frequency.linearRampToValueAtTime(1200, t + 0.07);
        osc.frequency.linearRampToValueAtTime(180, t + 0.15);

        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.16);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.16);
        break;
      }
      case 'airhorn': {
        const freqs = [370, 466, 554];
        freqs.forEach((f) => {
          if (!this.ctx || !this.masterGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f, t);
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.32);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(t);
          osc.stop(t + 0.32);
        });
        break;
      }
      case 'rewind': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 0.45);

        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.45);
        break;
      }
      case 'sub_drop': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.65);

        gain.gain.setValueAtTime(0.6, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.65);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.65);
        break;
      }
      case 'radio_drop': {
        const chords = [523.25, 659.25, 783.99, 1046.5];
        chords.forEach((note, idx) => {
          if (!this.ctx || !this.masterGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(note, t + idx * 0.07);
          gain.gain.setValueAtTime(0.18, t + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.07 + 0.35);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(t + idx * 0.07);
          osc.stop(t + idx * 0.07 + 0.35);
        });
        break;
      }
    }
  }
}

export const audioEngine = new AudioEngine();
