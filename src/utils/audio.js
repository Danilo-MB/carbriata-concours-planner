/**
 * CARBRIATA CONCOURS - Web Audio Engine Sound Synthesizer
 * Simulates engine revs (Turbo 5-cylinder, High-revving V8, Flat-6, V8 Muscle)
 * Inspired by the dynamic sound passes at Dolores 2026.
 */

class EngineSoundSynthesizer {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playRev(type = 'default') {
    try {
      this.init();
      const ctx = this.ctx;
      const now = ctx.currentTime;

      // Master gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.35, now);
      masterGain.connect(ctx.destination);

      if (type === 'audi-quattro') {
        // 5-Cylinder Turbo with wastegate flutter
        this._playFiveCylinderTurbo(ctx, masterGain, now);
      } else if (type === 'ferrari-v8') {
        // Screaming twin-turbo Italian V8
        this._playItalianV8(ctx, masterGain, now);
      } else if (type === 'v8-muscle') {
        // Deep American cross-plane rumble (Shelby Cobra)
        this._playAmericanV8(ctx, masterGain, now);
      } else {
        // Flat-6 / Classic European sports car
        this._playClassicSix(ctx, masterGain, now);
      }
    } catch (e) {
      console.warn('Audio synthesis not supported or blocked:', e);
    }
  }

  _playFiveCylinderTurbo(ctx, out, now) {
    // Fundamental oscillator (throaty off-beat 5 cylinder rhythm)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const sub = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    sub.type = 'sawtooth';

    filter.type = 'lowpass';
    filter.Q.value = 4;

    // Pitch sweep: idle -> high rev -> shift -> wastegate flutter
    osc1.frequency.setValueAtTime(95, now);
    osc1.frequency.exponentialRampToValueAtTime(360, now + 0.9);
    osc1.frequency.exponentialRampToValueAtTime(240, now + 1.1);
    osc1.frequency.exponentialRampToValueAtTime(420, now + 1.9);
    osc1.frequency.exponentialRampToValueAtTime(110, now + 2.8);

    osc2.frequency.setValueAtTime(97, now);
    osc2.frequency.exponentialRampToValueAtTime(365, now + 0.9);
    osc2.frequency.exponentialRampToValueAtTime(425, now + 1.9);
    osc2.frequency.exponentialRampToValueAtTime(112, now + 2.8);

    sub.frequency.setValueAtTime(48, now);
    sub.frequency.exponentialRampToValueAtTime(180, now + 0.9);
    sub.frequency.exponentialRampToValueAtTime(55, now + 2.8);

    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.9);
    filter.frequency.exponentialRampToValueAtTime(1200, now + 1.1);
    filter.frequency.exponentialRampToValueAtTime(3800, now + 1.9);
    filter.frequency.exponentialRampToValueAtTime(500, now + 2.8);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.8, now + 0.2);
    gain.gain.setValueAtTime(0.8, now + 1.9);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

    osc1.connect(filter);
    osc2.connect(filter);
    sub.connect(filter);
    filter.connect(gain);
    gain.connect(out);

    osc1.start(now);
    osc2.start(now);
    sub.start(now);
    osc1.stop(now + 3.0);
    osc2.stop(now + 3.0);
    sub.stop(now + 3.0);

    // Turbo blow-off noise (wastegate chatter) at 2.0s
    this._playTurboWhistle(ctx, out, now + 1.95);
  }

  _playTurboWhistle(ctx, out, startTime) {
    const bufferSize = ctx.sampleRate * 0.7;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2800, startTime);
    filter.frequency.exponentialRampToValueAtTime(1600, startTime + 0.5);
    filter.Q.value = 5.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, startTime);
    gain.gain.linearRampToValueAtTime(0.4, startTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.65);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(out);

    noise.start(startTime);
    noise.stop(startTime + 0.7);
  }

  _playItalianV8(ctx, out, now) {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    filter.type = 'lowpass';
    filter.Q.value = 6;

    // High revving pitch curve
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 1.2);
    osc.frequency.exponentialRampToValueAtTime(420, now + 1.4);
    osc.frequency.exponentialRampToValueAtTime(680, now + 2.2);
    osc.frequency.exponentialRampToValueAtTime(160, now + 3.2);

    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(4500, now + 1.2);
    filter.frequency.exponentialRampToValueAtTime(5500, now + 2.2);
    filter.frequency.exponentialRampToValueAtTime(900, now + 3.2);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.7, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(out);

    osc.start(now);
    osc.stop(now + 3.3);
  }

  _playAmericanV8(ctx, out, now) {
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc2.type = 'triangle';
    filter.type = 'lowpass';
    filter.Q.value = 3;

    osc.frequency.setValueAtTime(65, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 1.2);
    osc.frequency.exponentialRampToValueAtTime(75, now + 2.8);

    osc2.frequency.setValueAtTime(67, now);
    osc2.frequency.exponentialRampToValueAtTime(264, now + 1.2);
    osc2.frequency.exponentialRampToValueAtTime(78, now + 2.8);

    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(2200, now + 1.2);
    filter.frequency.exponentialRampToValueAtTime(400, now + 2.8);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.9, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(out);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 3.0);
    osc2.stop(now + 3.0);
  }

  _playClassicSix(ctx, out, now) {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    filter.type = 'lowpass';
    filter.Q.value = 4.5;

    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 1.0);
    osc.frequency.exponentialRampToValueAtTime(120, now + 2.6);

    filter.frequency.setValueAtTime(500, now);
    filter.frequency.exponentialRampToValueAtTime(3000, now + 1.0);
    filter.frequency.exponentialRampToValueAtTime(600, now + 2.6);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.65, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(out);

    osc.start(now);
    osc.stop(now + 2.8);
  }
}

export const engineAudio = new EngineSoundSynthesizer();
