/**
 * =====================================================
 * main.js — Home page logic (index.html)
 * Stats calculated dynamically:
 *   - people    = team.json.length
 *   - projects  = portfolio.json.length
 *   - years     = current year - config.founded_year
 *   - location  = config.schema.address_locality
 * =====================================================
 */

document.addEventListener('DOMContentLoaded', async () => {

  /* ---- Data loading ---- */
  const [config, team, portfolio, services, partners, home] = await Promise.all([
    UMD.fetchJSON(UMD.rootPath('data/config.json')),
    UMD.fetchJSON(UMD.rootPath('data/team.json')),
    UMD.fetchJSON(UMD.rootPath('data/portfolio.json')),
    UMD.fetchJSON(UMD.rootPath('data/services.json')),
    UMD.fetchJSON(UMD.rootPath('data/partners.json')),
    UMD.fetchJSON(UMD.rootPath('data/home.json'))
  ]);

  /* ---- Nav + Footer + FAB + Schema ---- */
  await UMD.renderNav(config);
  await UMD.renderFooter(config);
  UMD.renderFAB(config);
  renderHomeContent(config, home, services);
  UMD.injectLocalBusinessSchema(config);

  /* ---- Hero: initial reveal ---- */
  setTimeout(() => {
    document.querySelectorAll('.hero .reveal').forEach(el => el.classList.add('visible'));
  }, 120);

  function renderHomeContent(config, home, services) {
  const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  const setHTML = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };

  /* Hero */
  setText('heroEyebrow', home.hero.eyebrow);
  setHTML('heroTitle', `${home.hero.title_pre}<em>${home.hero.title_highlight}</em>${home.hero.title_post}`);
  setHTML('heroSub', home.hero.subtitle_lines.join('<br />'));
  setHTML('heroActions', `
    <a href="${home.hero.cta_primary.href}" class="btn btn-primary btn-lg">${home.hero.cta_primary.label}</a>
    <a href="${home.hero.cta_secondary.href}" class="btn btn-ghost btn-lg">${home.hero.cta_secondary.label}</a>
  `);
  setText('heroScrollLabel', home.hero.scroll_label);

  /* Trust */
  setText('trustLabel', home.trust.label);

  /* About */
  setText('aboutEyebrow', home.about.eyebrow);
  setHTML('aboutTitle',
    `${home.about.title_pre}<em>${home.about.title_highlight}</em>${home.about.title_post}<br/>${home.about.title_line2}`);
  setHTML('aboutParagraphs',
    home.about.paragraphs.map(p => `<p class="lead-text reveal">${p}</p>`).join(''));
  setHTML('aboutActions', `
    <a href="${home.about.cta_primary.href}" class="btn btn-outline">${home.about.cta_primary.label}</a>
    <a href="${home.about.cta_secondary.href}" class="btn btn-ghost">${home.about.cta_secondary.label}</a>
  `);

  /* Cabeceras de sección */
  setText('servicesEyebrow', home.services.eyebrow);
  setText('servicesTitle', home.services.title);
  setText('portfolioEyebrow', home.portfolio.eyebrow);
  setText('portfolioTitle', home.portfolio.title);
  setText('teamEyebrow', home.team.eyebrow);
  setText('teamTitle', home.team.title);

  /* Portfolio CTA -> YouTube (dato de config, no de home.json) */
  setHTML('portfolioCta', `
    <a href="${config.social.youtube}" target="_blank" rel="noopener" class="btn btn-primary">
      Ver canal de YouTube ↗
    </a>
  `);

  /* CTA band */
  setText('ctaBandTitle', home.cta_band.title);
  setText('ctaBandSub', home.cta_band.subtitle);
  const ctaBandBtn = document.getElementById('ctaBandBtn');
  if (ctaBandBtn) {
    ctaBandBtn.textContent = home.cta_band.cta.label;
    ctaBandBtn.href = home.cta_band.cta.href;
  }

  /* Contact */
  setText('contactEyebrow', home.contact.eyebrow);
  setHTML('contactTitle', `${home.contact.title_pre}<br /><em>${home.contact.title_highlight}</em>`);
  setText('contactBody', home.contact.body);

  /* Enlaces de contacto -> WhatsApp + redes, dato de config, no de home.json */
  const waHref = `https://wa.me/${config.contact.whatsapp}?text=${encodeURIComponent(config.contact.whatsapp_msg)}`;
  setHTML('contactLinks', `
    <a href="${waHref}" class="contact__wa" target="_blank" rel="noopener">
      <span class="icon icon-whatsapp" aria-hidden="true"></span>
      ${home.contact.wa_label}
    </a>
    ${config.social.instagram ? `<a href="${config.social.instagram}" class="text-link" target="_blank" rel="noopener">Instagram</a>` : ''}
    ${config.social.youtube ? `<a href="${config.social.youtube}" class="text-link" target="_blank" rel="noopener">YouTube</a>` : ''}
  `);

  /* Formulario: labels, placeholders, select dinámico */
  const f = home.contact.form;
  document.querySelector('label[for="name"]').textContent = f.name_label;
  document.getElementById('name').placeholder = f.name_placeholder;
  document.querySelector('label[for="email"]').textContent = f.email_label;
  document.getElementById('email').placeholder = f.email_placeholder;
  document.querySelector('label[for="service"]').textContent = f.service_label;
  document.querySelector('label[for="message"]').textContent = f.message_label;
  document.getElementById('message').placeholder = f.message_placeholder;
  document.querySelector('#contactForm button[type="submit"]').textContent = f.submit_label;
  document.querySelector('.form-note').textContent = f.note;

  const serviceOptions = [
    ...services.map(s => s.title.replace(' ↗', '')),
    ...f.service_extra_options
  ];
  document.getElementById('service').innerHTML =
    `<option value="">${f.service_placeholder}</option>` +
    serviceOptions.map(o => `<option>${o}</option>`).join('');
}

/* ---- Trust bar: duplicated logos for infinite marquee ----
     We repeat the logo set until it's wider than the screen
     (with margin), then duplicate it once more: the loop needs
     two identical halves for translateX(-50%) to work perfectly.
  ---- */
  const trustInner = document.getElementById('trustInner');
  if (trustInner) {
    // Render logos from JSON
    trustInner.innerHTML = partners.map(p =>
      `<img src="${UMD.rootPath(p.logo)}" alt="${p.name}" loading="lazy" />`
    ).join('');

    // Duplicate for marquee (same logic as before)
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
     STATS — calculated from data
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
      value:  null,   // non-numeric
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

    /* Animate counters when entering viewport */
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
     SERVICES
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
        ${svc.core ? '<span class="service-card__tag">Core service</span>' : ''}
      `;

      if (svc.link) {
        card.setAttribute('role', 'link');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Go to: ${svc.title}`);
        const goToService = () => { window.location.href = UMD.rootPath(svc.link); };
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

    /* Video preview hover (desktop only) */
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
     PORTFOLIO — filters + cards
     ===================================================== */
  const portfolioGrid    = document.getElementById('portfolioGrid');
  // Portfolio (home) — solo featured, sin filtros de categoría en home
  const featuredPortfolio = portfolio.filter(p => p.featured);
  UMD.renderFilterableGrid({
    items: featuredPortfolio,
    filterEl: null,
    gridEl: portfolioGrid,
    cardBuilder: (p) => UMD.buildPortfolioCard(p, UMD.rootPath)
  });
  document.getElementById('portfolioCta').insertAdjacentHTML('beforebegin',
  `<div style="text-align:center;margin-bottom:2rem">
     <a href="${UMD.rootPath('portfolio/index.html')}" class="btn btn-outline">Ver todos los proyectos ↗</a>
   </div>`);

  /* =====================================================
     TEAM
     ===================================================== */
  const teamGrid = document.getElementById('teamGrid');
  // Team (home)
  const featuredTeam = team.filter(m => m.featured);
  UMD.renderFilterableGrid({
    items: featuredTeam,
    filterEl: null,
    gridEl: teamGrid,
    cardBuilder: (m) => UMD.buildTeamCard(m, UMD.rootPath)
  });
  document.getElementById('teamGrid').insertAdjacentHTML('afterend',
  `<div style="text-align:center;margin-top:2rem">
     <a href="${UMD.rootPath('team/index.html')}" class="btn btn-outline">Ver equipo completo ↗</a>
   </div>`);

  /* =====================================================
     CONTACT FORM → WhatsApp
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


  /* ---- Reveal: at the end, to also detect dynamically created
     .reveal elements (services, etc.) ---- */
  UMD.initReveal();

});
