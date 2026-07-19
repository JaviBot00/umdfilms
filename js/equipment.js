/**
 * =====================================================
 * equipment.js — Equipment rental catalog
 * =====================================================
 */

document.addEventListener('DOMContentLoaded', async () => {

  const [config, equipment] = await Promise.all([
    UMD.fetchJSON(UMD.rootPath('data/config.json')),
    UMD.fetchJSON(UMD.rootPath('data/equipment.json'))
  ]);

  const eqStrings = config.ui_strings?.equipment_extra || {};
  const CATEGORY_LABELS = config.ui_strings?.categorias_equipo || {};

  await UMD.renderNav(config);
  await UMD.renderFooter(config);
  UMD.renderFAB();

  document.title = config.seo.title_equipment;
  document.querySelector('meta[name="description"]')
    ?.setAttribute('content', config.seo.description_equipment);

  UMD.setCanonical(`${config.brand.site_url}/equipment/`);
  UMD.setOgMeta('og:title',       config.seo.title_equipment);
  UMD.setOgMeta('og:description', config.seo.description_equipment);
  UMD.setOgMeta('og:image',       `${config.brand.site_url}/${config.seo.og_image}`);
  UMD.setOgMeta('og:url',         `${config.brand.site_url}/equipment/`);
  UMD.setOgMeta('og:type',        'website');
  UMD.setOgMeta('og:site_name',   config.seo.site_name);
  UMD.setTwitterMeta('twitter:card',        'summary_large_image');
  UMD.setTwitterMeta('twitter:title',       config.seo.title_equipment);
  UMD.setTwitterMeta('twitter:description', config.seo.description_equipment);
  UMD.setTwitterMeta('twitter:image',       `${config.brand.site_url}/${config.seo.og_image}`);

  const visible = equipment.filter(e => e.name !== 'Nombre del equipo');

  UMD.renderFilterableGrid({
    items: visible,
    filterEl: document.getElementById('equipmentFilters'),
    gridEl: document.getElementById('equipmentGrid'),
    categoryField: 'category',
    labels: CATEGORY_LABELS,
    cardBuilder: (gear, i) => buildGearCard(gear, i, config, eqStrings, CATEGORY_LABELS)
  });

  UMD.initReveal();
});

function buildGearCard(gear, i, config, eqStrings, CATEGORY_LABELS) {
  const card = document.createElement('div');
  card.className = `gear-card reveal${!gear.available ? ' gear-card--unavailable' : ''}`;
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
           alt="${gear.name} — ${config.seo.site_suffix} alquiler material"
           loading="lazy"
           onerror="this.onerror=null; this.src='${UMD.rootPath('assets/equipment/placeholder-gear.svg')}'" />
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
      <button class="btn btn-ghost" disabled aria-disabled="true"
         style="font-size:0.75rem;padding:0.6em 1.4em;opacity:0.4;cursor:not-allowed">
        ${eqStrings.no_disponible}
      </button>`}
    </div>
  `;

  return card;
}
