/**
 * [DEPRECATED] adventure-game.js
 * 
 * This file is maintained for legacy compatibility.
 * The SurronGame class has been deprecated in Phase 4 and replaced with 
 * a store-driven implementation.
 * 
 * Please use the following instead:
 * - GameCore - For game state management
 * - actionDispatchers.js - For game actions
 * - adventureUI.js - For UI updates
 * - selectors.js - For accessing game state
 */

import { initStoreBasedGame } from './legacyCleanup.js';

console.warn(
  'DEPRECATED: adventure-game.js is deprecated. ' +
  'The SurronGame class has been replaced with a store-driven implementation. ' +
  'See legacyCleanup.js for details.'
);

// Initialize the store-based game
document.addEventListener('DOMContentLoaded', async () => {
  await initStoreBasedGame();
});

// Export a dummy object for legacy code
export default {
  SurronGame: class {
    constructor() {
      console.warn(
        'DEPRECATED: SurronGame class is deprecated. ' +
        'Please use window.game interface instead.'
      );
      
      // Initialize store-based game if not already done
      initStoreBasedGame();
      
      // Return the game interface
      return window.game || {};
    }
  }
}; 