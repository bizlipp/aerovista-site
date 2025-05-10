/**
 * GameBridge.js
 * A compatibility layer that unifies access to player state across
 * different components (legacy code, GameCore, and direct playerState)
 */

import GameCore from './GameCore.js';

class GameBridge {
  /**
   * Initialize the GameBridge
   */
  constructor() {
    this.isReady = false;
    this.listeners = [];
    
    // Check if GameCore and/or playerState are available
    this.hasGameCore = typeof GameCore !== 'undefined';
    this.hasPlayerState = typeof window.playerState !== 'undefined';
    
    // Wait for playerState to be ready if it's not yet
    if (!this.hasPlayerState) {
      document.addEventListener('playerStateReady', () => {
        this.hasPlayerState = true;
        this.isReady = true;
        this._notifyReady();
      });
    } else {
      this.isReady = true;
    }
  }
  
  /**
   * Register a callback to be executed when the bridge is ready
   * @param {Function} callback - Function to call when bridge is ready
   */
  onReady(callback) {
    if (this.isReady) {
      callback();
    } else {
      this.listeners.push(callback);
    }
  }
  
  /**
   * Notify all listeners that the bridge is ready
   * @private
   */
  _notifyReady() {
    this.listeners.forEach(callback => callback());
    this.listeners = [];
  }
  
  /**
   * Get the player state from the best available source
   * @returns {Object} Player state
   */
  getPlayerState() {
    if (this.hasGameCore) {
      return GameCore.getPlayerState();
    } else if (this.hasPlayerState) {
      return window.playerState;
    }
    
    // Return default state if nothing else is available
    return {
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      currency: 0,
      reputation: 0,
      inventory: [],
      relationships: { charlie: 1, billy: 1, tbd: 1 },
      builds: [],
      completedMissions: []
    };
  }
  
  /**
   * Add XP to the player
   * @param {number} amount - Amount of XP to add
   * @returns {Object|null} Level-up info if player leveled up, null otherwise
   */
  addXP(amount) {
    if (this.hasGameCore) {
      return GameCore.addXP(amount);
    } else if (this.hasPlayerState) {
      return window.playerState.addXP(amount);
    }
    return null;
  }
  
  /**
   * Add currency to the player
   * @param {number} amount - Amount of currency to add
   */
  addCurrency(amount) {
    if (this.hasGameCore) {
      GameCore.addCurrency(amount);
    } else if (this.hasPlayerState) {
      window.playerState.addCurrency(amount);
    }
  }
  
  /**
   * Change relationship with a character
   * @param {string} character - Character ID (charlie, billy, tbd)
   * @param {number} amount - Amount to change relationship by
   */
  updateRelationship(character, amount) {
    if (this.hasGameCore) {
      GameCore.updateRelationship(character, amount);
    } else if (this.hasPlayerState) {
      window.playerState.changeRelationship(character, amount);
    }
  }
  
  /**
   * Add an item to the player's inventory
   * @param {string|Object} item - Item ID or item object
   * @param {number} [quantity=1] - Quantity to add
   */
  addItem(item, quantity = 1) {
    if (this.hasGameCore) {
      GameCore.addItem(item, quantity);
    } else if (this.hasPlayerState) {
      window.playerState.addItem(item, quantity);
    }
  }
  
  /**
   * Save the player's state
   */
  save() {
    if (this.hasGameCore) {
      GameCore.save();
    } else if (this.hasPlayerState) {
      window.playerState.save();
    }
  }
  
  /**
   * Mark a mission as completed
   * @param {string} missionId - ID of the mission to mark as completed
   */
  completeMission(missionId) {
    const state = this.getPlayerState();
    
    // Ensure completedMissions exists
    if (!state.completedMissions) {
      state.completedMissions = [];
    }
    
    if (!state.completedMissions.includes(missionId)) {
      state.completedMissions.push(missionId);
      this.save();
      
      // Dispatch event for quest completion
      window.dispatchEvent(new CustomEvent('questCompleted', { 
        detail: missionId 
      }));
    }
  }
  
  /**
   * Check if a mission is completed
   * @param {string} missionId - ID of the mission to check
   * @returns {boolean} True if mission is completed
   */
  isMissionCompleted(missionId) {
    const state = this.getPlayerState();
    return state && state.completedMissions && state.completedMissions.includes(missionId);
  }
  
  /**
   * Add a new build to the player's builds
   * @param {Object} build - Build data
   */
  addBuild(build) {
    const state = this.getPlayerState();
    
    if (!state.builds) {
      state.builds = [];
    }
    
    state.builds.push(build);
    this.save();
  }
  
  /**
   * Show a toast notification
   * @param {string} message - Message to show
   * @param {string} [type='success'] - Notification type (success, warning, error)
   */
  showToast(message, type = 'success') {
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
    
    // Remove after 5 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 5000);
  }
}

// Create and export a singleton instance
const gameBridge = new GameBridge();
export default gameBridge; 