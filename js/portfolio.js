/**
 * =====================================================
 * portfolio.js — Individual project page
 *
 * Concept: "Movie poster"
 *   - Technical sheet (director, client, duration, year, category)
 *   - Embedded YouTube trailer
 *   - Synopsis
 *   - Behind-the-scenes photos
 *   - Team who participated (with photo and link to their profile)
 *
 * How it works:
 *   - Reads the HTML filename: portfolio/cautivo-malaga.html → id = "cautivo-malaga"
 *   - Finds that id in portfolio.json
 *   - Fills the entire page dynamically
 *   - One HTML template serves all projects
 * =====================================================
 */

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

  const project = portfolio.find(p => p.id === projectId);

  /* ---- Nav + Footer + FAB ---- */
  await UMD.renderNav(config);
  await UMD.renderFooter(config);
  UMD.renderFAB(config);

  /* ---- Project not found ---- */
  if (!project) {
    document.title = 'Proyecto no encontrado — UMD Films Málaga';
    document.querySelector('main').innerHTML = `
      <div class="container" style="padding-block:8rem;text-align:center">
        <p class="eyebrow">Error 404</p>
        <h1 class="section-title">Proyecto no encontrado</h1>
        <a href="${UMD.rootPath('index.html')}#portfolio" class="btn btn-primary" style="margin-top:2rem">Back to portfolio</a>
      </div>`;
    return;
  }

  /* ---- SEO + Schema VideoObject ---- */
  document.title = `${project.title} | ${config.seo.site_suffix}`;
  document.querySelector('meta[name="description"]')
    ?.setAttribute('content', project.synopsis || `${project.title} — ${project.category} producido por UMD Films en ${project.year}.`);

    // Dynamic canonical
  const canonical = document.querySelector('link[rel="canonical"]')
    || Object.assign(document.createElement('link'), { rel: 'canonical' });
  canonical.href = `${config.brand.site_url}/portfolio/${project.id}.html`;
  if (!canonical.parentNode) document.head.appendChild(canonical);

  // Open Graph
  const setMeta = (prop, content) => {
    let el = document.querySelector(`meta[property="${prop}"]`);
    if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el); }
    el.setAttribute('content', content);
  };
  setMeta('og:title',       document.title);
  setMeta('og:description', project.synopsis || `${project.title} — ${project.category} producido por UMD Films en ${project.year}.`);
  setMeta('og:image',       `${config.brand.site_url}/${project.thumb}`);
  setMeta('og:type',        'video.other');
  setMeta('og:url',         `${config.brand.site_url}/portfolio/${project.id}.html`);
  setMeta('og:site_name',   'UMD Films');

  // Twitter Card
  const setTwitter = (name, content) => {
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
    el.setAttribute('content', content);
  };
  setTwitter('twitter:card',        'summary_large_image');
  setTwitter('twitter:title',       document.title);
  setTwitter('twitter:description', project.synopsis || `${project.title} — ${project.category} producido por UMD Films en ${project.year}.`);
  setTwitter('twitter:image',       `${config.brand.site_url}/${project.thumb}`);

  // Schema VideoObject for projects with video
  if (project.trailer_youtube && !project.trailer_youtube.includes('PLACEHOLDER')) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": project.title,
      "description": project.synopsis || `${project.title} por UMD Films`,
      "thumbnailUrl": `${config.brand.site_url}/${project.thumb}`,
      "uploadDate": `${project.year}-01-01`,
      "director": { "@type": "Person", "name": project.director },
      "productionCompany": { "@type": "Organization", "name": "UMD Films" },
      "url": project.trailer_youtube
    };
    const tag = document.createElement('script');
    tag.type = 'application/ld+json';
    tag.textContent = JSON.stringify(schema);
    document.head.appendChild(tag);
  }

  /* ---- PROJECT HERO ---- */
  const filmHero = document.getElementById('filmHero');
  if (filmHero) {
    filmHero.innerHTML = `
      <div class="film-hero__bg">
        <img src="${project.thumb}"
             alt="${project.title} — UMD Films"
             fetchpriority="high" />
      </div>
      <div class="film-hero__overlay"></div>
      <div class="film-hero__content">
        <a href="${UMD.rootPath('index.html')}#portfolio" class="film-hero__back reveal">
          <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
          Back to portfolio
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

  /* ---- TRAILER ---- */
  const trailerEl = document.getElementById('filmTrailer');
  if (trailerEl) {
    const hasTrailer = project.trailer_youtube && !project.trailer_youtube.includes('PLACEHOLDER');

    if (hasTrailer) {
      // Extract YouTube ID from URL
      const ytId = extractYouTubeId(project.trailer_youtube);
      if (ytId) {
        trailerEl.innerHTML = `
          <iframe
            src="https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1"
            title="${project.title} — Tráiler | UMD Films"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            loading="lazy">
          </iframe>`;
      }
    } else {
      trailerEl.innerHTML = `
        <div class="film-trailer__placeholder">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="10,8 16,12 10,16"/></svg>
          <p>Video pending in portfolio.json</p>
        </div>`;
    }
  }

  /* ---- SYNOPSIS ---- */
  const synopsisEl = document.getElementById('filmSynopsis');
  if (synopsisEl) {
    synopsisEl.innerHTML = project.synopsis
      ? `<p>${project.synopsis}</p>`
      : `<p style="color:var(--muted);font-style:italic">Synopsis pending in portfolio.json.</p>`;
  }

  /* ---- TECHNICAL SHEET ---- */
  const sheetEl = document.getElementById('filmSheet');
  if (sheetEl) {
    const rows = [
      { label: 'Title',     value: project.title },
      { label: 'Category', value: project.category },
      { label: 'Year',       value: project.year },
      { label: 'Duration',  value: project.duration_min ? `${project.duration_min} min` : '—' },
      { label: 'Director',  value: project.director || '—' },
      { label: 'Client',   value: project.client || '—' },
    ];

    sheetEl.innerHTML = `
      <div class="film-sheet">
        <div class="film-sheet__header">Technical sheet</div>
        <div class="film-sheet__body">
          ${rows.map(r => `
            <div class="film-row">
              <span class="film-label">${r.label}</span>
              <span class="film-value">${r.value}</span>
            </div>`).join('')}
          ${project.tags?.length ? `
            <div class="film-row">
              <span class="film-label">Tags</span>
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
    project.photos_extra.forEach((src, i) => {
      const img = document.createElement('img');
      img.src       = UMD.rootPath(src);
      img.alt       = `${project.title} — Photo ${i + 1} — UMD Films`;
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
