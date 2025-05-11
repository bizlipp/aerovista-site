/**
 * Simple toast notification system
 * This file provides a fallback for modules that import popup-toast.js
 */

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type: 'info', 'success', 'warning', 'error'
 * @param {number} duration - Duration in milliseconds
 */
export function showToast(message, type = 'info', duration = 3000) {
  console.log(`TOAST (${type}): ${message}`);
  
  // Create toast container if it doesn't exist
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
  }
  
  // Create the toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = message;
  
  // Style the toast
  Object.assign(toast.style, {
    margin: '10px 0',
    padding: '12px 20px',
    borderRadius: '4px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    fontFamily: 'sans-serif',
    fontSize: '14px',
    fontWeight: 'bold',
    opacity: '0',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    color: '#fff',
    minWidth: '200px',
    maxWidth: '300px'
  });
  
  // Set color based on type
  switch (type) {
    case 'success':
      toast.style.backgroundColor = '#4CAF50';
      break;
    case 'warning':
      toast.style.backgroundColor = '#FFC107';
      toast.style.color = '#333';
      break;
    case 'error':
      toast.style.backgroundColor = '#F44336';
      break;
    default: // info
      toast.style.backgroundColor = '#2196F3';
  }
  
  // Add to container
  container.appendChild(toast);
  
  // Animation
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 10);
  
  // Remove after duration
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast);
      }
    }, 300);
  }, duration);
}

export default {
  showToast
}; 