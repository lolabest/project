/**
 * Bubble Shooter — application entry point.
 * Bootstraps the game once the DOM is ready.
 */
(function bootstrap(global) {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  ready(() => {
    const canvas = document.getElementById('game-canvas');
    const stage = document.getElementById('game-stage');

    if (!canvas || !stage) {
      document.body.innerHTML =
        '<p role="alert">Bubble Shooter failed to start: missing canvas markup.</p>';
      return;
    }

    if (!global.BS || !global.BS.Game) {
      document.body.innerHTML =
        '<p role="alert">Bubble Shooter failed to start: scripts failed to load.</p>';
      return;
    }

    const game = new global.BS.Game({ canvas, stage });
    global.BS.app = game;

    // Expose a tiny debug surface in development without noisy logging.
    if (global.location && /[?&]debug=1\b/.test(global.location.search)) {
      global.__BUBBLE_SHOOTER__ = game;
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
