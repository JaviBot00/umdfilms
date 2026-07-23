---
name: design-system
description: Audit the CSS token system and JSON data contracts for consistency. Use when asked to "audit design system", "check hardcoded values", "check token coverage", "check naming consistency", or before adding a new CSS file/section to the site.
license: MIT
metadata:
  author: web-quality-skills
  version: "1.0"
  adapted_for: UMD Films (vanilla HTML/CSS/JS, JSON-driven, CSS custom properties)
---

# Design system audit

This project has no component framework — the "design system" is the set of CSS
custom properties defined in `css/style.css` (`:root`, `html[data-theme="light"]`,
and the permanent dark-pin block for `.hero, .cta-band, .nav, .profile-hero, .film-hero`)
plus the JSON schemas in `data/*.json` that every page-specific JS file (`team.js`,
`portfolio.js`, `equipment.js`, `main.js`) depends on. An audit here means two things:

1. **Token audit** — hardcoded colors/spacing that bypass the CSS variables, so they
   silently break when the theme flips or when a dark-pinned section's palette changes.
2. **Data-contract audit** — cross-references between JSON files (`team_ids` in
   `portfolio.json` ↔ `id` in `team.json`, and vice versa via `projects[]`) that must
   match exactly or the corresponding UI section renders empty with no error.

Both failure modes are silent: nothing throws, nothing 404s, the page just renders
incomplete. That's what makes this audit different from a11y/SEO — those fail loud
enough to notice in a Lighthouse run; these don't.

---

## 1. Token audit (CSS)

### What to grep for

```bash
# Hardcoded rgba/hex that should be a var(--...) instead
grep -rn "rgba(255,255,255" css/
grep -rn "rgba(0,0,0" css/
grep -rn "#[0-9a-fA-F]\{3,6\}" css/ | grep -v ":root\|data-theme\|^Binary"
```

Anything matching outside the `:root` / `[data-theme="light"]` / dark-pin blocks in
`css/style.css` is a candidate for replacement with `var(--line)`, `var(--red-dim)`,
etc. These are the variables currently defined:

| Variable | Purpose |
|---|---|
| `--black`, `--dark`, `--dark-mid`, `--dark-soft` | Background layers |
| `--red`, `--red-light`, `--red-dim`, `--red-glow` | Accent + states |
| `--white`, `--cream`, `--cream-mid`, `--muted` | Text |
| `--line` | Borders (flips between `rgba(255,255,255,0.12)` dark / `rgba(0,0,0,0.1)` light) |
| `--fs-min` | Global minimum font size (0.8rem) — never go below this for legible text |
| `--black-rgb` | RGB components of `--black`, unitless, used to build the `--black-overlay-*` family via `rgba(var(--black-rgb), x)` |

A hardcoded `rgba(255,255,255,0.1)` border will look correct in dark mode and
**disappear or invert oddly in light mode** — it never gets the light-theme flip.
This is the single most common regression in this codebase because every new
section-specific CSS file (`team.css`, `portfolio.css`, `equipment.css`) is written
independently and easy to forget the convention on.

### Output

```markdown
### Token Coverage — css/*.css

| File | Hardcoded colors found | Should be |
|------|------------------------|-----------|
| equipment.css:L94 | rgba(255,255,255,0.1) | var(--line) |
```

---

## 2. Data-contract audit (JSON)

Every cross-reference between JSON files is a plain string match with no validation
layer — a typo is a silent empty section, not an error.

### Contracts to check

| From | Field | Must match | In |
|---|---|---|---|
| `data/portfolio.json` | `team_ids[]` | `id` | `data/team.json` |
| `data/team.json` | `projects[]` | `id` | `data/portfolio.json` |
| `data/services.json` | `link` | actual file path | filesystem |
| `data/partners.json` | `logo` | actual file path | `assets/logo-partners/` |
| `data/equipment.json` | `photo` | actual file path | `assets/equipment/` |

### How to check it (no dependencies, plain Node)

```bash
node -e "
const team = require('./data/team.json').map(m => m.id);
const portfolio = require('./data/portfolio.json');
portfolio.forEach(p => {
  (p.team_ids || []).forEach(id => {
    if (!team.includes(id)) console.log('BROKEN:', p.id, '-> team_id', id, 'not found');
  });
});
const portIds = portfolio.map(p => p.id);
require('./data/team.json').forEach(m => {
  (m.projects || []).forEach(id => {
    if (!portIds.includes(id)) console.log('BROKEN:', m.id, '-> project', id, 'not found');
  });
});
"
```

Run this after every edit to `team.json` or `portfolio.json`, and ideally wire it
into `generate-pages.js` as a pre-flight check that fails loudly instead of letting
`portfolio.js` / `team.js` filter the mismatch into an empty array at runtime.

### Output

```markdown
### Data Contract Audit — data/*.json

| Source file | Field | Bad value | Target file | Fix |
|---|---|---|---|---|
| portfolio.json (cautivo-malaga) | team_ids | "alejandro" | team.json | change to "alejandro-luque" |
```

---

## 3. Naming drift audit (docs vs. code)

This project has documentation (`README.md`, `AGENTS.md`, `CONTEXT.md`, and Claude's
own memory of past sessions) written in different English/Spanish naming passes.
Check that the names used in docs actually match the files on disk before trusting
either as ground truth:

```bash
# Files docs claim exist vs. what's actually in js/
ls js/
grep -oE '\b(equipo|portafolio|material)\.js\b' README.md AGENTS.md CONTEXT.md 2>/dev/null
```

If docs say `equipo.js`/`portafolio.js`/`material.js` but disk has `team.js`/
`portfolio.js`/`equipment.js`, the docs are stale — a renaming pass happened at some
point and the documentation wasn't updated. Low severity (doesn't break the site)
but high cost later: whoever reads `AGENTS.md`/`README.md` first will grep for the
wrong filename.

---

## Priority order for this project

1. **Data-contract audit** — silent broken cross-references are the highest-impact,
   lowest-effort fix (it's a find-and-replace in JSON, not a code change).
2. **Token audit** — run every time a new CSS file is added or an existing one is
   touched, since there's no linter enforcing variable usage.
3. **Naming drift** — fix opportunistically, not urgent.

## When NOT to use this skill

- Don't run it for content changes (adding a team member, a project) — that's covered
  by `generate-pages.js` + the JSON schemas above, not a system audit.
- Don't run it for one-off visual tweaks — this is a periodic health-check, not a
  per-PR gate (there's no CI in this project to enforce it automatically).
