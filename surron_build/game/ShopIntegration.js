/**
 * ShopIntegration.js
 * Integrates with GameCore to provide shop functionality for Surron Squad
 */

import GameCore from './GameCore.js';
import { store } from '../StateStackULTRA/store/gameStore.js';

/**
 * Setup shop UI elements
 */
export function setupShopUI() {
  console.log('[ShopIntegration] Setting up shop UI');
  
  // Load items when tabs are clicked
  const tabs = document.querySelectorAll('.shop-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Load items for the selected tab
      const tabName = tab.dataset.tab;
      loadShopItems(tabName);
    });
  });
  
  // Close modal when cancel is clicked
  document.getElementById('modal-cancel')?.addEventListener('click', () => {
    document.getElementById('purchase-modal').style.display = 'none';
  });
  
  // Load initial items
  loadShopItems('upgrades');
  
  // Set up modal close on backdrop click
  const modal = document.getElementById('purchase-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
}

/**
 * Purchase an item and update player inventory and currency
 * @param {string} itemId - The ID of the item to purchase
 * @param {number} price - The price of the item
 * @param {Object} itemData - Additional item data
 * @returns {boolean} Whether the purchase was successful
 */
export function purchaseItem(itemId, price, itemData = {}) {
  console.log(`[ShopIntegration] Attempting to purchase item: ${itemId}`);
  
  // Check if player exists
  const playerState = GameCore.getPlayerState();
  if (!playerState) {
    console.error('[ShopIntegration] Cannot purchase - player state is undefined');
    return false;
  }
  
  // Check if player has enough currency
  if (playerState.currency < price) {
    console.warn(`[ShopIntegration] Not enough currency. Have: ${playerState.currency}, Need: ${price}`);
    return false;
  }
  
  // Deduct currency
  GameCore.addCurrency(-price);
  
  // Add item to inventory
  const item = {
    id: itemId,
    name: itemData.name || itemId,
    purchasedAt: Date.now(),
    price: price,
    ...itemData
  };
  
  GameCore.addItem(item);
  
  // Save state
  GameCore.save();
  
  console.log(`[ShopIntegration] Successfully purchased ${itemId} for ${price} SurCoins`);
  return true;
}

/**
 * Mark an item as owned in the UI
 * @param {HTMLElement} itemElement - The item element to mark as owned
 */
export function markItemAsOwned(itemElement) {
  // Disable buy button
  const buyButton = itemElement.querySelector('.buy-button');
  if (buyButton) {
    buyButton.disabled = true;
    buyButton.textContent = 'Owned';
  }
  
  // Add owned badge
  const ownedBadge = document.createElement('div');
  ownedBadge.className = 'item-owned';
  ownedBadge.textContent = 'OWNED';
  itemElement.appendChild(ownedBadge);
}

/**
 * Check if player owns a specific item
 * @param {string} itemId - The ID of the item to check
 * @returns {boolean} Whether the player owns the item
 */
export function playerOwnsItem(itemId) {
  const playerState = GameCore.getPlayerState();
  if (!playerState || !playerState.inventory) return false;
  
  return playerState.inventory.some(item => item.id === itemId);
}

export default {
  setupShopUI,
  purchaseItem,
  markItemAsOwned,
  playerOwnsItem
}; 