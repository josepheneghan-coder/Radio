/**
 * KONTROLL RADIO Audio Engine
 * Dedicated radio transmission engine & Underground Audio Reactor:
 * - HTML5 Audio stream receiver for custom live feed (Icecast/Shoutcast/HLS)
 * - Safe Web Audio API Analyser tap with seamless CORS fallback
 * - High-precision Berlin Underground Techno / Schranz / Acid acoustic synthesis model
 * - Purely visual RAVE PRESSURE mode (zero volume alteration)
 * - Hardware DJ Soundboard FX triggers (Tactile analog scratch, rewind, 808 sub drops)
 */

import { StreamStatus, AnalysisMode, ReactorMetrics } from '../types/radio';
import { STREAM_CONFIG } from '../config/streamConfig';

type StateListener = (isPlaying: boolean, status: StreamStatus, message?: string) => void;
type RaveListener = (isRave: boolean) => void;

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
  private statusMessage: string = 'STANDBY // SIGNAL READY';
  private analysisMode: AnalysisMode = 'standby';
  private ravePressureActive: boolean = false;

  // Event Listeners
  private listeners: Set<StateListener> = new Set();
  private raveListeners: Set<RaveListener> = new Set();

  // Reactor Simulation & Peak Hold Cache
  private lastTime: number = performance.now();
  private reactorBands: Float32Array = new Float32Array(64);
  private reactorPeaks: Float32Array = new Float32Array(64);
  private peakHoldExpiry: Float64Array = new Float64Array(64);
  private clipFlags: boolean[] = new Array(64).fill(false);
  private bpm: number = 142.0; // Underground industrial techno tempo
  private phrasePhase: number = 0; // 0 to 1 for long phrase filter sweeps

  constructor() {
    if (typeof window !== 'undefined') {
      this.initStreamAudio();
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
        this.statusMessage = 'LIVE ON AIR // 104.5 FM';
        this.retryCount = 0;
        this.notify();
      }
    });

    this.streamAudio.addEventListener('playing', () => {
      if (this.isRunning) {
        this.streamStatus = 'live';
        this.statusMessage = 'LIVE ON AIR // 104.5 FM';
        this.retryCount = 0;
        this.notify();
      }
    });

    this.streamAudio.addEventListener('pause', () => {
      // Only transition to standby if user explicitly stopped
      if (this.isUserInitiatedStop && !this.isRunning) {
        this.streamStatus = 'standby';
        this.statusMessage = 'STANDBY // SIGNAL READY';
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
      this.statusMessage = 'SIGNAL OFFLINE // TRANSMISSION UNREACHABLE';
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
      this.stop();
      return { success: true, message: 'SIGNAL PAUSED' };
    }

    const url = (urlToUse !== undefined ? urlToUse : this.currentStreamUrl || STREAM_CONFIG.STREAM_URL).trim();

    if (!url) {
      this.isRunning = false;
      this.streamStatus = 'offline';
      this.analysisMode = 'standby';
      this.statusMessage = 'SIGNAL OFFLINE // TRANSMISSION NOT CONFIGURED';
      this.notify();
      return {
        success: false,
        message: 'SIGNAL OFFLINE // Custom stream URL not configured yet in streamConfig.ts',
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
      this.statusMessage = 'SIGNAL OFFLINE // TRANSMISSION NOT CONFIGURED';
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
      return;
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
            this.statusMessage = 'LIVE ON AIR // 104.5 FM';
            this.retryCount = 0;
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

  public stop() {
    this.isUserInitiatedStop = true;
    this.isRunning = false;
    this.retryCount = 0;
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
    this.statusMessage = 'STANDBY // SIGNAL READY';
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

  // --- KONTROLL UNDERGROUND AUDIO REACTOR DATA PROVIDER ---

  /**
   * High performance spectrum telemetry provider for canvas equalizers.
   * Computes 64 or 32 bands with asymmetric inertia, physical peak holds, and RAVE PRESSURE dynamics.
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

    // Standby resting state
    if (!isLive) {
      for (let i = 0; i < numBands; i++) {
        // Smoothly decay to zero resting floor
        this.reactorBands[i] = Math.max(0, this.reactorBands[i] - dt * 2.0);
        this.reactorPeaks[i] = Math.max(0, this.reactorPeaks[i] - dt * 1.5);
        this.clipFlags[i] = false;
      }
      return {
        bands: this.reactorBands,
        peaks: this.reactorPeaks,
        clipFlags: this.clipFlags,
        metrics: {
          bpm: this.bpm,
          subDb: -48,
          midDb: -48,
          highDb: -48,
          peakDb: -48,
          ravePressure: this.ravePressureActive,
          analysisMode: 'standby',
          clipDetected: false,
        },
      };
    }

    this.analysisMode = 'modeled';

    // Compute target spectrum targets
    const targetBands = new Float32Array(numBands);
    const raveMult = this.ravePressureActive ? 1.35 : 1.0;
      // --- INDUSTRIAL TECHNO / HARD TECHNO / SCHRANZ ACOUSTIC SYNTHESIS MODEL ---
      // 142 BPM = 2.3666 Hz beat frequency.
      const beatInterval = 60 / this.bpm; // ~0.4225s
      const timeSec = now / 1000;
      const beatPos = (timeSec % beatInterval) / beatInterval; // 0.0 to 1.0 within beat
      const bar16Pos = ((timeSec / beatInterval) % 16) / 16; // 16-bar phase for filter sweeps
      this.phrasePhase = bar16Pos;

      // 1. Kick Transient (30Hz - 80Hz): Heavy 4-on-the-floor sub slam
      // Attack is instant, exponential decay over ~220ms
      const kickEnvelope = Math.exp(-beatPos * 8.5);
      const subRumble = Math.sin(timeSec * 45 * Math.PI) * 0.15 + Math.cos(timeSec * 28 * Math.PI) * 0.1;

      // 2. Offbeat Hi-Hat (6kHz - 14kHz): hits at beatPos ~0.5
      const offbeatPos = Math.abs(beatPos - 0.5);
      const openHatEnvelope = Math.exp(-offbeatPos * 22.0) * 0.95;

      // 3. 16th-note rolling Shaker / Industrial Clatter:
      const sixteenthPos = (beatPos * 4) % 1.0;
      const sixteenthHat = Math.exp(-sixteenthPos * 16.0) * 0.5;

      // 4. Snare / Industrial Clap on beats 2 and 4 (beat index 1 and 3 in 4-beat measure)
      const measureBeat = (timeSec / beatInterval) % 4;
      const isClapBeat = measureBeat >= 1 && measureBeat < 2 || measureBeat >= 3 && measureBeat < 4;
      const clapPos = isClapBeat ? (measureBeat % 1) : 1;
      const clapEnvelope = Math.exp(-clapPos * 10.0) * 0.85;

      // 5. Acid / Resonance Filter Sweep (moving resonant peak across mid bands 15 to 45)
      const sweepCenter = 0.2 + Math.sin(timeSec * 0.35) * 0.4 + Math.sin(timeSec * 0.12) * 0.25;

      // Populate frequency bands with club physics
      for (let i = 0; i < numBands; i++) {
        const normFreq = i / numBands; // 0.0 (sub) to 1.0 (ultra-high)

        let energy = 0;

        // Sub & Bass bands (first 25% of spectrum: 30Hz - 150Hz)
        if (normFreq < 0.22) {
          const bassWeight = 1.0 - (normFreq / 0.22) * 0.35;
          const punch = kickEnvelope * (0.85 + 0.15 * Math.sin(i * 1.5));
          const lowSub = Math.max(0, subRumble * 1.2 + 0.35);
          energy = (punch * 0.75 + lowSub * 0.35) * bassWeight;
        }
        // Low Mids & Industrial Body (22% to 45%: 150Hz - 800Hz)
        else if (normFreq < 0.45) {
          const midDist = (normFreq - 0.22) / 0.23;
          const acidSweep = Math.exp(-Math.pow(normFreq - sweepCenter, 2) * 35.0) * 0.75;
          const clapPunch = clapEnvelope * (0.6 + 0.3 * Math.sin(i * 2.1));
          const industrialNoise = (Math.sin(timeSec * (120 + i * 15)) * 0.5 + 0.5) * 0.25;
          energy = (acidSweep * 0.45 + clapPunch * 0.35 + industrialNoise * 0.2) * (1.0 - midDist * 0.15);
        }
        // Upper Mids & Crisp Clangs (45% to 70%: 800Hz - 4kHz)
        else if (normFreq < 0.70) {
          const clapSnap = clapEnvelope * 0.7;
          const hatEdge = openHatEnvelope * 0.5;
          const acidEdge = Math.exp(-Math.pow(normFreq - sweepCenter, 2) * 40.0) * 0.5;
          const harmonicDistortion = Math.sin(timeSec * 210 + i * 3.7) * 0.15 + 0.15;
          energy = clapSnap * 0.35 + hatEdge * 0.3 + acidEdge * 0.2 + harmonicDistortion;
        }
        // Highs & Air (70% to 100%: 4kHz - 16kHz)
        else {
          const hatPeak = openHatEnvelope * 0.85;
          const shaker = sixteenthHat * 0.65;
          const cymbalWash = (Math.sin(timeSec * 450 + i * 7.1) * 0.5 + 0.5) * 0.22;
          energy = hatPeak * 0.55 + shaker * 0.35 + cymbalWash * 0.2;
        }

        // Add subtle dynamic variance so adjacent bands don't lock perfectly
        const bandNoise = (Math.sin(timeSec * 8.0 + i * 1.8) * 0.5 + 0.5) * 0.12;
        energy = Math.max(0.02, Math.min(1.0, (energy + bandNoise) * raveMult));

        // RAVE PRESSURE dynamic expansion (boost contrast and peak spikes)
        if (this.ravePressureActive) {
          energy = Math.pow(energy, 0.85) * 1.15;
        }

        targetBands[i] = Math.min(1.0, energy);
      }

    // Apply asymmetric physical inertia and peak holds
    let subSum = 0;
    let midSum = 0;
    let highSum = 0;
    let maxVal = 0;
    let clipOccurred = false;

    for (let i = 0; i < numBands; i++) {
      const target = targetBands[i];
      const normIndex = i / numBands;

      // Asymmetric inertia:
      // Bass (low normIndex): heavy inertia (slower decay ~0.91, heavy weight)
      // Highs (high normIndex): razor-fast attack (0.95), snappy decay (0.78)
      let attackSpeed: number;
      let decaySpeed: number;

      if (normIndex < 0.25) {
        // Sub-bass heavy inertia
        attackSpeed = this.ravePressureActive ? 0.88 : 0.80;
        decaySpeed = this.ravePressureActive ? 0.88 : 0.85;
      } else if (normIndex < 0.65) {
        // Mids punchy response
        attackSpeed = 0.86;
        decaySpeed = 0.80;
      } else {
        // Highs agile sizzle
        attackSpeed = 0.95;
        decaySpeed = 0.72;
      }

      if (target > this.reactorBands[i]) {
        this.reactorBands[i] += (target - this.reactorBands[i]) * attackSpeed;
      } else {
        this.reactorBands[i] += (target - this.reactorBands[i]) * (1.0 - decaySpeed);
      }

      const val = Math.max(0, Math.min(1.0, this.reactorBands[i]));
      this.reactorBands[i] = val;

      // Peak Hold Logic:
      if (val >= this.reactorPeaks[i]) {
        this.reactorPeaks[i] = val;
        this.peakHoldExpiry[i] = now + (this.ravePressureActive ? 550 : 380); // hold for ~400ms
      } else if (now > this.peakHoldExpiry[i]) {
        // Smooth gravitational fall after hold expires
        const gravity = (this.ravePressureActive ? 0.025 : 0.035) * (1.0 + normIndex * 0.5);
        this.reactorPeaks[i] = Math.max(val, this.reactorPeaks[i] - gravity);
      }

      // Clip detection (top 8% threshold or RAVE overload)
      const clipThreshold = this.ravePressureActive ? 0.86 : 0.94;
      const isClipping = val >= clipThreshold;
      this.clipFlags[i] = isClipping;
      if (isClipping) clipOccurred = true;

      // Accumulate metrics
      if (normIndex < 0.25) subSum += val;
      else if (normIndex < 0.65) midSum += val;
      else highSum += val;

      if (val > maxVal) maxVal = val;
    }

    // Convert normalized metrics to dB representation (-48dB to +3dB)
    const normToDb = (norm: number) => {
      if (norm <= 0.01) return -48;
      return Math.round(20 * Math.log10(norm) * 1.2);
    };

    const subDb = normToDb(subSum / (numBands * 0.25));
    const midDb = normToDb(midSum / (numBands * 0.40));
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
        analysisMode: this.getAnalysisMode(),
        clipDetected: clipOccurred,
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
