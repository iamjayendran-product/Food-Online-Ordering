#!/usr/bin/env bash
# Records the current src/tests fingerprint as reviewed. The feature-reviewer
# agent runs this only after a review comes back clean (PASS, no changes) —
# never after a review that made fixes, since a fresh review must follow.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

FINGERPRINT="$("$DIR/review-fingerprint.sh")"
mkdir -p .claude
printf '{"fingerprint":"%s","reviewedAt":"%s"}\n' \
  "$FINGERPRINT" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > .claude/review-state.json

echo "Marked reviewed at fingerprint $FINGERPRINT"
