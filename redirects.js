/* 
 * AeroVista - Redirects & Initialization
 * External scripts for handling page redirections and initialization
 */

// Execute redirect when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Check current page path to determine appropriate redirect
  const currentPath = window.location.pathname;
  
  // Store.html redirect removed - page now has dedicated content
  
  // Initialize analytics if available
  if (typeof AeroVistaAnalytics !== 'undefined') {
    AeroVistaAnalytics.init();
  }
  
  // Initialize metadata if available
  if (typeof AeroVistaMetadata !== 'undefined') {
    AeroVistaMetadata.init();
  }
}); 