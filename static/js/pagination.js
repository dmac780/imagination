/**
 * Drop-in DSSG Client-side pagination for content indexes
 * @author: dmac780 <https://github.com/dmac780>
 */

(function() {

  const contentGrid = document.querySelector('.content-grid');

  if (!contentGrid) {
    return;
  }
  
  const cards = Array.from(contentGrid.querySelectorAll('.content-card'));

  if (cards.length === 0) {
    return;
  }

  const postsPerPage = parseInt(contentGrid.dataset.postsPerPage) || 10;
  const totalPages   = Math.ceil(cards.length / postsPerPage);
  const urlParams    = new URLSearchParams(window.location.search);
  let currentPage    = parseInt(urlParams.get('page')) || 1;

  if (currentPage < 1) {
    currentPage = 1;
  }

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  // Show cards for current page
  function showPage(page) {
    cards.forEach(card => card.style.display = 'none');
    
    const start = (page - 1) * postsPerPage;
    const end   = start + postsPerPage;

    cards.slice(start, end).forEach(card => card.style.display = '');
    
    updatePaginationControls(page);
  }
  
  // Update pagination controls
  function updatePaginationControls(page) {
    const existing = document.querySelector('.pagination-controls');

    if (existing) {
      existing.remove();
    }

    if (totalPages <= 1) {
      return;
    }

    const controls     = document.createElement('div');
    controls.className = 'pagination-controls';
    
    if (page > 1) {
      const prev = document.createElement('a');

      prev.href        = `?page=${page - 1}`;
      prev.className   = 'pagination-btn';
      prev.textContent = '← Previous';

      prev.addEventListener('click', (e) => {
        e.preventDefault();
        navigateToPage(page - 1);
      });

      controls.appendChild(prev);
    }
    
    const info       = document.createElement('span');
    info.className   = 'pagination-info';
    info.textContent = `Page ${page} of ${totalPages}`;

    controls.appendChild(info);
    
    if (page < totalPages) {
      const next = document.createElement('a');

      next.href        = `?page=${page + 1}`;
      next.className   = 'pagination-btn';
      next.textContent = 'Next →';

      next.addEventListener('click', (e) => {
        e.preventDefault();
        navigateToPage(page + 1);
      });

      controls.appendChild(next);
    }
    
    contentGrid.parentNode.appendChild(controls);
  }
  
  // Navigate to page
  function navigateToPage(page) {
    const url = new URL(window.location);

    url.searchParams.set('page', page);

    window.history.pushState({}, '', url);

    currentPage = page;

    showPage(page);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  // Handle browser back/forward
  window.addEventListener('popstate', () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentPage     = parseInt(urlParams.get('page')) || 1;

    showPage(currentPage);
  });
  
  showPage(currentPage);

})();
