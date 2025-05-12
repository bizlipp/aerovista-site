/**
 * game-integration.js
 * 
 * Integrates the enhanced game mechanics into the Surron Squad game.
 * This serves as the central integration point for all new features.
 */

import { store } from '../StateStackULTRA/store/gameStore.js';
import GameCore from './GameCore.js';
import enhancedFishing from './enhanced-fishing.js';
import enhancedTuningGame from './tuning-challenges.js';
import weatherSystem from './weather-system.js';
import { showToast } from './popup-toast.js';

/**
 * SurronGameEnhancements - Main integration class for enhanced game mechanics
 */
class SurronGameEnhancements {
  constructor() {
    this.initialized = false;
    this.features = {
      enhancedFishing: false,
      dynamicWeather: false,
      enhancedTuning: false
    };
  }
  
  /**
   * Initialize all enhanced game features
   */
  init() {
    if (this.initialized) return;
    
    console.log('Initializing Surron Squad game enhancements...');
    
    try {
      // Initialize dynamic weather system
      this.initWeatherSystem();
      
      // Initialize enhanced fishing mechanics
      this.initFishingSystem();
      
      // Initialize enhanced tuning mechanics
      this.initTuningSystem();
      
      // Listen for store changes
      this.setupStoreListeners();
      
      // Mark as initialized
      this.initialized = true;
      
      console.log('Surron Squad game enhancements initialized successfully');
      
      // Show notification to user
      if (typeof showToast === 'function') {
        showToast('Game enhancements activated!', 'success');
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize game enhancements:', error);
      
      // Show error to user
      if (typeof showToast === 'function') {
        showToast('Game enhancements failed to initialize. Using fallback systems.', 'error');
      }
      
      return false;
    }
  }
  
  /**
   * Initialize the weather system
   */
  initWeatherSystem() {
    try {
      // Start weather system with dynamic changes
      weatherSystem.start(true, 300000);
      
      // Listen for significant weather changes
      weatherSystem.addEventListener('all', (type, data) => {
        if (type === 'weather' && data.new === 'stormy') {
          showToast('Storm approaching! Fish behavior may change.', 'warning');
        } else if (type === 'season' && data.old !== data.new) {
          showToast(`Season changing to ${data.new}. Different fish species will become available.`, 'info');
        }
      });
      
      this.features.dynamicWeather = true;
      console.log('Weather system initialized');
    } catch (error) {
      console.error('Failed to initialize weather system:', error);
      this.features.dynamicWeather = false;
    }
  }
  
  /**
   * Initialize enhanced fishing features
   */
  initFishingSystem() {
    try {
      // No need to explicitly start as the singleton is already initialized
      // Just mark as available
      this.features.enhancedFishing = true;
      console.log('Enhanced fishing system initialized');
    } catch (error) {
      console.error('Failed to initialize enhanced fishing:', error);
      this.features.enhancedFishing = false;
    }
  }
  
  /**
   * Initialize enhanced tuning features
   */
  initTuningSystem() {
    try {
      // No need to explicitly start as the singleton is already initialized
      // Just mark as available
      this.features.enhancedTuning = true;
      console.log('Enhanced tuning system initialized');
    } catch (error) {
      console.error('Failed to initialize enhanced tuning:', error);
      this.features.enhancedTuning = false;
    }
  }
  
  /**
   * Set up listeners for Redux store changes
   */
  setupStoreListeners() {
    // Subscribe to store changes
    store.subscribe(() => {
      this.handleStoreChanges();
    });
  }
  
  /**
   * Handle Redux store state changes
   */
  handleStoreChanges() {
    const state = store.getState();
    
    // Track previous state for comparison
    if (!this.previousState) {
      this.previousState = state;
      return;
    }
    
    // Check for relevant state changes
    this.checkFishingChanges(state);
    this.checkTuningChanges(state);
    
    // Update previous state
    this.previousState = state;
  }
  
  /**
   * Check for fishing-related state changes
   * @param {Object} state - Current Redux state
   */
  checkFishingChanges(state) {
    if (!this.features.enhancedFishing) return;
    
    const prevFishing = this.previousState?.fishing;
    const currFishing = state?.fishing;
    
    // Check for active session changes
    if (prevFishing?.isActive !== currFishing?.isActive) {
      if (currFishing?.isActive) {
        // Session started
        console.log('Fishing session started');
      } else if (prevFishing?.isActive) {
        // Session ended
        console.log('Fishing session ended');
      }
    }
  }
  
  /**
   * Check for tuning-related state changes
   * @param {Object} state - Current Redux state
   */
  checkTuningChanges(state) {
    if (!this.features.enhancedTuning) return;
    
    const prevBuilds = this.previousState?.tuning?.builds || [];
    const currBuilds = state?.tuning?.builds || [];
    
    // Check for new builds
    if (currBuilds.length > prevBuilds.length) {
      console.log('New bike build saved');
    }
  }
  
  /**
   * Get the status of all enhanced features
   * @returns {Object} Feature status object
   */
  getFeatureStatus() {
    return {
      ...this.features,
      initialized: this.initialized
    };
  }
  
  /**
   * Start a fishing session with the enhanced system
   * @param {Object} spot - Optional fishing spot info
   * @param {Object} equipment - Optional equipment info
   * @returns {Object} Session data or null if not available
   */
  startFishingSession(spot = null, equipment = null) {
    if (!this.features.enhancedFishing) {
      console.warn('Enhanced fishing not available, using fallback system');
      return null;
    }
    
    return enhancedFishing.startFishing(spot, equipment);
  }
  
  /**
   * End the current fishing session
   * @returns {Object} Session summary or null if not available
   */
  endFishingSession() {
    if (!this.features.enhancedFishing) {
      console.warn('Enhanced fishing not available, using fallback system');
      return null;
    }
    
    return enhancedFishing.endFishing();
  }
  
  /**
   * Start a tuning session with the enhanced system
   * @param {string} profile - Tuning profile name
   * @param {Object} existingBuild - Optional existing build
   * @returns {Object} Session data or null if not available
   */
  startTuningSession(profile = 'balanced', existingBuild = null) {
    if (!this.features.enhancedTuning) {
      console.warn('Enhanced tuning not available, using fallback system');
      return null;
    }
    
    return enhancedTuningGame.startTuning(profile, existingBuild);
  }
  
  /**
   * Evaluate a bike build with the enhanced system
   * @returns {Object} Evaluation result or null if not available
   */
  evaluateBuild() {
    if (!this.features.enhancedTuning) {
      console.warn('Enhanced tuning not available, using fallback system');
      return null;
    }
    
    return enhancedTuningGame.evaluateBuild();
  }
  
  /**
   * Get current weather conditions
   * @returns {Object} Weather conditions or null if not available
   */
  getCurrentWeather() {
    if (!this.features.dynamicWeather) {
      console.warn('Dynamic weather not available, using default conditions');
      return null;
    }
    
    return weatherSystem.getCurrentConditions();
  }
}

// Create and export singleton instance
const gameEnhancements = new SurronGameEnhancements();

export default gameEnhancements;

/**
 * Initialize game enhancements when module is imported
 * This allows automatic initialization when the module is loaded
 */
setTimeout(() => {
  console.log('Initializing game enhancements...');
  gameEnhancements.init();
}, 500); // Small delay to ensure other systems are loaded first 