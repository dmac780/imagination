/**
 * Prevents flash of unstyled content from theme-switcher
 * @author: dmac780 <https://github.com/dmac780>
 */

(function() {

  const savedTheme = localStorage.getItem('theme') || 'light';

  document.documentElement.dataset.theme = savedTheme;

})();