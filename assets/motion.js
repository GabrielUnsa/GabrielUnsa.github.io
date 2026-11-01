(() => {
  'use strict';
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const backToTop = document.querySelector('.back-to-top');
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const requestFrame = window.requestAnimationFrame?.bind(window) || (callback => setTimeout(callback, 16));

  // Expand full archives when reached through a link, including existing shared URLs.
  function revealTarget(hash) {
    let id;
    try { id = decodeURIComponent(hash.replace(/^#/, '')); } catch { return null; }
    const target = document.getElementById(id);
    if (!target) return null;
    if (target.hasAttribute('data-expand-section')) {
      const archive = target.querySelector('.archive-panel');
      if (archive) archive.open = true;
    }
    let parent = target.closest('details');
    while (parent) { parent.open = true; parent = parent.parentElement.closest('details'); }
    return target;
  }
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href^="#"]');
    if (anchor && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) revealTarget(anchor.getAttribute('href'));
  });
  window.addEventListener('hashchange', () => revealTarget(window.location.hash));
  if (window.location.hash) {
    const target = revealTarget(window.location.hash);
    requestFrame(() => target?.scrollIntoView?.({ block: 'start' }));
  }

  // Reveal only presentation content; text stays visible without observer support.
  if ('IntersectionObserver' in window && !reducedMotion?.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
    const elements = document.querySelectorAll('.section-heading, .featured-card, .experience-card, .about-intro, .skills-list > div, .ai-card, .publication-card, .course-preview > article');
    elements.forEach((element, index) => {
      element.dataset.reveal = '';
      element.style.setProperty('--reveal-delay', `${(index % 3) * 65}ms`);
      observer.observe(element);
    });
    root.classList.add('motion-ready');
    reducedMotion?.addEventListener?.('change', event => {
      if (event.matches) { root.classList.remove('motion-ready'); observer.disconnect(); }
    });
  }

  // One animation frame per scroll update keeps progress and navigation in sync.
  const navGroups = [...document.querySelectorAll('.desktop-nav, .mobile-nav nav')].map(nav =>
    [...nav.querySelectorAll('a[href^="#"]')].map(link => ({ link, section: document.getElementById(link.getAttribute('href').slice(1)) })).filter(item => item.section)
  );
  let scheduled = false;
  function updatePosition() {
    scheduled = false;
    const scroll = Math.max(0, window.scrollY || 0);
    const distance = Math.max(1, root.scrollHeight - window.innerHeight);
    const atBottom = root.scrollHeight > window.innerHeight && distance - scroll < 8;
    root.style.setProperty('--scroll-progress', String(Math.min(1, scroll / distance)));
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
        if (top <= 165 && top > closest) { active = item.link; closest = top; }
      });
      if (atBottom) active = items.find(item => item.section.id === 'contacto')?.link || active;
      items.forEach(({ link }) => {
        if (link === active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }
  function scheduleUpdate() {
    if (!scheduled) { scheduled = true; requestFrame(updatePosition); }
  }
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });
  document.addEventListener('toggle', scheduleUpdate, true);
  document.fonts?.ready?.then(scheduleUpdate);
  updatePosition();
})();
