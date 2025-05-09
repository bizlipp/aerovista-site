/**
 * StateStackULTRA Reducer Module
 * Utilities for creating and combining reducers
 */

/**
 * Combines multiple reducers into a single reducer
 * @param {Object} reducers - An object whose values are reducer functions
 * @returns {Function} A reducer function that invokes every reducer inside the passed object
 */
export function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers);
  
  // Return a combined reducer function
  return function combinedReducer(state = {}, action) {
    let hasChanged = false;
    const nextState = {};

    for (let i = 0; i < reducerKeys.length; i++) {
      const key = reducerKeys[i];
      const reducer = reducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);
      
      if (typeof nextStateForKey === 'undefined') {
        throw new Error(`Reducer "${key}" returned undefined for action "${action.type}"`);
      }
      
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    
    return hasChanged ? nextState : state;
  };
}

/**
 * Creates a reducer with initial state
 * @param {*} initialState - The initial state for this reducer
 * @param {Object} handlers - An object mapping action types to handler functions
 * @returns {Function} A reducer function
 */
export function createReducer(initialState, handlers) {
  return function reducer(state = initialState, action) {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action);
    }
    return state;
  };
}

/**
 * Creates an action handler that simply returns the action payload
 * @returns {Function} An action handler
 */
export function handleAction() {
  return (state, action) => action.payload;
}

/**
 * Creates an action handler that updates a property with the action payload
 * @param {string} prop - The property name to update
 * @returns {Function} An action handler
 */
export function handlePropAction(prop) {
  return (state, action) => ({
    ...state,
    [prop]: action.payload
  });
}

/**
 * Creates an action handler that updates multiple properties from an object payload
 * @returns {Function} An action handler
 */
export function handleObjectAction() {
  return (state, action) => ({
    ...state,
    ...action.payload
  });
}

/**
 * Creates an action handler for adding an item to an array
 * @param {string} prop - The property name containing the array
 * @returns {Function} An action handler
 */
export function handleAddItemAction(prop) {
  return (state, action) => ({
    ...state,
    [prop]: [...(state[prop] || []), action.payload]
  });
}

/**
 * Creates an action handler for removing an item from an array by id
 * @param {string} prop - The property name containing the array
 * @param {string} idField - The field name to match for removal
 * @returns {Function} An action handler
 */
export function handleRemoveItemAction(prop, idField = 'id') {
  return (state, action) => ({
    ...state,
    [prop]: (state[prop] || []).filter(item => item[idField] !== action.payload)
  });
}

/**
 * Creates an action handler for updating an item in an array by id
 * @param {string} prop - The property name containing the array
 * @param {string} idField - The field name to match for updating
 * @returns {Function} An action handler
 */
export function handleUpdateItemAction(prop, idField = 'id') {
  return (state, action) => ({
    ...state,
    [prop]: (state[prop] || []).map(item => 
      item[idField] === action.payload[idField] 
        ? { ...item, ...action.payload } 
        : item
    )
  });
}

/**
 * Creates a reducer for handling pagination state
 * @param {Object} types - Action types for pagination
 * @param {string} types.request - The request action type
 * @param {string} types.success - The success action type
 * @param {string} types.failure - The failure action type
 * @param {string} types.reset - The reset action type
 * @returns {Function} A pagination reducer
 */
export function createPaginationReducer(types) {
  const initialState = {
    items: [],
    page: 1,
    totalPages: 0,
    totalItems: 0,
    isFetching: false,
    error: null
  };

  return createReducer(initialState, {
    [types.request]: (state) => ({
      ...state,
      isFetching: true,
      error: null
    }),
    [types.success]: (state, action) => ({
      ...state,
      isFetching: false,
      items: action.payload.items || [],
      page: action.payload.page || 1,
      totalPages: action.payload.totalPages || 0,
      totalItems: action.payload.totalItems || 0
    }),
    [types.failure]: (state, action) => ({
      ...state,
      isFetching: false,
      error: action.payload
    }),
    [types.reset]: () => initialState
  });
}

export default {
  combineReducers,
  createReducer,
  handleAction,
  handlePropAction,
  handleObjectAction,
  handleAddItemAction,
  handleRemoveItemAction,
  handleUpdateItemAction,
  createPaginationReducer
}; 