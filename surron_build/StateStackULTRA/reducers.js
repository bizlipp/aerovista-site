/**
 * StateStackULTRA Reducers Module
 * Provides utilities for creating and composing reducer functions
 */

/**
 * Creates a reducer function with handlers for different action types
 * @param {Object} initialState - Initial state for reducer
 * @param {Object} handlers - Action type to handler function mapping
 * @returns {Function} Reducer function
 */
export function createReducer(initialState, handlers) {
  return function reducer(state = initialState, action) {
    if (Object.prototype.hasOwnProperty.call(handlers, action.type)) {
      return handlers[action.type](state, action);
    }
    return state;
  };
}

/**
 * Combines multiple reducers into a single reducer
 * @param {Object} reducers - Object with reducer functions as values
 * @returns {Function} Combined reducer function
 */
export function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers);
  
  // Validate reducers
  reducerKeys.forEach(key => {
    const reducer = reducers[key];
    const initialState = reducer(undefined, { type: '@@INIT' });
    
    if (typeof initialState === 'undefined') {
      throw new Error(
        `Reducer "${key}" returned undefined during initialization. ` +
        `If the state passed to the reducer is undefined, you must ` +
        `explicitly return the initial state.`
      );
    }
  });

  return function combinedReducer(state = {}, action) {
    let hasChanged = false;
    const nextState = {};

    for (const key of reducerKeys) {
      const reducer = reducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);

      if (typeof nextStateForKey === 'undefined') {
        throw new Error(
          `Reducer "${key}" returned undefined when handling action type: ${action.type}. ` +
          `To ignore an action, return the previous state.`
        );
      }

      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    
    return hasChanged ? nextState : state;
  };
}

/**
 * Creates a reducer that handles array operations
 * @param {Array} initialState - Initial state array
 * @param {Object} handlers - Custom handlers for array operations
 * @returns {Function} Array reducer function
 */
export function createArrayReducer(initialState = [], handlers = {}) {
  const defaultHandlers = {
    ADD_ITEM: (state, action) => [...state, action.payload],
    REMOVE_ITEM: (state, action) => state.filter((_, index) => index !== action.payload),
    UPDATE_ITEM: (state, action) => {
      const { index, item } = action.payload;
      return state.map((oldItem, i) => (i === index ? item : oldItem));
    },
    CLEAR_ITEMS: () => [],
    ...handlers
  };

  return createReducer(initialState, defaultHandlers);
}

/**
 * Creates a reducer that handles entity collections (normalized objects)
 * @param {Object} initialState - Initial state for entity collection
 * @param {Object} handlers - Custom handlers for entity operations
 * @returns {Function} Entity reducer function
 */
export function createEntityReducer(initialState = { byId: {}, allIds: [] }, handlers = {}) {
  const defaultHandlers = {
    ADD_ENTITY: (state, action) => {
      const entity = action.payload;
      const id = entity.id;
      
      // Skip if entity already exists
      if (state.byId[id]) {
        return state;
      }
      
      return {
        byId: { ...state.byId, [id]: entity },
        allIds: [...state.allIds, id]
      };
    },
    UPDATE_ENTITY: (state, action) => {
      const { id, changes } = action.payload;
      
      // Skip if entity doesn't exist
      if (!state.byId[id]) {
        return state;
      }
      
      return {
        ...state,
        byId: {
          ...state.byId,
          [id]: { ...state.byId[id], ...changes }
        }
      };
    },
    REMOVE_ENTITY: (state, action) => {
      const id = action.payload;
      const { [id]: removed, ...restById } = state.byId;
      
      return {
        byId: restById,
        allIds: state.allIds.filter(entityId => entityId !== id)
      };
    },
    CLEAR_ENTITIES: () => ({ byId: {}, allIds: [] }),
    ...handlers
  };

  return createReducer(initialState, defaultHandlers);
}

/**
 * Creates a reducer that manages an array of items
 * @param {Object} options - Options for the list reducer
 * @param {Array} [options.initialState=[]] - Initial state
 * @param {string} options.addType - Action type for adding items
 * @param {string} options.removeType - Action type for removing items
 * @param {string} options.updateType - Action type for updating items
 * @param {function} [options.idSelector=(item) => item.id] - Function to get item ID
 * @returns {Function} A reducer function
 */
export function createListReducer(options) {
  const {
    initialState = [],
    addType,
    removeType,
    updateType,
    idSelector = (item) => item.id
  } = options;

  return function listReducer(state = initialState, action) {
    switch (action.type) {
      case addType:
        return [...state, action.payload];
        
      case removeType: {
        const idToRemove = typeof action.payload === 'object' 
          ? idSelector(action.payload) 
          : action.payload;
        
        return state.filter(item => idSelector(item) !== idToRemove);
      }
      
      case updateType: {
        const updatedItem = action.payload;
        const idToUpdate = idSelector(updatedItem);
        
        return state.map(item => 
          idSelector(item) === idToUpdate 
            ? { ...item, ...updatedItem } 
            : item
        );
      }
      
      default:
        return state;
    }
  };
}

/**
 * Creates a nested reducer that only processes actions for a specific slice of state
 * @param {Function} reducer - Reducer to wrap
 * @param {string} sliceName - Name of the state slice this reducer handles
 * @returns {Function} Wrapped reducer function
 */
export function createSliceReducer(reducer, sliceName) {
  return function sliceReducer(state, action) {
    // Handle undefined state
    if (typeof state === 'undefined') {
      return { [sliceName]: reducer(undefined, action) };
    }
    
    // Skip if this is already processed by parent
    if (typeof state[sliceName] === 'undefined') {
      return state;
    }
    
    // Process if action is meant for this slice or is a global action
    const isGlobalAction = action.type.startsWith('@@');
    const isSliceAction = action.slice === sliceName;
    
    if (isGlobalAction || isSliceAction || !action.slice) {
      const sliceState = reducer(state[sliceName], action);
      if (sliceState !== state[sliceName]) {
        return { ...state, [sliceName]: sliceState };
      }
    }
    
    return state;
  };
}

/**
 * Creates a slice of state with actions and reducer
 * @param {Object} options - Slice configuration
 * @param {string} options.name - Slice name
 * @param {*} options.initialState - Initial state
 * @param {Object} options.reducers - Object with reducer functions
 * @returns {Object} Slice object with actions and reducer
 */
export function createSlice({ name, initialState, reducers = {} }) {
  if (!name) {
    throw new Error('Slice name is required');
  }

  const reducerMap = {};
  const actionCreators = {};

  // Create action types and action creators
  Object.keys(reducers).forEach(key => {
    const actionType = `${name}/${key}`;
    reducerMap[actionType] = reducers[key];
    
    actionCreators[key] = payload => ({
      type: actionType,
      payload
    });
  });

  // Create the reducer function
  const reducer = (state = initialState, action) => {
    if (reducerMap.hasOwnProperty(action.type)) {
      return reducerMap[action.type](state, action.payload);
    }
    return state;
  };

  return {
    name,
    reducer,
    actions: actionCreators
  };
}

/**
 * Creates dynamic keys for namespaced action types
 * @param {string} namespace - The namespace for the action types
 * @param {Array<string>} actionTypes - List of action type names
 * @returns {Object} Object with action type constants
 */
export function createActionTypes(namespace, actionTypes) {
  return actionTypes.reduce((acc, type) => {
    acc[type] = `${namespace}/${type}`;
    return acc;
  }, {});
}

export default {
  createReducer,
  combineReducers,
  createArrayReducer,
  createEntityReducer,
  createListReducer,
  createSliceReducer,
  createSlice,
  createActionTypes
}; 