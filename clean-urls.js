// Clean URLs handler for GitHub Pages
// This script handles client-side routing to remove .html extensions from URLs

(function() {
  'use strict';

  // Map of clean URLs to actual file paths
  const routes = {
    '/': '/index.html',
    '/work': '/work.html',
    '/about': '/about.html',
    '/musings': '/musings.html'
  };

  // Function to get the current path without query parameters
  function getCurrentPath() {
    return window.location.pathname;
  }

  // Function to navigate to a clean URL
  function navigateToCleanUrl(path) {
    const cleanPath = path.replace('.html', '');
    if (cleanPath !== getCurrentPath()) {
      window.history.pushState(null, '', cleanPath);
    }
  }

  // Function to load content for a given path
  function loadPage(path) {
    const actualPath = routes[path] || path;
    
    // If it's the current page, just update the URL
    if (actualPath === window.location.pathname) {
      navigateToCleanUrl(path);
      return;
    }

    // For GitHub Pages, we need to handle this differently
    // Since we can't do server-side routing, we'll redirect to the actual file
    if (routes[path]) {
      window.location.href = routes[path];
    }
  }

  // Handle browser back/forward buttons
  window.addEventListener('popstate', function(event) {
    const path = getCurrentPath();
    loadPage(path);
  });

  // Handle initial page load
  function handleInitialLoad() {
    const currentPath = getCurrentPath();
    
    // If we're on a clean URL, make sure we're on the right page
    if (routes[currentPath]) {
      // We're already on the right page, just ensure URL is clean
      navigateToCleanUrl(currentPath);
    } else if (currentPath.endsWith('.html')) {
      // We're on a .html URL, redirect to clean URL
      const cleanPath = currentPath.replace('.html', '');
      if (routes[cleanPath]) {
        window.history.replaceState(null, '', cleanPath);
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleInitialLoad);
  } else {
    handleInitialLoad();
  }

  // Expose navigation function globally for use by other scripts
  window.navigateToCleanUrl = function(path) {
    navigateToCleanUrl(path);
  };

})();
