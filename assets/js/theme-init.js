/* ==========================================================================
   Portfolio BTS SIO — theme-init.js
   Chargé de façon synchrone dans <head>, avant l'affichage de la page :
   - ajoute la classe « js » (active les améliorations : menu mobile, apparitions…) ;
   - applique le thème mémorisé (clair / sombre) pour éviter un flash de couleurs.
   ========================================================================== */
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  try {
    var theme = localStorage.getItem('theme');
    if (theme === 'light' || theme === 'dark') {
      root.setAttribute('data-theme', theme);
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta && theme === 'light') meta.setAttribute('content', '#f3ecdd');
    }
  } catch (e) {
    /* stockage indisponible : thème sombre par défaut */
  }
}());
