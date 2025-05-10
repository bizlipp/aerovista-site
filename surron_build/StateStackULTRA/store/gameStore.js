import { createStore, combineReducers } from '../store.js';
import { playerSlice } from '../slices/StateStackULTRA/slices/playerSlice.js';
import { applyMiddleware, createLoggerMiddleware } from '../ss_middleware.js';
import settingsReducer from '../slices/settingsSlice.js';
import questReducer from '../slices/questSlice.js';
import characterReducer from '../slices/characterSlice.js';
import locationReducer from '../slices/locationSlice.js';

const rootReducer = combineReducers({
  player: playerSlice.reducer,
  settings: settingsReducer,
  quests: questReducer,
  characters: characterReducer,
  locations: locationReducer
});

export const store = createStore(
  rootReducer,
  {},
  applyMiddleware(createLoggerMiddleware({ collapsed: true }))
);
