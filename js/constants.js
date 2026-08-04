/**
 * Shared configuration for Bubble Shooter.
 * Tunable gameplay and visual constants live here.
 */
(function (global) {
  'use strict';

  const BS = global.BS || (global.BS = {});

  BS.COLORS = Object.freeze([
    Object.freeze({ id: 'crimson', fill: '#e63946', glow: '#ff6b6b', deep: '#9b1b2a' }),
    Object.freeze({ id: 'azure', fill: '#1d8cf8', glow: '#6bb6ff', deep: '#0b4f99' }),
    Object.freeze({ id: 'emerald', fill: '#2ec4b6', glow: '#7ef0e4', deep: '#0f7a70' }),
    Object.freeze({ id: 'amber', fill: '#ffb703', glow: '#ffe08a', deep: '#b07a00' }),
    Object.freeze({ id: 'violet', fill: '#9b5de5', glow: '#c9a0ff', deep: '#5a2d91' }),
    Object.freeze({ id: 'coral', fill: '#ff6b35', glow: '#ffab85', deep: '#b33d12' }),
  ]);

  BS.CONSTANTS = Object.freeze({
    VERSION: '1.0.0',
    STORAGE_KEY: 'bubble-shooter-v1',
    COLS: 8,
    ROWS: 12,
    INITIAL_ROWS: 5,
    MATCH_MIN: 3,
    SHOOT_SPEED: 920,
    MAX_DELTA_MS: 32,
    DANGER_ROW: 11,
    SCORE_POP: 10,
    SCORE_FALL: 20,
    COMBO_MULTIPLIER: 0.35,
    PARTICLE_BURST: 14,
    TRAJECTORY_SEGMENTS: 48,
    AIM_MAX_BOUNCES: 2,
    KEYBOARD_AIM_STEP: 0.04,
    MIN_AIM_ANGLE: Math.PI * 0.12,
    MAX_AIM_ANGLE: Math.PI * (1 - 0.12),
  });
})(typeof window !== 'undefined' ? window : globalThis);
