/**
 * fishing-game-state.js
 * Standalone state management for Billy's Fishing Game
 * Replaces the Redux store functionality with a simplified state manager
 */

// Default initial state structure
const DEFAULT_STATE = {
  isActive: false,
  player: {
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    currency: 250,
    collectedFish: [],
    achievements: {
      firstCatch: false,
      varietyFisher: false,
      masterAngler: false,
      weatherWatcher: false,
      collectionComplete: false
    },
    equipment: {
      rod: {
        name: 'Basic Rod',
        quality: 1,
        reelSpeed: 1,
        catchBonus: 0
      },
      lure: {
        name: 'Basic Lure',
        attractPower: 1,
        rarityBonus: 0
      }
    }
  },
  fishing: {
    isActive: false,
    lastCatch: null,
    catches: [],
    streak: 0,
    availableFish: [],
    sessionStart: null,
    currentSpot: null
  },
  environment: {
    currentWeather: 'sunny',
    currentSeason: 'summer',
    currentTimeOfDay: 'day'
  },
  missions: {
    active: [],
    completed: []
  }
};

// State change listeners
const listeners = [];

// Current game state
let gameState = { ...DEFAULT_STATE };

/**
 * Get the current state or a specific slice
 * @param {string} slice - Optional state slice to return
 * @returns {Object} The requested state
 */
export function getState(slice = null) {
  if (slice) {
    return gameState[slice] || null;
  }
  return gameState;
}

/**
 * Update the state immutably
 * @param {string} slice - State slice to update
 * @param {Object|Function} updater - New state object or update function
 */
export function updateState(slice, updater) {
  // Make sure the slice exists
  if (!gameState[slice]) {
    gameState[slice] = {};
  }

  // Determine new slice state
  const newSliceState = typeof updater === 'function' 
    ? updater(gameState[slice]) 
    : { ...gameState[slice], ...updater };

  // Create new state object
  const prevState = gameState;
  gameState = {
    ...gameState,
    [slice]: newSliceState
  };

  // Notify listeners
  notifyListeners(slice, prevState, gameState);

  // Auto-save state on certain types of updates
  if (['player', 'fishing'].includes(slice)) {
    saveGameState();
  }
}

/**
 * Reset state to default values
 * @param {string} slice - Optional state slice to reset
 */
export function resetState(slice = null) {
  if (slice) {
    updateState(slice, DEFAULT_STATE[slice]);
  } else {
    gameState = { ...DEFAULT_STATE };
    notifyListeners('all', null, gameState);
    saveGameState();
  }
}

/**
 * Add a listener for state changes
 * @param {Function} listener - Callback function when state changes
 * @param {string} sliceFilter - Optional filter for state slice changes
 * @returns {Function} Unsubscribe function
 */
export function subscribe(listener, sliceFilter = null) {
  const listenerObj = { callback: listener, slice: sliceFilter };
  listeners.push(listenerObj);
  
  // Return unsubscribe function
  return () => {
    const index = listeners.indexOf(listenerObj);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  };
}

/**
 * Notify all relevant listeners of state changes
 * @param {string} changedSlice - Slice that changed
 * @param {Object} prevState - Previous state
 * @param {Object} newState - New state
 */
function notifyListeners(changedSlice, prevState, newState) {
  listeners.forEach(listener => {
    // Call listener if it listens to all changes or the specific slice
    if (!listener.slice || listener.slice === changedSlice || listener.slice === 'all') {
      try {
        listener.callback(newState, prevState, changedSlice);
      } catch (error) {
        console.error('Error in state change listener:', error);
      }
    }
  });
}

/**
 * Save game state to localStorage
 */
export function saveGameState() {
  try {
    // Create a save object with timestamp
    const saveData = {
      player: gameState.player,
      fishing: {
        catches: gameState.fishing.catches,
        streak: gameState.fishing.streak
      },
      savedAt: Date.now()
    };
    
    localStorage.setItem('billys-fishing-game', JSON.stringify(saveData));
    console.log('[GameState] Game state saved to localStorage');
    return true;
  } catch (error) {
    console.error('[GameState] Error saving game state:', error);
    return false;
  }
}

/**
 * Load game state from localStorage
 * @returns {boolean} Success status
 */
export function loadGameState() {
  try {
    const savedData = localStorage.getItem('billys-fishing-game');
    
    if (!savedData) {
      console.log('[GameState] No saved game found, using default state');
      return false;
    }
    
    const parsedData = JSON.parse(savedData);
    
    // Validate and update state with saved data
    if (parsedData.player) {
      updateState('player', parsedData.player);
    }
    
    if (parsedData.fishing) {
      updateState('fishing', {
        ...gameState.fishing,
        catches: parsedData.fishing.catches || [],
        streak: parsedData.fishing.streak || 0
      });
    }
    
    console.log('[GameState] Game state loaded from localStorage');
    return true;
  } catch (error) {
    console.error('[GameState] Error loading game state:', error);
    return false;
  }
}

/**
 * Create a mission with objectives
 * @param {string} id - Unique mission ID
 * @param {string} title - Mission title
 * @param {Array} objectives - Array of mission objectives
 */
export function createMission(id, title, objectives) {
  const mission = {
    id,
    title,
    objectives: objectives.map(obj => ({ ...obj, completed: false })),
    progress: 0,
    startedAt: Date.now(),
    completedAt: null
  };
  
  updateState('missions', (missions) => ({
    ...missions,
    active: [...missions.active, mission]
  }));
  
  return mission;
}

/**
 * Update mission objective progress
 * @param {string} missionId - Mission ID
 * @param {number} objectiveIndex - Index of the objective
 * @param {boolean} completed - Whether objective is completed
 */
export function updateMissionObjective(missionId, objectiveIndex, completed) {
  updateState('missions', (missions) => {
    const missionIndex = missions.active.findIndex(m => m.id === missionId);
    if (missionIndex === -1) return missions;
    
    const updatedMissions = [...missions.active];
    const mission = { ...updatedMissions[missionIndex] };
    
    // Update the specific objective
    if (mission.objectives[objectiveIndex]) {
      mission.objectives = [...mission.objectives];
      mission.objectives[objectiveIndex] = {
        ...mission.objectives[objectiveIndex],
        completed
      };
      
      // Calculate new progress
      const completedCount = mission.objectives.filter(o => o.completed).length;
      mission.progress = Math.round((completedCount / mission.objectives.length) * 100);
      
      // Check if mission is completed
      if (mission.progress === 100) {
        mission.completedAt = Date.now();
        
        // Move to completed missions
        return {
          active: updatedMissions.filter(m => m.id !== missionId),
          completed: [...missions.completed, mission]
        };
      }
      
      // Update active mission
      updatedMissions[missionIndex] = mission;
    }
    
    return {
      ...missions,
      active: updatedMissions
    };
  });
}

/**
 * Add fish to caught history
 * @param {Object} fish - The caught fish
 */
export function recordFishCatch(fish) {
  updateState('fishing', (fishing) => {
    const catchWithTimestamp = {
      ...fish,
      timestamp: Date.now()
    };
    
    return {
      ...fishing,
      lastCatch: catchWithTimestamp,
      catches: [...fishing.catches, catchWithTimestamp],
      streak: fishing.streak + 1
    };
  });
  
  // Update player's collected fish (unique species)
  updateState('player', (player) => {
    const collectedFish = [...player.collectedFish];
    if (!collectedFish.includes(fish.name)) {
      collectedFish.push(fish.name);
    }
    
    return {
      ...player,
      collectedFish
    };
  });
}

/**
 * Add experience to player
 * @param {number} amount - XP amount to add
 * @returns {boolean} Whether player leveled up
 */
export function addPlayerXP(amount) {
  let leveledUp = false;
  
  updateState('player', (player) => {
    let newXP = player.xp + amount;
    let newLevel = player.level;
    let newXpToNextLevel = player.xpToNextLevel;
    
    // Check for level up
    while (newXP >= newXpToNextLevel) {
      newXP -= newXpToNextLevel;
      newLevel++;
      newXpToNextLevel = Math.floor(newXpToNextLevel * 1.5);
      leveledUp = true;
    }
    
    return {
      ...player,
      xp: newXP,
      level: newLevel,
      xpToNextLevel: newXpToNextLevel
    };
  });
  
  return leveledUp;
}

/**
 * Add currency to player
 * @param {number} amount - Currency amount to add
 */
export function addPlayerCurrency(amount) {
  updateState('player', (player) => ({
    ...player,
    currency: player.currency + amount
  }));
}

/**
 * Update player achievement
 * @param {string} achievement - Achievement ID
 * @param {boolean} value - Achievement value
 */
export function updateAchievement(achievement, value = true) {
  updateState('player', (player) => ({
    ...player,
    achievements: {
      ...player.achievements,
      [achievement]: value
    }
  }));
}

/**
 * Set environment conditions
 * @param {Object} conditions - Weather, season and/or time of day
 */
export function setEnvironmentConditions(conditions) {
  updateState('environment', conditions);
}

/**
 * Update available fish based on conditions
 * @param {Array} fish - Array of available fish
 */
export function updateAvailableFish(fish) {
  updateState('fishing', (fishing) => ({
    ...fishing,
    availableFish: fish
  }));
}

/**
 * Start fishing session
 * @param {Object} spot - Fishing spot details
 * @param {Object} equipment - Player equipment
 */
export function startFishingSession(spot, equipment) {
  updateState('fishing', (fishing) => ({
    ...fishing,
    isActive: true,
    sessionStart: Date.now(),
    currentSpot: spot || {
      name: "Lakeside",
      depth: "medium",
      fishDensity: 0.8,
      rarityBonus: 0
    }
  }));
}

/**
 * End fishing session
 */
export function endFishingSession() {
  updateState('fishing', (fishing) => ({
    ...fishing,
    isActive: false,
    sessionStart: null,
    currentSpot: null
  }));
}

/**
 * Upgrade player equipment
 * @param {string} type - Equipment type ('rod' or 'lure')
 * @param {Object} equipment - New equipment properties
 */
export function upgradeEquipment(type, equipment) {
  updateState('player', (player) => ({
    ...player,
    equipment: {
      ...player.equipment,
      [type]: {
        ...player.equipment[type],
        ...equipment
      }
    }
  }));
}

// Initialize state
export function initGameState() {
  // Try to load saved state first
  const loaded = loadGameState();
  
  // If no saved state, use defaults
  if (!loaded) {
    gameState = { ...DEFAULT_STATE };
  }
  
  return gameState;
}

// Export a default object with all functions
export default {
  getState,
  updateState,
  resetState,
  subscribe,
  saveGameState,
  loadGameState,
  createMission,
  updateMissionObjective,
  recordFishCatch,
  addPlayerXP,
  addPlayerCurrency,
  updateAchievement,
  setEnvironmentConditions,
  updateAvailableFish,
  startFishingSession,
  endFishingSession,
  upgradeEquipment,
  initGameState
}; 