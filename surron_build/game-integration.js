/**
 * game-integration.js
 * 
 * Integrates the enhanced game mechanics into the Surron Squad game.
 * This serves as the central integration point for all new features.
 */

import { store } from './StateStackULTRA/store/gameStore.js';
import GameCore from './game/GameCore.js';
import enhancedFishing from './game/enhanced-fishing.js';
import enhancedTuningGame from './game/tuning-challenges.js';
import weatherSystem from './game/weather-system.js';
import { showToast } from './game/popup-toast.js';

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
    
    // Player progression tracking
    this.playerProgression = {
      fishingLevel: 1,
      tuningLevel: 1,
      adventureProgress: 0,
      totalPlayTime: 0,
      startTime: null,
      sessionCount: 0,
      lastSession: null
    };
  }
  
  /**
   * Initialize all enhanced game features
   */
  init() {
    if (this.initialized) return;
    
    console.log('Initializing Surron Squad game enhancements...');
    
    try {
      // Load saved progression data
      this.loadProgressionData();
      
      // Start session timer
      this.startTimeTracking();
      
      // Initialize dynamic weather system
      this.initWeatherSystem();
      
      // Initialize enhanced fishing mechanics
      this.initFishingSystem();
      
      // Initialize enhanced tuning mechanics
      this.initTuningSystem();
      
      // Listen for store changes
      this.setupStoreListeners();
      
      // Set up daily challenges
      this.setupDailyChallenges();
      
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
   * Start tracking play time
   */
  startTimeTracking() {
    this.playerProgression.startTime = Date.now();
    this.playerProgression.sessionCount++;
    
    // Set up an interval to save time data every minute
    this.timeTrackingInterval = setInterval(() => {
      this.updatePlayTime();
    }, 60000); // 1 minute
    
    // Also save when window is closed
    window.addEventListener('beforeunload', () => {
      this.updatePlayTime();
      this.saveProgressionData();
    });
  }
  
  /**
   * Update total play time
   */
  updatePlayTime() {
    if (!this.playerProgression.startTime) return;
    
    const currentTime = Date.now();
    const sessionDuration = (currentTime - this.playerProgression.startTime) / 1000; // in seconds
    
    this.playerProgression.totalPlayTime += sessionDuration;
    this.playerProgression.startTime = currentTime;
    this.playerProgression.lastSession = new Date().toISOString();
    
    this.saveProgressionData();
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
   * Set up daily challenges
   */
  setupDailyChallenges() {
    try {
      // Check if we should generate new challenges
      const lastChallengeDate = localStorage.getItem('lastDailyChallengeDate');
      const today = new Date().toDateString();
      
      if (lastChallengeDate !== today) {
        // Generate new challenges
        const challenges = this.generateDailyChallenges();
        
        // Save challenges
        localStorage.setItem('dailyChallenges', JSON.stringify(challenges));
        localStorage.setItem('lastDailyChallengeDate', today);
        
        // Dispatch event for new challenges
        const event = new CustomEvent('dailyChallengesUpdated', { detail: challenges });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Failed to setup daily challenges:', error);
    }
  }
  
  /**
   * Generate daily challenges
   */
  generateDailyChallenges() {
    // Generate 3 random challenges
    const fishingChallenges = [
      'Catch 5 fish in one session',
      'Catch a rare fish (rarity 3+)',
      'Fish during a storm',
      'Catch 3 different species'
    ];
    
    const tuningChallenges = [
      'Complete a tuning challenge with 90%+ score',
      'Try 3 different tuning profiles',
      'Upgrade a bike component'
    ];
    
    const generalChallenges = [
      'Earn 100 SurCoins',
      'Play for 10 minutes'
    ];
    
    // Randomly select one from each category
    const selectedFishing = fishingChallenges[Math.floor(Math.random() * fishingChallenges.length)];
    const selectedTuning = tuningChallenges[Math.floor(Math.random() * tuningChallenges.length)];
    const selectedGeneral = generalChallenges[Math.floor(Math.random() * generalChallenges.length)];
    
    return [
      { id: 'fishing_daily', type: 'fishing', description: selectedFishing, completed: false, reward: 50 },
      { id: 'tuning_daily', type: 'tuning', description: selectedTuning, completed: false, reward: 50 },
      { id: 'general_daily', type: 'general', description: selectedGeneral, completed: false, reward: 25 }
    ];
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
    this.checkQuestChanges(state);
    
    // Update progression data based on changes
    this.updateProgressionFromState(state);
    
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
        this.trackGameActivity('fishing', 'session_start');
      } else if (prevFishing?.isActive) {
        // Session ended
        console.log('Fishing session ended');
        this.trackGameActivity('fishing', 'session_end');
        
        // Check for any completed challenges
        this.checkDailyChallengeCompletion('fishing');
      }
    }
    
    // Check for new catches
    const prevCatches = prevFishing?.catches || [];
    const currCatches = currFishing?.catches || [];
    
    if (currCatches.length > prevCatches.length) {
      // New fish caught
      const newCatch = currCatches[currCatches.length - 1];
      
      // Track fishing activity
      this.trackGameActivity('fishing', 'fish_caught', {
        fishName: newCatch.fish.name,
        rarity: newCatch.fish.rarity,
        value: newCatch.fish.value
      });
      
      // Update fishing level if needed
      this.updateFishingLevel(currCatches.length);
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
      
      // Track tuning activity
      this.trackGameActivity('tuning', 'build_saved', {
        buildCount: currBuilds.length
      });
      
      // Update tuning level if needed
      this.updateTuningLevel(currBuilds.length);
      
      // Check for any completed challenges
      this.checkDailyChallengeCompletion('tuning');
    }
  }
  
  /**
   * Check for quest-related state changes
   * @param {Object} state - Current Redux state
   */
  checkQuestChanges(state) {
    const prevQuests = this.previousState?.quests?.completed || [];
    const currQuests = state?.quests?.completed || [];
    
    // Check for newly completed quests
    if (currQuests.length > prevQuests.length) {
      const newQuests = currQuests.filter(quest => !prevQuests.includes(quest));
      
      newQuests.forEach(quest => {
        console.log(`Quest completed: ${quest}`);
        
        // Track quest completion
        this.trackGameActivity('quest', 'completed', {
          questId: quest
        });
      });
    }
  }
  
  /**
   * Update player progression from state
   * @param {Object} state - Current Redux state
   */
  updateProgressionFromState(state) {
    // Update adventure progress if available
    if (state?.adventure?.progress !== undefined) {
      this.playerProgression.adventureProgress = state.adventure.progress;
    }
    
    // Save updated progression
    this.saveProgressionData();
  }
  
  /**
   * Update fishing level based on catches
   * @param {number} catchCount - Total number of catches
   */
  updateFishingLevel(catchCount) {
    // Simple level calculation: level = 1 + Math.floor(catchCount / 5)
    // This means level 2 at 5 catches, level 3 at 10 catches, etc.
    const newLevel = 1 + Math.floor(catchCount / 5);
    
    if (newLevel > this.playerProgression.fishingLevel) {
      this.playerProgression.fishingLevel = newLevel;
      this.saveProgressionData();
      
      // Notify the player
      showToast(`Fishing level increased to ${newLevel}!`, 'success');
      
      // Dispatch event for level up
      const event = new CustomEvent('fishingLevelUp', { detail: { level: newLevel } });
      window.dispatchEvent(event);
    }
  }
  
  /**
   * Update tuning level based on saved builds
   * @param {number} buildCount - Total number of saved builds
   */
  updateTuningLevel(buildCount) {
    // Simple level calculation: level = 1 + Math.floor(buildCount / 3)
    // This means level 2 at 3 builds, level 3 at 6 builds, etc.
    const newLevel = 1 + Math.floor(buildCount / 3);
    
    if (newLevel > this.playerProgression.tuningLevel) {
      this.playerProgression.tuningLevel = newLevel;
      this.saveProgressionData();
      
      // Notify the player
      showToast(`Tuning level increased to ${newLevel}!`, 'success');
      
      // Dispatch event for level up
      const event = new CustomEvent('tuningLevelUp', { detail: { level: newLevel } });
      window.dispatchEvent(event);
    }
  }
  
  /**
   * Track game activity for analytics and progression
   * @param {string} category - Activity category (fishing, tuning, quest, etc.)
   * @param {string} action - Activity action (caught, completed, etc.)
   * @param {Object} data - Additional activity data
   */
  trackGameActivity(category, action, data = {}) {
    try {
      const activity = {
        category,
        action,
        data,
        timestamp: Date.now()
      };
      
      // Store activity in recent activities
      const recentActivities = JSON.parse(localStorage.getItem('recentActivities') || '[]');
      recentActivities.unshift(activity);
      
      // Keep only last 50 activities
      if (recentActivities.length > 50) {
        recentActivities.length = 50;
      }
      
      localStorage.setItem('recentActivities', JSON.stringify(recentActivities));
      
      // Check daily challenges for completion
      this.checkActivityForChallenges(activity);
      
    } catch (error) {
      console.error('Failed to track activity:', error);
    }
  }
  
  /**
   * Check if an activity completes any daily challenges
   * @param {Object} activity - The activity to check
   */
  checkActivityForChallenges(activity) {
    try {
      const challenges = JSON.parse(localStorage.getItem('dailyChallenges') || '[]');
      let updated = false;
      
      challenges.forEach(challenge => {
        if (challenge.completed) return;
        
        // Check if this activity satisfies the challenge
        if (this.activitySatisfiesChallenge(activity, challenge)) {
          challenge.completed = true;
          updated = true;
          
          // Award the reward
          GameCore.addCurrency(challenge.reward);
          
          // Notify the player
          showToast(`Daily Challenge Completed: ${challenge.description}. Reward: ${challenge.reward} SurCoins`, 'success');
        }
      });
      
      if (updated) {
        localStorage.setItem('dailyChallenges', JSON.stringify(challenges));
        
        // Dispatch event for challenge completion
        const event = new CustomEvent('dailyChallengeCompleted', { detail: challenges });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Failed to check challenges:', error);
    }
  }
  
  /**
   * Check if a specific activity satisfies a challenge
   * @param {Object} activity - The activity to check
   * @param {Object} challenge - The challenge to check against
   * @returns {boolean} True if the activity satisfies the challenge
   */
  activitySatisfiesChallenge(activity, challenge) {
    // Match based on activity category and challenge type
    if (activity.category !== challenge.type && challenge.type !== 'general') {
      return false;
    }
    
    // Check specific challenges
    if (challenge.description === 'Catch 5 fish in one session' && 
        activity.category === 'fishing' && 
        activity.action === 'session_end') {
      // Get catch count for the session
      const recentActivities = JSON.parse(localStorage.getItem('recentActivities') || '[]');
      const sessionStart = recentActivities.find(a => a.category === 'fishing' && a.action === 'session_start');
      
      if (sessionStart) {
        const sessionCatches = recentActivities.filter(a => 
          a.category === 'fishing' && 
          a.action === 'fish_caught' && 
          a.timestamp > sessionStart.timestamp
        );
        
        return sessionCatches.length >= 5;
      }
    }
    
    // More challenge checks can be added here
    
    return false;
  }
  
  /**
   * Check if daily challenges have been completed for a specific type
   * @param {string} type - The type of challenges to check
   */
  checkDailyChallengeCompletion(type) {
    try {
      const challenges = JSON.parse(localStorage.getItem('dailyChallenges') || '[]');
      const recentActivities = JSON.parse(localStorage.getItem('recentActivities') || '[]');
      let updated = false;
      
      challenges.forEach(challenge => {
        if (challenge.completed || challenge.type !== type) return;
        
        // Check challenge completion based on recent activities
        switch (challenge.description) {
          case 'Catch 5 fish in one session': {
            // Find most recent fishing session
            const sessionEnd = recentActivities.find(a => a.category === 'fishing' && a.action === 'session_end');
            const sessionStart = recentActivities.find(a => a.category === 'fishing' && a.action === 'session_start');
            
            if (sessionStart && sessionEnd) {
              const sessionCatches = recentActivities.filter(a => 
                a.category === 'fishing' && 
                a.action === 'fish_caught' && 
                a.timestamp > sessionStart.timestamp &&
                a.timestamp < sessionEnd.timestamp
              );
              
              if (sessionCatches.length >= 5) {
                challenge.completed = true;
                updated = true;
              }
            }
            break;
          }
          
          case 'Catch a rare fish (rarity 3+)': {
            const rareCatch = recentActivities.find(a => 
              a.category === 'fishing' && 
              a.action === 'fish_caught' && 
              a.data?.rarity >= 3
            );
            
            if (rareCatch) {
              challenge.completed = true;
              updated = true;
            }
            break;
          }
          
          case 'Fish during a storm': {
            const currentWeather = weatherSystem.currentWeather;
            const fished = recentActivities.some(a => a.category === 'fishing' && a.action === 'fish_caught');
            
            if (currentWeather === 'stormy' && fished) {
              challenge.completed = true;
              updated = true;
            }
            break;
          }
          
          // More challenges can be checked here
        }
      });
      
      if (updated) {
        localStorage.setItem('dailyChallenges', JSON.stringify(challenges));
        
        // Award rewards for completed challenges
        challenges.filter(c => c.completed).forEach(challenge => {
          GameCore.addCurrency(challenge.reward);
          showToast(`Daily Challenge Completed: ${challenge.description}. Reward: ${challenge.reward} SurCoins`, 'success');
        });
        
        // Dispatch event for challenge completion
        const event = new CustomEvent('dailyChallengeCompleted', { detail: challenges });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Failed to check challenge completion:', error);
    }
  }
  
  /**
   * Load saved progression data
   */
  loadProgressionData() {
    try {
      const savedData = localStorage.getItem('playerProgression');
      if (savedData) {
        this.playerProgression = JSON.parse(savedData);
      }
    } catch (error) {
      console.error('Failed to load progression data:', error);
    }
  }
  
  /**
   * Save progression data
   */
  saveProgressionData() {
    try {
      localStorage.setItem('playerProgression', JSON.stringify(this.playerProgression));
    } catch (error) {
      console.error('Failed to save progression data:', error);
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
   * Get player progression data
   * @returns {Object} Player progression
   */
  getPlayerProgression() {
    return { ...this.playerProgression };
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
  
  /**
   * Get current daily challenges
   * @returns {Array} Daily challenges
   */
  getDailyChallenges() {
    try {
      return JSON.parse(localStorage.getItem('dailyChallenges') || '[]');
    } catch (error) {
      console.error('Failed to get daily challenges:', error);
      return [];
    }
  }
  
  /**
   * Get recent game activities
   * @param {number} limit - Maximum number of activities to return
   * @returns {Array} Recent activities
   */
  getRecentActivities(limit = 10) {
    try {
      const activities = JSON.parse(localStorage.getItem('recentActivities') || '[]');
      return activities.slice(0, limit);
    } catch (error) {
      console.error('Failed to get recent activities:', error);
      return [];
    }
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