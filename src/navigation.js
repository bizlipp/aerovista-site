/**
 * AeroVista Navigation Components
 * Shared navigation-related functionality across the site
 */

/**
 * Initialize site-wide navigation features
 * - Adds mobile navigation toggle
 * - Sets active link state
 * - Handles skip-to-content link
 */
export function initNavigation() {
  setupMobileNavToggle();
  setActiveNavLink();
  ensureSkipLink();
}

/**
 * Setup mobile navigation toggle
 * Creates and adds hamburger button for small screens
 */
function setupMobileNavToggle() {
  const header = document.querySelector('header');
  const nav = document.querySelector('nav');
  
  // Only proceed if we have a header and nav
  if (!header || !nav) return;
  
  // Check if we're on mobile/small screen
  const isMobile = window.innerWidth < 768;
  
  // Only add if on mobile and the toggle doesn't already exist
  if (isMobile && !document.querySelector('.menu-toggle')) {
    // Create menu toggle button
    const menuToggle = document.createElement('button');
    menuToggle.className = 'menu-toggle';
    menuToggle.setAttribute('aria-label', 'Toggle navigation menu');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.innerHTML = '<span></span><span></span><span></span>';
    
    // Add toggle functionality
    menuToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('nav-open');
      menuToggle.classList.toggle('active');
      document.body.classList.toggle('menu-open');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    
    // Add toggle button to header
    header.insertBefore(menuToggle, nav);
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('nav-open') && 
          !e.target.closest('nav') && 
          !e.target.closest('.menu-toggle')) {
        nav.classList.remove('nav-open');
        menuToggle.classList.remove('active');
        document.body.classList.remove('menu-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
    
    // Close menu when pressing escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('nav-open')) {
        nav.classList.remove('nav-open');
        menuToggle.classList.remove('active');
        document.body.classList.remove('menu-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

/**
 * Set active nav link based on current page
 * Adds aria-current and active class to the current page link
 */
function setActiveNavLink() {
  const currentPage = getCurrentPage();
  const navLinks = document.querySelectorAll('nav a');
  
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    const linkPage = linkPath.split('/').pop().split('#')[0]; // Get base filename without hash
    
    // Check if this link corresponds to the current page
    if (currentPage === linkPage || 
        (currentPage === 'index.html' && (linkPath === '/' || linkPath === './' || linkPath === '../'))) {
      link.setAttribute('aria-current', 'page');
      link.classList.add('active');
    }
  });
}

/**
 * Get the current page filename
 * @returns {string} The current page (e.g., 'about.html')
 */
function getCurrentPage() {
  const path = window.location.pathname;
  const page = path.split('/').pop();
  
  // Handle root path
  return page === '' ? 'index.html' : page;
}

/**
 * Ensure skip-to-content link exists
 * Adds a skip link if it doesn't already exist
 */
function ensureSkipLink() {
  // Check if skip link already exists
  if (!document.querySelector('.skip-to-content')) {
    const main = document.querySelector('main') || document.querySelector('#main-content');
    
    if (main) {
      // Ensure main has an id for the skip link target
      if (!main.id) {
        main.id = 'main-content';
      }
      
      // Create skip link
      const skipLink = document.createElement('a');
      skipLink.href = `#${main.id}`;
      skipLink.className = 'skip-to-content';
      skipLink.textContent = 'Skip to content';
      
      // Add to beginning of body
      document.body.insertBefore(skipLink, document.body.firstChild);
    }
  }
}

/**
 * Generate and insert breadcrumb navigation
 * @param {Array} paths - Array of {label, url} objects representing the path
 */
export function insertBreadcrumbs(paths) {
  // Don't add breadcrumbs if we're on the homepage
  if (getCurrentPage() === 'index.html') return;
  
  // Create default path if none provided
  if (!paths || !paths.length) {
    const currentPage = getCurrentPage();
    let section = '';
    
    // Determine section based on path or data-page attribute
    if (currentPage.includes('/')) {
      section = currentPage.split('/')[0];
    } else {
      const bodyDataPage = document.body.getAttribute('data-page');
      if (bodyDataPage) {
        if (bodyDataPage.includes('app-')) {
          section = 'Apps';
        } else if (bodyDataPage.includes('division-')) {
          section = 'Divisions';
        }
      }
    }
    
    paths = [
      { label: 'Home', url: '/' }
    ];
    
    if (section) {
      paths.push({ label: section, url: `/${section.toLowerCase()}.html` });
    }
    
    // Add current page
    const pageTitle = document.title.split('|').pop().trim();
    paths.push({ label: pageTitle, url: '#' });
  }
  
  // Create breadcrumb element
  const breadcrumbs = document.createElement('nav');
  breadcrumbs.className = 'breadcrumbs';
  breadcrumbs.setAttribute('aria-label', 'Breadcrumb');
  
  const breadcrumbList = document.createElement('ol');
  breadcrumbList.className = 'breadcrumb-list';
  
  // Add each breadcrumb item
  paths.forEach((path, index) => {
    const item = document.createElement('li');
    
    if (index === paths.length - 1) {
      // Last item (current page)
      item.innerHTML = `<span aria-current="page">${path.label}</span>`;
    } else {
      item.innerHTML = `<a href="${path.url}">${path.label}</a>`;
    }
    
    breadcrumbList.appendChild(item);
  });
  
  breadcrumbs.appendChild(breadcrumbList);
  
  // Insert after header or as first element in main
  const main = document.querySelector('main') || document.querySelector('#main-content');
  const header = document.querySelector('header');
  
  if (main) {
    main.insertBefore(breadcrumbs, main.firstChild);
  } else if (header) {
    header.parentNode.insertBefore(breadcrumbs, header.nextSibling);
  }
} 