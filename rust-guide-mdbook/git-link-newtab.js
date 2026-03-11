(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const gitLink = document.querySelector('a[title="Git repository"]');
        if (gitLink) {
            gitLink.setAttribute('target', '_blank');
            gitLink.setAttribute('rel', 'noopener noreferrer');
        }
    });
})();
