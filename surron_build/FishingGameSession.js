// FishingGameSession.js - Non-module version
// Core fishing game logic that integrates with the game state

/**
 * This is a non-module version of FishingGameSession.js that works without ES modules.
 * It uses global objects like window.store and window.game instead of imports.
 */

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

// Default game state for fishing
const defaultFishingState = {
  active: false,
  streak: 0,
  lastCatch: null,
  catches: [],
  equipment: {
    rod: null,
    lure: null
  }
};

// Global fishing state (instead of using Redux store)
window.fishingState = window.fishingState || defaultFishingState;

/**
 * Start a fishing session
 * @returns {boolean} Success status
 */
function startFishing() {
  // Check if fishing is already active
  if (window.fishingState.active) {
    console.log('Fishing session already active');
    return false;
  }
  
  // Update state to start fishing
  window.fishingState.active = true;
  console.log('Fishing session started');
  
  return true;
}

/**
 * End the current fishing session
 * @returns {boolean} Success status
 */
function endFishing() {
  // Check if fishing is active
  if (!window.fishingState.active) {
    console.log('No active fishing session to end');
    return false;
  }
  
  // Update state to end fishing
  window.fishingState.active = false;
  console.log('Fishing session ended');
  
  return true;
}

/**
 * Simulate a fishing cast and attempt to catch a fish
 * @param {number} castPower - Power of the cast (0-100)
 * @returns {boolean} Whether a fish was caught
 */
function attemptCatch(castPower = 50) {
  // Check if fishing is active
  if (!window.fishingState.active) {
    console.log('Cannot attempt catch: No active fishing session');
    return false;
  }
  
  // Get current equipment
  const rod = window.fishingState.equipment.rod;
  const lure = window.fishingState.equipment.lure;
  const streak = window.fishingState.streak;
  
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
    window.fishingState.streak = 0;
  }
  
  return false;
}

/**
 * Resolve a successful catch, determining what fish was caught
 * @returns {Object|null} The caught fish or null if error
 */
function resolveCatch() {
  // Check if fishing is active
  if (!window.fishingState.active) {
    console.log('Cannot resolve catch: No active fishing session');
    return null;
  }
  
  // Get current equipment
  const lure = window.fishingState.equipment.lure;
  const streak = window.fishingState.streak;
  
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
 * Record a caught fish
 * @param {Object} fish - The caught fish
 */
function recordCatch(fish) {
  if (!fish) return;
  
  // Increment streak
  window.fishingState.streak += 1;
  
  // Record the catch
  window.fishingState.lastCatch = fish;
  window.fishingState.catches.push(fish);
  
  // Add fish to inventory, if the game is available
  if (window.game && typeof window.game.addItem === 'function') {
    window.game.addItem({
      id: fish.id,
      name: fish.name,
      type: 'fish',
      rarity: fish.rarity,
      value: fish.value,
      quantity: 1
    });
  }
  
  // Add currency from the fish
  if (window.game && typeof window.game.addCurrency === 'function') {
    window.game.addCurrency(fish.value);
  }
}

/**
 * Get the fishing equipment available to the player
 * @returns {Object} Available fishing equipment
 */
function getAvailableFishingEquipment() {
  const inventory = window.game && typeof window.game.getInventory === 'function' 
    ? window.game.getInventory() 
    : [];
  
  // Find all rods and lures in inventory
  const rods = inventory.filter(item => item.type === 'fishing_rod');
  const lures = inventory.filter(item => item.type === 'fishing_lure');
  
  // Always include default equipment
  if (rods.length === 0) {
    rods.push({ 
      id: 'default_rod', 
      name: 'Basic Rod', 
      quality: 1, 
      reelSpeed: 1, 
      catchBonus: 0 
    });
  }
  
  if (lures.length === 0) {
    lures.push({ 
      id: 'default_lure', 
      name: 'Basic Lure', 
      attractPower: 1, 
      rarityBonus: 0 
    });
  }
  
  return { rods, lures };
}

/**
 * Set the fishing equipment to use
 * @param {string} rodId - Rod ID
 * @param {string} lureId - Lure ID
 * @returns {boolean} Success status
 */
function setFishingEquipment(rodId, lureId) {
  const equipment = getAvailableFishingEquipment();
  
  // Find selected rod
  const rod = equipment.rods.find(r => r.id === rodId);
  if (!rod) {
    console.log(`Rod with ID ${rodId} not found`);
    return false;
  }
  
  // Find selected lure
  const lure = equipment.lures.find(l => l.id === lureId);
  if (!lure) {
    console.log(`Lure with ID ${lureId} not found`);
    return false;
  }
  
  // Set equipment
  window.fishingState.equipment.rod = rod;
  window.fishingState.equipment.lure = lure;
  
  console.log(`Fishing equipment set: ${rod.name}, ${lure.name}`);
  return true;
}

/**
 * Process fishing session results
 * @param {Object} results - Fishing session results
 */
function processFishingResults(results) {
  console.log('Processing fishing results:', results);
  
  // Add XP based on session value
  const xpAmount = Math.floor(results.sessionValue / 2);
  if (window.game && typeof window.game.addXP === 'function') {
    window.game.addXP(xpAmount);
  }
  
  // Check for any quest progression
  if (window.game && typeof window.game.progressQuest === 'function') {
    // Check if there's a fishing quest
    window.game.progressQuest('fish_delivery', results.caughtFish.length);
  }
  
  // Reset fishing state
  window.fishingState = { ...defaultFishingState };
}

// Add functions to the window object for non-module access
window.FishingGameSession = {
  startFishing,
  endFishing,
  attemptCatch,
  resolveCatch,
  getAvailableFishingEquipment,
  setFishingEquipment,
  processFishingResults
};

// Support ES modules if they're available
if (typeof exports !== 'undefined') {
  exports.startFishing = startFishing;
  exports.endFishing = endFishing;
  exports.attemptCatch = attemptCatch;
  exports.resolveCatch = resolveCatch;
  exports.getAvailableFishingEquipment = getAvailableFishingEquipment;
  exports.setFishingEquipment = setFishingEquipment;
  exports.processFishingResults = processFishingResults;
} 