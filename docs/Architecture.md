# Architecture

Bubble Shooter follows a modular, responsibility-driven design suitable for a
client-only HTML5 game. There is no bundler and no framework — modules share a
single global namespace (`window.BS`) and load via ordered `<script>` tags so the
game runs by opening `index.html`.

## Goals

* Clear separation of gameplay, rendering, input, and persistence
* Small, focused modules instead of a monolithic script
* Deterministic game rules that are easy to unit-test later
* Smooth `requestAnimationFrame` rendering with minimal DOM churn

## High-Level Diagram

```text
┌────────────┐     ┌──────────────┐     ┌────────────┐
│ InputManager│────▶│     Game     │────▶│  UIManager │
└────────────┘     │ (orchestrator)│     └────────────┘
                   └──────┬───────┘
          ┌───────────────┼────────────────┐
          ▼               ▼                ▼
   ┌────────────┐  ┌─────────────┐  ┌──────────────┐
   │   Board    │  │   Shooter   │  │ ScoreManager │
   └─────┬──────┘  └──────┬──────┘  └──────┬───────┘
         │                │                │
         ▼                ▼                ▼
   CollisionEngine   Bubble entity   StorageManager
         │
         ▼
   ┌──────────────────────────────────────┐
   │ Renderer · AnimationManager · Particles │
   │ SoundManager                          │
   └──────────────────────────────────────┘
```

## Module Catalog

| Module | Responsibility |
| ------ | -------------- |
| `constants.js` | Tunable gameplay and scoring constants |
| `utils.js` | Pure helpers (hex neighbors, easing, math) |
| `bubble.js` | Bubble entity and state transitions |
| `board.js` | Hex grid, matching, floating clusters, snapping |
| `collision-engine.js` | Flight integration, wall bounce, hit tests |
| `shooter.js` | Aiming, ammo queue, launch |
| `score-manager.js` | Score, combo, high-score events |
| `storage-manager.js` | `localStorage` with in-memory fallback |
| `animation-manager.js` | Timed tweens |
| `particle-system.js` | Burst / sparkle VFX |
| `renderer.js` | Canvas drawing (glossy bubbles, trajectory) |
| `sound-manager.js` | Web Audio synthesized SFX |
| `input-manager.js` | Pointer + keyboard |
| `ui-manager.js` | HUD and modal DOM updates |
| `game.js` | Lifecycle, win/lose, frame loop |
| `script.js` | DOM-ready bootstrap |

## Data Flow

1. **Input** updates shooter aim or requests a shot.
2. **Game** launches a flying `Bubble` and disables further shots.
3. **CollisionEngine** integrates motion each frame (walls + circle hits).
4. On impact, **Board** snaps to the nearest attachable hex cell.
5. Match groups (≥3) pop; floating clusters fall.
6. **ScoreManager** awards points; **ParticleSystem** / **SoundManager** respond.
7. **Renderer** paints the world; **UIManager** mirrors score state in the HUD.

## Rendering Strategy

* Single full-window canvas inside a responsive stage
* Device pixel ratio capped at 2 for sharpness without overdraw
* DOM used only for chrome (HUD, overlays, help) — never per-bubble nodes
* Animations are data-driven and advanced in the same rAF tick as gameplay

## Persistence

`StorageManager` writes a small JSON document:

```json
{
  "highScore": 1280,
  "muted": false,
  "gamesPlayed": 14
}
```

Corrupt or unavailable storage fails soft — gameplay continues with defaults.

## Extension Points

* New power-ups: add a `PowerUp` entity and resolve it inside `Game.resolvePlacement`
* Levels: parameterize `Board.populate` and expose a `LevelManager`
* Themes: drive `BS.COLORS` and CSS variables from a theme object
* Headless tests: instantiate `Board` / `CollisionEngine` without canvas

## Non-Goals

* Server authoritative multiplayer
* Asset pipelines / bundlers
* Framework lock-in
