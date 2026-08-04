/**
 * Canvas particle bursts for pops, combos, and wins.
 */
(function (global) {
  'use strict';

  const BS = global.BS || (global.BS = {});
  const { Utils } = BS;

  class ParticleSystem {
    constructor() {
      /** @type {object[]} */
      this.particles = [];
    }

    clear() {
      this.particles.length = 0;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {string} color
     * @param {number} [count]
     */
    burst(x, y, color, count = BS.CONSTANTS.PARTICLE_BURST) {
      for (let i = 0; i < count; i += 1) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
        const speed = 80 + Math.random() * 180;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.9 + Math.random() * 0.7,
          size: 2 + Math.random() * 4,
          color,
          gravity: 220 + Math.random() * 120,
        });
      }
    }

    sparkle(x, y, color) {
      for (let i = 0; i < 8; i += 1) {
        this.particles.push({
          x: x + (Math.random() - 0.5) * 20,
          y: y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 40,
          vy: -40 - Math.random() * 80,
          life: 1,
          decay: 0.6 + Math.random() * 0.4,
          size: 1.5 + Math.random() * 2.5,
          color,
          gravity: 60,
        });
      }
    }

    update(dt) {
      for (let i = this.particles.length - 1; i >= 0; i -= 1) {
        const p = this.particles[i];
        p.vy += p.gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= p.decay * dt;
        if (p.life <= 0) {
          this.particles.splice(i, 1);
        }
      }
    }

    draw(ctx) {
      for (const p of this.particles) {
        ctx.globalAlpha = Utils.clamp(p.life, 0, 1);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  BS.ParticleSystem = ParticleSystem;
})(typeof window !== 'undefined' ? window : globalThis);
