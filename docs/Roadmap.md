# Roadmap

Bubble Shooter is intentionally complete at v1.0.0. Future work focuses on depth,
polish, and community tooling — not rewrites.

## Versioning Strategy

Semantic Versioning (`MAJOR.MINOR.PATCH`):

* **MAJOR** — incompatible rule changes or public API breaks for embedders
* **MINOR** — new backward-compatible features (modes, power-ups, QoL)
* **PATCH** — bug fixes, docs, CI, and non-breaking polish

Release checklist lives in [Contributing-Guide.md](./Contributing-Guide.md).

## Near Term (1.x)

* [ ] Level seeds / daily challenge hash
* [ ] Optional precision aim laser toggle in settings
* [ ] Pause menu with continue
* [ ] Additional synthesized music stinger bed (still no binary assets)
* [ ] Headless board/collision unit tests under `tools/tests/`

## Medium Term

* [ ] Power-ups: bomb, color-wipe, row-clear
* [ ] Endless mode with descending ceiling pressure
* [ ] Replay ghost for a single cleared board
* [ ] Theme packs via CSS variables + color palettes
* [ ] PWA manifest for installable offline play

## Long Term / Community

* [ ] Localized UI strings
* [ ] Editor for handcrafted puzzles
* [ ] Optional multiplayer hot-seat turn passing
* [ ] Embeddable widget API documentation

## Non-Goals

* Rewriting in a framework
* Introducing npm/bundler requirements for basic play
* Server-side accounts or monetization walls

Suggestions welcome via GitHub Discussions (`ideas` category).
