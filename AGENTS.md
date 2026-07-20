# AGENTS.md

## Codebase Knowledge Graph (codebase-memory-mcp)

This project uses codebase-memory-mcp to maintain a knowledge graph of the codebase.
ALWAYS prefer MCP graph tools over grep/glob/file-search for code discovery.

## Priority Order

1. `search_graph` — find functions, classes, routes, variables by pattern
2. `trace_path` — trace who calls a function or what it calls
3. `get_code_snippet` — read specific function/class source code
4. `query_graph` — run Cypher queries for complex patterns
5. `get_architecture` — high-level project summary

## When to fall back to grep/glob

- Searching for string literals, error messages, config values
- Searching non-code files (Dockerfiles, shell scripts, configs)
- When MCP tools return insufficient results

## Examples

- Find a handler: `search_graph(name_pattern=".*OrderHandler.*")`
- Who calls it: `trace_path(function_name="OrderHandler", direction="inbound")`
- Read source: `get_code_snippet(qualified_name="pkg/orders.OrderHandler")`

## What this is

Vanilla HTML/CSS/JS static site for UMD Films (Málaga video production company). No frameworks, no build tools, no npm dependencies. Content is data-driven via JSON files.

## The one command you'll need

```bash
node generate-pages.js
```

Run after editing `data/team.json` or `data/portfolio.json`. Generates individual HTML files in `team/` and `portfolio/`. Only requires Node.js — no `npm install`.

## How content works

- Home editorial text (hero, about, cta-band, contact) lives in `data/home.json`, rendered by `renderHomeContent()` in `main.js` — do not hardcode text back into `index.html`
- `team/index.html` and `portfolio/index.html` are full listing pages (all members / all projects), separate from the individual `team/[id].html` / `portfolio/[id].html` pages. Home only shows `featured: true` items from each.
- Artists page (`artists/index.html`) merges `team.json` entries with `represented_artist: true` and all of `data/artists.json` (external collaborators, no individual page). Team members are clickable (link to `team/[id].html`), external artists show an Instagram link when available.

## Shared grid/filter logic (avoid re-duplicating)

`shared.js` exports `renderFilterableGrid()`, `buildTeamCard()`, `buildPortfolioCard()`, `validYtUrl()`, `setCanonical()`, `setOgMeta()`, `setTwitterMeta()`, `getBackUrl()` — used by home, `team/index.html`, `portfolio/index.html`, `artists.js`, and `equipment.js`. Before writing a new filtered grid anywhere, use these instead of copying the filter-button loop again.

`shared.js` also exports the YouTube thumbnail fallback chain: `ytThumbUrl()`, `ytThumbCheck()`, `ytThumbAdvance()`, `extractYouTubeId()`. Always validate a YouTube URL with a real ID check before deriving a thumbnail from it — do not assume any `trailer_youtube`/`full_video_youtube` string is non-empty and non-placeholder.

## Development

- **Must use a local server** — `fetch()` fails with `file://`. Use Live Server (VS Code), `python -m http.server 8000`, or `npx serve .`
- `rootPath()` in `js/shared.js` handles relative paths from subfolders — understand it before editing path logic

## Auto-calculated stats

- Projects = `portfolio.json` length
- Team = `team.json` length
- Years = `current year − config.brand.founded_year` (auto-updates yearly)
- Location = `config.schema.address_locality`

## Deployment

Static upload to Hostinger via File Manager or FTP. No CI, no build step, no tests. Run `generate-pages.js` before uploading if JSON was edited.

## Testing & Verification

No test framework — run these commands after editing JSON, JS, or CSS:

```bash
# 1. JS syntax check (all 8 files)
node -c js/shared.js && node -c js/main.js && node -c js/team.js && node -c js/team-index.js && node -c js/portfolio.js && node -c js/portfolio-index.js && node -c js/equipment.js && node -c js/artists.js

# 2. Page generator (team + portfolio HTML + sitemap)
node generate-pages.js

# 3. Data contract check (team ↔ portfolio cross-references)
node -e "
const team = require('./data/team.json').map(m => m.id);
const portfolio = require('./data/portfolio.json');
const broken = [];
portfolio.forEach(p => {
  (p.team_ids || []).forEach(id => {
    if (!team.includes(id)) broken.push(p.id + ' → team_id ' + id + ' not found');
  });
});
const portIds = portfolio.map(p => p.id);
require('./data/team.json').forEach(m => {
  (m.projects || []).forEach(id => {
    if (!portIds.includes(id)) broken.push(m.id + ' → project ' + id + ' not found');
  });
});
if (broken.length) { console.log('BROKEN:', broken.join('\n')); process.exit(1); }
else { console.log('✓ All cross-references valid'); }
"

# 4. Asset validation (covers, thumbs, equipment, partners, placeholders)
node -e "
const fs = require('fs');
const issues = [];
require('./data/team.json').forEach(m => {
  if (!fs.existsSync('assets/team/' + m.id + '/cover.avif'))
    issues.push('MISSING: assets/team/' + m.id + '/cover.avif');
});
require('./data/portfolio.json').forEach(p => {
  if (p.thumb && !fs.existsSync(p.thumb))
    issues.push('MISSING: ' + p.thumb);
});
require('./data/equipment.json').forEach(e => {
  if (e.photo && !fs.existsSync(e.photo))
    issues.push('MISSING: ' + e.photo);
});
['assets/portfolio/placeholder.svg','assets/equipment/placeholder-gear.svg','assets/logo/og-cover.png'].forEach(f => {
  if (!fs.existsSync(f)) issues.push('MISSING: ' + f);
});
if (issues.length) { console.log(issues.join('\n')); process.exit(1); }
else { console.log('✓ All referenced assets exist'); }
"

# 5. Generated HTML meta check (verify canonical, OG, twitter per page)
grep -l 'og:image.*logo-umd-films.svg' team/*.html portfolio/*.html
# Should return EMPTY — no generated page should still reference the SVG logo as OG image
```

## SEO architecture

- **Meta tags** have two layers: static placeholders in HTML templates, overwritten at runtime by JS
- Templates set fallback `<title>`, `<meta description>`, canonical, OG, and Twitter Card tags for crawlers that don't execute JS
- JS (`main.js`, `team.js`, `portfolio.js`, `equipment.js`, `team-index.js`, `portfolio-index.js`, `artists.js`) overwrites them with dynamic values from JSON using shared helpers (`setCanonical`, `setOgMeta`, `setTwitterMeta`)
- `generate-pages.js` also pre-fills `<title>` and `<meta description>` in generated HTML as a second fallback
- **Structured data**: `LocalBusiness` schema on home (injected by `shared.js`), `VideoObject` on project pages with YouTube trailers, `Person` on team member pages
- `sitemap.xml` is generated by `generate-pages.js` — run the script after adding/removing entries
- `robots.txt` disallows `/v1/` (old version)
- All OG image URLs must be absolute (prefix with `config.brand.site_url`)

### Adding a new schema type

Edit the relevant JS file (e.g., `team.js` for Person). Create a JSON-LD object, stringify it, and append a `<script type="application/ld+json">` to `document.head`.

## Key files

| File | Edit when... |
|---|---|
| `data/config.json` | Changing logo, phone, social links, founding year, **or adding UI strings** (`ui_strings` section) |
| `data/home.json` | Changing home page text (hero, about, CTA, contact) |
| `data/team.json` | Adding or editing team members |
| `data/portfolio.json` | Adding or editing projects |
| `data/equipment.json` | Adding or editing rental equipment |
| `data/services.json` | Adding or editing services |
| `data/artists.json` | Adding/editing external represented artists |
| `js/artists.js` | Changing the represented-artists listing page |
| `js/shared.js` | Changing nav, footer, FAB, theme, lightbox, or common utilities |
| `css/style.css` | Changing colors (CSS variables at top), typography, global layout |
| `css/home.css` | Changing home-page-only sections (hero, trust, about/stats, services, cta-band, contact) |
| `generate-pages.js` | Only if HTML template structure changes |
| `index.html` | Editing home page text (hero, about, contact) |

## Shared CSS classes — do not assume a parent section

These live in `css/style.css` and are used across 2+ pages. Their names were
deliberately chosen to not imply a section that isn't always present:

| Class | Used by |
|---|---|
| `.lead-text` | home about intro, `equipment/index.html` hero, `artists/index.html` hero |
| `.card-grid` | home `#teamGrid`, `team/index.html`, `artists/index.html` |
| `.text-link` | home contact social links, `artists.js` external artist Instagram link |
| `.team-card*` | home, `team/index.html`, `artists/index.html` |
| `.portfolio-card*`, `.portfolio__grid` | home, `portfolio/index.html`, member profile projects (`team.js`) |
| `.page-hero` | `team/`, `portfolio/`, `artists/`, `equipment/` index pages |

Before adding a new home-only class to `css/home.css`, grep the class name
across all `.js`/`.html` files first — this project has a history (Bloque G)
of classes leaking into other pages via `cardBuilder()` functions in `shared.js`.

## UI strings convention

**All user-facing text lives in `data/config.json → ui_strings`.** Never hardcode
a string in JS or HTML that the user will see. The rule:

1. Add a new key to the appropriate `ui_strings` subsection in `config.json`.
2. Reference it in JS via `config.ui_strings.section.key` (with `|| 'fallback'` for safety).
3. HTML templates use static fallbacks for SEO/no-JS; JS overwrites them at runtime.

Subsections: `nav`, `footer`, `aria`, `social`, `home`, `stats`, `form`, `cards`,
`categorias_equipo`, `categorias_portfolio`, `tipos_artista`, `errores_404`,
`placeholders`, `equipment_extra`, `ficha_tecnica`, `video`, `ficha_perfil`,
`foto_counter`.

## Known pending work (Bloque G — completed)

- ✅ `css/home.css` creado. Reglas exclusivas de home (hero, trust marquee, about/stats, services, cta-band, contact) movidas fuera de `style.css`. `index.html` carga `style.css` + `home.css` en ese orden — `home.css` depende de variables/clases de `style.css` (`.btn`, `.reveal`, `.eyebrow`, etc.), no es standalone.
- ✅ Renombradas 3 clases que ataban su nombre a una sección que no siempre estaba presente: `.about__body`→`.lead-text`, `.team__grid`→`.card-grid`, `.contact__social-link`→`.text-link`. Las tres viven en `style.css` (compartidas). Ver `css/style.css` para comentarios inline de por qué se renombraron.
- ✅ Strings hardcodeados migrados a `config.json → ui_strings`. Cubre: aria-labels (lightbox, footer, nav, FAB), social platform names, footer text, stat labels, form validation, card labels, home CTAs, showreel text. Todos los `.js` actualizados.
- ✅ Auditoría design-system de `css/home.css`: 2 variables nuevas (`--black-overlay-trail`, `--black-overlay-faint`) creadas en `style.css` para el gradiente del hero overlay. Soporte light/dark + always-dark pin.
- ✅ Limpieza general: eliminados `v1/`, assets sin usar, campos muertos en JSON, CSS muerto (`.reveal.d4`, `--ease-out`), bug `color: white` en `.fab-top`.

## Accessibility (a11y)

WCAG 2.2 AA baseline. All interactive elements must remain keyboard accessible.

### What's in place

- **Skip link**: `<a href="#contenido" class="skip-link">` on all pages — visually hidden, appears on Tab focus
- **`<main id="contenido">`**: landmark on all pages (index.html wraps hero through contact; subpage templates already had `<main>`)
- **`:focus-visible` styles**: red outline on all interactive elements; box-shadow ring on buttons, filters, theme toggle, FAB
- **Keyboard navigation**: team cards, portfolio cards, and linked service cards all have `role="link"`, `tabindex="0"`, and Enter/Space handlers
- **`aria-pressed`**: filter buttons (portfolio + equipment) announce active state
- **`aria-label`**: footer navs distinguished via `ui_strings.aria.main_navigation`; sections, social links, burger, theme toggle, WhatsApp FAB all labeled from `ui_strings.aria.*`
- **`aria-hidden="true"`**: decorative SVGs, hero video, hero overlay/redline, trust bar marquee track, service video preview
- **Form accessibility**: all inputs have `<label for>` association, `autocomplete` attributes, `aria-invalid` on validation errors, visible focus ring via `box-shadow`
- **`prefers-reduced-motion`**: disables all animations, transitions, scroll-behavior, and the trust bar marquee
- **`prefers-color-scheme`**: light/dark theme with localStorage persistence; hero/CTA/nav always dark
- **External links**: `rel="noopener"` on all `target="_blank"` links
- **Lightbox**: Escape key closes, close button receives focus on open; prev/next arrow buttons, ArrowLeft/ArrowRight keyboard navigation, touch swipe (50px threshold), counter (`2 / 5`)
- **Semantic HTML**: `<header>`, `<nav>`, `<main>`, `<footer>`, `<section>` with `aria-label`; `<aside>` for sidebars

### When adding new interactive elements

1. **Clickable divs/cards**: must have `role="link"`, `tabindex="0"`, `aria-label`, and keydown handler for Enter/Space
2. **Buttons**: native `<button>` preferred; if using divs, add `role="button"` + keyboard handler
3. **Images**: meaningful images get descriptive `alt`; decorative images get `alt=""` + `aria-hidden="true"`
4. **Filter/toggle buttons**: add `aria-pressed="true|false"` and update on click
5. **New sections**: wrap in `<section aria-label="...">` or use `<main>` for primary content
6. **Form inputs**: always pair with `<label for="id">`, add `autocomplete` where applicable
7. **Animations**: respect `prefers-reduced-motion` — either disable or shorten duration

### Testing

- Tab through entire page — every interactive element must receive visible focus
- Enter/Space must activate all clickable cards and buttons
- Screen reader: all images have alt text, all buttons/links have accessible names, landmarks are announced
- Zoom to 200% — layout must not break or overlap
