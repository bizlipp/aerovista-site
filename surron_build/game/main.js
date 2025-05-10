// Main game integration file
import { bootGame } from './init.js';
import { store } from '../StateStackULTRA/store/gameStore.js';

document.addEventListener('DOMContentLoaded', async function() {
  // Initialize the state management system
  await bootGame();
  
  // Bridge the new state system with the existing PlayerState
  // This creates compatibility with existing code while we transition
  window.playerState = createPlayerStateBridge(store);
  
  // Dispatch event to notify existing code that player state is ready
  document.dispatchEvent(new CustomEvent('playerStateReady'));
  
  console.log('SurRon Squad game initialized with DataStackULTRA state management');
});

// Create a compatibility layer for existing code
function createPlayerStateBridge(store) {
  // Make sure we have a valid state, or provide defaults
  const storeState = store.getState()?.player || {
    level: 1,
    xp: 0,
    currency: 250,
    reputation: 0,
    inventory: [],
    relationships: { charlie: 1, billy: 1, tbd: 1 }
  };
  
  // Create a bridge object that mimics the existing PlayerState
  const bridge = {
    // Core properties from store state
    level: storeState.level,
    xp: storeState.xp,
    xpToNextLevel: 100 * Math.pow(1.5, storeState.level - 1),
    currency: storeState.currency,
    reputation: storeState.reputation || 0,
    inventory: storeState.inventory || [],
    relationships: storeState.relationships || { charlie: 1, billy: 1, tbd: 1 },
    
    // Adventure progress (for compatibility)
    adventureProgress: {
      currentChapter: 1,
      completedScenes: [],
      currentScene: 'intro'
    },
    
    // Methods from PlayerState class
    addXP(amount) {
      const currentXP = store.getState().player.xp + amount;
      const xpToNextLevel = 100 * Math.pow(1.5, store.getState().player.level - 1);
      
      store.dispatch({ 
        type: 'player/addXP', 
        payload: amount 
      });
      
      // Check for level up
      if (currentXP >= xpToNextLevel) {
        // Level up logic would go here
        const newLevel = store.getState().player.level + 1;
        store.dispatch({ 
          type: 'player/levelUp', 
          payload: newLevel
        });
        
        return {
          newLevel,
          rewards: this.getLevelRewards(newLevel)
        };
      }
      
      return null;
    },
    
    addCurrency(amount) {
      store.dispatch({ 
        type: 'player/addCurrency', 
        payload: amount 
      });
    },
    
    addItem(itemId, quantity = 1) {
      for (let i = 0; i < quantity; i++) {
        store.dispatch({
          type: 'player/addItem',
          payload: {
            id: itemId,
            name: itemId.replace(/_/g, ' '),
            quantity: 1,
            acquiredAt: Date.now()
          }
        });
      }
    },
    
    changeRelationship(character, amount) {
      store.dispatch({
        type: 'player/updateRelationship',
        payload: { character, delta: amount }
      });
    },
    
    completeScene(sceneId) {
      // Track completed scenes for adventure mode
      if (!this.adventureProgress.completedScenes.includes(sceneId)) {
        this.adventureProgress.completedScenes.push(sceneId);
      }
    },
    
    // Helper methods (retained for compatibility)
    getLevelRewards(level) {
      // Simplified from original code
      const rewards = {
        currency: level * 100,
        items: [],
        unlockedFeatures: []
      };
      
      return rewards;
    },
    
    // Persistence methods
    save() {
      console.log('State automatically saved via store subscription');
      // Actual saving happens via store subscription
    },
    
    load() {
      console.log('State automatically loaded during bootGame()');
      // Actual loading happens during bootGame()
    },
    
    reset() {
      // Reset state to defaults
      store.dispatch({
        type: 'player/loadFromStorage',
        payload: {
          level: 1,
          xp: 0,
          currency: 250,
          reputation: 0,
          inventory: [],
          relationships: { charlie: 1, billy: 1, tbd: 1 }
        }
      });
    }
  };
  
  // Subscribe to store updates to keep the bridge in sync
  store.subscribe(() => {
    const state = store.getState().player;
    bridge.level = state.level;
    bridge.xp = state.xp;
    bridge.xpToNextLevel = 100 * Math.pow(1.5, state.level - 1);
    bridge.currency = state.currency;
    bridge.reputation = state.reputation || 0;
    bridge.inventory = state.inventory || [];
    bridge.relationships = state.relationships || { charlie: 1, billy: 1, tbd: 1 };
  });
  
  return bridge;
} 