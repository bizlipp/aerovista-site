/**
 * GameBridge.js
 * A bridge module that provides a simplified API over GameCore for components that need game state
 */

import GameCore from './GameCore.js';

class GameBridge {
  constructor() {
    this.isReady = false;
    this.readyCallbacks = [];
    
    // Try to initialize immediately (GameCore might already be booted)
    this.init();
  }
  
  /**
   * Initialize the bridge
   */
  async init() {
    try {
      // We'll check if GameCore is available and initialized
      if (GameCore && GameCore.getPlayerState) {
        this.isReady = true;
        // Execute any waiting callbacks
        this.readyCallbacks.forEach(callback => callback());
        this.readyCallbacks = [];
        console.log('[GameBridge] Successfully initialized');
      } else {
        console.warn('[GameBridge] GameCore not fully initialized yet, waiting...');
      }
    } catch (error) {
      console.error('[GameBridge] Error initializing:', error);
    }
  }
  
  /**
   * Register a callback for when the bridge is ready to use
   * @param {Function} callback - Function to call when ready
   */
  onReady(callback) {
    if (this.isReady) {
      // Execute immediately if already ready
      callback();
    } else {
      // Queue for later execution
      this.readyCallbacks.push(callback);
    }
  }
  
  /**
   * Get current player state
   * @returns {Object} Player state
   */
  getPlayerState() {
    return GameCore.getPlayerState();
  }
  
  /**
   * Check if a mission is completed
   * @param {string} missionId - Mission ID to check
   * @returns {boolean} Is mission completed
   */
  isMissionCompleted(missionId) {
    const state = this.getPlayerState();
    return state && state.completedMissions && state.completedMissions.includes(missionId);
  }
  
  /**
   * Mark a mission as completed
   * @param {string} missionId - Mission ID to mark complete
   */
  completeMission(missionId) {
    // Dispatch through GameCore
    GameCore.dispatch('completeMission', missionId);
    
    // Trigger event for the UI
    window.dispatchEvent(new CustomEvent('questCompleted', {
      detail: missionId
    }));
  }
  
  /**
   * Add XP to player
   * @param {number} amount - Amount of XP to add
   */
  addXP(amount) {
    GameCore.addXP(amount);
  }
  
  /**
   * Add currency to player
   * @param {number} amount - Amount of currency to add
   */
  addCurrency(amount) {
    GameCore.addCurrency(amount);
  }
  
  /**
   * Update character relationship
   * @param {string} character - Character ID
   * @param {number} amount - Amount to change relationship
   */
  updateRelationship(character, amount) {
    GameCore.updateRelationship(character, amount);
  }
  
  /**
   * Add an item to inventory
   * @param {string} itemId - Item ID to add
   * @param {number} quantity - Quantity to add (defaults to 1)
   */
  addItem(itemId, quantity = 1) {
    GameCore.addItem({
      id: itemId,
      quantity: quantity,
      addedAt: Date.now()
    });
  }
  
  /**
   * Show a toast notification
   * @param {string} message - Message to display
   */
  showToast(message) {
    if (typeof window.showToast === 'function') {
      window.showToast(message);
    } else {
      console.log('[GameBridge] Toast:', message);
    }
  }
  
  /**
   * Manual save trigger
   */
  save() {
    GameCore.save();
  }
  
  /**
   * Special case method for GameCore actions not directly exposed
   * @param {string} action - Action name
   * @param {*} payload - Action payload
   */
  dispatch(action, payload) {
    if (action === 'completeMission') {
      // Use the official API
      GameCore.dispatch('completeMission', payload);
    } else {
      console.warn(`[GameBridge] Unknown action: ${action}`);
    }
  }
}

// Create and export a singleton instance
const gameBridge = new GameBridge();
export default gameBridge; 