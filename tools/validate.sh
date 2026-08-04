#!/usr/bin/env bash
# Static validation for the Bubble Shooter repository.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

errors=0

say() { printf '%s\n' "$*"; }
fail() { say "ERROR: $*"; errors=$((errors + 1)); }
ok() { say "OK: $*"; }

say "==> Bubble Shooter validator"
say "Root: $ROOT"

required_files=(
  README.md
  LICENSE
  CONTRIBUTING.md
  CHANGELOG.md
  SECURITY.md
  CODE_OF_CONDUCT.md
  .gitignore
  index.html
  style.css
  script.js
  docs/Architecture.md
  docs/Game-Mechanics.md
  docs/Rendering.md
  docs/Collision-Detection.md
  docs/Contributing-Guide.md
  docs/Testing.md
  docs/Roadmap.md
  docs/GitHub-Community.md
  .github/workflows/validate.yml
  .github/workflows/deploy-pages.yml
  .github/PULL_REQUEST_TEMPLATE.md
  .github/ISSUE_TEMPLATE/bug_report.yml
  .github/ISSUE_TEMPLATE/feature_request.yml
  .github/ISSUE_TEMPLATE/config.yml
  assets/icons/favicon.svg
  assets/icons/logo.svg
  assets/icons/santa-sleigh.svg
  screenshots/title.png
  screenshots/gameplay.png
  tools/test-mechanics.js
  js/constants.js
  js/themes.js
  js/snow-field.js
  js/theme-manager.js
  js/utils.js
  js/bubble.js
  js/board.js
  js/collision-engine.js
  js/shooter.js
  js/storage-manager.js
  js/score-manager.js
  js/animation-manager.js
  js/particle-system.js
  js/renderer.js
  js/sound-manager.js
  js/input-manager.js
  js/ui-manager.js
  js/game.js
)

for f in "${required_files[@]}"; do
  if [[ -f "$f" ]]; then
    ok "exists $f"
  else
    fail "missing $f"
  fi
done

# Ensure index.html references every js module that exists and vice-versa.
mapfile -t html_scripts < <(grep -oE 'src="js/[^"]+\.js"' index.html | sed 's/src="//;s/"$//' | sort)
mapfile -t disk_scripts < <(find js -maxdepth 1 -type f -name '*.js' | sort)

for s in "${disk_scripts[@]}"; do
  if grep -q "src=\"$s\"" index.html; then
    ok "index loads $s"
  else
    fail "index.html does not load $s"
  fi
done

if grep -q 'src="script.js"' index.html; then
  ok "index loads script.js"
else
  fail "index.html does not load script.js"
fi

# Accessibility / structure smoke checks
grep -q 'id="game-canvas"' index.html || fail "missing #game-canvas"
grep -q 'aria-label' index.html || fail "missing aria-label usage"
grep -q 'role="dialog"' index.html || fail "missing overlay dialog role"
grep -q 'skip-link' index.html || fail "missing skip link"

# Ban placeholder debt in shipped runtime sources (docs may mention the policy).
if grep -RIn --exclude-dir=.git -E 'TODO|FIXME|placeholder content|\bTBD\b' \
  js style.css script.js index.html >/tmp/bs-todo-hits.txt 2>/dev/null; then
  fail "found TODO/FIXME/placeholder markers:"
  cat /tmp/bs-todo-hits.txt || true
else
  ok "no TODO/FIXME markers in shipped sources"
fi

# Syntax check JavaScript when Node is available
if command -v node >/dev/null 2>&1; then
  while IFS= read -r -d '' file; do
    if node --check "$file"; then
      ok "syntax $file"
    else
      fail "syntax error in $file"
    fi
  done < <(find js -name '*.js' -print0; printf '%s\0' script.js)
else
  say "WARN: node not found; skipped JS syntax checks"
fi

# Basic CSS sanity — the earlier typo class of bugs
if grep -E '#[0-9a-fA-F]{3,8}[[:space:]]+[a-zA-Z]' style.css; then
  fail "possible broken CSS color token in style.css"
else
  ok "css color tokens look sane"
fi

say ""
if [[ "$errors" -gt 0 ]]; then
  say "FAILED with $errors error(s)"
  exit 1
fi

say "All validation checks passed."
