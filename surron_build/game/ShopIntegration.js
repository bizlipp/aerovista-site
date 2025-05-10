/**
 * ShopIntegration.js
 * Provides shop functionality and integrates with GameBridge for state management
 */

import gameBridge from './GameBridge.js';

/**
 * Purchase an item
 * @param {Object} item - Item to purchase
 * @returns {boolean} - Whether purchase was successful
 */
export function purchaseItem(item) {
  const playerState = gameBridge.getPlayerState();
  
  // Check if player has enough currency
  if (playerState.currency < item.price) {
    gameBridge.showToast(`Not enough SurCoins for ${item.name}!`, 'error');
    return false;
  }
  
  // Subtract cost from player currency
  gameBridge.addCurrency(-item.price);
  
  // Add item to player inventory
  gameBridge.addItem(item.id, 1);
  
  // Save state
  gameBridge.save();
  
  // Show toast notification
  gameBridge.showToast(`Purchased ${item.name}!`, 'success');
  
  return true;
}

/**
 * Check if player owns an item
 * @param {string} itemId - Item ID to check
 * @returns {boolean} - Whether player owns the item
 */
export function checkOwnership(itemId) {
  const playerState = gameBridge.getPlayerState();
  
  if (!playerState.inventory) return false;
  
  return playerState.inventory.some(item => {
    // Handle both when inventory contains full items or just IDs
    if (typeof item === 'object') {
      return item.id === itemId;
    } else {
      return item === itemId;
    }
  });
}

/**
 * Get player currency
 * @returns {number} - Player currency amount
 */
export function getPlayerCurrency() {
  return gameBridge.getPlayerState().currency || 0;
}

/**
 * Update player stats UI elements
 * @param {Object} elements - DOM elements to update
 */
export function updateShopUI(elements) {
  const playerState = gameBridge.getPlayerState();
  
  if (elements.currencyDisplay) {
    elements.currencyDisplay.textContent = playerState.currency || 0;
  }
  
  if (elements.levelDisplay) {
    elements.levelDisplay.textContent = playerState.level || 1;
  }
  
  if (elements.itemsDisplay) {
    elements.itemsDisplay.textContent = (playerState.inventory || []).length;
  }
} 