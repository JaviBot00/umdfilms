// team.js — Individual team member page
// Reads ID from URL filename, loads team.json, fills page dynamically.
// One HTML template serves all members.

document.addEventListener('DOMContentLoaded', async () => {

  /* ---- Get member ID from URL ---- */
  const memberId = window.location.pathname
    .split('/')
    .pop()
    .replace('.html', '');

  /* ---- Load data ---- */
  const [config, team, portfolio] = await Promise.all([
    UMD.fetchJSON(UMD.rootPath('data/config.json')),
    UMD.fetchJSON(UMD.rootPath('data/team.json')),
    UMD.fetchJSON(UMD.rootPath('data/portfolio.json'))
  ]);

  const ui = config.ui_strings || {};
  const err404 = ui.errores_404 || {};
  const placeholders = ui.placeholders || {};
  const fichaStrings = ui.ficha_perfil || {};

  const member = team.find(m => m.id === memberId);

  /* ---- Nav + Footer ---- */
  await UMD.renderNav(config);
  await UMD.renderFooter(config);
  UMD.renderFAB();

  /* ---- If member doesn't exist ---- */
  if (!member) {
    document.title = `${err404.perfil_titulo} — ${config.seo.site_suffix}`;
    document.querySelector('main').innerHTML = `
      <div class="container" style="padding-block:8rem;text-align:center">
        <p class="eyebrow">Error 404</p>
        <h1 class="section-title">${err404.perfil_titulo}</h1>
        <a href="${UMD.getBackUrl(UMD.rootPath('index.html') + '#equipo')}" class="btn btn-primary" style="margin-top:2rem">${err404.perfil_volver}</a>
      </div>`;
    return;
  }

  /* ---- SEO ---- */
  document.title = `${member.name} — ${member.role} | ${config.seo.site_suffix}`;
  document.querySelector('meta[name="description"]')
    ?.setAttribute('content', `Conoce a ${member.name}, ${member.role} en ${config.seo.site_suffix}.`);

  UMD.setCanonical(`${config.brand.site_url}/team/${member.id}.html`);

  UMD.setOgMeta('og:title',       document.title);
  UMD.setOgMeta('og:description', `Conoce a ${member.name}, ${member.role} en ${config.seo.site_suffix}.`);
  UMD.setOgMeta('og:image',       `${config.brand.site_url}/${member.photo_cover}`);
  UMD.setOgMeta('og:type',        'profile');
  UMD.setOgMeta('og:url',         `${config.brand.site_url}/team/${member.id}.html`);
  UMD.setOgMeta('og:site_name',   config.seo.site_name);

  UMD.setTwitterMeta('twitter:card',        'summary_large_image');
  UMD.setTwitterMeta('twitter:title',       document.title);
  UMD.setTwitterMeta('twitter:description', `Conoce a ${member.name}, ${member.role} en ${config.seo.site_suffix}.`);
  UMD.setTwitterMeta('twitter:image',       `${config.brand.site_url}/${member.photo_cover}`);

  // Schema Person for rich results
  const fullName = member.name + (member.surname ? ' ' + member.surname : '');
  const sameAs = [];
  if (member.social?.instagram) sameAs.push(member.social.instagram);
  if (member.social?.youtube)   sameAs.push(member.social.youtube);

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": fullName,
    "jobTitle": member.role,
    "worksFor": {
      "@type": "Organization",
      "name": "UMD Films",
      "url": config.brand.site_url
    },
    "url": `${config.brand.site_url}/team/${member.id}.html`,
    "image": `${config.brand.site_url}/${member.photo_cover}`
  };
  if (sameAs.length) personSchema.sameAs = sameAs;

  const schemaTag = document.createElement('script');
  schemaTag.type = 'application/ld+json';
  schemaTag.textContent = JSON.stringify(personSchema);
  document.head.appendChild(schemaTag);


  /* ---- PROFILE HERO ---- */
  const heroSection = document.getElementById('profileHero');
  if (heroSection) {
    heroSection.innerHTML = `
      <div class="profile-hero__bg">
        <img src="${UMD.rootPath(member.photo_cover)}"
             alt="${member.name} — ${member.role} — ${config.seo.site_suffix}" />
      </div>
      <div class="profile-hero__overlay"></div>
      <div class="profile-hero__content container">
        <a href="${UMD.getBackUrl(UMD.rootPath('index.html') + '#equipo')}" class="profile-hero__back reveal">
          <svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
          ${err404.perfil_volver}
        </a>
        <h1 class="profile-hero__name reveal d1">${member.name}${member.surname ? ' ' + member.surname : ''}</h1>
        <p class="profile-hero__role reveal d2">${member.role}</p>
        ${member.specialties?.length ? `
        <div class="profile-hero__specialties reveal d3">
          ${member.specialties.map(s => `<span class="specialty-tag">${s}</span>`).join('')}
        </div>` : ''}
      </div>
    `;
  }

  /* ---- BIO + SHEET ---- */
  const bioEl = document.getElementById('profileBio');
  if (bioEl) {
    bioEl.innerHTML = member.bio
      ? `<p class="profile-bio reveal">${member.bio}</p>`
      : `<p class="profile-bio reveal" style="color:var(--muted);font-style:italic">${placeholders.bio_pendiente}</p>`;
  }

  /* ---- Social links ---- */
  const socialsEl = document.getElementById('profileSocials');
  if (socialsEl && member.social) {
    const links = [];
    if (member.social.instagram) links.push(`
      <a href="${member.social.instagram}" class="profile-social reveal" target="_blank" rel="noopener" aria-label="Instagram">
        <span class="icon icon-instagram" aria-hidden="true"></span>
        Instagram
      </a>`);
    if (member.social.youtube) links.push(`
      <a href="${member.social.youtube}" class="profile-social reveal" target="_blank" rel="noopener" aria-label="YouTube">
        <span class="icon icon-youtube" aria-hidden="true"></span>
        YouTube
      </a>`);
    if (member.social.tiktok) links.push(`
      <a href="${member.social.tiktok}" class="profile-social reveal" target="_blank" rel="noopener" aria-label="TikTok">
        <span class="icon icon-tiktok" aria-hidden="true"></span>
        TikTok
      </a>`);
    socialsEl.innerHTML = links.join('');
  }

  /* ---- Side sheet ---- */
  const fichaEl = document.getElementById('profileFicha');
  if (fichaEl) {
    fichaEl.innerHTML = `
      <div class="profile-info-card">
        <div class="profile-info-card__header">${fichaStrings.header}</div>
        <div class="profile-info-card__body">
          <div class="profile-info-row">
            <span class="profile-info-label">${fichaStrings.nombre}</span>
            <span class="profile-info-value">${member.name}${member.surname ? ' ' + member.surname : ''}</span>
          </div>
          <div class="profile-info-row">
            <span class="profile-info-label">${fichaStrings.rol}</span>
            <span class="profile-info-value">${member.role}</span>
          </div>
          ${member.specialties?.length ? `
          <div class="profile-info-row">
            <span class="profile-info-label">${fichaStrings.especialidades}</span>
            <span class="profile-info-value">${member.specialties.join(', ')}</span>
          </div>` : ''}
          <div class="profile-info-row">
            <span class="profile-info-label">${fichaStrings.empresa}</span>
            <span class="profile-info-value">${fichaStrings.empresa_valor}</span>
          </div>
          <div class="profile-info-row">
            <span class="profile-info-label">${fichaStrings.sede}</span>
            <span class="profile-info-value">${fichaStrings.sede_valor}</span>
          </div>
        </div>
      </div>
    `;
  }

  /* ---- EXTRA PHOTOS ---- */
  const photosSection = document.getElementById('profilePhotos');
  const photosGrid    = document.getElementById('profilePhotosGrid');
  if (photosSection && photosGrid) {
    if (member.photos_extra?.length) {
      member.photos_extra.forEach(num => {
        const img = document.createElement('img');
        img.src     = UMD.rootPath(`assets/team/${member.id}/${num}.avif`);
        img.alt     = `${member.name} — ${config.seo.site_suffix}`;
        img.loading = 'lazy';
        img.className = 'profile-photos__img reveal';
        photosGrid.appendChild(img);
      });
    } else {
      photosSection.style.display = 'none';
    }
    /* ---- Gallery lightbox ---- */
    UMD.initLightbox('.profile-photos__img');
  }

  /* ---- PROJECTS THEY PARTICIPATED IN ---- */
  const projectsGrid = document.getElementById('profileProjectsGrid');
  if (projectsGrid) {
    const memberProjects = portfolio.filter(p =>
      member.projects?.includes(p.id) || p.team_ids?.includes(member.id)
    );
    if (memberProjects.length) {
      memberProjects.forEach(proj => projectsGrid.appendChild(UMD.buildPortfolioCard(proj, UMD.rootPath)));
    } else {
      document.getElementById('profileProjects')?.style.setProperty('display', 'none');
    }
  }

  /* ---- Reveal ---- */
  UMD.initReveal();
  setTimeout(() => {
    document.querySelectorAll('.profile-hero .reveal').forEach(el => el.classList.add('visible'));
  }, 100);

});
