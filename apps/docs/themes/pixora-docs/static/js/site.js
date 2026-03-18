(() => {
  const storageKey = 'pixora-docs-theme';
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  const getStoredTheme = () => {
    try {
      const value = window.localStorage.getItem(storageKey);
      return value === 'light' || value === 'dark' ? value : null;
    } catch (_error) {
      return null;
    }
  };

  const resolveTheme = () => getStoredTheme() ?? (media.matches ? 'dark' : 'light');

  const persistTheme = (theme) => {
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch (_error) {
      // Ignore storage access errors and keep the in-memory state.
    }
  };

  const updateButtons = (theme) => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    const icon = nextTheme === 'dark' ? 'dark_mode' : 'light_mode';
    const label = nextTheme === 'dark' ? 'Dark mode' : 'Light mode';

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.setAttribute('aria-label', `Switch to ${label.toLowerCase()}`);

      const iconElement = button.querySelector('[data-theme-icon]');
      if (iconElement) {
        iconElement.textContent = icon;
      }

      const labelElement = button.querySelector('[data-theme-label]');
      if (labelElement) {
        labelElement.textContent = label;
      }
    });
  };

  const applyTheme = (theme) => {
    root.classList.toggle('dark', theme === 'dark');
    root.dataset.theme = theme;
    updateButtons(theme);
  };

  const toggleTheme = () => {
    const currentTheme = root.classList.contains('dark') ? 'dark' : 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    persistTheme(nextTheme);
    applyTheme(nextTheme);
  };

  const init = () => {
    applyTheme(resolveTheme());

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.addEventListener('click', toggleTheme);
    });

    media.addEventListener?.('change', () => {
      if (!getStoredTheme()) {
        applyTheme(resolveTheme());
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
