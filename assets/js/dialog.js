(() => {
  'use strict';

  const Portfolio = (window.Portfolio = window.Portfolio || {});

  Portfolio.initDialog = data => {
    const { $, categories, escape, external } = Portfolio;
    const dialog = $('project-dialog');
    if (!dialog) return;

    let dialogTrigger = null;

    function openProject(id, trigger) {
      const p = data.projects.find(item => item.id === id);
      if (!p) return;

      const categoryInfo = categories[p.category] || categories.all;
      dialogTrigger = trigger;

      $('dialog-category').textContent = `${categoryInfo.label} / ${p.status}`;
      $('dialog-title').textContent = p.title;
      $('dialog-description').textContent = p.description;
      $('dialog-detail').textContent = p.detail || '';
      $('dialog-detail').hidden = !p.detail;
      $('dialog-tags').innerHTML = p.tags.map(t => `<span>${escape(t)}</span>`).join('');
      $('dialog-access').textContent = p.private
        ? 'Código privado. Esta ficha presenta el propósito y las tecnologías del proyecto.'
        : `Código público en ${p.repo}. Consultá su documentación para conocer requisitos y estado de desarrollo.`;

      const sourceLink = p.source
        ? `<a class="button primary" href="${escape(p.source)}"${external}>Explorar código <span aria-hidden="true">↗</span></a>`
        : '';
      const demoLink = p.demo
        ? `<a class="button secondary" href="${escape(p.demo)}">Abrir juego <span aria-hidden="true">↗</span></a>`
        : '';

      $('dialog-actions').innerHTML = sourceLink + demoLink;
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    }

    document.addEventListener('click', event => {
      const trigger = event.target.closest('[data-project]');
      if (trigger) openProject(trigger.dataset.project, trigger);
    });

    $('close-dialog')?.addEventListener('click', () => dialog.close());

    dialog.addEventListener('click', event => {
      const rect = dialog.getBoundingClientRect();
      const clickedOutside =
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom;
      if (event.target === dialog && clickedOutside) {
        dialog.close();
      }
    });

    dialog.addEventListener('close', () => {
      document.body.style.overflow = '';
      dialogTrigger?.focus({ preventScroll: true });
    });
  };
})();

