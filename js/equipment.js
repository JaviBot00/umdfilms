/**
 * =====================================================
 * equipment.js — Equipment rental catalog
 *
 * How it works:
 *   - Loads equipment.json
 *   - Renders equipment cards with quantity, category and specs
 *   - Category filters (dynamically calculated from data)
 *   - WhatsApp contact CTA for each item
 *
 * To add equipment:
 *   Edit data/equipment.json and add an entry to the array.
 *   The page updates automatically.
 * =====================================================
 */

document.addEventListener('DOMContentLoaded', async () => {

  /* ---- Load data ---- */
  const [config, equipment] = await Promise.all([
    UMD.fetchJSON(UMD.rootPath('data/config.json')),
    UMD.fetchJSON(UMD.rootPath('data/equipment.json'))
  ]);

  const eqStrings = config.ui_strings?.equipment_extra || {};

  /* ---- Nav + Footer + FAB ---- */
  await UMD.renderNav(config);
  await UMD.renderFooter(config);
  UMD.renderFAB();

  document.title = 'Alquiler de Material | UMD Films Málaga';
  document.querySelector('meta[name="description"]')
    ?.setAttribute('content', 'Alquila material audiovisual profesional en Málaga. Cámaras, iluminación, sonido y estabilización.');

  // Dynamic canonical
  const canonical = document.querySelector('link[rel="canonical"]')
    || Object.assign(document.createElement('link'), { rel: 'canonical' });
  canonical.href = `${config.brand.site_url}/equipment/`;
  if (!canonical.parentNode) document.head.appendChild(canonical);

  // Open Graph
  const setMeta = (prop, content) => {
    let el = document.querySelector(`meta[property="${prop}"]`);
    if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el); }
    el.setAttribute('content', content);
  };
  setMeta('og:title',       document.title);
  setMeta('og:description', 'Alquila material audiovisual profesional en Málaga. Cámaras, iluminación, sonido y estabilización.');
  setMeta('og:url',         `${config.brand.site_url}/equipment/`);
  setMeta('og:site_name',   'UMD Films');

  // Twitter Card
  const setTwitter = (name, content) => {
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
    el.setAttribute('content', content);
  };
  setTwitter('twitter:card',        'summary_large_image');
  setTwitter('twitter:title',       document.title);
  setTwitter('twitter:description', 'Alquila material audiovisual profesional en Málaga. Cámaras, iluminación, sonido y estabilización.');

  /* ---- FILTERS: driven by categorias_equipo in config.json ---- */
  const filtersEl = document.getElementById('equipmentFilters');
  const CATEGORY_LABELS = config.ui_strings?.categorias_equipo || {};
  const usedCategories = new Set(equipment.map(e => e.category));
  const categories = Object.keys(CATEGORY_LABELS).filter(k => k === 'all' || usedCategories.has(k));

  if (filtersEl) {
    categories.forEach(cat => {
      const btn = document.createElement('button');
      const isActive = cat === 'all';
      btn.className   = `filter${isActive ? ' active' : ''}`;
      btn.dataset.filter = cat;
      btn.textContent = CATEGORY_LABELS[cat];
      btn.setAttribute('aria-pressed', String(isActive));
      filtersEl.appendChild(btn);
    });

    filtersEl.querySelectorAll('.filter').forEach(btn => {
      btn.addEventListener('click', () => {
        filtersEl.querySelectorAll('.filter').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        renderGear(btn.dataset.filter);
      });
    });
  }

  /* ---- EQUIPMENT GRID ---- */
  const grid = document.getElementById('equipmentGrid');

  function renderGear(filter) {
    const items = filter === 'all'
      ? equipment
      : equipment.filter(e => e.category === filter);

    grid.innerHTML = '';

    // Filter out placeholders marked as unavailable without real photo
    const visible = items.filter(e => e.name !== 'Nombre del equipo');

    visible.forEach((gear, i) => {
      const card = document.createElement('div');
      card.className = `gear-card${!gear.available ? ' gear-card--unavailable' : ''}`;
      card.style.transitionDelay = `${i * 0.06}s`;

      const waMsg = encodeURIComponent(
        (eqStrings.whatsapp_msg_template)
          .replace('{name}', gear.name)
          .replace('{qty}', gear.quantity)
      );
      const waHref = `https://wa.me/${config.contact.whatsapp}?text=${waMsg}`;

      card.innerHTML = `
        <div class="gear-card__img-wrap">
          <img class="gear-card__img"
               src="${UMD.rootPath(gear.photo)}"
               alt="${gear.name} — UMD Films Málaga alquiler material"
               loading="lazy"
               onerror="this.onerror=null; this.src='${UMD.rootPath('assets/equipment/placeholder-gear.webp')}'" />
          <span class="gear-card__qty">×${gear.quantity}</span>
          ${!gear.available ? `<span class="gear-card__unavailable-badge">${eqStrings.no_disponible}</span>` : ''}
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
            ${eqStrings.consultar_disponibilidad}
          </a>` : `
          <span class="btn btn-ghost" style="font-size:0.75rem;padding:0.6em 1.4em;opacity:0.4;cursor:not-allowed">
            ${eqStrings.no_disponible}
          </span>`}
        </div>
      `;

      grid.appendChild(card);
    });

    /* Reveal with IntersectionObserver */
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    grid.querySelectorAll('.gear-card').forEach(c => obs.observe(c));
  }

  renderGear('all');
  UMD.initReveal();

});
