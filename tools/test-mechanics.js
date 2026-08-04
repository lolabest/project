#!/usr/bin/env node
/**
 * Headless mechanics + keyboard smoke tests (no browser required).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const http = require('http');

const root = path.resolve(__dirname, '..');

const files = [
  'js/constants.js',
  'js/utils.js',
  'js/bubble.js',
  'js/board.js',
  'js/collision-engine.js',
  'js/shooter.js',
  'js/storage-manager.js',
  'js/score-manager.js',
  'js/animation-manager.js',
  'js/particle-system.js',
  'js/renderer.js',
  'js/sound-manager.js',
  'js/input-manager.js',
  'js/ui-manager.js',
  'js/game.js',
];

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

function loadNamespace() {
  const listeners = { keydown: [], keyup: [], resize: [] };
  const sandbox = {
    console,
    performance: { now: () => Date.now() },
    requestAnimationFrame: () => 0,
    cancelAnimationFrame: () => {},
    devicePixelRatio: 1,
    localStorage: {
      _data: {},
      setItem(k, v) { this._data[k] = String(v); },
      getItem(k) { return this._data[k] ?? null; },
      removeItem(k) { delete this._data[k]; },
    },
    addEventListener(type, fn) {
      (listeners[type] || (listeners[type] = [])).push(fn);
    },
    removeEventListener(type, fn) {
      const arr = listeners[type] || [];
      const i = arr.indexOf(fn);
      if (i >= 0) arr.splice(i, 1);
    },
    setTimeout,
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.document = {
    getElementById(id) {
      return {
        id,
        textContent: '',
        hidden: false,
        classList: { toggle() {}, add() {}, remove() {} },
        setAttribute() {},
        getAttribute() { return null; },
        addEventListener() {},
        focus() {},
        showModal() {},
        close() {},
        open: false,
      };
    },
    readyState: 'complete',
    addEventListener() {},
    body: {},
  };

  const ctx = vm.createContext(sandbox);
  for (const file of files) {
    const code = fs.readFileSync(path.join(root, file), 'utf8');
    vm.runInContext(code, ctx, { filename: file });
  }
  return { BS: sandbox.BS, listeners, sandbox };
}

function testBoardMatching(BS) {
  const board = new BS.Board({
    cols: 8,
    rows: 12,
    radius: 16,
    originX: 0,
    originY: 0,
  });
  for (let c = 0; c < 3; c += 1) {
    board.set(c, 0, new BS.Bubble({ colorIndex: 0, radius: 16 }));
  }
  board.set(4, 0, new BS.Bubble({ colorIndex: 1, radius: 16 }));
  const group = board.findMatchGroup(1, 0);
  assert(group.length === 3, `expected match of 3, got ${group.length}`);

  board.set(0, 4, new BS.Bubble({ colorIndex: 2, radius: 16 }));
  const floating = board.findFloatingClusters();
  assert(
    floating.some((f) => f.col === 0 && f.row === 4),
    'expected disconnected bubble to float'
  );
  console.log('OK: board matching + floating clusters');
}

function testKeyboard(BS, listeners) {
  const canvas = {
    getContext() {
      return new Proxy({}, { get: () => () => {} });
    },
    style: {},
    width: 0,
    height: 0,
    addEventListener() {},
    removeEventListener() {},
    getBoundingClientRect() {
      return { left: 0, top: 0, width: 800, height: 700 };
    },
    setPointerCapture() {},
    focus() {},
  };
  const stage = {
    getBoundingClientRect() {
      return { left: 0, top: 0, width: 800, height: 700 };
    },
  };

  const game = new BS.Game({ canvas, stage });
  game.start();
  const before = game.shooter.angle;
  for (const fn of listeners.keydown) {
    fn({ key: 'ArrowLeft', code: 'ArrowLeft', repeat: false, preventDefault() {} });
  }
  assert(game.shooter.angle < before, 'ArrowLeft should nudge aim left/up-left');

  for (const fn of listeners.keydown) {
    fn({ key: ' ', code: 'Space', repeat: false, preventDefault() {} });
  }
  assert(game.flying, 'Space should launch a flying bubble');
  console.log('OK: keyboard aim + shoot');
}

function testHttpIndex() {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:8080/index.html', (res) => {
      assert(res.statusCode === 200, `expected 200 from local server, got ${res.statusCode}`);
      console.log('OK: local index.html serves 200');
      res.resume();
      resolve();
    });
    req.on('error', () => {
      console.log('SKIP: local server not running (optional check)');
      resolve();
    });
    req.setTimeout(500, () => {
      req.destroy();
      console.log('SKIP: local server not running (optional check)');
      resolve();
    });
  });
}

async function main() {
  const { BS, listeners } = loadNamespace();
  assert(BS && BS.Game && BS.Board, 'BS namespace incomplete');
  testBoardMatching(BS);
  testKeyboard(BS, listeners);
  await testHttpIndex();
  console.log('All mechanics tests passed.');
}

main();
