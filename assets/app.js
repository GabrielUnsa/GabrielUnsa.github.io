(() => {
  'use strict';

  const data = window.PORTFOLIO_DATA;
  const Portfolio = window.Portfolio;
  if (!data || !Portfolio) return;

  const { $, number } = Portfolio;

  // Inicializar contadores generales y fecha de revisión
  if ($('project-total')) $('project-total').textContent = number(data.projects.length);
  if ($('repo-total')) $('repo-total').textContent = number(data.repositories.filter(r => r.public).length);
  if ($('repo-tab-count')) $('repo-tab-count').textContent = data.repositories.length;
  if ($('file-total')) $('file-total').textContent = number(data.files.length);

  if (data.updated && $('catalog-date')) {
    const date = new Date(data.updated + 'T12:00:00Z');
    $('catalog-date').textContent = new Intl.DateTimeFormat('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(date);
    $('catalog-date').dateTime = data.updated;
  }

  // Navegación móvil accesible
  const mobileNav = document.querySelector('.mobile-nav');
  mobileNav?.addEventListener('click', event => {
    if (event.target.closest('a')) mobileNav.open = false;
  });
  mobileNav?.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobileNav.open) {
      mobileNav.open = false;
      mobileNav.querySelector('summary')?.focus();
    }
  });

  // Inicializar módulos funcionales del porfolio
  Portfolio.initDialog?.(data);
  Portfolio.initProjects?.(data);
  Portfolio.initRepositories?.(data);
  Portfolio.initLearning?.(data);
})();
