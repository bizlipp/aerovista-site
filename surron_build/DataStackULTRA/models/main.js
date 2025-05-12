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

// Initialize the main model with defaults if it doesn't exist
export async function initializeMainModel() {
  try {
    // Check if main model exists
    const existing = await mainModel.get('main');
    
    if (!existing) {
      // Create initial main model instance
      await mainModel.create('main', {
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
    }
    
    return true;
  } catch (error) {
    console.error('[DataStackULTRA] Error initializing main model:', error);
    return false;
  }
}

// Get the main model data
export async function getMainData() {
  try {
    await initializeMainModel();
    return await mainModel.get('main');
  } catch (error) {
    console.error('[DataStackULTRA] Error getting main data:', error);
    return null;
  }
}

// Update the main model
export async function updateMainData(data) {
  try {
    await initializeMainModel();
    
    // Update with merged data
    const updated = await mainModel.update('main', {
      ...data,
      lastUpdated: Date.now()
    });
    
    return updated;
  } catch (error) {
    console.error('[DataStackULTRA] Error updating main data:', error);
    
    // Try to initialize and create if it failed because it doesn't exist
    if (error.message.includes('not found')) {
      await initializeMainModel();
      return await mainModel.get('main');
    }
    
    return null;
  }
}

// Export the main model for direct use
export default mainModel; 