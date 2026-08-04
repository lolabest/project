/**
 * Hexagonal bubble board — layout, occupancy, matching, and floating clusters.
 */
(function (global) {
  'use strict';

  const BS = global.BS || (global.BS = {});
  const { Utils } = BS;

  class Board {
    /**
     * @param {object} options
     * @param {number} options.cols
     * @param {number} options.rows
     * @param {number} options.radius
     * @param {number} options.originX
     * @param {number} options.originY
     */
    constructor(options) {
      this.cols = options.cols;
      this.rows = options.rows;
      this.radius = options.radius;
      this.originX = options.originX;
      this.originY = options.originY;
      /** @type {(BS.Bubble|null)[][]} */
      this.grid = [];
      this.clear();
    }

    clear() {
      this.grid = Array.from({ length: this.rows }, () =>
        Array.from({ length: this.cols }, () => null)
      );
    }

    get diameter() {
      return this.radius * 2;
    }

    get rowHeight() {
      return this.radius * BS.Utils.SQRT3;
    }

    resize(radius, originX, originY) {
      this.radius = radius;
      this.originX = originX;
      this.originY = originY;
      this.forEachBubble((bubble) => {
        const pos = this.cellToPixel(bubble.col, bubble.row);
        bubble.x = pos.x;
        bubble.y = pos.y;
        bubble.radius = radius;
      });
    }

    cellToPixel(col, row) {
      const odd = row & 1;
      const x = this.originX + col * this.diameter + (odd ? this.radius : 0) + this.radius;
      const y = this.originY + row * this.rowHeight + this.radius;
      return { x, y };
    }

    pixelToCell(x, y) {
      const localY = y - this.originY;
      const row = Math.round((localY - this.radius) / this.rowHeight);
      const odd = row & 1;
      const localX = x - this.originX - (odd ? this.radius : 0);
      const col = Math.round((localX - this.radius) / this.diameter);
      return { col, row };
    }

    inBounds(col, row) {
      return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    get(col, row) {
      if (!this.inBounds(col, row)) return null;
      return this.grid[row][col];
    }

    set(col, row, bubble) {
      if (!this.inBounds(col, row)) return false;
      this.grid[row][col] = bubble;
      if (bubble) {
        const pos = this.cellToPixel(col, row);
        bubble.placeOnGrid(col, row, pos.x, pos.y);
        bubble.radius = this.radius;
      }
      return true;
    }

    remove(col, row) {
      if (!this.inBounds(col, row)) return null;
      const bubble = this.grid[row][col];
      this.grid[row][col] = null;
      return bubble;
    }

    isEmpty(col, row) {
      return this.inBounds(col, row) && this.grid[row][col] === null;
    }

    forEachBubble(callback) {
      for (let row = 0; row < this.rows; row += 1) {
        for (let col = 0; col < this.cols; col += 1) {
          const bubble = this.grid[row][col];
          if (bubble) callback(bubble, col, row);
        }
      }
    }

    countBubbles() {
      let count = 0;
      this.forEachBubble(() => {
        count += 1;
      });
      return count;
    }

    occupiedCells() {
      const cells = [];
      this.forEachBubble((bubble, col, row) => {
        cells.push({ bubble, col, row });
      });
      return cells;
    }

    /**
     * Seed the top of the board with a playable layout.
     * @param {number} initialRows
     * @param {number[]} colorPool indices into BS.COLORS
     */
    populate(initialRows, colorPool) {
      this.clear();
      for (let row = 0; row < initialRows; row += 1) {
        for (let col = 0; col < this.cols; col += 1) {
          // Slightly thinner edges so opening shots feel inviting.
          if ((row === initialRows - 1) && (col === 0 || col === this.cols - 1) && Math.random() < 0.45) {
            continue;
          }
          const colorIndex = Utils.pick(colorPool);
          const bubble = new BS.Bubble({ colorIndex, radius: this.radius });
          this.set(col, row, bubble);
        }
      }
    }

    getActiveColorIndices() {
      const set = new Set();
      this.forEachBubble((bubble) => set.add(bubble.colorIndex));
      return [...set];
    }

    /**
     * Flood-fill same-color connected group from a cell.
     */
    findMatchGroup(col, row) {
      const start = this.get(col, row);
      if (!start) return [];

      const target = start.colorIndex;
      const visited = new Set();
      const stack = [[col, row]];
      const group = [];

      while (stack.length) {
        const [c, r] = stack.pop();
        const key = `${c},${r}`;
        if (visited.has(key) || !this.inBounds(c, r)) continue;
        visited.add(key);

        const bubble = this.get(c, r);
        if (!bubble || bubble.colorIndex !== target) continue;

        group.push({ col: c, row: r, bubble });
        for (const [nc, nr] of Utils.hexNeighbors(c, r)) {
          if (!visited.has(`${nc},${nr}`)) stack.push([nc, nr]);
        }
      }

      return group;
    }

    /**
     * Bubbles not connected to the ceiling fall.
     */
    findFloatingClusters() {
      const connected = new Set();
      const queue = [];

      for (let col = 0; col < this.cols; col += 1) {
        if (this.get(col, 0)) {
          queue.push([col, 0]);
          connected.add(`${col},0`);
        }
      }

      while (queue.length) {
        const [c, r] = queue.shift();
        for (const [nc, nr] of Utils.hexNeighbors(c, r)) {
          const key = `${nc},${nr}`;
          if (connected.has(key) || !this.get(nc, nr)) continue;
          connected.add(key);
          queue.push([nc, nr]);
        }
      }

      const floating = [];
      this.forEachBubble((bubble, col, row) => {
        if (!connected.has(`${col},${row}`)) {
          floating.push({ col, row, bubble });
        }
      });
      return floating;
    }

    /**
     * Nearest empty cell that is adjacent to at least one occupied cell,
     * or ceiling-adjacent for the first row. Used after a collision.
     */
    findSnapCell(x, y) {
      let best = null;
      let bestDist = Infinity;

      for (let row = 0; row < this.rows; row += 1) {
        for (let col = 0; col < this.cols; col += 1) {
          if (!this.isEmpty(col, row)) continue;
          if (!this.isAttachable(col, row)) continue;

          const pos = this.cellToPixel(col, row);
          const dist = Utils.distance(x, y, pos.x, pos.y);
          if (dist < bestDist) {
            bestDist = dist;
            best = { col, row, x: pos.x, y: pos.y, dist };
          }
        }
      }

      return best;
    }

    isAttachable(col, row) {
      if (row === 0) return true;
      for (const [nc, nr] of Utils.hexNeighbors(col, row)) {
        if (this.get(nc, nr)) return true;
      }
      return false;
    }

    lowestOccupiedRow() {
      let lowest = -1;
      this.forEachBubble((_b, _c, row) => {
        if (row > lowest) lowest = row;
      });
      return lowest;
    }
  }

  BS.Board = Board;
})(typeof window !== 'undefined' ? window : globalThis);
