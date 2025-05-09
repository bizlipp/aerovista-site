/**
 * StateStackULTRA
 * A lightweight, modular state management system
 */

import { 
  createStore, 
  applyMiddleware, 
  combineReducers 
} from './store';

import {
  createReducer,
  createArrayReducer,
  createEntityReducer
} from './reducers';

import {
  composeMiddleware,
  createLoggerMiddleware,
  createThunkMiddleware,
  createAPIMiddleware
} from './middleware';

import {
  createSelector,
  createArraySelector,
  createObjectSelector,
  createSliceSelector,
  createEntitiesSelector,
  createFilterSelector
} from './selectors';

// Export store functionality
export {
  createStore,
  applyMiddleware,
  combineReducers
};

// Export reducer utilities
export {
  createReducer,
  createArrayReducer,
  createEntityReducer
};

// Export middleware utilities
export {
  composeMiddleware,
  createLoggerMiddleware,
  createThunkMiddleware,
  createAPIMiddleware
};

// Export selector utilities
export {
  createSelector,
  createArraySelector,
  createObjectSelector,
  createSliceSelector,
  createEntitiesSelector,
  createFilterSelector
};

// Export default object with all utilities
export default {
  // Store
  createStore,
  applyMiddleware,
  combineReducers,
  
  // Reducers
  createReducer,
  createArrayReducer,
  createEntityReducer,
  
  // Middleware
  composeMiddleware,
  createLoggerMiddleware,
  createThunkMiddleware,
  createAPIMiddleware,
  
  // Selectors
  createSelector,
  createArraySelector,
  createObjectSelector,
  createSliceSelector,
  createEntitiesSelector,
  createFilterSelector
}; 