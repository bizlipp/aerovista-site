/**
 * popup-toast.js
 * Provides toast notifications and reward popups for game events
 */

/**
 * Show a toast notification
 * @param {string} message - Message to show
 * @param {string} [type='success'] - Type of notification ('success', 'warning', 'error')
 * @param {number} [duration=5000] - Duration in milliseconds
 */
export function showToast(message, type = 'success', duration = 5000) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `squad-toast ${type}`;
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.backgroundColor = type === 'success' ? 'var(--squad-neon)' : 
                                      type === 'warning' ? 'var(--squad-primary)' : 
                                      '#e63946';
  notification.style.color = type === 'success' ? 'black' : 'white';
  notification.style.padding = '1rem';
  notification.style.borderRadius = '8px';
  notification.style.boxShadow = 'var(--squad-shadow)';
  notification.style.zIndex = '1000';
  notification.style.transition = 'opacity 0.3s, transform 0.3s';
  notification.style.opacity = '0';
  notification.style.transform = 'translateY(20px)';
  
  notification.textContent = message;
  
  // Add to document
  document.body.appendChild(notification);
  
  // Trigger animation
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 10);
  
  // Remove after specified duration
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, duration);
}

/**
 * Show a reward popup
 * @param {Object} rewards - Reward data (xp, currency, etc.)
 * @param {string} [title='Rewards'] - Popup title
 */
export function showRewardPopup(rewards, title = 'Rewards') {
  // Create popup container
  const popup = document.createElement('div');
  popup.className = 'reward-popup';
  popup.style.position = 'fixed';
  popup.style.top = '50%';
  popup.style.left = '50%';
  popup.style.transform = 'translate(-50%, -50%) scale(0.9)';
  popup.style.backgroundColor = 'rgba(23, 23, 25, 0.9)';
  popup.style.color = 'white';
  popup.style.padding = '2rem';
  popup.style.borderRadius = '12px';
  popup.style.boxShadow = '0 0 30px rgba(57, 255, 20, 0.5)';
  popup.style.zIndex = '2000';
  popup.style.transition = 'opacity 0.3s, transform 0.3s';
  popup.style.opacity = '0';
  popup.style.border = '3px solid var(--squad-neon)';
  popup.style.minWidth = '300px';
  popup.style.maxWidth = '500px';
  popup.style.textAlign = 'center';
  
  // Create popup content
  let content = `
    <h2 style="color: var(--squad-neon); font-family: 'Bangers', cursive; font-size: 2rem; margin-top: 0;">${title}</h2>
    <div style="text-align: left; margin-bottom: 1.5rem;">
      <ul style="list-style: none; padding-left: 1rem;">
  `;
  
  // Add rewards to content
  if (rewards.xp) {
    content += `<li style="margin-bottom: 0.5rem; font-size: 1.1rem;">✨ ${rewards.xp} XP</li>`;
  }
  
  if (rewards.currency) {
    content += `<li style="margin-bottom: 0.5rem; font-size: 1.1rem;">🪙 ${rewards.currency} SurCoins</li>`;
  }
  
  if (rewards.character && rewards.relationship) {
    const charName = getCharacterName(rewards.character);
    content += `<li style="margin-bottom: 0.5rem; font-size: 1.1rem;">❤️ +${rewards.relationship} ${charName} relationship</li>`;
  }
  
  if (rewards.items && rewards.items.length > 0) {
    rewards.items.forEach(item => {
      content += `<li style="margin-bottom: 0.5rem; font-size: 1.1rem;">📦 ${getItemName(item)}</li>`;
    });
  }
  
  if (rewards.item) {
    content += `<li style="margin-bottom: 0.5rem; font-size: 1.1rem;">📦 ${getItemName(rewards.item)}</li>`;
  }
  
  if (rewards.quest_complete) {
    content += `<li style="margin-bottom: 0.5rem; font-size: 1.1rem;">🏆 Quest completed!</li>`;
  }
  
  if (rewards.levelUp) {
    content += `<li style="margin-bottom: 0.5rem; font-size: 1.2rem; font-weight: bold; color: var(--squad-neon);">⭐ Level Up! You're now level ${rewards.levelUp.newLevel}</li>`;
  }
  
  // Add close button
  content += `
      </ul>
    </div>
    <button id="close-reward-popup" style="background: var(--squad-neon); color: black; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; font-weight: bold; font-size: 1.1rem; cursor: pointer;">AWESOME!</button>
  `;
  
  // Set content
  popup.innerHTML = content;
  
  // Add to document
  document.body.appendChild(popup);
  
  // Add dark overlay
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  overlay.style.zIndex = '1999';
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 0.3s';
  document.body.appendChild(overlay);
  
  // Trigger animations
  setTimeout(() => {
    popup.style.opacity = '1';
    popup.style.transform = 'translate(-50%, -50%) scale(1)';
    overlay.style.opacity = '1';
  }, 10);
  
  // Add event listener to close button
  document.getElementById('close-reward-popup').addEventListener('click', () => {
    popup.style.opacity = '0';
    popup.style.transform = 'translate(-50%, -50%) scale(0.9)';
    overlay.style.opacity = '0';
    
    setTimeout(() => {
      document.body.removeChild(popup);
      document.body.removeChild(overlay);
    }, 300);
  });
}

/**
 * Get a character's display name
 * @param {string} character - Character ID
 * @returns {string} Character display name
 */
function getCharacterName(character) {
  switch(character) {
    case 'charlie': return 'Charlie';
    case 'billy': return 'Billy';
    case 'tbd': return 'TBD';
    default: return character;
  }
}

/**
 * Get an item's display name
 * @param {string|Object} item - Item ID or object
 * @returns {string} Item display name
 */
function getItemName(item) {
  if (typeof item === 'string') {
    return item.charAt(0).toUpperCase() + item.slice(1).replace(/_/g, ' ');
  } else if (typeof item === 'object') {
    return item.name || item.id || 'Unknown Item';
  }
  return 'Unknown Item';
} 