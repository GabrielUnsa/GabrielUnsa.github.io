(() => {
  'use strict';
  const key = 'gabriel-portfolio-theme';
  const root = document.documentElement;
  const system = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  const valid = value => value === 'light' || value === 'dark';
  let preference = null;
  try {
    const stored = localStorage.getItem(key);
    if (valid(stored)) preference = stored;
  } catch { /* The selector also works when storage is unavailable. */ }

  function apply(theme) {
    root.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#0c1110' : '#f7f9f5';
    const button = document.getElementById('theme-toggle');
    if (!button) return;
    const target = theme === 'dark' ? 'claro' : 'oscuro';
    button.setAttribute('aria-label', `Cambiar a tema ${target}`);
    button.title = `Cambiar a tema ${target}`;
    document.getElementById('theme-icon').textContent = theme === 'dark' ? '☀' : '☾';
    document.getElementById('theme-label').textContent = theme === 'dark' ? 'Claro' : 'Oscuro';
    button.hidden = false;
  }

  const defaultTheme = () => system?.matches ? 'dark' : 'light';
  apply(preference || defaultTheme());
  document.addEventListener('DOMContentLoaded', () => {
    apply(root.dataset.theme);
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      apply(preference);
      try { localStorage.setItem(key, preference); } catch { /* Keep this visit's choice. */ }
    });
  });
  system?.addEventListener?.('change', () => {
    if (!preference) apply(defaultTheme());
  });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    preference = valid(event.newValue) ? event.newValue : null;
    apply(preference || defaultTheme());
  });
})();
