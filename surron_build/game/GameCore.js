// game/GameCore.js
import { store } from '../StateStackULTRA/store/gameStore.js';
import { playerSlice } from '../StateStackULTRA/slices/StateStackULTRA/slices/playerSlice.js';
import { PlayerModel } from '../DataStackULTRA/models/playerModel.js';

// Create dynamic action creators from slice reducers
const playerActions = Object.keys(playerSlice.reducers).reduce((actions, actionName) => {
  actions[actionName] = (payload) => ({ type: `${playerSlice.name}/${actionName}`, payload });
  return actions;
}, {});

const GameCore = {
  /**
   * Initialize game state from persistent storage
   */
  async boot() {
    console.info('[GameCore] Booting game...');

    try {
      const data = await PlayerModel.get('main');
      if (data) {
        store.dispatch(playerActions.loadFromStorage(data));
        console.info('[GameCore] Loaded player state from storage:', data);
      } else {
        console.info('[GameCore] No saved player state found. Starting fresh.');
        // Initialize with default player state
        store.dispatch(playerActions.loadFromStorage({
          level: 1,
          xp: 0,
          xpToNextLevel: 100,
          currency: 250,
          reputation: 0,
          inventory: [],
          builds: [],
          unlockedParts: [],
          completedMissions: [],
          adventureProgress: {
            currentChapter: 1,
            completedScenes: [],
            currentScene: 'intro'
          },
          relationships: {
            charlie: 1,
            billy: 1,
            tbd: 1
          },
          achievements: []
        }));
        this.save();
        console.info('[GameCore] Created new player state.');
      }
    } catch (error) {
      console.error('[GameCore] Boot error:', error);
      throw error;
    }

    // Auto-save on any change
    store.subscribe(() => {
      const current = store.getState().player;
      PlayerModel.update('main', current);
    });
  },

  /**
   * Manual save trigger (optional)
   */
  save() {
    const state = store.getState().player;
    PlayerModel.update('main', state);
    console.log('[GameCore] Player state manually saved.');
  },

  /**
   * Access player state directly
   */
  getPlayerState() {
    return store.getState().player;
  },

  /**
   * Dispatch player XP gain
   */
  addXP(amount = 0) {
    store.dispatch(playerActions.addXP(amount));
    console.log(`[GameCore] +${amount} XP`);
  },

  /**
   * Dispatch currency gain
   */
  addCurrency(amount = 0) {
    store.dispatch(playerActions.addCurrency(amount));
    console.log(`[GameCore] +$${amount} SurCoins`);
  },

  /**
   * Add item to inventory
   */
  addItem(item) {
    store.dispatch(playerActions.addItem(item));
    console.log('[GameCore] Item added:', item);
  },

  /**
   * Update relationship scores
   */
  updateRelationship(character, delta = 1) {
    store.dispatch(playerActions.updateRelationship({ character, delta }));
    console.log(`[GameCore] Relationship with ${character} adjusted by ${delta}`);
  },

  /**
   * Dispatch actions to store from external components
   * @param {string} action - Action name
   * @param {*} payload - Action payload 
   */
  dispatch(action, payload) {
    // Check if the action exists in playerActions
    if (playerActions[action]) {
      store.dispatch(playerActions[action](payload));
      console.log(`[GameCore] Dispatched action: ${action}`, payload);
      return true;
    } else {
      console.warn(`[GameCore] Unknown action: ${action}`);
      return false;
    }
  },

  /**
   * Navigate between game scenes or modules (stubbed for now)
   */
  navigateTo(target) {
    console.log(`[GameCore] Navigating to scene: ${target}`);
    // Could emit an ICP message or trigger route change
  },

  /**
   * Export player state as a JSON string
   */
  exportState() {
    const state = store.getState().player;
    const exportedState = {
      ...state,
      exportedAt: Date.now(),
      versionInfo: {
        gameVersion: "1.0.0", // Should be dynamic in a real implementation
        exportVersion: "1"
      }
    };
    return JSON.stringify(exportedState);
  },

  /**
   * Import player state from a JSON string
   * @param {string} jsonState - JSON representation of player state
   * @returns {boolean} - Success or failure
   */
  importState(jsonState) {
    try {
      const importedState = JSON.parse(jsonState);
      if (!importedState.level || !importedState.versionInfo) {
        console.error('[GameCore] Invalid player state data');
        return false;
      }
      if (importedState.versionInfo.exportVersion !== "1") {
        console.error('[GameCore] Incompatible player state version');
        return false;
      }
      store.dispatch(playerActions.loadFromStorage(importedState));
      this.save();
      console.log('[GameCore] Player state imported successfully');
      return true;
    } catch (error) {
      console.error('[GameCore] Error importing player state:', error);
      return false;
    }
  },

  /**
   * Debugging utility for player state
   */
  debugPlayerState() {
    const state = store.getState().player;
    console.log('==== PLAYER STATE DEBUG ====');
    console.log('Current level:', state.level);
    console.log('Current XP:', state.xp);
    console.log('XP to next level:', state.xpToNextLevel);
    console.log('Currency:', state.currency);
    console.log('Inventory items:', state.inventory.length);
    console.log('Completed missions:', state.completedMissions);
    // Test XP addition
    const testXP = 10;
    const oldXP = state.xp;
    this.addXP(testXP);
    const newXP = store.getState().player.xp;
    console.log(`After adding ${testXP} XP:`, newXP, 'Difference:', newXP - oldXP);
    // Test currency addition
    const testCurrency = 50;
    const oldCurrency = state.currency;
    this.addCurrency(testCurrency);
    const newCurrency = store.getState().player.currency;
    console.log(`After adding ${testCurrency} currency:`, newCurrency, 'Difference:', newCurrency - oldCurrency);
    // Check persistence
    try {
      const savedState = PlayerModel.get('main');
      console.log('State in PlayerModel:', savedState ? 'Present' : 'Missing');
    } catch (e) {
      console.error('Error accessing PlayerModel:', e);
    }
    console.log('==== DEBUG COMPLETE ====');
  }
};

export default GameCore;
