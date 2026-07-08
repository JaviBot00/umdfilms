/**
 * =====================================================
 * main.js — Lógica de la página principal (index.html)
 * Estadísticas calculadas dinámicamente:
 *   - personas  = team.json.length
 *   - proyectos = portfolio.json.length
 *   - años      = año actual - config.founded_year
 *   - sede      = config.schema.address_locality
 * =====================================================
 */

document.addEventListener('DOMContentLoaded', async () => {

  /* ---- Carga de datos ---- */
  const [config, team, portfolio, services, partners] = await Promise.all([
    UMD.fetchJSON(UMD.rootPath('data/config.json')),
    UMD.fetchJSON(UMD.rootPath('data/team.json')),
    UMD.fetchJSON(UMD.rootPath('data/portfolio.json')),
    UMD.fetchJSON(UMD.rootPath('data/services.json')),
    UMD.fetchJSON(UMD.rootPath('data/partners.json'))
  ]);

  /* ---- Nav + Footer + FAB + Schema ---- */
  await UMD.renderNav(config);
  await UMD.renderFooter(config);
  UMD.renderFAB(config);
  UMD.injectLocalBusinessSchema(config);

  /* ---- Hero: reveal inicial ---- */
  setTimeout(() => {
    document.querySelectorAll('.hero .reveal').forEach(el => el.classList.add('visible'));
  }, 120);

/* ---- Trust bar: logos duplicados para marquee infinito ----
     Repetimos el set de logos hasta que sea más ancho que la pantalla
     (con margen), y luego lo duplicamos una vez más: el bucle necesita
     dos mitades idénticas para que translateX(-50%) sea perfecto.
  ---- */
  const trustInner = document.getElementById('trustInner');
  if (trustInner) {
    // Renderizar logos desde el JSON
    trustInner.innerHTML = partners.map(p =>
      `<img src="${UMD.rootPath(p.logo)}" alt="${p.name}" loading="lazy" />`
    ).join('');

    // Duplicar para el marquee (misma lógica que antes)
    let set = trustInner.innerHTML;
    let safety = 0;
    while (trustInner.scrollWidth < window.innerWidth * 2 && safety < 10) {
      set += trustInner.innerHTML;
      trustInner.innerHTML = set;
      safety++;
    }
    trustInner.innerHTML = set + set;
  }

  /* =====================================================
     ESTADÍSTICAS — calculadas desde los datos
     ===================================================== */
  const currentYear = new Date().getFullYear();
  const statsData = [
    {
      id:     'stat-proyectos',
      value:  portfolio.length,
      label:  'Trabajos realizados'
    },
    {
      id:     'stat-equipo',
      value:  team.length,
      label:  'Profesionales en el equipo'
    },
    {
      id:     'stat-anos',
      value:  currentYear - config.brand.founded_year,
      label:  'Años de trayectoria'
    },
    {
      id:     'stat-sede',
      value:  null,   // no numérico
      text:   config.schema.address_locality,
      label:  `Alcance ${config.schema.address_country === 'ES' ? 'nacional' : 'internacional'}`
    }
  ];

  const statsContainer = document.getElementById('statsGrid');
  if (statsContainer) {
    statsData.forEach(s => {
      const div = document.createElement('div');
      div.className = 'stat';
      if (s.value !== null) {
        div.innerHTML = `
          <span class="stat__num" data-target="${s.value}">0</span>
          <span class="stat__label">${s.label}</span>
        `;
      } else {
        div.innerHTML = `
          <span class="stat__num stat__num--text">${s.text}</span>
          <span class="stat__label">${s.label}</span>
        `;
      }
      statsContainer.appendChild(div);
    });

    /* Animar contadores al entrar en viewport */
    const statObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el  = e.target.querySelector('.stat__num[data-target]');
        if (el) UMD.animateCounter(el, parseInt(el.dataset.target));
        statObs.unobserve(e.target);
      });
    }, { threshold: 0.5 });

    statsContainer.querySelectorAll('.stat').forEach(s => statObs.observe(s));
  }

  /* =====================================================
     SERVICIOS
     ===================================================== */
  const servicesGrid   = document.getElementById('servicesGrid');
  const svcPreview     = document.getElementById('svcPreview');
  const svcPreviewVid  = document.getElementById('svcPreviewVid');
  const isDesktop      = window.matchMedia('(min-width: 860px)').matches;

  if (servicesGrid) {
    services.forEach(svc => {
      const card = document.createElement('article');
      card.className = `service-card reveal${svc.link ? ' service-card--link' : ''}`;
      if (svc.video_preview) card.dataset.video = svc.video_preview;

      card.innerHTML = `
        <div class="service-card__icon">${svc.icon}</div>
        <h3 class="service-card__title">${svc.title}</h3>
        <p class="service-card__desc">${svc.description}</p>
        ${svc.core ? '<span class="service-card__tag">Servicio core</span>' : ''}
      `;

      if (svc.link) {
        card.setAttribute('role', 'link');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Ir a: ${svc.title}`);
        const goToService = () => { window.location.href = svc.link; };
        card.addEventListener('click', goToService);
        card.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            goToService();
          }
        });
      }

      servicesGrid.appendChild(card);
    });

    /* Video preview hover (solo desktop) */
    if (isDesktop && svcPreview && svcPreviewVid) {
      let previewTimer;

      servicesGrid.querySelectorAll('.service-card[data-video]').forEach(card => {
        card.addEventListener('mouseenter', (e) => {
          clearTimeout(previewTimer);
          const src = card.dataset.video;
          if (svcPreviewVid.src !== location.origin + '/' + src) {
            svcPreviewVid.src = src;
            svcPreviewVid.load();
          }
          svcPreviewVid.play().catch(() => {});
          svcPreview.classList.add('active');
          positionPreview(e);
        });
        card.addEventListener('mousemove', positionPreview);
        card.addEventListener('mouseleave', () => {
          previewTimer = setTimeout(() => {
            svcPreview.classList.remove('active');
            svcPreviewVid.pause();
          }, 120);
        });
      });

      function positionPreview(e) {
        const x = Math.min(e.clientX + 24, window.innerWidth - 320);
        const y = Math.max(20, Math.min(e.clientY - 90, window.innerHeight - 185));
        svcPreview.style.left = x + 'px';
        svcPreview.style.top  = y + 'px';
      }
    }
  }

  /* =====================================================
     PORTAFOLIO — filtros + cards
     ===================================================== */
  const portfolioGrid    = document.getElementById('portfolioGrid');
  const portfolioFilters = document.getElementById('portfolioFilters');

  function renderPortfolio(filter) {
    const items = filter === 'all'
      ? portfolio
      : portfolio.filter(p => p.category === filter);

    portfolioGrid.innerHTML = '';

    items.forEach((proj, i) => {
      const card = document.createElement('div');
      card.className = 'portfolio-card';
      card.setAttribute('role', 'link');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Ver proyecto: ${proj.title}`);
      card.style.transitionDelay = `${i * 0.06}s`;
      card.innerHTML = `
        <img src="${proj.thumb}" alt="${proj.title} — UMD Films" loading="lazy" />
        <div class="portfolio-card__overlay">
          <p class="portfolio-card__cat">${proj.category} · ${proj.year}</p>
          <p class="portfolio-card__title">${proj.title}</p>
        </div>
        <div class="portfolio-card__play" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
        </div>
      `;
      const goToProject = () => { window.location.href = `portafolio/${proj.id}.html`; };
      card.addEventListener('click', goToProject);
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goToProject();
        }
      });
      portfolioGrid.appendChild(card);

      requestAnimationFrame(() => {
        setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'none'; }, 30);
      });
    });
  }

  // Generar filtros dinámicamente desde el JSON
  const categories = ['all', ...new Set(portfolio.map(p => p.category))];
  const FILTER_LABELS = {
    all: 'Todo', videoclip: 'Videoclips', publicidad: 'Publicidad',
    cine: 'Cine', corporativo: 'Corporativo'
  };
  if (portfolioFilters) {
    categories.forEach(cat => {
      const btn = document.createElement('button');
      const isActive = cat === 'all';
      btn.className = `filter${isActive ? ' active' : ''}`;
      btn.dataset.filter = cat;
      btn.textContent = FILTER_LABELS[cat] || cat;
      btn.setAttribute('aria-pressed', String(isActive));
      portfolioFilters.appendChild(btn);
    });
    portfolioFilters.querySelectorAll('.filter').forEach(btn => {
      btn.addEventListener('click', () => {
        portfolioFilters.querySelectorAll('.filter').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        renderPortfolio(btn.dataset.filter);
      });
    });
  }

  renderPortfolio('all');

  /* =====================================================
     EQUIPO
     ===================================================== */
  const teamGrid = document.getElementById('teamGrid');
  if (teamGrid) {
    const teamObs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });

    team.forEach((member, i) => {
      const card = document.createElement('div');
      card.className = 'team-card';
      card.style.transitionDelay = `${i * 0.07}s`;
      card.setAttribute('role', 'link');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Ver perfil de ${member.name}`);

      card.innerHTML = `
        <div class="team-card__img-wrap">
          <img class="team-card__img"
               src="${member.photo_cover}"
               alt="${member.name} — ${member.role} — UMD Films"
               loading="lazy" />
          <span class="team-card__badge">↗ Ver perfil</span>
        </div>
        <div class="team-card__info">
          <p class="team-card__name">${member.name}</p>
          <p class="team-card__role">${member.role}</p>
        </div>
      `;

      const goToProfile = () => { window.location.href = `equipo/${member.id}.html`; };
      card.addEventListener('click', goToProfile);
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goToProfile();
        }
      });

      teamGrid.appendChild(card);
      teamObs.observe(card);
    });
  }

  /* =====================================================
     FORMULARIO DE CONTACTO → WhatsApp
     ===================================================== */
  const form = document.getElementById('contactForm');
  if (form) {
    const wa  = config.contact.whatsapp;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name    = form.querySelector('#name').value.trim();
      const email   = form.querySelector('#email').value.trim();
      const service = form.querySelector('#service').value;
      const message = form.querySelector('#message').value.trim();

      const nameInput  = form.querySelector('#name');
      const emailInput = form.querySelector('#email');
      let hasError = false;

      [nameInput, emailInput].forEach(input => {
        if (!input.value.trim()) {
          input.setAttribute('aria-invalid', 'true');
          input.style.borderColor = 'var(--red)';
          hasError = true;
        } else {
          input.removeAttribute('aria-invalid');
          input.style.borderColor = '';
        }
      });

      if (hasError) {
        nameInput.focus();
        return;
      }

      const text = encodeURIComponent(
        `Hola, soy ${name} (${email}).` +
        (service ? `\nServicio: ${service}` : '') +
        (message ? `\n\n${message}` : '')
      );
      window.open(`https://wa.me/${wa}?text=${text}`, '_blank', 'noopener');
    });
  }

  
      /* ---- Reveal: al final, para detectar también los elementos
     .reveal creados dinámicamente (servicios, etc.) ---- */
  UMD.initReveal();

});
