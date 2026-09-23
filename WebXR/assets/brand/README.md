# Brand assets

This directory ships two files: this note and `manifest.json`. It ships no
logo, because a union's logo is its trademark and the repository holds no
licence to reproduce any of them. The stage shows a **wordmark** for each
union instead — the abbreviation, the full name, the local where the
repository names one, and the training fund the standards registry knows —
typeset at runtime by `WebXR/shared/signage.js` from `tools/unions.json`.

## For a licensed deployment

If your deployment holds a union's written permission to display its logo:

1. put the file here as `assets/brand/<id>.svg` or `.png` (the ids are the
   keys in `manifest.json`, which match `tools/unions.json`);
2. set that union's `file` in your copy of `manifest.json` to the file name;
3. serve `assets/` beside the app (the sign fetches
   `<WebXR root>/assets/brand/manifest.json` relative to the page).

When the file loads, the union's sign shows it in place of the wordmark and
keeps the "Training partner" line. When it does not load, or the manifest is
missing, the wordmark stays. Nothing else changes.

Do not commit a logo or a non-null `file` to this repository:
`tools/check_signage.mjs` fails the build on either, and the licence note in
the manifest is the policy. The full statement is `docs/signage.md`.
