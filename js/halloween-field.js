/**
 * Halloween festive overlay — spider nets + falling orange leaves.
 * Fixed full-viewport canvas above the game (pointer-events: none).
 */
(function (global) {
  'use strict';

  const BS = global.BS || (global.BS = {});

  const LEAF_COLORS = Object.freeze([
    '#ff6a00',
    '#ff8a18',
    '#e85d04',
    '#f4a261',
    '#d9480f',
    '#ffb703',
  ]);

  class HalloweenField {
    constructor() {
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'halloween-field';
      this.canvas.setAttribute('aria-hidden', 'true');
      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d', { alpha: true });

      this.leaves = [];
      this.webs = [];
      this.active = false;
      this.rafId = 0;
      this.lastTime = 0;
      this.width = 0;
      this.height = 0;
      this.dpr = 1;
      this.wind = 12;

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
      this.layoutWebs();
      if (this.active) this.ensureLeafCount();
    }

    layoutWebs() {
      const s = Math.min(this.width, this.height);
      this.webs = [
        { corner: 'tl', size: s * 0.28, sway: 0.4 },
        { corner: 'tr', size: s * 0.24, sway: 0.55 },
        { corner: 'bl', size: s * 0.18, sway: 0.35 },
        { corner: 'br', size: s * 0.22, sway: 0.5 },
      ];
    }

    targetLeafCount() {
      const area = this.width * this.height;
      return Math.max(28, Math.min(70, Math.round(area / 16000)));
    }

    ensureLeafCount() {
      const target = this.targetLeafCount();
      while (this.leaves.length < target) {
        this.leaves.push(this.spawnLeaf(true));
      }
      if (this.leaves.length > target) this.leaves.length = target;
    }

    spawnLeaf(randomY) {
      const size = 10 + Math.random() * 16;
      return {
        x: Math.random() * this.width,
        y: randomY ? Math.random() * this.height : -20 - Math.random() * 60,
        size,
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 2.4,
        speed: 28 + Math.random() * 46,
        drift: (Math.random() - 0.5) * 40,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 1.2 + Math.random() * 1.8,
        color: LEAF_COLORS[(Math.random() * LEAF_COLORS.length) | 0],
        alpha: 0.55 + Math.random() * 0.4,
        type: Math.random() < 0.5 ? 'maple' : 'oak',
      };
    }

    start() {
      if (this.active) {
        this.ensureLeafCount();
        return;
      }
      this.active = true;
      this.canvas.classList.add('is-active');
      this.layoutWebs();
      this.ensureLeafCount();
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
      this.wind = Math.sin(timestamp * 0.0004) * 28;

      const { ctx, width, height } = this;
      ctx.clearRect(0, 0, width, height);

      // Dark Halloween veil so the scene reads as black night.
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.fillRect(0, 0, width, height);

      this.drawWebs(ctx, timestamp);

      for (const leaf of this.leaves) {
        leaf.wobble += leaf.wobbleSpeed * dt;
        leaf.rot += leaf.spin * dt;
        leaf.y += leaf.speed * dt;
        leaf.x += (leaf.drift + this.wind * 0.55 + Math.sin(leaf.wobble) * 22) * dt;

        if (leaf.y - leaf.size > height) {
          leaf.y = -20 - Math.random() * 40;
          leaf.x = Math.random() * width;
          leaf.color = LEAF_COLORS[(Math.random() * LEAF_COLORS.length) | 0];
        }
        if (leaf.x < -40) leaf.x = width + 20;
        if (leaf.x > width + 40) leaf.x = -20;

        this.drawLeaf(ctx, leaf);
      }

      this.rafId = requestAnimationFrame((t) => this.frame(t));
    }

    drawWebs(ctx, timestamp) {
      for (const web of this.webs) {
        const sway = Math.sin(timestamp * 0.0012 + web.sway * 6) * 0.04;
        ctx.save();
        this.anchorWeb(ctx, web);
        ctx.rotate(sway);
        this.drawSpiderNet(ctx, web.size);
        ctx.restore();
      }
    }

    anchorWeb(ctx, web) {
      const m = 8;
      if (web.corner === 'tl') {
        ctx.translate(m, m);
      } else if (web.corner === 'tr') {
        ctx.translate(this.width - m, m);
        ctx.scale(-1, 1);
      } else if (web.corner === 'bl') {
        ctx.translate(m, this.height - m);
        ctx.scale(1, -1);
      } else {
        ctx.translate(this.width - m, this.height - m);
        ctx.scale(-1, -1);
      }
    }

    /**
     * Classic corner spider web from origin.
     */
    drawSpiderNet(ctx, size) {
      const rays = 8;
      const rings = 5;
      ctx.strokeStyle = 'rgba(220, 220, 220, 0.42)';
      ctx.lineWidth = 1.25;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Radial threads
      for (let i = 0; i <= rays; i += 1) {
        const a = (i / rays) * (Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size);
        ctx.stroke();
      }

      // Concentric arcs
      for (let r = 1; r <= rings; r += 1) {
        const radius = (size * r) / rings;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI / 2);
        ctx.stroke();
      }

      // Extra sticky strands
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 0.9;
      for (let i = 0; i < rays; i += 1) {
        const a0 = (i / rays) * (Math.PI / 2);
        const a1 = ((i + 0.5) / rays) * (Math.PI / 2);
        const r0 = size * 0.35;
        const r1 = size * 0.72;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a0) * r0, Math.sin(a0) * r0);
        ctx.quadraticCurveTo(
          Math.cos(a1) * ((r0 + r1) / 2),
          Math.sin(a1) * ((r0 + r1) / 2),
          Math.cos(a0 + 0.12) * r1,
          Math.sin(a0 + 0.12) * r1
        );
        ctx.stroke();
      }

      // Tiny spider on one web
      ctx.fillStyle = 'rgba(10, 10, 10, 0.85)';
      ctx.beginPath();
      ctx.arc(size * 0.55, size * 0.22, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(20, 20, 20, 0.75)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i += 1) {
        const a = -0.4 + i * 0.35;
        ctx.beginPath();
        ctx.moveTo(size * 0.55, size * 0.22);
        ctx.lineTo(size * 0.55 + Math.cos(a) * 7, size * 0.22 + Math.sin(a) * 5);
        ctx.stroke();
      }
    }

    drawLeaf(ctx, leaf) {
      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(leaf.rot);
      ctx.globalAlpha = leaf.alpha;
      ctx.fillStyle = leaf.color;
      ctx.strokeStyle = 'rgba(80, 30, 0, 0.35)';
      ctx.lineWidth = 1;

      ctx.beginPath();
      if (leaf.type === 'maple') {
        const s = leaf.size;
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.28, -s * 0.25);
        ctx.lineTo(s * 0.85, -s * 0.35);
        ctx.lineTo(s * 0.35, s * 0.05);
        ctx.lineTo(s * 0.55, s * 0.7);
        ctx.lineTo(0, s * 0.28);
        ctx.lineTo(-s * 0.55, s * 0.7);
        ctx.lineTo(-s * 0.35, s * 0.05);
        ctx.lineTo(-s * 0.85, -s * 0.35);
        ctx.lineTo(-s * 0.28, -s * 0.25);
        ctx.closePath();
      } else {
        const s = leaf.size;
        ctx.ellipse(0, 0, s * 0.55, s * 0.85, 0, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.stroke();

      // Stem
      ctx.strokeStyle = 'rgba(90, 40, 10, 0.55)';
      ctx.beginPath();
      ctx.moveTo(0, leaf.size * 0.2);
      ctx.lineTo(0, leaf.size * 0.95);
      ctx.stroke();

      ctx.restore();
    }

    destroy() {
      this.stop();
      global.removeEventListener('resize', this.onResize);
      this.canvas.remove();
    }
  }

  BS.HalloweenField = HalloweenField;
})(typeof window !== 'undefined' ? window : globalThis);
