// GameBridge.js - Unified game state access layer
class GameBridge {
    constructor() {
      // Ensure playerState is available
      if (!window.playerState) {
        console.warn('GameBridge: playerState not available, some functions may not work');
      }
    }
  
    // Player progress methods
    addXP(amount) {
      return window.playerState?.addXP(amount) || null;
    }
  
    addCurrency(amount) {
      window.playerState?.addCurrency(amount);
    }
  
    addItem(itemId, quantity = 1) {
      window.playerState?.addItem(itemId, quantity);
    }
  
    // Character relationship methods
    changeRelationship(character, amount) {
      window.playerState?.changeRelationship(character, amount);
    }
  
    // Game state getters
    getPlayerLevel() {
      return window.playerState?.level || 1;
    }
  
    getInventory() {
      return window.playerState?.inventory || [];
    }
  
    getCurrency() {
      return window.playerState?.currency || 0;
    }
  
    // Utility method to check if features are unlocked
    isFeatureUnlocked(featureId) {
      const unlockedFeatures = window.playerState?.unlockedFeatures || [];
      return unlockedFeatures.includes(featureId);
    }
  }
  
  // Create a singleton instance
  const game = new GameBridge();
  
  // Also provide global access for non-module scripts
  window.game = game;
  
  // Export the singleton instance
  export default game;