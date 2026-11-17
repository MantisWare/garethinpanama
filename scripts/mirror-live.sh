#!/usr/bin/env bash
# Read-only FTPS mirror of the live garethinpanama.com web root (public_html)
# into a local folder. Never uploads, deletes, or changes anything on the server.
#
# Usage (from a repo checkout or the handover package):
#   AGE_KEYFILE=/path/to/key CREDENTIALS_AGE=/path/to/credentials.age \
#     ./scripts/mirror-live.sh [dest-dir]
#
# dest-dir defaults to $LIVE_MIRROR, else a fresh dated folder
# $HOME/.gip-work/live-mirror-YYYYMMDD-HHMMSS (outside the repo, so it never
# overwrites your working copy). Use an empty folder so files deleted on the
# server do not linger locally. Then run ./scripts/check-drift.sh <dest-dir>.

set -euo pipefail
set +x
# shellcheck source=_ftps_common.sh
source "$(cd "$(dirname "$0")" && pwd)/_ftps_common.sh"

DEST="${1:-${LIVE_MIRROR:-$HOME/.gip-work/live-mirror-$(date +%Y%m%d-%H%M%S)}}"
if [[ -d "$DEST" && -n "$(ls -A "$DEST" 2>/dev/null)" ]]; then
  echo "Note: $DEST is not empty. Files removed on the server will not be removed here." >&2
fi
mkdir -p "$DEST"
DEST="$(cd "$DEST" && pwd)"

load_ftps_creds
trap clear_ftps_creds EXIT

echo "Connecting over FTPS (explicit TLS, never plain FTP) to ${FTP_USER}@${FTP_HOST}:${FTP_PORT} (password not printed)."
REMOTE="$(resolve_remote_path)"
echo "Remote web root: ${REMOTE}"
echo "Only public_html is mirrored; the cPanel home is never downloaded."
echo "Local destination: ${DEST}"

# Download-only mirror (no --reverse, no --delete, no rm/put). TLS is forced in the prelude.
# shellcheck disable=SC2046
run_lftp "
cd \"${REMOTE}\";
cls -l;
mirror --verbose --continue --no-perms --no-umask $(lftp_exclude_flags) . \"${DEST}\";
"

echo "Read-only mirror finished. No server files were changed."
printf 'Files: '
find "$DEST" -type f ! -name .DS_Store | wc -l
echo "Next: ./scripts/check-drift.sh \"$DEST\""
echo "$DEST"
