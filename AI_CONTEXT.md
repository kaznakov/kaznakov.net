# AI_CONTEXT.md

## Project Overview
- Repository: personal/static portfolio website (`kaznakov.net`) with bilingual UI (EN/RU).
- Main stack: static HTML + CSS + vanilla/jQuery JS.
- Purpose: landing page with sections for hero, about, projects, certificates, education, contact/footer, plus AI assistant widget.
- Scope guardrail: this project context tracks only `kaznakov.net` (and `www.kaznakov.net`). Treat `awosd.kaznakov.net` / `www.awosd.kaznakov.net` as out of scope and do not use them in this repo's planning/changes.

## Top-Level Structure
- `index.html` — single-page markup and section structure.
- `css/style.css` — base Namari theme styles and global primitives.
- `css/namari-color.css` — theme color layer.
- `css/custom.css` — project-specific overrides/customizations (header behavior, responsive tweaks, carousels, modal, floating widgets, etc.).
- `js/site.js` — main client behavior (preloader hide, sticky nav behaviors, smooth scrolling, modal interactions, etc.).
- `js/i18n.js` — translation dictionary and runtime language switching.
- `js/carousel.js` — carousel mechanics.
- `js/agent.js` + `agent/` — AI-agent related frontend/backend prompt/server assets.
- `images/`, `fonts/` — static assets.
- `scanyomail/legal/` — legal docs (privacy policy markdown/html).

## Runtime / Local Preview
- No build step required for main site.
- Run local server from repo root:
  - `python3 -m http.server 4173`
- Open:
  - `http://127.0.0.1:4173/index.html`

## i18n Model
- Language controlled by `.lang-link` elements with `data-lang` (`en` / `ru`).
- Translatable nodes use `data-i18n` keys.
- i18n dictionary currently lives in `js/i18n.js`.
- Logos and language-specific social items in header/footer switch by language-specific attributes/selectors.

## Header / Navigation Notes
- Desktop header uses:
  - logo block (`#logo`)
  - center nav (`#nav-main`)
  - right actions (`.header-actions` + `aside .social-icons` with EN/RU + social icons).
- Mobile uses `#nav-mobile`, with separate language handling and sticky behavior overrides.
- A lot of header alignment logic is in `css/custom.css` media queries.

## Projects / Modal
- Projects section uses carousel items with `data-project-index` in `index.html`.
- JS builds/opens an accessible project modal with close-on-overlay/ESC and i18n updates.
- Modal styles are in `css/custom.css`; text strings in `js/i18n.js`.

## Preloader Context (Important)
- Markup: `#preloader` containing `#status` and `.la-ball-triangle-path`.
- Base theme (`css/style.css`) centers `#status` with absolute positioning + negative margins.
- Recent issue reported: loader visually shifted left.
- Applied fix in `css/custom.css`:
  - force full-viewport centering via `#preloader { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; }`
  - neutralize legacy absolute offsets on `#status` (`left/top: auto; margin: 0; position: relative`)
  - use `#status` size equal to spinner footprint (`32x32`) to remove visual left shift.
- This makes centering robust regardless of viewport/box model side effects.

## Domain / Hosting Priority (Current)
- Current business-critical issue: intermittent inaccessibility for users on mobile Beeline in Russia.
- Near-term goal: keep `www.kaznakov.net` + HTTPS stable for all providers and minimize operator-specific failures.
- Follow-up goal: keep architecture compatible with future stable operation of Miranda assistant in РФ.
- For any domain/hosting work, prioritize:
  1. DNS and routing resilience for Russian ISPs.
  2. Availability-first setup for static site delivery.
  3. Separation of static site reachability and assistant backend reachability (so site can remain available even if AI backend has restrictions).

## Current DNS / HTTPS Status (kaznakov.net only)
- GitHub Pages DNS checks passed for the current project domain.
- HTTPS is available when using `www.kaznakov.net` as the GitHub Pages custom domain.
- Public DNS resolves correctly to GitHub Pages IPs for `kaznakov.net` and `www.kaznakov.net`.
- Keep domain guidance in this repo limited to `kaznakov.net` + `www.kaznakov.net`.

## Beeline-Specific Incident Notes
- Observed behavior: site opens via Wi-Fi providers but may fail on mobile Beeline data.
- Key diagnostic: site opens when phone uses Private DNS resolvers (`1dot1dot1dot1.cloudflare-dns.com` or `dns.google`).
- Interpretation: likely operator DNS/route issue on Beeline mobile path, not a base GitHub Pages DNS/HTTPS misconfiguration.
- Operational guidance:
  - avoid unnecessary DNS churn while service is stable for most networks,
  - document affected networks/time windows,
  - if needed, escalate with Beeline support with reproduction steps,
  - keep fallback guidance (Private DNS / alternate resolver) for impacted users.

## Domain / Hosting Workstream Notes
- Track and document current deployment target(s), DNS provider, and CDN/proxy layer before making changes.
- Any migration plan should include rollback steps and TTL-aware DNS switch procedure.
- Validate accessibility from Russian networks (or trusted external checks) after each infra change.
- Keep legal/compliance implications in mind when selecting providers/routes for РФ availability.

## External Links Security
- `target="_blank"` links were updated to include `rel="noopener noreferrer"`.

## Known Sensitive Areas
- `css/custom.css` has many intertwined desktop/mobile/sticky overrides; small changes can regress other breakpoints.
- Header alignment tuning has been iterative and is the most fragile area.
- Keep changes scoped and always validate visually on desktop after header-related edits.

## Suggested Validation Checklist for Future Changes
1. Start local server and open desktop viewport (~1366px wide).
2. Check header line alignment (menu, EN/RU, social icons) in normal and sticky states.
3. Toggle language EN/RU and verify text/logo/social visibility switches correctly.
4. Open projects and verify modal behavior + translations.
5. Reload page and confirm preloader appears centered and disappears correctly.
6. For infra/domain changes: verify website availability from РФ and confirm no regressions for global access.

## Git / Collaboration Notes
- Environment is typically non-interactive; prefer direct, deterministic commands.
- If making frontend visual changes, capture screenshot artifact for verification.
- Keep PR messages explicit about motivation, touched files, and visual validation.
