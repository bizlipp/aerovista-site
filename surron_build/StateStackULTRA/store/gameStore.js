import { createStore, combineReducers } from '../store.js';
import { playerSlice } from '../slices/playerSlice.js';
import { applyMiddleware, createLoggerMiddleware } from '../ss_middleware.js';
import settingsReducer from '../slices/settingsSlice.js';
import questReducer from '../slices/questSlice.js';
import characterReducer from '../slices/characterSlice.js';
import locationReducer from '../slices/locationSlice.js';
import fishingReducer from '../slices/fishingSlice.js';
import buildReducer from '../slices/buildSlice.js';

const rootReducer = combineReducers({
  player: playerSlice.reducer,
  settings: settingsReducer,
  quests: questReducer,
  characters: characterReducer,
  locations: locationReducer,
  fishing: fishingReducer,
  builds: buildReducer
});

export const store = createStore(
  rootReducer,
  {},
  applyMiddleware(createLoggerMiddleware({ collapsed: true }))
);
