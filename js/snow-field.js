/**
 * Flowing snowfall backdrop — active for the New Year skin.
 */
(function (global) {
  'use strict';

  const BS = global.BS || (global.BS = {});

  class SnowField {
    /**
     * @param {HTMLElement} container
     */
    constructor(container) {
      this.container = container;
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'snow-field';
      this.canvas.setAttribute('aria-hidden', 'true');
      container.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d', { alpha: true });

      this.flakes = [];
      this.active = false;
      this.rafId = 0;
      this.lastTime = 0;
      this.width = 0;
      this.height = 0;
      this.dpr = 1;
      this.wind = 18;

      this.onResize = this.resize.bind(this);
      global.addEventListener('resize', this.onResize);
      this.resize();
    }

    resize() {
      const rect = this.container.getBoundingClientRect();
      this.dpr = Math.min(global.devicePixelRatio || 1, 2);
      this.width = Math.max(1, Math.floor(rect.width));
      this.height = Math.max(1, Math.floor(rect.height));
      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

      if (this.active) {
        this.ensureFlakeCount();
      }
    }

    targetCount() {
      // Scale flake density with viewport area.
      const area = this.width * this.height;
      return Math.max(48, Math.min(140, Math.round(area / 9000)));
    }

    ensureFlakeCount() {
      const target = this.targetCount();
      while (this.flakes.length < target) {
        this.flakes.push(this.spawnFlake(true));
      }
      if (this.flakes.length > target) {
        this.flakes.length = target;
      }
    }

    spawnFlake(randomY) {
      const size = 1.2 + Math.random() * 3.4;
      return {
        x: Math.random() * this.width,
        y: randomY ? Math.random() * this.height : -8 - Math.random() * 40,
        r: size,
        speed: 22 + size * 18 + Math.random() * 28,
        drift: (Math.random() - 0.5) * 26,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.8 + Math.random() * 1.6,
        alpha: 0.35 + Math.random() * 0.55,
      };
    }

    start() {
      if (this.active) return;
      this.active = true;
      this.canvas.classList.add('is-active');
      this.ensureFlakeCount();
      this.lastTime = performance.now();
      this.rafId = requestAnimationFrame((t) => this.frame(t));
    }

    stop() {
      this.active = false;
      this.canvas.classList.remove('is-active');
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
      this.ctx.clearRect(0, 0, this.width, this.height);
    }

    frame(timestamp) {
      if (!this.active) return;
      const rawDt = (timestamp - this.lastTime) / 1000;
      this.lastTime = timestamp;
      const dt = Math.min(0.05, Math.max(0, rawDt));

      // Gentle oscillating wind.
      this.wind = Math.sin(timestamp * 0.00035) * 22;

      const { ctx, width, height } = this;
      ctx.clearRect(0, 0, width, height);

      for (const flake of this.flakes) {
        flake.wobble += flake.wobbleSpeed * dt;
        flake.y += flake.speed * dt;
        flake.x += (flake.drift + this.wind + Math.sin(flake.wobble) * 12) * dt;

        if (flake.y - flake.r > height) {
          flake.y = -6 - Math.random() * 30;
          flake.x = Math.random() * width;
        }
        if (flake.x < -12) flake.x = width + 8;
        if (flake.x > width + 12) flake.x = -8;

        ctx.globalAlpha = flake.alpha;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
        ctx.fill();

        // Soft glow for larger flakes.
        if (flake.r > 2.6) {
          ctx.globalAlpha = flake.alpha * 0.25;
          ctx.beginPath();
          ctx.arc(flake.x, flake.y, flake.r * 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      this.rafId = requestAnimationFrame((t) => this.frame(t));
    }

    destroy() {
      this.stop();
      global.removeEventListener('resize', this.onResize);
      this.canvas.remove();
    }
  }

  BS.SnowField = SnowField;
})(typeof window !== 'undefined' ? window : globalThis);
