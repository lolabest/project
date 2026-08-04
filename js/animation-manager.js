/**
 * Lightweight tween / timed animation scheduler.
 */
(function (global) {
  'use strict';

  const BS = global.BS || (global.BS = {});
  const { Utils } = BS;

  class AnimationManager {
    constructor() {
      /** @type {Set<object>} */
      this.animations = new Set();
    }

    /**
     * @param {object} options
     * @param {number} options.duration ms
     * @param {(t:number,dt:number) => void} options.onUpdate
     * @param {() => void} [options.onComplete]
     * @param {(t:number) => number} [options.easing]
     * @param {number} [options.delay]
     */
    play(options) {
      const anim = {
        elapsed: -Math.max(0, options.delay || 0),
        duration: Math.max(1, options.duration),
        onUpdate: options.onUpdate,
        onComplete: options.onComplete || null,
        easing: options.easing || ((t) => t),
        done: false,
      };
      this.animations.add(anim);
      return anim;
    }

    cancel(anim) {
      this.animations.delete(anim);
    }

    clear() {
      this.animations.clear();
    }

    update(dtMs) {
      for (const anim of [...this.animations]) {
        anim.elapsed += dtMs;
        if (anim.elapsed < 0) continue;

        const raw = Utils.clamp(anim.elapsed / anim.duration, 0, 1);
        const t = anim.easing(raw);
        anim.onUpdate(t, dtMs);

        if (raw >= 1) {
          anim.done = true;
          this.animations.delete(anim);
          if (anim.onComplete) anim.onComplete();
        }
      }
    }

    get activeCount() {
      return this.animations.size;
    }
  }

  BS.AnimationManager = AnimationManager;
})(typeof window !== 'undefined' ? window : globalThis);
