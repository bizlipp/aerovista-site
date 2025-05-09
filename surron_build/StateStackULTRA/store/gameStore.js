import { createStore, combineReducers } from '../store.js';
import { playerSlice } from '../slices/StateStackULTRA/slices/playerSlice.js';
import { applyMiddleware, createLoggerMiddleware } from '../ss_middleware.js';

const rootReducer = combineReducers({
  player: playerSlice.reducer
});

export const store = createStore(
  rootReducer,
  {},
  applyMiddleware(createLoggerMiddleware({ collapsed: true }))
);
