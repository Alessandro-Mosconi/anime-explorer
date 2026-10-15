// Aggiorna qui il numero di versione mostrato nel sito.
const ANIME_EXPLORER_VERSION = '1.6';
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-app-version]').forEach(element => {
    element.textContent = (element.dataset.prefix || '') + ANIME_EXPLORER_VERSION;
  });
});
