/**
 * adventure-game.js - Non-module version
 * 
 * This file is maintained for legacy compatibility and browser support.
 * It defines a simple game initialization system that doesn't rely on ES modules.
 */

// Define a global placeholder for the game
window.game = window.game || {};

// Simple shim function to replace the imported initStoreBasedGame
function initStoreBasedGame() {
  console.log('[Legacy Compat] Using non-module version of initStoreBasedGame');
  
  // Set up basic game state for backward compatibility
  window.game = window.game || {
    // Basic state management
    state: function() { 
      return window.playerState || { 
        player: { level: 1, xp: 0, xpToNextLevel: 100, currency: 0 } 
      };
    },
    
    // Action dispatchers
    addItemByName: function(itemName, quantity) {
      console.log(`[Legacy] Adding item: ${itemName} x${quantity}`);
      return true;
    },
    
    progressQuest: function(questId) {
      console.log(`[Legacy] Progressing quest: ${questId}`);
      return true;
    },
    
    // UI methods
    updateUI: function() {
      console.log('[Legacy] Updating UI');
      // Attempt to update any known UI elements
      try {
        // Update player level and stats if elements exist
        const levelElem = document.getElementById('player-level');
        if (levelElem) levelElem.textContent = '1';
        
        const xpElem = document.getElementById('player-xp');
        if (xpElem) xpElem.textContent = '0';
      } catch (e) {
        console.error('[Legacy] UI update error:', e);
      }
    }
  };
  
  // Notify that we're ready
  document.dispatchEvent(new CustomEvent('storeGameReady'));
  
  return Promise.resolve(true);
}

// Initialize the store-based game
document.addEventListener('DOMContentLoaded', function() {
  console.warn(
    'DEPRECATED: adventure-game.js is using a legacy compatibility version. ' +
    'For full functionality, make sure to use the module version with type="module".'
  );
  
  // Call our init function
  initStoreBasedGame().then(function() {
    console.log('[Legacy] Game initialized successfully');
  }).catch(function(err) {
    console.error('[Legacy] Game initialization failed:', err);
  });
});

// Define SurronGame constructor for backward compatibility
window.SurronGame = function() {
  console.warn(
    'DEPRECATED: SurronGame class is deprecated. ' +
    'Please use window.game interface instead.'
  );
  
  // Return the game interface
  return window.game || {};
}; 