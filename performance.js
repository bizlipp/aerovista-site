/**
 * AeroVista Performance Optimization
 * Handles initial loading optimizations and performance enhancements
 */

// Add js-loading class to improve First Contentful Paint
document.documentElement.classList.add('js-loading');

// Remove the class after the page has loaded to enable animations
window.addEventListener('load', function() {
  // Small delay to ensure smooth transition
  setTimeout(function() {
    document.documentElement.classList.remove('js-loading');
  }, 100);
});

// Mark above-the-fold images with loading="eager" for priority loading
document.addEventListener('DOMContentLoaded', function() {
  // Find hero and above-fold images and update their loading attribute
  const heroImages = document.querySelectorAll('.hero img, .above-fold img');
  heroImages.forEach(function(img) {
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'eager');
    }
  });
  
  // Set non-critical images to lazy load
  const belowFoldImages = document.querySelectorAll('img:not([loading])');
  belowFoldImages.forEach(function(img) {
    // Don't override any explicitly set loading attributes
    if (!img.closest('.hero') && !img.closest('.above-fold')) {
      img.setAttribute('loading', 'lazy');
    }
  });
});

// Detect if the browser supports modern image formats
function checkBrowserSupport() {
  // Check for WebP support
  const webpSupport = document.createElement('canvas')
    .toDataURL('image/webp')
    .indexOf('data:image/webp') === 0;
  
  // Add support classes to document
  if (webpSupport) {
    document.documentElement.classList.add('webp-support');
  }
  
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('reduced-motion');
  }
}

// Lazily load offscreen images
function initLazyLoading() {
  if ('loading' in HTMLImageElement.prototype) {
    // Browser supports native lazy loading
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
    });
  } else {
    // Fallback for browsers without native lazy loading
    // You could implement a simple IntersectionObserver here
  }
}

// Performance metrics tracking
function trackPerformanceMetrics() {
  // Only run in production and if the API is available
  if (window.location.hostname !== 'localhost' && 'performance' in window) {
    // Get navigation timing 
    const pageNav = performance.getEntriesByType('navigation')[0];
    const paintMetrics = performance.getEntriesByType('paint');
    
    // Basic timing metrics for analytics
    setTimeout(() => {
      const metrics = {
        // Navigation timing
        domComplete: pageNav ? pageNav.domComplete : 0,
        loadEventEnd: pageNav ? pageNav.loadEventEnd : 0,
        
        // Paint timing 
        firstPaint: paintMetrics.find(({ name }) => name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paintMetrics.find(({ name }) => name === 'first-contentful-paint')?.startTime || 0
      };
      
      // Could send metrics to an analytics endpoint
      console.debug('Performance metrics collected:', metrics);
    }, 1000);
  }
}

// Initialize when page loads
function initPerformanceOptimizations() {
  checkBrowserSupport();
  initLazyLoading();
  trackPerformanceMetrics();
  
  // Easter egg console message
  setTimeout(() => {
    console.log('%cAeroVista Performance Module Loaded', 'color:#00AEEF; font-weight:bold;');
    console.log('%c👀 Looking at our code, eh? Try typing "revealSecrets()" in the console!', 'color:#FF0090;');
  }, 1500);
}

// Run initializations
document.addEventListener('DOMContentLoaded', initPerformanceOptimizations);

// Add a hidden handler to detect konami code
let konamiKeysPressed = [];
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', function(e) {
  konamiKeysPressed.push(e.key);
  
  // Keep only the last N keys
  if (konamiKeysPressed.length > konamiCode.length) {
    konamiKeysPressed.shift();
  }
  
  // Check if the sequence matches
  const matches = konamiKeysPressed.every((key, i) => {
    return key.toLowerCase() === konamiCode[i].toLowerCase();
  });
  
  if (matches && konamiKeysPressed.length === konamiCode.length) {
    console.log('%c🎮 KONAMI CODE DETECTED! 🎮', 'color:#FF0090; font-size:20px; font-weight:bold;');
  }
});
