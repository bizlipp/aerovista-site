/**
 * AdventureIntegration.js
 * Provides adventure functionality and integrates with GameCore for state management
 */

import GameCore from './GameCore.js';

/**
 * Award rewards for completing a scene or adventure
 * @param {Object} rewards - Reward object with xp, currency, relationship, etc.
 * @returns {Object|null} Level-up info if player leveled up
 */
export function awardRewards(rewards) {
  let levelUp = null;
  
  // Award XP
  if (rewards.xp) {
    // Add XP through GameCore and check for level up
    const oldLevel = GameCore.getPlayerState().level;
    GameCore.addXP(rewards.xp);
    const newLevel = GameCore.getPlayerState().level;
    
    // Check if player leveled up
    if (newLevel > oldLevel) {
      levelUp = {
        newLevel,
        rewards: {
          currency: newLevel * 100,
          items: [{name: 'Mystery Box'}],
          unlockedFeatures: newLevel % 2 === 0 ? ['new_adventure_chapter'] : []
        }
      };
    }
  }
  
  // Award currency
  if (rewards.currency) {
    GameCore.addCurrency(rewards.currency);
  }
  
  // Award relationship points
  if (rewards.character && rewards.relationship) {
    GameCore.updateRelationship(rewards.character, rewards.relationship);
  }
  
  // Award items
  if (rewards.item) {
    const itemObj = createItemObject(rewards.item);
    GameCore.addItem(itemObj);
  }
  
  // Award multiple items
  if (rewards.items && Array.isArray(rewards.items)) {
    rewards.items.forEach(item => {
      const itemObj = createItemObject(item);
      GameCore.addItem(itemObj);
    });
  }
  
  // Complete quest
  if (rewards.quest_complete) {
    GameCore.store.dispatch({
      type: 'player/completeMission',
      payload: rewards.quest_complete
    });
  }
  
  // Save state
  GameCore.save();
  
  // Show reward toast
  showRewardToast(rewards);
  
  return levelUp;
}

/**
 * Create a proper item object from an item ID
 * @param {string} itemId - The ID of the item
 * @returns {Object} A complete item object
 */
function createItemObject(itemId) {
  // Simple item mapping with defaults
  const itemTemplates = {
    basic_controller: {
      name: 'Basic Controller',
      type: 'electronic',
      value: 100
    },
    premium_controller: {
      name: 'Premium Controller',
      type: 'electronic',
      value: 250
    },
    high_discharge_battery: {
      name: 'High-Discharge Battery',
      type: 'power',
      value: 350
    },
    motor_part: {
      name: 'Sur-Ron Motor Component',
      type: 'mechanical',
      value: 150
    },
    // Add more item templates here
  };
  
  // If the item is already an object, return it
  if (typeof itemId === 'object') {
    return {
      id: `${itemId.id || 'item'}_${Date.now()}`,
      ...itemId
    };
  }
  
  // Return either a template or a generic item
  return {
    id: `${itemId}_${Date.now()}`,
    name: itemTemplates[itemId]?.name || `${itemId.replace(/_/g, ' ')}`,
    type: itemTemplates[itemId]?.type || 'part',
    value: itemTemplates[itemId]?.value || 50,
    quantity: 1
  };
}

/**
 * Show a toast notification for rewards
 * @param {Object} rewards - Reward object
 */
function showRewardToast(rewards) {
  let message = 'Rewards:';
  
  if (rewards.xp) {
    message += ` +${rewards.xp} XP`;
  }
  
  if (rewards.currency) {
    message += ` +${rewards.currency} SurCoins`;
  }
  
  if (rewards.character && rewards.relationship) {
    const charName = getCharacterName(rewards.character);
    message += ` +${rewards.relationship} ${charName} relationship`;
  }
  
  // If a toast system exists, use it
  if (window.toast) {
    window.toast.show(message, 'success');
  } else {
    console.log('[AdventureIntegration]', message);
  }
}

/**
 * Complete a scene in the adventure
 * @param {string} sceneId - ID of the scene to complete
 */
export function completeScene(sceneId) {
  // Check if scene is already completed
  if (!isSceneCompleted(sceneId)) {
    GameCore.store.dispatch({
      type: 'player/completeScene',
      payload: sceneId
    });
    GameCore.save();
  }
}

/**
 * Check if a scene is completed
 * @param {string} sceneId - ID of the scene to check
 * @returns {boolean} Whether the scene is completed
 */
export function isSceneCompleted(sceneId) {
  const state = GameCore.getPlayerState();
  
  if (!state.adventureProgress || !state.adventureProgress.completedScenes) {
    return false;
  }
  
  return state.adventureProgress.completedScenes.includes(sceneId);
}

/**
 * Set the current scene in the adventure
 * @param {string} sceneId - ID of the scene
 */
export function setCurrentScene(sceneId) {
  GameCore.store.dispatch({
    type: 'player/setCurrentScene',
    payload: sceneId
  });
  GameCore.save();
}

/**
 * Get the current scene from the store
 * @returns {string} The current scene ID
 */
export function getCurrentScene() {
  const state = GameCore.getPlayerState();
  return state?.adventureProgress?.currentScene || 'intro';
}

/**
 * Initialize adventure progress if not already present
 */
export function initializeAdventureProgress() {
  const state = GameCore.getPlayerState();
  
  if (!state.adventureProgress) {
    GameCore.store.dispatch({
      type: 'player/initAdventureProgress',
      payload: {
        currentChapter: 1,
        completedScenes: [],
        currentScene: 'intro'
      }
    });
    GameCore.save();
  }
}

/**
 * Get a character's display name
 * @param {string} character - Character ID
 * @returns {string} Character display name
 */
function getCharacterName(character) {
  switch(character) {
    case 'charlie': return 'Charlie';
    case 'billy': return 'Billy';
    case 'tbd': return 'TBD';
    default: return character;
  }
}

export default {
  awardRewards,
  completeScene,
  isSceneCompleted,
  setCurrentScene,
  getCurrentScene,
  initializeAdventureProgress
}; 