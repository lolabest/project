/**
 * Synthesized SFX via Web Audio API — no external audio assets.
 */
(function (global) {
  'use strict';

  const BS = global.BS || (global.BS = {});

  class SoundManager {
    /**
     * @param {BS.StorageManager} storage
     */
    constructor(storage) {
      this.storage = storage;
      this.muted = storage.isMuted();
      /** @type {AudioContext|null} */
      this.ctx = null;
      this.unlocked = false;
    }

    ensureContext() {
      if (this.ctx) return this.ctx;
      const AudioCtx = global.AudioContext || global.webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      return this.ctx;
    }

    async unlock() {
      const ctx = this.ensureContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        try {
          await ctx.resume();
        } catch {
          return;
        }
      }
      this.unlocked = true;
    }

    setMuted(muted) {
      this.muted = Boolean(muted);
      this.storage.setMuted(this.muted);
    }

    toggleMute() {
      this.setMuted(!this.muted);
      return this.muted;
    }

    tone({ frequency, duration, type = 'sine', gain = 0.08, slideTo = null }) {
      if (this.muted) return;
      const ctx = this.ensureContext();
      if (!ctx || ctx.state !== 'running') return;

      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      if (slideTo !== null) {
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(1, slideTo),
          ctx.currentTime + duration
        );
      }

      amp.gain.setValueAtTime(0.0001, ctx.currentTime);
      amp.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + 0.015);
      amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(amp);
      amp.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration + 0.02);
    }

    playShoot() {
      this.tone({ frequency: 520, duration: 0.08, type: 'triangle', gain: 0.06, slideTo: 280 });
    }

    playPop() {
      this.tone({ frequency: 340, duration: 0.12, type: 'square', gain: 0.045, slideTo: 120 });
    }

    playFall() {
      this.tone({ frequency: 220, duration: 0.18, type: 'sine', gain: 0.05, slideTo: 80 });
    }

    playBounce() {
      this.tone({ frequency: 700, duration: 0.05, type: 'sine', gain: 0.03 });
    }

    playCombo(level) {
      const base = 440 + Math.min(level, 8) * 40;
      this.tone({ frequency: base, duration: 0.16, type: 'triangle', gain: 0.07, slideTo: base * 1.5 });
    }

    playWin() {
      [523, 659, 784, 1046].forEach((freq, i) => {
        global.setTimeout(() => {
          this.tone({ frequency: freq, duration: 0.18, type: 'triangle', gain: 0.06 });
        }, i * 110);
      });
    }

    playLose() {
      this.tone({ frequency: 300, duration: 0.35, type: 'sawtooth', gain: 0.04, slideTo: 90 });
    }
  }

  BS.SoundManager = SoundManager;
})(typeof window !== 'undefined' ? window : globalThis);
