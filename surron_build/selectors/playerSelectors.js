/**
 * Player selectors - stub implementation
 * This file provides a fallback for modules that import playerSelectors.js
 */

/**
 * Get player's current level
 * @param {Object} state - Redux state
 * @returns {number} Player level
 */
export function getPlayerLevel(state) {
  console.log("Using stub getPlayerLevel");
  return state?.player?.level || 1;
}

/**
 * Get player's current XP
 * @param {Object} state - Redux state
 * @returns {number} Player XP
 */
export function getPlayerXP(state) {
  console.log("Using stub getPlayerXP");
  return state?.player?.xp || 0;
}

/**
 * Get player's currency (SurCoins)
 * @param {Object} state - Redux state
 * @returns {number} Player currency
 */
export function getPlayerCurrency(state) {
  console.log("Using stub getPlayerCurrency");
  return state?.player?.currency || 0;
}

/**
 * Get player's reputation
 * @param {Object} state - Redux state
 * @returns {number} Player reputation
 */
export function getPlayerReputation(state) {
  console.log("Using stub getPlayerReputation");
  return state?.player?.reputation || 0;
}

/**
 * Get player's inventory
 * @param {Object} state - Redux state
 * @returns {Array} Player inventory
 */
export function getPlayerInventory(state) {
  console.log("Using stub getPlayerInventory");
  return state?.player?.inventory || [];
}

/**
 * Get total number of parts collected
 * @param {Object} state - Redux state
 * @returns {number} Total parts count
 */
export function getTotalParts(state) {
  console.log("Using stub getTotalParts");
  const inventory = getPlayerInventory(state);
  return inventory.filter(item => item.type === 'part').length;
}

/**
 * Get all player stats in a single object
 * @param {Object} state - Redux state
 * @returns {Object} Player stats
 */
export function getPlayerStats(state) {
  console.log("Using stub getPlayerStats");
  return {
    level: getPlayerLevel(state),
    xp: getPlayerXP(state),
    currency: getPlayerCurrency(state),
    reputation: getPlayerReputation(state),
    inventorySize: getPlayerInventory(state).length,
    partsCount: getTotalParts(state)
  };
}

export default {
  getPlayerLevel,
  getPlayerXP,
  getPlayerCurrency,
  getPlayerReputation,
  getPlayerInventory,
  getTotalParts,
  getPlayerStats
};
