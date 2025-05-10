/**
 * BuildIntegration.js
 * Provides bike building functionality and integrates with GameBridge for state management
 */

import gameBridge from './GameBridge.js';

/**
 * Save a bike build and award rewards
 * @param {Object} build - Build data
 * @returns {Object|null} Level-up info if player leveled up
 */
export function saveBuild(build) {
  const playerState = gameBridge.getPlayerState();
  
  // Initialize builds array if it doesn't exist
  if (!playerState.builds) {
    playerState.builds = [];
  }
  
  // Add build to collection
  playerState.builds.push(build);
  
  // Calculate XP award based on build complexity
  // More parts or more expensive builds grant more XP
  const baseXP = 50;
  const partBonus = build.parts ? build.parts.length * 5 : 0;
  const expenseBonus = Math.floor((build.totalPrice || 0) / 100);
  const totalXP = baseXP + partBonus + expenseBonus;
  
  // Award XP
  const levelUp = gameBridge.addXP(totalXP);
  
  // Award extra SurCoins for first build (beginner reward)
  if (playerState.builds.length === 1) {
    gameBridge.addCurrency(100);
    gameBridge.showToast('First build bonus: +100 SurCoins!', 'success');
    
    // Check for related quest completion
    checkBuildQuests(true);
  } else {
    // Check for other build-related quests
    checkBuildQuests(false);
  }
  
  // Save state
  gameBridge.save();
  
  // Show toast notification
  gameBridge.showToast(`Build "${build.name}" saved! +${totalXP} XP`, 'success');
  
  return levelUp;
}

/**
 * Check and potentially complete build-related quests
 * @param {boolean} isFirstBuild - Whether this is the player's first build
 */
function checkBuildQuests(isFirstBuild) {
  const state = gameBridge.getPlayerState();
  
  // First build quest
  if (isFirstBuild && !gameBridge.isMissionCompleted('first_build')) {
    gameBridge.completeMission('first_build');
  }
  
  // Charlie's build review quest - unlocked when you have at least one build
  // (This doesn't automatically complete it, just makes it available for selection in the quest board)
  const buildCount = state.builds ? state.builds.length : 0;
  
  // Other build milestones could be rewarded here
  if (buildCount === 5 && !gameBridge.isMissionCompleted('build_master')) {
    gameBridge.addCurrency(250);
    gameBridge.updateRelationship('charlie', 2);
    gameBridge.completeMission('build_master');
    gameBridge.showToast('Build Master achievement unlocked! +250 SurCoins', 'success');
  }
}

/**
 * Check if player can afford parts
 * @param {number} totalPrice - Total price of the build
 * @returns {boolean} Whether player can afford the build
 */
export function canAffordBuild(totalPrice) {
  const playerState = gameBridge.getPlayerState();
  return (playerState.currency || 0) >= totalPrice;
}

/**
 * Get player's builds
 * @returns {Array} Player's saved builds
 */
export function getPlayerBuilds() {
  const playerState = gameBridge.getPlayerState();
  return playerState.builds || [];
}

/**
 * Get player's build count
 * @returns {number} Number of builds player has
 */
export function getBuildCount() {
  const playerState = gameBridge.getPlayerState();
  return playerState.builds ? playerState.builds.length : 0;
} 