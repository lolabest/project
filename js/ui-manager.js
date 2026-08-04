/**
 * DOM HUD, overlays, and skin picker.
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
        skinsBtn: document.getElementById('btn-skins'),
        helpDialog: document.getElementById('help-dialog'),
        closeHelpBtn: document.getElementById('btn-close-help'),
        skinsDialog: document.getElementById('skins-dialog'),
        closeSkinsBtn: document.getElementById('btn-close-skins'),
        skinsGrid: document.getElementById('skins-grid'),
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
      this.openDialog(this.els.helpDialog);
    }

    closeHelp() {
      this.closeDialog(this.els.helpDialog);
    }

    openSkins() {
      this.openDialog(this.els.skinsDialog);
    }

    closeSkins() {
      this.closeDialog(this.els.skinsDialog);
    }

    openDialog(dialog) {
      if (!dialog) return;
      if (typeof dialog.showModal === 'function') {
        if (!dialog.open) dialog.showModal();
      } else {
        dialog.hidden = false;
      }
    }

    closeDialog(dialog) {
      if (!dialog) return;
      if (typeof dialog.close === 'function' && dialog.open) {
        dialog.close();
      } else {
        dialog.hidden = true;
      }
    }

    /**
     * Build skin cards once and keep selection in sync.
     * @param {object[]} themes
     * @param {string} activeId
     * @param {(id: string) => void} onSelect
     */
    renderSkins(themes, activeId, onSelect) {
      const grid = this.els.skinsGrid;
      if (!grid) return;
      grid.innerHTML = '';

      for (const theme of themes) {
        const btn = this.document.createElement('button');
        btn.type = 'button';
        btn.className = 'skin-card';
        btn.dataset.themeId = theme.id;
        btn.setAttribute('aria-pressed', theme.id === activeId ? 'true' : 'false');
        btn.setAttribute('aria-label', `${theme.name} skin. ${theme.blurb}`);

        const swatches = theme.colors
          .map((c) => `<span class="skin-swatch" style="background:${c.fill}"></span>`)
          .join('');

        btn.innerHTML = `
          <span class="skin-preview" data-skin="${theme.id}" aria-hidden="true"></span>
          <span class="skin-meta">
            <span class="skin-name">${theme.name}</span>
            <span class="skin-blurb">${theme.blurb}</span>
            <span class="skin-swatches">${swatches}</span>
          </span>
        `;

        btn.addEventListener('click', () => onSelect(theme.id));
        grid.appendChild(btn);
      }
    }

    setActiveSkin(activeId) {
      const grid = this.els.skinsGrid;
      if (!grid) return;
      for (const btn of grid.querySelectorAll('.skin-card')) {
        const on = btn.dataset.themeId === activeId;
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        btn.classList.toggle('is-active', on);
      }
    }

    bindActions({ onRestart, onPlay, onMute, onHelp, onCloseHelp, onSkins, onCloseSkins }) {
      this.els.restartBtn?.addEventListener('click', onRestart);
      this.els.playBtn?.addEventListener('click', onPlay);
      this.els.muteBtn?.addEventListener('click', onMute);
      this.els.helpBtn?.addEventListener('click', onHelp);
      this.els.closeHelpBtn?.addEventListener('click', onCloseHelp);
      this.els.skinsBtn?.addEventListener('click', onSkins);
      this.els.closeSkinsBtn?.addEventListener('click', onCloseSkins);
      this.els.helpDialog?.addEventListener('cancel', (e) => {
        e.preventDefault();
        onCloseHelp();
      });
      this.els.skinsDialog?.addEventListener('cancel', (e) => {
        e.preventDefault();
        onCloseSkins();
      });
    }
  }

  BS.UIManager = UIManager;
})(typeof window !== 'undefined' ? window : globalThis);
