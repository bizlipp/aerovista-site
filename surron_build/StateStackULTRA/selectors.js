/**
 * StateStackULTRA Selectors Module
 * Provides utilities for creating and composing selector functions
 */

/**
 * Creates a memoized selector with dependency selectors
 * @param {Function[]} inputSelectors - Input selectors that extract pieces of state
 * @param {Function} resultFunc - Function that computes derived data
 * @returns {Function} Memoized selector function
 */
export function createSelector(...args) {
  const resultFunc = args.pop();
  const inputSelectors = args;
  
  let lastInputs = null;
  let lastResult = null;
  
  return function selector(state, ...extraArgs) {
    // Extract inputs from selectors
    const inputs = inputSelectors.map(inputSelector => 
      inputSelector(state, ...extraArgs)
    );
    
    // Check if inputs have changed
    const inputsChanged = !lastInputs || 
      inputs.length !== lastInputs.length || 
      inputs.some((input, index) => input !== lastInputs[index]);
    
    // If inputs haven't changed, return last result
    if (!inputsChanged) {
      return lastResult;
    }
    
    // Calculate new result
    const result = resultFunc(...inputs, ...extraArgs);
    
    // Store inputs and result
    lastInputs = inputs;
    lastResult = result;
    
    return result;
  };
}

/**
 * Creates a selector that builds an array from multiple selectors
 * @param {Function[]} selectors - Selectors that each contribute an item
 * @returns {Function} Array selector
 */
export function createArraySelector(selectors) {
  return (state, ...args) => 
    selectors.map(selector => selector(state, ...args));
}

/**
 * Creates a selector that builds an object from selectors
 * @param {Object} selectorMap - Object with selectors as values
 * @returns {Function} Object selector
 */
export function createObjectSelector(selectorMap) {
  const keys = Object.keys(selectorMap);
  
  return (state, ...args) => {
    const result = {};
    
    for (const key of keys) {
      result[key] = selectorMap[key](state, ...args);
    }
    
    return result;
  };
}

/**
 * Creates a selector for a specific slice of state
 * @param {string|Function} path - Path to state slice or selector function
 * @returns {Function} Slice selector
 */
export function createSliceSelector(path) {
  if (typeof path === 'function') {
    return path;
  }
  
  if (typeof path === 'string') {
    return state => {
      const parts = path.split('.');
      let result = state;
      
      for (const part of parts) {
        if (result == null) {
          return undefined;
        }
        result = result[part];
      }
      
      return result;
    };
  }
  
  throw new Error('Path must be a string or function');
}

/**
 * Creates a selector for entities in a normalized state structure
 * @param {Function} entitiesSelector - Selector for the entities
 * @param {Function} idsSelector - Selector for the entity ids
 * @returns {Function} Entities selector that returns an array
 */
export function createEntitiesSelector(entitiesSelector, idsSelector) {
  return createSelector(
    entitiesSelector,
    idsSelector,
    (entities, ids) => ids.map(id => entities[id])
  );
}

/**
 * Creates a selector that filters entities based on a predicate
 * @param {Function} entitiesSelector - Selector that returns an array of entities
 * @param {Function} predicateCreator - Function that creates a filter predicate
 * @returns {Function} Filtered entities selector
 */
export function createFilterSelector(entitiesSelector, predicateCreator) {
  return (state, ...args) => {
    const entities = entitiesSelector(state);
    const predicate = predicateCreator(...args);
    return entities.filter(predicate);
  };
}

export default {
  createSelector,
  createArraySelector,
  createObjectSelector,
  createSliceSelector,
  createEntitiesSelector,
  createFilterSelector
}; 