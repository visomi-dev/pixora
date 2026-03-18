(function () {
  function addCopyButtons() {
    document.querySelectorAll('.chroma').forEach(function (block) {
      if (block.querySelector('.copy-btn')) return;

      const code = block.querySelector('code');
      if (!code) return;

      const text = code.textContent;
      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = 'Copy';
      btn.setAttribute('data-code', text);
      block.appendChild(btn);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addCopyButtons);
  } else {
    addCopyButtons();
  }

  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('copy-btn')) {
      const code = e.target.getAttribute('data-code');
      if (!code) {
        const wrapper = e.target.closest('.code-block-wrapper');
        if (wrapper) {
          const codeEl = wrapper.querySelector('code');
          if (codeEl) {
            code = codeEl.textContent;
          }
        }
      }

      if (code) {
        navigator.clipboard.writeText(code).then(function () {
          const originalText = e.target.textContent;
          e.target.textContent = 'Copied!';
          e.target.classList.add('copied');
          setTimeout(function () {
            e.target.textContent = originalText;
            e.target.classList.remove('copied');
          }, 2000);
        });
      }
    }
  });
})();
