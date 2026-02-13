/* Component: theme-toggle */
// Theme toggle functionality
(function() {
  // Toggle between light and dark themes
  function toggleTheme() {
    const currentTheme = document.documentElement.dataset.theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.dataset.theme = newTheme;
    localStorage.setItem('theme', newTheme);
  }

  // Add event listener when DOM is ready
  function addThemeToggleListener() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }
  }

  // Mobile Navigation Toggle
  function setupMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const body = document.body;
    
    if (navToggle) {
      navToggle.addEventListener('click', () => {
        body.classList.toggle('nav-open');
      });
    }
    
    // Close nav when clicking a link (but not dropdown toggles)
    const navLinks = document.querySelectorAll('.site-nav a');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // Don't close nav if clicking a dropdown toggle
        if (!link.classList.contains('nav-dropdown-toggle')) {
          body.classList.remove('nav-open');
        }
      });
    });
    
    // Close nav when clicking outside
    document.addEventListener('click', (e) => {
      if (body.classList.contains('nav-open') && 
          !e.target.closest('.site-nav') && 
          !e.target.closest('.nav-toggle')) {
        body.classList.remove('nav-open');
      }
    });
  }

  // Initialize everything when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      addThemeToggleListener();
      setupMobileNav();
    });
  } else {
    addThemeToggleListener();
    setupMobileNav();
  }
})();

/* Component: main-menu */
// Main menu dropdown functionality
(function() {
  // Handle dropdown toggle clicks
  document.addEventListener('click', function(e) {
    const toggle = e.target.closest('.nav-dropdown-toggle');
    
    if (toggle) {
      e.preventDefault();
      e.stopPropagation(); // Prevent event from bubbling up to mobile menu handlers
      
      const dropdown = toggle.closest('.nav-dropdown');
      const isOpen = dropdown.getAttribute('data-open') === 'true';
      
      // Close all other dropdowns first
      document.querySelectorAll('.nav-dropdown[data-open="true"]').forEach(function(openDropdown) {
        if (openDropdown !== dropdown) {
          openDropdown.setAttribute('data-open', 'false');
          const openToggle = openDropdown.querySelector('.nav-dropdown-toggle');
          if (openToggle) {
            openToggle.setAttribute('aria-expanded', 'false');
          }
        }
      });
      
      // Toggle current dropdown
      dropdown.setAttribute('data-open', isOpen ? 'false' : 'true');
      toggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    } else {
      // Click outside - close all dropdowns (but only if not clicking on mobile menu controls)
      if (!e.target.closest('.nav-dropdown-menu') && !e.target.closest('.nav-toggle')) {
        document.querySelectorAll('.nav-dropdown[data-open="true"]').forEach(function(dropdown) {
          dropdown.setAttribute('data-open', 'false');
          const toggle = dropdown.querySelector('.nav-dropdown-toggle');
          if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
          }
        });
      }
    }
  });
  
  // Handle keyboard navigation (Escape key)
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.nav-dropdown[data-open="true"]').forEach(function(dropdown) {
        dropdown.setAttribute('data-open', 'false');
        const toggle = dropdown.querySelector('.nav-dropdown-toggle');
        if (toggle) {
          toggle.setAttribute('aria-expanded', 'false');
          toggle.focus();
        }
      });
    }
  });
})();

/* Component: site-search */
// Site Search Component
(function() {
  let searchIndex = null;
  let searchContainer = null;
  let searchInput = null;
  let searchResults = null;
  let searchResultsInner = null;
  let currentFocusIndex = -1;
  let searchType = 'all';
  let showExcerpt = true;
  let isCompact = false;
  let searchToggleBtn = null;

  // Initialize search when DOM is ready
  function initSiteSearch() {
    searchContainer = document.querySelector('.site-search');
    if (!searchContainer) return;

    searchInput = searchContainer.querySelector('.site-search-input');
    searchResults = searchContainer.querySelector('.search-results');
    searchResultsInner = searchContainer.querySelector('.search-results-inner');
    searchToggleBtn = searchContainer.querySelector('.search-toggle-btn');
    
    if (!searchInput || !searchResults) return;

    // Get settings from data attributes
    searchType = searchContainer.dataset.searchType || 'all';
    showExcerpt = searchContainer.dataset.showExcerpt !== 'false';
    isCompact = searchContainer.dataset.compact === 'true';

    // Load search index
    loadSearchIndex();

    // Add event listeners
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('keydown', handleKeyboardNavigation);
    searchInput.addEventListener('focus', handleSearchFocus);
    
    // Compact mode toggle
    if (isCompact && searchToggleBtn) {
      searchToggleBtn.addEventListener('click', toggleCompactSearch);
    }
    
    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
      if (!searchContainer.contains(e.target)) {
        hideSearchResults();
        // Collapse compact search when clicking outside
        if (isCompact && searchContainer.classList.contains('expanded')) {
          collapseCompactSearch();
        }
      }
    });
  }

  // Toggle compact search expansion
  function toggleCompactSearch() {
    if (searchContainer.classList.contains('expanded')) {
      collapseCompactSearch();
    } else {
      expandCompactSearch();
    }
  }

  // Expand compact search
  function expandCompactSearch() {
    searchContainer.classList.add('expanded');
    searchToggleBtn.setAttribute('aria-expanded', 'true');
    // Focus the input after a short delay to allow animation
    setTimeout(() => {
      searchInput.focus();
    }, 100);
  }

  // Collapse compact search
  function collapseCompactSearch() {
    searchContainer.classList.remove('expanded');
    searchToggleBtn.setAttribute('aria-expanded', 'false');
    searchInput.value = '';
    hideSearchResults();
  }

  // Load the search index JSON
  async function loadSearchIndex() {
    try {
      const response = await fetch('/static/search-index.json');
      if (!response.ok) {
        console.warn('Search index not found');
        return;
      }
      searchIndex = await response.json();
    } catch (error) {
      console.error('Failed to load search index:', error);
    }
  }

  // Handle search input changes
  function handleSearchInput(e) {
    const query = e.target.value.trim();
    
    if (query.length < 2) {
      hideSearchResults();
      return;
    }

    performSearch(query);
  }

  // Handle search input focus
  function handleSearchFocus() {
    const query = searchInput.value.trim();
    if (query.length >= 2 && searchResultsInner.children.length > 0) {
      showSearchResults();
    }
  }

  // Perform the search
  function performSearch(query) {
    if (!searchIndex || !searchIndex.items) {
      showNoResults('Search index not loaded');
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results = [];

    // Filter items based on search type
    let itemsToSearch = searchIndex.items;
    if (searchType !== 'all') {
      itemsToSearch = searchIndex.items.filter(item => item.type === searchType);
    }

    // Search through items
    itemsToSearch.forEach(item => {
      const titleMatch = item.title.toLowerCase().includes(lowerQuery);
      const excerptMatch = item.excerpt?.toLowerCase().includes(lowerQuery) || false;
      const contentMatch = item.content?.toLowerCase().includes(lowerQuery) || false;

      if (titleMatch || excerptMatch || contentMatch) {
        // Calculate relevance score
        let score = 0;
        if (titleMatch) score += 10;
        if (excerptMatch) score += 5;
        if (contentMatch) score += 1;

        results.push({
          ...item,
          score
        });
      }
    });

    // Sort by relevance score
    results.sort((a, b) => b.score - a.score);

    // Limit results
    const limitedResults = results.slice(0, 10);

    if (limitedResults.length === 0) {
      showNoResults(`No results found for "${query}"`);
    } else {
      displaySearchResults(limitedResults, query);
    }
  }

  // Display search results
  function displaySearchResults(results, query) {
    currentFocusIndex = -1;
    const lowerQuery = query.toLowerCase();
    
    const resultsHtml = results.map((item, index) => {
      // Highlight query in title
      const titleWithHighlight = highlightText(item.title, query);
      
      // Highlight query in excerpt (if enabled)
      const excerptWithHighlight = showExcerpt && item.excerpt ? 
        highlightText(item.excerpt, query) : '';

      return `
        <a href="${item.url}" class="search-result-item" data-index="${index}" role="option">
          <span class="search-result-title">${titleWithHighlight}</span>
          <div class="search-result-meta">
            <span class="search-result-type">${item.type}</span>
            ${item.date ? `<span class="search-result-date">${item.date}</span>` : ''}
          </div>
          ${excerptWithHighlight ? `<div class="search-result-excerpt">${excerptWithHighlight}</div>` : ''}
        </a>
      `;
    }).join('');

    searchResultsInner.innerHTML = resultsHtml;
    showSearchResults();
  }

  // Highlight search query in text
  function highlightText(text, query) {
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  // Escape special regex characters
  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Show "no results" message
  function showNoResults(message) {
    searchResultsInner.innerHTML = `<div class="search-no-results">${message}</div>`;
    showSearchResults();
  }

  // Show search results dropdown
  function showSearchResults() {
    searchResults.removeAttribute('hidden');
  }

  // Hide search results dropdown
  function hideSearchResults() {
    searchResults.setAttribute('hidden', '');
    currentFocusIndex = -1;
    clearKeyboardFocus();
  }

  // Handle keyboard navigation
  function handleKeyboardNavigation(e) {
    const resultItems = searchResultsInner.querySelectorAll('.search-result-item');
    
    if (resultItems.length === 0) return;

    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        currentFocusIndex++;
        if (currentFocusIndex >= resultItems.length) {
          currentFocusIndex = 0;
        }
        updateKeyboardFocus(resultItems);
        break;

      case 'ArrowUp':
        e.preventDefault();
        currentFocusIndex--;
        if (currentFocusIndex < 0) {
          currentFocusIndex = resultItems.length - 1;
        }
        updateKeyboardFocus(resultItems);
        break;

      case 'Enter':
        e.preventDefault();
        if (currentFocusIndex >= 0 && resultItems[currentFocusIndex]) {
          resultItems[currentFocusIndex].click();
        }
        break;

      case 'Escape':
        hideSearchResults();
        searchInput.blur();
        // Collapse compact search on Escape
        if (isCompact && searchContainer.classList.contains('expanded')) {
          collapseCompactSearch();
        }
        break;
    }
  }

  // Update keyboard focus styling
  function updateKeyboardFocus(items) {
    clearKeyboardFocus();
    
    if (currentFocusIndex >= 0 && items[currentFocusIndex]) {
      items[currentFocusIndex].classList.add('keyboard-focus');
      items[currentFocusIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  // Clear keyboard focus styling
  function clearKeyboardFocus() {
    const focused = searchResultsInner.querySelectorAll('.keyboard-focus');
    focused.forEach(item => item.classList.remove('keyboard-focus'));
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSiteSearch);
  } else {
    initSiteSearch();
  }
})();

/* Component: sprite-animation */
// Sprite Animation Component
(function() {
  function initSpriteAnimation(container) {
    const image = container.dataset.spriteImage;
    const sheetWidth = parseInt(container.dataset.spriteWidth);
    const sheetHeight = parseInt(container.dataset.spriteHeight);
    const frameCount = parseInt(container.dataset.spriteFrames);
    const fps = parseInt(container.dataset.spriteFps) || 12;
    
    if (!image || !sheetWidth || !sheetHeight || !frameCount) {
      console.warn('Sprite animation missing required attributes');
      return;
    }
    
    // Calculate frame width (horizontal sprite sheet)
    const frameWidth = sheetWidth / frameCount;
    
    // Get max dimensions from inline style or use defaults
    let maxWidth = frameWidth;
    let maxHeight = sheetHeight;
    
    const inlineStyle = container.getAttribute('style');
    if (inlineStyle) {
      const widthMatch = inlineStyle.match(/width:\s*(\d+)px/);
      const heightMatch = inlineStyle.match(/height:\s*(\d+)px/);
      if (widthMatch) maxWidth = parseInt(widthMatch[1]);
      if (heightMatch) maxHeight = parseInt(heightMatch[1]);
    }
    
    // Make responsive - don't exceed viewport width minus padding
    const viewportWidth = window.innerWidth;
    const maxAllowedWidth = Math.min(maxWidth, viewportWidth - 40); // 20px padding each side
    
    // Maintain aspect ratio
    const aspectRatio = frameWidth / sheetHeight;
    let displayWidth = maxAllowedWidth;
    let displayHeight = displayWidth / aspectRatio;
    
    // Set container size
    container.style.width = displayWidth + 'px';
    container.style.height = displayHeight + 'px';
    
    const canvas = container.querySelector('.sprite-canvas');
    canvas.style.backgroundImage = `url(${image})`;
    
    // Scale the background to match display size
    const scaleFactor = displayWidth / frameWidth;
    canvas.style.backgroundSize = `${sheetWidth * scaleFactor}px ${sheetHeight * scaleFactor}px`;
    
    // Animation variables
    let currentFrame = 0;
    const frameDelay = 1000 / fps;
    
    // Animate sprite
    function animate() {
      const xPos = -(currentFrame * displayWidth);
      canvas.style.backgroundPosition = `${xPos}px 0`;
      
      currentFrame = (currentFrame + 1) % frameCount;
    }
    
    // Start animation loop
    setInterval(animate, frameDelay);
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function() {
        const newViewportWidth = window.innerWidth;
        const newMaxAllowedWidth = Math.min(maxWidth, newViewportWidth - 40);
        const newDisplayWidth = newMaxAllowedWidth;
        const newDisplayHeight = newDisplayWidth / aspectRatio;
        
        container.style.width = newDisplayWidth + 'px';
        container.style.height = newDisplayHeight + 'px';
        
        const newScaleFactor = newDisplayWidth / frameWidth;
        canvas.style.backgroundSize = `${sheetWidth * newScaleFactor}px ${sheetHeight * newScaleFactor}px`;
      }, 250);
    });
  }
  
  // Initialize all sprite animations on page load
  document.addEventListener('DOMContentLoaded', function() {
    const sprites = document.querySelectorAll('.sprite-animation');
    sprites.forEach(initSpriteAnimation);
  });
})();
