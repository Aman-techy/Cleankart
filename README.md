# Cleankart Static Site

This repo is now organized for clean, extensionless URLs for GitHub Pages.

## Structure
- All main pages (services, pricing, contact, book) are now in their own folders as `index.html`.
- Old `.html` files at root are now 301 meta-refresh redirects to their canonical folder URLs.
- All navigation and internal links use extensionless URLs (e.g., `/services/`).
- Canonical tags are present for SEO.
- `.nojekyll` disables Jekyll processing for static assets.
- `CNAME` is set to `mycleankart.in`.

## How to deploy
Just push to `main` and GitHub Pages will serve clean URLs.

## Safety
Backups of original files are in `.bak` files for inspection.

## Commit message
"Convert site to folder-style clean URLs; update links/canonical tags; add redirect pages"
