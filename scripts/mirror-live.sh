#!/usr/bin/env bash
# Read-only FTPS mirror of the live garethinpanama.com web root into a local folder.
# Never uploads, deletes, or changes anything on the server.
#
# Usage:
#   AGE_KEYFILE=/path/to/key ./scripts/mirror-live.sh [dest-dir]
#
# Defaults dest-dir to ./live-mirror next to the handover package root,
# or $LIVE_MIRROR if set.

set -euo pipefail
set +x
# shellcheck source=_ftps_common.sh
source "$(cd "$(dirname "$0")" && pwd)/_ftps_common.sh"

DEST="${1:-${LIVE_MIRROR:-$(_handover_root)/live-mirror}}"
mkdir -p "$DEST"
DEST="$(cd "$DEST" && pwd)"

load_ftps_creds
trap clear_ftps_creds EXIT

echo "Connecting over FTPS (explicit TLS, never plain FTP) to ${FTP_USER}@${FTP_HOST}:${FTP_PORT} (password not printed)."
REMOTE="$(resolve_remote_path)"
echo "Remote web root: ${REMOTE}"
echo "Only public_html is mirrored; the cPanel home is never downloaded."
echo "Local destination: ${DEST}"

# Exact mirror, TLS already forced in the prelude:
#   set ftp:ssl-force true
#   set ftp:ssl-protect-data true
#   mirror --verbose --continue --only-missing?  NO — we want a full refresh of existing files too.
# shellcheck disable=SC2046
run_lftp "
cd ${REMOTE};
cls -l;
mirror --verbose --continue --no-perms --no-umask $(lftp_exclude_flags) . ${DEST};
"

echo "Read-only mirror finished. No server files were changed."
echo "Files:" 
find "$DEST" -type f ! -name .DS_Store | wc -l
