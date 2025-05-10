import { createStore, combineReducers } from '../store.js';
import { playerSlice } from '../slices/StateStackULTRA/slices/playerSlice.js';
import { applyMiddleware, createLoggerMiddleware } from '../ss_middleware.js';
import settingsReducer from '../slices/settingsSlice.js';

const rootReducer = combineReducers({
  player: playerSlice.reducer,
  settings: settingsReducer,
});

export const store = createStore(
  rootReducer,
  {},
  applyMiddleware(createLoggerMiddleware({ collapsed: true }))
);
