#!/usr/bin/env bash
# Offline: compare a fresh live mirror (from mirror-live.sh) with the repo
# working tree. No network, no credentials. Exit 0 = no drift, 1 = drift.
#
# Usage:
#   ./scripts/check-drift.sh <live-mirror-dir> [repo-dir]
#
# repo-dir defaults to the checkout that contains this script.
# Repo-only files (scripts/, docs/HANDOVER.md, README.md, .gitignore,
# .gitleaksignore, .git) are ignored. docs/PHOTO-2026-09-03-16-40-30.jpg is
# reported as "expected" until it has been deployed.

set -euo pipefail

MIRROR="${1:-}"
REPO="${2:-$(cd "$(dirname "$0")/.." && pwd)}"
if [[ -z "$MIRROR" || ! -d "$MIRROR" ]]; then
  echo "Usage: $0 <live-mirror-dir> [repo-dir]" >&2
  exit 2
fi
if [[ ! -d "$REPO" ]]; then
  echo "Repo directory not found: $REPO" >&2
  exit 2
fi
MIRROR="$(cd "$MIRROR" && pwd)"
REPO="$(cd "$REPO" && pwd)"

EXPECTED_REPO_ONLY="docs/PHOTO-2026-09-03-16-40-30.jpg"

out="$(diff -rq \
  --exclude .git --exclude .DS_Store --exclude scripts --exclude README.md \
  --exclude HANDOVER.md --exclude .gitignore --exclude .gitleaksignore \
  --exclude .github --exclude 'live-mirror*' \
  "$REPO" "$MIRROR" || true)"

drift=0
while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  if [[ "$line" == "Only in ${REPO}/docs: ${EXPECTED_REPO_ONLY#docs/}" ]]; then
    echo "expected: ${EXPECTED_REPO_ONLY} is in the repo but not yet on live"
    continue
  fi
  echo "DRIFT: $line"
  drift=1
done <<< "$out"

if [[ "$drift" -eq 0 ]]; then
  echo "No drift: live public_html matches the repo working tree (repo-only files ignored)."
else
  echo "Live and repo differ. If the server changed, copy the live files into the repo, commit them, and tell Waldo before you deploy anything." >&2
fi
exit "$drift"
