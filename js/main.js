// main.js — Home page logic
// Stats: projects=portfolio.length, team=team.length,
// years=currentYear−founded_year, location=config.schema.address_locality

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
  UMD.renderFAB();
  renderHomeContent(config, home, services);
  UMD.injectLocalBusinessSchema(config);

  const ui = config.ui_strings || {};

  /* ---- SEO (overwrite HTML fallback) ---- */
  document.title = config.seo.title_home;
  document.querySelector('meta[name="description"]')
    ?.setAttribute('content', config.seo.description_home);

  UMD.setCanonical(`${config.brand.site_url}/`);
  UMD.setOgMeta('og:title',       config.seo.title_home);
  UMD.setOgMeta('og:description', config.seo.description_home);
  UMD.setOgMeta('og:image',       `${config.brand.site_url}/${config.seo.og_image}`);
  UMD.setOgMeta('og:image:width',  '1200');
  UMD.setOgMeta('og:image:height', '630');
  UMD.setOgMeta('og:url',         `${config.brand.site_url}/`);
  UMD.setOgMeta('og:type',        'website');
  UMD.setOgMeta('og:site_name',   config.seo.site_name);
  UMD.setTwitterMeta('twitter:card',        'summary_large_image');
  UMD.setTwitterMeta('twitter:title',       config.seo.title_home);
  UMD.setTwitterMeta('twitter:description', config.seo.description_home);
  UMD.setTwitterMeta('twitter:image',       `${config.brand.site_url}/${config.seo.og_image}`);
  UMD.setTwitterMeta('twitter:image:width',  '1200');
  UMD.setTwitterMeta('twitter:image:height', '630');

  /* ---- Hero: initial reveal ---- */
  setTimeout(() => {
    document.querySelectorAll('.hero .reveal').forEach(el => el.classList.add('visible'));
  }, 120);

  /* ---- SHOWREEL ---- */
  const showreelPlayer = document.getElementById('showreelPlayer');
  if (showreelPlayer && config.brand.showreel_youtube) {
    const showreelId = UMD.extractYouTubeId(config.brand.showreel_youtube);
    if (showreelId) {
      const thumbUrl = UMD.ytThumbUrl(showreelId);
      showreelPlayer.innerHTML = `
        <button class="showreel__facade" aria-label="${ui.aria?.play_showreel}">
          <img src="${thumbUrl}" data-yt-id="${showreelId}" onload="UMD.ytThumbCheck(this)"
              onerror="UMD.ytThumbAdvance(this)" alt="${ui.home?.showreel_title}" />
          <span class="showreel__facade__play" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24"><path d="m5 3 14 9-14 9z"/></svg>
          </span>
        </button>`;
      showreelPlayer.classList.remove('skeleton', 'skeleton--16x9');
      showreelPlayer.querySelector('.showreel__facade').addEventListener('click', function () {
        this.outerHTML = `<iframe src="https://www.youtube.com/embed/${showreelId}?autoplay=1&rel=0"
          title="${ui.home?.showreel_title}"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowfullscreen></iframe>`;
      }, { once: true });
    }
  } else if (showreelPlayer) {
    showreelPlayer.closest('.showreel')?.style.setProperty('display', 'none');
  }

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

    /* Trust bar */
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
      <div class="portfolio__actions">
        <a href="${UMD.rootPath('portfolio/index.html')}" class="btn btn-outline">${_ui.home?.all_projects_cta}</a>
        <a href="${config.social.youtube}" target="_blank" rel="noopener" class="btn btn-primary">${_ui.home?.youtube_cta}</a>
      </div>
    `);

    /* Contact */
    setText('contactEyebrow', home.contact.eyebrow);
    setHTML('contactTitle', `${home.contact.title_pre}<br /><span>${home.contact.title_line2}</span>`);
    setText('contactBody', home.contact.body);

    /* Enlaces de contacto -> WhatsApp + redes, dato de config, no de home.json */
    const waHref = `https://wa.me/${config.contact.whatsapp}?text=${encodeURIComponent(config.contact.whatsapp_msg)}`;
    setHTML('contactLinks', `
      <a href="${waHref}" class="contact__link contact__link--wa" target="_blank" rel="noopener">
        <span class="icon icon-whatsapp" aria-hidden="true"></span>
        ${home.contact.wa_label}
      </a>
      <a href="mailto:${config.contact.email}" class="contact__link contact__link--email">
        <span class="icon icon-email" aria-hidden="true"></span>
        ${home.contact.email_label || config.contact.email}
      </a>
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

  /* ---- Trust bar: duplicated logos for infinite marquee ---- */
  const trustInner = document.getElementById('trustInner');
  if (trustInner) {
    // Render logos from JSON
    trustInner.innerHTML = partners.map(p =>
      `<img src="${UMD.rootPath(p.logo)}" alt="${p.name}" />`
    ).join('');

    // Duplicate for marquee (same logic as before)
    let set = trustInner.innerHTML;
    let safety = 0;
    document.getElementById('trustListA11y').innerHTML = partners.map(p => `<li>${p.name}</li>`).join('');
    while (trustInner.scrollWidth < window.innerWidth * 2 && safety < 10) {
      set += trustInner.innerHTML;
      trustInner.innerHTML = set;
      safety++;
    }
    trustInner.innerHTML = set + set;
  }

  /* ---- STATS — calculated from data ---- */
  const currentYear = new Date().getFullYear();
  const validPortfolio = portfolio.filter(p => p && p.id);
  const statsData = [
    {
      id:     'stat-proyectos',
      value:  validPortfolio.length,
      label:  ui.stats?.trabajos
    },
    {
      id:     'stat-equipo',
      value:  team.length,
      label:  ui.stats?.profesionales
    },
    {
      id:     'stat-anos',
      value:  currentYear - config.brand.founded_year,
      label:  ui.stats?.anos
    },
    {
      id:     'stat-sede',
      value:  null,   // non-numeric
      text:   config.schema.address_locality,
      label:  config.schema.address_country === 'ES' ? (ui.stats?.alcance_nacional) : (ui.stats?.alcance_internacional)
    }
  ];

  const statsContainer = document.getElementById('statsGrid');
  if (statsContainer) {
    statsContainer.innerHTML = '';
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

    /* ---- Animate counters when entering viewport ---- */
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

  /* ---- SERVICES ---- */
  const servicesGrid   = document.getElementById('servicesGrid');

  if (servicesGrid) {
    servicesGrid.innerHTML = '';
    services.forEach(svc => {
      const card = document.createElement('article');
      card.className = `service-card reveal${svc.link ? ' service-card--link' : ''}`;
      if (svc.video_preview) card.dataset.video = svc.video_preview;

      card.innerHTML = `
        <div class="service-card__icon">${svc.icon}</div>
        <h3 class="service-card__title">${svc.title}</h3>
        <p class="service-card__desc">${svc.description}</p>
        ${svc.core ? `<span class="service-card__tag">${ui.home?.core_service_tag}</span>` : ''}
      `;

      if (svc.link) {
        card.setAttribute('role', 'link');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Ir a: ${svc.title}`);
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
  }

  /* ---- PORTFOLIO ---- */
  const portfolioGrid    = document.getElementById('portfolioGrid');
  // Portfolio (home) — solo featured, sin filtros de categoría en home
  const featuredPortfolio = validPortfolio.filter(p => p.featured);
  UMD.renderFilterableGrid({
    items: featuredPortfolio,
    filterEl: null,
    gridEl: portfolioGrid,
    cardBuilder: (p) => UMD.buildPortfolioCard(p, UMD.rootPath)
  });

  /* ---- TEAM ---- */
  const teamGrid = document.getElementById('teamGrid');
  // Team (home)
  const featuredTeam = team.filter(m => m.featured);
  UMD.renderFilterableGrid({
    items: featuredTeam,
    filterEl: null,
    gridEl: teamGrid,
    cardBuilder: (m) => UMD.buildTeamCard(m, UMD.rootPath)
  });
  teamGrid.insertAdjacentHTML('afterend',
  `<div class="team__actions">
     <a href="${UMD.rootPath('team/index.html')}" class="btn btn-outline">${ui.home?.team_cta}</a>
   </div>`);

  /* ---- CONTACT FORM ---- */
  const form = document.getElementById('contactForm');
  if (form) {
    const formStatus = document.getElementById('formStatus');

    const clearErrors = () => {
      form.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));
      form.querySelectorAll('.form-error').forEach(e => { e.textContent = ''; });
      if (formStatus) formStatus.textContent = '';
    };

    const showError = (input, errorEl, msg) => {
      input.setAttribute('aria-invalid', 'true');
      input.closest('.form-group').classList.add('has-error');
      errorEl.textContent = msg;
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors();

      const name    = form.querySelector('#name').value.trim();
      const email   = form.querySelector('#email').value.trim();
      const service = form.querySelector('#service').value;
      const message = form.querySelector('#message').value.trim();

      const nameInput  = form.querySelector('#name');
      const emailInput = form.querySelector('#email');
      const nameError  = form.querySelector('#name-error');
      const emailError = form.querySelector('#email-error');
      let hasError = false;
      let errorMessages = [];

      if (!name) {
        showError(nameInput, nameError, ui.form?.error_nombre);
        errorMessages.push('nombre');
        hasError = true;
      }
      if (!email) {
        showError(emailInput, emailError, ui.form?.error_email);
        errorMessages.push('email');
        hasError = true;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError(emailInput, emailError, ui.form?.error_email_format);
        errorMessages.push('email');
        hasError = true;
      }

      if (hasError) {
        if (formStatus) formStatus.textContent = (ui.form?.error_summary).replace('{fields}', errorMessages.join(' y '));
        form.querySelector('[aria-invalid="true"]').focus();
        return;
      }

      const text = encodeURIComponent(
        `Hola, soy ${name} (${email}).` +
        (service ? `\nServicio: ${service}` : '') +
        (message ? `\n\n${message}` : '')
      );

      const subject = encodeURIComponent(`Contacto web — ${name}`);
      const body = encodeURIComponent(
        `Nombre: ${name}\nEmail: ${email}` +
        (service ? `\nServicio: ${service}` : '') +
        (message ? `\n\nMensaje:\n${message}` : '')
      );
      window.location.href = `mailto:${config.contact.email}?subject=${subject}&body=${body}`;
    });
  }

  /* ---- Reveal: at the end, to also detect dynamically created
     .reveal elements (services, etc.) ---- */
  UMD.initReveal();

  /* ---- Scroll to hash after full render (fixes layout-shift issue) ---- */
  const hash = window.location.hash;
  if (hash) {
    const target = document.querySelector(hash);
    if (target) target.scrollIntoView({ behavior: 'instant' });
  }
});
