/**
 * Simple Redux Toolkit implementation for browser ES modules
 * This provides the basic functionality needed without requiring the full @reduxjs/toolkit package
 */

/**
 * Creates a slice of state with reducers
 */
export function createSlice(options) {
  const { name, initialState, reducers = {} } = options;
  const reducerNames = Object.keys(reducers);
  
  // Create action creators
  const actionCreators = {};
  const caseReducers = {};
  
  reducerNames.forEach(reducerName => {
    const type = `${name}/${reducerName}`;
    actionCreators[reducerName] = (payload) => ({ type, payload });
    caseReducers[type] = reducers[reducerName];
  });
  
  // Create the reducer function
  const reducer = (state = initialState, action) => {
    const { type, payload } = action;
    const caseReducer = caseReducers[type];
    
    if (caseReducer) {
      // If function supports both state and payload
      if (caseReducer.length > 1) {
        return caseReducer(state, payload);
      }
      // If function only takes state
      return caseReducer(state);
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
 * Creates an entity adapter for managing normalized state of a collection
 */
export function createEntityAdapter(options = {}) {
  const selectId = options.selectId || (entity => entity.id);
  const sortComparer = options.sortComparer;
  
  const initialState = {
    ids: [],
    entities: {}
  };
  
  // Utility to get sorted ids
  const getSortedIds = (entities, ids) => {
    if (!sortComparer) return ids;
    
    const entitiesById = {};
    ids.forEach(id => {
      entitiesById[id] = entities[id];
    });
    
    return [...ids].sort((a, b) => 
      sortComparer(entitiesById[a], entitiesById[b])
    );
  };
  
  // Adapter methods
  const addOne = (state, entity) => {
    const id = selectId(entity);
    
    if (state.ids.includes(id)) {
      // Update existing entity
      return {
        ...state,
        entities: {
          ...state.entities,
          [id]: entity
        }
      };
    }
    
    // Add new entity
    const newState = {
      ids: [...state.ids, id],
      entities: {
        ...state.entities,
        [id]: entity
      }
    };
    
    // Resort if necessary
    if (sortComparer) {
      newState.ids = getSortedIds(newState.entities, newState.ids);
    }
    
    return newState;
  };
  
  const addMany = (state, entities) => {
    let newState = { ...state };
    
    entities.forEach(entity => {
      newState = addOne(newState, entity);
    });
    
    return newState;
  };
  
  const removeOne = (state, id) => {
    if (!state.entities[id]) return state;
    
    const newEntities = { ...state.entities };
    delete newEntities[id];
    
    return {
      ids: state.ids.filter(existingId => existingId !== id),
      entities: newEntities
    };
  };
  
  const removeMany = (state, ids) => {
    let newState = { ...state };
    
    ids.forEach(id => {
      newState = removeOne(newState, id);
    });
    
    return newState;
  };
  
  const updateOne = (state, { id, changes }) => {
    if (!state.entities[id]) return state;
    
    return {
      ...state,
      entities: {
        ...state.entities,
        [id]: {
          ...state.entities[id],
          ...changes
        }
      }
    };
  };
  
  // Selectors
  const getSelectors = (selectState = state => state) => {
    const selectIds = state => selectState(state).ids;
    const selectEntities = state => selectState(state).entities;
    const selectAll = state => {
      const entities = selectEntities(state);
      return selectIds(state).map(id => entities[id]);
    };
    const selectById = (state, id) => selectEntities(state)[id];
    const selectTotal = state => selectIds(state).length;
    
    return {
      selectIds,
      selectEntities,
      selectAll,
      selectById,
      selectTotal
    };
  };
  
  return {
    addOne,
    addMany,
    removeOne,
    removeMany,
    updateOne,
    getInitialState: () => initialState,
    getSelectors
  };
} 