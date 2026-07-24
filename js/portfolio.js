// portfolio.js — Individual project page
// Reads ID from URL filename, loads portfolio.json, fills page dynamically.
// One HTML template serves all projects.

document.addEventListener('DOMContentLoaded', async () => {

  /* ---- Get project ID from URL ---- */
  const projectId = window.location.pathname
    .split('/')
    .pop()
    .replace('.html', '');

  /* ---- Load data ---- */
  const [config, portfolio, team] = await Promise.all([
    UMD.fetchJSON(UMD.rootPath('data/config.json')),
    UMD.fetchJSON(UMD.rootPath('data/portfolio.json')),
    UMD.fetchJSON(UMD.rootPath('data/team.json'))
  ]);

  const ui = config.ui_strings || {};
  const err404 = ui.errores_404 || {};
  const placeholders = ui.placeholders || {};
  const fichaStrings = ui.ficha_tecnica || {};
  const videoStrings = ui.video || {};

  const project = portfolio.find(p => p.id === projectId);

  /* ---- Nav + Footer + FAB ---- */
  await UMD.renderNav(config);
  await UMD.renderFooter(config);
  UMD.renderFAB();

  /* ---- Project not found ---- */
  if (!project || !project.id) {
    document.title = `${err404.proyecto_titulo} — ${config.seo.site_suffix}`;
    document.querySelector('main').innerHTML = `
      <div class="container" style="padding-block:8rem;text-align:center">
        <p class="eyebrow">Error 404</p>
        <h1 class="section-title">${err404.proyecto_titulo}</h1>
        <a href="${UMD.getBackUrl(UMD.rootPath('index.html') + '#portafolio')}" class="btn btn-primary" style="margin-top:2rem">${err404.proyecto_volver}</a>
      </div>`;
    return;
  }

  const trailerId = UMD.validYtUrl(project.trailer_youtube) ? UMD.extractYouTubeId(project.trailer_youtube) : null;
  const fullId    = UMD.validYtUrl(project.full_video_youtube) ? UMD.extractYouTubeId(project.full_video_youtube) : null;
  const heroId = trailerId || fullId;
  const thumbRaw = heroId ? UMD.ytThumbUrl(heroId) : (project.thumb || 'assets/portfolio/placeholder.svg');
  const thumbSrc = thumbRaw.startsWith('http') ? thumbRaw : `${config.brand.site_url}/${thumbRaw}`;

  /* ---- SEO + Schema VideoObject ---- */
  document.title = `${project.title} | ${config.seo.site_suffix}`;
  document.querySelector('meta[name="description"]')
    ?.setAttribute('content', project.synopsis || `${project.title} — ${project.category} producido por ${config.brand.name} en ${project.year}.`);

  UMD.setCanonical(`${config.brand.site_url}/portfolio/${project.id}.html`);

  UMD.setOgMeta('og:title',       document.title);
  UMD.setOgMeta('og:description', project.synopsis || `${project.title} — ${project.category} producido por ${config.brand.name} en ${project.year}.`);
  UMD.setOgMeta('og:image',       `${thumbSrc}`);
  UMD.setOgMeta('og:type',        'video.other');
  UMD.setOgMeta('og:url',         `${config.brand.site_url}/portfolio/${project.id}.html`);
  UMD.setOgMeta('og:site_name',   config.seo.site_name);

  UMD.setTwitterMeta('twitter:card',        'summary_large_image');
  UMD.setTwitterMeta('twitter:title',       document.title);
  UMD.setTwitterMeta('twitter:description', project.synopsis || `${project.title} — ${project.category} producido por ${config.brand.name} en ${project.year}.`);
  UMD.setTwitterMeta('twitter:image',       `${thumbSrc}`);

  // Schema VideoObject for projects with video
  if (trailerId || fullId) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": project.title,
      "description": project.synopsis || `${project.title} por ${config.brand.name}`,
      "thumbnailUrl": thumbSrc,
      "duration": project.duration_min ? `PT${project.duration_min}M` : undefined,
      "director": { "@type": "Person", "name": project.director },
      "productionCompany": { "@type": "Organization", "name": config.brand.name, "url": config.brand.site_url },
      "url": trailerId ? project.trailer_youtube : project.full_video_youtube
    };
    if (trailerId || fullId) {
      schema.embedUrl = `https://www.youtube.com/embed/${trailerId || fullId}`;
    }
    if (!schema.duration) delete schema.duration;
    const tag = document.createElement('script');
    tag.type = 'application/ld+json';
    tag.textContent = JSON.stringify(schema);
    document.head.appendChild(tag);
  }

  /* ---- PROJECT HERO ---- */
  const filmHero = document.getElementById('filmHero');
  if (filmHero) {
    // Móvil: si hay thumb vertical propio, se sirve en <= 600px vía <picture>.
    // Desktop/tablet: se mantiene el frame de YouTube tal como estaba —
    // decisión explícita de no rediseñar film-hero por ahora.
    const thumbIsLocal = !!(project.thumb && project.thumb.trim() !== '');
    const mobileSrc = thumbIsLocal ? UMD.rootPath(project.thumb) : null;

    filmHero.innerHTML = `
      <div class="film-hero__bg">
        <picture>
          ${mobileSrc ? `<source media="(max-width: 700px)" srcset="${mobileSrc}" type="image/avif">` : ''}
          <img src="${thumbSrc}" data-yt-id="${heroId}" onload="UMD.ytThumbCheck(this)"
            onerror="UMD.ytThumbAdvance(this)" loading="eager" decoding="async"
            alt="${project.title}">
        </picture>
      </div>
      <div class="film-hero__overlay" aria-hidden="true"></div>
      <div class="film-hero__content container">
        <a href="${UMD.getBackUrl(UMD.rootPath('index.html') + '#portafolio')}" class="page-back-link reveal">
          <svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
          ${err404.proyecto_volver}
        </a>
        <div class="film-hero__meta reveal d1">
          <span class="film-badge film-badge--cat">${project.category}</span>
          <span class="film-badge film-badge--year">${project.year}</span>
          ${project.duration_min ? `<span class="film-badge film-badge--year">${project.duration_min} min</span>` : ''}
        </div>
        <h1 class="film-hero__title reveal d2">${project.title}</h1>
        <p class="film-hero__client reveal d3">${project.client}</p>
      </div>
    `;
  }

  /* ---- TRAILER / FULL VIDEO ---- */
  const trailerEl = document.getElementById('filmTrailer');

  if (trailerEl) {
    if (!trailerId && !fullId) {
      trailerEl.innerHTML = `
        <div class="film-trailer__placeholder">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4z"/></svg>
          <p>${placeholders.video_pendiente}</p>
        </div>`;
    } else if (trailerId && fullId) {
      // Ambos existen -> tabs
      trailerEl.innerHTML = `
        <div class="video-tabs" role="tablist" aria-label="${ui.aria?.video_tabs}">
          <button role="tab" id="tab-trailer" aria-selected="true" aria-controls="videoPanel">${videoStrings.trailer_tab}</button>
          <button role="tab" id="tab-full" aria-selected="false" tabindex="-1" aria-controls="videoPanel">${videoStrings.completo_tab}</button>
        </div>
        <div class="video-panel" role="tabpanel" id="videoPanel" aria-labelledby="tab-trailer"></div>
      `;
      const panel = trailerEl.querySelector('#videoPanel');
      const tabTrailer = trailerEl.querySelector('#tab-trailer');
      const tabFull     = trailerEl.querySelector('#tab-full');

      renderVideoTab(panel, trailerId, project.title + ' — ' + (videoStrings.trailer_tab));

      function activateTab(tab, other, ytId, label) {
        tab.setAttribute('aria-selected', 'true');
        tab.removeAttribute('tabindex');
        other.setAttribute('aria-selected', 'false');
        other.setAttribute('tabindex', '-1');
        panel.setAttribute('aria-labelledby', tab.id);
        renderVideoTab(panel, ytId, label);
      }
      tabTrailer.addEventListener('click', () => activateTab(tabTrailer, tabFull, trailerId, project.title + ' — ' + (videoStrings.trailer_tab)));
      tabFull.addEventListener('click',    () => activateTab(tabFull, tabTrailer, fullId, project.title + ' — ' + (videoStrings.completo_tab)));

      // Arrow key navigation between tabs
      trailerEl.querySelector('.video-tabs').addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          const isTrailer = e.key === 'ArrowLeft' ? tabTrailer : tabFull;
          const isOther   = e.key === 'ArrowLeft' ? tabFull : tabTrailer;
          const ytId      = e.key === 'ArrowLeft' ? trailerId : fullId;
          const label     = e.key === 'ArrowLeft'
            ? project.title + ' — ' + (videoStrings.trailer_tab)
            : project.title + ' — ' + (videoStrings.completo_tab);
          activateTab(isTrailer, isOther, ytId, label);
          isTrailer.focus();
        }
        if (e.key === 'Home') { e.preventDefault(); activateTab(tabTrailer, tabFull, trailerId, project.title + ' — ' + (videoStrings.trailer_tab)); tabTrailer.focus(); }
        if (e.key === 'End')  { e.preventDefault(); activateTab(tabFull, tabTrailer, fullId, project.title + ' — ' + (videoStrings.completo_tab)); tabFull.focus(); }
      });
    } else {
      // Solo uno de los dos -> sin tabs, directo
      trailerEl.innerHTML = `<div class="video-panel" id="videoPanel"></div>`;
      renderVideoTab(trailerEl.querySelector('#videoPanel'), trailerId || fullId, project.title);
    }
  }

  function renderVideoTab(container, ytId, title) {
    container.innerHTML = `
      <button class="video-facade" aria-label="${ui.video?.play_aria} ${title}">
        <img src="${UMD.ytThumbUrl(ytId)}" data-yt-id="${ytId}" onload="UMD.ytThumbCheck(this)"
            onerror="UMD.ytThumbAdvance(this)" alt="${title}">
        <span class="video-facade__play" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24"><path d="m5 3 14 9-14 9z"/></svg>
        </span>
      </button>
      <a class="video-facade__yt-link" href="https://youtube.com/watch?v=${ytId}"
        target="_blank" rel="noopener">${videoStrings.ver_youtube}</a>
    `;
    container.querySelector('.video-facade').addEventListener('click', function () {
      this.outerHTML = `
        <iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0"
                title="${title}"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"></iframe>`;
    }, { once: true });
  }

  /* ---- SYNOPSIS ---- */
  const synopsisEl = document.getElementById('filmSynopsis');
  if (synopsisEl) {
    synopsisEl.innerHTML = project.synopsis
      ? `<p>${project.synopsis}</p>`
      : `<p style="color:var(--muted);font-style:italic">${placeholders.sinopsis_pendiente}</p>`;
  }

  /* ---- TECHNICAL SHEET ---- */
  const sheetEl = document.getElementById('filmSheet');
  if (sheetEl) {
    const rows = [
      { label: fichaStrings.titulo,    value: project.title },
      { label: fichaStrings.categoria, value: project.category },
      { label: fichaStrings.ano,       value: project.year },
      { label: fichaStrings.duracion,  value: project.duration_min ? `${project.duration_min} min` : '—' },
      { label: fichaStrings.director,  value: project.director || '—' },
      { label: fichaStrings.cliente,   value: project.client || '—' },
    ];

    sheetEl.innerHTML = `
      <div class="film-sheet">
        <div class="film-sheet__header">${fichaStrings.header}</div>
        <div class="film-sheet__body">
          ${rows.map(r => `
            <div class="film-row">
              <span class="film-label">${r.label}</span>
              <span class="film-value">${r.value}</span>
            </div>`).join('')}
          ${project.tags?.length ? `
            <div class="film-row">
              <span class="film-label">${fichaStrings.tags}</span>
              <span class="film-value">${project.tags.join(', ')}</span>
            </div>` : ''}
        </div>
      </div>
    `;
  }

  /* ---- PROJECT TEAM ---- */
  const teamGrid = document.getElementById('filmTeamGrid');
  if (teamGrid && project.team_ids?.length) {
    const memberSection = document.getElementById('filmTeam');

    // Cross-reference project IDs with team array
    const projectTeam = project.team_ids
      .map(id => team.find(m => m.id === id))
      .filter(Boolean);

    if (projectTeam.length) {
      projectTeam.forEach(member => {
        const a = document.createElement('a');
        a.href      = UMD.rootPath(`team/${member.id}.html`);
        a.className = 'film-team-member reveal';
        a.innerHTML = `
          <img src="${UMD.rootPath(member.photo_cover)}"
            onerror="this.onerror=null; this.src='${UMD.rootPath('assets/team/placeholder-icon.svg')}'"
            alt="${member.name}" loading="lazy" />
          <div>
            <p class="film-team-member__name">${member.name}</p>
            <p class="film-team-member__role">${member.role}</p>
          </div>
        `;
        teamGrid.appendChild(a);
      });
    } else {
      memberSection?.style.setProperty('display', 'none');
    }
  } else {
    document.getElementById('filmTeam')?.style.setProperty('display', 'none');
  }

  /* ---- PHOTO GALLERY ---- */
  const galleryGrid    = document.getElementById('filmGalleryGrid');
  const gallerySection = document.getElementById('filmGallery');

  if (galleryGrid && project.photos_extra?.length) {
    project.photos_extra.forEach((num, i) => {
      const img = document.createElement('img');
      img.src       = UMD.rootPath(`assets/portfolio/${project.id}/${num}.avif`);
      img.alt       = `${project.title} — Foto ${i + 1} — UMD Films`;
      img.loading   = 'lazy';
      img.className = 'film-gallery__img reveal';
      galleryGrid.appendChild(img);
    });
  } else {
    gallerySection?.style.setProperty('display', 'none');
  }

  /* ---- Gallery lightbox ---- */
  UMD.initLightbox('.film-gallery__img');

  /* ---- Reveal ---- */
  UMD.initReveal();
  setTimeout(() => {
    document.querySelectorAll('.film-hero .reveal').forEach(el => el.classList.add('visible'));
  }, 100);

});
