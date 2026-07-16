/**
 * =====================================================
 * shared.js — Utilidades comunes a todas las páginas
 * Carga: antes del JS específico de cada página
 * =====================================================
 */

/* ---- JSON loading ---- */
async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`No se pudo cargar ${path}`);
  return res.json();
}

/* ---- Relative paths to root from any subfolder ---- */
function rootPath(path) {
  // Calculate the "site root" prefix robustly.
  // Works locally (no subfolder) and on GitHub Pages (/umdfilms/).
  const parts = window.location.pathname.split('/').filter(Boolean);
  const isFile = parts.length > 0 && parts[parts.length - 1].includes('.');
  const folders = isFile ? parts.slice(0, -1) : parts;

  // Go up as many levels as there are folders above the project root
  // Local: /index.html → folders=[] → prefix=''
  // GH Pages: /umdfilms/index.html → folders=['umdfilms'] → prefix='../'  ← PROBLEM
  // Solution: detect repo name and exclude it from the count
  const knownSubfolders = ['team', 'portfolio', 'equipment', 'artists'];
  const depth = folders.filter(f => knownSubfolders.includes(f)).length;

  return depth > 0 ? '../'.repeat(depth) + path : path;
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
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
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

/* ---- Light / dark theme ---- */
function getStoredTheme() {
  return localStorage.getItem('umd-theme');
}

function getPreferredTheme() {
  const stored = getStoredTheme();
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'light' ? 'dark' : 'light';
  localStorage.setItem('umd-theme', next);
  applyTheme(next);
}

function initTheme() {
  applyTheme(getPreferredTheme());

  const btn = document.getElementById('themeToggle');
  if (btn) btn.addEventListener('click', toggleTheme);

  // If user hasn't manually chosen, follow system changes
  if (!getStoredTheme()) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
      if (!getStoredTheme()) applyTheme(e.matches ? 'light' : 'dark');
    });
  }
}

/* ---- Image lightbox ---- */
function initLightbox(selector) {
  const images = document.querySelectorAll(selector);
  if (!images.length) return;

  let lightbox = document.getElementById('umdLightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.id = 'umdLightbox';
    lightbox.innerHTML = `
      <button class="lightbox__close" type="button" aria-label="Close">
        <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      <img src="" alt="" />
    `;
    document.body.appendChild(lightbox);

    const closeLightbox = () => {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    };
    lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  const imgEl = lightbox.querySelector('img');
  images.forEach(img => {
    img.addEventListener('click', () => {
      imgEl.src = img.src;
      imgEl.alt = img.alt;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      lightbox.querySelector('.lightbox__close').focus();
    });
  });
}

/* ---- Shared nav HTML ---- */
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
    <button class="nav__burger" id="burger" aria-label="Open menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
    <nav class="nav__links" id="navLinks" role="navigation">
      <a href="${rootPath('index.html')}#nosotros">Quiénes somos</a>
      <a href="${rootPath('index.html')}#servicios">Servicios</a>
      <a href="${rootPath('index.html')}#portafolio">Portafolio</a>
      <a href="${rootPath('index.html')}#equipo">Equipo</a>
      <a href="${rootPath('equipment/index.html')}">Material</a>
      <a href="${waHref}" class="nav__cta btn-outline" target="_blank" rel="noopener">Hablemos</a>
      <button class="theme-toggle" id="themeToggle" type="button" aria-label="Switch theme">
        <svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>
        </svg>
        <svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
        </svg>
      </button>
    </nav>
  `;

  initNav();
  initTheme();
}

/* ---- Shared footer HTML ---- */
async function renderFooter(config) {
  const cfg = config || await fetchJSON(rootPath('data/config.json'));
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
            <span class="icon icon-instagram" aria-hidden="true"></span>
          </a>` : ''}
          ${cfg.social.youtube ? `
          <a href="${cfg.social.youtube}" class="footer__social-icon" target="_blank" rel="noopener" aria-label="YouTube">
            <span class="icon icon-youtube" aria-hidden="true"></span>
          </a>` : ''}
          ${cfg.social.tiktok ? `
          <a href="${cfg.social.tiktok}" class="footer__social-icon" target="_blank" rel="noopener" aria-label="TikTok">
            <span class="icon icon-tiktok" aria-hidden="true"></span>
          </a>` : ''}
        </div>
      </div>
      <nav class="footer__nav" aria-label="Site navigation">
        <strong>Navegar</strong>
        <a href="${rootPath('index.html')}#nosotros"><span>Quiénes somos</span></a>
        <a href="${rootPath('index.html')}#servicios"><span>Servicios</span></a>
        <a href="${rootPath('index.html')}#portafolio"><span>Portafolio</span></a>
        <a href="${rootPath('index.html')}#equipo"><span>Equipo</span></a>
        <a href="${rootPath('equipment/index.html')}"><span>Alquiler de material</span></a>
        <a href="${rootPath('index.html')}#contacto"><span>Contacto</span></a>
      </nav>
      <nav class="footer__nav" aria-label="Social media">
        <strong>Redes</strong>
        ${cfg.social.instagram ? `<a href="${cfg.social.instagram}" target="_blank" rel="noopener"><span>Instagram</span></a>` : ''}
        ${cfg.social.youtube   ? `<a href="${cfg.social.youtube}"   target="_blank" rel="noopener"><span>YouTube</span></a>` : ''}
        ${cfg.social.tiktok    ? `<a href="${cfg.social.tiktok}"    target="_blank" rel="noopener"><span>TikTok</span></a>`  : ''}
        <a href="https://wa.me/${cfg.contact.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>
      </nav>
    </div>
    <div class="footer__bottom">
      <p>© ${year} ${cfg.footer.copyright_owner}. Todos los derechos reservados.</p>
      <p>Desarrollado por <a href="${cfg.footer.dev_url || '#'}" rel="noopener">${cfg.footer.dev_name}</a></p>
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
    fab.innerHTML = `<span class="icon icon-whatsapp" aria-hidden="true"></span>`;
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
    "url": config.brand.site_url,
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

/* ---- Animated counter ---- */
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

/* ---- YouTube thumbnail fallback chain ---- */
const YT_THUMB_CHAIN = ['maxresdefault', 'hq720', 'sddefault', 'hqdefault'];
const YT_PLACEHOLDER_MAX_WIDTH = 120; // if the thumbnail is smaller than this, it is likely a placeholder

function ytThumbUrl(ytId, level = 0) {
  return `https://img.youtube.com/vi/${ytId}/${YT_THUMB_CHAIN[level]}.jpg`;
}

function ytThumbAdvance(imgEl) {
  const next = parseInt(imgEl.dataset.ytFallback || '0', 10) + 1;
  if (next < YT_THUMB_CHAIN.length) {
    imgEl.dataset.ytFallback = next;
    imgEl.src = ytThumbUrl(imgEl.dataset.ytId, next);
  }
}

// Check if the loaded thumbnail is a placeholder (small width) and advance to the next fallback if so
function ytThumbCheck(imgEl) {
  if (imgEl.naturalWidth <= YT_PLACEHOLDER_MAX_WIDTH) {
    ytThumbAdvance(imgEl);
  }
}

/* ---- Helper: extract YouTube ID from any URL format ---- */
function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];
  for (const re of patterns) {
    const match = url.match(re);
    if (match) return match[1];
  }
  return null;
}

function validYtUrl(url) {
  return url && !url.includes('PLACEHOLDER') && UMD.extractYouTubeId(url);
}

/* ---- Grid genérico con filtros opcionales ---- */
function renderFilterableGrid({ items, filterEl, gridEl, categoryField, labels = {}, allLabel = 'Todo', cardBuilder }) {
  function paint(filter) {
    const filtered = (!categoryField || filter === 'all')
      ? items
      : items.filter(i => i[categoryField] === filter);

    gridEl.innerHTML = '';
    filtered.forEach((item, i) => gridEl.appendChild(cardBuilder(item, i)));

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    gridEl.querySelectorAll('.reveal, .gear-card, .team-card', '.portfolio-card').forEach(c => obs.observe(c));
  }

  if (filterEl && categoryField) {
    const categories = ['all', ...new Set(items.map(i => i[categoryField]))];
    filterEl.innerHTML = '';
    categories.forEach(cat => {
      const btn = document.createElement('button');
      const isActive = cat === 'all';
      btn.className = `filter${isActive ? ' active' : ''}`;
      btn.dataset.filter = cat;
      btn.textContent = cat === 'all' ? allLabel : (labels[cat] || cat);
      btn.setAttribute('aria-pressed', String(isActive));
      filterEl.appendChild(btn);
    });
    filterEl.querySelectorAll('.filter').forEach(btn => {
      btn.addEventListener('click', () => {
        filterEl.querySelectorAll('.filter').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        paint(btn.dataset.filter);
      });
    });
  }

  paint('all');
}

/* ---- Card builders reutilizables ---- */
function buildTeamCard(member, rootPathFn) {
  const card = document.createElement('div');
  card.className = 'team-card';
  card.setAttribute('role', 'link');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `Ver perfil de ${member.name}`);
  card.innerHTML = `
    <div class="team-card__img-wrap">
      <img class="team-card__img" src="${rootPathFn(member.photo_cover)}"
           alt="${member.name} — ${member.role} — UMD Films" loading="lazy" />
      <span class="team-card__badge">Ver perfil ↗</span>
    </div>
    <div class="team-card__info">
      <p class="team-card__name">${member.name}</p>
      <p class="team-card__role">${member.role}</p>
    </div>`;
  const go = () => { window.location.href = rootPathFn(`team/${member.id}.html`); };
  card.addEventListener('click', go);
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  return card;
}

function buildPortfolioCard(proj, rootPathFn) {
  const card = document.createElement('div');
  const trailerId = validYtUrl(proj.trailer_youtube) ? UMD.extractYouTubeId(proj.trailer_youtube) : null;
  const fullId    = validYtUrl(proj.full_video_youtube) ? UMD.extractYouTubeId(proj.full_video_youtube) : null;
  const heroId = trailerId || fullId;
  const thumbSrc = heroId ? UMD.ytThumbUrl(heroId) : (proj.thumb || 'assets/portfolio/placeholder.webp');

  card.className = 'portfolio-card';
  card.setAttribute('role', 'link');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `Ver proyecto: ${proj.title}`);
  card.innerHTML = `
    <img src="${thumbSrc}" data-yt-id="${heroId}" onload="UMD.ytThumbCheck(this)"
        onerror="UMD.ytThumbAdvance(this)" alt="${proj.title} — UMD Films" loading="lazy" />
    <div class="portfolio-card__overlay">
      <p class="portfolio-card__cat">${proj.category} · ${proj.year}</p>
      <p class="portfolio-card__title">${proj.title}</p>
    </div>
    <div class="portfolio-card__play" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24"><path d="m5 3 14 9-14 9z"/></svg>
    </div>`;
  const go = () => { window.location.href = rootPathFn(`portfolio/${proj.id}.html`); };
  card.addEventListener('click', go);
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  return card;
}

/* ---- Export for global use ---- */
window.UMD = {
  fetchJSON,
  rootPath,
  initReveal,
  initNav,
  renderNav,
  renderFooter,
  renderFAB,
  injectLocalBusinessSchema,
  animateCounter,
  initTheme,
  applyTheme,
  toggleTheme,
  initLightbox,
  ytThumbUrl,
  ytThumbAdvance,
  ytThumbCheck,
  extractYouTubeId,
  renderFilterableGrid,
  buildTeamCard,
  buildPortfolioCard
};
