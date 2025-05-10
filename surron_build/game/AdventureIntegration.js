/**
 * AdventureIntegration.js
 * Provides adventure functionality and integrates with GameBridge for state management
 */

import gameBridge from './GameBridge.js';

/**
 * Award rewards for completing a scene or adventure
 * @param {Object} rewards - Reward object with xp, currency, relationship, etc.
 * @returns {Object|null} Level-up info if player leveled up
 */
export function awardRewards(rewards) {
  let levelUp = null;
  
  // Award XP
  if (rewards.xp) {
    levelUp = gameBridge.addXP(rewards.xp);
  }
  
  // Award currency
  if (rewards.currency) {
    gameBridge.addCurrency(rewards.currency);
  }
  
  // Award relationship points
  if (rewards.character && rewards.relationship) {
    gameBridge.updateRelationship(rewards.character, rewards.relationship);
  }
  
  // Award items
  if (rewards.item) {
    gameBridge.addItem(rewards.item);
  }
  
  // Award multiple items
  if (rewards.items && Array.isArray(rewards.items)) {
    rewards.items.forEach(item => gameBridge.addItem(item));
  }
  
  // Complete quest
  if (rewards.quest_complete) {
    gameBridge.completeMission(rewards.quest_complete);
  }
  
  // Save state
  gameBridge.save();
  
  // Show reward toast
  showRewardToast(rewards);
  
  return levelUp;
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
  
  gameBridge.showToast(message, 'success');
}

/**
 * Complete a scene in the adventure
 * @param {string} sceneId - ID of the scene to complete
 */
export function completeScene(sceneId) {
  const state = gameBridge.getPlayerState();
  
  // Make sure we have the adventure progress object
  if (!state.adventureProgress) {
    state.adventureProgress = {
      currentScene: null,
      completedScenes: []
    };
  }
  
  // Mark scene as completed if not already
  if (!state.adventureProgress.completedScenes.includes(sceneId)) {
    state.adventureProgress.completedScenes.push(sceneId);
    gameBridge.save();
  }
}

/**
 * Check if a scene is completed
 * @param {string} sceneId - ID of the scene to check
 * @returns {boolean} Whether the scene is completed
 */
export function isSceneCompleted(sceneId) {
  const state = gameBridge.getPlayerState();
  
  if (!state.adventureProgress || !state.adventureProgress.completedScenes) {
    return false;
  }
  
  return state.adventureProgress.completedScenes.includes(sceneId);
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