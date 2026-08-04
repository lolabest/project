/**
 * DOM HUD and modal overlays.
 */
(function (global) {
  'use strict';

  const BS = global.BS || (global.BS = {});

  class UIManager {
    /**
     * @param {Document} document
     */
    constructor(document) {
      this.document = document;
      this.els = {
        score: document.getElementById('score-value'),
        highScore: document.getElementById('highscore-value'),
        combo: document.getElementById('combo-value'),
        status: document.getElementById('status-text'),
        overlay: document.getElementById('game-overlay'),
        overlayTitle: document.getElementById('overlay-title'),
        overlayMessage: document.getElementById('overlay-message'),
        overlayScore: document.getElementById('overlay-score'),
        restartBtn: document.getElementById('btn-restart'),
        playBtn: document.getElementById('btn-play'),
        muteBtn: document.getElementById('btn-mute'),
        helpBtn: document.getElementById('btn-help'),
        helpDialog: document.getElementById('help-dialog'),
        closeHelpBtn: document.getElementById('btn-close-help'),
      };
    }

    updateScore({ formattedScore, formattedHighScore, combo }) {
      if (this.els.score) this.els.score.textContent = formattedScore;
      if (this.els.highScore) this.els.highScore.textContent = formattedHighScore;
      if (this.els.combo) {
        this.els.combo.textContent = combo > 1 ? `×${combo}` : '—';
        this.els.combo.classList.toggle('is-hot', combo > 1);
      }
    }

    setStatus(text) {
      if (this.els.status) this.els.status.textContent = text;
    }

    showOverlay({ title, message, scoreText, showPlay = false }) {
      const { overlay, overlayTitle, overlayMessage, overlayScore, playBtn, restartBtn } = this.els;
      if (!overlay) return;
      overlay.hidden = false;
      overlay.setAttribute('aria-hidden', 'false');
      if (overlayTitle) overlayTitle.textContent = title;
      if (overlayMessage) overlayMessage.textContent = message;
      if (overlayScore) overlayScore.textContent = scoreText;
      if (playBtn) playBtn.hidden = !showPlay;
      if (restartBtn) restartBtn.hidden = showPlay;
      // Focus primary action for accessibility.
      global.requestAnimationFrame(() => {
        const focusTarget = showPlay ? playBtn : restartBtn;
        focusTarget?.focus();
      });
    }

    hideOverlay() {
      const { overlay } = this.els;
      if (!overlay) return;
      overlay.hidden = true;
      overlay.setAttribute('aria-hidden', 'true');
    }

    setMuted(muted) {
      const btn = this.els.muteBtn;
      if (!btn) return;
      btn.setAttribute('aria-pressed', muted ? 'true' : 'false');
      btn.textContent = muted ? 'Sound Off' : 'Sound On';
      btn.title = muted ? 'Unmute sound (M)' : 'Mute sound (M)';
    }

    openHelp() {
      const dialog = this.els.helpDialog;
      if (!dialog) return;
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.hidden = false;
      }
    }

    closeHelp() {
      const dialog = this.els.helpDialog;
      if (!dialog) return;
      if (typeof dialog.close === 'function' && dialog.open) {
        dialog.close();
      } else {
        dialog.hidden = true;
      }
    }

    /**
     * Wire button callbacks.
     */
    bindActions({ onRestart, onPlay, onMute, onHelp, onCloseHelp }) {
      this.els.restartBtn?.addEventListener('click', onRestart);
      this.els.playBtn?.addEventListener('click', onPlay);
      this.els.muteBtn?.addEventListener('click', onMute);
      this.els.helpBtn?.addEventListener('click', onHelp);
      this.els.closeHelpBtn?.addEventListener('click', onCloseHelp);
      this.els.helpDialog?.addEventListener('cancel', (e) => {
        e.preventDefault();
        onCloseHelp();
      });
    }
  }

  BS.UIManager = UIManager;
})(typeof window !== 'undefined' ? window : globalThis);
