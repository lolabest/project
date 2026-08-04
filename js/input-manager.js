/**
 * Unified pointer, touch, and keyboard input.
 */
(function (global) {
  'use strict';

  const BS = global.BS || (global.BS = {});

  class InputManager {
    /**
     * @param {HTMLElement} target
     * @param {object} handlers
     */
    constructor(target, handlers) {
      this.target = target;
      this.handlers = handlers;
      this.enabled = true;
      this.pointerDown = false;
      this.keys = new Set();

      this._onPointerMove = this.onPointerMove.bind(this);
      this._onPointerDown = this.onPointerDown.bind(this);
      this._onPointerUp = this.onPointerUp.bind(this);
      this._onKeyDown = this.onKeyDown.bind(this);
      this._onKeyUp = this.onKeyUp.bind(this);
      this._onContextMenu = (e) => e.preventDefault();

      this.bind();
    }

    bind() {
      this.target.addEventListener('pointermove', this._onPointerMove);
      this.target.addEventListener('pointerdown', this._onPointerDown);
      this.target.addEventListener('pointerup', this._onPointerUp);
      this.target.addEventListener('pointercancel', this._onPointerUp);
      this.target.addEventListener('contextmenu', this._onContextMenu);
      global.addEventListener('keydown', this._onKeyDown);
      global.addEventListener('keyup', this._onKeyUp);
    }

    destroy() {
      this.target.removeEventListener('pointermove', this._onPointerMove);
      this.target.removeEventListener('pointerdown', this._onPointerDown);
      this.target.removeEventListener('pointerup', this._onPointerUp);
      this.target.removeEventListener('pointercancel', this._onPointerUp);
      this.target.removeEventListener('contextmenu', this._onContextMenu);
      global.removeEventListener('keydown', this._onKeyDown);
      global.removeEventListener('keyup', this._onKeyUp);
    }

    setEnabled(enabled) {
      this.enabled = enabled;
      if (!enabled) {
        this.pointerDown = false;
        this.keys.clear();
      }
    }

    localPoint(event) {
      const rect = this.target.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    }

    onPointerMove(event) {
      if (!this.enabled) return;
      const point = this.localPoint(event);
      if (this.handlers.onAim) this.handlers.onAim(point.x, point.y);
    }

    onPointerDown(event) {
      if (!this.enabled) return;
      if (event.button !== undefined && event.button !== 0) return;
      this.pointerDown = true;
      this.target.setPointerCapture?.(event.pointerId);
      const point = this.localPoint(event);
      if (this.handlers.onAim) this.handlers.onAim(point.x, point.y);
      if (this.handlers.onUnlock) this.handlers.onUnlock();
    }

    onPointerUp(event) {
      if (!this.enabled) return;
      if (!this.pointerDown) return;
      this.pointerDown = false;
      const point = this.localPoint(event);
      if (this.handlers.onAim) this.handlers.onAim(point.x, point.y);
      if (this.handlers.onShoot) this.handlers.onShoot();
    }

    onKeyDown(event) {
      if (!this.enabled) return;

      const key = event.key;
      const code = event.code;

      const isLeft = key === 'ArrowLeft' || key === 'a' || key === 'A' || code === 'ArrowLeft' || code === 'KeyA';
      const isRight = key === 'ArrowRight' || key === 'd' || key === 'D' || code === 'ArrowRight' || code === 'KeyD';
      const isShoot =
        key === ' ' ||
        key === 'Enter' ||
        key === 'ArrowUp' ||
        code === 'Space' ||
        code === 'Enter' ||
        code === 'ArrowUp';
      const isRestart = key === 'r' || key === 'R' || code === 'KeyR';
      const isMute = key === 'm' || key === 'M' || code === 'KeyM';
      const isTheme = key === 't' || key === 'T' || code === 'KeyT';

      if (event.repeat && isShoot) return;

      this.keys.add(code || key);

      if (isLeft || isRight || isShoot) {
        event.preventDefault();
      }

      if (this.handlers.onUnlock) this.handlers.onUnlock();

      if (isLeft) {
        if (this.handlers.onNudge) this.handlers.onNudge(-1);
      } else if (isRight) {
        if (this.handlers.onNudge) this.handlers.onNudge(1);
      } else if (isShoot) {
        if (this.handlers.onShoot) this.handlers.onShoot();
      } else if (isRestart) {
        if (this.handlers.onRestart) this.handlers.onRestart();
      } else if (isMute) {
        if (this.handlers.onMute) this.handlers.onMute();
      } else if (isTheme) {
        if (this.handlers.onTheme) this.handlers.onTheme();
      }
    }

    onKeyUp(event) {
      this.keys.delete(event.key);
    }
  }

  BS.InputManager = InputManager;
})(typeof window !== 'undefined' ? window : globalThis);
