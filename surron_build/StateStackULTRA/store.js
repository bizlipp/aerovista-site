/**
 * StateStackULTRA Store Module
 * Provides core state management functionality
 */

import { applyMiddleware, createLoggerMiddleware } from './ss_middleware.js';

/**
 * Creates a Redux-style store to manage app state
 */
export function createStore(reducer, initialState, enhancer) {
  if (typeof enhancer === 'function') {
    return enhancer(createStore)(reducer, initialState);
  }

  let currentReducer = reducer;
  let currentState = initialState;
  let listeners = [];
  let nextListeners = listeners;
  let isDispatching = false;

  function ensureCanMutateNextListeners() {
    if (nextListeners === listeners) {
      nextListeners = listeners.slice();
    }
  }

  function getState() {
    if (isDispatching) {
      throw new Error('You may not call store.getState() while the reducer is executing.');
    }
    return currentState;
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected the listener to be a function.');
    }

    let isSubscribed = true;
    ensureCanMutateNextListeners();
    nextListeners.push(listener);

    return function unsubscribe() {
      if (!isSubscribed) return;
      if (isDispatching) {
        throw new Error('You may not unsubscribe from a store listener while the reducer is executing.');
      }

      isSubscribed = false;
      ensureCanMutateNextListeners();
      const index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
    };
  }

  function dispatch(action) {
    if (typeof action !== 'object' || action === null || typeof action.type === 'undefined') {
      throw new Error('Actions must be plain objects with a "type" property.');
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.');
    }

    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    const listenersToNotify = (listeners = nextListeners);
    for (let i = 0; i < listenersToNotify.length; i++) {
      listenersToNotify[i]();
    }

    return action;
  }

  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.');
    }
    currentReducer = nextReducer;
    dispatch({ type: '@@STORE/REPLACE' });
  }

  // Initialize
  dispatch({ type: '@@STORE/INIT' });

  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer
  };
}

/**
 * Combines multiple reducer functions into one
 */
export function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers);
  const finalReducers = {};

  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i];
    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }

  const finalKeys = Object.keys(finalReducers);

  return function combination(state = {}, action) {
    let hasChanged = false;
    const nextState = {};

    for (let i = 0; i < finalKeys.length; i++) {
      const key = finalKeys[i];
      const reducer = finalReducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);

      if (typeof nextStateForKey === 'undefined') {
        throw new Error(`Reducer for key "${key}" returned undefined when handling action "${action.type}"`);
      }

      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }

    return hasChanged ? nextState : state;
  };
}

export { createStore, combineReducers }; 