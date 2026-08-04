/**
 * Canvas renderer — board, shooter, trajectory, overlays helpers.
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

    clear() {
      const { ctx, width, height } = this;
      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(8, 28, 48, 0.35)');
      gradient.addColorStop(0.55, 'rgba(10, 40, 62, 0.18)');
      gradient.addColorStop(1, 'rgba(6, 20, 36, 0.55)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    drawDangerLine(y, width) {
      const { ctx } = this;
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 107, 107, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([10, 7]);
      ctx.beginPath();
      ctx.moveTo(12, y);
      ctx.lineTo(width - 12, y);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 107, 107, 0.72)';
      ctx.font = '700 11px "Trebuchet MS", "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('DANGER', 16, y - 6);
      ctx.restore();
    }

    drawTrajectory(points) {
      if (!points || points.length < 2) return;
      const { ctx } = this;
      ctx.save();
      ctx.strokeStyle = 'rgba(232, 244, 255, 0.55)';
      ctx.fillStyle = 'rgba(232, 244, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i += 1) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();

      const end = points[points.length - 1];
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(end.x, end.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawAimGuide(shooter) {
      const { ctx } = this;
      const len = 54;
      const ex = shooter.x + Math.cos(shooter.angle) * len;
      const ey = shooter.y + Math.sin(shooter.angle) * len;

      ctx.save();
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.75)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(shooter.x, shooter.y);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      // Base ring
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(shooter.x, shooter.y, shooter.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    /**
     * Glossy bubble with specular highlight.
     * @param {BS.Bubble} bubble
     */
    drawBubble(bubble) {
      if (!bubble || bubble.alpha <= 0) return;
      const { ctx } = this;
      const { x, y, scale, alpha } = bubble;
      const r = bubble.radius * scale;
      if (!(r > 0.5) || !Number.isFinite(x) || !Number.isFinite(y)) return;

      const color = bubble.color;
      ctx.save();
      ctx.globalAlpha = alpha;

      // Soft contact shadow
      ctx.beginPath();
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.ellipse(x + r * 0.08, y + r * 0.18, r * 0.92, r * 0.82, 0, 0, Math.PI * 2);
      ctx.fill();

      const body = ctx.createRadialGradient(
        x - r * 0.35,
        y - r * 0.4,
        r * 0.1,
        x,
        y,
        r
      );
      body.addColorStop(0, color.glow);
      body.addColorStop(0.45, color.fill);
      body.addColorStop(1, color.deep);

      ctx.beginPath();
      ctx.fillStyle = body;
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      // Rim
      ctx.lineWidth = Math.max(1, r * 0.08);
      ctx.strokeStyle = 'rgba(255,255,255,0.28)';
      ctx.stroke();

      // Specular
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.ellipse(
        x - r * 0.28,
        y - r * 0.32,
        r * 0.28,
        r * 0.18,
        -0.5,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Secondary glint
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.arc(x + r * 0.25, y + r * 0.2, r * 0.12, 0, Math.PI * 2);
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
      this.drawBubble(preview);
      preview.x = saved.x;
      preview.y = saved.y;
      preview.radius = saved.radius;
      preview.scale = saved.scale;

      ctx.save();
      ctx.fillStyle = 'rgba(226, 240, 255, 0.75)';
      ctx.font = '600 12px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, y + shooter.radius * 0.72 + 16);
      ctx.restore();
    }

    drawComboText(text, x, y, progress) {
      const { ctx } = this;
      const alpha = 1 - progress;
      const rise = progress * 36;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#fff6d5';
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 3;
      ctx.font = '800 28px "Trebuchet MS", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeText(text, x, y - rise);
      ctx.fillText(text, x, y - rise);
      ctx.restore();
    }
  }

  BS.Renderer = Renderer;
})(typeof window !== 'undefined' ? window : globalThis);
