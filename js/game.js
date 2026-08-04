/**
 * Game orchestrator — lifecycle, rules, and frame loop.
 */
(function (global) {
  'use strict';

  const BS = global.BS || (global.BS = {});
  const { CONSTANTS, Utils } = BS;

  const State = Object.freeze({
    TITLE: 'title',
    PLAYING: 'playing',
    RESOLVING: 'resolving',
    WON: 'won',
    LOST: 'lost',
  });

  class Game {
    /**
     * @param {object} options
     * @param {HTMLCanvasElement} options.canvas
     * @param {HTMLElement} options.stage
     */
    constructor(options) {
      this.canvas = options.canvas;
      this.stage = options.stage;

      this.storage = new BS.StorageManager();
      this.scoreManager = new BS.ScoreManager(this.storage);
      this.sound = new BS.SoundManager(this.storage);
      this.ui = new BS.UIManager(document);
      this.renderer = new BS.Renderer(this.canvas);
      this.animations = new BS.AnimationManager();
      this.particles = new BS.ParticleSystem();

      this.board = null;
      this.shooter = null;
      this.collision = null;
      this.flying = null;
      this.falling = [];
      this.comboFloats = [];
      this.trajectory = [];

      this.state = State.TITLE;
      this.rafId = 0;
      this.lastTime = 0;
      this.layout = null;
      this.destroyed = false;

      this.onResize = this.handleResize.bind(this);
      this.tick = this.frame.bind(this);

      this.scoreManager.onChange((snap) => this.ui.updateScore(snap));
      this.ui.bindActions({
        onRestart: () => this.restart(),
        onPlay: () => this.start(),
        onMute: () => this.toggleMute(),
        onHelp: () => this.ui.openHelp(),
        onCloseHelp: () => this.ui.closeHelp(),
      });
      this.ui.setMuted(this.sound.muted);

      this.input = new BS.InputManager(this.canvas, {
        onAim: (x, y) => this.handleAim(x, y),
        onShoot: () => this.handleShoot(),
        onNudge: (dir) => this.handleNudge(dir),
        onRestart: () => this.restart(),
        onMute: () => this.toggleMute(),
        onUnlock: () => this.sound.unlock(),
      });

      global.addEventListener('resize', this.onResize);
      this.handleResize();
      this.showTitle();
      this.startLoop();
    }

    destroy() {
      this.destroyed = true;
      cancelAnimationFrame(this.rafId);
      global.removeEventListener('resize', this.onResize);
      this.input.destroy();
    }

    showTitle() {
      this.state = State.TITLE;
      this.input.setEnabled(false);
      this.ui.showOverlay({
        title: 'Clear the Sky',
        message: 'Match 3 or more on the hex grid. Don’t let bubbles cross the danger line.',
        scoreText: `Best ${Utils.formatScore(this.storage.getHighScore())}`,
        showPlay: true,
      });
      this.ui.setStatus('Ready');
    }

    start() {
      this.storage.incrementGamesPlayed();
      this.sound.unlock();
      this.resetWorld();
      this.state = State.PLAYING;
      this.input.setEnabled(true);
      this.ui.hideOverlay();
      this.ui.setStatus('Aim and shoot');
      this.scoreManager.reset();
      this.canvas.focus({ preventScroll: true });
    }

    restart() {
      this.start();
    }

    toggleMute() {
      const muted = this.sound.toggleMute();
      this.ui.setMuted(muted);
    }

    resetWorld() {
      this.animations.clear();
      this.particles.clear();
      this.flying = null;
      this.falling = [];
      this.comboFloats = [];
      this.trajectory = [];

      const layout = this.computeLayout();
      this.layout = layout;

      this.board = new BS.Board({
        cols: CONSTANTS.COLS,
        rows: CONSTANTS.ROWS,
        radius: layout.radius,
        originX: layout.originX,
        originY: layout.originY,
      });

      const colorPool = BS.COLORS.map((_, i) => i);
      this.board.populate(CONSTANTS.INITIAL_ROWS, colorPool);

      this.collision = new BS.CollisionEngine({
        left: layout.playLeft,
        right: layout.playRight,
        top: layout.playTop,
        bottom: layout.playBottom,
      });

      this.shooter = new BS.Shooter({
        getColorPool: () => {
          const active = this.board.getActiveColorIndices();
          return active.length ? active : colorPool;
        },
      });
      this.shooter.setPosition(layout.shooterX, layout.shooterY, layout.radius);
      this.shooter.reset();
      this.updateTrajectory();
    }

    computeLayout() {
      const stageRect = this.stage.getBoundingClientRect();
      const width = Math.max(280, Math.floor(stageRect.width));
      const height = Math.max(420, Math.floor(stageRect.height));
      this.renderer.resize(width, height);

      const paddingX = Math.max(12, width * 0.04);
      const paddingTop = 18;
      const shooterReserve = 110;

      const playWidth = width - paddingX * 2;
      // Odd rows shift by one radius, so usable span is (cols)*diameter + radius.
      const radius = Math.floor(playWidth / (CONSTANTS.COLS * 2 + 1));
      const boardWidth = CONSTANTS.COLS * radius * 2 + radius;
      const originX = (width - boardWidth) / 2;
      const originY = paddingTop;
      const rowHeight = radius * Utils.SQRT3;
      const boardBottom = originY + (CONSTANTS.ROWS - 1) * rowHeight + radius * 2;
      const dangerY = originY + CONSTANTS.DANGER_ROW * rowHeight + radius;

      return {
        width,
        height,
        radius,
        originX,
        originY,
        playLeft: originX,
        playRight: originX + boardWidth,
        playTop: originY,
        playBottom: height - 8,
        shooterX: width / 2,
        shooterY: Math.min(height - 52, Math.max(boardBottom + 36, height - shooterReserve + 24)),
        dangerY,
        nextX: width - Math.max(36, radius * 1.6),
        nextY: height - 52,
      };
    }

    handleResize() {
      const layout = this.computeLayout();
      this.layout = layout;
      if (!this.board || !this.shooter || !this.collision) return;

      this.board.resize(layout.radius, layout.originX, layout.originY);
      this.collision.setBounds({
        left: layout.playLeft,
        right: layout.playRight,
        top: layout.playTop,
        bottom: layout.playBottom,
      });
      this.shooter.setPosition(layout.shooterX, layout.shooterY, layout.radius);
      if (this.flying) this.flying.radius = layout.radius;
      this.updateTrajectory();
    }

    handleAim(x, y) {
      if (this.state !== State.PLAYING || !this.shooter) return;
      this.shooter.aimAt(x, y);
      this.updateTrajectory();
    }

    handleNudge(dir) {
      if (this.state !== State.PLAYING || !this.shooter) return;
      this.shooter.nudgeAngle(dir * CONSTANTS.KEYBOARD_AIM_STEP);
      this.updateTrajectory();
    }

    handleShoot() {
      if (this.state !== State.PLAYING || !this.shooter || !this.shooter.canShoot) return;
      if (this.flying) return;

      const shot = this.shooter.shoot();
      if (!shot) return;
      this.flying = shot;
      this.trajectory = [];
      this.sound.playShoot();
      this.ui.setStatus('Flying…');
    }

    updateTrajectory() {
      if (!this.shooter || !this.collision || !this.board) {
        this.trajectory = [];
        return;
      }
      if (this.state !== State.PLAYING || !this.shooter.canShoot || this.flying) {
        this.trajectory = [];
        return;
      }
      this.trajectory = this.collision.predictTrajectory(
        this.shooter.x,
        this.shooter.y,
        this.shooter.angle,
        CONSTANTS.SHOOT_SPEED,
        this.board,
        CONSTANTS.TRAJECTORY_SEGMENTS,
        CONSTANTS.AIM_MAX_BOUNCES
      );
    }

    startLoop() {
      this.lastTime = Utils.now();
      this.rafId = requestAnimationFrame(this.tick);
    }

    frame(timestamp) {
      if (this.destroyed) return;
      const dtMs = Utils.clamp(timestamp - this.lastTime, 0, CONSTANTS.MAX_DELTA_MS);
      this.lastTime = timestamp;
      const dt = dtMs / 1000;

      this.update(dt, dtMs);
      this.draw();
      this.rafId = requestAnimationFrame(this.tick);
    }

    update(dt, dtMs) {
      this.animations.update(dtMs);
      this.particles.update(dt);
      this.updateFalling(dt);
      this.updateComboFloats(dt);

      if (this.state === State.PLAYING && this.flying) {
        this.updateFlying(dt);
      }
    }

    updateFlying(dt) {
      const result = this.collision.integrate(this.flying, dt, this.board);
      if (!result) return;

      if (result.type === 'out') {
        this.flying = null;
        this.shooter.canShoot = true;
        this.scoreManager.registerMiss();
        this.updateTrajectory();
        this.ui.setStatus('Missed — try again');
        return;
      }

      if (result.bounces > 0) this.sound.playBounce();

      const snap = this.board.findSnapCell(result.x, result.y);
      if (!snap) {
        // No legal cell — treat as loss if jammed near danger, else discard.
        this.flying = null;
        this.shooter.canShoot = true;
        this.checkLose();
        this.updateTrajectory();
        return;
      }

      const placed = this.flying;
      this.flying = null;
      this.board.set(snap.col, snap.row, placed);

      // Snap polish
      placed.scale = 0.2;
      this.animations.play({
        duration: 180,
        easing: Utils.easeOutBack,
        onUpdate: (t) => {
          placed.scale = Utils.lerp(0.2, 1, t);
        },
      });

      this.state = State.RESOLVING;
      this.resolvePlacement(snap.col, snap.row);
    }

    resolvePlacement(col, row) {
      const group = this.board.findMatchGroup(col, row);
      if (group.length < CONSTANTS.MATCH_MIN) {
        this.scoreManager.registerMiss();
        this.finishResolve();
        return;
      }

      // Pop matched bubbles.
      let delay = 0;
      for (const { col: c, row: r, bubble } of group) {
        this.board.remove(c, r);
        bubble.beginPop();
        this.animations.play({
          duration: 220,
          delay,
          easing: Utils.easeOutCubic,
          onUpdate: (t) => {
            bubble.popProgress = t;
            bubble.scale = 1 + t * 0.45;
            bubble.alpha = 1 - t;
          },
          onComplete: () => {
            this.particles.burst(bubble.x, bubble.y, bubble.color.fill);
          },
        });
        delay += 18;
      }
      this.sound.playPop();

      // Floating clusters after matches.
      const floating = this.board.findFloatingClusters();
      floating.forEach(({ col: c, row: r, bubble }, index) => {
        this.board.remove(c, r);
        bubble.beginFall(index * 0.03);
        this.falling.push(bubble);
      });
      if (floating.length) this.sound.playFall();

      const award = this.scoreManager.registerClear(group.length, floating.length);
      this.spawnComboFloat(award);

      // Wait for pops/falls to settle, then continue.
      const wait = 240 + delay + floating.length * 20;
      this.animations.play({
        duration: wait,
        onUpdate: () => {},
        onComplete: () => this.finishResolve(),
      });
    }

    spawnComboFloat(award) {
      if (!this.layout) return;
      const text =
        award.combo > 1
          ? `Combo ×${award.combo}  +${award.points}`
          : `+${award.points}`;
      this.comboFloats.push({
        text,
        x: this.layout.width / 2,
        y: this.layout.shooterY - 90,
        life: 1,
      });
      if (award.combo > 1) {
        this.sound.playCombo(award.combo);
        this.particles.sparkle(this.layout.width / 2, this.layout.shooterY - 100, '#ffe08a');
      }
    }

    updateComboFloats(dt) {
      for (let i = this.comboFloats.length - 1; i >= 0; i -= 1) {
        const item = this.comboFloats[i];
        item.life -= dt * 0.85;
        item.y -= 28 * dt;
        if (item.life <= 0) this.comboFloats.splice(i, 1);
      }
    }

    updateFalling(dt) {
      for (let i = this.falling.length - 1; i >= 0; i -= 1) {
        const bubble = this.falling[i];
        if (bubble.fallDelay > 0) {
          bubble.fallDelay -= dt;
          continue;
        }
        bubble.vy += 900 * dt;
        bubble.x += bubble.vx * dt;
        bubble.y += bubble.vy * dt;
        bubble.alpha = Utils.clamp(bubble.alpha - dt * 0.35, 0, 1);
        if (bubble.y > (this.layout?.height || 800) + 40 || bubble.alpha <= 0) {
          this.falling.splice(i, 1);
        }
      }
    }

    finishResolve() {
      if (this.state === State.WON || this.state === State.LOST) return;

      this.shooter.reloadColors();
      this.shooter.canShoot = true;

      if (this.board.countBubbles() === 0) {
        this.win();
        return;
      }

      if (this.checkLose()) return;

      this.state = State.PLAYING;
      this.updateTrajectory();
      this.ui.setStatus(this.scoreManager.combo > 1 ? `Combo ×${this.scoreManager.combo}` : 'Your shot');
    }

    checkLose() {
      const lowest = this.board.lowestOccupiedRow();
      if (lowest >= CONSTANTS.DANGER_ROW) {
        this.lose();
        return true;
      }
      return false;
    }

    win() {
      this.state = State.WON;
      this.input.setEnabled(false);
      this.trajectory = [];
      this.sound.playWin();
      this.scoreManager.persistHighScore();
      for (let i = 0; i < 5; i += 1) {
        const color = Utils.pick(BS.COLORS).fill;
        this.particles.burst(
          this.layout.width * (0.2 + Math.random() * 0.6),
          this.layout.height * (0.2 + Math.random() * 0.4),
          color,
          18
        );
      }
      this.ui.showOverlay({
        title: 'You Win!',
        message: 'The board is clear. Beautiful shooting.',
        scoreText: `Score ${Utils.formatScore(this.scoreManager.score)}`,
      });
      this.ui.setStatus('Victory');
    }

    lose() {
      this.state = State.LOST;
      this.input.setEnabled(false);
      this.trajectory = [];
      this.sound.playLose();
      this.scoreManager.persistHighScore();
      this.ui.showOverlay({
        title: 'Game Over',
        message: 'Bubbles reached the danger line. Try a tighter angle next time.',
        scoreText: `Score ${Utils.formatScore(this.scoreManager.score)}`,
      });
      this.ui.setStatus('Defeated');
    }

    draw() {
      const { renderer, layout } = this;
      if (!layout) return;

      renderer.clear();

      if (this.board) {
        renderer.drawDangerLine(layout.dangerY, layout.width);
        renderer.drawBoard(this.board);
      }

      for (const bubble of this.falling) {
        renderer.drawBubble(bubble);
      }

      if (this.trajectory.length) {
        renderer.drawTrajectory(this.trajectory);
      }

      if (this.shooter && this.state !== State.TITLE) {
        renderer.drawAimGuide(this.shooter);
        renderer.drawShooter(this.shooter);
        renderer.drawNextPreview(this.shooter, layout.nextX, layout.nextY, 'Next');
      }

      if (this.flying) {
        renderer.drawBubble(this.flying);
      }

      this.particles.draw(renderer.ctx);

      for (const item of this.comboFloats) {
        renderer.drawComboText(item.text, item.x, item.y, 1 - item.life);
      }
    }
  }

  BS.Game = Game;
  BS.GameState = State;
})(typeof window !== 'undefined' ? window : globalThis);
