/**
 * Score, combo tracking, and high-score persistence bridge.
 */
(function (global) {
  'use strict';

  const BS = global.BS || (global.BS = {});
  const { CONSTANTS, Utils } = BS;

  class ScoreManager {
    /**
     * @param {BS.StorageManager} storage
     */
    constructor(storage) {
      this.storage = storage;
      this.score = 0;
      this.highScore = storage.getHighScore();
      this.combo = 0;
      this.lastPopCount = 0;
      this.listeners = new Set();
    }

    onChange(listener) {
      this.listeners.add(listener);
      return () => this.listeners.delete(listener);
    }

    emit() {
      for (const listener of this.listeners) {
        listener(this.snapshot());
      }
    }

    snapshot() {
      return {
        score: this.score,
        highScore: this.highScore,
        combo: this.combo,
        formattedScore: Utils.formatScore(this.score),
        formattedHighScore: Utils.formatScore(this.highScore),
      };
    }

    reset() {
      this.score = 0;
      this.combo = 0;
      this.lastPopCount = 0;
      this.highScore = this.storage.getHighScore();
      this.emit();
    }

    /**
     * @param {number} popped matched bubbles removed
     * @param {number} fallen floating bubbles dropped
     */
    registerClear(popped, fallen) {
      this.combo += 1;
      this.lastPopCount = popped + fallen;

      const comboBonus = 1 + (this.combo - 1) * CONSTANTS.COMBO_MULTIPLIER;
      const points = Math.round(
        (popped * CONSTANTS.SCORE_POP + fallen * CONSTANTS.SCORE_FALL) * comboBonus
      );

      this.score += points;
      this.persistHighScore();
      this.emit();
      return { points, combo: this.combo, popped, fallen };
    }

    registerMiss() {
      this.combo = 0;
      this.emit();
    }

    persistHighScore() {
      if (this.score > this.highScore) {
        this.highScore = this.score;
        this.storage.setHighScore(this.highScore);
      }
    }
  }

  BS.ScoreManager = ScoreManager;
})(typeof window !== 'undefined' ? window : globalThis);
