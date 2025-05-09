// Dark Mode Enforcer for AeroVista
// This script forces the site to stay in dark mode regardless of user preferences

document.addEventListener('DOMContentLoaded', function() {
  // Force dark mode on page load
  document.documentElement.setAttribute('data-theme', 'dark');
  
  // Prevent theme switching by overriding any theme toggle functionality
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && 
          mutation.attributeName === 'data-theme' && 
          document.documentElement.getAttribute('data-theme') !== 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    });
  });
  
  // Start observing the document for changes to data-theme attribute
  observer.observe(document.documentElement, { 
    attributes: true,
    attributeFilter: ['data-theme']
  });
  
  // Disable any existing theme toggle buttons
  const themeToggles = document.querySelectorAll('.dark-mode-toggle, .theme-toggle');
  themeToggles.forEach(button => {
    button.style.display = 'none';
  });
  
  console.log('%cDark mode enforced by administrator', 'color:#00d2ff; font-weight:bold;');
}); 