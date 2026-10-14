# Solstice AI Website — Handoff

**Status:** Live on `main` (commit `e921dd8`). Tracy's audit passed. Next: Vesper QA, then a UI polish pass.
**Repo:** https://github.com/ronin1102-tech/solstice-website
**Hosting:** GitHub Pages — Settings → Pages → Deploy from branch → `main` / `/ (root)`. Expected URL: `https://ronin1102-tech.github.io/solstice-website/`

## What was built
A static site (no build step) following `solstice-website-build-scope.md`:

| Section | Notes |
|---|---|
| Hero | Full-bleed MacBook photo, scroll parallax, "Built on this. Runs on yours." + CTA. Desktop: photo right-aligned with left-edge fade; mobile: full-bleed. |
| Eclipse | Three.js (vendored in `assets/`, lazy-loaded near viewport). Gold corona sweep + blue particles, ~5s then settles. Pauses off-screen; static under `prefers-reduced-motion`. |
| Bio | Tracy Weaver, Founder. Real copy + portrait. Solstice Way pull-quote. |
| Philosophy | Three cards (Local-First / Perpetual Ownership / No Hardware Left Behind), 3D tilt on hover (pointer devices only). |
| Products | Solstice Voice ($49, Shipping), SolsticeDocs (In development), Grammar tool (Open source). |
| Footer | Email, GitHub, two Instagram links. No popups. |

Branding is **Solstice AI** (header, footer, page title) — this is the AI page, not the corporation page.

## Files
- `index.html` — structure and content
- `styles.css` — eclipse design system (obsidian `#0A0B0E`, blue `#3B82F6`, gold `#E8B84A`, Space Grotesk)
- `main.js` — parallax, card tilt, eclipse scene
- `assets/` — `hero-macbook.jpg` (146 KB), `bio.jpg` (86 KB), `three.module.js` (v0.160.0) + license
- `.nojekyll` — required for GitHub Pages

## Verified
- Tracy's own audit: everything checks out; loads instantly on a 2012 MacBook Pro and the eclipse animation is smooth there.
- Headless Chromium: hero (desktop + mobile), eclipse, bio section.

## Not verified — for Vesper QA
- Philosophy, products and footer visuals on desktop; full mobile pass
- Real Lighthouse/network timing numbers
- Safari and Firefox
- Keyboard navigation and contrast
- Open Graph / social share preview (not added)

## Open decisions
- Bio still says "Founder, Solstice" and mentions audio plugins; the footer shows both Instagram accounts (Audio and AI). Confirm these are intended on the AI-only page.
- Hero photo's code has visible typos (`./htp`, `readady`). Re-shoot if unintentional.

## Planned next: UI premium pass
- Smoother hero → eclipse handoff, stronger corona
- Richer card hover states and depth
- Tighter typography and hierarchy
- Stronger glow around the hero screen

## History notes
- `main` previously held a Vite/TypeScript scaffold ("Scaffold Solstice site", `785be65`). Replaced at Tracy's request via a merge that keeps only the static site; the scaffold remains in git history.
- Working branch: `claude/new-session-kjtlo8` (in sync with `main`). PR #1 was opened earlier and is superseded.
