# Deployment Guide — algolia-bundle

## Overview

This bundle is served via **jsDelivr CDN**, which resolves versions from **git tags** on GitHub (`Aliyu93/bundle`). A commit alone is NOT enough — you must create and push a git tag for jsDelivr to pick up the new version.

## Steps

### 1. Build

```bash
npx esbuild index.js --bundle --minify --outfile=dist/algolia-bundle.min.js
```

### 2. Commit

**Important:** Always commit the built `dist/algolia-bundle.min.js` — this is the file jsDelivr serves.

```bash
git add <changed source files> dist/algolia-bundle.min.js
git commit -m "v1.9.XX - Description of changes"
```

### 3. Tag

**This is required.** jsDelivr uses git tags to resolve versions, not commit messages.

```bash
git tag v1.9.XX
```

### 4. Push commit + tag

```bash
git push origin main
git push origin v1.9.XX
```

### 5. Verify

jsDelivr URL format:
```
https://cdn.jsdelivr.net/gh/Aliyu93/bundle@v1.9.XX/dist/algolia-bundle.min.js
```

If cached, purge via:
```
https://purge.jsdelivr.net/gh/Aliyu93/bundle@v1.9.XX/dist/algolia-bundle.min.js
```

## Common Mistakes

- **Forgetting the git tag** — jsDelivr will return "Failed to fetch" if the tag doesn't exist
- **Forgetting to push the tag** — `git push origin main` only pushes the commit, not tags. Tags must be pushed separately with `git push origin <tagname>`
- **Cache** — jsDelivr caches aggressively. Use the purge URL above if the old version is still being served after tagging correctly
