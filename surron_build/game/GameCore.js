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
   * Navigate between game scenes or modules (stubbed for now)
   */
  navigateTo(target) {
    console.log(`[GameCore] Navigating to scene: ${target}`);
    // Could emit an ICP message or trigger route change
  }
};

export default GameCore;
