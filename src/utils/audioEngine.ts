/**
 * KONTROLL RADIO Audio Engine
 * Hybrid streaming & synthesis system:
 * - Real live stream relay (HTML5 Audio for MP3/AAC/Opus feeds)
 * - Procedural Web Audio API analog synth presets (Minimal Synth, Dub Techno, Acid 303, Ambient Drones)
 * - DJ Soundboard FX (Scratch, Airhorn, Turntable Rewind, 808 Sub Drop, Station ID)
 */

import { StreamStatus } from '../types/radio';

export type EngineMode = 'stream' | 'synth';

type StateListener = (isPlaying: boolean, status: StreamStatus, mode: EngineMode) => void;

class AudioEngine {
  // Web Audio Context for Synth & Soundboard FX
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private tapeFilter: BiquadFilterNode | null = null;

  // Real HTML5 Live Stream Audio Element
  private streamAudio: HTMLAudioElement | null = null;
  private currentStreamUrl: string = 'https://cdn-peer012.streaming-pro.com:8025/ibizaglobalradio.mp3';

  // State
  private isRunning: boolean = false;
  private mode: EngineMode = 'stream';
  private streamStatus: StreamStatus = 'idle';
  private currentPreset: 'synth' | 'dub' | 'acid' | 'ambient' = 'synth';
  private timerId: number | null = null;
  private step: number = 0;
  private volume: number = 0.85;
  private isMuted: boolean = false;
  private tapeSaturationActive: boolean = false;
  private listeners: Set<StateListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initStreamAudio();
    }
  }

  private initStreamAudio() {
    if (this.streamAudio) return;

    this.streamAudio = new Audio();
    this.streamAudio.preload = 'none';
    this.streamAudio.src = this.currentStreamUrl;
    this.streamAudio.volume = this.volume;

    this.streamAudio.addEventListener('loadstart', () => {
      this.streamStatus = 'buffering';
      this.notify();
    });

    this.streamAudio.addEventListener('waiting', () => {
      this.streamStatus = 'buffering';
      this.notify();
    });

    this.streamAudio.addEventListener('playing', () => {
      this.streamStatus = 'live';
      this.isRunning = true;
      this.notify();
    });

    this.streamAudio.addEventListener('pause', () => {
      if (this.mode === 'stream') {
        this.isRunning = false;
        this.streamStatus = 'idle';
        this.notify();
      }
    });

    this.streamAudio.addEventListener('error', () => {
      this.streamStatus = 'error';
      this.notify();
    });
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      this.tapeFilter = this.ctx.createBiquadFilter();
      this.tapeFilter.type = 'lowpass';
      this.tapeFilter.frequency.setValueAtTime(14000, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;

      // Routing: Synth -> Tape Filter -> Master Gain -> Analyser -> Destination
      this.tapeFilter.connect(this.masterGain);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.isRunning, this.streamStatus, this.mode);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.isRunning, this.streamStatus, this.mode));
  }

  public getIsPlaying(): boolean {
    return this.isRunning;
  }

  public getStreamStatus(): StreamStatus {
    return this.streamStatus;
  }

  public getMode(): EngineMode {
    return this.mode;
  }

  public togglePlay(): boolean {
    if (this.isRunning) {
      this.stop();
      return false;
    } else {
      if (this.mode === 'stream') {
        this.startStream();
      } else {
        this.startSynth();
      }
      return true;
    }
  }

  // --- Real Live Stream Mode ---

  public startStream(url: string = this.currentStreamUrl) {
    this.mode = 'stream';
    this.currentStreamUrl = url;
    this.stopSynth();

    this.initStreamAudio();
    if (!this.streamAudio) return;

    if (this.streamAudio.src !== url) {
      this.streamAudio.src = url;
    }

    this.streamAudio.volume = this.isMuted ? 0 : this.volume;
    this.streamStatus = 'buffering';
    this.isRunning = true;
    this.notify();

    const playPromise = this.streamAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.streamStatus = 'live';
          this.isRunning = true;
          this.notify();
        })
        .catch(() => {
          this.streamStatus = 'error';
          this.notify();
        });
    }
  }

  public stopStream() {
    if (this.streamAudio) {
      this.streamAudio.pause();
    }
    this.streamStatus = 'idle';
  }

  // --- Web Audio Synth Mode ---

  public startSynth(preset: 'synth' | 'dub' | 'acid' | 'ambient' = this.currentPreset) {
    this.mode = 'synth';
    this.currentPreset = preset;
    this.stopStream();

    this.initContext();
    this.isRunning = true;
    this.notify();

    if (this.timerId) {
      window.clearInterval(this.timerId);
    }

    const interval =
      preset === 'dub' ? 460 : preset === 'acid' ? 220 : preset === 'ambient' ? 800 : 340;
    this.step = 0;
    this.playStep();
    this.timerId = window.setInterval(() => {
      this.playStep();
    }, interval);
  }

  private stopSynth() {
    if (this.timerId) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  public stop() {
    this.isRunning = false;
    this.stopStream();
    this.stopSynth();
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

  public getAnalyserData(): Uint8Array {
    if (this.mode === 'synth' && this.analyser) {
      const data = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(data);
      return data;
    }

    // Dynamic procedural frequency response during real stream playback
    const fakeData = new Uint8Array(32);
    const now = Date.now() / 150;
    for (let i = 0; i < 32; i++) {
      if (this.isRunning && this.streamStatus === 'live') {
        const beat = Math.sin(now * 1.8 + i * 0.45);
        const sub = Math.cos(now * 0.9 + i * 0.2);
        const jitter = Math.sin(now * 4.2 + i * 1.2);
        const amp = Math.max(0, Math.min(255, (beat * 0.5 + sub * 0.3 + jitter * 0.2 + 0.5) * 230));
        fakeData[i] = amp;
      } else {
        fakeData[i] = 0;
      }
    }
    return fakeData;
  }

  // --- Procedural Synth Implementation ---

  private playStep() {
    if (!this.ctx || !this.isRunning || !this.tapeFilter || this.mode !== 'synth') return;

    const t = this.ctx.currentTime;
    this.step = (this.step + 1) % 16;

    if (this.currentPreset === 'synth') {
      if (this.step % 4 === 0) {
        this.synthKick(t, 90, 0.28);
      }
      if (this.step === 4 || this.step === 12) {
        this.synthSnare(t);
      }
      if (this.step % 2 === 0) {
        this.synthHat(t, this.step % 4 === 2 ? 0.08 : 0.04);
      }
      const bassNotes = [110, 110, 130.81, 110, 146.83, 130.81, 110, 98];
      const freq = bassNotes[this.step % bassNotes.length];
      this.synthBassNote(t, freq, 0.18, 'sawtooth');
    } else if (this.currentPreset === 'dub') {
      if (this.step % 8 === 0) {
        this.synthKick(t, 55, 0.45);
      }
      if (this.step === 4 || this.step === 12) {
        this.synthHat(t, 0.05);
      }
      if (this.step === 2 || this.step === 10) {
        this.dubChord(t, [130.81, 155.56, 196.0, 246.94]);
      }
    } else if (this.currentPreset === 'acid') {
      if (this.step % 4 === 0) {
        this.synthKick(t, 120, 0.2);
      }
      if (this.step % 2 === 1) {
        this.synthHat(t, 0.06);
      }
      const acidNotes = [65.41, 65.41, 130.81, 98.0, 116.54, 87.31, 130.81, 146.83];
      const f = acidNotes[this.step % acidNotes.length];
      const accent = this.step === 2 || this.step === 10;
      this.acid303Note(t, f, accent);
    } else if (this.currentPreset === 'ambient') {
      const chord = [65.41, 98.0, 130.81, 164.81];
      const note = chord[this.step % chord.length];
      this.ambientDrone(t, note);
    }
  }

  private synthKick(t: number, startFreq: number, decay: number) {
    if (!this.ctx || !this.tapeFilter) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(32, t + decay);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + decay);

    osc.connect(gain);
    gain.connect(this.tapeFilter);

    osc.start(t);
    osc.stop(t + decay);
  }

  private synthSnare(t: number) {
    if (!this.ctx || !this.tapeFilter) return;
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.12);

    oscGain.gain.setValueAtTime(0.4, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(oscGain);
    oscGain.connect(this.tapeFilter);
    osc.start(t);
    osc.stop(t + 0.12);

    const node = this.ctx.createBufferSource();
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.15, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    node.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    node.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.tapeFilter);

    node.start(t);
  }

  private synthHat(t: number, vol: number) {
    if (!this.ctx || !this.tapeFilter) return;
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.05, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const node = this.ctx.createBufferSource();
    node.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7500;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    node.connect(filter);
    filter.connect(gain);
    gain.connect(this.tapeFilter);

    node.start(t);
  }

  private synthBassNote(t: number, freq: number, dur: number, type: OscillatorType) {
    if (!this.ctx || !this.tapeFilter) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(250, t + dur);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.tapeFilter);

    osc.start(t);
    osc.stop(t + dur);
  }

  private dubChord(t: number, freqs: number[]) {
    if (!this.ctx || !this.tapeFilter) return;
    freqs.forEach((freq) => {
      if (!this.ctx || !this.tapeFilter) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, t);
      filter.frequency.exponentialRampToValueAtTime(280, t + 0.9);
      filter.Q.value = 4;

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.tapeFilter);

      osc.start(t);
      osc.stop(t + 0.9);
    });
  }

  private acid303Note(t: number, freq: number, accent: boolean) {
    if (!this.ctx || !this.tapeFilter) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);

    filter.type = 'lowpass';
    filter.Q.value = accent ? 18 : 10;
    const startCutoff = accent ? 3800 : 1600;
    filter.frequency.setValueAtTime(startCutoff, t);
    filter.frequency.exponentialRampToValueAtTime(240, t + 0.18);

    gain.gain.setValueAtTime(accent ? 0.35 : 0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.tapeFilter);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  private ambientDrone(t: number, freq: number) {
    if (!this.ctx || !this.tapeFilter) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.tapeFilter);

    osc.start(t);
    osc.stop(t + 1.2);
  }

  // --- DJ Soundboard FX ---

  public playFX(type: 'scratch' | 'airhorn' | 'rewind' | 'radio_drop' | 'sub_drop') {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    switch (type) {
      case 'scratch': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.linearRampToValueAtTime(1400, t + 0.08);
        osc.frequency.linearRampToValueAtTime(200, t + 0.16);

        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.18);
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
          gain.gain.setValueAtTime(0.25, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(t);
          osc.stop(t + 0.35);
        });
        break;
      }
      case 'rewind': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(900, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.5);

        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.5);
        break;
      }
      case 'sub_drop': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(32, t + 0.7);

        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.7);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.7);
        break;
      }
      case 'radio_drop': {
        const chords = [523.25, 659.25, 783.99, 1046.5];
        chords.forEach((note, idx) => {
          if (!this.ctx || !this.masterGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(note, t + idx * 0.08);
          gain.gain.setValueAtTime(0.2, t + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.08 + 0.4);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(t + idx * 0.08);
          osc.stop(t + idx * 0.08 + 0.4);
        });
        break;
      }
    }
  }
}

export const audioEngine = new AudioEngine();
