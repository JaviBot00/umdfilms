# UMD Films — Contexto de proyecto para continuación de chat

> **Propósito de este documento:** Pasar a un nuevo chat de Claude toda la información necesaria para continuar el desarrollo sin perder contexto. Copia y pega el contenido de este archivo al inicio de la nueva conversación.

---

## ¿Qué es este proyecto?

Rediseño completo de la web de **UMD Films** (https://umdfilms.com/), una productora audiovisual con sede en Málaga fundada en 2019 por Alejandro y Adrián. La web original está en WordPress.

**Personas involucradas:**

- **Alejandro** — Cliente (fundador de UMD Films). Sin conocimientos técnicos. Proporciona los activos (fotos, vídeos, copy) de forma gradual.
- **Javier** — Desarrollador y soporte técnico. Está aprendiendo React. Es quien mantiene el proyecto.
- **Claude** — Co-autor del código. Tiene crédito en el footer.

---

## Stack tecnológico decidido

- **HTML/CSS/JS puro** — sin frameworks, sin build tools, sin dependencias
- **Arquitectura de datos:** JSON separados por sección en `/data/`
- **Hosting:** Hostinger básico (HTML estático, sin backend)
- **Fuentes:** Cormorant Garamond (display) + DM Sans (body) vía Google Fonts
- **Paleta:** Negro `#080808` · Rojo `#c0202a` · Blanco
- **Enfoque estético:** 70% impacto visual cinematográfico / 30% claridad comercial
- **Generador de páginas:** `generate-pages.js` (Node.js, sin dependencias)
- **Servidor local para desarrollo:** Live Server (VS Code) o `python -m http.server 8000`

---

## Estructura de archivos del proyecto

```cmd
umdfilms/
├── index.html
├── equipo/
│   ├── plantilla.html          ← base para todas las páginas de miembro
│   ├── alejandro.html          ← generado por generate-pages.js
│   ├── adrian.html
│   └── ... (13 miembros total)
├── portafolio/
│   ├── plantilla.html
│   ├── cautivo-malaga.html
│   └── ... (6 proyectos actuales, más vendrán)
├── material/
│   └── index.html              ← catálogo de material en alquiler (nuevo)
├── css/
│   ├── style.css               ← estilos globales
│   ├── equipo.css
│   ├── portafolio.css
│   └── material.css
├── js/
│   ├── shared.js               ← window.UMD: fetchJSON, renderNav, renderFooter, etc.
│   ├── main.js                 ← home
│   ├── equipo.js               ← páginas de miembro
│   ├── portafolio.js           ← páginas de proyecto
│   └── material.js             ← catálogo de material
├── data/
│   ├── config.json             ← constantes: marca, contacto, redes, SEO, schema
│   ├── team.json               ← 13 miembros (8 con datos, 5 placeholders)
│   ├── portfolio.json          ← 6 proyectos (todos con datos placeholder)
│   ├── services.json           ← 9 servicios incluyendo alquiler de material
│   └── equipment.json          ← material en alquiler (5 equipos + placeholder)
├── assets/
│   ├── logo/                   ← logo SVG + favicon (pendientes de activos reales)
│   ├── equipo/                 ← fotos del equipo (pendientes de activos reales)
│   ├── portafolio/             ← portadas de proyectos (pendientes)
│   ├── material/               ← fotos de equipos en alquiler (pendientes)
│   └── servicios/              ← vídeos de preview (pendientes)
├── generate-pages.js           ← genera HTML individuales desde los JSON
└── README.md                   ← documentación técnica completa
```

---

## Datos clave del negocio

| Campo | Valor |
|---|---|
| Nombre | UMD Films |
| Sede | Málaga (solo Málaga, no Cádiz como decía la web vieja) |
| Alcance | Nacional |
| Fundación | 2019 (→ 2026 = 7 años) |
| Equipo | 13 personas |
| Proyectos realizados | ~50 |
| WhatsApp | 34675185198 |
| Instagram | https://www.instagram.com/umdfilms/ |
| YouTube | https://www.youtube.com/@UMDFilmsoficial |

---

## Cómo funciona la arquitectura de datos

### Estadísticas calculadas dinámicamente en `main.js`

```js
stats.proyectos = portfolio.length                              // del array
stats.equipo    = team.length                                   // del array
stats.años      = new Date().getFullYear() - config.brand.founded_year  // automático
stats.sede      = config.schema.address_locality               // "Málaga"
```

### Páginas dinámicas (una plantilla → N páginas)

- `equipo/alejandro.html` carga `equipo.js`, que lee el nombre del archivo → busca `id: "alejandro"` en `team.json` → rellena toda la página
- `portafolio/cautivo-malaga.html` carga `portafolio.js` → busca en `portfolio.json` → rellena ficha técnica + tráiler YouTube + equipo participante + galería

### Cómo añadir contenido nuevo

1. Editar el JSON correspondiente
2. Ejecutar `node generate-pages.js` (genera los HTML)
3. Subir a Hostinger

---

## Decisiones de diseño tomadas

| Decisión | Justificación |
|---|---|
| Paleta roja en vez de dorada | Petición del cliente |
| "Málaga" en `<em>` (rojo) en el h2 de Nosotros | Petición del cliente |
| `stats.años` calculado desde `founded_year` | Se actualiza solo cada año |
| `stats.proyectos` = `portfolio.length` | Se actualiza al añadir proyectos al JSON |
| Una plantilla HTML → N páginas via JS | Mantenimiento centralizado |
| Nav y footer renderizados por JS | Compartidos entre todas las páginas sin duplicar HTML |
| Formulario de contacto → WhatsApp | Sin backend; los datos se pasan como texto en la URL de WA |
| Schema `LocalBusiness` en home | SEO local Málaga |
| Schema `VideoObject` en páginas de proyecto | SEO para vídeos en Google |
| `generate-pages.js` en Node.js puro (sin dependencias) | No requiere `npm install` |
| Iconos sociales SVG inline | Sin dependencia de librerías de iconos |
| Grain overlay en CSS puro | Textura cinematográfica sin imagen adicional |

---

## Pendiente (activos que Alejandro debe proporcionar)

- [ ] **Logo nuevo** (SVG o PNG) → reemplaza `assets/logo/logo-umd-films.svg`
- [ ] **Favicon** → `assets/logo/favicon.ico` y `assets/logo/favicon.svg`
- [ ] **Fotos del equipo** (13 personas) → `assets/equipo/[id]-cover.webp` (ratio 3:4)
- [ ] **Portadas de proyectos** → `assets/portafolio/[id]-thumb.webp` (ratio 16:9)
- [ ] **Fotos de equipos en alquiler** → `assets/material/[id].webp` (ratio 4:3)
- [ ] **Bios del equipo** → campo `bio` en `data/team.json`
- [ ] **URLs de YouTube reales** → campo `trailer_youtube` en `data/portfolio.json`
- [ ] **Sinopsis de proyectos** → campo `synopsis` en `data/portfolio.json`
- [ ] **Info de material en alquiler** (nombres, cantidad, descripción) → `data/equipment.json`
- [ ] **Instagram de cada miembro** → campo `social.instagram` en `data/team.json`

---

## Lo que ya está resuelto

- ✅ Bug hamburguesa móvil (menú se cortaba) — reescrito con `transform: translateX` en lugar de `display:none`
- ✅ Paleta roja (rojo `#c0202a`, antes era dorado)
- ✅ "Málaga" en rojo en sección Nosotros
- ✅ Estadísticas calculadas desde arrays (no hardcodeadas)
- ✅ Concepto "cartelera de cine" para proyectos (ficha técnica, tráiler, sinopsis, créditos)
- ✅ Concepto "cartelera" para equipo (perfil completo, fotos, proyectos en los que participa)
- ✅ Página de material en alquiler
- ✅ SEO: schema LocalBusiness + VideoObject + meta únicas por página
- ✅ Nav y footer compartidos y renderizados dinámicamente desde config.json
- ✅ Iconos sociales SVG inline en footer
- ✅ Copyright con autoría de Javier + Claude
- ✅ Favicon placeholder
- ✅ Formulario → WhatsApp
- ✅ FAB WhatsApp dinámico desde config.json
- ✅ Grain cinematográfico en CSS
- ✅ CSS separado por sección (style, equipo, portafolio, material)
- ✅ JSON separados por sección (config, team, portfolio, services, equipment)
- ✅ Generador de páginas `generate-pages.js`
- ✅ Hero: texto más visible con overlay multicapa y text-shadow
- ✅ Logo más prominente en nav
- ✅ Años se calculan automáticamente cada año

---

## SEO: resumen del estado

**Implementado en código:**

- Schema JSON-LD `LocalBusiness` (home)
- Schema JSON-LD `VideoObject` (páginas de proyecto con YouTube)
- Meta description única por página
- `<title>` único por página
- `<link rel="canonical">` en home y material
- Alt descriptivos con "UMD Films" y "Málaga"
- HTML semántico: `<header>`, `<main>`, `<section>`, `<footer>`, `<article>`
- Un solo `<h1>` por página
- "Málaga" en `<h1>` de la home
- `loading="lazy"` + `preload="none"` en vídeo hero
- Open Graph + Twitter Card en home

**Pendiente (acción de Alejandro, no de código):**

- Ficha Google Business Profile optimizada
- Reseñas de clientes en Google
- Directorios: Sortlist, Páginas Amarillas
- Redirecciones 301 en Hostinger si las URLs del WordPress cambian

---

## Próximos pasos sugeridos

En orden de prioridad:

1. **Rellenar activos** — Alejandro proporciona fotos, vídeos, textos. Javier los mete en los JSON y ejecuta `generate-pages.js`.
2. **Preview en local** — Javier verifica con Live Server antes de subir
3. **Subida a Hostinger** — File Manager o FTP
4. **Redirecciones 301** — Si las URLs de WordPress cambian
5. **Google Business Profile** — Alejandro lo optimiza
6. **Test de velocidad** — Google PageSpeed Insights (debería salir 90+)
7. **Futura migración a React/Vite** — Cuando Javier esté cómodo con React. La arquitectura de datos (JSON) se reutiliza íntegramente.

---

*Contexto generado en Junio 2026 · Conversación UMD Films v2*
