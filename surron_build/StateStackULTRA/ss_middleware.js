/**
 * StateStackULTRA Middleware Module
 * Provides utilities for creating and composing middleware functions
 */

/**
 * Applies middleware to a store
 * @param {...Function} middlewares - The middleware functions to apply
 * @returns {Function} A function that accepts a store creator and returns a new store creator
 */
export function applyMiddleware(...middlewares) {
  return createStore => (reducer, preloadedState) => {
    const store = createStore(reducer, preloadedState);
    let dispatch = () => {
      throw new Error('Dispatching while constructing your middleware is not allowed');
    };

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action) => dispatch(action)
    };

    const chain = middlewares.map(middleware => middleware(middlewareAPI));
    dispatch = composeMiddleware(...chain)(store.dispatch);

    return {
      ...store,
      dispatch
    };
  };
}

/**
 * Composes middleware functions into a single function
 * @param {...Function} funcs - Middleware functions to compose
 * @returns {Function} Composed middleware function
 */
export function composeMiddleware(...funcs) {
  if (funcs.length === 0) {
    return arg => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

/**
 * Creates a middleware for handling promises in actions
 * @returns {Function} Promise middleware
 */
export function createPromiseMiddleware() {
  return ({ dispatch }) => next => action => {
    if (!action.payload || typeof action.payload.then !== 'function') {
      return next(action);
    }

    // Create action types for async states
    const { type, payload, meta = {} } = action;
    const REQUEST = `${type}_REQUEST`;
    const SUCCESS = `${type}_SUCCESS`;
    const FAILURE = `${type}_FAILURE`;

    // Dispatch request action
    dispatch({ type: REQUEST, meta });

    // Handle promise resolution/rejection
    return payload
      .then(result => {
        dispatch({
          type: SUCCESS,
          payload: result,
          meta
        });
        return result;
      })
      .catch(error => {
        dispatch({
          type: FAILURE,
          error: true,
          payload: error,
          meta
        });
        return Promise.reject(error);
      });
  };
}

/**
 * Creates a middleware for batching actions
 * @returns {Function} Batch actions middleware
 */
export function createBatchMiddleware() {
  return () => next => action => {
    if (!action.batch || !Array.isArray(action.actions)) {
      return next(action);
    }
    
    action.actions.forEach(batchedAction => next(batchedAction));
  };
}

/**
 * Creates middleware that logs actions and state changes
 * @param {Object} [options] - Logger options
 * @param {boolean} [options.logDiff=true] - Whether to log state differences
 * @param {boolean} [options.collapsed=false] - Whether to collapse log groups
 * @param {Object} [options.logger=console] - Logger object
 * @returns {Function} Logger middleware
 */
export function createLoggerMiddleware(options = {}) {
  const {
    logDiff = true,
    collapsed = false,
    logger = console
  } = options;

  return store => next => action => {
    const prevState = store.getState();
    const startTime = Date.now();
    const result = next(action);
    const endTime = Date.now();
    const nextState = store.getState();
    const duration = endTime - startTime;

    const logMethod = collapsed ? logger.groupCollapsed : logger.group;

    try {
      logMethod(`Action: ${action.type} (in ${duration}ms)`);
      logger.log('Action:', action);
      logger.log('Prev State:', prevState);
      logger.log('Next State:', nextState);
      
      if (logDiff) {
        logger.log('Changes:', getDifferences(prevState, nextState));
      }
      
      return result;
    } finally {
      logger.groupEnd();
    }
  };
}

/**
 * Creates middleware for handling async actions (thunks)
 * @returns {Function} Thunk middleware
 */
export function createThunkMiddleware() {
  return ({ dispatch, getState }) => next => action => {
    if (typeof action === 'function') {
      return action(dispatch, getState);
    }

    return next(action);
  };
}

/**
 * Creates middleware for handling API calls
 * @param {Object} [options] - API options
 * @param {string} [options.baseUrl=''] - Base URL for API requests
 * @param {Object} [options.headers={}] - Default headers for API requests
 * @returns {Function} API middleware
 */
export function createAPIMiddleware(options = {}) {
  const {
    baseUrl = '',
    headers = {},
  } = options;

  return ({ dispatch }) => next => action => {
    // Skip non-API actions
    if (!action.api) {
      return next(action);
    }

    const {
      api,
      types = [],
      data = null,
      method = 'GET',
      url,
      headers: actionHeaders = {},
    } = action;

    // Extract action types
    const [requestType, successType, failureType] = types;

    // Dispatch request action if provided
    if (requestType) {
      dispatch({ type: requestType });
    }

    // Prepare fetch options
    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...actionHeaders,
      },
    };

    // Add body for non-GET requests
    if (data && method !== 'GET') {
      fetchOptions.body = JSON.stringify(data);
    }

    // Execute API call
    return fetch(`${baseUrl}${url}`, fetchOptions)
      .then(response => response.json())
      .then(json => {
        if (successType) {
          dispatch({ type: successType, payload: json });
        }
        return json;
      })
      .catch(error => {
        if (failureType) {
          dispatch({ type: failureType, error });
        }
        return Promise.reject(error);
      });
  };
}

/**
 * Helper function to find differences between objects
 * @param {Object} prevObj - Previous object
 * @param {Object} nextObj - Next object
 * @returns {Object} Object with differences
 */
export function getDifferences(prevObj, nextObj) {
  const changes = {};
  
  Object.keys(nextObj).forEach(key => {
    if (prevObj[key] !== nextObj[key]) {
      changes[key] = { 
        from: prevObj[key], 
        to: nextObj[key] 
      };
    }
  });
  
  return changes;
}

export default {
  applyMiddleware,
  composeMiddleware,
  createPromiseMiddleware,
  createBatchMiddleware,
  createLoggerMiddleware,
  createThunkMiddleware,
  createAPIMiddleware,
}; 