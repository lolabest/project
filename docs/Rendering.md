# Rendering

Bubble Shooter renders gameplay on a single HTML5 canvas. The DOM is reserved
for chrome (HUD, overlays, help dialog).

## Pipeline

Every animation frame (`requestAnimationFrame`):

1. Advance tweens (`AnimationManager`)
2. Integrate physics / resolve rules (`Game`)
3. Update particles
4. Clear canvas and paint layered scene

Paint order:

1. Atmospheric gradient clear
2. Danger line
3. Grid bubbles
4. Falling bubbles
5. Aim trajectory
6. Shooter guide + current bubble
7. Next-bubble preview
8. Flying projectile
9. Particles
10. Combo floating text

## Device Pixel Ratio

```js
dpr = min(devicePixelRatio, 2)
canvas.width = cssWidth * dpr
canvas.height = cssHeight * dpr
ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
```

Drawing uses CSS pixels while the backing store stays sharp on retina displays
without the cost of uncapped DPR.

## Glossy Bubbles

Each bubble is a layered canvas composition:

* Soft elliptical contact shadow
* Radial gradient body (`glow → fill → deep`)
* Thin bright rim stroke
* Primary specular ellipse
* Secondary glint

Pop animations increase scale and fade alpha; fall animations apply gravity and
fade as bubbles leave the stage.

## Trajectory Preview

While the player can shoot, `CollisionEngine.predictTrajectory` walks short
segments with the same wall-bounce rules as live flight. The renderer draws a
dashed path and an end marker. Prediction is suppressed during flight and
overlays.

## Particles

`ParticleSystem` uses plain object pools (arrays) — no DOM nodes. Bursts emit on
pops; sparkles accent combos; win celebrations fire multiple bursts.

## Performance Notes

* Avoid per-frame canvas style writes
* Cap simulation `dt` to avoid spiral-of-death after tab backgrounding
* Prefer mutating bubble fields over reallocating entities
* Particle arrays splice dead entries in reverse to limit churn
* No texture atlases required — procedural drawing keeps the package dependency-free

## Accessibility of the Canvas

The canvas exposes an `aria-label` describing controls. Score changes and status
text live in the DOM with `aria-live="polite"` so assistive tech receives updates
without scraping pixels.
