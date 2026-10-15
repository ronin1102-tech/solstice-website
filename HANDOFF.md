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

---

## Premium polish pass + product pages (2026-10-14)

**QA fixes (Vesper):** dead `data-slot` placeholder removed · `scroll-margin-top` on every anchor target · skip-to-content link · gold `:focus-visible` rings (product cards ring the whole card) · Open Graph + Twitter Card tags on every page, using `assets/og-image.jpg` (a 1200×630 crop of the hero photo, so previews aren't cropped awkwardly; the hero photo itself is untouched).

**Polish:** blue/gold ambient glow over the hero screen (CSS only, moves with the parallax) · the eclipse now overlaps the hero's fade, the hero copy lifts away on scroll, and the corona only starts forming once it's in view · stronger corona (hot limb, bloom, slow streamers, a diamond-ring bead during formation, gold sparks, scales to fit phones) · cards get a cursor spotlight, lift, and inner glow · section rhythm on one spacing scale, pull quote resized, Philosophy/Products labels are real `h2`s.

**Product pages:** `voice/`, `grammar/`, `docs/` built from `solstice-website-product-details-spec.md`. Shared `product.css` + `product.js` (scroll reveals, live demos, copy buttons). Homepage cards link through with a View Transitions morph (Chrome/Edge/Safari 18+; plain navigation elsewhere). All motion respects `prefers-reduced-motion`.

### Open items for Tracy
- **Voice checkout:** "Get Solstice Voice" opens an email until Stripe/Gumroad is picked.
- **Docs notify:** "Get notified" opens an email until an email-capture service is picked.
- **Grammar license:** the spec says MIT, but the grammar-tool repo has no LICENSE file, so the page says "free and open source" without naming a license. Add a LICENSE to the repo, then "MIT" can go on the page.
- **Docs claims softened to match the repo:** import is from a file dialog (not drag-and-drop yet), and annotations are highlights and underlines (notes aren't mentioned). Export is marked "Final testing" until the two phase-gate checks pass.
- **Voice "Languages" tile** says it's built on Whisper, which recognizes many languages. Confirm which model ships before claiming a specific language list.
- Assets still wanted: app screenshots, a Voice demo GIF, an extension screenshot.

## Ledger page (2026-10-15)

`ledger/` is built from `Ledger_Product_Page_Spec.md` and added as the fourth homepage card (the products grid is now 2×2). It has a blue "Free" badge, a daily-number ring as the hero art, and an interactive demo: set a monthly budget, add purchases, and tag an unknown purchase once so the same merchant is auto-tagged next time. The demo runs only in memory, so nothing leaves the page. The page also has the cloud comparison, six features, the Vanguard Ops story, and cross-links to Voice and Docs. Docs' "Next" link now points to Ledger.

### Open items for Tracy
- **Ledger download:** the spec calls for a Google Drive link. Until there is one, "Free download" opens an email.
- Assets still wanted: a Ledger screenshot and a demo GIF.
