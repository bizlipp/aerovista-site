/**
 * BuildIntegration.js
 * Provides bike building functionality and integrates with GameBridge for state management
 */

import GameCore from './GameCore.js';
import { showToast } from './popup-toast.js';

/**
 * Save a bike build and award rewards
 * @param {Object} build - Build data
 * @returns {Object|null} Level-up info if player leveled up
 */
export function saveBuild(build) {
  const playerState = GameCore.getPlayerState();
  
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
  const levelUp = GameCore.addXP(totalXP);
  
  // Award extra SurCoins for first build (beginner reward)
  if (playerState.builds.length === 1) {
    GameCore.addCurrency(100);
    showToast({
      message: 'First build bonus: +100 SurCoins!',
      type: 'success'
    });
    
    // Check for related quest completion
    checkBuildQuests(true);
  } else {
    // Check for other build-related quests
    checkBuildQuests(false);
  }
  
  // Save state
  GameCore.save();
  
  // Show toast notification
  showToast({
    message: `🏁 Build "${build.name}" saved! +${totalXP} XP`,
    type: 'success'
  });
  
  return levelUp;
}

/**
 * Check and potentially complete build-related quests
 * @param {boolean} isFirstBuild - Whether this is the player's first build
 */
function checkBuildQuests(isFirstBuild) {
  const state = GameCore.getPlayerState();
  
  // First build quest
  if (isFirstBuild && !GameCore.isMissionCompleted('first_build')) {
    GameCore.completeMission('first_build');
  }
  
  // Charlie's build review quest - unlocked when you have at least one build
  // (This doesn't automatically complete it, just makes it available for selection in the quest board)
  const buildCount = state.builds ? state.builds.length : 0;
  
  // Other build milestones could be rewarded here
  if (buildCount === 5 && !GameCore.isMissionCompleted('build_master')) {
    GameCore.addCurrency(250);
    GameCore.updateRelationship('charlie', 2);
    GameCore.completeMission('build_master');
    showToast({
      message: 'Build Master achievement unlocked! +250 SurCoins',
      type: 'success'
    });
  }
}

/**
 * Check if player can afford parts
 * @param {number} totalPrice - Total price of the build
 * @returns {boolean} Whether player can afford the build
 */
export function canAffordBuild(totalPrice) {
  const playerState = GameCore.getPlayerState();
  return (playerState.currency || 0) >= totalPrice;
}

/**
 * Get player's builds
 * @returns {Array} Player's saved builds
 */
export function getPlayerBuilds() {
  const playerState = GameCore.getPlayerState();
  return playerState.builds || [];
}

/**
 * Get player's build count
 * @returns {number} Number of builds player has
 */
export function getBuildCount() {
  const playerState = GameCore.getPlayerState();
  return playerState.builds ? playerState.builds.length : 0;
}

export function awardBuildRewards(buildId, xp, surCoins, rewardItems = []) {
  GameCore.addXP(xp);
  GameCore.addCurrency(surCoins);

  rewardItems.forEach(item => {
    GameCore.addItem({
      id: item.id,
      name: item.name,
      quantity: item.quantity || 1,
      acquiredAt: Date.now()
    });
  });

  showToast({
    message: `🏁 Build ${buildId} saved! +${xp} XP, +${surCoins} SurCoins`,
    type: 'success'
  });
}

export function handleBuildSave(buildData) {
  // Triggered when a player finishes a build and saves it
  // This logic assumes buildData has metadata attached

  const xpReward = buildData.xp || 50;
  const coinReward = buildData.surCoins || 100;
  const rewards = buildData.items || [];

  awardBuildRewards(buildData.id, xpReward, coinReward, rewards);
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.body.classList.contains('build-page')) {
    const saveBtn = document.querySelector('#saveBuild');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const buildData = {
          id: 'custom_72v_build',
          xp: 80,
          surCoins: 150,
          items: [
            { id: 'battery_pack', name: 'Battery Pack', quantity: 1 },
            { id: 'controller_unit', name: 'Controller', quantity: 1 }
          ]
        };
        handleBuildSave(buildData);
      });
    }
  }
}); 