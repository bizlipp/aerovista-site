/**
 * StateStackULTRA Actions Module
 * Provides utilities for creating action creators and action types
 */

/**
 * Creates an action creator function
 * @param {string} type - The action type
 * @param {Function} [payloadCreator] - Function that returns the action payload
 * @param {Function} [metaCreator] - Function that returns the action meta
 * @returns {Function} Action creator function
 */
export function createAction(type, payloadCreator, metaCreator) {
  if (typeof type !== 'string' || !type) {
    throw new Error('Action type must be a non-empty string');
  }

  const finalPayloadCreator = typeof payloadCreator === 'function'
    ? payloadCreator
    : (payload) => payload;

  const actionCreator = (...args) => {
    const payload = finalPayloadCreator(...args);
    const action = { type };

    if (payload !== undefined) {
      action.payload = payload;
    }

    if (typeof metaCreator === 'function') {
      action.meta = metaCreator(...args);
    }

    return action;
  };

  actionCreator.toString = () => type;
  actionCreator.type = type;

  return actionCreator;
}

/**
 * Creates an action creator for actions with no payload
 * @param {string} type - Action type
 * @returns {Function} Action creator function
 */
export function createEmptyAction(type) {
  const actionCreator = () => ({ type });
  actionCreator.toString = () => type;
  actionCreator.type = type;
  
  return actionCreator;
}

/**
 * Creates multiple action creators from an object of action types
 * @param {Object} actionMap - Object mapping action names to action types
 * @returns {Object} Object with action creator functions
 */
export function createActions(actionMap) {
  const actionCreators = {};
  
  Object.entries(actionMap).forEach(([name, typeOrConfig]) => {
    if (typeof typeOrConfig === 'string') {
      actionCreators[name] = createAction(typeOrConfig);
    } else {
      const { type, payload, meta } = typeOrConfig;
      actionCreators[name] = createAction(type, payload, meta);
    }
  });
  
  return actionCreators;
}

/**
 * Creates action types with a common namespace
 * @param {string} namespace - Namespace for the action types
 * @param {Array<string>} typeNames - Array of action type names
 * @returns {Object} Object with action type constants
 */
export function createActionTypes(namespace, typeNames) {
  const actionTypes = {};
  
  typeNames.forEach(typeName => {
    const type = `${namespace}/${typeName}`;
    actionTypes[typeName] = type;
  });
  
  return actionTypes;
}

/**
 * Creates a set of async action types (request, success, failure)
 * @param {string} base - Base name for the action type
 * @param {string} [namespace] - Optional namespace
 * @returns {Object} Object with request, success, and failure action types
 */
export function createAsyncActionTypes(base, namespace = '') {
  const prefix = namespace ? `${namespace}/` : '';
  return {
    REQUEST: `${prefix}${base}_REQUEST`,
    SUCCESS: `${prefix}${base}_SUCCESS`,
    FAILURE: `${prefix}${base}_FAILURE`,
  };
}

/**
 * Creates a set of async action creators
 * @param {Object} types - Object with request, success, and failure action types
 * @returns {Object} Object with request, success, and failure action creators
 */
export function createAsyncActions(types) {
  return {
    request: createAction(types.REQUEST),
    success: createAction(types.SUCCESS),
    failure: createAction(types.FAILURE)
  };
}

/**
 * Combines multiple action objects into one
 * @param {...Object} actionObjects - Action objects to combine
 * @returns {Object} Combined action object
 */
export function combineActions(...actionObjects) {
  return Object.assign({}, ...actionObjects);
}

/**
 * Creates a batch action that dispatches multiple actions
 * @param {Array} actions - Array of actions to dispatch
 * @returns {Object} Batch action
 */
export function batchActions(actions) {
  return {
    type: '@@store/BATCH',
    payload: actions
  };
}

export default {
  createAction,
  createEmptyAction,
  createActions,
  createAsyncActions,
  combineActions,
  batchActions
}; 