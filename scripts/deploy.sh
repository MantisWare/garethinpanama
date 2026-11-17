#!/usr/bin/env bash
# Upload a local tree to the live web root over FTPS (explicit TLS only).
# DRY RUN by default. Pass --yes to actually upload.
# Never uses --delete (live-only files such as videos would be removed).
# Does not deploy credentials, keys, git metadata, or logs.
#
# Production deploys need Waldo's approval before you pass --yes.
#
# Usage:
#   AGE_KEYFILE=/path/to/key ./scripts/deploy.sh [--yes] [local-dir]

set -euo pipefail
set +x
# shellcheck source=_ftps_common.sh
source "$(cd "$(dirname "$0")" && pwd)/_ftps_common.sh"

DO_IT=0
LOCAL=""
for arg in "$@"; do
  case "$arg" in
    --yes) DO_IT=1 ;;
    --dry-run) DO_IT=0 ;;
    -*)
      echo "Unknown option: $arg (supported: --yes, --dry-run)" >&2
      exit 2
      ;;
    *)
      if [[ -n "$LOCAL" ]]; then
        echo "Unexpected extra argument: $arg" >&2
        exit 2
      fi
      LOCAL="$arg"
      ;;
  esac
done

if [[ -z "$LOCAL" ]]; then
  LOCAL="${DEPLOY_SRC:-$(_handover_root)/live-mirror}"
fi
if [[ ! -d "$LOCAL" ]]; then
  echo "Local source directory not found: $LOCAL" >&2
  exit 2
fi
LOCAL="$(cd "$LOCAL" && pwd)"

load_ftps_creds
trap clear_ftps_creds EXIT

echo "Connecting over FTPS (explicit TLS, never plain FTP) to ${FTP_USER}@${FTP_HOST}:${FTP_PORT} (password not printed)."
REMOTE="$(resolve_remote_path)"

# mirror --reverse uploads from local to remote.
# --dry-run is used unless --yes was given.
DRY_FLAG="--dry-run"
MODE="DRY RUN (no files will be written on the server)"
if [[ "$DO_IT" -eq 1 ]]; then
  DRY_FLAG=""
  MODE="LIVE UPLOAD"
  echo "WARNING: This will write files to production (${FTP_HOST}:${REMOTE})." >&2
  echo "Waldo's approval is required for production deploys." >&2
fi

echo "Mode: ${MODE}"
echo "Local source: ${LOCAL}"
echo "Remote web root: ${REMOTE}"
echo "Note: --delete is intentionally NOT used."

# shellcheck disable=SC2046
run_lftp "
cd ${REMOTE};
mirror --reverse --verbose --continue --no-perms --no-umask ${DRY_FLAG} $(lftp_exclude_flags) ${LOCAL} .;
"

if [[ "$DO_IT" -eq 0 ]]; then
  echo "Dry run complete. Re-run with --yes to upload (only after Waldo approves a production deploy)."
else
  echo "Upload finished. Run post-deploy checks in HANDOVER.md before considering this done."
fi
