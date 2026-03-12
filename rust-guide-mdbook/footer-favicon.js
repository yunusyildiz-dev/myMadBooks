(function() {
  function initFooterFavicon() {
    if (document.getElementById('yunus-footer-favicon')) return;

    var faviconHref = 'favicon.png';
    var link = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    if (link && link.getAttribute('href')) {
      faviconHref = link.getAttribute('href');
    }

    var div = document.createElement('div');
    div.id = 'yunus-footer-favicon';
    div.className = 'yunus-footer-favicon';
    div.innerHTML = '<img src="' + faviconHref + '" alt="">';

    document.body.appendChild(div);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooterFavicon);
  } else {
    initFooterFavicon();
  }
})();
