/**
 * enhanced-fishing.js
 * 
 * Enhances the Surron Squad fishing game with improved mechanics:
 * - Integrated weather system that affects fishing conditions
 * - Expanded fish catalog with seasonal and weather-dependent availability
 * - Skill-based fishing challenges
 * - Equipment effects and upgrades
 * - Special fishing events
 * 
 * This file serves as the central integration point for the enhanced fishing experience.
 */

import { store } from '../StateStackULTRA/store/gameStore.js';
import GameCore from './GameCore.js';
import weatherSystem from './weather-system.js';
import fishCatalog from './fish-catalog.js';

/**
 * EnhancedFishing - Core class for improved fishing mechanics
 */
export class EnhancedFishing {
  constructor() {
    // Core fishing state
    this.isActive = false;
    this.currentSpot = null;
    this.lastCastTime = 0;
    this.activeChallenges = [];
    
    // Initialize integrations
    this.initWeatherSystem();
  }
  
  /**
   * Initialize weather system
   */
  initWeatherSystem() {
    // Start weather system with dynamic changes
    weatherSystem.start();
    
    // Listen for weather changes
    weatherSystem.addEventListener('all', (event, data) => {
      this.onEnvironmentChanged(event, data);
    });
  }
  
  /**
   * Handle environment changes (weather, season, time of day)
   * @param {string} event - The type of change
   * @param {Object} data - The change data
   */
  onEnvironmentChanged(event, data) {
    console.log(`Fishing environment changed: ${event}`, data);
    
    // Show notification to player
    if (typeof showToast === 'function') {
      let message = '';
      
      switch(event) {
        case 'weather':
          message = `Weather changed to ${data.new}. ${WEATHER_CONDITIONS[data.new].description}`;
          break;
        case 'season':
          message = `Season changed to ${data.new}. ${SEASONS[data.new].description}`;
          break;
        case 'timeOfDay':
          message = `It's now ${data.new}. ${TIME_OF_DAY[data.new].description}`;
          break;
      }
      
      if (message) {
        showToast(message, 'info');
      }
    }
    
    // Update available fish based on new conditions
    this.updateAvailableFish();
  }
  
  /**
   * Update available fish based on current conditions
   */
  updateAvailableFish() {
    const conditions = {
      weather: weatherSystem.currentWeather,
      season: weatherSystem.currentSeason,
      timeOfDay: weatherSystem.currentTimeOfDay
    };
    
    // Get fish available in current conditions
    const availableFish = fishCatalog.getAvailableFish(conditions);
    
    // Update game state with available fish
    store.dispatch({
      type: 'fishing/updateAvailableFish',
      payload: availableFish
    });
  }
  
  /**
   * Start a fishing session
   * @param {Object} spot - Fishing spot details (optional)
   * @param {Object} equipment - Player's fishing equipment
   * @returns {Object} Initial fishing session data
   */
  startFishing(spot = null, equipment = null) {
    // Get player state
    const playerState = GameCore.getPlayerState();
    const inventory = playerState?.inventory || [];
    
    // Set active state
    this.isActive = true;
    this.currentSpot = spot || {
      name: "Lakeside",
      depth: "medium",
      fishDensity: 0.8,
      rarityBonus: 0
    };
    
    // Get player's equipment
    this.equipment = equipment || this.getEquipmentFromInventory(inventory);
    
    // Get current environmental conditions
    const conditions = weatherSystem.getCurrentConditions();
    
    // Calculate session modifiers based on conditions and equipment
    const sessionModifiers = this.calculateFishingModifiers();
    
    // Initialize session in store
    store.dispatch({
      type: 'fishing/startSession',
      payload: {
        spot: this.currentSpot,
        equipment: this.equipment,
        conditions: conditions,
        modifiers: sessionModifiers,
        startTime: Date.now()
      }
    });
    
    // Update available fish based on current conditions
    this.updateAvailableFish();
    
    return {
      spot: this.currentSpot,
      equipment: this.equipment,
      conditions: conditions,
      modifiers: sessionModifiers
    };
  }
  
  /**
   * End the current fishing session
   * @returns {Object} Session summary
   */
  endFishing() {
    const state = store.getState();
    const fishingState = state.fishing || {};
    
    // Get session statistics
    const sessionStats = {
      totalCatches: fishingState.catches?.length || 0,
      duration: Date.now() - fishingState.sessionStart,
      totalValue: fishingState.catches?.reduce((total, fish) => total + fish.value, 0) || 0,
      rareCatches: fishingState.catches?.filter(fish => fish.rarity >= 3).length || 0
    };
    
    // Calculate XP and rewards
    const xpGained = this.calculateSessionXP(sessionStats);
    const bonusRewards = this.calculateBonusRewards(sessionStats);
    
    // Apply rewards to player state
    GameCore.addXP(xpGained);
    
    if (bonusRewards.currency > 0) {
      GameCore.addCurrency(bonusRewards.currency);
    }
    
    // Add bonus items if any
    if (bonusRewards.items && bonusRewards.items.length > 0) {
      bonusRewards.items.forEach(item => {
        GameCore.addItem(item);
      });
    }
    
    // End session in store
    store.dispatch({
      type: 'fishing/endSession',
      payload: {
        stats: sessionStats,
        rewards: {
          xp: xpGained,
          ...bonusRewards
        },
        endTime: Date.now()
      }
    });
    
    // Reset state
    this.isActive = false;
    this.currentSpot = null;
    
    return {
      stats: sessionStats,
      rewards: {
        xp: xpGained,
        ...bonusRewards
      }
    };
  }
  
  /**
   * Calculate fishing modifiers based on current conditions and equipment
   * @returns {Object} Combined modifiers
   */
  calculateFishingModifiers() {
    // Get base modifiers from environment
    const catchRateModifier = weatherSystem.getCatchRateModifier();
    const rarityBonus = weatherSystem.getRarityBonus();
    
    // Add equipment bonuses
    const equipmentCatchBonus = this.equipment.rod.catchBonus || 0;
    const equipmentRarityBonus = this.equipment.lure.rarityBonus || 0;
    
    // Add spot bonuses
    const spotCatchBonus = this.currentSpot.fishDensity || 0;
    const spotRarityBonus = this.currentSpot.rarityBonus || 0;
    
    // Calculate final modifiers
    return {
      catchRate: catchRateModifier * (1 + equipmentCatchBonus) * (1 + spotCatchBonus),
      rarityBonus: rarityBonus + equipmentRarityBonus + spotRarityBonus,
      reelSpeed: this.equipment.rod.reelSpeed || 1,
      attractPower: this.equipment.lure.attractPower || 1
    };
  }
  
  /**
   * Get fishing equipment from player inventory
   * @param {Array} inventory - Player inventory
   * @returns {Object} Fishing equipment configuration
   */
  getEquipmentFromInventory(inventory) {
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
    
    // Find best rod in inventory
    const rods = inventory.filter(item => 
      item.type === 'equipment' && 
      item.subType === 'fishingRod'
    );
    
    if (rods.length > 0) {
      // Sort by quality and get the best one
      const bestRod = rods.sort((a, b) => (b.quality || 1) - (a.quality || 1))[0];
      equipment.rod = {
        name: bestRod.name,
        quality: bestRod.quality || 1,
        reelSpeed: bestRod.reelSpeed || 1,
        catchBonus: bestRod.catchBonus || 0
      };
    }
    
    // Find best lure in inventory
    const lures = inventory.filter(item => 
      item.type === 'equipment' && 
      item.subType === 'fishingLure'
    );
    
    if (lures.length > 0) {
      // Sort by rarity bonus and get the best one
      const bestLure = lures.sort((a, b) => (b.rarityBonus || 0) - (a.rarityBonus || 0))[0];
      equipment.lure = {
        name: bestLure.name,
        attractPower: bestLure.attractPower || 1,
        rarityBonus: bestLure.rarityBonus || 0
      };
    }
    
    return equipment;
  }
  
  /**
   * Cast fishing line
   * @param {number} power - Cast power (0-100)
   * @param {number} angle - Cast angle (0-360)
   * @returns {Object} Cast result
   */
  castLine(power, angle) {
    if (!this.isActive) {
      console.error("Cannot cast: No active fishing session");
      return { success: false, error: "No active fishing session" };
    }
    
    // Record cast time
    this.lastCastTime = Date.now();
    
    // Calculate cast distance based on power and rod quality
    const maxDistance = 100 * this.equipment.rod.quality;
    const distance = (power / 100) * maxDistance;
    
    // Calculate position based on distance and angle
    const position = {
      x: Math.cos(angle * Math.PI / 180) * distance,
      y: Math.sin(angle * Math.PI / 180) * distance
    };
    
    // Dispatch cast action
    store.dispatch({
      type: 'fishing/cast',
      payload: {
        power,
        angle,
        distance,
        position,
        timestamp: this.lastCastTime
      }
    });
    
    return {
      success: true,
      distance,
      position
    };
  }
  
  /**
   * Check for fish bite
   * @returns {boolean} True if fish is biting
   */
  checkForBite() {
    if (!this.isActive) return false;
    
    // Get current modifiers
    const modifiers = this.calculateFishingModifiers();
    
    // Calculate time since cast
    const timeSinceCast = Date.now() - this.lastCastTime;
    
    // Base bite chance increases over time until a certain point
    let timeBonus = Math.min(timeSinceCast / 10000, 0.5); // Max 50% bonus after 10 seconds
    
    // Calculate final bite chance
    const biteChance = 0.1 + timeBonus;
    const finalBiteChance = biteChance * modifiers.catchRate * modifiers.attractPower;
    
    // Random check for bite
    const hasBite = Math.random() < finalBiteChance;
    
    if (hasBite) {
      // Select fish based on current conditions
      const fish = this.selectFish();
      
      // Create fishing challenge based on fish type
      const challenge = this.createChallenge(fish);
      
      // Store the active challenge
      this.activeChallenges.push({
        fish,
        challenge,
        startTime: Date.now()
      });
      
      // Dispatch bite action
      store.dispatch({
        type: 'fishing/bite',
        payload: {
          fish,
          challenge: challenge.type,
          timestamp: Date.now()
        }
      });
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Select a fish based on current conditions
   * @returns {Object} Selected fish
   */
  selectFish() {
    const state = store.getState();
    const availableFish = state.fishing?.availableFish || fishCatalog.FISH_CATALOG;
    
    // Get current modifiers
    const modifiers = this.calculateFishingModifiers();
    
    // Filter fish by rarity based on modifiers
    // Higher rarity bonus increases chance of rare fish
    const rarityThreshold = Math.random() > (0.8 - modifiers.rarityBonus) ? 3 : 
                           Math.random() > (0.95 - modifiers.rarityBonus) ? 4 : 
                           Math.random() > (0.99 - modifiers.rarityBonus) ? 5 : 2;
    
    // Get fish with rarity up to the threshold
    const possibleFish = availableFish.filter(fish => fish.rarity <= rarityThreshold);
    
    if (possibleFish.length === 0) {
      // Fallback to common fish if no matches
      return fishCatalog.getFishByRarity(1)[0];
    }
    
    // Weight selection by rarity (rarer fish are less likely)
    const weights = possibleFish.map(fish => 1 / Math.pow(fish.rarity, 1.5));
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    
    // Random weighted selection
    let selection = Math.random() * totalWeight;
    let cumulativeWeight = 0;
    
    for (let i = 0; i < possibleFish.length; i++) {
      cumulativeWeight += weights[i];
      if (selection <= cumulativeWeight) {
        return possibleFish[i];
      }
    }
    
    // Fallback
    return possibleFish[0];
  }
  
  /**
   * Create a challenge based on the fish type
   * @param {Object} fish - The fish to create a challenge for
   * @returns {Object} Challenge data
   */
  createChallenge(fish) {
    // Base challenge types
    const challengeTypes = [
      'timing',      // Press at the right moment
      'reeling',     // Press repeatedly to reel in
      'balancing',   // Keep indicator in target zone
      'patience'     // Hold steady for a duration
    ];
    
    // Select challenge type based on fish properties
    let challengeType;
    
    if (fish.specialEffect && fish.specialEffect.challenge) {
      // Use special challenge if defined
      challengeType = fish.specialEffect.challenge;
    } else {
      // Select based on fish properties
      if (fish.size > 2.5) {
        // Big fish require strength
        challengeType = 'reeling';
      } else if (fish.rarity >= 4) {
        // Rare fish require precision
        challengeType = 'balancing';
      } else if (fish.name.includes('Bass') || fish.name.includes('Pike')) {
        // Aggressive fish require quick timing
        challengeType = 'timing';
      } else {
        // Default to random selection
        challengeType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
      }
    }
    
    // Set challenge difficulty based on fish properties
    const difficulty = Math.min(1, 0.4 + (fish.rarity * 0.1) + (fish.size * 0.05));
    
    // Set challenge duration based on type and fish size
    const baseDuration = 3000; // 3 seconds
    const duration = baseDuration * (1 + (fish.size * 0.2));
    
    // Create challenge
    return {
      type: challengeType,
      difficulty,
      duration,
      fish: fish.name,
      reward: fish
    };
  }
  
  /**
   * Complete a fishing challenge
   * @param {string} challengeId - ID of the challenge to complete
   * @param {Object} result - Challenge result data
   * @returns {Object} Completion result
   */
  completeChallenge(challengeId, result) {
    // Find the challenge
    const challenge = this.activeChallenges.find(c => c.challenge.fish === challengeId);
    
    if (!challenge) {
      return { success: false, error: "Challenge not found" };
    }
    
    // Remove from active challenges
    this.activeChallenges = this.activeChallenges.filter(c => c.challenge.fish !== challengeId);
    
    // Calculate success based on result score
    const successRate = result.score / 100;
    const fish = challenge.fish;
    
    // Adjust fish value based on success
    const adjustedValue = Math.round(fish.value * successRate);
    
    // Process the catch
    const catchResult = {
      fish: { ...fish, value: adjustedValue },
      timestamp: Date.now(),
      successRate
    };
    
    // Add to catch history
    store.dispatch({
      type: 'fishing/catch',
      payload: catchResult
    });
    
    // Add fish to inventory
    GameCore.addItem({
      ...fish,
      id: `fish_${fish.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
      value: adjustedValue,
      quantity: 1,
      catchTime: Date.now()
    });
    
    // Check for special effects
    if (fish.specialEffect) {
      this.processSpecialEffect(fish.specialEffect);
    }
    
    return {
      success: true,
      fish: catchResult.fish,
      successRate
    };
  }
  
  /**
   * Process special effects from fish
   * @param {Object} effect - Special effect to process
   */
  processSpecialEffect(effect) {
    if (!effect) return;
    
    if (effect.currencyMultiplier) {
      // Add bonus currency
      const bonus = Math.round(effect.currencyMultiplier * 10);
      GameCore.addCurrency(bonus);
      
      if (typeof showToast === 'function') {
        showToast(`Bonus SurCoins: +${bonus}`, 'success');
      }
    }
    
    if (effect.xpBonus) {
      // Add bonus XP
      GameCore.addXP(effect.xpBonus);
      
      if (typeof showToast === 'function') {
        showToast(`Bonus XP: +${effect.xpBonus}`, 'success');
      }
    }
    
    if (effect.relationshipBonus) {
      // Improve relationship with character
      const character = effect.relationshipBonus;
      const relationships = GameCore.getPlayerState().relationships || {};
      const currentLevel = relationships[character] || 0;
      
      store.dispatch({
        type: 'player/updateRelationship',
        payload: {
          character,
          level: currentLevel + 1
        }
      });
      
      if (typeof showToast === 'function') {
        showToast(`${character.charAt(0).toUpperCase() + character.slice(1)} likes your catch!`, 'success');
      }
    }
    
    if (effect.questTrigger) {
      // Trigger a quest
      store.dispatch({
        type: 'quests/trigger',
        payload: effect.questTrigger
      });
      
      if (typeof showToast === 'function') {
        showToast(`New quest available!`, 'info');
      }
    }
  }
  
  /**
   * Calculate XP earned from fishing session
   * @param {Object} stats - Session statistics
   * @returns {number} XP earned
   */
  calculateSessionXP(stats) {
    // Base XP per catch
    const baseXP = 5;
    
    // Calculate total XP
    let totalXP = stats.totalCatches * baseXP;
    
    // Bonus XP for rare catches
    totalXP += stats.rareCatches * 15;
    
    // Bonus for session length (max +50% after 10 minutes)
    const durationFactor = Math.min(stats.duration / 600000, 0.5);
    totalXP = Math.round(totalXP * (1 + durationFactor));
    
    return totalXP;
  }
  
  /**
   * Calculate bonus rewards from fishing session
   * @param {Object} stats - Session statistics
   * @returns {Object} Bonus rewards
   */
  calculateBonusRewards(stats) {
    const rewards = {
      currency: 0,
      items: []
    };
    
    // Bonus currency based on session stats
    rewards.currency = Math.round(stats.totalValue * 0.2);
    
    // Chance to get bonus equipment
    if (stats.rareCatches >= 3 && Math.random() < 0.3) {
      // Add special lure
      rewards.items.push({
        id: `lure_lucky_${Date.now()}`,
        name: "Lucky Lure",
        type: "equipment",
        subType: "fishingLure",
        attractPower: 1.2,
        rarityBonus: 0.1,
        description: "A lucky lure that attracts more fish.",
        quantity: 1
      });
    }
    
    return rewards;
  }
}

// Create singleton instance
const enhancedFishing = new EnhancedFishing();

export default enhancedFishing; 