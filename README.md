# garethinpanama.com

The repo root is the live `public_html` of https://garethinpanama.com (first commit tagged `live-snapshot-2026-11-17`).

Start with **[docs/HANDOVER.md](docs/HANDOVER.md)**: the agent's role, approval rules, workflow, FTPS deploy and credentials.

- `scripts/`: FTPS mirror, drift check, backup and deploy (explicit TLS on port 21, never plain FTP). These files are never uploaded to the web root.
- The credentials live in `credentials.age`, which is delivered in the handover package and kept **outside** this repo. The age key is delivered separately.

```bash
export AGE_KEYFILE=/path/to/keyfile
export CREDENTIALS_AGE=/path/to/credentials.age
age -d -i "$AGE_KEYFILE" "$CREDENTIALS_AGE" >/dev/null && echo "decrypt ok"   # never print the password
```

Never commit secrets, and run gitleaks before every push. Production deploys need Waldo's approval.
