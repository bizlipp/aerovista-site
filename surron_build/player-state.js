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
    
    // Last action timestamp for tracking new items, rewards, etc.
    this.lastActionTime = Date.now();
    
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
      
      // Update last action time
      this.lastActionTime = Date.now();
      
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
        type: 'unknown',
        acquiredAt: Date.now() // Track when the item was acquired
      });
    }
    
    // Update last action time
    this.lastActionTime = Date.now();
  }
  
  /**
   * Add currency to player
   * @param {number} amount - Amount to add
   */
  addCurrency(amount) {
    this.currency += amount;
    
    // Update last action time
    this.lastActionTime = Date.now();
  }
  
  /**
   * Mark an adventure scene as completed
   * @param {string} sceneId - ID of completed scene
   */
  completeScene(sceneId) {
    if (!this.adventureProgress.completedScenes.includes(sceneId)) {
      this.adventureProgress.completedScenes.push(sceneId);
      
      // Update last action time
      this.lastActionTime = Date.now();
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
      
      // Update last action time
      this.lastActionTime = Date.now();
    }
  }
  
  /**
   * Save current player state to localStorage
   */
  save() {
    try {
      const stateToSave = {
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
        achievements: this.achievements,
        lastActionTime: this.lastActionTime
      };
      
      // Convert to JSON
      const jsonState = JSON.stringify(stateToSave);
      
      // Save to localStorage
      localStorage.setItem('surronSquadPlayerState', jsonState);
      
      console.log('Player state saved successfully', {
        level: this.level,
        xp: this.xp,
        currency: this.currency,
        inventoryCount: this.inventory.length,
        missionCount: this.completedMissions?.length || 0,
        stateSize: jsonState.length + ' bytes'
      });
      
      return true;
    } catch (error) {
      console.error('Error saving player state:', error);
      return false;
    }
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
        this.lastActionTime = parsedState.lastActionTime || Date.now();
        
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
    this.lastActionTime = Date.now();
    
    // Clear from localStorage
    localStorage.removeItem('surronSquadPlayerState');
    console.log('Player state reset to defaults');
  }
  
  /**
   * Export player state as a JSON string
   * @returns {string} - JSON representation of player state
   */
  exportState() {
    const exportedState = {
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
      achievements: this.achievements,
      exportedAt: Date.now(),
      versionInfo: {
        gameVersion: "1.0.0", // Would be dynamic in a real implementation
        exportVersion: "1"
      }
    };
    
    return JSON.stringify(exportedState);
  }
  
  /**
   * Import player state from a JSON string
   * @param {string} jsonState - JSON representation of player state
   * @returns {boolean} - Success or failure
   */
  importState(jsonState) {
    try {
      const importedState = JSON.parse(jsonState);
      
      // Validate imported state (basic checks)
      if (!importedState.level || !importedState.versionInfo) {
        console.error('Invalid player state data');
        return false;
      }
      
      // Check if version is compatible (simple check for now)
      if (importedState.versionInfo.exportVersion !== "1") {
        console.error('Incompatible player state version');
        return false;
      }
      
      // Update all properties from imported state
      this.level = importedState.level;
      this.xp = importedState.xp;
      this.xpToNextLevel = importedState.xpToNextLevel;
      this.currency = importedState.currency;
      this.reputation = importedState.reputation;
      this.inventory = importedState.inventory;
      this.builds = importedState.builds;
      this.unlockedParts = importedState.unlockedParts;
      this.completedMissions = importedState.completedMissions;
      this.adventureProgress = importedState.adventureProgress;
      this.relationships = importedState.relationships;
      this.achievements = importedState.achievements;
      this.lastActionTime = Date.now(); // Use current time as import time
      
      // Save to localStorage
      this.save();
      
      console.log('Player state imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing player state:', error);
      return false;
    }
  }
}

// Export as global for now
window.PlayerState = PlayerState;

// Add a debugging function to help diagnose issues
window.debugPlayerState = function() {
  console.log("==== PLAYER STATE DEBUG ====");
  if (!window.playerState) {
    console.error("No playerState found in window object!");
    return;
  }
  
  console.log("Current level:", window.playerState.level);
  console.log("Current XP:", window.playerState.xp);
  console.log("XP to next level:", window.playerState.xpToNextLevel);
  console.log("Currency:", window.playerState.currency);
  console.log("Inventory items:", window.playerState.inventory.length);
  console.log("Completed missions:", window.playerState.completedMissions);
  
  // Test XP addition
  const testXP = 10;
  const oldXP = window.playerState.xp;
  const levelUpResult = window.playerState.addXP(testXP);
  console.log(`After adding ${testXP} XP:`, window.playerState.xp, 
              "Difference:", window.playerState.xp - oldXP,
              "Level up?", levelUpResult ? "Yes" : "No");
  
  // Test currency addition
  const testCurrency = 50;
  const oldCurrency = window.playerState.currency;
  window.playerState.addCurrency(testCurrency);
  console.log(`After adding ${testCurrency} currency:`, window.playerState.currency,
              "Difference:", window.playerState.currency - oldCurrency);
  
  // Check localStorage
  try {
    const savedState = localStorage.getItem('surronSquadPlayerState');
    console.log("State in localStorage:", savedState ? "Present" : "Missing");
  } catch (e) {
    console.error("Error accessing localStorage:", e);
  }
  
  console.log("==== DEBUG COMPLETE ====");
};

// Initialize player state when document loads
document.addEventListener('DOMContentLoaded', function() {
  // Create global player state instance
  window.playerState = new PlayerState();
  
  // Dispatch event so other components know player state is ready
  document.dispatchEvent(new CustomEvent('playerStateReady'));
}); 