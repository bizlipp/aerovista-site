/**
 * Quest selectors - stub implementation
 * This file provides a fallback for modules that import questSelectors.js
 */

/**
 * Get all active quests that are available to the player
 * @param {Object} state - Redux state
 * @returns {Array} Array of active quests
 */
export function getActiveQuests(state) {
  console.log("Using stub getActiveQuests");
  return state?.quests?.entities 
    ? Object.values(state.quests.entities).filter(quest => quest.status === 'Active')
    : [];
}

/**
 * Get a quest by its ID
 * @param {Object} state - Redux state
 * @param {string} questId - Quest ID
 * @returns {Object|null} Quest object or null if not found
 */
export function getQuestById(state, questId) {
  console.log("Using stub getQuestById");
  return state?.quests?.entities?.[questId] || null;
}

/**
 * Get the player's current active quest
 * @param {Object} state - Redux state
 * @returns {Object|null} Active quest or null if none
 */
export function getCurrentActiveQuest(state) {
  console.log("Using stub getCurrentActiveQuest");
  const activeQuestId = state?.quests?.activeQuestId;
  return activeQuestId ? getQuestById(state, activeQuestId) : null;
}

/**
 * Get the progress of a quest
 * @param {Object} state - Redux state
 * @param {string} questId - Quest ID
 * @returns {number} Progress percentage (0-100)
 */
export function getQuestProgress(state, questId) {
  console.log("Using stub getQuestProgress");
  const quest = getQuestById(state, questId);
  if (!quest) return 0;
  
  // Calculate progress based on quest steps
  const steps = quest.steps || [];
  if (steps.length === 0) return 0;
  
  const completedSteps = steps.filter(step => step.completed).length;
  return Math.round((completedSteps / steps.length) * 100);
}

/**
 * Get all quests that are available for a specific character
 * @param {Object} state - Redux state
 * @param {string} character - Character ID
 * @returns {Array} Array of quests for the character
 */
export function getQuestsByCharacter(state, character) {
  console.log("Using stub getQuestsByCharacter");
  return state?.quests?.entities
    ? Object.values(state.quests.entities).filter(quest => quest.character === character)
    : [];
}

export default {
  getActiveQuests,
  getQuestById,
  getCurrentActiveQuest,
  getQuestProgress,
  getQuestsByCharacter
};
