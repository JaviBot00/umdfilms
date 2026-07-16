/**
 * =====================================================
 * artists.js — Representación de Artistas
 *
 * Fuente de datos: dos orígenes fusionados en un solo array
 *   - team.json     -> miembros con represented_artist:true (enlazan a team/[id].html)
 *   - artists.json   -> externos al equipo (sin página propia, solo card + redes)
 *
 * Patrón: catálogo simple sin páginas individuales para externos,
 * igual que equipment.json/equipment.js. No confundir con el patrón
 * de team/[id].html (una página por persona) — eso NO se replica aquí.
 * =====================================================
 */

document.addEventListener('DOMContentLoaded', async () => {

  const [config, team, artists] = await Promise.all([
    UMD.fetchJSON(UMD.rootPath('data/config.json')),
    UMD.fetchJSON(UMD.rootPath('data/team.json')),
    UMD.fetchJSON(UMD.rootPath('data/artists.json'))
  ]);

  await UMD.renderNav(config);
  await UMD.renderFooter(config);
  UMD.renderFAB(config);

  /* ---- SEO ---- */
  document.title = `Representación de Artistas | ${config.seo.site_suffix}`;
  document.querySelector('meta[name="description"]')
    ?.setAttribute('content', 'Representación y gestión de artistas: equipo UMD Films y colaboradores externos. Málaga.');
  const canonical = document.querySelector('link[rel="canonical"]')
    || Object.assign(document.createElement('link'), { rel: 'canonical' });
  canonical.href = `${config.brand.site_url}/artists/`;
  if (!canonical.parentNode) document.head.appendChild(canonical);

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
  const TYPE_LABELS = { team: 'Equipo UMD', external: 'Colaboradores externos' };

  UMD.renderFilterableGrid({
    items: artistList,
    filterEl: document.getElementById('artistsFilters'),
    gridEl: document.getElementById('artistsGrid'),
    categoryField: 'type',
    labels: TYPE_LABELS,
    cardBuilder: (artist) => buildArtistCard(artist, UMD.rootPath)
  });

  UMD.initReveal();
});

/* ---- Card: solo los de type "team" son clicables (llevan a su perfil) ---- */
function buildArtistCard(artist, rootPathFn) {
  const card = document.createElement('div');
  card.className = 'team-card reveal';
  // card.className = `team-card reveal${clickable ? '' : ' team-card--static'}`;
  const clickable = artist.type === 'team';

  if (clickable) {
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Ver perfil de ${artist.name}`);
  }

  const photoSrc = artist.photo && artist.photo.startsWith('http') ? artist.photo : rootPathFn(artist.photo);

  card.innerHTML = `
    <div class="team-card__img-wrap">
      <img class="team-card__img" src="${photoSrc}" alt="${artist.name} — UMD Films" loading="lazy" />
      ${clickable ? '<span class="team-card__badge">↗ Ver perfil</span>' : ''}
    </div>
    <div class="team-card__info">
      <p class="team-card__name">${artist.name}</p>
      <p class="team-card__role">${artist.role}</p>
      ${!clickable && artist.social?.instagram ? `
        <a href="${artist.social.instagram}" class="text-link" target="_blank" rel="noopener"
           onclick="event.stopPropagation()">Instagram ↗</a>` : ''}
    </div>
  `;

  if (clickable) {
    const go = () => { window.location.href = rootPathFn(`team/${artist.id}.html`); };
    card.addEventListener('click', go);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  }

  return card;
}
