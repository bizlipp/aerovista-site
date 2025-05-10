// FishingUI.js - Store-driven fishing UI renderer
import { store } from './StateStackULTRA/store/gameStore.js';
import * as fishingSelectors from './StateStackULTRA/slices/fishingSelectors.js';

/**
 * Renders the current fishing state UI
 * @param {HTMLElement} container - DOM element to render the fishing UI into
 */
export function renderFishingUI(container) {
  if (!container) return;
  
  const state = store.getState();
  
  // Get fishing data from selectors
  const currentRod = fishingSelectors.getCurrentRod(state);
  const currentLure = fishingSelectors.getCurrentLure(state);
  const currentStreak = fishingSelectors.getCurrentStreak(state);
  const lastCatch = fishingSelectors.getLastCatch(state);
  const catchHistory = fishingSelectors.getCatchHistory(state);
  const isActive = fishingSelectors.isFishingActive(state);
  
  // Clear container first
  container.innerHTML = '';
  
  // Create fishing gear display
  const gearElement = createGearDisplay(currentRod, currentLure);
  container.appendChild(gearElement);
  
  // Create streak meter
  const streakElement = createStreakMeter(currentStreak);
  container.appendChild(streakElement);
  
  // Create last catch display
  if (lastCatch) {
    const lastCatchElement = createLastCatchDisplay(lastCatch);
    container.appendChild(lastCatchElement);
  }
  
  // Create bonus display
  const bonusElement = createBonusDisplay(currentRod, currentLure);
  container.appendChild(bonusElement);
  
  // Create catch history
  if (catchHistory && catchHistory.length > 0) {
    const historyElement = createCatchHistory(catchHistory);
    container.appendChild(historyElement);
  }
}

/**
 * Creates the fishing gear display element
 * @param {Object} rod - Current fishing rod data
 * @param {Object} lure - Current fishing lure data
 * @returns {HTMLElement} The gear display element
 */
function createGearDisplay(rod, lure) {
  const gearElement = document.createElement('div');
  gearElement.className = 'fishing-gear';
  
  gearElement.innerHTML = `
    <h3>Your Fishing Gear</h3>
    <div class="gear-items">
      <div class="gear-item rod">
        <div class="gear-icon">🎣</div>
        <div class="gear-details">
          <h4>${rod?.name || 'Basic Rod'}</h4>
          <div class="gear-stats">
            <div class="stat-item">
              <span class="stat-label">Quality:</span>
              <span class="stat-value">${rod?.quality || 1}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Reel Speed:</span>
              <span class="stat-value">${rod?.reelSpeed || 1}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Catch Bonus:</span>
              <span class="stat-value">${rod?.catchBonus || 0}%</span>
            </div>
          </div>
        </div>
      </div>
      <div class="gear-item lure">
        <div class="gear-icon">🪝</div>
        <div class="gear-details">
          <h4>${lure?.name || 'Basic Lure'}</h4>
          <div class="gear-stats">
            <div class="stat-item">
              <span class="stat-label">Attract Power:</span>
              <span class="stat-value">${lure?.attractPower || 1}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Rarity Bonus:</span>
              <span class="stat-value">+${(lure?.rarityBonus || 0) * 100}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  return gearElement;
}

/**
 * Creates the streak meter display element
 * @param {number} streak - Current fishing streak
 * @returns {HTMLElement} The streak meter element
 */
function createStreakMeter(streak) {
  const streakElement = document.createElement('div');
  streakElement.className = 'fishing-streak';
  
  // Calculate bonus from streak
  const bonusMultiplier = 1 + (Math.min(streak, 10) * 0.1);
  
  streakElement.innerHTML = `
    <h3>Fishing Streak: <span class="streak-count">${streak}</span></h3>
    <div class="streak-meter">
      <div class="streak-bar" style="width: ${Math.min(streak * 10, 100)}%"></div>
    </div>
    <div class="streak-bonus">
      Current Bonus: <span class="bonus-value">x${bonusMultiplier.toFixed(1)}</span>
    </div>
  `;
  
  return streakElement;
}

/**
 * Creates the last catch display element
 * @param {Object} lastCatch - Last caught fish data
 * @returns {HTMLElement} The last catch display element
 */
function createLastCatchDisplay(lastCatch) {
  const lastCatchElement = document.createElement('div');
  lastCatchElement.className = 'last-catch';
  
  // Get rarity class and emoji
  const rarityClass = lastCatch.rarity?.toLowerCase() || 'common';
  const rarityEmoji = getRarityEmoji(lastCatch.rarity);
  
  lastCatchElement.innerHTML = `
    <h3>Last Catch</h3>
    <div class="catch-card ${rarityClass}">
      <div class="catch-icon">${rarityEmoji}</div>
      <div class="catch-details">
        <h4>${lastCatch.name}</h4>
        <div class="catch-stats">
          <div class="catch-rarity">${lastCatch.rarity || 'Common'}</div>
          <div class="catch-size">${lastCatch.size || 'Medium'}</div>
          <div class="catch-value">${lastCatch.value || 10} SurCoins</div>
        </div>
        <div class="catch-time">${formatCatchTime(lastCatch.timestamp)}</div>
      </div>
    </div>
  `;
  
  return lastCatchElement;
}

/**
 * Creates the bonus display element
 * @param {Object} rod - Current fishing rod data
 * @param {Object} lure - Current fishing lure data
 * @returns {HTMLElement} The bonus display element
 */
function createBonusDisplay(rod, lure) {
  const bonusElement = document.createElement('div');
  bonusElement.className = 'fishing-bonuses';
  
  // Create list of active bonuses
  const bonuses = [];
  
  if (rod?.quality > 1) {
    bonuses.push(`🎣 ${rod.name} = +${(rod.quality - 1) * 20}% Catch Rate`);
  }
  
  if (rod?.reelSpeed > 1) {
    bonuses.push(`⚡ ${rod.name} = +${(rod.reelSpeed - 1) * 30}% Reel Speed`);
  }
  
  if (lure?.attractPower > 1) {
    bonuses.push(`🎯 ${lure.name} = +${(lure.attractPower - 1) * 50}% Bite Rate`);
  }
  
  if (lure?.rarityBonus > 0) {
    bonuses.push(`✨ ${lure.name} = +${lure.rarityBonus * 100}% Rare Fish Chance`);
  }
  
  // Create bonus HTML
  let bonusHTML = '<h3>Active Bonuses</h3>';
  
  if (bonuses.length > 0) {
    bonusHTML += '<ul class="bonus-list">';
    bonuses.forEach(bonus => {
      bonusHTML += `<li class="bonus-item">${bonus}</li>`;
    });
    bonusHTML += '</ul>';
  } else {
    bonusHTML += '<p class="no-bonuses">No active bonuses. Upgrade your gear to get better catches!</p>';
  }
  
  bonusElement.innerHTML = bonusHTML;
  return bonusElement;
}

/**
 * Creates the catch history display element
 * @param {Array} history - Array of previous catches
 * @returns {HTMLElement} The catch history element
 */
function createCatchHistory(history) {
  const historyElement = document.createElement('div');
  historyElement.className = 'catch-history';
  
  historyElement.innerHTML = `
    <h3>Recent Catches</h3>
    <ul class="history-list">
      ${history.slice(-5).map(fish => `
        <li class="history-item ${fish.rarity.toLowerCase()}">
          ${getRarityEmoji(fish.rarity)} ${fish.name} (${fish.value} SurCoins)
        </li>
      `).join('')}
    </ul>
  `;
  
  return historyElement;
}

/**
 * Gets the appropriate emoji for a rarity level
 * @param {string} rarity - Rarity level
 * @returns {string} Emoji representing the rarity
 */
function getRarityEmoji(rarity) {
  switch (rarity?.toLowerCase()) {
    case 'legendary':
      return '🌟';
    case 'rare':
      return '✨';
    case 'uncommon':
      return '⭐';
    case 'common':
    default:
      return '🐟';
  }
}

/**
 * Formats a timestamp into a relative time string
 * @param {number} timestamp - Timestamp to format
 * @returns {string} Formatted time string
 */
function formatCatchTime(timestamp) {
  if (!timestamp) return 'Just now';
  
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
  return `${Math.floor(diff / 86400000)} days ago`;
}

/**
 * Add CSS styles for the fishing UI
 */
export function injectFishingUIStyles() {
  const styleId = 'fishing-ui-styles';
  
  // Check if styles already exist
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* Fishing UI Styles */
    .fishing-ui-container {
      font-family: 'Rajdhani', sans-serif;
      color: #e0e0e0;
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .fishing-ui-container h3 {
      font-family: 'Bangers', cursive;
      color: var(--squad-neon);
      margin-top: 1rem;
      margin-bottom: 0.5rem;
      font-size: 1.5rem;
    }
    
    .fishing-gear, .fishing-streak, .last-catch, .fishing-bonuses, .catch-history {
      background: rgba(0,0,0,0.3);
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    
    .gear-items {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    
    .gear-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(0,0,0,0.2);
      padding: 0.75rem;
      border-radius: 8px;
      flex: 1;
      min-width: 240px;
    }
    
    .gear-icon {
      font-size: 2.5rem;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.3);
      border-radius: 8px;
    }
    
    .gear-details {
      flex: 1;
    }
    
    .gear-details h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1.2rem;
      color: var(--squad-primary);
    }
    
    .gear-stats {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .stat-item {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
    }
    
    .stat-value {
      font-weight: bold;
      color: var(--squad-neon);
    }
    
    /* Streak meter styles */
    .streak-meter {
      background: rgba(0,0,0,0.2);
      height: 10px;
      border-radius: 5px;
      overflow: hidden;
      margin: 0.5rem 0;
    }
    
    .streak-bar {
      background: var(--squad-neon);
      height: 100%;
      border-radius: 5px;
      transition: width 0.3s;
    }
    
    .streak-count {
      font-size: 1.2rem;
      color: var(--squad-neon);
    }
    
    .streak-bonus {
      font-size: 0.9rem;
      text-align: right;
    }
    
    .bonus-value {
      font-weight: bold;
      color: var(--squad-neon);
    }
    
    /* Last catch styles */
    .catch-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(0,0,0,0.2);
      padding: 1rem;
      border-radius: 8px;
      border-left: 4px solid #6495ED; /* Default color */
    }
    
    .catch-card.common {
      border-left-color: #6495ED;
    }
    
    .catch-card.uncommon {
      border-left-color: #32CD32;
    }
    
    .catch-card.rare {
      border-left-color: #9932CC;
    }
    
    .catch-card.legendary {
      border-left-color: #FFD700;
      background: linear-gradient(90deg, rgba(0,0,0,0.2), rgba(255,215,0,0.1));
    }
    
    .catch-icon {
      font-size: 2.5rem;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .catch-details h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1.2rem;
      color: var(--squad-primary);
    }
    
    .catch-stats {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 0.5rem;
    }
    
    .catch-rarity, .catch-size, .catch-value {
      font-size: 0.9rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      background: rgba(0,0,0,0.2);
    }
    
    .catch-time {
      font-size: 0.8rem;
      opacity: 0.6;
    }
    
    /* Bonus list styles */
    .bonus-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .bonus-item {
      padding: 0.5rem;
      background: rgba(0,0,0,0.2);
      margin-bottom: 0.5rem;
      border-radius: 4px;
      font-size: 0.9rem;
    }
    
    .no-bonuses {
      font-style: italic;
      opacity: 0.7;
    }
    
    /* History list styles */
    .history-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .history-item {
      padding: 0.5rem;
      background: rgba(0,0,0,0.2);
      margin-bottom: 0.25rem;
      border-radius: 4px;
      font-size: 0.9rem;
      border-left: 3px solid #6495ED;
    }
    
    .history-item.common {
      border-left-color: #6495ED;
    }
    
    .history-item.uncommon {
      border-left-color: #32CD32;
    }
    
    .history-item.rare {
      border-left-color: #9932CC;
    }
    
    .history-item.legendary {
      border-left-color: #FFD700;
    }
  `;
  
  document.head.appendChild(style);
}

/**
 * Initialize fishing UI and attach to container
 * @param {HTMLElement|string} container - DOM element or ID to render the fishing UI into
 */
export function initFishingUI(container) {
  // Get container element
  const containerElement = typeof container === 'string' 
    ? document.getElementById(container)
    : container;
  
  if (!containerElement) {
    console.error('Fishing UI container not found');
    return;
  }
  
  // Inject styles
  injectFishingUIStyles();
  
  // Add container class
  containerElement.classList.add('fishing-ui-container');
  
  // Initial render
  renderFishingUI(containerElement);
  
  // Subscribe to store changes
  const unsubscribe = store.subscribe(() => {
    renderFishingUI(containerElement);
  });
  
  // Return unsubscribe function
  return unsubscribe;
}

export default {
  renderFishingUI,
  initFishingUI,
  injectFishingUIStyles
}; 