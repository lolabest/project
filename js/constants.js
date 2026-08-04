/**
 * Shared configuration for Bubble Shooter.
 * Tunable gameplay and visual constants live here.
 */
(function (global) {
  'use strict';

  const BS = global.BS || (global.BS = {});

  BS.COLORS = Object.freeze([
    Object.freeze({ id: 'ruby', fill: '#ff3b6b', glow: '#ff9db4', deep: '#c0103e' }),
    Object.freeze({ id: 'sky', fill: '#3db7ff', glow: '#a6e1ff', deep: '#0d6fbf' }),
    Object.freeze({ id: 'lime', fill: '#7adf3c', glow: '#d2ff9a', deep: '#3b9a12' }),
    Object.freeze({ id: 'lemon', fill: '#ffd23f', glow: '#fff1a8', deep: '#d49a00' }),
    Object.freeze({ id: 'grape', fill: '#b44dff', glow: '#e2b0ff', deep: '#6d1fb8' }),
    Object.freeze({ id: 'orange', fill: '#ff8a2a', glow: '#ffd0a0', deep: '#c45500' }),
  ]);

  BS.CONSTANTS = Object.freeze({
    VERSION: '1.2.5',
    STORAGE_KEY: 'bubble-shooter-v1',
    /** Wider / taller board for a mobile-arcade playfield feel. */
    COLS: 10,
    ROWS: 14,
    INITIAL_ROWS: 6,
    MATCH_MIN: 3,
    SHOOT_SPEED: 980,
    MAX_DELTA_MS: 32,
    DANGER_ROW: 13,
    SCORE_POP: 10,
    SCORE_FALL: 20,
    COMBO_MULTIPLIER: 0.35,
    PARTICLE_BURST: 14,
    TRAJECTORY_SEGMENTS: 56,
    AIM_MAX_BOUNCES: 2,
    KEYBOARD_AIM_STEP: 0.09,
    MIN_AIM_ANGLE: Math.PI * 0.12,
    MAX_AIM_ANGLE: Math.PI * (1 - 0.12),
    /** Layout: keep shooter clear of the hex stack. */
    SHOOTER_ZONE_MIN: 96,
    SHOOTER_ZONE_RATIO: 0.125,
    BOARD_PAD_X_RATIO: 0.018,
    BOARD_PAD_TOP_RATIO: 0.012,
    MIN_BUBBLE_RADIUS: 10,
  });
})(typeof window !== 'undefined' ? window : globalThis);
