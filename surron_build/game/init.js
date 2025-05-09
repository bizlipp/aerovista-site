import { store } from '../StateStackULTRA/store/gameStore.js';
import { PlayerModel } from '../DataStackULTRA/models/playerModel.js';
import { playerSlice } from '../StateStackULTRA/slices/StateStackULTRA/slices/playerSlice.js';

// Extract actions from the player slice
const playerActions = Object.keys(playerSlice.reducers).reduce((actions, actionName) => {
  actions[actionName] = (payload) => ({ type: `${playerSlice.name}/${actionName}`, payload });
  return actions;
}, {});

export async function bootGame() {
  // Load data from storage on startup
  try {
    const data = await PlayerModel.get('main');
    if (data) {
      store.dispatch(playerActions.loadFromStorage(data));
      console.log('Player state loaded from storage');
    } else {
      console.log('No saved player state found, using defaults');
    }
  } catch (error) {
    console.error('Failed to load player state:', error);
  }

  // Subscribe to store changes and persist them
  store.subscribe(() => {
    const current = store.getState().player;
    PlayerModel.update('main', current)
      .catch(error => console.error('Failed to save player state:', error));
  });
  
  console.log('Game state management initialized');
} 