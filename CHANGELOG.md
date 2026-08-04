# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-08-04

### Added

* In-game skins: Original, Halloween, New Year, and St. Patrick’s Day
* Skins picker dialog plus `T` to cycle themes; selection persists in localStorage

## [1.1.0] - 2026-08-04

### Changed

* Bubble Witch / candy-saga visual redesign: enchanted sky, wooden-gold frame, plaque HUD
* Juicier candy-gloss bubbles, dotted aim trail, and brighter bubble palette
* Playful pink/gold UI chrome while keeping the large responsive playfield

## [1.0.1] - 2026-08-04

### Changed

* Viewport-first layout: playfield targets ~75–85% of screen height
* Board expanded to 10×14 with fluid bubble scaling from available space
* Compact HUD and overlay controls to maximize the playable area
* Layout math fits the hex grid using both width and height constraints

## [1.0.0] - 2026-08-04

### Added

* Complete Bubble Shooter gameplay on a hexagonal board
* Six bubble colors with glossy canvas rendering
* Accurate collision detection with wall bouncing and hex snapping
* Match-3+ clearing and floating-cluster gravity
* Score system with combo multipliers and persistent high score
* Win and lose overlays with restart flow
* Next-bubble preview and aim trajectory
* Particle effects and combo celebration animations
* Synthesized sound effects via the Web Audio API
* Keyboard, mouse, and touch controls
* Responsive glassmorphism UI with accessibility labels
* Architecture documentation under `docs/`
* GitHub Actions for lint validation and GitHub Pages deployment
* Issue templates, pull request template, and contributing guidelines

[1.2.0]: https://github.com/lolabest/project/releases/tag/v1.2.0
[1.1.0]: https://github.com/lolabest/project/releases/tag/v1.1.0
[1.0.1]: https://github.com/lolabest/project/releases/tag/v1.0.1
[1.0.0]: https://github.com/lolabest/project/releases/tag/v1.0.0
