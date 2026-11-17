# Gareth in Panama — agent handover

**Site:** https://garethinpanama.com/  
**Owner / approver:** Waldo Marais  
**Local historical copy (Waldo's Mac Studio, 4 Sep 2026):** `/Users/mantis/GIT/MANTISWARE/garethinpanama`  
**Hosting:** cPanel on Host Africa (nameservers `ns1.host-ww.net` / `ns2.host-ww.net`; `host-ww.net` redirects to [hostafrica.com](https://www.hostafrica.com/))  
**Deploy method:** FTP with explicit TLS (FTPS) on port 21. Never use plain FTP. This is not SFTP (SSH file transfer).  
**Web root (verified 16 Nov 2026, America/Panama):** `public_html` (`www` is a symlink to it).  
**Intended git remote (approved public):** https://github.com/MantisWare/garethinpanama  
**Document date:** 16 November 2026, America/Panama (UTC-5)

This document is for the receiving agent who will develop, administer and deploy the site. It contains no passwords or private keys.

---

## Agent designation & capabilities

**Role:** Website Developer & Administrator for garethinpanama.com.  
**Reports to:** Waldo Marais, who owns the site and approves changes.

### What this agent does

Develop, administer, deploy and maintain the site; keep a local working copy of the code; and take backups before every production change.

### Tools and capabilities required

- A shell on a machine that can reach `ftp.garethinpanama.com` port 21 **and** the server's FTP passive (PASV) data ports
- `lftp` or another FTPS client that can **require** explicit TLS on the control and data channels (never fall back to plain FTP)
- `age` ([age-encryption.org](https://age-encryption.org)) to decrypt `credentials.age`
- `git`
- A browser, for post-deploy and checklist verification
- Optional PHP, for local testing of `send.php`
- Web fetch / `curl`, for public HTTPS checks

### Access this agent gets

- **FTPS** as `upload@garethinpanama.com` via `credentials.age` (password encrypted; the age private key is delivered separately)
- **cPanel login later**, through the same age process, not in chat and not in this tree
- **GitHub:** https://github.com/MantisWare/garethinpanama (public, approved by Waldo). The repo root mirrors the live `public_html` as of 17 Nov 2026 (tag `live-snapshot-2026-11-17`), plus this document in `docs/HANDOVER.md` and the FTPS scripts in `scripts/`.

### What it may do without asking

- Local edits in a working copy
- Read-only FTPS backups and mirrors of `public_html` (never of the cPanel account home)
- Staging / local checks (static preview, optional local PHP, browser checks, checklist drafts)

### What needs Waldo's approval

- Production deploys (including running `scripts/deploy.sh --yes`)
- Deleting anything on the server (no `mirror --delete` unless Waldo has explicitly approved that exact delete)
- DNS, email or cPanel changes
- Any paid service. **No new paid infrastructure until there are paying clients.**

### Standing rules

- Back up before every deploy (`scripts/backup-live.sh`, and a cPanel backup if one is available).
- Run the security checklist (28 points) and the performance checklist (31 points) before releases (see the checklist section below). Record the pass in `Security-Review.md` and `Performance-Review.md`.
- Never commit or print secrets. Never put `credentials.age`, `credentials.recipient.txt`, age keyfiles, `.netrc`, cPanel passwords, `error_log`, or the account `ssl/` / `mail/` / `.cpanel/` directories in git or in chat.
- Never use plain FTP. Always `set ftp:ssl-force true` and `set ftp:ssl-protect-data true`.
- Draft any outgoing messages (email, WhatsApp, client mail) instead of sending them. Waldo sends, or tells you to send, the approved text.

### First-day checklist

1. Receive the age **private** key from Waldo separately (it is not in this package and not in the git repo). Confirm you can run `age -d -i <path-to-keyfile> credentials.age` and that you do not print or paste the password.
2. Install `age`, `lftp` and `git` (and optional PHP). On macOS: `brew install age lftp git php`.
3. When the public repo exists, clone it:
   ```bash
   git clone https://github.com/MantisWare/garethinpanama.git
   ```
   The repo was seeded from a read-only FTPS mirror of `public_html` on 17 Nov 2026. Still run a fresh mirror before your first change to confirm nothing changed on the server since then.
4. Take a read-only live mirror of **`public_html` only**:
   ```bash
   export AGE_KEYFILE=/path/to/keyfile
   ./scripts/mirror-live.sh ./live-mirror
   ```
5. Diff that mirror against `site/` in this handover package (the older 4 Sep 2026 Mac copy). Do not upload `site/` over production.
6. Initialise or update git from the **live mirror**, not from `site/` alone. Apply the `.gitignore` in the sync section. Run gitleaks before the first push.
7. Confirm `send.php` still returns 405 JSON on GET, and that HTTPS pages, images, videos and PDFs load.
8. Read both required checklists and open `Security-Review.md` / `Performance-Review.md` if they are not already there.
9. Do not deploy, delete server files, or change DNS, mail or cPanel until Waldo says so.

---

## Package README

This handover package (`garethinpanama-handover.zip`) contains:

| Path | What it is |
| --- | --- |
| `HANDOVER.md` | This document |
| `README.md` | Short pointer to this document |
| `credentials.age` | Encrypted FTPS fields (see the Credentials section) |
| `credentials.recipient.txt` | The age **public** recipient key only |
| `scripts/mirror-live.sh` | Read-only FTPS mirror of `public_html` |
| `scripts/backup-live.sh` | Dated read-only FTPS backup of `public_html` |
| `scripts/deploy.sh` | FTPS upload; **dry run unless `--yes`** |
| `scripts/_ftps_common.sh` | Shared helper (sourced by the three scripts) |
| `site/` | Copy of the Mac Studio tree as it stood on **4 September 2026, 3:25 PM America/Panama** |

**`site/` is the older 4 Sep 2026 Mac copy. It is not the current production tree. The live mirror of `public_html` is the source of truth.**

On 16 November 2026 a read-only FTPS listing confirmed that production `public_html` is newer (HTML last changed 30 Sep 2026, 7:29 PM America/Panama) and that `public_html/OLD/` still holds a tree whose sizes match this Mac copy. Do not deploy `site/` over the live site.

The age **private** key is not in this zip, not in `site/`, and must never be added to git.

This package was assembled on the documentation box. A full byte-for-byte FTPS mirror into a local `live-mirror/` folder could not be completed from that environment: FTP login over explicit TLS succeeded, but the server's PASV data ports timed out, so files could not be downloaded. The receiving agent should run `scripts/mirror-live.sh` from a network that can reach those data ports (a normal Mac or office connection usually can).

---

## 1. Overview and stack

Gareth in Panama is a marketing site for Gareth Tyack's Panama real-estate practice (sales, rentals, property management, investment and relocation advisory). It is a **single-page static site** with a small PHP contact endpoint. There is **no CMS**, no WordPress, no Node/npm build, no Composer project, no tests and no CI.

| Layer | What it is |
| --- | --- |
| Page | `index.html` — one long scrolling page (EN/ES, light/dark theme) |
| CSS | `styles.css` — handwritten; fonts are "Archivo" and "Rubik" |
| JS | `main.js` — theme, i18n, smooth scroll (Lenis), GSAP animations, contact form |
| Contact API | `send.php` — POST-only JSON/form endpoint; validates, rate-limits, emails via PHP `mail()` |
| Form fallback | HTML `action` posts to FormSubmit (`https://formsubmit.co/info@garethinpanama.com`) if `send.php` is unreachable |
| Downloads | `docs/panama-guidebook.pdf` (~24.8 MB, 100 pages) and `docs/gip-real-estate-brochure.pdf` (~7.8 MB, 13 pages) |
| Public email | `info@garethinpanama.com` (already published on the site) |

Third-party front-end loads (Mac copy and live page, as of 16 Nov 2026):

- Google Fonts: `fonts.googleapis.com` / `fonts.gstatic.com` (Archivo 500/600/700, Rubik 400/500/600)
- GSAP 3.15 plus ScrollTrigger and SplitText from `cdn.jsdelivr.net`
- Lenis 1.3.15 from `unpkg.com`
- FormSubmit as the form fallback

The origin IP is `102.130.123.19`. HTTPS responses advertise `Server: nginx`. cPanel service hostnames (`cpanel`, `webmail`, `ftp`, `whm`, `mail`, `webdisk`, `cpcalendars`, `cpcontacts`) all point at that IP, and `https://garethinpanama.com/cpanel` and `/webmail` return a stock "cPanel Redirect" page.

FTP on that IP is Pure-FTPd with TLS. The FTP control-channel certificate's CN is `cpr48-za1.host-ww.net` (the Host Africa machine), not `ftp.garethinpanama.com`. The chain verifies; the hostname does not match the site FTP name. Scripts therefore keep `ssl:verify-certificate true` and set `ssl:check-hostname no`. That is a shared-hosting pattern, not an excuse to allow plain FTP.

### 1.1 Directory layout

**Mac / `site/` copy (4 Sep 2026):**

```
garethinpanama/
  index.html
  main.js
  styles.css
  send.php
  assets/
    logo-32.png, logo-64.png, logo-180.png, logo-256.png, logo-512.png, logo.png, og-image.png
    images/          # area and lifestyle photos in 500 / 960 / 1280 / 1920 variants
  docs/
    panama-guidebook.pdf
    gip-real-estate-brochure.pdf
    PHOTO-2026-09-03-16-40-30.jpg   # Waldo confirmed 16 Nov 2026 this may be published
```

That folder has no `.git`, README, `package.json`, `composer.json`, `.env`, `.htaccess`, `.vscode`, deploy script, tests or CI. No FileZilla / Cyberduck / Transmit / Cursor SFTP config was found on the Mac Studio for this project.

**Live `public_html` (FTPS STAT, 16 Nov 2026), in addition to a newer `index.html` / `main.js` / `styles.css` / `send.php`:**

- `assets/videos/panama-city-aerial.mp4`, `panama-city-aerial.rev.mp4`, `panama-city-aerial-poster.jpg`
- `assets/images/areas/area-*.jpg` (nine photos)
- `assets/images/gareth-portrait.jpg`
- `OLD/` — a dated copy whose file sizes match the 4 Sep Mac tree
- `.well-known/acme-challenge/` — Let's Encrypt; do not deploy over it and do not commit it
- No `assets/logo.png`, `assets/logo-512.png`, `docs/PHOTO-…jpg`, or `assets/images/personas/` (the live HTML still references four persona images, which 404)
- No `.htaccess`, `cgi-bin` or `error_log` at the web-root level

### 1.2 Critical: the live site is ahead of the Mac / `site/` folder

Do not treat `site/` or the Mac checkout as production, and **do not upload either over the live site**.

| File | Mac / `site/` mtime (America/Panama) | Size on Mac | Live size (FTPS STAT) | Live time, converted to America/Panama |
| --- | --- | --- | --- | --- |
| `index.html` | 4 Sep 2026, 3:25 PM | 35,746 | 41,332 | 30 Sep 2026, 7:29 PM |
| `main.js` | 4 Sep 2026, 3:25 PM | 31,678 | 44,686 | 29 Sep 2026, 6:16 PM |
| `styles.css` | 4 Sep 2026, 3:25 PM | 29,250 | 33,354 | 29 Sep 2026, 6:16 PM |
| `send.php` | 4 Sep 2026, 3:05 PM | 6,315 | 6,509 | 29 Sep 2026, 6:16 PM |

Live HTML uses cache-busting (`styles.css?v=9`, `main.js?v=9`, `gareth-portrait.jpg?v=2`) and a different `<title>`: "Gareth in Panama — Sales, Rentals and Property Management Advisory" (the Mac title is still "Property Management & Sales"). Recover `public_html` with `scripts/mirror-live.sh` and use that as the working tree.

---

## 2. Local setup and development

There is no build toolchain and no package manager. Editing is: change HTML/CSS/JS/PHP, preview locally, then deploy selected files over FTPS after a backup and Waldo's approval.

### 2.1 On the Mac Studio (as inspected 16 Nov 2026)

- Python 3.14.8 is available (`python3`).
- **PHP is not installed.** `brew install php` if you need to exercise `send.php` locally.
- **lftp is not installed.** `curl` is. Homebrew is at `/opt/homebrew/bin/brew`.
- **age is not installed** on the Mac. It was installed on the documentation box at `~/.local/bin/age` (v1.2.1). On the Mac: `brew install age lftp`.

### 2.2 Preview the static page

```bash
cd /path/to/working-copy    # the live mirror, not site/ unless you only want the old tree
python3 -m http.server 8080
```

Open http://127.0.0.1:8080/ . `send.php` will not run on this server.

### 2.3 Preview the contact endpoint

After PHP is installed: `php -S 127.0.0.1:8080`, then POST to `/send.php`. GET returns `405` with JSON `{ "ok": false, "error": "method_not_allowed" }` (same as live). Do not point a test RECIPIENT at a real inbox until you intend to.

### 2.4 Form behaviour (needed for QA)

`main.js` prefers `send.php` and falls back to FormSubmit:

1. `#contactForm` `preventDefault()`s submit.
2. `sendViaPHP` POSTs JSON to `send.php` with `action: "contact"`, `lang`, `name`, `email`, `phone`, `interest`, `message`, and `_honey`.
3. If that fetch throws (network / non-JSON), `sendViaRelay` POSTs the raw `FormData` to the form's `action` (FormSubmit).
4. If `send.php` responds with JSON that includes an `ok` boolean, that result is honoured even when `ok` is false (no fallback).

`send.php` in the Mac / `site/` copy (live is 194 bytes larger; read the live file after you mirror it) already includes: POST only; honeypot `_honey`; validation; header-injection stripping; 10 messages per IP per hour in `sys_get_temp_dir()` files named `gip-rate-…`; mail to the public `info@garethinpanama.com` address via PHP `mail()` with a `noreply@<host>` From line; JSON plus `X-Content-Type-Options: nosniff`; EN/ES messages.

Allowed interests (keep in sync with the `<select>` and `send.php`): Property Management, Buying a Property, Selling a Property, Investment / Relocation, Other.

---

## 3. Local code folder & sync

The source of truth is a read-only FTPS mirror of **`public_html`**, then git. `site/` is only a historical 4 Sep 2026 copy.

### 3.1 Safety rule for this FTP account

`upload@garethinpanama.com` is not jailed to the web root. A listing of `/` shows the **cPanel account home** (including `public_html`, `mail`, `ssl`, `.cpanel`, `logs`, and similar). **Never mirror, back up into git, or deploy against `/`.** Scripts in this package default to `REMOTE_PATH=public_html` and will refuse a remote path of `/` or `.`. Do not download `ssl/`, `mail/`, `.cpanel/` or `logs/`.

### 3.2 Exact read-only mirror (TLS forced)

```bash
export AGE_KEYFILE=/path/to/keyfile   # private key, delivered separately
# optional: CREDENTIALS_AGE, REMOTE_PATH=public_html, FTP_CONNECT_IP=102.130.123.19
./scripts/mirror-live.sh ./live-mirror
```

The script decrypts `credentials.age` in memory (and a shredded temp netrc), then runs the equivalent of:

```lftp
set ftp:ssl-force true
set ftp:ssl-protect-data true
set ftp:ssl-protect-list true
set ftp:ssl-auth TLS
set ssl:verify-certificate true
set ftp:passive-mode true
open ftp://ftp.garethinpanama.com:21
# then, after login:
cd public_html
mirror --verbose --continue --no-perms --no-umask \
  --exclude-glob .DS_Store --exclude-glob ._* --exclude-glob .ftpquota \
  --exclude-glob error_log --exclude-glob error_log.* --exclude-glob *.log \
  --exclude-glob .git/ --exclude-glob credentials.age --exclude-glob *.age \
  --exclude-glob *.agekey --exclude-glob .well-known/ --exclude-glob cgi-bin/ \
  . /path/to/live-mirror
```

That `mirror` is download-only (no `--reverse`, no `rm`, no `put`). If DNS for `ftp.garethinpanama.com` does not reach `102.130.123.19` on your machine, set `FTP_CONNECT_IP=102.130.123.19`. You need outbound access to the server's PASV ports as well as port 21; without that, login can succeed while listings and downloads hang.

A dated backup (same read-only rules) is:

```bash
AGE_KEYFILE=/path/to/keyfile ./scripts/backup-live.sh
```

### 3.3 Diff the mirror against the Mac / `site/` copy

```bash
diff -rq --exclude .DS_Store --exclude .git site/ live-mirror/
```

Expected differences, already confirmed by public HTTPS and by FTPS STAT on 16 Nov 2026:

**Changed in production (same names, new sizes):** `index.html`, `main.js`, `styles.css`, `send.php` (see the table in §1.2).

**On live only (current `public_html`):** `assets/videos/*` (two MP4s plus a poster JPEG), `assets/images/areas/area-*.jpg` (nine files), `assets/images/gareth-portrait.jpg`, and a `OLD/` tree that matches the 4 Sep Mac sizes.

**On the Mac / `site/` only (not in current `public_html`):** `assets/logo.png`, `assets/logo-512.png`, `docs/PHOTO-2026-09-03-16-40-30.jpg`. Waldo confirmed the photo may be published; it is simply not on the live web root today.

**Broken on live:** `assets/images/personas/persona-{buyers,sellers,owners,investors}.jpg` are referenced in the live HTML and return 404. The directory is not on the server.

### 3.4 Start git from the live mirror

```bash
cd live-mirror
git init -b main
```

Use a `.gitignore` at least as strict as this (the repo will be **public**):

```gitignore
# Secrets and credentials — never commit
credentials.age
credentials.recipient.txt
*.age
*.agekey
.netrc
*.pem
*.key
id_*

# Server junk and secrets-adjacent
error_log
error_log.*
*.log
.ftpquota
.DS_Store
._*
.well-known/acme-challenge/
.well-known/acme
cgi-bin/

# Do not import a cPanel home into this repo
.cpanel/
mail/
ssl/
logs/
```

Run **gitleaks** (or an equivalent secret scan) before the first commit and before every push. Stop if it finds a real secret; do not push.

Waldo approved a **public** repository `MantisWare/garethinpanama`. Clone, when it exists:

```bash
git clone https://github.com/MantisWare/garethinpanama.git
```

The first commit (17 November 2026) is a read-only FTPS mirror of `public_html`, scanned with gitleaks before push, tagged `live-snapshot-2026-11-17`. It also adds `docs/PHOTO-2026-09-03-16-40-30.jpg` (Waldo approved publishing it; it is in the repo but not yet uploaded to the live server). The deploy scripts exclude `scripts/`, `docs/HANDOVER.md`, `README.md`, `.gitignore` and `.gitleaksignore` so repo-only files never reach the web root. Run gitleaks before every push.

Put this handover document in `docs/HANDOVER.md` and the scripts in `scripts/`. **Never** add `credentials.age`, `credentials.recipient.txt`, or any keyfile to the public repo.

### 3.5 Ongoing workflow

1. **Pull** the latest git `main` (or refresh a read-only `mirror-live.sh` and merge carefully if someone edited on the server).
2. **Edit** in the working copy.
3. **Test** locally (static server, optional PHP, browser).
4. **Back up** production with `backup-live.sh`.
5. **Ask Waldo** before a production deploy.
6. **Deploy** only the intended files with `scripts/deploy.sh` (dry run first; `--yes` only after approval). Do not pass `--delete`.
7. **Verify** in the browser and with the checklists for a release.
8. **Commit and tag** the same tree you deployed (`git commit`, `git tag`, `git push`, `git push --tags`).

To keep the mirror in sync: re-run `mirror-live.sh` into a throwaway folder and `diff -rq` against your working copy before you deploy, so you notice any out-of-band server edits (and so you never overwrite `OLD/`, videos or area images you did not mean to touch).

---

## 4. Build

There is **no build step**. What you edit is what you deploy.

When you change `index.html`, `main.js` or `styles.css`, bump the live cache-busting query string (`?v=9` today). The origin does not send `Cache-Control` or `Expires` (only `Last-Modified` / `Accept-Ranges`, and `Vary: Accept-Encoding`). Gzip is on.

Do not upload:

- `.DS_Store`, credentials, age keys, or this package's encrypted files
- A blanket `--delete` mirror from `site/` (it would remove live-only videos, area images, `OLD/`, and the newer HTML/JS/CSS/PHP)

---

## 5. Deploy to cPanel over FTPS (explicit TLS)

### 5.1 Connection rules

- **Protocol:** FTP with explicit TLS (FTPS). Start on port 21, then `AUTH TLS`. Not implicit FTPS (port 990) and not SFTP (port 22).
- **Always force TLS on the control and data channels. Never fall back to plain FTP.**
- **Host:** `ftp.garethinpanama.com` (A record `102.130.123.19`)
- **Port:** `21`
- **Username:** `upload@garethinpanama.com`
- **Password:** only from `credentials.age` (Credentials section). Never paste it into this document, the repo, or chat.
- **Remote path:** `public_html` (verified). Do not use `/`.

FileZilla / Cyberduck: protocol "FTP", encryption **"Require explicit FTP over TLS"** (not "if available").

### 5.2 Pre-deploy backup

```bash
AGE_KEYFILE=/path/to/keyfile ./scripts/backup-live.sh
```

Keep that folder until the deploy is verified. Optional extra: a cPanel/Host Africa/JetBackup account backup, if enabled (**to-verify**). File-level FTPS backup of `public_html` is mandatory regardless.

### 5.3 Deploy

```bash
# always a dry run first
AGE_KEYFILE=/path/to/keyfile ./scripts/deploy.sh /path/to/working-copy
# only after Waldo approves a production deploy:
AGE_KEYFILE=/path/to/keyfile ./scripts/deploy.sh --yes /path/to/working-copy
```

`deploy.sh` uses `mirror --reverse` **without** `--delete`, and stays in dry-run unless `--yes` is passed. Prefer uploading only the files you changed when the change set is small.

### 5.4 Post-deploy checks

On a fresh / incognito request to https://garethinpanama.com/ and https://www.garethinpanama.com/ :

- Title, hero, video, area images, portrait, PDFs
- `main.js?v=…` and `styles.css?v=…` are the new versions
- EN/ES and light/dark still work
- Contact form: a deliberate test only with Waldo's agreement
- `send.php` still returns 405 JSON on GET
- No credentials, backups or `.git` are web-reachable
- Checklist pass for a release (section 7)

### 5.5 Rollback

Re-upload the dated backup folder with `deploy.sh --yes /path/to/backup/live-STAMP` (still no `--delete`) after Waldo agrees to the rollback, then repeat the checks.

---

## 6. cPanel administration

Inferred from public DNS, TLS, HTTP and a read-only FTPS listing of the account. Items marked **to-verify** were not confirmed inside the control panel.

### 6.1 Control panel access

- `https://garethinpanama.com/cpanel` and `/webmail` serve cPanel's redirect page.
- `cpanel.garethinpanama.com` and `webmail.garethinpanama.com` exist. Standard ports are 2083 and 2096.
- The FTP user is not necessarily the cPanel login. Ask Waldo for cPanel credentials via age, not chat.

### 6.2 Domains and DNS

Public records as of 16 November 2026:

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

Canonical www vs apex redirect is **to-verify**.

### 6.3 TLS / SSL

- Let's Encrypt, issuer `YR1`, SAN `garethinpanama.com` and `*.garethinpanama.com`
- Valid from 2 November 2026, 5:46 PM America/Panama to 31 January 2027, 5:46 PM America/Panama
- AutoSSL is **to-verify** (almost certainly how this cert was issued)
- No `Strict-Transport-Security` header on the site today
- Plain HTTP from the documentation environment could not be verified (a `Pingora` proxy returned 500). **To-verify** that `http://` redirects to `https://` for apex and `www`.

### 6.4 Email

- Public mailbox: `info@garethinpanama.com`
- Mail appears hosted on the same cPanel account (MX is the domain; SPF includes Host Africa and `spf.antispamcloud.com`)
- Webmail: `https://webmail.garethinpanama.com` or `/webmail`
- DKIM is published; **DMARC is missing**
- Other mailboxes and whether `send.php` mail actually arrives are **to-verify**

### 6.5 Backups and cron

**To-verify** in cPanel (Backup, Backup Wizard, or JetBackup / Host Africa backups). Cron: none inferred; **to-verify**.

### 6.6 PHP and other server settings

- PHP is enabled (`send.php` runs). Exact version is **to-verify**. `declare(strict_types=1)` needs PHP 7+.
- No `.htaccess` was present in `public_html` on 16 Nov 2026 (STAT empty). `/.htaccess` over HTTPS still returns 403, which is consistent with the server denying dotfiles.
- No `robots.txt` or `sitemap.xml`. Favicon is `assets/logo-32.png` (`/favicon.ico` 404s).
- GET `/wp-login.php` returned 307 to `https://recaptcha.cloud/…`. The site is not WordPress (`/wp-admin/` is 404). Treat this as hosting-level bot/WAF behaviour until confirmed.

---

## 7. Required pre-deploy checklists

Waldo's global standards apply to this site. They live in shared mia-memory:

- `Standards/Post-AI-Code Security Checklist.md` (28 points)
- `Standards/Pre-Deploy Performance Checklist.md` (31 points)

**Rule:** run both after code lands, before a production deploy, and again at each major release. Record the pass in `Security-Review.md` and `Performance-Review.md`: date, revision, and every item marked PASS / FIXED / N/A (with reason) / OPEN. Fixes go through the normal review flow. These gates never loosen an approval rule. New paid infrastructure needs Waldo's approval, and none should be added until there are paying clients. An AI pass is a first pass, not a professional audit.

No formal review file existed as of 16 Nov 2026. The notes below are observations, **not** a completed review.

### 7.1 Security checklist (28 items)

Access and accounts (1–7): no application login. Mark **N/A** with that reason. The cPanel/webmail/FTP logins are still a host surface to protect.

Input and requests (8–14): no database (8 N/A). `send.php` validates and has a honeypot; there is no CSRF token (11 OPEN). HTTPS works; HTTP→HTTPS is to-verify (12). Security headers are largely absent (13 OPEN): no CSP, HSTS, `X-Frame-Options` / `frame-ancestors`, `Referrer-Policy`. Only `send.php` sends `X-Content-Type-Options: nosniff`.

Secrets (15–18): no API keys in the frontend. The FormSubmit URL uses the already-public email. Keep FTPS/cPanel passwords only in `credentials.age`. Because the future repo is **public**, gitleaks before every push is mandatory.

Files, money, config (19–22): no uploads, no payments. After each mirror, confirm backups, mail, `ssl/` and `.cpanel` were not pulled into the web tree or the public repo.

Dependencies (23–25): pin/review GSAP, SplitText and Lenis when you next change them; there is no lockfile.

**28. Self-host fonts and audit third-party calls:** currently **OPEN / will fail**. The page loads Google Fonts on the first visit with no consent banner, plus jsDelivr, unpkg and (on form fallback) FormSubmit. Self-host fonts, then remove, self-host or consent-gate every other third-party call, record it in a privacy policy, and verify in a clean-browser network tab.

### 7.2 Performance checklist (31 items)

Backend/database items (21–28) are likely **N/A** if measurements agree. Do not skip measurement items by default.

Relevant now: JPEG/PNG rather than WebP/AVIF; fonts not self-hosted; third-party scripts on every page; no cache headers despite `?v=`; gzip is on; no CDN (a CDN is paid and needs Waldo's yes, and not until there are paying clients); test on a slow phone because of the ~9 MB hero videos and ~25 MB guidebook (item 31).

---

## 8. Known gaps and open questions

### 8.1 Gaps already visible

- `site/` / the Mac tree is stale; `public_html` is ahead; `public_html/OLD/` matches the Mac sizes.
- Public GitHub repo created 17 Nov 2026 and seeded from the live mirror; the Mac folder `/Users/mantis/GIT/MANTISWARE/garethinpanama` is still the old untracked copy and is not used.
- Google Fonts + JS CDNs + no privacy policy / consent (security check 28).
- Almost no security headers; HSTS not set; HTTP→HTTPS unverified.
- No `robots.txt`, `sitemap.xml` or DMARC.
- Live HTML references four persona images that 404.
- Formal Security-Review.md / Performance-Review.md have not been written yet.
- From the documentation box, a byte-for-byte FTPS file mirror could not be completed (PASV data ports timed out after a successful TLS login). The receiving agent must run `mirror-live.sh` from a normal network before treating a local tree as complete.

### 8.2 Questions already answered by Waldo (16 Nov 2026)

- Use a live `public_html` snapshot as the source of truth, and a **public** GitHub repo `MantisWare/garethinpanama` so the new agent can clone over HTTPS.
- `docs/PHOTO-2026-09-03-16-40-30.jpg` may be published.

### 8.3 Questions still open

1. cPanel login (likely different from the FTP user) — provide later via age, not chat?
2. Does `send.php` currently deliver to `info@`? Keep FormSubmit as a fallback?
3. Restore the four missing persona images, or remove the references from the live HTML?
4. Canonical host (apex vs www), and confirm HTTP→HTTPS redirects?
5. Other mailboxes besides `info@`? Publish DMARC?
6. Existing Host Africa backups and any cron jobs?
7. Should font self-hosting / consent (check 28) land before the next content deploy, or is that separate work?
8. Confirm the receiving agent has the age private key.

---

## 9. Credentials

This section contains **no secrets**.

The FTPS password is stored encrypted in `credentials.age`, in the same folder as this document (and in the zip). The age file holds `KEY=value` lines: `FTP_HOST`, `FTP_PORT`, `FTP_PROTOCOL`, `FTP_USER` and `FTP_PASSWORD`.

| Field | Value |
| --- | --- |
| `FTP_HOST` | `ftp.garethinpanama.com` |
| `FTP_PORT` | `21` |
| `FTP_PROTOCOL` | FTP with explicit TLS (FTPS). Never plain FTP. |
| `FTP_USER` | `upload@garethinpanama.com` |
| `FTP_PASSWORD` | only inside `credentials.age` |
| Remote path | `public_html` (verified 16 Nov 2026). Never `/`. |

Decrypt with [age](https://age-encryption.org):

```bash
age -d -i <path-to-keyfile> credentials.age
```

The age **private key is delivered to the receiving agent separately**. It is never stored in this document, this package, or the (public) git repo. Do not commit it. Do not guess or write down a path to it in this file.

The matching **recipient public key** is in `credentials.recipient.txt` (starts with `age1…`). Use it if you re-encrypt an updated credentials file for the same recipient. Do not overwrite `credentials.age` unless you are rotating credentials and the recipient can still decrypt.

`age` v1.2.1 is on the documentation box at `~/.local/bin/age`. It was not installed on the Mac Studio at inspection time.

---

## 10. What this handover did and did not do (16 Nov 2026)

- The Mac project folder was not modified, committed or pushed (it has no git repo).
- No production file was changed. No upload, delete or cPanel login was attempted.
- `credentials.age` was not overwritten. The password was used only in memory to open a read-only FTPS session, and was not written into this document or the zip in clear text.
- FTPS login over explicit TLS succeeded. `public_html` was listed with `STAT`. File contents could not be downloaded from the documentation environment because PASV data ports timed out.
- Waldo created the public repo; the first live snapshot was pushed from his Mac on 17 Nov 2026. No server files were changed.
