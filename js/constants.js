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
    VERSION: '1.0.1',
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
