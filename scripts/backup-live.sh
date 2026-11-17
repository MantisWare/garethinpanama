#!/usr/bin/env bash
# Dated read-only FTPS snapshot of the live web root, for pre-deploy backup and rollback.
# Never uploads, deletes, or changes anything on the server.
#
# Usage:
#   AGE_KEYFILE=/path/to/key CREDENTIALS_AGE=/path/to/credentials.age \
#     ./scripts/backup-live.sh [backup-parent-dir]
#
# backup-parent-dir defaults to $BACKUP_ROOT, else $HOME/backups/garethinpanama
# (outside the repo). Each run creates live-YYYYMMDD-HHMMSS inside it.

set -euo pipefail
set +x
# shellcheck source=_ftps_common.sh
source "$(cd "$(dirname "$0")" && pwd)/_ftps_common.sh"

PARENT="${1:-${BACKUP_ROOT:-$HOME/backups/garethinpanama}}"
STAMP="$(date +%Y%m%d-%H%M%S)"
DEST="${PARENT}/live-${STAMP}"
mkdir -p "$DEST"
DEST="$(cd "$DEST" && pwd)"

load_ftps_creds
trap clear_ftps_creds EXIT

echo "Connecting over FTPS (explicit TLS, never plain FTP) to ${FTP_USER}@${FTP_HOST}:${FTP_PORT} (password not printed)."
REMOTE="$(resolve_remote_path)"
echo "Remote web root: ${REMOTE}"
echo "Backup destination: ${DEST}"

# shellcheck disable=SC2046
run_lftp "
cd \"${REMOTE}\";
mirror --verbose --continue --no-perms --no-umask $(lftp_exclude_flags) . \"${DEST}\";
"

echo "Backup finished (read-only). Keep this folder until the deploy has been verified."
echo "$DEST"
