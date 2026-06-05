# UMD Films — Documentación del Rediseño Web

## Estructura del proyecto

```cmd
umdfilms/
├── index.html          ← Estructura HTML de la web
├── css/
│   └── style.css       ← Todos los estilos
├── js/
│   ├── data.js         ← ⭐ EDITAR CONTENIDO AQUÍ
│   └── main.js         ← Lógica e interacciones
└── README.md           ← Esta documentación
```

---

## ¿Cómo actualizar el contenido?

### Cambiar textos y secciones

Los textos principales (hero, servicios, about, CTA, footer) están directamente en `index.html`. Busca el comentario de sección correspondiente, por ejemplo:
```html
<!-- ======= HERO ======= -->
```

### Añadir o editar miembros del equipo

Abre `js/data.js` y edita el array `team`:

```js
{
  name: "Nombre Apellido",
  role: "Cargo / Especialidad",
  photo: "URL o ruta relativa a la foto"
}
```

### Añadir o editar proyectos del portafolio

En el mismo `js/data.js`, edita el array `portfolio`:

```js
{
  title: "Nombre del proyecto",
  category: "videoclip",   // videoclip | publicidad | cine | corporativo
  thumb: "URL de la miniatura (16:9 recomendado)",
  url: "https://youtube.com/watch?v=..."
}
```

Los filtros de la sección Portafolio funcionan automáticamente según la `category`.

---

## Funcionalidades incluidas

| Funcionalidad | Descripción |
|---|---|
| **Menú responsive** | Se colapsa en móvil con animación hamburger |
| **Nav con scroll** | Se oscurece al bajar de 60px |
| **Reveal on scroll** | Elementos aparecen al entrar en viewport |
| **Trust bar** | Logos de clientes con animación marquee infinita |
| **Contadores** | Estadísticas se animan al entrar en viewport |
| **Filtros portafolio** | Filtra proyectos por categoría con animación |
| **Preview vídeo** | Hover en servicios muestra preview en desktop |
| **Formulario → WhatsApp** | El form redirige a WhatsApp con el mensaje formateado |
| **FAB WhatsApp** | Botón flotante siempre visible |
| **Año dinámico** | El footer actualiza el año solo |

---

## Colores y tipografía (CSS variables)

En `css/style.css`, al inicio del archivo, están todas las variables:

```css
:root {
  --black:      #0a0a0a;   /* Fondo principal */
  --dark:       #111111;   /* Fondo secciones alternas */
  --gold:       #c9a84c;   /* Color de acento principal */
  --gold-light: #e0c068;   /* Acento más claro (hover, énfasis) */
  --cream:      #f5f0e8;   /* Texto principal */
  --cream-mid:  #d9d2c5;   /* Texto secundario */
  --text-muted: #888888;   /* Texto terciario / placeholders */
}
```

Para cambiar la paleta de colores, solo toca estos valores.

---

## Fuentes

- **Display (títulos):** Cormorant Garamond — elegante, cinematográfica
- **Body (textos):** DM Sans — limpia, legible

Se cargan desde Google Fonts en el `<head>` del HTML. Si quieres cambiarlas, busca esta línea en `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond...
```

---

## Formulario de contacto

El formulario NO envía emails directamente (requeriría backend). En su lugar, al hacer submit redirige al WhatsApp de UMD Films con los datos del formulario pre-rellenados en el mensaje.

Para conectar un backend real en el futuro (ej. Formspree, EmailJS o un servidor propio), edita la función en `js/main.js` en la sección `/* 8. FORMULARIO */`.

---

## SEO — Qué personalizar

En `index.html`, dentro del `<head>`:

```html
<title>UMD Films | Productora Audiovisual en Málaga y Cádiz</title>
<meta name="description" content="..." />
```

Cada página (si se expande a multi-página) debería tener su propio `<title>` y `<description>` únicos.

---

## Próximo paso: migración a React

Este proyecto está pensado para migrar fácilmente a React/Vite:

1. Cada sección del HTML se convierte en un componente (ej. `<Hero />`, `<Services />`, `<Team />`)
2. `js/data.js` se convierte en archivos `.json` o módulos ES
3. Los estilos se pueden mantener como CSS global o migrar a CSS Modules / Tailwind
4. Las interacciones de `main.js` se reescriben con hooks (`useEffect`, `useRef`, `useState`)

La estructura de carpetas sugerida para React:

```cmd
src/
├── components/
│   ├── Nav.jsx
│   ├── Hero.jsx
│   ├── TrustBar.jsx
│   ├── About.jsx
│   ├── Services.jsx
│   ├── Portfolio.jsx
│   ├── Team.jsx
│   ├── Contact.jsx
│   └── Footer.jsx
├── data/
│   ├── team.json
│   └── portfolio.json
├── styles/
│   └── global.css
└── App.jsx
```

---

## Hosting recomendado (gratis)

- **Netlify** — arrastra la carpeta y listo, dominio custom gratuito
- **Vercel** — igual de fácil, muy rápido
- **GitHub Pages** — si el código está en GitHub, se publica automáticamente

---

*Generado como rediseño de referencia para umdfilms.com — Junio 2026*
