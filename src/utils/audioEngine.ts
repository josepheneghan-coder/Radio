/**
 * Underground Radio Web Audio Synthesizer & Soundboard Engine
 * Provides persistent, zero-latency, procedural analog soundscapes
 * (Minimal Synth, Dub Techno, Acid Bassline) and vinyl/DJ sound effects.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private tapeFilter: BiquadFilterNode | null = null;
  private isRunning: boolean = false;
  private currentPreset: 'synth' | 'dub' | 'acid' | 'ambient' = 'synth';
  private timerId: number | null = null;
  private step: number = 0;
  private volume: number = 0.8;
  private isMuted: boolean = false;
  private tapeSaturationActive: boolean = false;
  private listeners: Set<(isPlaying: boolean) => void> = new Set();

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

  public subscribe(listener: (isPlaying: boolean) => void): () => void {
    this.listeners.add(listener);
    listener(this.isRunning);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.isRunning));
  }

  public togglePlay(): boolean {
    if (this.isRunning) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public start(preset: 'synth' | 'dub' | 'acid' | 'ambient' = this.currentPreset) {
    this.initContext();
    this.currentPreset = preset;
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

  public stop() {
    this.isRunning = false;
    if (this.timerId) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    this.notify();
  }

  public getIsPlaying(): boolean {
    return this.isRunning;
  }

  public setPreset(preset: 'synth' | 'dub' | 'acid' | 'ambient') {
    this.currentPreset = preset;
    if (this.isRunning) {
      this.start(preset);
    }
  }

  public getPreset() {
    return this.currentPreset;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
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
    if (!this.analyser) {
      return new Uint8Array(32);
    }
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  private playStep() {
    if (!this.ctx || !this.isRunning || !this.tapeFilter) return;

    const t = this.ctx.currentTime;
    this.step = (this.step + 1) % 16;

    if (this.currentPreset === 'synth') {
      // Minimal Synth / Coldwave Bassline & Rhythm
      // Four-on-the-floor dark kick on 0, 4, 8, 12
      if (this.step % 4 === 0) {
        this.synthKick(t, 90, 0.28);
      }
      // Snappy electro snare on 4, 12
      if (this.step === 4 || this.step === 12) {
        this.synthSnare(t);
      }
      // Running 16th hats
      if (this.step % 2 === 0) {
        this.synthHat(t, this.step % 4 === 2 ? 0.08 : 0.04);
      }
      // Melodic arpeggio bass note
      const bassNotes = [110, 110, 130.81, 110, 146.83, 130.81, 110, 98];
      const freq = bassNotes[this.step % bassNotes.length];
      this.synthBassNote(t, freq, 0.18, 'sawtooth');
    } else if (this.currentPreset === 'dub') {
      // Deep Berlin Dub Techno Chord & Sub Kick
      if (this.step % 8 === 0) {
        this.synthKick(t, 55, 0.45);
      }
      if (this.step === 4 || this.step === 12) {
        this.synthHat(t, 0.05);
      }
      // Filtered minor 9th dub chord stab on 2 and 10 with long reverb delay emulation
      if (this.step === 2 || this.step === 10) {
        this.dubChord(t, [130.81, 155.56, 196.0, 246.94]);
      }
    } else if (this.currentPreset === 'acid') {
      // Acid 303 squelch & energetic break rhythm
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
      // Warm textured drone & subtle noise
      const chord = [65.41, 98.0, 130.81, 164.81];
      const note = chord[this.step % chord.length];
      this.ambientDrone(t, note);
    }
  }

  // --- Drum / Synth Oscillators ---

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

    // Noise component
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
        // Resonant voice-like synthetic chime "KONTROLL LIVE"
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
