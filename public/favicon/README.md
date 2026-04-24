# mini-git · starlog — favicon set

Letter-mark favicon using Fraunces-style italic `g` on the aurora (`#80ffea`) on void (`#050407`) palette.

## Files

| File | Use |
| --- | --- |
| `favicon-16.svg` | Browser tab, address bar |
| `favicon-32.svg` | Browser tab (HiDPI), bookmark bar |
| `favicon-48.svg` | Windows site tile, taskbar |
| `apple-touch-icon.svg` | iOS home screen (180×180) |
| `favicon-512.svg` | PWA manifest, social cards |

All files are SVG and will render crisp at any size. Each size has slightly different detail — 16px is stripped down for legibility, larger sizes add subtle star accents and a soft glow.

## HTML snippet

Paste inside `<head>`:

```html
<link rel="icon" type="image/svg+xml" sizes="16x16" href="/favicon-16.svg">
<link rel="icon" type="image/svg+xml" sizes="32x32" href="/favicon-32.svg">
<link rel="icon" type="image/svg+xml" sizes="48x48" href="/favicon-48.svg">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.svg">
<link rel="icon" type="image/svg+xml" sizes="any" href="/favicon-512.svg">
```

## Notes

- The font is set to `Georgia, 'Times New Roman', serif` rather than Fraunces — favicons can't load web fonts, so we fall back to the closest system-available italic serif. The visual is nearly identical to Fraunces italic at small sizes.
- If a PNG `favicon.ico` is required for older browsers, rasterize `favicon-32.svg` at 16/32/48 and bundle with any ICO tool.
- PWA manifest: reference `favicon-512.svg` with `"purpose": "any maskable"` — the rounded-rect background is safe for masking.
