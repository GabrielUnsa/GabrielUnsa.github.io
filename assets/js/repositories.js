(() => {
  'use strict';

  const Portfolio = (window.Portfolio = window.Portfolio || {});

  Portfolio.initRepositories = data => {
    const { $, normalize, escape, compare, number, external, transition } = Portfolio;
    const repoListEl = $('repo-list');
    const fileRepoEl = $('file-repo');
    const fileSearchEl = $('file-search');
    if (!repoListEl || !fileRepoEl || !fileSearchEl) return;

    let fileLimit = 40;

    function repoRow(r) {
      const info = `<h3>${escape(r.name)}</h3><p>${escape(r.description)}</p>`;
      const infoBlock = r.public
        ? `<a class="repo-info" href="${escape(r.url)}"${external}>${info}</a>`
        : `<div class="repo-info">${info}</div>`;
      const endBlock = r.public
        ? `<a class="repo-end" href="${escape(r.url)}"${external} aria-label="Abrir ${escape(r.name)} en GitHub">Público <span aria-hidden="true">↗</span></a>`
        : '<span class="repo-end">Código privado</span>';

      return [
        `<article class="repo-row">`,
        `<span class="repo-symbol" aria-hidden="true">${r.public ? '⌥' : '⊡'}</span>`,
        infoBlock,
        `<div class="tags">${r.tags.slice(0, 3).map(t => `<span>${escape(t)}</span>`).join('')}</div>`,
        endBlock,
        `</article>`
      ].join('');
    }

    repoListEl.innerHTML = [...data.repositories]
      .sort((a, b) => Number(b.public) - Number(a.public) || compare(a.name, b.name))
      .map(repoRow)
      .join('');

    data.repositories
      .filter(r => r.public)
      .sort((a, b) => compare(a.name, b.name))
      .forEach(r => {
        const option = document.createElement('option');
        option.value = r.name;
        option.textContent = r.name;
        fileRepoEl.appendChild(option);
      });

    function renderFiles() {
      const words = normalize(fileSearchEl.value)
        .split(/\s+/)
        .filter(Boolean);
      const repo = fileRepoEl.value;
      const files = data.files.filter(
        f =>
          (repo === 'all' || f.repo === repo) &&
          words.every(word => normalize(`${f.repo} ${f.path}`).includes(word))
      );

      $('file-count').textContent =
        `${number(files.length)} ${files.length === 1 ? 'archivo' : 'archivos'}` +
        (files.length > fileLimit ? ` · mostrando ${fileLimit}` : '');

      $('file-list').innerHTML = files.length
        ? files
            .slice(0, fileLimit)
            .map(f => {
              const pieces = f.path.split('/');
              const name = pieces.pop();
              const ext = name.includes('.') ? name.split('.').pop().slice(0, 7) : 'txt';
              const subpath = pieces.length ? ' / ' + escape(pieces.join(' / ')) : '';
              return `<div class="file-row"><span class="file-ext" aria-hidden="true">${escape(ext)}</span><a href="${escape(f.url)}"${external}><span class="file-name">${escape(name)}</span><span class="file-path">${escape(f.repo)}${subpath}</span></a><span aria-hidden="true">↗</span></div>`;
            })
            .join('')
        : '<p class="empty-state">No hay archivos que coincidan. Probá otro nombre o repositorio.</p>';

      $('more-files').hidden = files.length <= fileLimit;
    }

    fileSearchEl.addEventListener('input', () => {
      fileLimit = 40;
      renderFiles();
    });

    fileRepoEl.addEventListener('change', () => {
      fileLimit = 40;
      renderFiles();
    });

    $('more-files')?.addEventListener('click', () => {
      const before = document.querySelectorAll('.file-row').length;
      fileLimit += 40;
      renderFiles();
      document.querySelectorAll('.file-row')[before]?.querySelector('a')?.focus({ preventScroll: true });
    });

    const tabs = [$('tab-repos'), $('tab-files')].filter(Boolean);

    function activateTab(tab) {
      transition(() => {
        tabs.forEach(t => {
          const active = t === tab;
          t.setAttribute('aria-selected', active);
          t.tabIndex = active ? 0 : -1;
          const panel = $(t.getAttribute('aria-controls'));
          if (panel) panel.hidden = !active;
        });
        if (tab.id === 'tab-files') renderFiles();
      });
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => activateTab(tab));
      tab.addEventListener('keydown', event => {
        if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
          event.preventDefault();
          const next =
            event.key === 'Home'
              ? tabs[0]
              : event.key === 'End'
                ? tabs[1]
                : tabs.find(t => t !== tab);
          if (next) {
            activateTab(next);
            next.focus();
          }
        }
      });
    });
  };
})();

