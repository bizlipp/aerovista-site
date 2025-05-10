// FishingGameSession.js - Core fishing game logic that integrates with the Redux store
import { store } from './StateStackULTRA/store/gameStore.js';
import * as fishingSelectors from './StateStackULTRA/slices/fishingSelectors.js';
import { playerActions } from './StateStackULTRA/slices/playerSlice.js';
import { fishingActions } from './StateStackULTRA/slices/fishingSlice.js';
import GameCore from './game/GameCore.js';

// Fish types definition with probabilities
const FISH_TYPES = [
  { name: 'Small Perch', value: 10, rarity: 'common', difficulty: 1, size: 'Small', probability: 0.30 },
  { name: 'Bluegill', value: 15, rarity: 'common', difficulty: 1, size: 'Small', probability: 0.25 },
  { name: 'Crappie', value: 20, rarity: 'common', difficulty: 2, size: 'Medium', probability: 0.20 },
  { name: 'Bass', value: 50, rarity: 'uncommon', difficulty: 3, size: 'Medium', probability: 0.12 },
  { name: 'Trout', value: 75, rarity: 'uncommon', difficulty: 3, size: 'Medium', probability: 0.08 },
  { name: 'Walleye', value: 100, rarity: 'rare', difficulty: 4, size: 'Large', probability: 0.03 },
  { name: 'Northern Pike', value: 150, rarity: 'rare', difficulty: 5, size: 'Large', probability: 0.015 },
  { name: 'Billy\'s Monster Bass', value: 500, rarity: 'legendary', difficulty: 10, size: 'Huge', probability: 0.005 }
];

// Rarity tiers for randomization
const RARITY_TIERS = {
  common: { chance: 0.75, fishes: FISH_TYPES.filter(fish => fish.rarity === 'common') },
  uncommon: { chance: 0.20, fishes: FISH_TYPES.filter(fish => fish.rarity === 'uncommon') },
  rare: { chance: 0.045, fishes: FISH_TYPES.filter(fish => fish.rarity === 'rare') },
  legendary: { chance: 0.005, fishes: FISH_TYPES.filter(fish => fish.rarity === 'legendary') }
};

/**
 * Start a fishing session
 * @returns {boolean} Success status
 */
export function startFishing() {
  const state = store.getState();
  
  // Check if fishing is already active
  if (fishingSelectors.isFishingActive(state)) {
    console.log('Fishing session already active');
    return false;
  }
  
  // Dispatch action to start fishing
  store.dispatch(fishingActions.startFishing());
  console.log('Fishing session started');
  
  return true;
}

/**
 * End the current fishing session
 * @returns {boolean} Success status
 */
export function endFishing() {
  const state = store.getState();
  
  // Check if fishing is active
  if (!fishingSelectors.isFishingActive(state)) {
    console.log('No active fishing session to end');
    return false;
  }
  
  // Dispatch action to end fishing
  store.dispatch(fishingActions.endFishing());
  console.log('Fishing session ended');
  
  return true;
}

/**
 * Simulate a fishing cast and attempt to catch a fish
 * @param {number} castPower - Power of the cast (0-100)
 * @returns {boolean} Whether a fish was caught
 */
export function attemptCatch(castPower = 50) {
  const state = store.getState();
  
  // Check if fishing is active
  if (!fishingSelectors.isFishingActive(state)) {
    console.log('Cannot attempt catch: No active fishing session');
    return false;
  }
  
  // Get current equipment
  const rod = fishingSelectors.getCurrentRod(state);
  const lure = fishingSelectors.getCurrentLure(state);
  const streak = fishingSelectors.getCurrentStreak(state);
  
  // Calculate catch chance based on equipment and cast power
  // Base chance is 30% + cast power influence + rod quality + lure attract power + streak bonus
  const baseChance = 0.3;
  const castInfluence = (castPower / 100) * 0.2; // Cast power gives up to 20% bonus
  const rodBonus = ((rod?.quality || 1) - 1) * 0.1; // Each rod quality point above 1 gives 10% bonus
  const lureBonus = ((lure?.attractPower || 1) - 1) * 0.15; // Each lure attract point above 1 gives 15% bonus
  const streakBonus = Math.min(streak, 10) * 0.01; // Each streak point gives 1% bonus (max 10%)
  
  const totalChance = baseChance + castInfluence + rodBonus + lureBonus + streakBonus;
  
  // Roll for catch
  const roll = Math.random();
  const caught = roll <= totalChance;
  
  console.log(`Catch attempt: ${caught ? 'SUCCESS' : 'FAILED'} (${Math.round(totalChance * 100)}% chance)`);
  
  // If caught, resolve the catch
  if (caught) {
    const fish = resolveCatch();
    return fish !== null;
  }
  
  // If failed, reset streak
  if (streak > 0) {
    store.dispatch(fishingActions.resetStreak());
  }
  
  return false;
}

/**
 * Resolve a successful catch, determining what fish was caught
 * @returns {Object|null} The caught fish or null if error
 */
export function resolveCatch() {
  const state = store.getState();
  
  // Check if fishing is active
  if (!fishingSelectors.isFishingActive(state)) {
    console.log('Cannot resolve catch: No active fishing session');
    return null;
  }
  
  // Get current equipment
  const lure = fishingSelectors.getCurrentLure(state);
  const streak = fishingSelectors.getCurrentStreak(state);
  
  // Determine rarity based on lure and streak
  const rarityRoll = Math.random();
  const lureRarityBonus = lure?.rarityBonus || 0;
  const streakRarityBonus = Math.min(streak, 5) * 0.01; // Each streak gives 1% rarity bonus (max 5%)
  
  let selectedRarity = 'common';
  let adjustedRoll = rarityRoll - lureRarityBonus - streakRarityBonus;
  
  if (adjustedRoll < 0) adjustedRoll = 0;
  
  // Find the rarity tier
  let cumulativeChance = 0;
  for (const [rarity, rarityData] of Object.entries(RARITY_TIERS)) {
    cumulativeChance += rarityData.chance;
    if (adjustedRoll <= cumulativeChance) {
      selectedRarity = rarity;
      break;
    }
  }
  
  // If we still don't have a rarity, default to common
  if (!selectedRarity) selectedRarity = 'common';
  
  // Get a fish from the selected rarity
  const rarityFishes = RARITY_TIERS[selectedRarity].fishes;
  const fishIndex = Math.floor(Math.random() * rarityFishes.length);
  const fishTemplate = rarityFishes[fishIndex] || FISH_TYPES[0]; // Default to first fish if something goes wrong
  
  // Create the caught fish with unique ID
  const caughtFish = {
    ...fishTemplate,
    id: `fish_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    timestamp: Date.now()
  };
  
  // Add some randomization to the fish value (±10%)
  const valueFactor = 0.9 + (Math.random() * 0.2);
  caughtFish.value = Math.round(caughtFish.value * valueFactor);
  
  // Record the catch
  recordCatch(caughtFish);
  
  console.log(`Caught a ${caughtFish.rarity} ${caughtFish.name} worth ${caughtFish.value} SurCoins!`);
  
  return caughtFish;
}

/**
 * Record a caught fish in the store and give player rewards
 * @param {Object} fish - The caught fish
 */
function recordCatch(fish) {
  if (!fish) return;
  
  // Increment streak
  store.dispatch(fishingActions.incrementStreak());
  
  // Record the catch
  store.dispatch(fishingActions.recordCatch(fish));
  
  // Add fish to inventory as an item
  store.dispatch(playerActions.addItem({
    id: fish.id,
    name: fish.name,
    type: 'fish',
    rarity: fish.rarity,
    value: fish.value,
    description: `A ${fish.size} ${fish.rarity} ${fish.name} caught while fishing.`,
    acquired: fish.timestamp,
    quantity: 1
  }));
  
  // Add currency
  store.dispatch(playerActions.addCurrency(fish.value));
  
  // Add XP based on fish rarity
  let xpReward = 0;
  switch(fish.rarity) {
    case 'legendary': xpReward = 100; break;
    case 'rare': xpReward = 50; break;
    case 'uncommon': xpReward = 25; break;
    case 'common': default: xpReward = 10; break;
  }
  
  store.dispatch(playerActions.addXP(xpReward));
  
  // Improve relationship with Billy when catching rarer fish
  if (fish.rarity !== 'common') {
    const relationshipBonus = fish.rarity === 'legendary' ? 3 : 
                              fish.rarity === 'rare' ? 2 : 1;
    
    // Use GameCore for relationship update
    GameCore.updateRelationship('billy', relationshipBonus);
  }
  
  // Save game state
  GameCore.save();
}

/**
 * Get all available fishing equipment from player inventory
 * @returns {Object} Equipment object with rods and lures arrays
 */
export function getAvailableFishingEquipment() {
  const state = store.getState();
  const inventory = state.player?.inventory || [];
  
  // Filter for fishing equipment
  const rods = inventory.filter(item => 
    item.type === 'equipment' && 
    item.name.toLowerCase().includes('rod')
  );
  
  const lures = inventory.filter(item => 
    item.type === 'equipment' && 
    item.name.toLowerCase().includes('lure')
  );
  
  return { rods, lures };
}

/**
 * Set the fishing equipment to use
 * @param {string} rodId - ID of the rod to equip
 * @param {string} lureId - ID of the lure to equip
 * @returns {boolean} Success status
 */
export function setFishingEquipment(rodId, lureId) {
  const state = store.getState();
  const inventory = state.player?.inventory || [];
  
  // Find the items in inventory
  const rod = inventory.find(item => item.id === rodId);
  const lure = inventory.find(item => item.id === lureId);
  
  // Check if items were found
  if (!rod || !lure) {
    console.error('Equipment not found in inventory');
    return false;
  }
  
  // Dispatch actions to set equipment
  store.dispatch(fishingActions.setRod(rod));
  store.dispatch(fishingActions.setLure(lure));
  
  console.log(`Equipped ${rod.name} and ${lure.name}`);
  return true;
}

/**
 * Get catch bonus multiplier based on current equipment and streak
 * @returns {number} The bonus multiplier (1.0 = no bonus)
 */
export function getCatchBonusMultiplier() {
  const state = store.getState();
  
  const rod = fishingSelectors.getCurrentRod(state);
  const lure = fishingSelectors.getCurrentLure(state);
  const streak = fishingSelectors.getCurrentStreak(state);
  
  // Calculate bonuses
  const rodBonus = rod?.catchBonus ? (rod.catchBonus / 100) : 0;
  const streakBonus = Math.min(streak, 10) * 0.1; // 10% per streak, max 100%
  
  return 1.0 + rodBonus + streakBonus;
}

/**
 * Process fishing session results
 * @param {Object} results - Results from fishing session
 */
export function processFishingResults(results) {
  if (!results) return;
  
  // If we have caught fish, add them to inventory
  if (results.caughtFish && results.caughtFish.length > 0) {
    results.caughtFish.forEach(fish => {
      recordCatch(fish);
    });
  }
  
  // End fishing session
  endFishing();
}

/**
 * Choose a random fish based on rarity distribution (modified by bonuses)
 * @param {number} rarityBonus - Bonus to rarity chance (0-1)
 * @returns {Object} The selected fish
 */
export function chooseRandomFish(rarityBonus = 0) {
  // Adjust rarity chances based on bonus
  const adjustedRarities = {};
  for (const [rarity, data] of Object.entries(RARITY_TIERS)) {
    // Increase higher rarity chances, decrease common chance
    if (rarity === 'common') {
      adjustedRarities[rarity] = { ...data, chance: data.chance - (rarityBonus * 0.5) };
    } else {
      // Distribute the bonus among rarities, giving more to higher rarities
      const bonusFactor = rarity === 'legendary' ? 0.4 : 
                          rarity === 'rare' ? 0.3 : 0.3;
      adjustedRarities[rarity] = { ...data, chance: data.chance + (rarityBonus * bonusFactor) };
    }
  }
  
  // Roll for rarity
  const roll = Math.random();
  let selectedRarity = 'common';
  let cumulativeChance = 0;
  
  for (const [rarity, rarityData] of Object.entries(adjustedRarities)) {
    cumulativeChance += rarityData.chance;
    if (roll <= cumulativeChance) {
      selectedRarity = rarity;
      break;
    }
  }
  
  // Get a fish from the selected rarity
  const rarityFishes = RARITY_TIERS[selectedRarity].fishes;
  const fishIndex = Math.floor(Math.random() * rarityFishes.length);
  return rarityFishes[fishIndex] || FISH_TYPES[0];
}

export default {
  startFishing,
  endFishing,
  attemptCatch,
  resolveCatch,
  getAvailableFishingEquipment,
  setFishingEquipment,
  getCatchBonusMultiplier,
  processFishingResults,
  chooseRandomFish
}; 