# Gareth in Panama — handover package

Start with **HANDOVER.md**.

`site/` is the older 4 September 2026 Mac copy. It is **not** the current production tree. A live FTPS mirror of `public_html` is the source of truth (`scripts/mirror-live.sh`).

The age private key is not in this package. Decrypt credentials with:

```bash
age -d -i <path-to-keyfile> credentials.age
```

Never use plain FTP. Never commit `credentials.age` or any keyfile. The public clone URL is:

```bash
git clone https://github.com/MantisWare/garethinpanama.git
```
