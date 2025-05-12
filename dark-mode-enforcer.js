// Dark Mode Enforcer for AeroVista
// This script forces the site to stay in dark mode regardless of user preferences

document.addEventListener('DOMContentLoaded', function() {
  function enforceDarkMode() {
    // Force dark mode on page load
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.style.colorScheme = 'dark';
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
    
    // Remove any potential override classes
    document.documentElement.classList.remove('light', 'light-mode', 'theme-light');
    document.body.classList.remove('light', 'light-mode', 'theme-light');
  }

  // Initial enforcement
  enforceDarkMode();
  
  // Clear any saved theme preferences
  localStorage.removeItem('theme');
  sessionStorage.removeItem('theme');
  
  // Override any potential preference-based changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addListener(enforceDarkMode);
  }
  
  // Prevent theme switching by overriding any theme toggle functionality
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
      }
    });
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
  
  // Override any stored preference with getters and setters
  Object.defineProperty(localStorage, 'theme', {
    get: () => 'dark',
    set: () => 'dark',
    configurable: false,
    enumerable: true
  });
  
  Object.defineProperty(sessionStorage, 'theme', {
    get: () => 'dark',
    set: () => 'dark',
    configurable: false,
    enumerable: true
  });

  // Periodically check and re-enforce dark mode
  setInterval(enforceDarkMode, 1000);
  
  console.log('%cDark mode enforced by administrator', 'color:#00d2ff; font-weight:bold;');
});