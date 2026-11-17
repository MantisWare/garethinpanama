#!/usr/bin/env bash
# Shared FTPS helpers for Gareth in Panama handover scripts.
# Do not enable `set -x` in this file or in callers — it would leak the password.

set -euo pipefail
set +x

# Verified 16 Nov 2026: the FTP account can see the cPanel home, but the
# website lives in public_html (www is a symlink to it). Never mirror /.
: "${REMOTE_PATH:=public_html}"

# Optional. If set, lftp connects to this IP instead of FTP_HOST (use when
# local DNS does not reach the origin, e.g. an HTTP proxy intercepts the name).
: "${FTP_CONNECT_IP:=}"

_handover_root() {
  local here
  here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  cd "$here/.." && pwd
}

_LFTP_TMP=""

_cleanup_lftp_tmp() {
  if [[ -n "${_LFTP_TMP:-}" && -d "$_LFTP_TMP" ]]; then
    rm -rf "$_LFTP_TMP"
  fi
  _LFTP_TMP=""
}

clear_ftps_creds() {
  unset LFTP_PASSWORD FTP_HOST FTP_PORT FTP_USER FTP_PROTOCOL
  _cleanup_lftp_tmp
}

load_ftps_creds() {
  local keyfile="${AGE_KEYFILE:-}"
  local agefile="${CREDENTIALS_AGE:-}"
  if [[ -z "$keyfile" ]]; then
    echo "Set AGE_KEYFILE to the path of the age private key (delivered separately, never stored in this package or the git repo)." >&2
    exit 2
  fi
  if [[ ! -f "$keyfile" ]]; then
    echo "AGE_KEYFILE does not exist or is not a file." >&2
    exit 2
  fi
  if [[ -z "$agefile" ]]; then
    agefile="$(_handover_root)/credentials.age"
  fi
  if [[ ! -f "$agefile" ]]; then
    echo "credentials.age not found at $agefile (set CREDENTIALS_AGE)." >&2
    exit 2
  fi
  if ! command -v age >/dev/null 2>&1; then
    echo "age is not on PATH. Install it from https://age-encryption.org and retry." >&2
    exit 2
  fi

  local raw
  if ! raw="$(age -d -i "$keyfile" "$agefile")"; then
    echo "Failed to decrypt credentials.age." >&2
    exit 1
  fi

  FTP_HOST=""
  FTP_PORT="21"
  FTP_PROTOCOL=""
  FTP_USER=""
  local ftp_password=""

  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%$'\r'}"
    [[ -z "$line" || "$line" == \#* ]] && continue
    case "$line" in
      FTP_HOST=*) FTP_HOST="${line#FTP_HOST=}" ;;
      FTP_PORT=*) FTP_PORT="${line#FTP_PORT=}" ;;
      FTP_PROTOCOL=*) FTP_PROTOCOL="${line#FTP_PROTOCOL=}" ;;
      FTP_USER=*) FTP_USER="${line#FTP_USER=}" ;;
      FTP_PASSWORD=*) ftp_password="${line#FTP_PASSWORD=}" ;;
    esac
  done <<< "$raw"
  unset raw

  FTP_HOST="${FTP_HOST//$'\r'/}"
  FTP_PORT="${FTP_PORT//$'\r'/}"
  FTP_USER="${FTP_USER//$'\r'/}"
  ftp_password="${ftp_password//$'\r'/}"
  # unwrap a single matching pair of quotes if present
  if [[ ${#ftp_password} -ge 2 && ( ${ftp_password:0:1} == '"' || ${ftp_password:0:1} == "'" ) && ${ftp_password:0:1} == "${ftp_password: -1}" ]]; then
    ftp_password="${ftp_password:1:${#ftp_password}-2}"
  fi

  if [[ -z "$FTP_HOST" || -z "$FTP_USER" || -z "$ftp_password" ]]; then
    echo "Decrypted credentials.age is missing FTP_HOST, FTP_USER or FTP_PASSWORD." >&2
    exit 1
  fi
  : "${FTP_PORT:=21}"

  export FTP_HOST FTP_PORT FTP_USER
  export LFTP_PASSWORD="$ftp_password"
  unset ftp_password

  # Isolated lftp home + netrc so the password is not placed on `ps` argv
  # and is not written to the real ~/.netrc or lftp bookmarks.
  _cleanup_lftp_tmp
  _LFTP_TMP="$(mktemp -d "${TMPDIR:-/tmp}/gip-lftp.XXXXXX")"
  chmod 700 "$_LFTP_TMP"
  local netrc="$_LFTP_TMP/.netrc"
  local target="${FTP_CONNECT_IP:-$FTP_HOST}"
  umask 077
  cat > "$netrc" <<NETRC
machine $target
login $FTP_USER
password $LFTP_PASSWORD
machine $FTP_HOST
login $FTP_USER
password $LFTP_PASSWORD
NETRC
  chmod 600 "$netrc"
  export HOME="$_LFTP_TMP"
  export LFTP_HOME="$_LFTP_TMP"
}

require_lftp() {
  if ! command -v lftp >/dev/null 2>&1; then
    echo "lftp is not on PATH. Install it (macOS: brew install lftp) and retry." >&2
    exit 2
  fi
}

lftp_exclude_flags() {
  echo "\
--exclude-glob .DS_Store \
--exclude-glob ._* \
--exclude-glob .ftpquota \
--exclude-glob error_log \
--exclude-glob error_log.* \
--exclude-glob *.log \
--exclude-glob .git/ \
--exclude-glob credentials.age \
--exclude-glob *.age \
--exclude-glob *.agekey \
--exclude-glob .well-known/ \
--exclude-glob cgi-bin/ \
--exclude-glob scripts/ \
--exclude-glob docs/HANDOVER.md \
--exclude-glob README.md \
--exclude-glob .gitignore \
--exclude-glob .gitleaksignore"
}

lftp_prelude() {
  local target="${FTP_CONNECT_IP:-$FTP_HOST}"
  cat <<PRE
set ftp:ssl-force true
set ftp:ssl-protect-data true
set ftp:ssl-protect-list true
set ftp:ssl-auth TLS
set ssl:verify-certificate true
set ssl:check-hostname no
set cmd:fail-exit true
set bmk:save-passwords no
set ftp:passive-mode true
set ftp:fix-pasv-address true
open ftp://${target}:${FTP_PORT}
user ${FTP_USER} ${LFTP_PASSWORD}
PRE
}

# Refuse to operate on the cPanel account root. The upload user can see it.
assert_safe_remote_path() {
  local path="${1:-}"
  path="${path#/}"
  path="${path%/}"
  if [[ -z "$path" || "$path" == "." || "$path" == "/" ]]; then
    echo "Refusing to use REMOTE_PATH='$1'." >&2
    echo "This FTP account's home is the cPanel account root (mail, ssl, .cpanel, logs)." >&2
    echo "The website is in public_html. Set REMOTE_PATH=public_html." >&2
    exit 1
  fi
}

run_lftp() {
  require_lftp
  local program
  program="$(lftp_prelude)
$*
bye
"
  lftp -f /dev/stdin <<<"$program"
}

resolve_remote_path() {
  local path="${REMOTE_PATH:-public_html}"
  if [[ "$path" == "auto" ]]; then
    path="public_html"
  fi
  assert_safe_remote_path "$path"
  echo "$path"
}
