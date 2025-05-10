import { createSlice } from "https://cdn.skypack.dev/@reduxjs/toolkit";

// Define the initial state of settings
const initialState = {
  soundEnabled: true,
  musicEnabled: true,
  notificationsEnabled: true,
  theme: 'default',
  controlsConfig: {
    invertY: false,
    sensitivity: 5
  },
  lastUpdate: Date.now()
};

// Create the settings slice
export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // Update a single setting value
    updateSetting: (state, action) => {
      const { key, value } = action.payload;
      if (state.hasOwnProperty(key)) {
        state[key] = value;
        state.lastUpdate = Date.now();
      }
    },
    
    // Update nested control settings
    updateControlSetting: (state, action) => {
      const { key, value } = action.payload;
      if (state.controlsConfig.hasOwnProperty(key)) {
        state.controlsConfig[key] = value;
        state.lastUpdate = Date.now();
      }
    },
    
    // Load settings from storage
    loadFromStorage: (state, action) => {
      const loadedSettings = action.payload;
      return {
        ...state,
        ...loadedSettings,
        lastUpdate: Date.now()
      };
    },
    
    // Reset settings to defaults
    resetSettings: () => {
      return {
        ...initialState,
        lastUpdate: Date.now()
      };
    }
  }
});

// Export actions and reducer
export const { updateSetting, updateControlSetting, loadFromStorage, resetSettings } = settingsSlice.actions;
export default settingsSlice.reducer; 