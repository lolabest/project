# Contributing to Bubble Shooter

Thank you for investing time in improving this project. This guide helps you
contribute effectively and keeps the codebase consistent.

## Code of Conduct

By participating, you agree to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).

## Ways to Contribute

* Report bugs with clear reproduction steps
* Suggest features or UX improvements
* Improve documentation
* Fix issues or implement roadmap items
* Add manual test cases or validation scripts

## Development Setup

This project has **zero build steps** and **no npm dependencies**.

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/<your-username>/project.git
   cd project
   ```
3. Create a branch:
   ```bash
   git checkout -b feat/short-description
   ```
4. Open `index.html` in a modern browser, or serve locally:
   ```bash
   python3 -m http.server 8080
   ```
5. Navigate to `http://localhost:8080`

## Project Layout

| Path | Purpose |
| ---- | ------- |
| `index.html` | Application shell |
| `style.css` | Visual design system |
| `script.js` | Bootstrap / entry point |
| `js/` | Focused game modules |
| `docs/` | Architecture and design docs |
| `.github/` | CI, templates, community config |

## Coding Standards

* Use vanilla JavaScript (ES2023). No frameworks, bundlers, or npm packages.
* Keep modules small and single-responsibility.
* Prefer meaningful names over comments. Comment non-obvious game math only.
* Avoid mutating shared state outside a module’s public API.
* Do not introduce `console.log` noise in production paths.
* Preserve accessibility: keyboard paths, ARIA labels, and contrast.

### Style Conventions

* Classes use `PascalCase`
* Methods and variables use `camelCase`
* Constants use `UPPER_SNAKE_CASE`
* Files use `kebab-case.js`
* Two-space indentation
* Semicolons required
* Prefer `const` / `let`; never `var`

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add trajectory prediction for wall bounces
fix: correct floating cluster detection on odd rows
docs: expand collision detection guide
chore: update lint workflow node version
```

## Pull Requests

1. Ensure the game runs by opening `index.html`
2. Walk through the [manual testing checklist](docs/Testing.md)
3. Update docs / changelog when behavior changes
4. Open a PR using the template
5. Keep PRs focused — one concern per PR when possible

## Versioning

We use [Semantic Versioning](https://semver.org/):

* **MAJOR** — incompatible gameplay or API changes
* **MINOR** — backward-compatible features
* **PATCH** — backward-compatible bug fixes

## Questions

Open a GitHub Discussion (recommended) or an issue tagged `question`.

Welcome aboard — we appreciate every contribution.
