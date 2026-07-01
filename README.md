# UMD Films — Documentación Técnica Completa

> Versión 2.0 · Junio 2026  
> Desarrollado por **Javier Botella** con ayuda de **Claude (Anthropic)**

---

## Índice

1. [Estructura del proyecto](#1-estructura-del-proyecto)
2. [Arquitectura de datos](#2-arquitectura-de-datos)
3. [Cómo funciona cada página](#3-cómo-funciona-cada-página)
4. [Flujo de carga de una página](#4-flujo-de-carga-de-una-página)
5. [Cómo actualizar el contenido](#5-cómo-actualizar-el-contenido)
6. [Generar páginas nuevas](#6-generar-páginas-nuevas)
7. [Estadísticas automáticas](#7-estadísticas-automáticas)
8. [SEO implementado](#8-seo-implementado)
9. [Cómo visualizar en local](#9-cómo-visualizar-en-local)
10. [Cómo subir a Hostinger](#10-cómo-subir-a-hostinger)
11. [Escalabilidad y futuros pasos](#11-escalabilidad-y-futuros-pasos)
12. [Referencia de archivos](#12-referencia-de-archivos)

---

## 1. Estructura del proyecto

```cmd
umdfilms/
│
├── index.html                  ← Home (una sola página, todas las secciones)
│
├── equipo/
│   ├── plantilla.html          ← Plantilla base (no abrir directamente)
│   ├── alejandro.html          ← Generado por generate-pages.js
│   ├── adrian.html             ← Generado automáticamente
│   └── [id].html               ← Un archivo por cada miembro del equipo
│
├── portafolio/
│   ├── plantilla.html          ← Plantilla base
│   ├── cautivo-malaga.html     ← Generado automáticamente
│   └── [id].html               ← Un archivo por cada proyecto
│
├── material/
│   └── index.html              ← Catálogo de material en alquiler
│
├── css/
│   ├── style.css               ← Estilos globales (paleta, tipografía, layout, nav, footer...)
│   ├── equipo.css              ← Estilos exclusivos de páginas de miembro
│   ├── portafolio.css          ← Estilos exclusivos de páginas de proyecto
│   └── material.css            ← Estilos exclusivos del catálogo de material
│
├── js/
│   ├── shared.js               ← Utilidades comunes: fetchJSON, renderNav, renderFooter, FAB...
│   ├── main.js                 ← Lógica de la home
│   ├── equipo.js               ← Lógica de páginas de miembro
│   ├── portafolio.js           ← Lógica de páginas de proyecto
│   └── material.js             ← Lógica del catálogo de material
│
├── data/
│   ├── config.json             ← Constantes: marca, contacto, redes, SEO, schema
│   ├── team.json               ← Array de 13 miembros del equipo
│   ├── portfolio.json          ← Array de proyectos (ficha técnica completa)
│   ├── services.json           ← Array de servicios ofrecidos
│   └── equipment.json          ← Array de material disponible en alquiler
│
├── assets/
│   ├── logo/                   ← logo-umd-films.svg, favicon.ico, favicon.svg
│   ├── equipo/                 ← Fotos del equipo (formato recomendado: .webp, 3:4)
│   ├── portafolio/             ← Portadas de proyectos (formato: .webp, 16:9)
│   ├── material/               ← Fotos de equipos en alquiler (formato: .webp, 4:3)
│   └── servicios/              ← Vídeos cortos de preview de servicios (.mp4)
│
└── generate-pages.js           ← Script Node.js para generar los HTML individuales
```

---

## 2. Arquitectura de datos

Toda la información editable de la web vive en `data/`. **Nunca hay que tocar el HTML o el JS** para actualizar contenido habitual.

### `data/config.json`

Constantes globales de la empresa. Se carga en todas las páginas.

| Campo | Descripción | Ejemplo |
|---|---|---|
| `brand.founded_year` | Año de fundación (para calcular los años de trayectoria) | `2019` |
| `brand.logo` | Ruta al logo SVG | `"assets/logo/logo-umd-films.svg"` |
| `contact.whatsapp` | Número sin + ni espacios | `"34675185198"` |
| `social.instagram` | URL completa | `"https://www.instagram.com/umdfilms/"` |
| `footer.dev_name` | Nombre del desarrollador en el copyright | `"Javier Becario"` |

### `data/team.json`

Array de objetos. Cada objeto es un miembro del equipo.

```jsonc
{
  "id": "alejandro",           // ← URL de su página: equipo/alejandro.html
  "name": "Alejandro",
  "surname": "",               // Opcional
  "role": "Co-fundador & Director Creativo",
  "bio": "Texto largo...",
  "photo_cover": "assets/equipo/alejandro-cover.webp",   // ← Foto principal (3:4)
  "photos_extra": ["assets/equipo/alejandro-2.webp"],    // ← Galería adicional
  "social": {
    "instagram": "https://www.instagram.com/...",
    "youtube": ""
  },
  "projects": ["cautivo-malaga"],   // IDs de proyectos en los que participa
  "specialties": ["Dirección", "Producción ejecutiva"],
  "featured": true                  // true = aparece primero
}
```

### `data/portfolio.json`

Array de proyectos. Estilo "ficha de cartelera de cine".

```jsonc
{
  "id": "cautivo-malaga",           // ← URL: portafolio/cautivo-malaga.html
  "title": "Cautivo Málaga",
  "category": "videoclip",         // videoclip | publicidad | cine | corporativo
  "year": 2024,
  "duration_min": 4,
  "director": "Alejandro",
  "client": "Cautivo Málaga",
  "synopsis": "Descripción del proyecto...",
  "thumb": "assets/portafolio/cautivo-malaga-thumb.webp",
  "photos_extra": ["assets/portafolio/cautivo-2.webp"],
  "trailer_youtube": "https://www.youtube.com/watch?v=ID_REAL",
  "team_ids": ["alejandro", "ivan"],   // IDs del equipo que participó
  "tags": ["videoclip", "música"],
  "featured": true
}
```

### `data/equipment.json`

Array de equipos disponibles en alquiler.

```jsonc
{
  "id": "sony-fx3",
  "name": "Sony FX3",
  "category": "camara",           // camara | audio | iluminacion | soporte | otro
  "quantity": 1,                  // Cuántas unidades hay
  "description": "Texto...",
  "specs": ["Full-frame", "4K 120fps"],
  "photo": "assets/material/sony-fx3.webp",
  "price_day": 0,                 // 0 = "consultar". Rellenar si se quiere mostrar precio
  "available": true
}
```

---

## 3. Cómo funciona cada página

### Home (`index.html`)

Carga `shared.js` y `main.js`. El JS:

1. Hace `fetch` paralelo de los 4 JSON
2. Renderiza nav y footer dinámicamente (desde config.json)
3. Duplica logos del trust bar para el marquee
4. Genera las stats calculadas (ver sección 7)
5. Renderiza tarjetas de servicios, portafolio y equipo

### Páginas de equipo (`equipo/[id].html`)

Todas son copias de `equipo/plantilla.html`. Cargan `shared.js` + `equipo.js`.
El JS:

1. Lee el nombre del archivo HTML para obtener el `id` (`alejandro.html` → `"alejandro"`)
2. Busca ese ID en `team.json`
3. Rellena hero, bio, redes, ficha lateral, fotos extra y proyectos

### Páginas de portafolio (`portafolio/[id].html`)

Mismo patrón. Cargan `shared.js` + `portafolio.js`.
El JS:

1. Lee el `id` desde la URL
2. Busca en `portfolio.json`
3. Rellena hero, tráiler (iframe YouTube), sinopsis, ficha técnica, equipo del proyecto, galería
4. Inyecta Schema `VideoObject` en el `<head>` para SEO

### Material (`material/index.html`)

Carga `shared.js` + `material.js`.
Genera filtros por categoría dinámicamente desde los datos y renderiza las tarjetas.

---

## 4. Flujo de carga de una página

```cmd
Usuario abre equipo/alejandro.html
  ↓
Navegador carga HTML (estructura vacía)
  ↓
Navegador carga shared.js → expone window.UMD (utilidades)
  ↓
Navegador carga equipo.js
  ↓
DOMContentLoaded dispara:
  ↓
  Promise.all([
    fetch('data/config.json'),
    fetch('data/team.json'),
    fetch('data/portfolio.json')
  ])
  ↓
  renderNav(config)    → rellena <header id="nav">
  renderFooter(config) → rellena <footer id="footer">
  renderFAB(config)    → actualiza href del botón WhatsApp
  ↓
  Busca member = team.find(m => m.id === "alejandro")
  ↓
  Rellena: profileHero, profileBio, profileSocials, profileFicha
  Condicional: profilePhotos (si photos_extra.length > 0)
  Condicional: profileProjects (si hay proyectos cruzados)
  ↓
  initReveal() → IntersectionObserver activa animaciones de entrada
```

---

## 5. Cómo actualizar el contenido

### ➕ Añadir un miembro al equipo

1. Abre `data/team.json`
2. Copia uno de los objetos existentes y edita los campos
3. Asigna un `id` único en minúsculas con guiones: `"maria-garcia"`
4. Pon la foto en `assets/equipo/maria-garcia-cover.webp`
5. Ejecuta: `node generate-pages.js`
6. Sube `equipo/maria-garcia.html` + la foto a Hostinger

### ➕ Añadir un proyecto al portafolio

1. Abre `data/portfolio.json`
2. Añade un objeto nuevo con el `id`, `title`, `category`, `thumb`, etc.
3. Pon la portada en `assets/portafolio/[id]-thumb.webp`
4. Ejecuta: `node generate-pages.js`
5. Sube `portafolio/[id].html` + la imagen a Hostinger

### ✏️ Editar textos de la home

Los textos del hero, la sección "Nosotros" y el formulario están directamente en `index.html`. Búscalos por el comentario de sección (`<!-- ======= HERO =======`).

### 🎨 Cambiar colores

Abre `css/style.css`. Al principio del archivo están todas las variables CSS:
```css
:root {
  --red:        #c0202a;   ← Color de acento principal
  --red-light:  #e02d38;   ← Hover y énfasis
  --black:      #080808;   ← Fondo principal
  /* ... */
}
```

### 🖼️ Cambiar el logo

1. Sustituye `assets/logo/logo-umd-films.svg` por el nuevo archivo (mismo nombre)
2. O actualiza la ruta en `data/config.json` → `brand.logo`

### 📞 Cambiar el número de WhatsApp

Edita `data/config.json` → `contact.whatsapp`. El cambio se propaga a toda la web.

---

## 6. Generar páginas nuevas

Cada vez que añadas un miembro o un proyecto al JSON, ejecuta:

```bash
# Desde la raíz del proyecto umdfilms/
node generate-pages.js
```

Esto genera automáticamente los HTML individuales. **Solo necesita Node.js instalado.**

Si no tienes Node.js:

- Descarga desde https://nodejs.org (versión LTS)
- O instálalo con: `winget install OpenJS.NodeJS` (Windows)

---

## 7. Estadísticas automáticas

Las estadísticas de la sección "Nosotros" se calculan en `js/main.js` así:

```js
// Dinámico — se actualiza solo cuando cambias los JSON
stats.proyectos = portfolio.length          // Cuenta entradas en portfolio.json
stats.equipo    = team.length               // Cuenta entradas en team.json

// Semi-automático — se actualiza cada año sin tocar nada
const currentYear   = new Date().getFullYear()
stats.años          = currentYear - config.brand.founded_year   // 2026 - 2019 = 7

// Estático desde config.json
stats.sede = config.schema.address_locality    // "Málaga"
```

**Para cambiar los años de trayectoria**: edita `brand.founded_year` en `data/config.json`. El cálculo es automático.

---

## 8. SEO implementado

### Arquitectura de meta tags

Los meta tags tienen **dos capas**: plantillas HTML con placeholders estáticos (para crawlers que no ejecutan JS), y JS que los sobrescribe con valores dinámicos del JSON.

### En todas las páginas

- `<title>` único — pre-llenado por `generate-pages.js`, sobrescrito por JS
- `<meta name="description">` único — mismo flujo
- `<link rel="canonical">` dinámico por JS
- Open Graph completo: `og:title`, `og:description`, `og:image` (URL absoluta), `og:url`, `og:site_name`, `og:type`, `og:locale`
- Twitter Card (`summary_large_image`): `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- Etiquetas semánticas HTML5: `<header>`, `<main>`, `<section>`, `<article>`, `<footer>`
- Un solo `<h1>` por página
- `alt` descriptivo en todas las imágenes
- `loading="lazy"` en imágenes fuera del viewport inicial

### En la home

- Schema JSON-LD tipo `LocalBusiness` (inyectado por `shared.js`)
- Open Graph y Twitter Card con imagen absoluta
- "Málaga" en `<h1>`, `<h2>` y meta description

### En páginas de proyectos

- Schema JSON-LD tipo `VideoObject` (si hay URL de YouTube real)
- `thumbnailUrl` con URL absoluta

### En páginas de equipo

- Schema JSON-LD tipo `Person` con `sameAs` para redes sociales
- Perfil completo: nombre, rol, empresa, foto

### En material

- Canonical, Open Graph y Twitter Card

### Sitemap y robots

- `sitemap.xml` generado por `generate-pages.js` — ejecutar el script tras añadir/eliminar entradas
- `robots.txt` permite todo, bloquea `/v1/` (versión antigua)

### Pendiente (acción manual de Alejandro)

- Optimizar ficha de Google Business Profile
- Conseguir reseñas de clientes en Google
- Registrar la web en directorios (Sortlist, Páginas Amarillas, etc.)

### Redirecciones 301 al migrar desde WordPress

Si las URLs cambian respecto a las del WordPress actual, hay que añadir en Hostinger:

- Panel hPanel → Redirects → Añadir redirección 301
- Ejemplo: `/contacto/` → `/index.html#contacto`

---

## 9. Cómo visualizar en local

Los navegadores modernos bloquean `fetch()` con `file://`. Necesitas un servidor local.

**Opción A — VS Code (recomendada)**

1. Instala la extensión **Live Server** (Ritwick Dey)
2. Clic derecho en `index.html` → "Open with Live Server"
3. Abre http://localhost:5500

**Opción B — Python (sin instalar nada extra)**

```bash
# En la carpeta raíz del proyecto
python -m http.server 8000
# Abre http://localhost:8000
```

**Opción C — Node.js**

```bash
npx serve .
# Abre http://localhost:3000
```

---

## 10. Cómo subir a Hostinger

### Primera vez

1. Panel Hostinger (hPanel) → **File Manager** → carpeta `public_html`
2. Selecciona todos los archivos del proyecto → Upload
3. O usa FTP con **FileZilla**: host, usuario y contraseña en hPanel → FTP Accounts

### Actualizaciones posteriores

Solo sube los archivos modificados. Si añadiste un miembro:

- `data/team.json`
- `equipo/[nuevo-id].html`
- `assets/equipo/[foto].webp`

### Estructura en el servidor

```cmd
public_html/          ← raíz del hosting
  ├── index.html
  ├── css/
  ├── js/
  ├── data/
  ├── assets/
  ├── equipo/
  ├── portafolio/
  └── material/
```

---

## 11. Escalabilidad y futuros pasos

### Cuándo NO necesitas cambiar nada

- Añadir miembros al equipo → solo `team.json` + `generate-pages.js`
- Añadir proyectos → solo `portfolio.json` + `generate-pages.js`
- Añadir material en alquiler → solo `equipment.json`
- Cambiar colores, logo, textos → variables CSS / config.json / index.html

### Cuándo sí hay que evolucionar

| Situación | Solución |
|---|---|
| Alejandro quiere editar solo sin tocar código | Añadir **Netlify CMS** o **TinaCMS** (gratis, encima del HTML estático) |
| Más de 50 proyectos y el portafolio va lento | Añadir paginación en `main.js` |
| Quieren blog o noticias | Migrar a **Astro** (generador estático, reutiliza todo el CSS) |
| Quieren versión en inglés | Migrar a **React/Vite** con i18n |
| Tráfico supera 50k visitas/mes | Poner **Cloudflare** (gratuito) delante de Hostinger |

### Migración a React (cuando llegue)

La estructura ya está pensada para ello:

- Cada sección HTML → un componente React
- `data/*.json` → se importan directamente como módulos
- `css/style.css` → se mantiene como CSS global o se migra a Tailwind
- `js/shared.js` → se reescribe como hooks (`useConfig`, `useTeam`, etc.)
- `generate-pages.js` → desaparece (React Router maneja las rutas)

---

## 12. Referencia de archivos

| Archivo | Tocar para... | Frecuencia |
|---|---|---|
| `data/config.json` | Cambiar logo, teléfono, redes, año fundación | Rara |
| `data/team.json` | Añadir/editar miembros | Media |
| `data/portfolio.json` | Añadir/editar proyectos | Alta |
| `data/services.json` | Añadir/editar servicios | Rara |
| `data/equipment.json` | Añadir/editar material en alquiler | Media |
| `css/style.css` | Cambiar paleta de colores, tipografía, layout global | Rara |
| `css/equipo.css` | Cambiar el diseño de páginas de miembro | Muy rara |
| `css/portafolio.css` | Cambiar el diseño de páginas de proyecto | Muy rara |
| `css/material.css` | Cambiar el diseño del catálogo de material | Muy rara |
| `js/shared.js` | Cambiar nav, footer, FAB o utilidades comunes | Muy rara |
| `js/main.js` | Cambiar comportamiento de la home | Rara |
| `js/equipo.js` | Cambiar qué se muestra en perfiles | Rara |
| `js/portafolio.js` | Cambiar qué se muestra en proyectos | Rara |
| `js/material.js` | Cambiar comportamiento del catálogo | Rara |
| `index.html` | Cambiar textos del hero, nosotros, contacto | Media |
| `equipo/plantilla.html` | Cambiar estructura HTML de perfiles | Muy rara |
| `portafolio/plantilla.html` | Cambiar estructura HTML de proyectos | Muy rara |
| `generate-pages.js` | (no tocar salvo cambio estructural) | Nunca |

---

*UMD Films · Málaga · umdfilms.com*  
*Documentación generada en Junio 2026*
