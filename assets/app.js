(() => {
  'use strict';
  const data = window.PORTFOLIO_DATA;
  if (!data) return;
  const $ = id => document.getElementById(id);
  const categories = {
    all: { label: 'Todos', icon: '▦' },
    sistemas: { label: 'Sistemas', icon: '⌘' },
    web: { label: 'Desarrollo web', icon: '</>' },
    ia: { label: 'Inteligencia artificial', icon: '✳' },
    investigacion: { label: 'Investigación', icon: '⋈' },
    scripts: { label: 'Scripts y herramientas', icon: '>_' },
    ejercicios: { label: 'Ejercicios', icon: '{ }' },
    juegos: { label: 'Juegos', icon: '⊞' }
  };
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const compare = (a, b) => a.localeCompare(b, 'es', { sensitivity: 'base', numeric: true });
  const number = value => new Intl.NumberFormat('es-AR').format(value);
  let category = 'all';
  let projectLimit = 12;
  let fileLimit = 40;
  let dialogTrigger = null;
  const projectIndex = new Map(data.projects.map(p => [p.id, normalize([p.title, p.description, p.detail || '', categories[p.category].label, p.tags.join(' '), p.repo || '', p.status].join(' '))]));
  $('project-total').textContent = number(data.projects.length);
  $('repo-total').textContent = number(data.repositories.filter(r => r.public).length);
  $('repo-tab-count').textContent = data.repositories.length;
  $('file-total').textContent = number(data.files.length);
  if (data.updated) {
    const date = new Date(data.updated + 'T12:00:00Z');
    $('catalog-date').textContent = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
    $('catalog-date').dateTime = data.updated;
  }
  $('project-filters').innerHTML = Object.entries(categories).map(([key, c]) => {
    const count = key === 'all' ? data.projects.length : data.projects.filter(p => p.category === key).length;
    return `<button type="button" data-filter="${key}" aria-pressed="${key === category}">${c.label}<span>${count}</span></button>`;
  }).join('');
  function projectCard(p) {
    return `<article class="project-card"><div class="project-card-top"><span class="project-icon" aria-hidden="true">${escape(categories[p.category].icon)}</span><span class="project-status">${escape(p.status)}</span></div><h3>${escape(p.title)}</h3><p>${escape(p.description)}</p><div class="tags">${p.tags.map(t => `<span>${escape(t)}</span>`).join('')}</div><button class="card-action" type="button" data-project="${escape(p.id)}" aria-label="Ver descripción de ${escape(p.title)}"><span class="project-category">${categories[p.category].label}</span>Ver proyecto <span aria-hidden="true">↗</span></button></article>`;
  }
  function renderProjects() {
    const words = normalize($('project-search').value).split(/\s+/).filter(Boolean);
    const filtered = data.projects.filter(p => (category === 'all' || p.category === category) && words.every(word => projectIndex.get(p.id).includes(word)));
    if ($('project-sort').value === 'az') filtered.sort((a, b) => compare(a.title, b.title));
    else if ($('project-sort').value === 'category') filtered.sort((a, b) => compare(categories[a.category].label, categories[b.category].label) || compare(a.title, b.title));
    else filtered.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
    $('project-grid').innerHTML = filtered.slice(0, projectLimit).map(projectCard).join('');
    $('project-count').textContent = `${number(filtered.length)} ${filtered.length === 1 ? 'proyecto' : 'proyectos'}${filtered.length > projectLimit ? ` · mostrando ${projectLimit}` : ''}`;
    $('project-empty').hidden = filtered.length > 0;
    $('load-more').hidden = filtered.length <= projectLimit;
    $('load-more').textContent = `Ver más proyectos (${Math.max(0, filtered.length - projectLimit)}) ↓`;
    document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', button.dataset.filter === category));
  }
  $('project-filters').addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    category = button.dataset.filter;
    projectLimit = 12;
    renderProjects();
  });
  $('project-search').addEventListener('input', () => { projectLimit = 12; renderProjects(); });
  $('project-sort').addEventListener('change', renderProjects);
  $('load-more').addEventListener('click', () => {
    const before = document.querySelectorAll('.project-card').length;
    projectLimit += 12;
    renderProjects();
    document.querySelectorAll('.project-card')[before]?.querySelector('button')?.focus({ preventScroll: true });
  });
  $('reset-projects').addEventListener('click', () => {
    category = 'all'; projectLimit = 12; $('project-search').value = ''; renderProjects(); $('project-search').focus();
  });
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) && !$('project-dialog').open) {
      event.preventDefault(); $('project-search').focus();
    }
  });
  const external = ' target="_blank" rel="noopener noreferrer"';
  function repoRow(r) {
    const info = `<h3>${escape(r.name)}</h3><p>${escape(r.description)}</p>`;
    return `<article class="repo-row"><span class="repo-symbol" aria-hidden="true">${r.public ? '⌥' : '⊡'}</span>${r.public ? `<a class="repo-info" href="${escape(r.url)}"${external}>${info}</a>` : `<div class="repo-info">${info}</div>`}<div class="tags">${r.tags.slice(0, 3).map(t => `<span>${escape(t)}</span>`).join('')}</div>${r.public ? `<a class="repo-end" href="${escape(r.url)}"${external} aria-label="Abrir ${escape(r.name)} en GitHub">Público <span aria-hidden="true">↗</span></a>` : '<span class="repo-end">Código privado</span>'}</article>`;
  }
  $('repo-list').innerHTML = [...data.repositories].sort((a, b) => Number(b.public) - Number(a.public) || compare(a.name, b.name)).map(repoRow).join('');
  data.repositories.filter(r => r.public).sort((a, b) => compare(a.name, b.name)).forEach(r => {
    const option = document.createElement('option'); option.value = r.name; option.textContent = r.name; $('file-repo').appendChild(option);
  });
  function renderFiles() {
    const words = normalize($('file-search').value).split(/\s+/).filter(Boolean);
    const repo = $('file-repo').value;
    const files = data.files.filter(f => (repo === 'all' || f.repo === repo) && words.every(word => normalize(`${f.repo} ${f.path}`).includes(word)));
    $('file-count').textContent = `${number(files.length)} ${files.length === 1 ? 'archivo' : 'archivos'}${files.length > fileLimit ? ` · mostrando ${fileLimit}` : ''}`;
    $('file-list').innerHTML = files.length ? files.slice(0, fileLimit).map(f => {
      const pieces = f.path.split('/');
      const name = pieces.pop();
      const ext = name.includes('.') ? name.split('.').pop().slice(0, 7) : 'txt';
      return `<div class="file-row"><span class="file-ext" aria-hidden="true">${escape(ext)}</span><a href="${escape(f.url)}"${external}><span class="file-name">${escape(name)}</span><span class="file-path">${escape(f.repo)}${pieces.length ? ' / ' + escape(pieces.join(' / ')) : ''}</span></a><span aria-hidden="true">↗</span></div>`;
    }).join('') : '<p class="empty-state">No hay archivos que coincidan. Probá otro nombre o repositorio.</p>';
    $('more-files').hidden = files.length <= fileLimit;
  }
  $('file-search').addEventListener('input', () => { fileLimit = 40; renderFiles(); });
  $('file-repo').addEventListener('change', () => { fileLimit = 40; renderFiles(); });
  $('more-files').addEventListener('click', () => { const before = document.querySelectorAll('.file-row').length; fileLimit += 40; renderFiles(); document.querySelectorAll('.file-row')[before]?.querySelector('a')?.focus({ preventScroll: true }); });
  const tabs = [$('tab-repos'), $('tab-files')];
  function activateTab(tab) {
    tabs.forEach(t => { const active = t === tab; t.setAttribute('aria-selected', active); t.tabIndex = active ? 0 : -1; $(t.getAttribute('aria-controls')).hidden = !active; });
    if (tab.id === 'tab-files') renderFiles();
  }
  tabs.forEach(tab => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', event => {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        event.preventDefault(); const next = event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs[1] : tabs.find(t => t !== tab); activateTab(next); next.focus();
      }
    });
  });
  function openProject(id, trigger) {
    const p = data.projects.find(item => item.id === id);
    if (!p) return;
    dialogTrigger = trigger;
    $('dialog-category').textContent = `${categories[p.category].label} / ${p.status}`;
    $('dialog-title').textContent = p.title;
    $('dialog-description').textContent = p.description;
    $('dialog-detail').textContent = p.detail || '';
    $('dialog-detail').hidden = !p.detail;
    $('dialog-tags').innerHTML = p.tags.map(t => `<span>${escape(t)}</span>`).join('');
    $('dialog-access').textContent = p.private ? 'Código privado. Esta ficha presenta el propósito y las tecnologías del proyecto.' : `Código público en ${p.repo}. Consultá su documentación para conocer requisitos y estado de desarrollo.`;
    $('dialog-actions').innerHTML = (p.source ? `<a class="button primary" href="${escape(p.source)}"${external}>Explorar código <span aria-hidden="true">↗</span></a>` : '') + (p.demo ? `<a class="button secondary" href="${escape(p.demo)}">Abrir juego <span aria-hidden="true">↗</span></a>` : '');
    $('project-dialog').showModal();
    document.body.style.overflow = 'hidden';
  }
  document.addEventListener('click', event => { const trigger = event.target.closest('[data-project]'); if (trigger) openProject(trigger.dataset.project, trigger); });
  $('close-dialog').addEventListener('click', () => $('project-dialog').close());
  $('project-dialog').addEventListener('click', event => {
    const rect = $('project-dialog').getBoundingClientRect();
    if (event.target === $('project-dialog') && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) $('project-dialog').close();
  });
  $('project-dialog').addEventListener('close', () => { document.body.style.overflow = ''; dialogTrigger?.focus({ preventScroll: true }); });
  renderProjects();
})();
