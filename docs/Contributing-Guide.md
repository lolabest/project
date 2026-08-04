# Contributing Guide (Extended)

This document expands on [CONTRIBUTING.md](../CONTRIBUTING.md) with
architecture-aware guidance for code changes.

## Before You Code

1. Read [Architecture.md](./Architecture.md) and [Game-Mechanics.md](./Game-Mechanics.md)
2. Search existing issues / discussions for duplicates
3. Open an issue for large changes so scope can be agreed early

## Local Workflow

```bash
git clone https://github.com/lolabest/project.git
cd project
# Option A — double-click / open index.html
# Option B — static server (helpful for some browsers)
python3 -m http.server 8080
```

No `npm install`. No build step.

## Making a Change

* Keep modules focused — prefer a new file over growing `game.js`
* Update constants instead of hard-coding magic numbers
* If you change rules, update `docs/Game-Mechanics.md` and `CHANGELOG.md`
* Match existing style (2-space indent, semicolons, `'use strict'` IIFEs)

### Suggested Branch Names

```
feat/power-up-bomb
fix/odd-row-snap
docs/collision-diagram
chore/pages-workflow
```

## Validation

Run the repo validator before opening a PR:

```bash
bash tools/validate.sh
```

Then complete the [manual testing checklist](./Testing.md).

## Pull Request Expectations

* Describe player-visible behavior changes
* Include screenshots or a short clip for UI work
* Link the related issue
* Keep CI green (validation workflow)

## Review Philosophy

Reviewers look for:

* Correct hex/collision math
* No regressions in win/lose/restart
* Accessibility retained (keyboard, labels, focus)
* Performance red flags (DOM thrash, unbounded allocations)

## Release Process

1. Merge features to `main`
2. Bump version in `js/constants.js`, `CHANGELOG.md`, and footer
3. Tag `vMAJOR.MINOR.PATCH`
4. GitHub Pages deploys from `main`
