(() => {
  'use strict';

  const Portfolio = (window.Portfolio = window.Portfolio || {});

  Portfolio.initLearning = data => {
    if (!data.learning) return;
    const { $, normalize, escape, compare, external, projectCard } = Portfolio;
    const learning = data.learning;
    const statusLabels = {
      completed: 'Realizado',
      participation: 'Participación',
      'in-progress': 'En curso'
    };
    let trainingLimit = 12;

    $('training-summary').innerHTML = [
      ['completed', 'cursos realizados'],
      ['participation', 'actividades de actualización'],
      ['in-progress', 'en curso']
    ]
      .map(
        ([status, label]) =>
          `<div><strong>${learning.courses.filter(c => c.status === status).length}</strong><span>${label}</span></div>`
      )
      .join('');

    const selectedCourses = [
      'Bootcamp Full Stack',
      'Data Analysis with Python',
      'Introducción a la IA generativa'
    ]
      .map(title => learning.courses.find(c => c.title.includes(title)))
      .filter(Boolean);

    $('course-preview').innerHTML = selectedCourses
      .map(
        c =>
          `<article><time datetime="${escape(c.date)}">${escape(c.date.slice(0, 4))}</time><h3>${escape(c.title)}</h3><p>${escape(c.institution)}</p></article>`
      )
      .join('');

    [...new Set(learning.courses.map(c => c.date.slice(0, 4)))]
      .sort()
      .reverse()
      .forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        $('training-year').appendChild(option);
      });

    function renderTraining() {
      const words = normalize($('training-search').value)
        .split(/\s+/)
        .filter(Boolean);
      const year = $('training-year').value;
      const status = $('training-status').value;

      const courses = learning.courses.filter(
        c =>
          (year === 'all' || c.date.startsWith(year)) &&
          (status === 'all' || c.status === status) &&
          words.every(word => normalize(`${c.title} ${c.institution} ${c.kind}`).includes(word))
      );

      $('training-count').textContent =
        `${courses.length} ${courses.length === 1 ? 'registro' : 'registros'}` +
        (courses.length > trainingLimit ? ` · mostrando ${trainingLimit}` : '');

      $('training-list').innerHTML = courses
        .slice(0, trainingLimit)
        .map(c => {
          const date =
            c.date.length === 4
              ? escape(c.date)
              : new Intl.DateTimeFormat('es-AR', {
                  month: 'long',
                  year: 'numeric',
                  timeZone: 'UTC'
                }).format(new Date(`${c.date}-01T12:00:00Z`));
          const dateMarkup =
            c.date.length === 4
              ? `<span class="training-date">${date}</span>`
              : `<time class="training-date" datetime="${escape(c.date)}">${date}</time>`;
          const materialLink = c.material
            ? `<a href="${escape(c.material)}"${external}>Prácticas relacionadas ↗</a>`
            : '';

          return `<article class="training-row" role="listitem">${dateMarkup}<div class="training-info"><h3 tabindex="-1">${escape(c.title)}</h3><p>${escape(c.institution)}</p></div><div class="training-meta"><span class="training-status status-${escape(c.status)}">${statusLabels[c.status]}</span>${materialLink}</div></article>`;
        })
        .join('');

      $('training-empty').hidden = courses.length > 0;
      $('more-training').hidden = courses.length <= trainingLimit;
      $('more-training').textContent = `Ver más formación (${Math.max(0, courses.length - trainingLimit)}) ↓`;
    }

    ['training-search', 'training-year', 'training-status'].forEach(id => {
      $(id)?.addEventListener(id === 'training-search' ? 'input' : 'change', () => {
        trainingLimit = 12;
        renderTraining();
      });
    });

    $('more-training')?.addEventListener('click', () => {
      const before = $('training-list').children.length;
      trainingLimit += 12;
      renderTraining();
      $('training-list').children[before]?.querySelector('h3')?.focus({ preventScroll: true });
    });

    $('reset-training')?.addEventListener('click', () => {
      $('training-search').value = '';
      $('training-year').value = 'all';
      $('training-status').value = 'all';
      trainingLimit = 12;
      renderTraining();
      $('training-search').focus();
    });

    $('study-grid').innerHTML = learning.studyProjectIds
      .map(id => data.projects.find(p => p.id === id))
      .filter(Boolean)
      .map(projectCard)
      .join('');

    $('research-grid').innerHTML = learning.researchProjectIds
      .map(id => data.projects.find(p => p.id === id))
      .filter(Boolean)
      .map(projectCard)
      .join('');

    $('publication-grid').innerHTML = [...learning.publications]
      .sort((a, b) => compare(b.year, a.year))
      .map(p => {
        const relatedBtn = p.projectId
          ? `<button class="text-link" data-project="${escape(p.projectId)}" type="button">Ver desarrollo relacionado <span aria-hidden="true">↗</span></button>`
          : '';
        return `<article class="publication-card"><p class="card-kicker">${escape(p.type)} · ${escape(p.year)}</p><h3>${escape(p.title)}</h3><p class="publication-venue">${escape(p.venue)}</p><p class="publication-authors">${escape(p.authors)}</p><p class="publication-description">${escape(p.description)}</p><div class="publication-actions"><a class="text-link" href="${escape(p.url)}"${external}>${escape(p.sourceLabel)} <span aria-hidden="true">↗</span></a>${relatedBtn}</div></article>`;
      })
      .join('');

    renderTraining();
  };
})();

