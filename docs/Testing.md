# Testing Strategy

Bubble Shooter ships without a test framework dependency. Quality is maintained
through a layered approach that fits a zero-build vanilla project.

## Layers

### 1. Static Validation (CI)

```bash
bash tools/validate.sh
node tools/test-mechanics.js
```

`tools/validate.sh` checks:

* Required files exist
* JavaScript parses (`node --check` when Node is available)
* No `TODO` / `FIXME` markers in shipped source
* Script tags in `index.html` match files on disk
* Basic HTML landmarks and accessibility attributes are present

`tools/test-mechanics.js` exercises match groups, floating clusters, and keyboard
aim/shoot through a headless `BS` namespace load (no browser required).

### 2. Manual Gameplay Checklist

Run before every release or substantial PR:

#### Boot

- [ ] Opening `index.html` shows the title overlay with brand prominence
- [ ] Play starts a populated hex board and enables aiming
- [ ] No browser console errors

#### Core Loop

- [ ] Aim follows pointer; keyboard left/right nudges angle
- [ ] Space / click shoots a bubble
- [ ] Bubbles bounce correctly off left and right walls
- [ ] Bubbles snap into hex cells on contact
- [ ] Match of 3+ pops with particles and score increase
- [ ] Match of 2 does **not** pop
- [ ] Floating clusters fall after disconnect
- [ ] Next-bubble preview updates after each shot
- [ ] Combo multiplies points and resets after a non-matching shot

#### End States

- [ ] Clearing the board shows the win overlay
- [ ] Filling to the danger line shows the lose overlay
- [ ] Play Again / Restart restores a fresh board
- [ ] High score persists across reload

#### Platform

- [ ] Desktop Chrome / Firefox / Safari (latest)
- [ ] Mobile portrait: canvas fits, touch aim/shoot works
- [ ] Window resize mid-game keeps layout coherent
- [ ] Mute toggle persists after reload
- [ ] Help dialog opens/closes and is keyboard dismissible

#### Accessibility

- [ ] Canvas is reachable via Skip Link / Tab
- [ ] Buttons expose clear accessible names
- [ ] Overlay focuses primary action when shown
- [ ] Status text updates are announced (`aria-live`)
- [ ] Contrast remains readable on the glass panels

### 3. Edge Cases

| Scenario | Expected |
| -------- | -------- |
| Rapid click spam while a shot is flying | Ignored until resolve completes |
| Aim straight into a wall then up | Trajectory shows bounce; shot reflects |
| Last colors leave the board | Shooter ammo recolors to remaining set |
| localStorage blocked | Game runs; high score stays session-only |
| Tab backgrounded for long time | `dt` clamp prevents tunneling on return |
| Board jammed with no snap cell | Lose check / safe discard — no crash |
| Prefers-reduced-motion enabled | CSS animations minimized |

### 4. Future Automated Tests

When the community wants a harness, prefer dependency-light options:

* Node native test runner exercising `Board` / `CollisionEngine` via a tiny
  adapter that loads IIFE modules
* Playwright / Puppeteer smoke tests for boot + one shot (optional CI job)

Until then, treat `docs/Testing.md` + `tools/validate.sh` as the gate.

## Reporting Failures

File a bug with:

1. Browser + OS
2. Steps to reproduce
3. Expected vs actual
4. Screenshot / screen recording when visual
