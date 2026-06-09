/**
 * =====================================================
 * shared.js — Utilidades comunes a todas las páginas
 * Carga: antes del JS específico de cada página
 * =====================================================
 */

/* ---- Carga de JSON ---- */
async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`No se pudo cargar ${path}`);
  return res.json();
}

/* ---- Rutas relativas a la raíz desde cualquier subcarpeta ---- */
function rootPath(path) {
  // Detecta si estamos en una subcarpeta (equipo/, portafolio/, material/)
  const depth = window.location.pathname.split('/').filter(Boolean).length - 1;
  const prefix = depth > 0 ? '../'.repeat(depth) : '';
  return prefix + path;
}

/* ---- Reveal on scroll ---- */
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ---- Nav: scroll effect + burger ---- */
function initNav() {
  const nav     = document.getElementById('nav');
  const burger  = document.getElementById('burger');
  const links   = document.getElementById('navLinks');
  if (!nav || !burger || !links) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    links.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      links.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ---- Nav HTML compartido ---- */
async function renderNav(config) {
  const cfg = config || await fetchJSON(rootPath('data/config.json'));
  const logoSrc  = rootPath(cfg.brand.logo);
  const waHref   = `https://wa.me/${cfg.contact.whatsapp}?text=${encodeURIComponent(cfg.contact.whatsapp_msg)}`;

  const nav = document.getElementById('nav');
  if (!nav) return;

  nav.innerHTML = `
    <a href="${rootPath('index.html')}#hero" class="nav__logo" aria-label="${cfg.brand.name}">
      <img src="${logoSrc}" alt="${cfg.brand.logo_alt}" />
    </a>
    <button class="nav__burger" id="burger" aria-label="Abrir menú" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
    <nav class="nav__links" id="navLinks" role="navigation">
      <a href="${rootPath('./index.html')}#nosotros">Quiénes somos</a>
      <a href="${rootPath('./index.html')}#servicios">Servicios</a>
      <a href="${rootPath('./index.html')}#portafolio">Portafolio</a>
      <a href="${rootPath('./index.html')}#equipo">Equipo</a>
      <a href="${rootPath('./material/index.html')}">Material</a>
      <a href="${waHref}" class="nav__cta btn-outline" target="_blank" rel="noopener">Hablemos</a>
    </nav>
  `;

  initNav();
}

/* ---- Footer HTML compartido ---- */
async function renderFooter(config) {
  const cfg = config || await fetchJSON(rootPath('./data/config.json'));
  const footer = document.getElementById('footer');
  if (!footer) return;

  const year    = new Date().getFullYear();
  const logoSrc = rootPath(cfg.brand.logo);

  footer.innerHTML = `
    <div class="container footer__inner">
      <div class="footer__brand">
        <img src="${logoSrc}" alt="${cfg.brand.logo_alt}" class="footer__logo" />
        <p>${cfg.brand.tagline}.<br />Málaga · Alcance nacional.</p>
        <div class="footer__socials">
          ${cfg.social.instagram ? `
          <a href="${cfg.social.instagram}" class="footer__social-icon" target="_blank" rel="noopener" aria-label="Instagram">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </a>` : ''}
          ${cfg.social.youtube ? `
          <a href="${cfg.social.youtube}" class="footer__social-icon" target="_blank" rel="noopener" aria-label="YouTube">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </a>` : ''}
          ${cfg.social.tiktok ? `
          <a href="${cfg.social.tiktok}" class="footer__social-icon" target="_blank" rel="noopener" aria-label="TikTok">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
          </a>` : ''}
        </div>
      </div>
      <nav class="footer__nav">
        <strong>Navegar</strong>
        <a href="${rootPath('./index.html')}#nosotros">Quiénes somos</a>
        <a href="${rootPath('./index.html')}#servicios">Servicios</a>
        <a href="${rootPath('./index.html')}#portafolio">Portafolio</a>
        <a href="${rootPath('./index.html')}#equipo">Equipo</a>
        <a href="${rootPath('./material/index.html')}">Alquiler de material</a>
        <a href="${rootPath('./index.html')}#contacto">Contacto</a>
      </nav>
      <nav class="footer__nav">
        <strong>Redes</strong>
        ${cfg.social.instagram ? `<a href="${cfg.social.instagram}" target="_blank" rel="noopener">Instagram</a>` : ''}
        ${cfg.social.youtube   ? `<a href="${cfg.social.youtube}"   target="_blank" rel="noopener">YouTube</a>` : ''}
        ${cfg.social.tiktok    ? `<a href="${cfg.social.tiktok}"    target="_blank" rel="noopener">TikTok</a>`  : ''}
        <a href="https://wa.me/${cfg.contact.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>
      </nav>
    </div>
    <div class="footer__bottom">
      <p>© ${year} ${cfg.footer.copyright_owner}. Todos los derechos reservados.</p>
      <p>Desarrollado por <a href="${cfg.footer.dev_url}" rel="noopener">${cfg.footer.dev_name}</a> con ayuda de <a href="https://claude.ai" target="_blank" rel="noopener">Claude</a></p>
    </div>
  `;
}

/* ---- FAB WhatsApp ---- */
function renderFAB(config) {
  const wa   = config.contact.whatsapp;
  const msg  = encodeURIComponent(config.contact.whatsapp_msg);
  const fab  = document.querySelector('.fab-wa');
  if (fab) {
    fab.href = `https://wa.me/${wa}?text=${msg}`;
  }
}

/* ---- Schema JSON-LD LocalBusiness ---- */
function injectLocalBusinessSchema(config) {
  const s = config.schema;
  const b = config.brand;
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": b.name,
    "description": config.seo.description_home,
    "url": "https://umdfilms.com",
    "telephone": `+${config.contact.whatsapp}`,
    "email": config.contact.email,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": s.address_locality,
      "addressRegion": s.address_region,
      "addressCountry": s.address_country
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": s.geo_lat,
      "longitude": s.geo_lng
    },
    "priceRange": s.price_range,
    "sameAs": Object.values(config.social).filter(Boolean)
  };

  const tag = document.createElement('script');
  tag.type = 'application/ld+json';
  tag.textContent = JSON.stringify(schema);
  document.head.appendChild(tag);
}

/* ---- Contador animado ---- */
function animateCounter(el, target, duration = 1800) {
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(eased * target);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---- Exportar para uso global ---- */
window.UMD = {
  fetchJSON,
  rootPath,
  initReveal,
  initNav,
  renderNav,
  renderFooter,
  renderFAB,
  injectLocalBusinessSchema,
  animateCounter
};
