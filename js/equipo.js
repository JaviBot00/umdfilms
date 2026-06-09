/**
 * =====================================================
 * equipo.js — Página individual de miembro del equipo
 *
 * Cómo funciona:
 *  - Lee el ?id= de la URL o el nombre del archivo
 *  - Carga team.json y portfolio.json
 *  - Rellena toda la página dinámicamente
 *  - Una sola plantilla HTML sirve para los 13 miembros
 * =====================================================
 */

document.addEventListener('DOMContentLoaded', async () => {

  /* ---- Obtener el ID del miembro desde la URL ---- */
  // La URL es: equipo/alejandro.html → id = "alejandro"
  const memberId = window.location.pathname
    .split('/')
    .pop()
    .replace('.html', '');

  /* ---- Cargar datos ---- */
  const [config, team, portfolio] = await Promise.all([
    UMD.fetchJSON(UMD.rootPath('data/config.json')),
    UMD.fetchJSON(UMD.rootPath('data/team.json')),
    UMD.fetchJSON(UMD.rootPath('data/portfolio.json'))
  ]);

  const member = team.find(m => m.id === memberId);

  /* ---- Nav + Footer ---- */
  await UMD.renderNav(config);
  await UMD.renderFooter(config);
  UMD.renderFAB(config);

  /* ---- Si no existe el miembro ---- */
  if (!member) {
    document.title = 'Perfil no encontrado — UMD Films';
    document.querySelector('main').innerHTML = `
      <div class="container" style="padding-block:8rem;text-align:center">
        <p class="eyebrow">Error 404</p>
        <h1 class="section-title">Perfil no encontrado</h1>
        <a href="${UMD.rootPath('index.html')}#equipo" class="btn btn-primary" style="margin-top:2rem">Volver al equipo</a>
      </div>`;
    return;
  }

  /* ---- SEO ---- */
  document.title = `${member.name} — ${member.role} | UMD Films`;
  document.querySelector('meta[name="description"]')
    ?.setAttribute('content', `Conoce a ${member.name}, ${member.role} en UMD Films Málaga.`);

  /* ---- HERO DEL PERFIL ---- */
  const heroSection = document.getElementById('profileHero');
  if (heroSection) {
    heroSection.innerHTML = `
      <div class="profile-hero__bg">
        <img src="${UMD.rootPath(member.photo_cover)}"
             alt="${member.name} — ${member.role} — UMD Films" />
      </div>
      <div class="profile-hero__overlay"></div>
      <div class="profile-hero__content container">
        <a href="${UMD.rootPath('index.html')}#equipo" class="profile-hero__back reveal">
          <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
          Volver al equipo
        </a>
        <p class="eyebrow profile-hero__eyebrow reveal">UMD Films · Equipo</p>
        <h1 class="profile-hero__name reveal d1">${member.name}${member.surname ? ' ' + member.surname : ''}</h1>
        <p class="profile-hero__role reveal d2">${member.role}</p>
        ${member.specialties?.length ? `
        <div class="profile-hero__specialties reveal d3">
          ${member.specialties.map(s => `<span class="specialty-tag">${s}</span>`).join('')}
        </div>` : ''}
      </div>
    `;
  }

  /* ---- BIO + FICHA ---- */
  const bioEl = document.getElementById('profileBio');
  if (bioEl) {
    bioEl.innerHTML = member.bio
      ? `<p class="profile-bio reveal">${member.bio}</p>`
      : `<p class="profile-bio reveal" style="color:var(--muted);font-style:italic">Descripción pendiente de rellenar en team.json.</p>`;
  }

  /* Social links */
  const socialsEl = document.getElementById('profileSocials');
  if (socialsEl && member.social) {
    const links = [];
    if (member.social.instagram) links.push(`
      <a href="${member.social.instagram}" class="profile-social reveal" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
        Instagram
      </a>`);
    if (member.social.youtube) links.push(`
      <a href="${member.social.youtube}" class="profile-social reveal" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
        YouTube
      </a>`);
    socialsEl.innerHTML = links.join('');
  }

  /* Ficha lateral */
  const fichaEl = document.getElementById('profileFicha');
  if (fichaEl) {
    fichaEl.innerHTML = `
      <div class="profile-info-card">
        <div class="profile-info-card__header">Ficha</div>
        <div class="profile-info-card__body">
          <div class="profile-info-row">
            <span class="profile-info-label">Nombre</span>
            <span class="profile-info-value">${member.name}${member.surname ? ' ' + member.surname : ''}</span>
          </div>
          <div class="profile-info-row">
            <span class="profile-info-label">Rol</span>
            <span class="profile-info-value">${member.role}</span>
          </div>
          ${member.specialties?.length ? `
          <div class="profile-info-row">
            <span class="profile-info-label">Especialidades</span>
            <span class="profile-info-value">${member.specialties.join(', ')}</span>
          </div>` : ''}
          <div class="profile-info-row">
            <span class="profile-info-label">Empresa</span>
            <span class="profile-info-value">UMD Films</span>
          </div>
          <div class="profile-info-row">
            <span class="profile-info-label">Sede</span>
            <span class="profile-info-value">Málaga</span>
          </div>
        </div>
      </div>
    `;
  }

  /* ---- FOTOS EXTRA ---- */
  const photosSection = document.getElementById('profilePhotos');
  const photosGrid    = document.getElementById('profilePhotosGrid');
  if (photosSection && photosGrid) {
    if (member.photos_extra?.length) {
      member.photos_extra.forEach(src => {
        const img = document.createElement('img');
        img.src     = UMD.rootPath(src);
        img.alt     = `${member.name} — UMD Films`;
        img.loading = 'lazy';
        img.className = 'profile-photos__img reveal';
        photosGrid.appendChild(img);
      });
    } else {
      photosSection.style.display = 'none';
    }
  }

  /* ---- PROYECTOS EN LOS QUE PARTICIPA ---- */
  const projectsGrid = document.getElementById('profileProjectsGrid');
  if (projectsGrid) {
    const memberProjects = portfolio.filter(p =>
      member.projects?.includes(p.id) || p.team_ids?.includes(member.id)
    );

    if (memberProjects.length) {
      memberProjects.forEach(proj => {
        const card = document.createElement('div');
        card.className = 'portfolio-card reveal';
        card.innerHTML = `
          <img src="${UMD.rootPath(proj.thumb)}" alt="${proj.title} — UMD Films" loading="lazy" />
          <div class="portfolio-card__overlay">
            <p class="portfolio-card__cat">${proj.category} · ${proj.year}</p>
            <p class="portfolio-card__title">${proj.title}</p>
          </div>
          <div class="portfolio-card__play" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
          </div>
        `;
        card.addEventListener('click', () => {
          window.location.href = UMD.rootPath(`portafolio/${proj.id}.html`);
        });
        projectsGrid.appendChild(card);
      });
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
