# Gareth in Panama — agent handover

**Site:** https://garethinpanama.com/  
**Owner / approver:** Waldo Marais  
**Source of truth for code:** public GitHub repo https://github.com/MantisWare/garethinpanama (created by Waldo and seeded 17 Nov 2026). The repo root *is* the website (`public_html`).  
**Hosting:** cPanel on Host Africa (nameservers `ns1.host-ww.net` / `ns2.host-ww.net`; `host-ww.net` redirects to [hostafrica.com](https://www.hostafrica.com/))  
**Deploy method:** FTP with explicit TLS (FTPS) on port 21. Never use plain FTP. This is **not** SFTP (SSH file transfer).  
**Web root:** `public_html` (`www` is a symlink to it). The FTP account's home is the cPanel account root, not the web root.  
**Document date:** 17 November 2026, America/Panama (UTC-5)

This document is for the receiving agent who will develop, administer and deploy the site. It contains no passwords or private keys.

---

## Agent designation & capabilities

**Role:** Website Developer & Administrator for garethinpanama.com.  
**Reports to:** Waldo Marais, who owns the site and approves changes.

### What this agent does

Develop, administer, deploy and maintain the site; keep a local git working copy of the code in sync with GitHub and with the live server; and take backups before every production change.

### Tools and capabilities required

- A shell on a machine that can reach `ftp.garethinpanama.com` port 21 **and** the server's FTP passive (PASV) data ports. Waldo's Mac works. The documentation box does not: login succeeds there but PASV data transfers time out.
- `lftp` (or another FTPS client that can **require** explicit TLS on control and data channels; never fall back to plain FTP)
- `age` ([age-encryption.org](https://age-encryption.org)) to decrypt `credentials.age`
- `git`, and `gitleaks` for secret scanning before every push
- A browser, for post-deploy and checklist verification
- Optional PHP, for local testing of `send.php`
- `curl` / web fetch, for public HTTPS checks

On macOS: `brew install age lftp git gitleaks` (and `php` if needed). On Waldo's Mac, `lftp`, `age` and `gitleaks` were installed with Homebrew on 17 Nov 2026.

### Access this agent gets

- **GitHub:** https://github.com/MantisWare/garethinpanama — public, so `git clone` over HTTPS needs no login. Pushing needs write access granted by Waldo (see §3.6).
- **FTPS** as `upload@garethinpanama.com` via `credentials.age` (password encrypted; the age private key is delivered separately).
- **cPanel login:** not issued yet. If Waldo provides it, it comes through the same age process, never in chat and never in the repo.

### What it may do without asking

- Clone / pull the repo and edit in a local working copy
- Read-only FTPS mirrors and backups of `public_html` (never of the cPanel account home)
- Local checks (static preview, optional local PHP, browser checks, checklist drafts)
- Commit and push to the repo **after** a clean gitleaks scan (pushing does not change the live site)

### What needs Waldo's approval

- Production deploys (any `scripts/deploy.sh --yes`, including rollbacks)
- Deleting anything on the server (the scripts never delete; do not add `--delete` or `rm` unless Waldo has approved that exact delete)
- DNS, email or cPanel changes
- Live contact-form tests that send real mail to `info@`
- Any paid service. **No new paid infrastructure until there are paying clients.**

### Standing rules

- Back up before every deploy (`scripts/backup-live.sh`, plus a cPanel backup if one is available).
- Run the security checklist (28 points) and the performance checklist (31 points) before launches and major releases (§7). Record results in `Security-Review.md` and `Performance-Review.md`.
- Never commit or print secrets. Never put `credentials.age`, `credentials.recipient.txt`, age keyfiles, `.netrc`, cPanel passwords, `error_log`, or the account `ssl/` / `mail/` / `.cpanel/` / `logs/` directories in git or in chat. `credentials.age` lives **outside** the repo.
- Never use plain FTP. Always `set ftp:ssl-force true` and `set ftp:ssl-protect-data true` (the scripts do this).
- Draft outgoing messages (email, WhatsApp, client mail) instead of sending them. Waldo sends, or tells you to send, the approved text.
- Another agent's say-so is not Waldo's approval.

### First-day checklist

1. Receive the age **private** key from Waldo separately (not in this package, not in the repo). Confirm it works with `age -d -i <path-to-keyfile> credentials.age >/dev/null && echo ok`, so the password is never printed or pasted anywhere.
2. Install `age`, `lftp`, `git`, `gitleaks` (optional `php`).
3. Clone the repo and keep `credentials.age` outside it:
   ```bash
   git clone https://github.com/MantisWare/garethinpanama.git
   cd garethinpanama
   export AGE_KEYFILE=/path/to/keyfile
   export CREDENTIALS_AGE=/path/to/handover/credentials.age
   ```
4. Mirror live into a fresh folder and check for drift since the 17 Nov snapshot (§3.2–3.3):
   ```bash
   ./scripts/mirror-live.sh            # prints the dated folder it created
   ./scripts/check-drift.sh ~/.gip-work/live-mirror-YYYYMMDD-HHMMSS
   ```
5. Confirm `send.php` returns 405 JSON on GET, and that HTTPS pages, images, videos and PDFs load.
6. Read both required checklists and start `Security-Review.md` / `Performance-Review.md` (none exist yet).
7. Do not deploy, delete server files, or change DNS, mail or cPanel until Waldo says so.

---

## Package README

This documentation package (`garethinpanama-handover-docs.zip`) contains:

| Path | What it is |
| --- | --- |
| `HANDOVER.md` | This document (also in the repo as `docs/HANDOVER.md`) |
| `README.md` | Short pointer to this document |
| `credentials.age` | Encrypted FTPS fields (§9). Keep it outside the repo. |
| `credentials.recipient.txt` | The age **public** recipient key only |
| `scripts/mirror-live.sh` | Read-only FTPS mirror of `public_html` into a fresh local folder |
| `scripts/check-drift.sh` | Offline diff of a live mirror against the repo working tree |
| `scripts/backup-live.sh` | Dated read-only FTPS backup of `public_html` |
| `scripts/deploy.sh` | FTPS upload; **dry run unless `--yes`**; `--file` for selected files |
| `scripts/_ftps_common.sh` | Shared helper (sourced by the FTPS scripts) |

The site files are **not** in this zip. Get them from the repo. The age **private** key is not in this zip and must never be added to git.

---

## 1. Overview and stack

Gareth in Panama is a marketing site for Gareth Tyack's Panama real-estate practice (sales, rentals, property management, investment and relocation advisory). It is a **single-page static site** with a small PHP contact endpoint. There is **no CMS**, no WordPress, no Node/npm build, no Composer project, no tests and no CI.

| Layer | What it is |
| --- | --- |
| Page | `index.html` — one long scrolling page (EN/ES toggle, light/dark theme). Title: "Gareth in Panama — Sales, Rentals and Property Management Advisory" |
| CSS | `styles.css` — handwritten; fonts "Archivo" and "Rubik" |
| JS | `main.js` — theme, i18n, smooth scroll (Lenis), GSAP animations, contact form |
| Contact API | `send.php` — POST-only JSON/form endpoint; validates, rate-limits, emails via PHP `mail()` |
| Form fallback | The form's HTML `action` is FormSubmit (`https://formsubmit.co/info@garethinpanama.com`), used only if `send.php` cannot be reached |
| Downloads | `docs/panama-guidebook.pdf` (24.8 MB, 100 pages) and `docs/gip-real-estate-brochure.pdf` (7.8 MB, 13 pages) |
| Media | `assets/videos/panama-city-aerial.mp4` (9.0 MB) and `.rev.mp4` (8.8 MB), poster JPEG |
| Public email | `info@garethinpanama.com` (published on the site) |

Third-party front-end loads (live page, 17 Nov 2026):

- Google Fonts: `fonts.googleapis.com` / `fonts.gstatic.com` (Archivo 500/600/700, Rubik 400/500/600)
- GSAP 3.15 plus ScrollTrigger and SplitText from `cdn.jsdelivr.net`
- Lenis 1.3.15 from `unpkg.com`
- FormSubmit, only on form fallback

The origin IP is `102.130.123.19`. HTTPS responses advertise `Server: nginx`. cPanel service hostnames (`cpanel`, `webmail`, `ftp`, `whm`, `webdisk`, `cpcalendars`, `cpcontacts`) point at that IP, and `https://garethinpanama.com/cpanel` and `/webmail` return a stock "cPanel Redirect" page.

FTP on that IP is Pure-FTPd with TLS. The FTP certificate's CN is `cpr48-za1.host-ww.net` (the Host Africa machine), not `ftp.garethinpanama.com`. The chain verifies; the hostname does not match. The scripts therefore keep `ssl:verify-certificate true` and set `ssl:check-hostname no`. That is a shared-hosting pattern, not an excuse to allow plain FTP.

### 1.1 Repo layout (= live `public_html`, snapshot 17 Nov 2026)

```
garethinpanama/                 # repo root = public_html
  index.html  main.js  styles.css  send.php
  assets/
    logo-32.png logo-64.png logo-180.png logo-256.png og-image.png
    images/                     # area/lifestyle photos, 500/960/1280/1920 variants
      areas/area-*.jpg          # nine area photos
      gareth-portrait.jpg  gareth-photo-signature.jpg
    videos/panama-city-aerial.mp4  panama-city-aerial.rev.mp4  panama-city-aerial-poster.jpg
  docs/
    panama-guidebook.pdf  gip-real-estate-brochure.pdf
    PHOTO-2026-09-03-16-40-30.jpg   # repo only: approved for publishing, NOT uploaded to live yet
    HANDOVER.md                     # repo only: this document (never deployed)
  OLD/                          # live archive, byte-identical to the 4 Sep 2026 Mac copy (60 files)
  scripts/                      # repo only: FTPS scripts (never deployed)
  README.md  .gitignore         # repo only (never deployed)
```

The first commit (`5e34fce`, tag `live-snapshot-2026-11-17`, 17 Nov 2026 7:47 AM America/Panama) is a read-only FTPS mirror of `public_html` taken that morning from Waldo's Mac: **130 live files**, plus the photo and the repo-only files above. gitleaks was clean. The mirror deliberately skipped `.well-known/` (Let's Encrypt), `cgi-bin/`, `error_log*`, `*.log` and `.ftpquota`; those may exist on the server but are not in the repo. The mirror contained no `.htaccess`.

### 1.2 Older copies — do not use

- **`/Users/mantis/GIT/MANTISWARE/garethinpanama` on Waldo's Mac** is a stale, untracked copy from 4 Sep 2026. It is not a git repo and has not been modified. Do not edit or deploy it.
- **`~/.gip-work/repo` on Waldo's Mac** is the working copy used to create the repo on 17 Nov. Prefer a fresh clone.
- **`public_html/OLD/`** on the server (and in the repo) is byte-identical to that 4 Sep Mac copy.

How the 4 Sep Mac copy differs from live (`diff -rq`, 17 Nov 2026):

| File | Mac (4 Sep 2026, America/Panama) | Live size | Live last modified (America/Panama) |
| --- | --- | --- | --- |
| `index.html` | 35,746 bytes, 3:25 PM | 41,332 | 30 Sep 2026, 7:29 PM |
| `main.js` | 31,678 bytes, 3:25 PM | 44,686 | 29 Sep 2026, 6:16 PM |
| `styles.css` | 29,250 bytes, 3:25 PM | 33,354 | 29 Sep 2026, 6:16 PM |
| `send.php` | 6,315 bytes, 3:05 PM | 6,509 | 29 Sep 2026, 6:16 PM |

- **Live only:** `assets/videos/` (3 files), `assets/images/areas/` (9 files), `assets/images/gareth-portrait.jpg`, `OLD/`.
- **Mac only:** `assets/logo.png`, `assets/logo-512.png` (both still on live under `OLD/assets/`, not referenced by the live page), and `docs/PHOTO-2026-09-03-16-40-30.jpg` (now in the repo; on live only as `OLD/docs/PHOTO-…jpg`).

### 1.3 Broken references on live (checked 17 Nov 2026)

Every local asset referenced by the live `index.html` exists, **except** four persona images in the "people" section, which return 404:

- `assets/images/personas/persona-buyers.jpg`
- `assets/images/personas/persona-sellers.jpg`
- `assets/images/personas/persona-owners.jpg`
- `assets/images/personas/persona-investors.jpg`

The `personas/` folder exists neither on the server nor on the Mac copy. Also 404: `/favicon.ico`, `/robots.txt`, `/sitemap.xml`. `docs/PHOTO-…jpg` 404s at its repo path (not deployed) but loads at `/OLD/docs/PHOTO-…jpg`.

---

## 2. Local setup and development

There is no build toolchain and no package manager. Edit HTML/CSS/JS/PHP in the repo, preview locally, commit, then deploy the changed files over FTPS after a backup and Waldo's approval.

### 2.1 Preview the static page

```bash
cd garethinpanama        # your clone
python3 -m http.server 8080
```

Open http://127.0.0.1:8080/ . `send.php` will not run on this server, so the form will fall through to FormSubmit; do not submit real test messages.

### 2.2 Preview the contact endpoint

With PHP installed (PHP was not installed on Waldo's Mac when checked on 16 Nov 2026): `php -S 127.0.0.1:8080`, then POST to `/send.php`. GET returns `405` with `{"ok":false,"error":"method_not_allowed","message":"POST only."}` (same as live). Locally, `mail()` usually fails, so expect `500 mail_failed` unless you configure a mail catcher. Never point it at a real inbox unless Waldo agrees.

### 2.3 Form behaviour (needed for QA)

`main.js` prefers `send.php` and falls back to FormSubmit:

1. `#contactForm` submit is intercepted (`preventDefault()`).
2. `sendViaPHP` POSTs JSON to `send.php` with `action: "contact"`, `lang`, `name`, `email`, `phone`, `interest`, `message`, `_honey`.
3. If that request throws (network error or a non-JSON response), `sendViaRelay` POSTs the raw `FormData` to the form's `action` (FormSubmit) and shows success if FormSubmit answers 2xx.
4. If `send.php` answers JSON with an `ok` boolean, that result is shown as-is, even when `ok` is false (for example `422 invalid_fields`, `429 rate_limited`, `500 mail_failed`). There is no fallback in that case.

Live `send.php`:

- POST only (405 otherwise); JSON or form-encoded input; one action, `contact`
- Honeypot `_honey`: bots get a fake success and nothing is sent
- Validation: name ≤120 chars, valid email, optional phone `^[+0-9 ()\-]{5,25}$`, message 2–5000 chars; unknown interest becomes `Other`
- CR/LF/NUL stripped from fields; `<`, `>`, `"` stripped from the name used in headers
- Rate limit: 10 messages per IP per hour, counted in `sys_get_temp_dir()/gip-rate-<md5(ip)>-<YmdH>.json`
- Sends with PHP `mail()` to `info@garethinpanama.com`, From `Gareth in Panama Website <no-reply@<host>>`, Reply-To the visitor; EN/ES messages; JSON with `X-Content-Type-Options: nosniff`
- The only change from the 4 Sep Mac copy (+194 bytes): non-ASCII Reply-To names are RFC 2047-encoded (`mb_encode_mimeheader`)

Allowed interests (keep in sync with the `<select>` and `send.php`): Property Management, Buying a Property, Selling a Property, Investment / Relocation, Other.

An HTML comment above the form still says "Form uses FormSubmit.co — no backend required". That is out of date; `send.php` is the primary path.

---

## 3. Working copy, sync and workflow

The **GitHub repo is the source of truth**, and the live server must match it. Check for drift before every change, because someone may edit files on the server directly.

### 3.1 Safety rule for this FTP account

`upload@garethinpanama.com` is not jailed to the web root. Its FTP home is the **cPanel account root** (`public_html`, `mail`, `ssl`, `.cpanel`, `logs` and similar). **Never mirror, back up into git, or deploy against `/`.** The scripts default to `REMOTE_PATH=public_html` and refuse `/` or `.`.

### 3.2 Environment for the scripts

```bash
export AGE_KEYFILE=/path/to/keyfile                    # private key, delivered separately
export CREDENTIALS_AGE=/path/to/credentials.age        # from this package; keep OUTSIDE the repo
# optional:
export FTP_CONNECT_IP=102.130.123.19   # if local DNS for ftp.garethinpanama.com does not reach the origin
export REMOTE_PATH=public_html          # default
```

From a repo checkout, the scripts require `CREDENTIALS_AGE`. (Only when run from the unzipped handover package do they fall back to the `credentials.age` beside `scripts/`.)

The scripts decrypt `credentials.age` in memory, write a temporary `0600` netrc in a private temp `HOME` that is deleted on exit, and feed lftp its commands on stdin, so the password is not on the command line and not in `~/.netrc` or lftp bookmarks. Never run them with `set -x`.

Every session starts with:

```lftp
set ftp:ssl-force true
set ftp:ssl-protect-data true
set ftp:ssl-protect-list true
set ftp:ssl-auth TLS
set ssl:verify-certificate true
set ssl:check-hostname no
set ftp:passive-mode true
open ftp://ftp.garethinpanama.com:21
cd public_html
```

You need outbound access to the server's PASV ports as well as port 21; without it, login succeeds but listings and downloads hang.

### 3.3 Mirror live and check drift

```bash
./scripts/mirror-live.sh                    # fresh dated folder ~/.gip-work/live-mirror-YYYYMMDD-HHMMSS
./scripts/check-drift.sh <that-folder>      # offline; exit 0 = no drift
```

`mirror-live.sh` is download-only (no `--reverse`, no `rm`, no `put`) and defaults to a new folder outside the repo, so it never overwrites your edits. Use an empty folder each time; files deleted on the server are not removed from an existing folder.

`check-drift.sh` ignores repo-only files (`.git`, `scripts/`, `HANDOVER.md`, `README.md`, `.gitignore`, `.gitleaksignore`) and reports `docs/PHOTO-2026-09-03-16-40-30.jpg` as "expected" until it is deployed. Anything else it prints is drift. If live changed out of band, copy those live files into the repo, commit them as "sync from live", push, and tell Waldo before deploying.

### 3.4 Workflow for every change

1. **Clone or pull:** `git pull` on `main`.
2. **Check drift:** `mirror-live.sh` into a fresh folder, then `check-drift.sh` (§3.3). Resolve drift first.
3. **Edit** in the repo. Bump `?v=` cache-busting when you change `styles.css` or `main.js` (§4).
4. **Test** locally (§2) and in a browser.
5. **Scan:** `gitleaks detect --source . --redact` (or `gitleaks git . --redact` on gitleaks 8.19+). Stop if it finds a real secret.
6. **Commit and push** (§3.6). Pushing does not change the live site.
7. **Back up live:** `./scripts/backup-live.sh` (default `~/backups/garethinpanama/live-STAMP`).
8. **Dry run:** `./scripts/deploy.sh --file index.html --file main.js …` (preferred) or `./scripts/deploy.sh` for the whole tree.
9. **Ask Waldo** for approval, quoting the dry-run output and the commit.
10. **Deploy:** the same command with `--yes`. It refuses if the working tree has uncommitted changes.
11. **Verify** (§5.4); for a launch or major release, complete the checklists (§7).
12. **Tag** the deployed commit, e.g. `git tag deploy-YYYY-MM-DD && git push --tags`.

### 3.5 `.gitignore` (already in the repo)

The repo's `.gitignore` blocks `credentials.age`, `credentials.recipient.txt`, `*.age`, `*.agekey`, `.netrc`, `*.pem`, `*.key`, `id_*`, `.env*`, `error_log*`, `*.log`, `.ftpquota`, `.DS_Store`, `._*`, `.well-known/acme*`, `cgi-bin/`, `.cpanel/`, `mail/`, `ssl/`, `logs/` and `live-mirror/`. Keep it at least that strict; the repo is **public**.

### 3.6 Pushing to GitHub

Clone over HTTPS needs no auth. Pushing needs write access to `MantisWare/garethinpanama`.

- On Waldo's Mac, HTTPS push works through the GitHub CLI login: `git -c credential.helper='!gh auth git-credential' push`. His SSH key maps to a different GitHub account (`waldo-marais_domo`), which is denied, so do not use the SSH remote.
- Any other agent or machine needs its own write access from Waldo (for example a collaborator invite or a fine-grained token stored outside the repo). Never commit a token.

---

## 4. Build

There is **no build step**. What you edit is what you deploy.

When you change `main.js` or `styles.css`, bump their cache-busting query string in `index.html` (`?v=9` today; the portrait uses `gareth-portrait.jpg?v=2`). The origin sends no `Cache-Control` or `Expires` header (only `Last-Modified`, `Accept-Ranges` and `Vary: Accept-Encoding`).

Never upload `.DS_Store`, credentials, age keys, the repo-only files, or a `--delete` mirror (it would remove live-only content such as `.well-known/`).

---

## 5. Deploy to cPanel over FTPS (explicit TLS)

### 5.1 Connection rules

- **Protocol:** FTP with explicit TLS (FTPS): port 21, then `AUTH TLS`. Not implicit FTPS (990), not SFTP (22).
- **Always force TLS on control and data channels. Never fall back to plain FTP.**
- **Host:** `ftp.garethinpanama.com` (A record `102.130.123.19`)
- **Port:** `21`
- **Username:** `upload@garethinpanama.com`
- **Password:** only from `credentials.age` (§9). Never paste it into a document, the repo, or chat.
- **Remote path:** `public_html`. Never `/`.

FileZilla / Cyberduck: protocol "FTP", encryption **"Require explicit FTP over TLS"** (not "if available").

### 5.2 Pre-deploy backup

```bash
./scripts/backup-live.sh            # or: ./scripts/backup-live.sh /path/to/backups
```

Keep the folder until the deploy is verified. A cPanel / Host Africa / JetBackup account backup is a useful extra if available (**to-verify**); the FTPS backup of `public_html` is mandatory regardless.

### 5.3 Deploy

```bash
# dry run (default); --file mode makes no server connection in dry run
./scripts/deploy.sh --file index.html --file styles.css
# only after Waldo approves this production deploy:
./scripts/deploy.sh --yes --file index.html --file styles.css
```

- `--file PATH` (repeatable, relative to the repo root) uploads only those files with `put` and creates folders as needed. It refuses repo-only and secret paths (`scripts/`, `docs/HANDOVER.md`, `README.md`, `.gitignore`, `*.age`, keys, `.well-known/`, …).
- Without `--file`, it runs `mirror --reverse` of the whole repo (with `--dry-run` unless `--yes`). After a fresh clone every file has a new timestamp, so a whole-tree deploy re-uploads everything (~70 MB, including `OLD/` and the videos), and it also publishes `docs/PHOTO-2026-09-03-16-40-30.jpg`. Prefer `--file`.
- It never uses `--delete`. It excludes credentials, keys, `.git`, logs, `.well-known/`, `cgi-bin/` and the repo-only files.
- With `--yes` in a git checkout, it refuses to run if there are uncommitted changes, so the deployed files match a commit.

### 5.4 Post-deploy checks

On a fresh / incognito load of https://garethinpanama.com/ and https://www.garethinpanama.com/ :

- Title, hero video, area images, portrait, PDFs
- `main.js?v=…` and `styles.css?v=…` are the new versions
- EN/ES and light/dark still work
- `curl -s https://garethinpanama.com/send.php` still returns the 405 JSON
- Repo-only files are not public: `/README.md`, `/scripts/deploy.sh`, `/docs/HANDOVER.md`, `/.git/HEAD` should all 404 (they did on 17 Nov 2026)
- Contact form: a real test only with Waldo's agreement
- Checklist pass for a launch or major release (§7)

### 5.5 Rollback

After Waldo agrees to the rollback, upload the backup folder (it is not a git checkout, so the clean-tree check does not apply):

```bash
./scripts/deploy.sh /path/to/backups/live-STAMP            # dry run
./scripts/deploy.sh --yes /path/to/backups/live-STAMP
```

Nothing is deleted, so files that a bad deploy added stay on the server until Waldo approves removing them. Repeat the checks in §5.4.

---

## 6. cPanel administration

Inferred from public DNS, TLS, HTTP and FTPS. Items marked **to-verify** were not confirmed inside the control panel.

### 6.1 Control panel access

- `https://garethinpanama.com/cpanel` and `/webmail` serve cPanel's redirect page.
- `cpanel.garethinpanama.com` and `webmail.garethinpanama.com` exist. Standard ports are 2083 and 2096.
- The FTP user is not the cPanel login. No cPanel credentials have been issued to this agent.

### 6.2 Domains and DNS (checked 17 Nov 2026)

| Record | Value |
| --- | --- |
| Nameservers | `ns1.host-ww.net`, `ns2.host-ww.net` |
| SOA | `ns1.host-ww.net` / `waldo.mantisware.co.za` / serial `2026110201` |
| A (`garethinpanama.com`) | `102.130.123.19` |
| AAAA | none |
| CNAME `www` | `garethinpanama.com` |
| A `ftp`, `cpanel`, `webmail`, `whm`, `webdisk`, `cpcalendars`, `cpcontacts` | `102.130.123.19` |
| `mail` | CNAME to `garethinpanama.com` |
| MX | `0 garethinpanama.com` |
| SPF | `v=spf1 +a +mx +include:spf.host-ww.net +include:spf.antispamcloud.com ~all` |
| DKIM | `default._domainkey` present (RSA) |
| DMARC | **none** |
| CAA | **none** |

There is no canonical-host redirect today: both `https://garethinpanama.com/` and `https://www.garethinpanama.com/` serve the page with 200. The page's `og:url` is the apex.

### 6.3 TLS / SSL

- Let's Encrypt, issuer `YR1`, SAN `garethinpanama.com` and `*.garethinpanama.com`
- Valid 2 Nov 2026, 5:46 PM to 31 Jan 2027, 5:46 PM America/Panama
- Renewal by cPanel AutoSSL is likely but **to-verify**
- No `Strict-Transport-Security` header
- `http://` → `https://` redirect is **to-verify**: plain HTTP from the documentation box is intercepted by a proxy (`Server: Pingora`, 500). Check from a normal network.

### 6.4 Email

- Public mailbox: `info@garethinpanama.com`, hosted on the same cPanel account (MX is the domain; SPF includes Host Africa and `spf.antispamcloud.com`)
- Webmail: `https://webmail.garethinpanama.com` or `/webmail`
- DKIM published; **DMARC missing**
- Other mailboxes, and whether `send.php` mail actually arrives, are **to-verify**

### 6.5 Backups and cron

**To-verify** in cPanel (Backup, Backup Wizard, or JetBackup / Host Africa backups). No cron jobs are known.

### 6.6 PHP and other server settings

- PHP is enabled (`send.php` answers). The exact version is **to-verify**; `declare(strict_types=1)` and typed functions need PHP 7+.
- No `.htaccess` in `public_html` (FTPS listing 16 Nov, mirror 17 Nov). `/.htaccess` and `/.well-known/` return 403 over HTTPS (server denies dotfiles).
- No `robots.txt` or `sitemap.xml`. The favicon is `assets/logo-32.png`; `/favicon.ico` 404s.
- `/wp-login.php` returns 307 to `recaptcha.cloud` and `/wp-admin/` is 404. The site is not WordPress; this is hosting-level bot protection.

---

## 7. Required pre-launch checklists

Waldo's global standards apply. They live in shared mia-memory:

- `Standards/Post-AI-Code Security Checklist.md` (28 points)
- `Standards/Pre-Deploy Performance Checklist.md` (31 points)

**Rule:** run both before a launch or major release (and after significant code lands). Record the result in `Security-Review.md` and `Performance-Review.md` in the repo: date, commit, and every item marked PASS / FIXED / N/A (with reason) / OPEN. These gates never loosen an approval rule. An AI pass is a first pass, not a professional audit.

No review file exists yet (17 Nov 2026). The notes below are observations, **not** a completed review.

### 7.1 Security checklist (28 items)

- Access and accounts (1–7): no application login, so mostly **N/A** with that reason. cPanel, webmail and FTP logins are still a host surface to protect.
- Input and requests (8–14): no database (8 N/A). `send.php` validates and has a honeypot and rate limit; no CSRF token (11 OPEN). HTTPS works; HTTP→HTTPS to-verify (12). Security headers largely absent (13 OPEN): no CSP, HSTS, `X-Frame-Options` / `frame-ancestors`, `Referrer-Policy`; only `send.php` sends `X-Content-Type-Options: nosniff`.
- Secrets (15–18): no API keys in the frontend; the FormSubmit URL uses the already-public email. FTPS/cPanel passwords live only in `credentials.age`, outside the repo. The repo is **public**, so gitleaks before every push is mandatory.
- Files, money, config (19–22): no uploads, no payments. After each mirror, confirm nothing from `mail/`, `ssl/`, `.cpanel/` or `logs/` came into the tree.
- Dependencies (23–25): GSAP 3.15 and Lenis 1.3.15 come from CDNs by minor version, with no SRI hashes and no lockfile. Pin and review them when you next change them.
- **28. Self-host fonts and audit third-party calls:** **OPEN / will fail.** Google Fonts load on first visit with no consent banner, plus jsDelivr, unpkg and (on fallback) FormSubmit; there is no privacy policy. Self-host fonts, then remove, self-host or consent-gate every other third-party call, record it in a privacy policy, and verify in a clean-browser network tab.

### 7.2 Performance checklist (31 items)

Backend/database items (21–28) are likely **N/A** if measurements agree; do not skip measurement items by default.

Relevant now: JPEG/PNG rather than WebP/AVIF; the 1920 px lifestyle photos are 0.3–1.3 MB each; fonts not self-hosted; third-party scripts on every load; no cache headers despite `?v=`; gzip on; no CDN (a CDN is paid and needs Waldo's yes, and not until there are paying clients); test on a slow phone because of the ~9 MB hero videos and the 24.8 MB guidebook (item 31).

---

## 8. Known gaps and open questions

### 8.1 Gaps already visible

- Four persona images referenced by the live page 404 (§1.3).
- Google Fonts and JS CDNs with no privacy policy or consent (security check 28).
- Almost no security headers; no HSTS; HTTP→HTTPS unverified; no canonical-host redirect.
- No `robots.txt`, `sitemap.xml`, `/favicon.ico` or DMARC.
- `Security-Review.md` / `Performance-Review.md` not written yet.
- Stale HTML comment above the form says FormSubmit is the only backend.
- `docs/PHOTO-2026-09-03-16-40-30.jpg` is in the repo but not deployed to `docs/` on live.

### 8.2 Answered

- Source of truth: the public repo `MantisWare/garethinpanama`, seeded from a live `public_html` mirror on 17 Nov 2026 (Waldo, 16–17 Nov).
- `docs/PHOTO-2026-09-03-16-40-30.jpg` may be published (Waldo). It is in the repo; uploading it to live is a production deploy and still needs his go.
- Web root is `public_html`; protocol is explicit FTPS on 21, not SFTP (verified).
- Canonical host: there is no redirect today (both apex and www return 200). Whether to add one is a question below.

### 8.3 Questions still open (for Waldo)

1. Which agent receives the age private key, and does it get push access to the repo?
2. cPanel login: will you issue one (through age, not chat)?
3. Does `send.php` mail actually reach `info@`? Is FormSubmit activated for that address, and should it stay as the fallback?
4. Restore the four persona images, or remove that markup from the live page?
5. Canonical host (apex or www) and an HTTP→HTTPS redirect: add both?
6. Other mailboxes besides `info@`? Publish DMARC?
7. Existing Host Africa backups and any cron jobs?
8. Should font self-hosting / consent (check 28) land before the next content deploy, or as separate work?
9. Deploy `docs/PHOTO-2026-09-03-16-40-30.jpg` to live, or keep it repo-only?

---

## 9. Credentials

This section contains **no secrets**.

The FTPS password is stored encrypted in `credentials.age`, in this handover package (not in the repo). It holds `KEY=value` lines: `FTP_HOST`, `FTP_PORT`, `FTP_PROTOCOL`, `FTP_USER`, `FTP_PASSWORD`.

| Field | Value |
| --- | --- |
| `FTP_HOST` | `ftp.garethinpanama.com` |
| `FTP_PORT` | `21` |
| `FTP_PROTOCOL` | FTP with explicit TLS (FTPS). Never plain FTP. |
| `FTP_USER` | `upload@garethinpanama.com` |
| `FTP_PASSWORD` | only inside `credentials.age` |
| Remote path | `public_html`. Never `/`. |

Decrypt with [age](https://age-encryption.org):

```bash
age -d -i <path-to-keyfile> credentials.age
```

The age **private key is delivered to the receiving agent separately** (by Waldo, through a secure channel). It is never stored in this document, this package or the public repo. Do not commit it, and do not write its path into this file.

The matching **recipient public key** is in `credentials.recipient.txt` (starts with `age1…`). Use it to re-encrypt an updated credentials file for the same recipient (`age -r "$(cat credentials.recipient.txt)" -o credentials.age plain.txt`, then shred `plain.txt`). Do not overwrite `credentials.age` unless you are rotating credentials and the recipient can still decrypt.

Point the scripts at it with `CREDENTIALS_AGE=/path/to/credentials.age` and `AGE_KEYFILE=/path/to/keyfile`.

---

## 10. What has been done (as of 17 Nov 2026)

- 16 Nov: FTPS login over explicit TLS verified, `public_html` identified as the web root, credentials encrypted with age. No server files changed.
- 17 Nov: from Waldo's Mac, a read-only FTPS mirror of `public_html` (130 files) was taken, gitleaks-scanned and pushed as the first commit of the public repo (tag `live-snapshot-2026-11-17`) with this document, the scripts and the approved photo. No server files changed. `credentials.age` and the key are not in the repo.
- 17 Nov: this document and the scripts were audited against the repo and the live site. Scripts updated for the repo layout (`CREDENTIALS_AGE`, fresh-folder mirrors, `check-drift.sh`, `deploy.sh --file`, clean-tree check).
- The original Mac folder `/Users/mantis/GIT/MANTISWARE/garethinpanama` was not modified.
- Not done yet: delivering the age key to the receiving agent; no production deploy has been made.
