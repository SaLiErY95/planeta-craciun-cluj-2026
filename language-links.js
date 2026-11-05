/* Keep the visitor's section when switching to another language page. */
(() => {
  const links = document.querySelectorAll('.language-switcher a');
  function sync() {
    links.forEach(link => {
      const url = new URL(link.getAttribute('href'), window.location.href);
      url.hash = window.location.hash;
      link.setAttribute('href', url.pathname + url.search + url.hash);
    });
  }
  sync();
  window.addEventListener('hashchange', sync);
})();
