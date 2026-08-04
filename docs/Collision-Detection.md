# Collision Detection

Accurate collisions are essential for fair Bubble Shooter gameplay. This project
uses continuous detection for the flying bubble instead of naïve end-of-frame
overlap tests.

## Coordinate Spaces

* Simulation and rendering share CSS pixel space
* Bubble positions refer to circle centers
* Board cells convert to pixels via odd-r hex layout:

```
x = originX + col * (2r) + (row % 2 ? r : 0) + r
y = originY + row * (r * Math.sqrt(3)) + r
```

## Wall Bouncing

Left and right walls reflect the horizontal velocity component:

* Hit left ⇒ `vx = +|vx|`, clamp center to `left + radius`
* Hit right ⇒ `vx = -|vx|`, clamp center to `right - radius`

Integration may sub-step within a frame when a bounce consumes only part of `dt`,
preventing tunneling through walls at high speed.

## Ceiling

If the flying bubble’s top reaches the playfield ceiling, flight ends and the
bubble snaps into the best top-row (or attachable) cell.

## Bubble–Bubble Hits

Against each occupied grid bubble, the engine solves a segment–circle
intersection for the moving center:

```
P(t) = P0 + t * (P1 - P0),  t ∈ [0, 1]
‖P(t) - C‖ = R_flying + R_grid - ε
```

Expanded into a quadratic `a t² + b t + c = 0`. The smallest valid root in
`[0, 1]` wins. A small `ε` (≈1px) makes contact feel sticky and avoids gaps from
float error.

If the projectile already overlaps a neighbor at the start of a step (`c ≤ 0`),
`t = 0` is returned immediately.

## Snapping

Collision points rarely land on exact hex centers. After a hit:

1. Enumerate empty cells that are attachable
2. Score each by Euclidean distance from the impact point
3. Place the bubble on the closest cell and zero its velocity

Attachable cells are:

* Any empty cell in row `0`, or
* Any empty cell with at least one occupied hex neighbor

## Trajectory Prediction

Aim assist reuses the same bounce and hit logic with fixed-length steps and a
bounce budget. It is render-only and never mutates board state.

## Edge Cases Covered

| Case | Handling |
| ---- | -------- |
| Multiple wall bounces in one frame | Sub-stepping |
| Tunneling through a bubble | Continuous segment test |
| Impact near two cells | Nearest attachable wins |
| No attachable cell | Shot discarded / lose check |
| Projectile past bottom | Miss, restore shooter |
| Odd-row neighbor offsets | Shared `Utils.hexNeighbors` |

## Why Not Physics Engines

A dedicated engine would add weight and dependencies. The bubble domain is
constrained (constant radius circles + hex grid), so a purpose-built solver is
smaller, clearer, and easier to audit.
