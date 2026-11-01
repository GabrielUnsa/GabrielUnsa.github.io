(() => {
  'use strict';

  const Portfolio = (window.Portfolio = window.Portfolio || {});

  Portfolio.initProjects = data => {
    const { $, categories, normalize, compare, number, transition, projectCard } = Portfolio;
    const filtersEl = $('project-filters');
    const searchEl = $('project-search');
    const sortEl = $('project-sort');
    const gridEl = $('project-grid');
    if (!filtersEl || !searchEl || !sortEl || !gridEl) return;

    let category = 'all';
    let projectLimit = 12;

    const projectIndex = new Map(
      data.projects.map(p => [
        p.id,
        normalize(
          [
            p.title,
            p.description,
            p.detail || '',
            categories[p.category]?.label || '',
            p.tags.join(' '),
            p.repo || '',
            p.status
          ].join(' ')
        )
      ])
    );

    filtersEl.innerHTML = Object.entries(categories)
      .map(([key, c]) => {
        const count =
          key === 'all'
            ? data.projects.length
            : data.projects.filter(p => p.category === key).length;
        return `<button type="button" data-filter="${key}" aria-pressed="${key === category}">${c.label}<span>${count}</span></button>`;
      })
      .join('');

    function renderProjects() {
      const words = normalize(searchEl.value)
        .split(/\s+/)
        .filter(Boolean);

      const filtered = data.projects.filter(
        p =>
          (category === 'all' || p.category === category) &&
          words.every(word => projectIndex.get(p.id).includes(word))
      );

      if (sortEl.value === 'az') {
        filtered.sort((a, b) => compare(a.title, b.title));
      } else if (sortEl.value === 'category') {
        filtered.sort(
          (a, b) =>
            compare(categories[a.category].label, categories[b.category].label) ||
            compare(a.title, b.title)
        );
      } else {
        filtered.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
      }

      gridEl.innerHTML = filtered.slice(0, projectLimit).map(projectCard).join('');
      $('project-count').textContent =
        `${number(filtered.length)} ${filtered.length === 1 ? 'proyecto' : 'proyectos'}` +
        (filtered.length > projectLimit ? ` · mostrando ${projectLimit}` : '');
      $('project-empty').hidden = filtered.length > 0;
      $('load-more').hidden = filtered.length <= projectLimit;
      $('load-more').textContent = `Ver más proyectos (${Math.max(0, filtered.length - projectLimit)}) ↓`;

      document
        .querySelectorAll('[data-filter]')
        .forEach(button => button.setAttribute('aria-pressed', button.dataset.filter === category));
    }

    filtersEl.addEventListener('click', event => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      category = button.dataset.filter;
      projectLimit = 12;
      transition(renderProjects);
    });

    searchEl.addEventListener('input', () => {
      projectLimit = 12;
      renderProjects();
    });

    sortEl.addEventListener('change', () => transition(renderProjects));

    $('load-more')?.addEventListener('click', () => {
      const before = gridEl.querySelectorAll('.project-card').length;
      projectLimit += 12;
      renderProjects();
      gridEl.querySelectorAll('.project-card')[before]?.querySelector('button')?.focus({ preventScroll: true });
    });

    $('reset-projects')?.addEventListener('click', () => {
      category = 'all';
      projectLimit = 12;
      searchEl.value = '';
      renderProjects();
      searchEl.focus();
    });

    document.addEventListener('keydown', event => {
      const isShortcut =
        event.key === '/' &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) &&
        !$('project-dialog')?.open;

      if (isShortcut) {
        event.preventDefault();
        const archive = $('proyectos')?.querySelector('.archive-panel');
        if (archive) archive.open = true;
        searchEl.focus();
      }
    });

    renderProjects();
  };
})();

