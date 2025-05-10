// legacyCleanup.js — Phase 4: Strip down SurronGame class and migrate to store-driven architecture

import GameCore from './game/GameCore.js';
import { store } from './StateStackULTRA/store/gameStore.js';
import dispatchers from './actionDispatchers.js';
import adventureUI from './adventureUI.js';

/**
 * This file replaces the old SurronGame class with a store-driven approach.
 * 
 * Phase 4 migration process:
 * 1. Remove the `SurronGame` class entirely from `adventure-game.js`
 * 2. Instead, initialize state with GameCore in `main.js` and use store access + dispatchers
 * 3. Replace window.game = new SurronGame() with window.game interface
 * 4. Remove all methods from SurronGame, now handled by dispatchers and UI modules
 * 5. Clean up localStorage usage by migrating entirely to Redux-persist or store-synced GameCore
 */

// Main initialization function
export async function initStoreBasedGame() {
  console.log('[Phase 4] Legacy SurronGame logic deprecated. Store-driven game state now active.');
  
  try {
    // Boot GameCore
    await GameCore.boot();
    
    // Initialize game interface that existing code can use
    window.game = {
      // State access
      state: () => store.getState(),
      getPlayerState: () => store.getState().player,
      getQuestState: (questId) => store.getState().quests?.entities?.[questId],
      
      // Action dispatchers
      addItemByName: dispatchers.addItemByName,
      progressQuest: dispatchers.progressQuest,
      completeQuest: dispatchers.completeQuest,
      unlockArea: dispatchers.unlockArea,
      completeChapter: dispatchers.completeChapter,
      
      // UI methods (now delegated to adventureUI)
      updateUI: adventureUI.updateUI,
      showItemDetails: adventureUI.showItemDetails,
      visitLocation: adventureUI.visitLocation,
      
      // Legacy method stubs for backward compatibility
      setupEventListeners: () => {
        console.log('[Deprecated] setupEventListeners is no longer needed. Event handling is done by UI components.');
      },
      openInventory: () => {
        console.log('[Deprecated] Use dedicated UI components instead of openInventory.');
        adventureUI.updateInventory(store.getState());
      },
      init: () => {
        console.log('[Deprecated] init is no longer needed. GameCore.boot() handles initialization.');
        adventureUI.updateUI();
      }
    };
    
    // Add custom event listener for migration completeness
    document.dispatchEvent(new CustomEvent('storeGameReady'));
    
    // Update UI
    adventureUI.updateUI();
    
    // Log success
    console.log('[Phase 4] Migration to store-driven game state complete.');
    return true;
  } catch (error) {
    console.error('[Phase 4] Failed to initialize store-based game:', error);
    return false;
  }
}

// Initialize when included via script tag
document.addEventListener('DOMContentLoaded', () => {
  // Check if we should auto-initialize
  const autoInit = document.body.hasAttribute('data-auto-init-game');
  if (autoInit) {
    initStoreBasedGame();
  }
});

export default {
  initStoreBasedGame
}; 