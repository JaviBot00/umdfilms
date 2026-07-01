/**
 * =====================================================
 * material.js — Catálogo de material en alquiler
 *
 * Cómo funciona:
 *   - Carga equipment.json
 *   - Renderiza las tarjetas de equipos con cantidad, categoría y specs
 *   - Filtros por categoría (calculados dinámicamente desde los datos)
 *   - CTA de contacto por WhatsApp para cada equipo
 *
 * Para añadir un equipo:
 *   Editar data/equipment.json y añadir una entrada al array.
 *   La página se actualiza sola.
 * =====================================================
 */

document.addEventListener('DOMContentLoaded', async () => {

  /* ---- Carga de datos ---- */
  const [config, equipment] = await Promise.all([
    UMD.fetchJSON(UMD.rootPath('data/config.json')),
    UMD.fetchJSON(UMD.rootPath('data/equipment.json'))
  ]);

  /* ---- Nav + Footer + FAB ---- */
  await UMD.renderNav(config);
  await UMD.renderFooter(config);
  UMD.renderFAB(config);

  /* ---- SEO ---- */
  document.title = 'Alquiler de Material | UMD Films Málaga';
  document.querySelector('meta[name="description"]')
    ?.setAttribute('content', 'Alquila material de cine profesional en Málaga. Cámaras, iluminación, sonido y más. UMD Films Málaga.');

  // Canonical dinámico
  const canonical = document.querySelector('link[rel="canonical"]')
    || Object.assign(document.createElement('link'), { rel: 'canonical' });
  canonical.href = `${config.brand.site_url}/material/`;
  if (!canonical.parentNode) document.head.appendChild(canonical);

  // Open Graph
  const setMeta = (prop, content) => {
    let el = document.querySelector(`meta[property="${prop}"]`);
    if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el); }
    el.setAttribute('content', content);
  };
  setMeta('og:title',       document.title);
  setMeta('og:description', 'Alquila material de cine profesional en Málaga. Cámaras, iluminación, sonido y más.');
  setMeta('og:url',         `${config.brand.site_url}/material/`);
  setMeta('og:site_name',   'UMD Films');

  // Twitter Card
  const setTwitter = (name, content) => {
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
    el.setAttribute('content', content);
  };
  setTwitter('twitter:card',        'summary_large_image');
  setTwitter('twitter:title',       document.title);
  setTwitter('twitter:description', 'Alquila material de cine profesional en Málaga. Cámaras, iluminación, sonido y más.');

  /* ---- FILTROS: generados dinámicamente desde las categorías existentes ---- */
  const filtersEl = document.getElementById('materialFilters');
  const categories = ['all', ...new Set(equipment.map(e => e.category))];

  const CATEGORY_LABELS = {
    all:         'Todo',
    camara:      'Cámara',
    audio:       'Audio',
    iluminacion: 'Iluminación',
    soporte:     'Soporte',
    otro:        'Otro'
  };

  if (filtersEl) {
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className   = `filter${cat === 'all' ? ' active' : ''}`;
      btn.dataset.filter = cat;
      btn.textContent = CATEGORY_LABELS[cat] || cat;
      filtersEl.appendChild(btn);
    });

    filtersEl.querySelectorAll('.filter').forEach(btn => {
      btn.addEventListener('click', () => {
        filtersEl.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderGear(btn.dataset.filter);
      });
    });
  }

  /* ---- GRID DE EQUIPOS ---- */
  const grid = document.getElementById('materialGrid');

  function renderGear(filter) {
    const items = filter === 'all'
      ? equipment
      : equipment.filter(e => e.category === filter);

    grid.innerHTML = '';

    // Filtrar placeholders marcados como no disponibles sin foto real
    const visible = items.filter(e => e.name !== 'Nombre del equipo');

    visible.forEach((gear, i) => {
      const card = document.createElement('div');
      card.className = `gear-card${!gear.available ? ' gear-card--unavailable' : ''}`;
      card.style.transitionDelay = `${i * 0.06}s`;

      const waMsg = encodeURIComponent(
        `Hola, me interesa alquilar: ${gear.name} (x${gear.quantity}). ¿Está disponible?`
      );
      const waHref = `https://wa.me/${config.contact.whatsapp}?text=${waMsg}`;

      card.innerHTML = `
        <div class="gear-card__img-wrap">
          <img class="gear-card__img"
               src="${UMD.rootPath(gear.photo)}"
               alt="${gear.name} — UMD Films Málaga alquiler material"
               loading="lazy"
               onerror="this.onerror=null; this.src='${UMD.rootPath('assets/material/placeholder-gear.webp')}'" />
          <span class="gear-card__qty">×${gear.quantity}</span>
          ${!gear.available ? '<span class="gear-card__unavailable-badge">No disponible</span>' : ''}
        </div>
        <div class="gear-card__body">
          <p class="gear-card__cat">${CATEGORY_LABELS[gear.category] || gear.category}</p>
          <h3 class="gear-card__name">${gear.name}</h3>
          <p class="gear-card__desc">${gear.description || ''}</p>
          ${gear.specs?.length ? `
          <div class="gear-card__specs">
            ${gear.specs.map(s => `<span class="gear-spec">${s}</span>`).join('')}
          </div>` : ''}
          ${gear.available ? `
          <a href="${waHref}" class="btn btn-outline" target="_blank" rel="noopener"
             style="font-size:0.75rem;padding:0.6em 1.4em">
            Consultar disponibilidad
          </a>` : `
          <span class="btn btn-ghost" style="font-size:0.75rem;padding:0.6em 1.4em;opacity:0.4;cursor:not-allowed">
            No disponible
          </span>`}
        </div>
      `;

      grid.appendChild(card);
    });

    /* Reveal con IntersectionObserver */
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    grid.querySelectorAll('.gear-card').forEach(c => obs.observe(c));
  }

  renderGear('all');
  UMD.initReveal();

});
