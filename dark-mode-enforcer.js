// Dark Mode Enforcer for AeroVista
// This script forces the site to stay in dark mode regardless of user preferences

document.addEventListener('DOMContentLoaded', function() {
  // Throttle function to prevent excessive calls
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      if (!inThrottle) {
        func.apply(this, arguments);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }

  function enforceDarkMode() {
    // Only update if not already in dark mode
    if (document.documentElement.getAttribute('data-theme') !== 'dark' ||
        !document.body.classList.contains('dark-theme')) {
      
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
      
      // Remove override classes only if they exist
      ['light', 'light-mode', 'theme-light'].forEach(cls => {
        if (document.documentElement.classList.contains(cls)) {
          document.documentElement.classList.remove(cls);
        }
        if (document.body.classList.contains(cls)) {
          document.body.classList.remove(cls);
        }
      });
    }
  }

  // Initial enforcement
  enforceDarkMode();
  
  // Clear any saved theme preferences
  localStorage.removeItem('theme');
  sessionStorage.removeItem('theme');
    // Override any potential preference-based changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addListener(throttle(enforceDarkMode, 250));
  }
  
  // Prevent theme switching by overriding any theme toggle functionality
  const throttledEnforceDarkMode = throttle(enforceDarkMode, 250);
  const observer = new MutationObserver(function(mutations) {
    let needsEnforcement = false;
    
    for (const mutation of mutations) {
      if ((mutation.type === 'attributes' && 
          (mutation.attributeName === 'data-theme' || mutation.attributeName === 'class')) &&
          !needsEnforcement) {
        needsEnforcement = true;
        break;
      }
    }
    
    if (needsEnforcement) {
      throttledEnforceDarkMode();
    }
  });
    // Observe both data-theme and class changes
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'class', 'style']
  });
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class', 'style']
  });
  
  // Remove theme toggle buttons and any light theme related elements
  const themeToggles = document.querySelectorAll('.dark-mode-toggle, .theme-toggle, [data-theme-toggle], .light-mode-toggle, .theme-switcher');
  themeToggles.forEach(button => button.remove());
    // Clear any theme preferences permanently
  localStorage.removeItem('theme');
  sessionStorage.removeItem('theme');
  
  // One-time override of storage to prevent future changes
  try {
    Object.defineProperty(localStorage, 'theme', {
      value: 'dark',
      writable: false,
      configurable: false
    });
    Object.defineProperty(sessionStorage, 'theme', {
      value: 'dark',
      writable: false,
      configurable: false
    });
  } catch (e) {
    // Ignore if storage is already locked
  }
  
  console.log('%cDark mode enforced by administrator', 'color:#00d2ff; font-weight:bold;');
});