#!/usr/bin/env bash
# Prints a single hash representing the current content of every src/ and
# tests/ source file. Used by mark-reviewed.sh (record) and
# require-review.sh (compare) to detect edits since the last review.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

find src tests -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null \
  | LC_ALL=C sort \
  | xargs shasum -a 256 2>/dev/null \
  | shasum -a 256 \
  | awk '{print $1}'
