// artists.js — Representación de Artistas
// Dos fuentes fusionadas: team.json (represented_artist:true) + artists.json (externos)
// Catálogo simple sin páginas individuales para externos.

document.addEventListener('DOMContentLoaded', async () => {

  const [config, team, artists] = await Promise.all([
    UMD.fetchJSON(UMD.rootPath('data/config.json')),
    UMD.fetchJSON(UMD.rootPath('data/team.json')),
    UMD.fetchJSON(UMD.rootPath('data/artists.json'))
  ]);

  const ui = config.ui_strings || {};

  await UMD.renderNav(config);
  await UMD.renderFooter(config);
  UMD.renderFAB();

  document.querySelector('.page-hero .container').insertAdjacentHTML('afterbegin', `
  <a href="${UMD.getBackUrl(UMD.rootPath('index.html') + '#servicios')}" class="page-back-link reveal">
    <svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
    ${config.ui_strings.common.volver}
  </a>`);

  /* ---- SEO ---- */
  document.title = config.seo.title_artists;
  document.querySelector('meta[name="description"]')
    ?.setAttribute('content', config.seo.description_artists);

  UMD.setCanonical(`${config.brand.site_url}/artists/`);
  UMD.setOgMeta('og:title',       config.seo.title_artists);
  UMD.setOgMeta('og:description', config.seo.description_artists);
  UMD.setOgMeta('og:image',       `${config.brand.site_url}/${config.seo.og_image}`);
  UMD.setOgMeta('og:url',         `${config.brand.site_url}/artists/`);
  UMD.setOgMeta('og:type',        'website');
  UMD.setOgMeta('og:site_name',   config.seo.site_name);
  UMD.setTwitterMeta('twitter:card',        'summary_large_image');
  UMD.setTwitterMeta('twitter:title',       config.seo.title_artists);
  UMD.setTwitterMeta('twitter:description', config.seo.description_artists);
  UMD.setTwitterMeta('twitter:image',       `${config.brand.site_url}/${config.seo.og_image}`);


  /* ---- Fusiona las dos fuentes en un solo array con "type" ---- */
  const artistList = [
    ...team.filter(m => m.represented_artist).map(m => ({
      id: m.id,
      name: m.name,
      role: m.role,
      photo: m.photo_cover,
      social: m.social,
      type: 'team'
    })),
    ...artists
      .filter(a => a.id !== 'artista-externo-placeholder') // quita el placeholder de plantilla al ir a producción
      .map(a => ({ ...a, type: 'external' }))
  ];

  /* ---- Filtro: Equipo / Externos ---- */
  const TYPE_LABELS = config.ui_strings?.tipos_artista;

  UMD.renderFilterableGrid({
    items: artistList,
    filterEl: document.getElementById('artistsFilters'),
    gridEl: document.getElementById('artistsGrid'),
    categoryField: 'type',
    labels: TYPE_LABELS,
    cardBuilder: (artist) => buildArtistCard(artist, UMD.rootPath, ui)
  });

  UMD.initReveal();
});

/* ---- Card: solo los de type "team" son clicables (llevan a su perfil) ---- */
function buildArtistCard(artist, rootPathFn, ui) {
  const card = document.createElement('div');
  card.className = 'team-card reveal';
  const clickable = artist.type === 'team';
  const socialStrings = ui?.social || {};
  const cardStrings = ui?.cards || {};

  if (clickable) {
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', (cardStrings.ver_perfil_aria).replace('{name}', artist.name));
  }

  const photoSrc = artist.photo && artist.photo.startsWith('http') ? artist.photo : rootPathFn(artist.photo);

  card.innerHTML = `
    <div class="team-card__img-wrap">
      <img class="team-card__img" src="${photoSrc}"
      onerror="this.onerror=null; this.src='${rootPathFn('assets/artists/placeholder-artist.svg')}';"
      alt="${artist.name} — UMD Films" loading="lazy" />
      ${clickable ? `<span class="team-card__badge">${cardStrings.ver_perfil}</span>` : ''}
    </div>
    <div class="team-card__info">
      <p class="team-card__name">${artist.name}</p>
      <p class="team-card__role">${artist.role}</p>
      ${!clickable && artist.social?.instagram ? `
        <a href="${artist.social.instagram}" class="text-link" target="_blank" rel="noopener"
           onclick="event.stopPropagation()">${socialStrings.instagram} ↗</a>` : ''}
    </div>
  `;

  if (clickable) {
    const go = () => { window.location.href = rootPathFn(`team/${artist.id}.html`); };
    card.addEventListener('click', go);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  }

  return card;
}
