# Game Mechanics

This document defines the rules implemented by Bubble Shooter. It is the source
of truth for gameplay behavior.

## Board

* Layout: **odd-r horizontal hex grid**
* Size: `10` columns × `14` rows (configurable in `constants.js`)
* Opening layout: top `6` rows seeded with random colors
* Ceiling: row `0` anchors all “connected” clusters
* Danger line: row `13` — any occupied cell at or below this row ends the game

Odd rows are shifted right by one bubble radius so neighbors pack into a
honeycomb.

## Bubbles

* Six colors: crimson, azure, emerald, amber, violet, coral
* Each bubble occupies at most one grid cell
* States: `grid`, `flying`, `falling`, `popping`

The shooter always holds a **current** bubble and a **next** preview. After a
shot, next becomes current and a new next is drawn from colors still present on
the board (prevents unwinnable dead colors).

## Aiming & Shooting

* Aim with pointer position or keyboard nudges
* Aim angle is clamped so shots travel upward (no downward firing)
* Launch speed is constant (`SHOOT_SPEED`)
* Only one flying bubble may exist at a time

## Collision & Snapping

1. The flying bubble integrates with wall bouncing on left/right bounds.
2. Contact with the ceiling or another bubble ends flight.
3. The engine chooses the nearest **empty, attachable** hex cell.
4. Attachable means: on the ceiling row, or neighboring at least one occupied cell.

See [Collision Detection](./Collision-Detection.md) for the math.

## Matching

After a successful snap:

1. Flood-fill all orthogonally-hex-adjacent bubbles of the same color.
2. If the group size is **≥ 3**, every bubble in the group pops.
3. Score increases by `SCORE_POP` per popped bubble, scaled by combo.

## Floating Clusters

After pops are removed:

1. BFS from every occupied ceiling cell marks the connected component.
2. Any bubble **not** in that component is a floater.
3. Floaters detach, fall with light lateral drift, and award `SCORE_FALL` each.

## Scoring & Combos

| Event | Base points |
| ----- | ----------- |
| Matched pop | 10 |
| Floating fall | 20 |

Combo multiplier:

```
points = round((pops * 10 + falls * 20) * (1 + (combo - 1) * 0.35))
```

* Successful matches increment combo
* A shot that does not create a match resets combo to `0`
* High score persists in `localStorage`

## Win / Lose

* **Win**: board contains zero bubbles after resolution
* **Lose**: any bubble occupies a cell at `row >= DANGER_ROW`
* Both states open an accessible modal with restart

## Controls

| Input | Action |
| ----- | ------ |
| Mouse / touch drag | Aim |
| Mouse / touch release | Shoot |
| `←` `→` / `A` `D` | Nudge aim |
| `Space` / `Enter` / `↑` | Shoot |
| `R` | Restart |
| `M` | Mute toggle |

## Responsiveness

The playfield is viewport-first: a compact HUD leaves most of the screen for the
canvas. Bubble radius is derived from **both** stage width and height so the full
hex grid (`COLS` × `ROWS`) fits with a reserved shooter band at the bottom.
Shooter position and danger line recalculate on resize. Mobile layouts drop the
side chrome and scale the stage to the remaining viewport without horizontal
scroll.
