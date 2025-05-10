/**
 * FishingGameIntegration.js
 * Provides integration between the fishing mini-game and the store-driven architecture
 */

import GameCore from './GameCore.js';
import { store } from '../StateStackULTRA/store/gameStore.js';

/**
 * Initialize the fishing game with player equipment from the store
 * @param {string} containerId - DOM container ID for the fishing game
 * @returns {Object} - The fishing game instance
 */
export function initFishingGame(containerId) {
  // Dynamically import the fishing game class
  return import('../fishing-game.js').then(module => {
    const FishingGame = module.default;
    
    // Get player state from store
    const state = store.getState();
    const player = state.player || {};
    
    // Get fishing equipment from player inventory
    const equipment = getFishingEquipment(player.inventory || []);
    
    // Initialize fishing game with equipment
    return new FishingGame(containerId, equipment);
  });
}

/**
 * Handle end of fishing session, award rewards to player
 * @param {Object} results - Results from fishing session
 */
export function processFishingResults(results) {
  if (!results) return;
  
  // Add currency based on fish value
  if (results.totalValue) {
    GameCore.addCurrency(results.totalValue);
    console.log(`Added ${results.totalValue} SurCoins from fishing`);
  }
  
  // Add fish to inventory
  if (results.caughtFish && results.caughtFish.length > 0) {
    results.caughtFish.forEach(fish => {
      // Convert fish to inventory item
      const fishItem = {
        id: `fish_${fish.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
        name: fish.name,
        type: 'fish',
        value: fish.value,
        rarity: fish.rarity,
        description: `A ${fish.rarity} ${fish.name} caught while fishing with Billy.`,
        quantity: 1
      };
      
      // Add fish to inventory
      GameCore.addItem(fishItem);
    });
    
    console.log(`Added ${results.caughtFish.length} fish to inventory`);
  }
  
  // Add fishing XP
  const xpGained = results.caughtFish ? results.caughtFish.length * 25 : 0;
  if (xpGained > 0) {
    GameCore.addXP(xpGained);
    console.log(`Added ${xpGained} XP from fishing`);
  }
  
  // Update Billy's relationship if caught any fish
  if (results.caughtFish && results.caughtFish.length > 0) {
    const relationshipBonus = Math.min(3, Math.floor(results.caughtFish.length / 2));
    if (relationshipBonus > 0) {
      GameCore.updateRelationship('billy', relationshipBonus);
      console.log(`Improved relationship with Billy by ${relationshipBonus}`);
    }
  }
  
  // Progress fishing quest if any exists
  const quests = store.getState().quests?.entities || {};
  const fishingQuest = Object.values(quests).find(q => 
    q.status === 'Active' && 
    q.title.toLowerCase().includes('fish')
  );
  
  if (fishingQuest && results.caughtFish && results.caughtFish.length > 0) {
    // Find the first uncompleted step related to catching fish
    const stepIndex = fishingQuest.steps.findIndex(step => 
      !step.completed && 
      step.description.toLowerCase().includes('catch')
    );
    
    if (stepIndex !== -1) {
      // Dispatch action to progress quest
      store.dispatch({
        type: 'quests/updateQuestStep',
        payload: {
          questId: fishingQuest.id,
          stepIndex,
          completed: true
        }
      });
      
      console.log(`Updated fishing quest step ${stepIndex + 1}`);
    }
  }
  
  // Save game state
  GameCore.save();
}

/**
 * Extract fishing equipment from player inventory
 * @param {Array} inventory - Player inventory
 * @returns {Object} Fishing equipment configuration
 */
function getFishingEquipment(inventory) {
  // Default equipment
  const equipment = {
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
  };
  
  // Check inventory for fishing rods
  const fishingRod = inventory.find(item => 
    item.type === 'equipment' && 
    item.name.toLowerCase().includes('rod')
  );
  
  if (fishingRod) {
    equipment.rod.name = fishingRod.name;
    equipment.rod.quality = fishingRod.quality || 1;
    equipment.rod.reelSpeed = fishingRod.reelSpeed || 1;
    equipment.rod.catchBonus = fishingRod.catchBonus || 0;
  }
  
  // Check inventory for lures
  const fishingLure = inventory.find(item => 
    item.type === 'equipment' && 
    item.name.toLowerCase().includes('lure')
  );
  
  if (fishingLure) {
    equipment.lure.name = fishingLure.name;
    equipment.lure.attractPower = fishingLure.attractPower || 1;
    equipment.lure.rarityBonus = fishingLure.rarityBonus || 0;
  }
  
  return equipment;
}

/**
 * Add a fishing-related item to player inventory
 * @param {string} itemName - Name of the item to add
 * @param {Object} properties - Additional properties for the item
 * @returns {Object} The added item
 */
export function addFishingItem(itemName, properties = {}) {
  // Get item type based on name
  let type = 'equipment';
  if (itemName.toLowerCase().includes('fish')) {
    type = 'fish';
  }
  
  // Create item object
  const item = {
    id: `fishing_${itemName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
    name: itemName,
    type: type,
    ...properties,
    quantity: 1
  };
  
  // Add item to inventory
  GameCore.addItem(item);
  
  return item;
}

export default {
  initFishingGame,
  processFishingResults,
  addFishingItem
}; 