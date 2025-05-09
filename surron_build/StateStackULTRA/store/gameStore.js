import { createStore, combineReducers, applyMiddleware } from '../store.js';
import { playerSlice } from '../slices/StateStackULTRA/slices/playerSlice.js';
import { createLoggerMiddleware } from '../middleware.js';

const rootReducer = combineReducers({
  player: playerSlice.reducer
});

export const store = createStore(
  rootReducer,
  {},
  applyMiddleware(createLoggerMiddleware({ collapsed: true }))
); 