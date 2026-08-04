/**
 * Pure helpers shared across modules.
 */
(function (global) {
  'use strict';

  const BS = global.BS || (global.BS = {});

  const Utils = {
    clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    },

    lerp(a, b, t) {
      return a + (b - a) * t;
    },

    distance(ax, ay, bx, by) {
      const dx = ax - bx;
      const dy = ay - by;
      return Math.hypot(dx, dy);
    },

    normalize(x, y) {
      const len = Math.hypot(x, y) || 1;
      return { x: x / len, y: y / len };
    },

    randomInt(min, maxInclusive) {
      return Math.floor(Math.random() * (maxInclusive - min + 1)) + min;
    },

    pick(array) {
      return array[Utils.randomInt(0, array.length - 1)];
    },

    /**
     * Odd-r horizontal layout neighbor offsets.
     * Even and odd rows have different lateral neighbors.
     */
    hexNeighbors(col, row) {
      const odd = row & 1;
      if (odd) {
        return [
          [col, row - 1],
          [col + 1, row - 1],
          [col - 1, row],
          [col + 1, row],
          [col, row + 1],
          [col + 1, row + 1],
        ];
      }
      return [
        [col - 1, row - 1],
        [col, row - 1],
        [col - 1, row],
        [col + 1, row],
        [col - 1, row + 1],
        [col, row + 1],
      ];
    },

    easeOutCubic(t) {
      return 1 - (1 - t) ** 3;
    },

    easeOutBack(t) {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
    },

    formatScore(n) {
      return Math.max(0, Math.floor(n)).toLocaleString('en-US');
    },

    now() {
      return performance.now();
    },
  };

  BS.Utils = Object.freeze(Utils);
})(typeof window !== 'undefined' ? window : globalThis);
