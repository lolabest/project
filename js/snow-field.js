/**
 * New Year festive overlay — flowing snow + Santa sleigh flyby.
 * Renders on a fixed full-viewport canvas above the game (pointer-events: none).
 */
(function (global) {
  'use strict';

  const BS = global.BS || (global.BS = {});

  class SnowField {
    /**
     * @param {HTMLElement} [container] unused — mounts on document.body for visibility
     */
    constructor() {
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'snow-field';
      this.canvas.setAttribute('aria-hidden', 'true');
      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d', { alpha: true });

      this.flakes = [];
      this.active = false;
      this.rafId = 0;
      this.lastTime = 0;
      this.width = 0;
      this.height = 0;
      this.dpr = 1;
      this.wind = 18;

      // Santa sleigh state (same canvas as snow).
      this.santa = {
        x: 40,
        y: 0,
        speed: 170,
        bob: 0,
        scale: 1.35,
        lap: 0,
      };

      this.onResize = this.resize.bind(this);
      global.addEventListener('resize', this.onResize);
      this.resize();
    }

    resize() {
      this.dpr = Math.min(global.devicePixelRatio || 1, 2);
      this.width = Math.max(1, global.innerWidth || document.documentElement.clientWidth || 800);
      this.height = Math.max(1, global.innerHeight || document.documentElement.clientHeight || 600);
      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

      this.santa.y = this.height * 0.22;
      this.santa.scale = Math.max(1.15, Math.min(1.85, this.width / 700));

      if (this.active) {
        this.ensureFlakeCount();
      }
    }

    targetCount() {
      const area = this.width * this.height;
      return Math.max(56, Math.min(160, Math.round(area / 8000)));
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
      // Allow restarting the flyby when re-selecting New Year.
      if (this.active) {
        this.santa.x = this.width * 0.08;
        this.santa.y = this.height * 0.22;
        this.santa.bob = 0;
        this.santa.lap = 0;
        return;
      }
      this.active = true;
      this.canvas.classList.add('is-active');
      this.ensureFlakeCount();
      this.santa.scale = Math.max(1.15, Math.min(1.85, this.width / 700));
      this.santa.x = this.width * 0.08;
      this.santa.y = this.height * 0.22;
      this.santa.bob = 0;
      this.santa.speed = 170;
      this.santa.lap = 0;
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

      this.wind = Math.sin(timestamp * 0.00035) * 22;

      const { ctx, width, height } = this;
      ctx.clearRect(0, 0, width, height);

      // Santa rides behind the falling snow (drawn first).
      this.updateSanta(dt);
      this.drawSanta(ctx);

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

    updateSanta(dt) {
      const s = this.santa;
      s.bob += dt * 2.6;
      s.x += s.speed * dt;
      s.y = this.height * (0.2 + 0.05 * Math.sin(s.bob * 0.85)) + Math.sin(s.bob) * 14;

      const sleighWidth = 260 * s.scale;
      if (s.x - sleighWidth > this.width + 20) {
        s.lap += 1;
        s.x = -sleighWidth * 0.35;
        s.y = this.height * (s.lap % 2 === 0 ? 0.2 : 0.34);
        s.bob = 0;
      }
    }

    /**
     * Procedural Santa + sleigh + reindeer facing right (flies left → right).
     */
    drawSanta(ctx) {
      const s = this.santa;
      const sc = s.scale;
      const x = s.x;
      const y = s.y;

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(sc, sc);

      // Strong silhouette halo so Santa reads over bright bubbles.
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.ellipse(130, 24, 120, 36, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.globalAlpha = 1;

      // Soft shadow under the sleigh
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      ctx.ellipse(120, 56, 78, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Reindeer (3)
      for (let i = 0; i < 3; i += 1) {
        const dx = i * 36;
        const dy = Math.sin(s.bob * 3.2 + i) * 4;
        this.drawReindeer(ctx, dx, 6 + dy);
      }

      // Harness lines
      ctx.strokeStyle = '#ffe08a';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(92, 22);
      ctx.quadraticCurveTo(122, 8, 150, 28);
      ctx.stroke();

      // Sleigh body
      ctx.fillStyle = '#b71c1c';
      ctx.strokeStyle = '#fff8e0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(145, 30);
      ctx.quadraticCurveTo(190, 6, 255, 28);
      ctx.lineTo(262, 44);
      ctx.quadraticCurveTo(200, 62, 148, 50);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#e53935';
      ctx.beginPath();
      ctx.moveTo(150, 28);
      ctx.quadraticCurveTo(190, 12, 250, 30);
      ctx.lineTo(254, 42);
      ctx.quadraticCurveTo(198, 54, 152, 44);
      ctx.closePath();
      ctx.fill();

      // Gold runners
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(148, 48);
      ctx.quadraticCurveTo(200, 66, 260, 46);
      ctx.stroke();

      // Gift sack
      ctx.fillStyle = '#1b5e20';
      ctx.beginPath();
      ctx.ellipse(232, 16, 18, 13, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(218, 12);
      ctx.quadraticCurveTo(232, 0, 246, 12);
      ctx.stroke();

      // Santa body
      ctx.fillStyle = '#c62828';
      ctx.beginPath();
      ctx.ellipse(190, 16, 16, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(176, 28);
      ctx.quadraticCurveTo(190, 36, 204, 28);
      ctx.stroke();

      // Head
      ctx.fillStyle = '#ffcc80';
      ctx.beginPath();
      ctx.arc(190, -2, 12, 0, Math.PI * 2);
      ctx.fill();

      // Beard
      ctx.fillStyle = '#fffef5';
      ctx.beginPath();
      ctx.ellipse(190, 8, 11, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffcc80';
      ctx.beginPath();
      ctx.ellipse(190, 2, 6, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hat
      ctx.fillStyle = '#c62828';
      ctx.beginPath();
      ctx.moveTo(178, -6);
      ctx.quadraticCurveTo(190, -32, 216, -10);
      ctx.lineTo(204, -2);
      ctx.quadraticCurveTo(190, -16, 180, -2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(216, -10, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(178, -6);
      ctx.quadraticCurveTo(190, -1, 202, -6);
      ctx.stroke();

      // Face
      ctx.fillStyle = '#4e342e';
      ctx.beginPath();
      ctx.arc(186, -3, 1.5, 0, Math.PI * 2);
      ctx.arc(194, -3, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#bf360c';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(186, 2);
      ctx.quadraticCurveTo(190, 5, 194, 2);
      ctx.stroke();

      // Sparkle trail
      ctx.fillStyle = '#ffe082';
      const trail = [
        [268, 18],
        [282, 8],
        [294, 22],
        [278, 34],
        [300, 14],
      ];
      for (const [tx, ty] of trail) {
        ctx.globalAlpha = 0.65 + Math.sin(s.bob * 4 + tx) * 0.3;
        ctx.beginPath();
        ctx.arc(tx, ty, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    drawReindeer(ctx, x, y) {
      ctx.fillStyle = '#5c3a1e';
      ctx.beginPath();
      ctx.ellipse(x + 18, y + 14, 15, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + 8, y + 6, 6, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Antlers
      ctx.strokeStyle = '#3d2614';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 6, y + 4);
      ctx.lineTo(x + 2, y - 8);
      ctx.moveTo(x + 10, y + 4);
      ctx.lineTo(x + 10, y - 10);
      ctx.stroke();
      // Red nose on lead deer (x near 0)
      if (x < 10) {
        ctx.fillStyle = '#e53935';
        ctx.beginPath();
        ctx.arc(x + 2, y + 6, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    destroy() {
      this.stop();
      global.removeEventListener('resize', this.onResize);
      this.canvas.remove();
    }
  }

  BS.SnowField = SnowField;
})(typeof window !== 'undefined' ? window : globalThis);
