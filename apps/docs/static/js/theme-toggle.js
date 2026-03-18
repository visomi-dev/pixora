(function () {
  const html = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');

  if (!themeToggle) return;

  // Initial theme setup
  const savedTheme = localStorage.getItem('theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'light') {
    html.classList.remove('dark');
    html.classList.add('light');
  } else if (!savedTheme && systemDark) {
    html.classList.add('dark');
  }

  themeToggle.addEventListener('click', function () {
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      html.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      html.classList.remove('light');
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  });
})();
