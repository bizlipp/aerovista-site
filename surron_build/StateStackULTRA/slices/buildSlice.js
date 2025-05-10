// buildSlice.js
import { createSlice, createEntityAdapter } from '../toolkit.js';

// Create entity adapter for builds
const buildsAdapter = createEntityAdapter();

const initialState = buildsAdapter.getInitialState({
  activeBuildId: null,
  isBuilding: false,
  buildHistory: [],
  lastModified: Date.now()
});

export const buildSlice = createSlice({
  name: 'builds',
  initialState,
  reducers: {
    // Add a new build
    addBuild: (state, action) => {
      buildsAdapter.addOne(state, {
        ...action.payload,
        createdAt: Date.now(),
        modifiedAt: Date.now()
      });
      state.lastModified = Date.now();
    },
    
    // Update a build
    updateBuild: (state, action) => {
      const { id, changes } = action.payload;
      buildsAdapter.updateOne(state, {
        id,
        changes: {
          ...changes,
          modifiedAt: Date.now()
        }
      });
      state.lastModified = Date.now();
    },
    
    // Remove a build
    removeBuild: (state, action) => {
      buildsAdapter.removeOne(state, action.payload);
      state.lastModified = Date.now();
    },
    
    // Set active build
    setActiveBuild: (state, action) => {
      state.activeBuildId = action.payload;
    },
    
    // Add component to build
    addComponent: (state, action) => {
      const { buildId, component } = action.payload;
      const build = state.entities[buildId];
      
      if (build) {
        build.components = [...(build.components || []), component];
        build.modifiedAt = Date.now();
        state.lastModified = Date.now();
      }
    },
    
    // Remove component from build
    removeComponent: (state, action) => {
      const { buildId, componentId } = action.payload;
      const build = state.entities[buildId];
      
      if (build && build.components) {
        build.components = build.components.filter(c => c.id !== componentId);
        build.modifiedAt = Date.now();
        state.lastModified = Date.now();
      }
    },
    
    // Start building mode
    startBuilding: (state) => {
      state.isBuilding = true;
    },
    
    // Stop building mode
    stopBuilding: (state) => {
      state.isBuilding = false;
    },
    
    // Add to build history
    addToBuildHistory: (state, action) => {
      const historyEntry = {
        timestamp: Date.now(),
        action: action.payload.action,
        buildId: action.payload.buildId,
        details: action.payload.details
      };
      
      state.buildHistory = [historyEntry, ...state.buildHistory.slice(0, 19)];
    }
  }
});

// Export the actions
export const {
  addBuild,
  updateBuild,
  removeBuild,
  setActiveBuild,
  addComponent,
  removeComponent,
  startBuilding,
  stopBuilding,
  addToBuildHistory
} = buildSlice.actions;

// Export the reducer
export default buildSlice.reducer; 