/**
 * StateStackULTRA Store Module
 * Provides core state management functionality
 */

import { composeMiddleware } from './middleware';

/**
 * Creates a store to manage application state
 * @param {Function} reducer - Root reducer function
 * @param {*} initialState - Initial state
 * @param {Function} [enhancer] - Store enhancer function
 * @returns {Object} Store object
 */
export function createStore(reducer, initialState, enhancer) {
  if (typeof enhancer === 'function') {
    return enhancer(createStore)(reducer, initialState);
  }

  let currentState = initialState;
  let currentReducer = reducer;
  let listeners = [];
  let isDispatching = false;

  /**
   * Gets the current state
   * @returns {*} Current state
   */
  function getState() {
    if (isDispatching) {
      throw new Error(
        'You may not call store.getState() while the reducer is executing.'
      );
    }

    return currentState;
  }

  /**
   * Subscribes to state changes
   * @param {Function} listener - Listener function
   * @returns {Function} Unsubscribe function
   */
  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected the listener to be a function.');
    }

    if (isDispatching) {
      throw new Error(
        'You may not call store.subscribe() while the reducer is executing.'
      );
    }

    let isSubscribed = true;
    listeners.push(listener);

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      if (isDispatching) {
        throw new Error(
          'You may not unsubscribe from a store listener while the reducer is executing.'
        );
      }

      isSubscribed = false;
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  }

  /**
   * Dispatches an action
   * @param {Object} action - Action object
   * @returns {Object} Action object
   */
  function dispatch(action) {
    if (!action || typeof action !== 'object') {
      throw new Error('Actions must be plain objects.');
    }

    if (typeof action.type === 'undefined') {
      throw new Error('Actions must have a type property.');
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

    listeners.forEach(listener => listener());
    return action;
  }

  /**
   * Replaces the current reducer
   * @param {Function} nextReducer - Next reducer function
   */
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.');
    }

    currentReducer = nextReducer;
    dispatch({ type: '@@StateStackULTRA/REPLACE' });
  }

  // Dispatch initial action to populate store with initial state
  dispatch({ type: '@@StateStackULTRA/INIT' });

  return {
    getState,
    subscribe,
    dispatch,
    replaceReducer,
  };
}

/**
 * Creates a store enhancer that applies middleware
 * @param {...Function} middlewares - Middleware functions
 * @returns {Function} Store enhancer
 */
export function applyMiddleware(...middlewares) {
  return (createStore) => (reducer, initialState) => {
    const store = createStore(reducer, initialState);
    let dispatch = store.dispatch;
    let chain = [];

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action) => dispatch(action),
    };

    chain = middlewares.map(middleware => middleware(middlewareAPI));
    dispatch = composeMiddleware(...chain)(store.dispatch);

    return {
      ...store,
      dispatch,
    };
  };
}

/**
 * Combines multiple reducers into a single reducer
 * @param {Object} reducers - Object of reducer functions
 * @returns {Function} Combined reducer function
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

  const finalReducerKeys = Object.keys(finalReducers);

  return function combination(state = {}, action) {
    let hasChanged = false;
    const nextState = {};

    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i];
      const reducer = finalReducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);

      if (typeof nextStateForKey === 'undefined') {
        throw new Error(`Reducer "${key}" returned undefined when handling "${action.type}" action.`);
      }

      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }

    return hasChanged ? nextState : state;
  };
}

export default {
  createStore,
  applyMiddleware,
  combineReducers,
}; 