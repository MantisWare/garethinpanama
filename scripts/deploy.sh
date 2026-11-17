#!/usr/bin/env bash
# Upload to the live web root (public_html) over FTPS (explicit TLS only).
# DRY RUN by default. Pass --yes to actually upload.
# Never deletes anything on the server (no --delete, no rm).
# Never uploads credentials, keys, git metadata, logs, or repo-only files
# (scripts/, docs/HANDOVER.md, README.md, .gitignore, .gitleaksignore).
#
# Production deploys need Waldo's approval before you pass --yes.
#
# Usage:
#   export AGE_KEYFILE=/path/to/key CREDENTIALS_AGE=/path/to/credentials.age
#   ./scripts/deploy.sh [--yes] --file index.html --file main.js   # only these files (preferred)
#   ./scripts/deploy.sh [--yes] [local-dir]                        # whole tree, mirror --reverse
#
# local-dir defaults to $DEPLOY_SRC, else the repo checkout that contains this
# script. Paths given with --file are relative to that directory.
# With --yes from a git checkout, the working tree must be clean (commit and
# push first) unless ALLOW_DIRTY=1.

set -euo pipefail
set +x
# shellcheck source=_ftps_common.sh
source "$(cd "$(dirname "$0")" && pwd)/_ftps_common.sh"

DO_IT=0
LOCAL=""
FILES=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --yes) DO_IT=1 ;;
    --dry-run) DO_IT=0 ;;
    --file)
      [[ $# -ge 2 ]] || { echo "--file needs a path" >&2; exit 2; }
      FILES+=("$2"); shift ;;
    -*)
      echo "Unknown option: $1 (supported: --yes, --dry-run, --file PATH)" >&2
      exit 2
      ;;
    *)
      if [[ -n "$LOCAL" ]]; then
        echo "Unexpected extra argument: $1" >&2
        exit 2
      fi
      LOCAL="$1"
      ;;
  esac
  shift
done

if [[ -z "$LOCAL" ]]; then
  if [[ -n "${DEPLOY_SRC:-}" ]]; then
    LOCAL="$DEPLOY_SRC"
  elif _is_repo_checkout; then
    LOCAL="$(_handover_root)"
  else
    echo "Not running from a git checkout of the site. Pass the local site directory (e.g. your clone of MantisWare/garethinpanama)." >&2
    exit 2
  fi
fi
if [[ ! -d "$LOCAL" ]]; then
  echo "Local source directory not found: $LOCAL" >&2
  exit 2
fi
LOCAL="$(cd "$LOCAL" && pwd)"

if [[ -f "$LOCAL/HANDOVER.md" && -f "$LOCAL/credentials.age" ]]; then
  echo "Refusing: $LOCAL looks like the handover package, not the site. Deploy from the repo checkout." >&2
  exit 2
fi

# Validate --file paths before touching the network.
is_blocked_path() {
  case "$1" in
    scripts/*|docs/HANDOVER.md|README.md|.gitignore|.gitleaksignore|.git/*|.github/*|*.age|*.agekey|*.pem|*.key|.netrc|.env|credentials.*|*.log|error_log*|.well-known/*|cgi-bin/*) return 0 ;;
  esac
  return 1
}
for f in "${FILES[@]+"${FILES[@]}"}"; do
  f="${f#./}"
  if [[ "$f" == /* || "$f" == *..* ]]; then
    echo "--file must be a relative path inside $LOCAL: $f" >&2; exit 2
  fi
  if is_blocked_path "$f"; then
    echo "Refusing to upload repo-only or secret file: $f" >&2; exit 2
  fi
  if [[ ! -f "$LOCAL/$f" ]]; then
    echo "File not found: $LOCAL/$f" >&2; exit 2
  fi
done

if [[ "$DO_IT" -eq 1 && -d "$LOCAL/.git" && "${ALLOW_DIRTY:-0}" != "1" ]]; then
  if [[ -n "$(git -C "$LOCAL" status --porcelain)" ]]; then
    echo "Refusing --yes: the git working tree has uncommitted changes. Commit and push first (or ALLOW_DIRTY=1 for an approved rollback)." >&2
    exit 2
  fi
fi

MODE="DRY RUN (no files will be written on the server)"
if [[ "$DO_IT" -eq 1 ]]; then
  MODE="LIVE UPLOAD"
fi
echo "Mode: ${MODE}"
echo "Local source: ${LOCAL}"
if [[ -d "$LOCAL/.git" ]]; then
  echo "Git revision: $(git -C "$LOCAL" rev-parse --short HEAD 2>/dev/null || echo unknown)"
fi
echo "Note: --delete is intentionally NOT used."

if [[ ${#FILES[@]} -gt 0 && "$DO_IT" -eq 0 ]]; then
  echo "Would upload to public_html (no server connection made in this dry run):"
  for f in "${FILES[@]}"; do
    f="${f#./}"
    printf '  %s (%s bytes)\n' "$f" "$(wc -c < "$LOCAL/$f" | tr -d ' ')"
  done
  echo "Dry run complete. Re-run with --yes only after Waldo approves this production deploy."
  exit 0
fi

load_ftps_creds
trap clear_ftps_creds EXIT

echo "Connecting over FTPS (explicit TLS, never plain FTP) to ${FTP_USER}@${FTP_HOST}:${FTP_PORT} (password not printed)."
REMOTE="$(resolve_remote_path)"
echo "Remote web root: ${REMOTE}"
if [[ "$DO_IT" -eq 1 ]]; then
  echo "WARNING: This will write files to production (${FTP_HOST}:${REMOTE})." >&2
  echo "Waldo's approval is required for production deploys." >&2
fi

if [[ ${#FILES[@]} -gt 0 ]]; then
  cmds=""
  for f in "${FILES[@]}"; do
    f="${f#./}"
    d="$(dirname "$f")"
    if [[ "$d" != "." ]]; then
      cmds+="mkdir -p -f \"${d}\";
"
    fi
    cmds+="put -O \"${d}\" \"${LOCAL}/${f}\";
"
  done
  run_lftp "
cd \"${REMOTE}\";
${cmds}"
  echo "Upload finished. Run the post-deploy checks in HANDOVER.md before considering this done."
  exit 0
fi

# Whole-tree mode: mirror --reverse uploads local -> remote; dry run unless --yes.
# After a fresh git clone every file has a new mtime, so lftp will re-upload the
# whole tree (~70 MB incl. OLD/ and videos). Prefer --file for small changes.
DRY_FLAG="--dry-run"
[[ "$DO_IT" -eq 1 ]] && DRY_FLAG=""

# shellcheck disable=SC2046
run_lftp "
cd \"${REMOTE}\";
mirror --reverse --verbose --continue --no-perms --no-umask ${DRY_FLAG} $(lftp_exclude_flags) \"${LOCAL}\" .;
"

if [[ "$DO_IT" -eq 0 ]]; then
  echo "Dry run complete. Re-run with --yes only after Waldo approves a production deploy."
else
  echo "Upload finished. Run the post-deploy checks in HANDOVER.md before considering this done."
fi
