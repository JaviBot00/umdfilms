/**
 * =====================================================
 * UMD FILMS — main.js
 * =====================================================
 * Responsabilidades:
 *  1. Nav: scroll effect + burger menu
 *  2. Reveal on scroll (IntersectionObserver)
 *  3. Trust bar: duplicar logos para el loop infinito
 *  4. Contador de estadísticas animado
 *  5. Portafolio: filtros + renderizado desde data.js
 *  6. Equipo: renderizado desde data.js
 *  7. Servicios: preview de vídeo al hover (desktop)
 *  8. Formulario de contacto: validación básica
 *  9. Footer: año actual dinámico
 * =====================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  /* =====================================================
     1. NAV — scroll effect + burger
     ===================================================== */
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Cerrar menú al hacer clic en un enlace
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });


  /* =====================================================
     2. REVEAL ON SCROLL
     ===================================================== */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // No desconectamos para que re-animé si el usuario vuelve a subir
      }
    });
  }, { threshold: 0.12 });

  // Marcar como visible inmediatamente las del hero (ya visible al cargar)
  document.querySelectorAll('.hero .reveal').forEach(el => {
    setTimeout(() => el.classList.add('visible'), 100);
  });

  // Observar el resto
  document.querySelectorAll('.reveal:not(.hero .reveal)').forEach(el => {
    revealObserver.observe(el);
  });


  /* =====================================================
     3. TRUST BAR — duplicar logos para loop infinito
     ===================================================== */
  const trustInner = document.getElementById('trustInner');
  if (trustInner) {
    // Duplicamos el contenido para el efecto marquee continuo
    trustInner.innerHTML += trustInner.innerHTML;
  }


  /* =====================================================
     4. CONTADOR DE ESTADÍSTICAS ANIMADO
     ===================================================== */
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1800;
      const startTime = performance.now();

      const tick = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      statsObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat__num').forEach(el => statsObserver.observe(el));


  /* =====================================================
     5. PORTAFOLIO — filtros + renderizado
     ===================================================== */
  const portfolioGrid    = document.getElementById('portfolioGrid');
  const portfolioFilters = document.getElementById('portfolioFilters');
  const allProjects      = window.UMD_DATA?.portfolio || [];

  function renderPortfolio(filter) {
    const filtered = filter === 'all'
      ? allProjects
      : allProjects.filter(p => p.category === filter);

    portfolioGrid.innerHTML = '';

    filtered.forEach((project, i) => {
      const item = document.createElement('div');
      item.className = 'portfolio-item';
      item.style.transitionDelay = `${i * 0.07}s`;
      item.innerHTML = `
        <img src="${project.thumb}" alt="${project.title}" loading="lazy" />
        <div class="portfolio-item__overlay">
          <p class="portfolio-item__cat">${project.category}</p>
          <p class="portfolio-item__title">${project.title}</p>
        </div>
        <div class="portfolio-item__play" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
        </div>
      `;

      item.addEventListener('click', () => {
        window.open(project.url, '_blank', 'noopener');
      });

      portfolioGrid.appendChild(item);

      // Trigger reveal con pequeño delay para la animación
      requestAnimationFrame(() => {
        setTimeout(() => item.style.opacity = '1', 10);
      });
    });

    // Re-observar los nuevos items
    portfolioGrid.querySelectorAll('.portfolio-item').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 50);
    });
  }

  // Filtros
  if (portfolioFilters) {
    portfolioFilters.querySelectorAll('.filter').forEach(btn => {
      btn.addEventListener('click', () => {
        portfolioFilters.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderPortfolio(btn.dataset.filter);
      });
    });
  }

  renderPortfolio('all');


  /* =====================================================
     6. EQUIPO — renderizado desde data.js
     ===================================================== */
  const teamGrid = document.getElementById('teamGrid');
  const teamData = window.UMD_DATA?.team || [];

  const teamObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  teamData.forEach((member, i) => {
    const card = document.createElement('div');
    card.className = 'team-card';
    card.style.transitionDelay = `${i * 0.08}s`;
    card.innerHTML = `
      <img class="team-card__img" src="${member.photo}" alt="${member.name}" loading="lazy" />
      <div class="team-card__info">
        <p class="team-card__name">${member.name}</p>
        <p class="team-card__role">${member.role}</p>
      </div>
    `;
    teamGrid.appendChild(card);
    teamObserver.observe(card);
  });


  /* =====================================================
     7. SERVICIOS — preview vídeo al hover (solo desktop)
     ===================================================== */
  const preview      = document.getElementById('servicePreview');
  const previewVideo = document.getElementById('previewVideo');
  let previewTimeout;

  if (preview && previewVideo && window.matchMedia('(min-width: 900px)').matches) {
    document.querySelectorAll('.service-card[data-video]').forEach(card => {

      card.addEventListener('mouseenter', (e) => {
        clearTimeout(previewTimeout);
        const videoSrc = card.dataset.video;
        if (previewVideo.src !== videoSrc) {
          previewVideo.src = videoSrc;
          previewVideo.load();
        }
        previewVideo.play().catch(() => {});
        preview.classList.add('active');
        movePreview(e);
      });

      card.addEventListener('mousemove', movePreview);

      card.addEventListener('mouseleave', () => {
        previewTimeout = setTimeout(() => {
          preview.classList.remove('active');
          previewVideo.pause();
        }, 150);
      });
    });

    function movePreview(e) {
      const x = e.clientX + 20;
      const y = e.clientY - 80;
      const maxX = window.innerWidth - 300;
      const maxY = window.innerHeight - 170;
      preview.style.left = Math.min(x, maxX) + 'px';
      preview.style.top  = Math.max(20, Math.min(y, maxY)) + 'px';
    }
  }


  /* =====================================================
     8. FORMULARIO — validación y envío por WhatsApp
     ===================================================== */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name    = contactForm.querySelector('#name').value.trim();
      const email   = contactForm.querySelector('#email').value.trim();
      const service = contactForm.querySelector('#service').value;
      const message = contactForm.querySelector('#message').value.trim();

      if (!name || !email) {
        alert('Por favor, rellena al menos tu nombre y email.');
        return;
      }

      // Construir mensaje de WhatsApp
      const text = encodeURIComponent(
        `Hola, soy ${name} (${email}).\n` +
        (service ? `Servicio de interés: ${service}\n` : '') +
        (message ? `\nMensaje: ${message}` : '')
      );

      window.open(`https://wa.me/34675185198?text=${text}`, '_blank', 'noopener');
    });
  }


  /* =====================================================
     9. FOOTER — año actual
     ===================================================== */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
