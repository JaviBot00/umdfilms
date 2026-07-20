// shared.js — Utilidades comunes, carga antes del JS específico de cada página

let _ui = null;

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
    burger.setAttribute('aria-label', open
      ? (_ui?.aria?.cerrar_menu)
      : (_ui?.aria?.abrir_menu));
    document.body.style.overflow = open ? 'hidden' : '';

    if (open) {
      const firstLink = links.querySelector('a');
      if (firstLink) firstLink.focus();
      links._trapHandler = (e) => {
        if (e.key !== 'Tab') return;
        const focusable = links.querySelectorAll('a, button');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      };
      document.addEventListener('keydown', links._trapHandler);
    } else if (links._trapHandler) {
      document.removeEventListener('keydown', links._trapHandler);
      links._trapHandler = null;
    }
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
    btn.setAttribute('aria-label', theme === 'light'
      ? (_ui?.aria?.modo_oscuro)
      : (_ui?.aria?.modo_claro));
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

/* ---- Scroll-spy: highlight nav link when section is in view ---- */
function initScrollSpy() {
  const sections = document.querySelectorAll('main > section[id]');
  const links = document.querySelectorAll('.nav__links a[href*="#"]');
  if (!sections.length || !links.length) return;

  const map = new Map();
  links.forEach(link => {
    const id = link.getAttribute('href')?.split('#')[1];
    if (id) map.set(id, link);
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => {
          l.classList.remove('active');
          l.removeAttribute('aria-current');
        });
        const link = map.get(entry.target.id);
        if (link) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'section');
        }
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => obs.observe(s));
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
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', _ui?.aria?.lightbox_dialog);
    lightbox.innerHTML = `
      <button class="lightbox__close" type="button" aria-label="${_ui?.aria?.lightbox_close}">
        <svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
      <button class="lightbox__prev" type="button" aria-label="${_ui?.aria?.lightbox_prev}">
        <svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <button class="lightbox__next" type="button" aria-label="${_ui?.aria?.lightbox_next}">
        <svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
      </button>
      <img src="" alt="" />
      <span class="lightbox__counter"></span>
    `;
    document.body.appendChild(lightbox);

    lightbox._images = [];
    lightbox._index = 0;
    lightbox._trigger = null;

    lightbox._update = () => {
      const { _images: imgs, _index: i } = lightbox;
      if (!imgs.length) return;
      lightbox.querySelector('img').src = imgs[i].src;
      lightbox.querySelector('img').alt = imgs[i].alt;
      lightbox.querySelector('.lightbox__counter').textContent = `${i + 1} / ${imgs.length}`;
    };

    lightbox._navigate = (i) => {
      const len = lightbox._images.length;
      lightbox._index = (i + len) % len;
      lightbox._update();
    };

    const focusableSelector = 'button:not([disabled]), img[tabindex]';
    const getFocusable = () => lightbox.querySelectorAll(focusableSelector);

    const closeLightbox = () => {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      if (lightbox._trigger && lightbox._trigger.isConnected) {
        lightbox._trigger.focus();
      }
      lightbox._trigger = null;
    };

    lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    lightbox.querySelector('.lightbox__prev').addEventListener('click', (e) => {
      e.stopPropagation();
      lightbox._navigate(lightbox._index - 1);
    });
    lightbox.querySelector('.lightbox__next').addEventListener('click', (e) => {
      e.stopPropagation();
      lightbox._navigate(lightbox._index + 1);
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') { closeLightbox(); return; }
      if (e.key === 'ArrowLeft')  lightbox._navigate(lightbox._index - 1);
      if (e.key === 'ArrowRight') lightbox._navigate(lightbox._index + 1);
      if (e.key === 'Tab') {
        const focusable = getFocusable();
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    });

    let touchX = 0;
    lightbox.addEventListener('touchstart', (e) => {
      touchX = e.changedTouches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
      const delta = e.changedTouches[0].clientX - touchX;
      if (Math.abs(delta) > 50) {
        lightbox._navigate(lightbox._index + (delta < 0 ? 1 : -1));
      }
    }, { passive: true });
  }

  const arr = Array.from(images);
  lightbox._images = arr.map(img => ({ src: img.src, alt: img.alt }));
  arr.forEach((img, i) => {
    img.style.cursor = 'zoom-in';
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', _ui?.aria?.lightbox_zoom);
    img.addEventListener('click', () => {
      lightbox._trigger = img;
      lightbox._index = i;
      lightbox._update();
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      lightbox.querySelector('.lightbox__close').focus();
    });
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        lightbox._trigger = img;
        lightbox._index = i;
        lightbox._update();
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
        lightbox.querySelector('.lightbox__close').focus();
      }
    });
  });
}

/* ---- Shared nav HTML ---- */
async function renderNav(config) {
  const cfg = config || await fetchJSON(rootPath('data/config.json'));
  _ui = cfg.ui_strings || {};
  const nav_ = _ui.nav || {};
  const aria = _ui.aria || {};
  const logoSrc  = rootPath(cfg.brand.logo);

  const nav = document.getElementById('nav');
  if (!nav) return;

  nav.innerHTML = `
    <a href="${rootPath('index.html')}#hero" class="nav__logo" aria-label="${cfg.brand.name}">
      <img src="${logoSrc}" alt="${cfg.brand.logo_alt}" />
    </a>
    <button class="nav__burger" id="burger" aria-label="${aria.abrir_menu}" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
    <nav class="nav__links" id="navLinks" aria-label="${aria.main_navigation}">
      <a href="${rootPath('index.html')}#nosotros">${nav_.quienes_somos}</a>
      <a href="${rootPath('index.html')}#servicios">${nav_.servicios}</a>
      <a href="${rootPath('index.html')}#portafolio">${nav_.portafolio}</a>
      <a href="${rootPath('index.html')}#equipo">${nav_.equipo}</a>
      <a href="${rootPath('index.html')}#contacto">${nav_.contacto}</a>
      <button class="theme-toggle" id="themeToggle" type="button" aria-label="${aria.modo_oscuro}">
        <svg aria-hidden="true" class="icon-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
        <svg aria-hidden="true" class="icon-moon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79"/></svg>
      </button>
    </nav>
  `;

  initNav();
  initTheme();
  initScrollSpy();
}

/* ---- Shared footer HTML ---- */
async function renderFooter(config) {
  const cfg = config || await fetchJSON(rootPath('data/config.json'));
  const ft = cfg.ui_strings?.footer || {};
  const footer = document.getElementById('footer');
  if (!footer) return;

  const year    = new Date().getFullYear();
  const logoSrc = rootPath(cfg.brand.logo);

  footer.innerHTML = `
    <div class="container footer__inner">
      <div class="footer__brand">
        <img src="${logoSrc}" alt="${cfg.brand.logo_alt}" class="footer__logo" />
        <p>${cfg.brand.tagline}.<br />${ft.location_line}</p>
        <div class="footer__socials">
          ${cfg.social.instagram ? `
          <a href="${cfg.social.instagram}" class="footer__social-icon" target="_blank" rel="noopener" aria-label="${_ui?.social?.instagram}">
            <span class="icon icon-instagram" aria-hidden="true"></span>
          </a>` : ''}
          ${cfg.social.youtube ? `
          <a href="${cfg.social.youtube}" class="footer__social-icon" target="_blank" rel="noopener" aria-label="${_ui?.social?.youtube}">
            <span class="icon icon-youtube" aria-hidden="true"></span>
          </a>` : ''}
          ${cfg.social.tiktok ? `
          <a href="${cfg.social.tiktok}" class="footer__social-icon" target="_blank" rel="noopener" aria-label="${_ui?.social?.tiktok}">
            <span class="icon icon-tiktok" aria-hidden="true"></span>
          </a>` : ''}
        </div>
      </div>
      <nav class="footer__nav" aria-label="${aria.main_navigation}">
        <strong>${ft.navegar || 'Navegar'}</strong>
        <a href="${rootPath('index.html')}#nosotros"><span>${_ui?.nav?.quienes_somos}</span></a>
        <a href="${rootPath('index.html')}#servicios"><span>${_ui?.nav?.servicios}</span></a>
        <a href="${rootPath('index.html')}#portafolio"><span>${_ui?.nav?.portafolio}</span></a>
        <a href="${rootPath('index.html')}#equipo"><span>${_ui?.nav?.equipo}</span></a>
        <a href="${rootPath('index.html')}#contacto"><span>${_ui?.nav?.contacto}</span></a>
      </nav>
      <nav class="footer__nav" aria-label="${_ui?.social?.instagram ? (_ui.social.instagram + ' · ' + (_ui.social.youtube)) : 'Social media'}">
        <strong>${ft.redes || 'Redes'}</strong>
        ${cfg.social.instagram ? `<a href="${cfg.social.instagram}" target="_blank" rel="noopener"><span>${_ui?.social?.instagram}</span></a>` : ''}
        ${cfg.social.youtube   ? `<a href="${cfg.social.youtube}"   target="_blank" rel="noopener"><span>${_ui?.social?.youtube}</span></a>` : ''}
        ${cfg.social.tiktok    ? `<a href="${cfg.social.tiktok}"    target="_blank" rel="noopener"><span>${_ui?.social?.tiktok}</span></a>`  : ''}
        <a href="https://wa.me/${cfg.contact.whatsapp}" target="_blank" rel="noopener">${_ui?.social?.whatsapp}</a>
      </nav>
    </div>
    <div class="footer__bottom">
      <p>© ${year} ${cfg.footer.copyright_owner}. ${ft.copyright_suffix}</p>
      <p>${ft.desarrollado_por} <a href="${cfg.footer.dev_url || '#'}" rel="noopener">${cfg.footer.dev_name}</a></p>
    </div>
  `;
}

/* ---- FAB Scroll-to-top ---- */
function renderFAB() {
  const fab = document.querySelector('.fab-top');
  if (!fab) return;
  fab.removeAttribute('href');
  fab.setAttribute('role', 'button');
  fab.innerHTML = '<span class="icon icon-arrow-up" aria-hidden="true"></span>';
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollTo = () => window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  fab.addEventListener('click', scrollTo);
  fab.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollTo();
    }
  });
  const toggle = () => fab.classList.toggle('visible', window.scrollY > 400);
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
}

/* ---- Schema JSON-LD LocalBusiness ---- */
function injectLocalBusinessSchema(config) {
  const s = config.schema;
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": config.brand.name,
    "description": config.seo.description_home,
    "url": config.brand.site_url,
    "image": `${config.brand.site_url}/${config.seo.og_image}`,
    "telephone": `+${config.contact.whatsapp}`,
    "email": config.contact.email,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": s.address_locality,
      "addressRegion": s.address_region,
      "addressCountry": s.address_country,
      "streetAddress": s.street_address || undefined,
      "postalCode": s.postal_code || undefined
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
  return url && !url.includes('PLACEHOLDER') && extractYouTubeId(url);
}

/* ---- SEO helpers ---- */
function setCanonical(url) {
  const canonical = document.querySelector('link[rel="canonical"]')
    || Object.assign(document.createElement('link'), { rel: 'canonical' });
  canonical.href = url;
  if (!canonical.parentNode) document.head.appendChild(canonical);
}

function setOgMeta(prop, content) {
  let el = document.querySelector(`meta[property="${prop}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el); }
  el.setAttribute('content', content);
}

function setTwitterMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
  el.setAttribute('content', content);
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
    gridEl.querySelectorAll('.reveal, .gear-card, .team-card, .portfolio-card').forEach(c => obs.observe(c));
  }

  if (filterEl && categoryField) {
    const usedCategories = new Set(items.map(i => i[categoryField]));
    const categories = labels && Object.keys(labels).length
      ? ['all', ...Object.keys(labels).filter(k => usedCategories.has(k))]
      : ['all', ...usedCategories];
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
  card.setAttribute('aria-label', (_ui?.cards?.ver_perfil_aria).replace('{name}', member.name));
  card.innerHTML = `
    <div class="team-card__img-wrap">
      <img class="team-card__img" src="${rootPathFn(member.photo_cover)}"
          onerror="this.onerror=null; this.src='${rootPathFn('assets/team/placeholder-team.svg')}'"
           alt="${member.name} — ${member.role} — UMD Films" loading="lazy" />
      <span class="team-card__badge">${_ui?.cards?.ver_perfil}</span>
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
  if (!proj || !proj.id) return document.createElement('div'); // skip empty or invalid entries
  const card = document.createElement('div');
  const trailerId = validYtUrl(proj.trailer_youtube) ? UMD.extractYouTubeId(proj.trailer_youtube) : null;
  const fullId    = validYtUrl(proj.full_video_youtube) ? UMD.extractYouTubeId(proj.full_video_youtube) : null;
  const heroId = trailerId || fullId;
  const thumbSrc = heroId ? UMD.ytThumbUrl(heroId) : (proj.thumb || 'assets/portfolio/placeholder.svg');

  card.className = 'portfolio-card';
  card.setAttribute('role', 'link');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', (_ui?.cards?.ver_proyecto_aria).replace('{title}', proj.title));
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

/* ---- Back URL based on referrer ---- */
function getBackUrl(fallback) {
  const ref = document.referrer;
  if (ref && ref.startsWith(window.location.origin) && ref !== window.location.href) {
    return ref;
  }
  return fallback;
}

/* ---- Export for global use ---- */
window.UMD = {
  fetchJSON,
  rootPath,
  initReveal,
  renderNav,
  renderFooter,
  renderFAB,
  injectLocalBusinessSchema,
  animateCounter,
  initLightbox,
  ytThumbUrl,
  ytThumbAdvance,
  ytThumbCheck,
  extractYouTubeId,
  validYtUrl,
  setCanonical,
  setOgMeta,
  setTwitterMeta,
  renderFilterableGrid,
  buildTeamCard,
  buildPortfolioCard,
  getBackUrl
};
