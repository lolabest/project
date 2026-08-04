# GitHub Community Setup

Recommendations for operating this repository like a mature open-source project.

## Discussions

Enable **GitHub Discussions** on the repository and create these categories:

| Category | Purpose |
| -------- | ------- |
| Announcements | Release notes and project direction (maintainers only) |
| Ideas | Feature proposals and UX experiments |
| Q&A | Player and contributor questions |
| Show and tell | Forks, themes, streams, teaching materials |
| General | Everything else on-topic |

Point newcomers at Discussions before opening non-bug issues.

## Labels

Create the following labels (names + suggested colors):

| Label | Color | Use |
| ----- | ----- | --- |
| `bug` | `#d73a4a` | Confirmed defective behavior |
| `enhancement` | `#a2eeef` | New features / improvements |
| `documentation` | `#0075ca` | Docs-only changes |
| `good first issue` | `#7057ff` | Onboarding-sized tasks |
| `help wanted` | `#008672` | Maintainers want outside help |
| `accessibility` | `#0e8a16` | A11y defects or upgrades |
| `performance` | `#fbca04` | Frame time / allocation work |
| `gameplay` | `#1d76db` | Rules / feel / balance |
| `ci` | `#e4e669` | Workflows and validation |
| `priority: high` | `#b60205` | Blocks play or releases |
| `priority: low` | `#cfd3d7` | Nice-to-have |
| `duplicate` | `#cfd3d7` | Already tracked |
| `wontfix` | `#ffffff` | Declined after consideration |
| `needs reproduction` | `#d93f0b` | Waiting on reporter details |

## Issue Forms

This repo ships YAML issue forms under `.github/ISSUE_TEMPLATE/`. Keep them
aligned with real fields maintainers need (browser, OS, steps).

## Branch Protection (recommended)

On `main`:

* Require pull request reviews (1+)
* Require status checks: `Validate`
* Disallow force pushes
* Require linear history (optional)

## Security

Follow [SECURITY.md](../SECURITY.md). Never request secrets in issues.

## Code Owners (optional)

Add a `CODEOWNERS` file when multiple maintainers join, for example:

```
*       @lolabest
/docs/  @lolabest
/.github/ @lolabest
```
