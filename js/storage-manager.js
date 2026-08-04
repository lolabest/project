/**
 * localStorage persistence with safe fallbacks.
 */
(function (global) {
  'use strict';

  const BS = global.BS || (global.BS = {});
  const { CONSTANTS } = BS;

  class StorageManager {
    constructor(key = CONSTANTS.STORAGE_KEY) {
      this.key = key;
      this.memory = { highScore: 0, muted: false, gamesPlayed: 0 };
      this.available = StorageManager.probe();
      this.load();
    }

    static probe() {
      try {
        const testKey = '__bs_probe__';
        global.localStorage.setItem(testKey, '1');
        global.localStorage.removeItem(testKey);
        return true;
      } catch {
        return false;
      }
    }

    load() {
      if (!this.available) return;
      try {
        const raw = global.localStorage.getItem(this.key);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (typeof data.highScore === 'number' && data.highScore >= 0) {
          this.memory.highScore = Math.floor(data.highScore);
        }
        if (typeof data.muted === 'boolean') {
          this.memory.muted = data.muted;
        }
        if (typeof data.gamesPlayed === 'number' && data.gamesPlayed >= 0) {
          this.memory.gamesPlayed = Math.floor(data.gamesPlayed);
        }
      } catch {
        // Corrupt payload — keep defaults.
      }
    }

    save() {
      if (!this.available) return;
      try {
        global.localStorage.setItem(this.key, JSON.stringify(this.memory));
      } catch {
        // Quota or privacy mode — ignore.
      }
    }

    getHighScore() {
      return this.memory.highScore;
    }

    setHighScore(value) {
      this.memory.highScore = Math.max(0, Math.floor(value));
      this.save();
    }

    isMuted() {
      return this.memory.muted;
    }

    setMuted(muted) {
      this.memory.muted = Boolean(muted);
      this.save();
    }

    incrementGamesPlayed() {
      this.memory.gamesPlayed += 1;
      this.save();
      return this.memory.gamesPlayed;
    }
  }

  BS.StorageManager = StorageManager;
})(typeof window !== 'undefined' ? window : globalThis);
