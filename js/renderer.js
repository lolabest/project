/**
 * Canvas renderer — candy-gloss bubbles, enchanted sky, saga-style aim trail.
 */
(function (global) {
  'use strict';

  const BS = global.BS || (global.BS = {});

  class Renderer {
    /**
     * @param {HTMLCanvasElement} canvas
     */
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
      this.width = 0;
      this.height = 0;
      this.dpr = 1;
      this.stars = this.seedStars(48);
    }

    seedStars(count) {
      const stars = [];
      for (let i = 0; i < count; i += 1) {
        stars.push({
          x: Math.random(),
          y: Math.random() * 0.72,
          r: 0.6 + Math.random() * 1.6,
          a: 0.35 + Math.random() * 0.55,
          tw: Math.random() * Math.PI * 2,
        });
      }
      return stars;
    }

    resize(cssWidth, cssHeight) {
      this.dpr = Math.min(global.devicePixelRatio || 1, 2);
      this.width = cssWidth;
      this.height = cssHeight;
      this.canvas.width = Math.round(cssWidth * this.dpr);
      this.canvas.height = Math.round(cssHeight * this.dpr);
      this.canvas.style.width = `${cssWidth}px`;
      this.canvas.style.height = `${cssHeight}px`;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    get themeCanvas() {
      return this.themes?.current?.canvas || BS.THEMES?.original?.canvas || null;
    }

    clear() {
      const { ctx, width, height } = this;
      const theme = this.themeCanvas;
      ctx.clearRect(0, 0, width, height);
      if (!theme) return;

      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, theme.sky[0]);
      sky.addColorStop(0.45, theme.sky[1]);
      sky.addColorStop(1, theme.sky[2]);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      const cloud = ctx.createRadialGradient(
        width * 0.5,
        height * 1.05,
        height * 0.05,
        width * 0.5,
        height,
        height * 0.55
      );
      cloud.addColorStop(0, theme.cloud);
      cloud.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = cloud;
      ctx.fillRect(0, height * 0.55, width, height * 0.45);

      // Halloween uses flying pumpkins on the overlay instead of sky stars.
      const themeId = this.themes?.currentId || this.themes?.current?.id;
      if (themeId !== 'halloween') {
        const t = performance.now() * 0.002;
        for (const star of this.stars) {
          const twinkle = 0.55 + Math.sin(t + star.tw) * 0.45;
          ctx.globalAlpha = star.a * twinkle;
          ctx.fillStyle = theme.star;
          ctx.beginPath();
          ctx.arc(star.x * width, star.y * height, star.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    }

    drawDangerLine(y, width) {
      const { ctx } = this;
      const theme = this.themeCanvas;
      ctx.save();
      ctx.strokeStyle = theme.danger;
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(14, y);
      ctx.lineTo(width - 14, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = theme.danger;
      ctx.font = '800 12px "Trebuchet MS", "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('DANGER', 16, y - 7);
      ctx.restore();
    }

    drawTrajectory(points) {
      if (!points || points.length < 2) return;
      const { ctx } = this;
      const theme = this.themeCanvas;
      ctx.save();
      for (let i = 1; i < points.length; i += 1) {
        const p = points[i];
        const pulse = 0.55 + (i % 3) * 0.15;
        ctx.globalAlpha = pulse;
        ctx.fillStyle = theme.trail;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.end ? 6 : 3.2, 0, Math.PI * 2);
        ctx.fill();
        if (p.end) {
          ctx.globalAlpha = 1;
          ctx.strokeStyle = theme.trailEnd;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    drawAimGuide(shooter) {
      const { ctx } = this;
      const theme = this.themeCanvas;
      const len = 58;
      const ex = shooter.x + Math.cos(shooter.angle) * len;
      const ey = shooter.y + Math.sin(shooter.angle) * len;

      ctx.save();
      const ring = ctx.createRadialGradient(
        shooter.x,
        shooter.y + 6,
        shooter.radius * 0.2,
        shooter.x,
        shooter.y,
        shooter.radius + 16
      );
      ring.addColorStop(0, theme.aimGlow[0]);
      ring.addColorStop(0.55, theme.aimGlow[1]);
      ring.addColorStop(1, theme.aimGlow[2]);
      ctx.fillStyle = ring;
      ctx.beginPath();
      ctx.arc(shooter.x, shooter.y, shooter.radius + 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = theme.aim;
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(shooter.x, shooter.y);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      ctx.strokeStyle = theme.aimRing;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(shooter.x, shooter.y, shooter.radius + 9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    /**
     * Candy-gloss bubble with thick rim and juicy speculars.
     * @param {BS.Bubble} bubble
     */
    drawBubble(bubble) {
      if (!bubble || bubble.alpha <= 0) return;
      const { ctx } = this;
      const { x, y, scale, alpha } = bubble;
      const r = bubble.radius * scale;
      if (!(r > 0.5) || !Number.isFinite(x) || !Number.isFinite(y)) return;

      const color = bubble.color;
      const theme = this.themeCanvas;
      ctx.save();
      ctx.globalAlpha = alpha;

      // Soft contact shadow
      ctx.beginPath();
      ctx.fillStyle = theme?.shadow || 'rgba(60, 20, 90, 0.22)';
      ctx.ellipse(x + r * 0.06, y + r * 0.22, r * 0.9, r * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();

      const body = ctx.createRadialGradient(
        x - r * 0.32,
        y - r * 0.38,
        r * 0.08,
        x,
        y + r * 0.08,
        r
      );
      body.addColorStop(0, '#ffffff');
      body.addColorStop(0.14, color.glow);
      body.addColorStop(0.55, color.fill);
      body.addColorStop(1, color.deep);

      ctx.beginPath();
      ctx.fillStyle = body;
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      // Candy rim
      ctx.lineWidth = Math.max(2, r * 0.12);
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.stroke();
      ctx.lineWidth = Math.max(1, r * 0.05);
      ctx.strokeStyle = color.deep;
      ctx.globalAlpha = alpha * 0.35;
      ctx.stroke();
      ctx.globalAlpha = alpha;

      // Primary specular
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.ellipse(
        x - r * 0.3,
        y - r * 0.34,
        r * 0.32,
        r * 0.2,
        -0.55,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Secondary glint
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.arc(x + r * 0.28, y + r * 0.22, r * 0.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    drawBoard(board) {
      board.forEachBubble((bubble) => this.drawBubble(bubble));
    }

    drawShooter(shooter) {
      if (shooter.current) this.drawBubble(shooter.current);
    }

    drawNextPreview(shooter, x, y, label) {
      const { ctx } = this;
      if (!shooter.next) return;

      const preview = shooter.next;
      const saved = { x: preview.x, y: preview.y, radius: preview.radius, scale: preview.scale };
      preview.x = x;
      preview.y = y;
      preview.radius = shooter.radius * 0.72;
      preview.scale = 1;

      // Mini plaque behind next bubble
      const theme = this.themeCanvas;
      ctx.save();
      ctx.fillStyle = theme?.nextPlaque || 'rgba(92, 48, 22, 0.45)';
      ctx.strokeStyle = theme?.nextBorder || 'rgba(240, 193, 75, 0.8)';
      ctx.lineWidth = 2;
      const pr = preview.radius + 10;
      const px = x - pr;
      const py = y - pr;
      const pw = pr * 2;
      const ph = pr * 2 + 14;
      const rr = 12;
      ctx.beginPath();
      ctx.moveTo(px + rr, py);
      ctx.arcTo(px + pw, py, px + pw, py + ph, rr);
      ctx.arcTo(px + pw, py + ph, px, py + ph, rr);
      ctx.arcTo(px, py + ph, px, py, rr);
      ctx.arcTo(px, py, px + pw, py, rr);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      this.drawBubble(preview);
      preview.x = saved.x;
      preview.y = saved.y;
      preview.radius = saved.radius;
      preview.scale = saved.scale;

      ctx.save();
      ctx.fillStyle = this.themeCanvas?.nextLabel || 'rgba(255, 246, 232, 0.95)';
      ctx.font = '800 11px "Trebuchet MS", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, y + shooter.radius * 0.72 + 14);
      ctx.restore();
    }

    drawComboText(text, x, y, progress) {
      const { ctx } = this;
      const theme = this.themeCanvas;
      const alpha = 1 - progress;
      const rise = progress * 36;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = theme?.comboFill || '#fff36c';
      ctx.strokeStyle = theme?.comboStroke || 'rgba(122, 31, 140, 0.55)';
      ctx.lineWidth = 4;
      ctx.font = '800 28px "Trebuchet MS", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeText(text, x, y - rise);
      ctx.fillText(text, x, y - rise);
      ctx.restore();
    }
  }

  BS.Renderer = Renderer;
})(typeof window !== 'undefined' ? window : globalThis);
