(() => {
  'use strict';

  const Portfolio = (window.Portfolio = window.Portfolio || {});
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');

  Portfolio.$ = id => document.getElementById(id);

  Portfolio.categories = {
    all: { label: 'Todos', icon: '▦' },
    sistemas: { label: 'Sistemas', icon: '⌘' },
    web: { label: 'Desarrollo web', icon: '</>' },
    ia: { label: 'Inteligencia artificial', icon: '✳' },
    investigacion: { label: 'Investigación', icon: '⋈' },
    scripts: { label: 'Scripts y herramientas', icon: '>_' },
    ejercicios: { label: 'Ejercicios', icon: '{ }' },
    juegos: { label: 'Juegos', icon: '⊞' }
  };

  Portfolio.normalize = value =>
    String(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  Portfolio.escape = value =>
    String(value).replace(
      /[&<>"']/g,
      c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    );

  Portfolio.compare = (a, b) =>
    a.localeCompare(b, 'es', { sensitivity: 'base', numeric: true });

  Portfolio.number = value => new Intl.NumberFormat('es-AR').format(value);

  Portfolio.external = ' target="_blank" rel="noopener noreferrer"';

  Portfolio.transition = callback => {
    if (document.startViewTransition && !reducedMotion?.matches) {
      document.startViewTransition(callback);
    } else {
      callback();
    }
  };

  Portfolio.projectCard = (p, index = 0) => {
    const { categories, escape } = Portfolio;
    const categoryInfo = categories[p.category] || categories.all;
    const delay = ` style="animation-delay:${(index % 6) * 45}ms"`;

    return [
      `<article class="project-card"${delay}>`,
      `<div class="project-card-top">`,
      `<span class="project-icon" aria-hidden="true">${escape(categoryInfo.icon)}</span>`,
      `<span class="project-status">${escape(p.status)}</span>`,
      `</div>`,
      `<h3>${escape(p.title)}</h3>`,
      `<p>${escape(p.description)}</p>`,
      `<div class="tags">${p.tags.map(t => `<span>${escape(t)}</span>`).join('')}</div>`,
      `<button class="card-action" type="button" data-project="${escape(p.id)}" aria-label="Ver descripción de ${escape(p.title)}">`,
      `<span class="project-category">${categoryInfo.label}</span>Ver proyecto <span aria-hidden="true">↗</span>`,
      `</button>`,
      `</article>`
    ].join('');
  };
})();

