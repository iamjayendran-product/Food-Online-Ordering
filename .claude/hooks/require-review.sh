#!/usr/bin/env bash
# Stop hook: blocks the session from stopping if src/ or tests/ have changed
# since the last recorded PASS from the feature-reviewer (mark-reviewed.sh).
# Registered in .claude/settings.json under hooks.Stop.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

CURRENT="$("$DIR/review-fingerprint.sh")"
STATE_FILE=".claude/review-state.json"

RECORDED=""
if [ -f "$STATE_FILE" ]; then
  RECORDED="$(grep -o '"fingerprint":"[^"]*"' "$STATE_FILE" | sed 's/.*:"//;s/"$//' || true)"
fi

if [ "$CURRENT" != "$RECORDED" ]; then
  printf '{"decision":"block","reason":"src/ or tests/ changed since the last passing review (or none has run yet). Run /review-feature <F-number> before stopping."}\n'
  exit 0
fi

exit 0
