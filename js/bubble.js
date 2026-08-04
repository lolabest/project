/**
 * Bubble entity — grid cell occupant or flying projectile.
 */
(function (global) {
  'use strict';

  const BS = global.BS || (global.BS = {});

  let nextId = 1;

  class Bubble {
    /**
     * @param {object} options
     * @param {number} options.colorIndex
     * @param {number} [options.col]
     * @param {number} [options.row]
     * @param {number} [options.x]
     * @param {number} [options.y]
     * @param {number} [options.vx]
     * @param {number} [options.vy]
     * @param {'grid'|'flying'|'falling'|'popping'} [options.state]
     */
    constructor(options) {
      this.id = nextId++;
      this.colorIndex = options.colorIndex;
      this.col = options.col ?? -1;
      this.row = options.row ?? -1;
      this.x = options.x ?? 0;
      this.y = options.y ?? 0;
      this.vx = options.vx ?? 0;
      this.vy = options.vy ?? 0;
      this.state = options.state ?? 'grid';
      this.radius = options.radius ?? 0;
      this.scale = 1;
      this.alpha = 1;
      this.popProgress = 0;
      this.fallDelay = 0;
    }

    get color() {
      return BS.COLORS[this.colorIndex];
    }

    get isGrid() {
      return this.state === 'grid';
    }

    get isFlying() {
      return this.state === 'flying';
    }

    cloneAsFlying(x, y, vx, vy, radius) {
      return new Bubble({
        colorIndex: this.colorIndex,
        x,
        y,
        vx,
        vy,
        radius,
        state: 'flying',
      });
    }

    placeOnGrid(col, row, x, y) {
      this.col = col;
      this.row = row;
      this.x = x;
      this.y = y;
      this.vx = 0;
      this.vy = 0;
      this.state = 'grid';
      this.scale = 1;
      this.alpha = 1;
    }

    beginPop() {
      this.state = 'popping';
      this.popProgress = 0;
    }

    beginFall(delay = 0) {
      this.state = 'falling';
      this.fallDelay = delay;
      this.vx = (Math.random() - 0.5) * 80;
      this.vy = 40 + Math.random() * 60;
    }
  }

  BS.Bubble = Bubble;
})(typeof window !== 'undefined' ? window : globalThis);
