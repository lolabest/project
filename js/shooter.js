/**
 * Player shooter — aiming, loading, and launching bubbles.
 */
(function (global) {
  'use strict';

  const BS = global.BS || (global.BS = {});
  const { Utils, CONSTANTS } = BS;

  class Shooter {
    /**
     * @param {object} options
     * @param {() => number[]} options.getColorPool
     */
    constructor(options) {
      this.getColorPool = options.getColorPool;
      this.x = 0;
      this.y = 0;
      this.angle = -Math.PI / 2;
      this.current = null;
      this.next = null;
      this.radius = 0;
      this.canShoot = true;
    }

    setPosition(x, y, radius) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      if (this.current) {
        this.current.x = x;
        this.current.y = y;
        this.current.radius = radius;
      }
    }

    reset() {
      this.current = this.createBubble();
      this.next = this.createBubble();
      this.angle = -Math.PI / 2;
      this.canShoot = true;
      this.current.x = this.x;
      this.current.y = this.y;
      this.current.radius = this.radius;
    }

    createBubble() {
      const pool = this.getColorPool();
      const colorIndex = pool.length ? Utils.pick(pool) : Utils.randomInt(0, BS.COLORS.length - 1);
      return new BS.Bubble({
        colorIndex,
        x: this.x,
        y: this.y,
        radius: this.radius,
        state: 'grid',
      });
    }

    aimAt(worldX, worldY) {
      const dx = worldX - this.x;
      const dy = worldY - this.y;
      // Canvas atan2: 0 is right, negative is upward.
      let angle = Math.atan2(dy, dx);
      if (angle > 0) {
        angle = angle > Math.PI / 2 ? -Math.PI + 0.01 : -0.01;
      }
      this.angle = Utils.clamp(
        angle,
        -Math.PI + CONSTANTS.MIN_AIM_ANGLE,
        -CONSTANTS.MIN_AIM_ANGLE
      );
    }

    nudgeAngle(delta) {
      this.angle = Utils.clamp(
        this.angle + delta,
        -Math.PI + CONSTANTS.MIN_AIM_ANGLE,
        -CONSTANTS.MIN_AIM_ANGLE
      );
    }

    /**
     * Launch the current bubble. Returns the flying bubble or null.
     */
    shoot() {
      if (!this.canShoot || !this.current) return null;

      const speed = CONSTANTS.SHOOT_SPEED;
      const flying = this.current.cloneAsFlying(
        this.x,
        this.y,
        Math.cos(this.angle) * speed,
        Math.sin(this.angle) * speed,
        this.radius
      );

      this.current = this.next;
      this.next = this.createBubble();
      this.current.x = this.x;
      this.current.y = this.y;
      this.current.radius = this.radius;
      this.canShoot = false;

      return flying;
    }

    reloadColors() {
      const pool = this.getColorPool();
      if (!pool.length) return;

      if (this.current && !pool.includes(this.current.colorIndex)) {
        this.current.colorIndex = Utils.pick(pool);
      }
      if (this.next && !pool.includes(this.next.colorIndex)) {
        this.next.colorIndex = Utils.pick(pool);
      }
    }
  }

  BS.Shooter = Shooter;
})(typeof window !== 'undefined' ? window : globalThis);
