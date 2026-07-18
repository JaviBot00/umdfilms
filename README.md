# UMD Films — Complete Technical Documentation

> Version 2.1 · July 2026
> Developed by **Javier Botella** with help from **Claude (Anthropic)**

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Data Architecture](#2-data-architecture)
3. [How Each Page Works](#3-how-each-page-works)
4. [Page Loading Flow](#4-page-loading-flow)
5. [How to Update Content](#5-how-to-update-content)
6. [Generating New Pages](#6-generating-new-pages)
7. [Auto-calculated Stats](#7-auto-calculated-stats)
8. [SEO Implementation](#8-seo-implementation)
9. [Accessibility (a11y)](#9-accessibility-a11y)
10. [UI Strings (ui_strings)](#10-ui-strings-ui_strings)
11. [Local Development](#11-local-development)
12. [Deploying to Hostinger](#12-deploying-to-hostinger)
13. [Scalability & Future Steps](#13-scalability--future-steps)
14. [File Reference](#14-file-reference)

---

## 1. Project Structure

```cmd
umdfilms/
│
├── index.html                  ← Home (single page, all sections)
│
├── team/
│   ├── template.html           ← Base template (do not open directly)
│   ├── index.html              ← Full listing page (all members)
│   └── [id].html               ← One file per team member
│
├── portfolio/
│   ├── template.html           ← Base template
│   ├── index.html              ← Full listing page (all projects)
│   └── [id].html                ← One file per project
│
├── equipment/
│   └── index.html              ← Rental equipment catalog
│
├── artists/
│   └── index.html              ← Representación de Artistas (team members with
│                                   represented_artist:true + external artists.json)
│
├── css/
│   ├── style.css                ← Shared styles (variables, nav, footer, cards, filters,
│   │                                page-hero, lightbox — used by 2+ pages)
│   ├── home.css                 ← index.html-only styles (hero, trust marquee, about/stats,
│   │                                services, cta-band, contact form). Loads after style.css.
│   ├── team.css                 ← Styles exclusive to member pages (.profile-*)
│   ├── portfolio.css            ← Styles exclusive to project pages (.film-*)
│   └── equipment.css            ← Styles exclusive to equipment catalog (.gear-*)
│
├── js/
│   ├── shared.js                 ← Common utilities: fetchJSON, renderNav, renderFooter,
│   │                                 FAB, YouTube thumbnail fallback chain, renderFilterableGrid,
│   │                                 buildTeamCard, buildPortfolioCard, getBackUrl
│   ├── main.js                   ← Home page logic
│   ├── team.js                   ← Member page logic
│   ├── team-index.js             ← team/index.html logic
│   ├── portfolio.js              ← Project page logic
│   ├── portfolio-index.js        ← portfolio/index.html logic
│   ├── artists.js                ← artists/index.html logic (merges team.json + artists.json)
│   └── equipment.js              ← Equipment catalog logic
│
├── data/
│   ├── config.json               ← Constants: brand, contact, social, SEO, schema, ui_strings
│   ├── home.json                 ← Editorial text for index.html (hero, about, cta, contact)
│   ├── team.json                 ← Array of team members
│   ├── artists.json               ← External represented artists (not on the team)
│   ├── portfolio.json             ← Array of projects (full technical sheet)
│   ├── services.json              ← Array of services offered
│   ├── partners.json              ← Client/partner logos for the home trust bar
│   └── equipment.json              ← Array of rental equipment
│
├── assets/
│   ├── logo/                     ← logo-umd-films.svg, favicon.ico, favicon.svg
│   ├── icon/                     ← Social/brand icons as CSS mask-image sources (whatsapp,
│   │                                instagram, youtube, tiktok)
│   ├── team/                     ← Team photos (format: .avif, 3:4)
│   ├── portfolio/                ← Project thumbnails/galleries (format: .avif, 16:9)
│   ├── artists/                  ← External artist photos
│   ├── equipment/                ← Rental equipment photos, organized by subfolder
│   │                                (cameras/, ilumination/, sound/), format: .avif
│   └── logo-partners/             ← Client logos for the trust bar
│
└── generate-pages.js              ← Node.js script to generate individual HTML files
```

---

## 2. Data Architecture

All editable website content lives in `data/`. **You should never need to edit HTML or JS** for routine content updates — with the exception of the `ui_strings` migration described in [section 10](#10-ui-strings-ui_strings), which is JSON but consumed by `.js` files that render UI chrome.

### `data/config.json`

Global company constants. Loaded on all pages.

| Field | Description | Example |
|---|---|---|
| `brand.founded_year` | Founding year (for calculating years of experience) | `2019` |
| `brand.logo` | Path to SVG logo | `"assets/logo/logo-umd-films.svg"` |
| `contact.whatsapp` | Number without + or spaces | `"34675185198"` |
| `social.instagram` | Full URL | `"https://www.instagram.com/umdfilms/"` |
| `footer.dev_name` | Developer name in copyright | `"Javier Botella"` |
| `ui_strings` | UI chrome text (nav, footer, aria-labels, filter labels, 404 messages, placeholders) consumed by `shared.js`/`team.js`/`portfolio.js`/`equipment.js`/`artists.js`. See [section 10](#10-ui-strings-ui_strings). | `ui_strings.nav.equipo` → `"Equipo"` |

### `data/home.json`

Editorial text for `index.html` only (hero, about, services/portfolio/team section headers, cta-band, contact form labels). Does **not** duplicate contact/social data already in `config.json`, or service list already in `services.json` — `main.js` cross-references those at render time.

### `data/team.json`

Array of objects. Each object is a team member.

```jsonc
{
  "id": "alejandro-luque",           // ← Page URL: team/alejandro-luque.html
  "name": "Alejandro Luque",
  "surname": "",                     // Optional
  "role": "Director creativo y ejecutivo",
  "bio": "Long text...",
  "photo_cover": "assets/team/alejandro-luque/cover.avif",   // ← Main photo (3:4)
  "photos_extra": ["assets/team/alejandro-luque/01.avif"],   // ← Additional gallery
  "social": {
    "instagram": "https://www.instagram.com/...",
    "youtube": ""
  },
  "projects": ["cautivo-malaga"],    // IDs of projects they participated in
  "specialties": ["Dirección", "Producción ejecutiva"],
  "featured": true,                  // true = appears on home grid + first in listing
  "represented_artist": false        // true = also appears on artists/index.html
}
```

### `data/artists.json`

Array of **external** (non-team) represented artists only. Team members who are also represented artists use `represented_artist: true` in `team.json` instead of being duplicated here — `artists.js` merges both sources at render time.

```jsonc
{
  "id": "maria-hernandez",
  "name": "María Hernández",
  "role": "Cantante y compositora",
  "bio": "Short bio...",
  "photo": "assets/artists/maria-hernandez.webp",
  "social": { "instagram": "https://...", "youtube": "" }
}
```

### `data/portfolio.json`

Array of projects. Styled as a "movie poster board" card.

```jsonc
{
  "id": "cautivo-malaga",           // ← URL: portfolio/cautivo-malaga.html
  "title": "El Cautivo",
  "category": "Cortometraje",
  "year": 2025,
  "duration_min": 20,
  "director": "Alejandro Luque",
  "client": "Banda de cornetas y tambores Jesús Cautivo de Málaga",
  "synopsis": "Project description...",
  "thumb": "assets/portfolio/cautivo-malaga/cover.avif",
  "photos_extra": ["assets/portfolio/cautivo-malaga/01.avif"],
  "trailer_youtube": "https://youtu.be/REAL_ID",
  "full_video_youtube": "",          // Optional — if both exist, project page shows tabs
  "team_ids": ["alejandro-luque"],   // IDs of team members who participated
  "tags": ["Cortometraje", "Cautivo", "Málaga"],
  "featured": true
}
```

### `data/equipment.json`

Array of equipment available for rental. Photos live in category subfolders under `assets/equipment/`.

```jsonc
{
  "id": "sony-fx30",
  "name": "Sony Cinema Line FX30",
  "category": "camara",              // camara | audio | iluminacion | soporte | otro
  "quantity": 2,
  "description": "Text...",
  "specs": ["APS-C Super 35", "4K 120fps"],
  "photo": "assets/equipment/cameras/sony-fx30.avif",
  "price_day": 0,                    // 0 = "contact us". Fill in to show a price
  "available": true
}
```

### `data/partners.json`

Client/partner logos rendered in the home trust-bar marquee (`main.js` duplicates the set to fill the loop, `home.css` handles the `@keyframes marquee` animation).

---

## 3. How Each Page Works

### Home (`index.html`)

Loads `shared.js` and `main.js`. The JS:

1. Fetches `config.json`, `team.json`, `portfolio.json`, `services.json`, `partners.json`, `home.json` in parallel
2. Renders nav and footer dynamically (from config.json)
3. Renders all editorial text from `home.json` via `renderHomeContent()`
4. Duplicates trust bar logos for the marquee loop
5. Generates calculated stats (see section 7)
6. Renders service cards, **featured-only** portfolio grid, and **featured-only** team grid (full listings live on the index pages below)

### Team Pages (`team/[id].html`)

All are copies of `team/template.html`. They load `shared.js` + `team.js`.
The JS:

1. Reads the HTML filename to get the `id` (`alejandro-luque.html` → `"alejandro-luque"`)
2. Looks up that ID in `team.json`
3. Fills in hero, bio, social links, sidebar info card, extra photos, and projects
4. Extra photos open in a lightbox with prev/next arrows, keyboard navigation (ArrowLeft/ArrowRight), and touch swipe
5. Hero back button uses `document.referrer` to return to the previous page (falls back to `index.html#equipo`)

### Team Listing (`team/index.html`)

Loads `shared.js` + `team-index.js`. Renders **all** members (not just `featured`) via `UMD.renderFilterableGrid()` + `UMD.buildTeamCard()` — no category filter, just the full grid.

### Portfolio Pages (`portfolio/[id].html`)

Same pattern. They load `shared.js` + `portfolio.js`.
The JS:

1. Reads the `id` from the URL
2. Looks it up in `portfolio.json`
3. Fills in hero, trailer (YouTube facade → iframe on click, with persistent "Ver en YouTube" fallback link; tabs if both `trailer_youtube` and `full_video_youtube` exist), synopsis, technical sheet, project team, gallery
4. Gallery photos open in a lightbox with prev/next arrows, keyboard navigation (ArrowLeft/ArrowRight), and touch swipe
5. Hero back button uses `document.referrer` to return to the previous page (falls back to `index.html#portafolio`)
6. Injects `VideoObject` schema in `<head>` for SEO

### Portfolio Listing (`portfolio/index.html`)

Loads `shared.js` + `portfolio-index.js`. Renders **all** projects with category filters via `UMD.renderFilterableGrid()` + `UMD.buildPortfolioCard()`.

### Artists (`artists/index.html`)

Loads `shared.js` + `artists.js`. Merges two sources into one filterable list:

- `team.json` entries with `represented_artist: true` (clickable → `team/[id].html`)
- All of `artists.json` (external, non-clickable, Instagram link when available)

### Equipment (`equipment/index.html`)

Loads `shared.js` + `equipment.js`.
Dynamically generates category filters from data and renders equipment cards.

---

## 4. Page Loading Flow

```cmd
User opens team/alejandro-luque.html
  ↓
Browser loads HTML (empty structure)
  ↓
Browser loads shared.js → exposes window.UMD (utilities)
  ↓
Browser loads team.js
  ↓
DOMContentLoaded fires:
  ↓
  Promise.all([
    fetch('data/config.json'),
    fetch('data/team.json'),
    fetch('data/portfolio.json')
  ])
  ↓
  renderNav(config)    → fills <header id="nav">, caches config.ui_strings for
                          burger/theme-toggle aria-labels
  renderFooter(config) → fills <footer id="footer">
  renderFAB(config)    → updates WhatsApp button href
  ↓
  Finds member = team.find(m => m.id === "alejandro-luque")
  ↓
  Fills: profileHero, profileBio, profileSocials, profileFicha
  Conditional: profilePhotos (if photos_extra.length > 0)
  Conditional: profileProjects (if there are cross-referenced projects)
  ↓
  initReveal() → IntersectionObserver activates entrance animations
```

---

## 5. How to Update Content

### ➕ Add a Team Member

1. Open `data/team.json`
2. Copy one of the existing objects and edit the fields
3. Assign a unique `id` in lowercase with hyphens: `"maria-garcia"`
4. Place the photo at `assets/team/maria-garcia/cover.avif`
5. Run: `node generate-pages.js`
6. Upload `team/maria-garcia.html` + the photo to Hostinger

### ➕ Add a Portfolio Project

1. Open `data/portfolio.json`
2. Add a new object with `id`, `title`, `category`, `thumb`, etc.
3. Place the thumbnail at `assets/portfolio/[id]/cover.avif`
4. Run: `node generate-pages.js`
5. Upload `portfolio/[id].html` + the image to Hostinger

### ➕ Add Rental Equipment

1. Open `data/equipment.json`
2. Copy the `equipo-placeholder` template entry and fill in the fields
3. Place the photo under `assets/equipment/[category]/[name].avif`
4. No `generate-pages.js` run needed — `equipment/index.html` reads the JSON directly, no per-item page is generated

### ➕ Add an External Represented Artist

1. Open `data/artists.json`
2. Add a new object (see schema in [section 2](#2-data-architecture))
3. If the person is already in `team.json`, set `represented_artist: true` there instead — do not duplicate them in `artists.json`

### ✏️ Edit Home Page Text

Hero, About Us, section headers, CTA band, and contact form labels all live in `data/home.json` — **do not** hardcode text back into `index.html`. Search `home.json` by top-level key (`hero`, `about`, `services`, `portfolio`, `team`, `cta_band`, `contact`).

### ✏️ Edit Shared UI Text (nav, footer, filter labels, 404 messages)

These live in `data/config.json` → `ui_strings`. See [section 10](#10-ui-strings-ui_strings) before editing — some keys are shared across multiple pages.

### 🎨 Change Colors

Open `css/style.css`. All CSS variables are at the top of the file:

```css
:root {
  --red:        #c0202a;   ← Main accent color
  --red-light:  #e02d38;   ← Hover and emphasis
  --black:      #080808;   ← Main background
  /* ... */
}
```

### 🖼️ Change the Logo

1. Replace `assets/logo/logo-umd-films.svg` with the new file (same name)
2. Or update the path in `data/config.json` → `brand.logo`

### 📞 Change the WhatsApp Number

Edit `data/config.json` → `contact.whatsapp`. The change propagates across the entire site, including the equipment inquiry message template in `ui_strings.equipment_extra.whatsapp_msg_template`.

---

## 6. Generating New Pages

Each time you add a member or project to the JSON, run:

```bash
# From the project root umdfilms/
node generate-pages.js
```

This automatically generates the individual HTML files. **Only requires Node.js installed.**

If you don't have Node.js:

- Download from https://nodejs.org (LTS version)
- Or install with: `winget install OpenJS.NodeJS` (Windows)

---

## 7. Auto-calculated Stats

The "About Us" section stats are calculated in `js/main.js` as follows:

```js
// Dynamic — updates automatically when you change the JSON
stats.projects = portfolio.length          // Counts entries in portfolio.json
stats.team     = team.length               // Counts entries in team.json

// Semi-automatic — updates every year without any changes
const currentYear   = new Date().getFullYear()
stats.years         = currentYear - config.brand.founded_year   // 2026 - 2019 = 7

// Static from config.json
stats.location = config.schema.address_locality    // "Málaga"
```

**To change the years of experience**: edit `brand.founded_year` in `data/config.json`. The calculation is automatic.

---

## 8. SEO Implementation

### Meta Tags Architecture

Meta tags have **two layers**: HTML templates with static placeholders (for crawlers that don't execute JS), and JS that overwrites them with dynamic values from the JSON.

### On All Pages

- Unique `<title>` — pre-filled by `generate-pages.js`, overwritten by JS
- Unique `<meta name="description">` — same flow
- Dynamic `<link rel="canonical">` by JS
- Complete Open Graph: `og:title`, `og:description`, `og:image` (absolute URL), `og:url`, `og:site_name`, `og:type`, `og:locale`
- Twitter Card (`summary_large_image`): `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- HTML5 semantic tags: `<header>`, `<main>`, `<section>`, `<article>`, `<footer>`
- Single `<h1>` per page
- Descriptive `alt` on all images
- `loading="lazy"` on images outside the initial viewport
- **All page titles and meta descriptions are in Spanish**, matching the rest of the site. (Historical note: `equipment.js` briefly overwrote `<title>`/`og:description` in English at runtime, overriding the correct Spanish fallback already present in `equipment/index.html`'s static HTML. Fixed — see `CONTEXT.md` changelog.)

### On Home

- JSON-LD Schema type `LocalBusiness` (injected by `shared.js`)
- Open Graph and Twitter Card with absolute image URL
- "Málaga" in `<h1>`, `<h2>`, and meta description

### On Project Pages

- JSON-LD Schema type `VideoObject` (if there's a real YouTube URL)
- Absolute URL for `thumbnailUrl`

### On Team Pages

- JSON-LD Schema type `Person` with `sameAs` for social networks
- Full profile: name, role, company, photo

### On Equipment Page

- Canonical, Open Graph, and Twitter Card

### Sitemap & Robots

- `sitemap.xml` generated by `generate-pages.js` — run the script after adding/removing entries
- `robots.txt` allows everything, blocks `/v1/` (old version)

### Pending (manual action by Alejandro)

- Optimize Google Business Profile listing
- Get client reviews on Google
- Register the site in directories (Sortlist, Yellow Pages, etc.)

### 301 Redirects When Migrating from WordPress

If URLs change compared to the current WordPress site, add them in Hostinger:

- hPanel → Redirects → Add 301 redirect
- Example: `/contacto/` → `/index.html#contacto`

---

## 9. Accessibility (a11y)

WCAG 2.2 AA compliance. All interactive elements must remain keyboard accessible.

### Implemented Features

| Feature | Location |
|---|---|
| **Skip link** | `<a href="#contenido" class="skip-link">` on all pages — visually hidden, appears on Tab focus |
| **`<main id="contenido">`** | Landmark on all pages |
| **`:focus-visible`** | Red outline on all interactive elements; box-shadow on buttons, filters, theme toggle, FAB |
| **Keyboard navigation** | Team cards, portfolio cards, and linked service cards have `role="link"`, `tabindex="0"`, and Enter/Space handlers |
| **`aria-pressed`** | Filter buttons (portfolio + equipment + artists) announce active state |
| **`aria-label`** | Footer navs distinguished ("Site navigation" / "Social networks"); sections, social links, burger, theme toggle, FAB all labeled — **now in Spanish** (`ui_strings.aria`), was previously hardcoded in English |
| **`aria-hidden="true"`** | Decorative SVGs, hero video, overlay/redline, trust bar marquee, service video preview |
| **Forms** | All inputs have `<label for>` association, `autocomplete`, `aria-invalid` on errors, visible focus ring via `box-shadow` |
| **`prefers-reduced-motion`** | Disables all animations, transitions, scroll-behavior, and trust bar marquee |
| **`prefers-color-scheme`** | Light/dark theme with localStorage persistence; hero/CTA/nav/lightbox/profile-hero/film-hero always dark |
| **External links** | `rel="noopener"` on all `target="_blank"` links |
| **Lightbox** | Escape key closes, close button receives focus on open; prev/next arrow buttons, ArrowLeft/ArrowRight keyboard navigation, touch swipe (50px threshold), counter (`2 / 5`) |
| **Semantic HTML** | `<header>`, `<nav>`, `<main>`, `<footer>`, `<section>` with `aria-label`; `<aside>` for sidebars |

### When Adding New Interactive Elements

1. **Clickable divs/cards**: must have `role="link"`, `tabindex="0"`, `aria-label`, and keydown handler for Enter/Space
2. **Buttons**: prefer native `<button>`; if using divs, add `role="button"` + keyboard handler
3. **Images**: meaningful images get descriptive `alt`; decorative images get `alt=""` + `aria-hidden="true"`
4. **Filters/toggles**: add `aria-pressed="true|false"` and update on click
5. **New sections**: wrap in `<section aria-label="...">` or use `<main>` for primary content
6. **Form inputs**: always pair with `<label for="id">`, add `autocomplete` where applicable
7. **Animations**: respect `prefers-reduced-motion` — either disable or shorten duration

### Testing

- Tab through entire page — every interactive element must receive visible focus
- Enter/Space must activate all clickable cards and buttons
- Screen reader: all images have alt text, all buttons/links have accessible names, landmarks are announced
- Zoom to 200% — layout must not break or overlap

---

## 10. UI Strings (`ui_strings`)

**Purpose:** every piece of UI chrome text that lived hardcoded inside `.js` files (nav labels, footer labels, aria-labels, category filter labels, 404 messages, empty-state placeholders, ficha técnica/perfil field labels, video tab labels) now lives in `data/config.json` → `ui_strings`, so it can be edited without touching code.

**Consumers:**

| `ui_strings` key | Used by | Notes |
|---|---|---|
| `nav` | `shared.js` (`renderNav`, `renderFooter`) | Nav links + footer nav link text |
| `footer` | `shared.js` (`renderFooter`) | "Navegar" / "Redes" / "Desarrollado por" |
| `aria` | `shared.js` (`initNav`, `applyTheme`) | Burger + theme-toggle aria-labels. Cached in a module-level `_ui` variable inside `shared.js`, populated by `renderNav(config)` — if a page never calls `renderNav()`, these fall back to hardcoded Spanish defaults inline in the code. |
| `categorias_equipo` | `equipment.js` | Filter button labels |
| `categorias_portfolio` | `portfolio-index.js` | Filter button labels |
| `tipos_artista` | `artists.js` | Filter button labels ("Equipo UMD" / "Colaboradores externos") |
| `errores_404` | `team.js`, `portfolio.js` | 404 page titles + back-link text (also reused for the normal, non-404 hero back-link) |
| `placeholders` | `team.js`, `portfolio.js` | "Bio/synopsis/video pendiente" empty states |
| `equipment_extra` | `equipment.js` | Button text + WhatsApp inquiry message template. **Not in the original planned schema** — added because the equipment page needed it. |
| `ficha_tecnica` | `portfolio.js` | Technical sheet field labels (Título/Categoría/Año/Duración/Director/Cliente/Tags) |
| `video` | `portfolio.js` | Trailer/full-video tab labels + "Ver en YouTube ↗" |
| `ficha_perfil` | `team.js` | Sidebar info card field labels |

**Known limitation:** `equipment_extra.whatsapp_msg_template` uses `{name}`/`{qty}` placeholders substituted via `String.replace()`, which only replaces the **first** occurrence of each token. If a future edit repeats `{name}` twice in the template, the second occurrence won't substitute. Not a bug today, but a trap if the template is edited carelessly.

---

## 11. Local Development

Modern browsers block `fetch()` with `file://`. You need a local server.

**Option A — VS Code (recommended)**

1. Install the **Live Server** extension (Ritwick Dey)
2. Right-click `index.html` → "Open with Live Server"
3. Open http://localhost:5500

**Option B — Python (no extra install needed)**

```bash
# In the project root folder
python -m http.server 8000
# Open http://localhost:8000
```

**Option C — Node.js**

```bash
npx serve .
# Open http://localhost:3000
```

---

## 12. Deploying to Hostinger

### First Time

1. Hostinger panel (hPanel) → **File Manager** → `public_html` folder
2. Select all project files → Upload
3. Or use FTP with **FileZilla**: host, username, and password in hPanel → FTP Accounts

### Subsequent Updates

Only upload the modified files. If you added a member:

- `data/team.json`
- `team/[new-id].html`
- `assets/team/[id]/[photo].avif`

### Server Structure

```cmd
public_html/          ← hosting root
  ├── index.html
  ├── css/
  ├── js/
  ├── data/
  ├── assets/
  ├── team/
  ├── portfolio/
  ├── artists/
  └── equipment/
```

---

## 13. Scalability & Future Steps

### When You DON'T Need to Change Anything

- Adding team members → just `team.json` + `generate-pages.js`
- Adding projects → just `portfolio.json` + `generate-pages.js`
- Adding rental equipment → just `equipment.json`
- Adding an external represented artist → just `artists.json`
- Changing colors, logo, texts, UI chrome labels → CSS variables / `config.json` / `home.json`

### When You Need to Evolve

| Situation | Solution |
|---|---|
| Alejandro wants to edit alone without touching code | Add **Netlify CMS** or **TinaCMS** (free, on top of static HTML) |
| More than 50 projects and portfolio loads slowly | Add pagination in `main.js` / `portfolio-index.js` |
| They want a blog or news section | Migrate to **Astro** (static generator, reuses all CSS) |
| They want an English version | Migrate to **React/Vite** with i18n — `ui_strings` in `config.json` is already a de-facto i18n dictionary, so this migration has a head start |
| Traffic exceeds 50k visits/month | Put **Cloudflare** (free) in front of Hostinger |

### React Migration (when the time comes)

The structure is already designed for it:

- Each HTML section → a React component
- `data/*.json` → imported directly as modules
- `data/config.json` → `ui_strings` → i18n dictionary
- `css/style.css` / `css/home.css` → kept as global CSS or migrated to Tailwind
- `js/shared.js` → rewritten as hooks (`useConfig`, `useTeam`, etc.)
- `generate-pages.js` → disappears (React Router handles routing)

---

## 14. File Reference

| File | Edit when... | Frequency |
|---|---|---|
| `data/config.json` | Changing logo, phone, social links, founding year, or any `ui_strings` UI text | Medium |
| `data/home.json` | Changing home page text (hero, about, CTA, contact) | Medium |
| `data/team.json` | Adding/editing team members | Medium |
| `data/artists.json` | Adding/editing external represented artists | Rare |
| `data/portfolio.json` | Adding/editing projects | High |
| `data/services.json` | Adding/editing services | Rare |
| `data/partners.json` | Adding/editing trust-bar client logos | Rare |
| `data/equipment.json` | Adding/editing rental equipment | Medium |
| `css/style.css` | Changing color palette, typography, global layout, or anything shared by 2+ pages | Rare |
| `css/home.css` | Changing home-page-only sections | Rare |
| `css/team.css` | Changing member page design | Very rare |
| `css/portfolio.css` | Changing project page design | Very rare |
| `css/equipment.css` | Changing equipment catalog design | Very rare |
| `js/shared.js` | Changing nav, footer, FAB, theme, lightbox, or common utilities | Very rare |
| `js/main.js` | Changing home page behavior | Rare |
| `js/team.js` / `js/team-index.js` | Changing what's shown on member profiles / listing | Rare |
| `js/portfolio.js` / `js/portfolio-index.js` | Changing what's shown on projects / listing | Rare |
| `js/artists.js` | Changing the represented-artists listing page | Rare |
| `js/equipment.js` | Changing equipment catalog behavior | Rare |
| `index.html` | Structural changes only — text lives in `home.json` | Rare |
| `team/template.html` / `portfolio/template.html` | Changing HTML structure of individual pages | Very rare |
| `generate-pages.js` | (do not touch unless structural change) | Never |

---

*UMD Films · Málaga · umdfilms.com*
*Documentation last synced with AGENTS.md/CONTEXT.md in July 2026*
