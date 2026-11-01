(() => {
  'use strict';

  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const desktopNav = document.querySelector('.desktop-nav');
  const backToTop = document.querySelector('.back-to-top');
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia?.('(pointer: fine)');
  const requestFrame =
    window.requestAnimationFrame?.bind(window) || (callback => setTimeout(callback, 16));
  const trackedRevealElements = [];

  function initThemeState() {
    root.dataset.theme = 'light';
    try {
      localStorage.removeItem('gabriel-portfolio-theme');
    } catch {
      /* Ignore storage restrictions. */
    }
  }

  // Expandir archivos desplegables cuando se accede mediante enlaces o hashes directos
  function initHashExpansion() {
    function revealTarget(hash) {
      let id;
      try {
        id = decodeURIComponent(hash.replace(/^#/, ''));
      } catch {
        return null;
      }
      const target = document.getElementById(id);
      if (!target) return null;

      if (target.hasAttribute('data-expand-section')) {
        const archive = target.querySelector('.archive-panel');
        if (archive) archive.open = true;
      }

      let parent = target.closest('details');
      while (parent) {
        parent.open = true;
        parent = parent.parentElement.closest('details');
      }
      return target;
    }

    document.addEventListener('click', event => {
      const anchor = event.target.closest('a[href^="#"]');
      if (anchor && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
        revealTarget(anchor.getAttribute('href'));
      }
    });

    window.addEventListener('hashchange', () => revealTarget(window.location.hash));

    if (window.location.hash) {
      const target = revealTarget(window.location.hash);
      requestFrame(() => target?.scrollIntoView?.({ block: 'start' }));
    }
  }

  function checkVisibleReveals() {
    if (!trackedRevealElements.length) return;
    const triggerBottom = window.innerHeight * 0.96;
    for (let i = trackedRevealElements.length - 1; i >= 0; i--) {
      const el = trackedRevealElements[i];
      if (el.classList.contains('is-visible')) {
        trackedRevealElements.splice(i, 1);
        continue;
      }
      const rect = el.getBoundingClientRect();
      if (rect.top <= triggerBottom && rect.bottom >= -40) {
        el.classList.add('is-visible');
        trackedRevealElements.splice(i, 1);
      }
    }
  }

  // Coreografías de entrada al hacer scroll sin clip-paths de área cero
  function initScrollReveals() {
    if (!('IntersectionObserver' in window) || reducedMotion?.matches) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01, rootMargin: '0px 0px -12px 0px' }
    );

    const revealGroups = [
      { selector: '.section-heading, .about-intro', mode: 'curtain' },
      {
        selector:
          '.featured-card, .experience-card, .ai-card, .publication-card, .course-preview > article',
        mode: 'unfold'
      },
      { selector: '.skills-list > div, .ai-method li, .training-summary > div', mode: 'sweep' }
    ];

    revealGroups.forEach(({ selector, mode }) => {
      document.querySelectorAll(selector).forEach((element, index) => {
        element.dataset.reveal = mode;
        element.style.setProperty('--reveal-delay', `${(index % 4) * 60}ms`);
        trackedRevealElements.push(element);
        observer.observe(element);
      });
    });

    root.classList.add('motion-ready');
    checkVisibleReveals();

    reducedMotion?.addEventListener?.('change', event => {
      if (event.matches) {
        root.classList.remove('motion-ready');
        observer.disconnect();
      }
    });
  }

  // Píldora de navegación elástica y sincronización de scroll en un solo frame
  function initNavigationAndScroll() {
    let hoveredNavLink = null;

    function syncNavPill() {
      if (!desktopNav) return;
      const target = hoveredNavLink || desktopNav.querySelector('a[aria-current="location"]');
      if (!target) {
        desktopNav.style.setProperty('--pill-opacity', '0');
        return;
      }
      const navRect = desktopNav.getBoundingClientRect();
      const linkRect = target.getBoundingClientRect();
      desktopNav.style.setProperty('--pill-x', `${(linkRect.left - navRect.left).toFixed(1)}px`);
      desktopNav.style.setProperty('--pill-w', `${linkRect.width.toFixed(1)}px`);
      desktopNav.style.setProperty('--pill-opacity', '1');
    }

    desktopNav?.querySelectorAll('a').forEach(link => {
      link.addEventListener('pointerenter', () => {
        hoveredNavLink = link;
        syncNavPill();
      });
      link.addEventListener('focus', () => {
        hoveredNavLink = link;
        syncNavPill();
      });
    });

    desktopNav?.addEventListener('pointerleave', () => {
      hoveredNavLink = null;
      syncNavPill();
    });

    desktopNav?.addEventListener('focusout', event => {
      if (!desktopNav.contains(event.relatedTarget)) {
        hoveredNavLink = null;
        syncNavPill();
      }
    });

    const navGroups = [...document.querySelectorAll('.desktop-nav, .mobile-nav nav')].map(nav =>
      [...nav.querySelectorAll('a[href^="#"]')]
        .map(link => ({
          link,
          section: document.getElementById(link.getAttribute('href').slice(1))
        }))
        .filter(item => item.section)
    );

    let scheduled = false;
    let lastScrollY = window.scrollY || 0;
    let skewResetTimer = null;

    function updatePosition() {
      scheduled = false;
      checkVisibleReveals();

      const scroll = Math.max(0, window.scrollY || 0);
      const distance = Math.max(1, root.scrollHeight - window.innerHeight);
      const atBottom = root.scrollHeight > window.innerHeight && distance - scroll < 8;
      root.style.setProperty('--scroll-progress', String(Math.min(1, scroll / distance)));

      if (!reducedMotion?.matches) {
        const delta = scroll - lastScrollY;
        const clampedSkew = Math.max(-1.4, Math.min(1.4, delta * 0.03));
        root.style.setProperty('--scroll-skew', `${clampedSkew.toFixed(2)}deg`);
        clearTimeout(skewResetTimer);
        skewResetTimer = setTimeout(() => root.style.setProperty('--scroll-skew', '0deg'), 120);
      }
      lastScrollY = scroll;

      header?.classList.toggle('is-scrolled', scroll > 16);
      const showTop = scroll > 600;
      if (backToTop) {
        backToTop.dataset.visible = String(showTop);
        backToTop.setAttribute('aria-hidden', String(!showTop));
        backToTop.tabIndex = showTop ? 0 : -1;
      }

      navGroups.forEach(items => {
        let active = null;
        let closest = -Infinity;
        items.forEach(item => {
          const top = item.section.getBoundingClientRect().top;
          if (top <= 165 && top > closest) {
            active = item.link;
            closest = top;
          }
        });
        if (atBottom) active = items[items.length - 1]?.link || active;
        items.forEach(({ link }) => {
          if (link === active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });

      syncNavPill();
    }

    function scheduleUpdate() {
      if (!scheduled) {
        scheduled = true;
        requestFrame(updatePosition);
      }
    }

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    document.addEventListener('toggle', scheduleUpdate, true);
    document.fonts?.ready?.then(scheduleUpdate);
    updatePosition();
  }

  // Campo interactivo del puntero: inclinación 3D, iluminación perimetral y atracción magnética
  function initInteractivePointerField() {
    if (!finePointer?.matches || reducedMotion?.matches) return;

    const TILT_SELECTOR =
      '.featured-card, .experience-card, .ai-card, .project-card, .publication-card, .profile-panel';
    const MAGNETIC_SELECTOR = '.button, .back-to-top';
    let activeCard = null;
    let activeMagnetic = null;
    let pointerFrame = false;
    let pointerX = window.innerWidth * 0.5;
    let pointerY = window.innerHeight * 0.3;

    function resetCard(card) {
      if (!card) return;
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
      card.style.setProperty('--card-glow', '0');
    }

    function resetMagnetic(el) {
      if (!el) return;
      el.style.setProperty('--mag-x', '0px');
      el.style.setProperty('--mag-y', '0px');
    }

    document.addEventListener(
      'pointermove',
      event => {
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (pointerFrame) return;
        pointerFrame = true;

        requestFrame(() => {
          pointerFrame = false;
          root.style.setProperty('--cursor-x', `${pointerX.toFixed(0)}px`);
          root.style.setProperty('--cursor-y', `${pointerY.toFixed(0)}px`);

          const target = document.elementFromPoint(pointerX, pointerY);
          const card = target?.closest?.(TILT_SELECTOR) || null;
          if (activeCard && activeCard !== card) resetCard(activeCard);
          activeCard = card;

          if (card) {
            const rect = card.getBoundingClientRect();
            const relX = pointerX - rect.left;
            const relY = pointerY - rect.top;
            const normX = relX / Math.max(1, rect.width) - 0.5;
            const normY = relY / Math.max(1, rect.height) - 0.5;
            const maxTilt = card.classList.contains('profile-panel') ? 3.2 : 2.6;

            card.style.setProperty('--card-x', `${relX.toFixed(0)}px`);
            card.style.setProperty('--card-y', `${relY.toFixed(0)}px`);
            card.style.setProperty('--card-glow', '1');
            card.style.setProperty('--tilt-x', `${(-normY * maxTilt).toFixed(2)}deg`);
            card.style.setProperty('--tilt-y', `${(normX * maxTilt).toFixed(2)}deg`);
          }

          const mag = target?.closest?.(MAGNETIC_SELECTOR) || null;
          if (activeMagnetic && activeMagnetic !== mag) resetMagnetic(activeMagnetic);
          activeMagnetic = mag;

          if (mag) {
            const rect = mag.getBoundingClientRect();
            const relX = pointerX - rect.left;
            const relY = pointerY - rect.top;
            const pullX = (relX - rect.width * 0.5) * 0.16;
            const pullY = (relY - rect.height * 0.5) * 0.2;

            mag.style.setProperty('--btn-x', `${relX.toFixed(0)}px`);
            mag.style.setProperty('--btn-y', `${relY.toFixed(0)}px`);
            mag.style.setProperty('--mag-x', `${pullX.toFixed(1)}px`);
            mag.style.setProperty('--mag-y', `${pullY.toFixed(1)}px`);
          }
        });
      },
      { passive: true }
    );
  }

  initThemeState();
  initHashExpansion();
  initScrollReveals();
  initNavigationAndScroll();
  initInteractivePointerField();
})();
