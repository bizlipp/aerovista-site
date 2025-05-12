/**
 * main.js - Main data model for the Surron Squad game
 * 
 * This model is a required component for the proper functioning of the game.
 * It stores global application state that's not handled by the Redux store.
 */

import { getDefaultInstance } from '../index.js';

// Get DataStack instance
const dataStack = getDefaultInstance();

// Define schema for the main model
const mainSchema = {
  version: { type: 'string', required: true },
  gameState: { type: 'object', default: {} },
  lastUpdated: { type: 'number', default: 0 },
  settings: { type: 'object', default: {} },
  flags: { type: 'object', default: {} }
};

// Create the main model
const mainModel = dataStack.createModel('main', mainSchema, {
  keyPrefix: 'surron:main:'
});

// Force create and initialize the main model with default values
export async function forceCreateMainModel() {
  try {
    // Use direct key setting to avoid the model error
    const key = 'surron:main:main';
    const data = {
      version: '1.0.0',
      gameState: {},
      lastUpdated: Date.now(),
      settings: {
        sound: true,
        music: true,
        vibration: true,
        difficulty: 'normal'
      },
      flags: {
        tutorialCompleted: false,
        firstTimeUser: true
      }
    };
    
    // Use the dataStack's direct set method
    await dataStack.set(key, data);
    
    console.log('[DataStackULTRA] Force initialized main model');
    return { id: 'main', ...data };
  } catch (error) {
    console.error('[DataStackULTRA] Error force initializing main model:', error);
    throw error;
  }
}

// Initialize the main model with defaults if it doesn't exist
export async function initializeMainModel() {
  try {
    // Create initial main model instance if it doesn't exist
    // Use set instead of update to create if not exists
    const result = await mainModel.set('main', {
      version: '1.0.0',
      gameState: {},
      lastUpdated: Date.now(),
      settings: {
        sound: true,
        music: true,
        vibration: true,
        difficulty: 'normal'
      },
      flags: {
        tutorialCompleted: false,
        firstTimeUser: true
      }
    });
    
    console.log('[DataStackULTRA] Initialized main model');
    return result;
  } catch (error) {
    console.error('[DataStackULTRA] Error initializing main model:', error);
    throw error;
  }
}

// Get the main model data
export async function getMainData() {
  try {
    return await mainModel.get('main') || await initializeMainModel();
  } catch (error) {
    console.error('[DataStackULTRA] Error getting main data:', error);
    return null;
  }
}

// Update the main model
export async function updateMainData(data) {
  try {
    // Check if main instance exists
    const exists = await mainModel.get('main');
    
    if (!exists) {
      // Create if it doesn't exist
      return await initializeMainModel();
    }
    
    // Update with merged data
    const updated = await mainModel.set('main', {
      ...exists,
      ...data,
      lastUpdated: Date.now()
    });
    
    return updated;
  } catch (error) {
    console.error('[DataStackULTRA] Error updating main data:', error);
    
    // Try to initialize if it failed
    return await initializeMainModel();
  }
}

// Export the main model for direct use
export default mainModel; 