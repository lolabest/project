/**
 * Collision detection for flying bubbles against walls and the hex grid.
 */
(function (global) {
  'use strict';

  const BS = global.BS || (global.BS = {});
  const { Utils } = BS;

  class CollisionEngine {
    /**
     * @param {object} bounds { left, right, top, bottom }
     */
    constructor(bounds) {
      this.bounds = bounds;
    }

    setBounds(bounds) {
      this.bounds = bounds;
    }

    /**
     * Integrate a flying bubble for one frame.
     * Returns collision metadata or null if still in flight.
     * @param {BS.Bubble} bubble
     * @param {number} dt seconds
     * @param {BS.Board} board
     */
    integrate(bubble, dt, board) {
      if (!bubble.isFlying) return null;

      let { x, y, vx, vy, radius } = bubble;
      let remaining = dt;
      let bounces = 0;
      const maxSubsteps = 6;

      for (let step = 0; step < maxSubsteps && remaining > 0; step += 1) {
        const speed = Math.hypot(vx, vy);
        if (speed < 1) break;

        const moveX = vx * remaining;
        const moveY = vy * remaining;
        const nextX = x + moveX;
        const nextY = y + moveY;

        // Wall bounce (left / right). Top is sticky snap territory.
        if (nextX - radius <= this.bounds.left) {
          const t = (x - radius - this.bounds.left) / (x - nextX || 1e-6);
          const hitT = Utils.clamp(t, 0, 1);
          x = this.bounds.left + radius;
          y += moveY * hitT;
          vx = Math.abs(vx);
          remaining *= 1 - hitT;
          bounces += 1;
          continue;
        }

        if (nextX + radius >= this.bounds.right) {
          const t = (this.bounds.right - radius - x) / (nextX - x || 1e-6);
          const hitT = Utils.clamp(t, 0, 1);
          x = this.bounds.right - radius;
          y += moveY * hitT;
          vx = -Math.abs(vx);
          remaining *= 1 - hitT;
          bounces += 1;
          continue;
        }

        // Ceiling contact — snap into the top row.
        if (nextY - radius <= this.bounds.top) {
          x = nextX;
          y = this.bounds.top + radius;
          bubble.x = x;
          bubble.y = y;
          bubble.vx = vx;
          bubble.vy = vy;
          return { type: 'ceiling', x, y, bounces };
        }

        const hit = this.findBubbleHit(x, y, nextX, nextY, radius, board);
        if (hit) {
          bubble.x = hit.x;
          bubble.y = hit.y;
          bubble.vx = vx;
          bubble.vy = vy;
          return { type: 'bubble', x: hit.x, y: hit.y, target: hit.target, bounces };
        }

        x = nextX;
        y = nextY;
        remaining = 0;
      }

      bubble.x = x;
      bubble.y = y;
      bubble.vx = vx;
      bubble.vy = vy;

      // Soft failsafe if a bubble flies past the board.
      if (y - radius > this.bounds.bottom) {
        return { type: 'out', x, y, bounces };
      }

      return null;
    }

    /**
     * Continuous circle-vs-circle sweep against occupied cells.
     */
    findBubbleHit(x0, y0, x1, y1, radius, board) {
      const cells = board.occupiedCells();
      let bestT = 1;
      let best = null;
      const combine = radius + board.radius - 1; // slight overlap for reliable snaps

      for (const { bubble: other } of cells) {
        const t = this.segmentCircleHit(x0, y0, x1, y1, other.x, other.y, combine);
        if (t !== null && t < bestT) {
          bestT = t;
          best = other;
        }
      }

      if (!best) return null;
      return {
        x: Utils.lerp(x0, x1, bestT),
        y: Utils.lerp(y0, y1, bestT),
        target: best,
      };
    }

    /**
     * First intersection time t in [0,1] of a moving point with a circle.
     * Treats the moving bubble center as a point and expands the target radius.
     */
    segmentCircleHit(x0, y0, x1, y1, cx, cy, radius) {
      const dx = x1 - x0;
      const dy = y1 - y0;
      const fx = x0 - cx;
      const fy = y0 - cy;

      const a = dx * dx + dy * dy;
      const b = 2 * (fx * dx + fy * dy);
      const c = fx * fx + fy * fy - radius * radius;

      if (a < 1e-8) {
        return c <= 0 ? 0 : null;
      }

      const disc = b * b - 4 * a * c;
      if (disc < 0) return null;

      const sqrt = Math.sqrt(disc);
      const t1 = (-b - sqrt) / (2 * a);
      const t2 = (-b + sqrt) / (2 * a);

      if (t1 >= 0 && t1 <= 1) return t1;
      if (t2 >= 0 && t2 <= 1 && c > 0) return t2;
      // Already overlapping at start.
      if (c <= 0) return 0;
      return null;
    }

    /**
     * Predict aim path with wall bounces for trajectory rendering.
     */
    predictTrajectory(originX, originY, angle, speed, board, maxSegments, maxBounces) {
      const points = [{ x: originX, y: originY }];
      let x = originX;
      let y = originY;
      let vx = Math.cos(angle) * speed;
      let vy = Math.sin(angle) * speed;
      const radius = board.radius;
      let bounces = 0;
      const step = 10;

      for (let i = 0; i < maxSegments; i += 1) {
        const nextX = x + (vx / speed) * step;
        const nextY = y + (vy / speed) * step;

        if (nextX - radius <= this.bounds.left) {
          x = this.bounds.left + radius;
          y = nextY;
          vx = Math.abs(vx);
          bounces += 1;
          points.push({ x, y, bounce: true });
          if (bounces > maxBounces) break;
          continue;
        }

        if (nextX + radius >= this.bounds.right) {
          x = this.bounds.right - radius;
          y = nextY;
          vx = -Math.abs(vx);
          bounces += 1;
          points.push({ x, y, bounce: true });
          if (bounces > maxBounces) break;
          continue;
        }

        if (nextY - radius <= this.bounds.top) {
          points.push({ x: nextX, y: this.bounds.top + radius, end: true });
          break;
        }

        const hit = this.findBubbleHit(x, y, nextX, nextY, radius, board);
        if (hit) {
          points.push({ x: hit.x, y: hit.y, end: true });
          break;
        }

        x = nextX;
        y = nextY;
        if (i % 2 === 0) points.push({ x, y });

        if (y > this.bounds.bottom) {
          points.push({ x, y, end: true });
          break;
        }
      }

      return points;
    }
  }

  BS.CollisionEngine = CollisionEngine;
})(typeof window !== 'undefined' ? window : globalThis);
