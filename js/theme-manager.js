/**
 * Applies and persists visual skins.
 */
(function (global) {
  'use strict';

  const BS = global.BS || (global.BS = {});

  class ThemeManager {
    /**
     * @param {BS.StorageManager} storage
     */
    constructor(storage) {
      this.storage = storage;
      this.listeners = new Set();
      this.currentId = 'original';
      this.current = BS.THEMES.original;
      this.snow = null;
      this.halloween = null;

      if (BS.SnowField) {
        try {
          this.snow = new BS.SnowField();
        } catch {
          this.snow = null;
        }
      }
      if (BS.HalloweenField) {
        try {
          this.halloween = new BS.HalloweenField();
        } catch {
          this.halloween = null;
        }
      }
    }

    onChange(listener) {
      this.listeners.add(listener);
      return () => this.listeners.delete(listener);
    }

    list() {
      return BS.THEME_ORDER.map((id) => BS.THEMES[id]);
    }

    syncEffects(themeId) {
      if (this.snow) {
        if (themeId === 'newyear') this.snow.start();
        else this.snow.stop();
      }
      if (this.halloween) {
        if (themeId === 'halloween') this.halloween.start();
        else this.halloween.stop();
      }
    }

    /**
     * @param {string} id
     * @param {{ persist?: boolean }} [options]
     */
    setTheme(id, options = {}) {
      const theme = BS.THEMES[id] || BS.THEMES.original;
      this.currentId = theme.id;
      this.current = theme;

      const root = document.documentElement;
      root.setAttribute('data-theme', theme.id);

      for (const [key, value] of Object.entries(theme.css)) {
        root.style.setProperty(key, value);
      }

      // Live bubble palette — colorIndex stays stable across skins.
      BS.COLORS = theme.colors;

      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', theme.themeColor);

      const tag = document.querySelector('.brand-tag');
      if (tag) tag.textContent = theme.tagline;

      if (options.persist !== false) {
        this.storage.setTheme(theme.id);
      }

      this.syncEffects(theme.id);

      for (const listener of this.listeners) {
        listener(theme);
      }

      return theme;
    }

    cycle() {
      const order = BS.THEME_ORDER;
      const idx = order.indexOf(this.currentId);
      const next = order[(idx + 1) % order.length];
      return this.setTheme(next);
    }

    restore() {
      const saved = this.storage.getTheme();
      return this.setTheme(BS.THEMES[saved] ? saved : 'original', { persist: false });
    }
  }

  BS.ThemeManager = ThemeManager;
})(typeof window !== 'undefined' ? window : globalThis);
