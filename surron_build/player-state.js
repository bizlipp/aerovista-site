/**
 * Surron Squad Player State Management
 * Central system for tracking player progress across all game modules
 */

class PlayerState {
  constructor() {
    // Core player attributes
    this.level = 1;
    this.xp = 0;
    this.xpToNextLevel = 100;
    this.currency = 250;
    this.reputation = 0;
    
    // Inventory and collections
    this.inventory = [];
    this.builds = [];
    this.unlockedParts = [];
    
    // Game progress tracking
    this.completedMissions = [];
    this.adventureProgress = {
      currentChapter: 1,
      completedScenes: [],
      currentScene: 'intro'
    };
    
    // Character relationships
    this.relationships = {
      charlie: 1,
      billy: 1,
      tbd: 1
    };
    
    // Achievement tracking
    this.achievements = [];
    
    // Initialize from saved data if available
    this.load();
  }
  
  /**
   * Add experience points and handle level ups
   * @param {number} amount - XP to add
   * @returns {object|null} - Level up info if leveled up, null otherwise
   */
  addXP(amount) {
    this.xp += amount;
    
    // Check for level up
    if (this.xp >= this.xpToNextLevel) {
      this.level++;
      const overflow = this.xp - this.xpToNextLevel;
      this.xp = overflow;
      this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);
      
      // Return level up information
      return {
        newLevel: this.level,
        rewards: this.getLevelRewards(this.level)
      };
    }
    
    return null;
  }
  
  /**
   * Get rewards for reaching a specific level
   * @param {number} level - Player level
   * @returns {object} - Rewards for this level
   */
  getLevelRewards(level) {
    const rewards = {
      currency: 0,
      items: [],
      unlockedFeatures: []
    };
    
    // Define rewards based on level
    switch(level) {
      case 2:
        rewards.currency = 500;
        rewards.items.push({id: 'basic_toolkit', name: 'Basic Toolkit'});
        rewards.unlockedFeatures.push('fishing_game');
        break;
      case 5:
        rewards.currency = 1000;
        rewards.items.push({id: 'premium_controller', name: 'Premium Controller'});
        rewards.unlockedFeatures.push('test_track');
        break;
      case 10:
        rewards.currency = 2500;
        rewards.items.push({id: 'rare_frame', name: 'Rare Frame'});
        rewards.unlockedFeatures.push('mission_board');
        break;
      default:
        rewards.currency = level * 100;
    }
    
    return rewards;
  }
  
  /**
   * Add an item to player inventory
   * @param {string} itemId - Unique item identifier
   * @param {number} quantity - Number of items to add (default: 1)
   */
  addItem(itemId, quantity = 1) {
    const existingItem = this.inventory.find(item => item.id === itemId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      // Add new item - in a real implementation we'd look up item details
      this.inventory.push({
        id: itemId,
        quantity: quantity,
        // These would come from an item database in reality
        name: itemId.replace(/_/g, ' '),
        type: 'unknown'
      });
    }
  }
  
  /**
   * Add currency to player
   * @param {number} amount - Amount to add
   */
  addCurrency(amount) {
    this.currency += amount;
  }
  
  /**
   * Mark an adventure scene as completed
   * @param {string} sceneId - ID of completed scene
   */
  completeScene(sceneId) {
    if (!this.adventureProgress.completedScenes.includes(sceneId)) {
      this.adventureProgress.completedScenes.push(sceneId);
    }
  }
  
  /**
   * Change relationship level with a character
   * @param {string} character - Character ID (charlie, billy, tbd)
   * @param {number} amount - Amount to change relationship (can be negative)
   */
  changeRelationship(character, amount) {
    if (this.relationships[character] !== undefined) {
      this.relationships[character] += amount;
      // Clamp to 1-10 range
      this.relationships[character] = Math.max(1, Math.min(10, this.relationships[character]));
    }
  }
  
  /**
   * Save current player state to localStorage
   */
  save() {
    localStorage.setItem('surronSquadPlayerState', JSON.stringify({
      level: this.level,
      xp: this.xp,
      xpToNextLevel: this.xpToNextLevel,
      currency: this.currency,
      reputation: this.reputation,
      inventory: this.inventory,
      builds: this.builds,
      unlockedParts: this.unlockedParts,
      completedMissions: this.completedMissions,
      adventureProgress: this.adventureProgress,
      relationships: this.relationships,
      achievements: this.achievements
    }));
    
    console.log('Player state saved');
  }
  
  /**
   * Load player state from localStorage
   */
  load() {
    try {
      const savedState = localStorage.getItem('surronSquadPlayerState');
      
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        // Update all properties from saved state
        this.level = parsedState.level || this.level;
        this.xp = parsedState.xp || this.xp;
        this.xpToNextLevel = parsedState.xpToNextLevel || this.xpToNextLevel;
        this.currency = parsedState.currency || this.currency;
        this.reputation = parsedState.reputation || this.reputation;
        this.inventory = parsedState.inventory || this.inventory;
        this.builds = parsedState.builds || this.builds;
        this.unlockedParts = parsedState.unlockedParts || this.unlockedParts;
        this.completedMissions = parsedState.completedMissions || this.completedMissions;
        this.adventureProgress = parsedState.adventureProgress || this.adventureProgress;
        this.relationships = parsedState.relationships || this.relationships;
        this.achievements = parsedState.achievements || this.achievements;
        
        console.log('Player state loaded');
      }
    } catch (error) {
      console.error('Error loading player state:', error);
    }
  }
  
  /**
   * Reset player state to defaults
   */
  reset() {
    this.level = 1;
    this.xp = 0;
    this.xpToNextLevel = 100;
    this.currency = 250;
    this.reputation = 0;
    this.inventory = [];
    this.builds = [];
    this.unlockedParts = [];
    this.completedMissions = [];
    this.adventureProgress = {
      currentChapter: 1,
      completedScenes: [],
      currentScene: 'intro'
    };
    this.relationships = {
      charlie: 1,
      billy: 1,
      tbd: 1
    };
    this.achievements = [];
    
    // Clear from localStorage
    localStorage.removeItem('surronSquadPlayerState');
    console.log('Player state reset to defaults');
  }
}

// Export as global for now
window.PlayerState = PlayerState;

// Initialize player state when document loads
document.addEventListener('DOMContentLoaded', function() {
  // Create global player state instance
  window.playerState = new PlayerState();
  
  // Dispatch event so other components know player state is ready
  document.dispatchEvent(new CustomEvent('playerStateReady'));
}); 