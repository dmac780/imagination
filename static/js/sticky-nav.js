/**
 * Sticky nav hide on scroll
 * @author: dmac780 <https://github.com/dmac780>
 */

(function() {
  const stickyNav = document.querySelector('.sticky-nav');

  if (!stickyNav || !document.body.dataset.stickyNavHideOnScroll) {
    return;
  }

  let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
  let isScrolling   = false;
  const threshold   = 5;
  
  function closeAllDropdowns() {
    document.querySelectorAll('.nav-dropdown[data-open="true"]').forEach(function(dropdown) {
      dropdown.setAttribute('data-open', 'false');

      const toggle = dropdown.querySelector('.nav-dropdown-toggle');

      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
  
  function handleScroll() {
    if (isScrolling) {
      return;
    }
    
    isScrolling = true;

    requestAnimationFrame(() => {
      const scrollTop  = window.pageYOffset || document.documentElement.scrollTop;
      const scrollDiff = Math.abs(scrollTop - lastScrollTop);
      
      // Only process if scrolled more than threshold
      if (scrollDiff > threshold) {
        // Only hide if scrolled down more than 100px
        if (scrollTop > 100) {
          if (scrollTop > lastScrollTop) {
            // Scrolling down
            stickyNav.classList.add('nav-hidden');
            // Close any open dropdowns when hiding nav
            closeAllDropdowns();
          } else {
            // Scrolling up - show immediately
            stickyNav.classList.remove('nav-hidden');
          }
        } else {
          // At top of page, always show
          stickyNav.classList.remove('nav-hidden');
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
      }
      
      isScrolling = false;
    });
  }
  
  window.addEventListener('scroll', handleScroll, { passive: true });
})();
