/**
 * fishing-game-core-mechanics.js
 * Core fishing mechanics for Billy's Fishing Adventure
 * Contains the core gameplay methods for casting, fish catching, and challenges
 */

import SoundSystem from './fishing-game-sound.js';
import GameState from './fishing-game-state.js';
import weatherSystem from './game/weather-system.js';
import fishCatalog from './game/fish-catalog.js';

/**
 * Start casting the fishing line
 */
export function startCasting() {
  // Change game state
  this.state = 'casting';
  this.castPower = 0;
  this.castDirection = 1;
  
  // Update UI
  document.getElementById('cast-button').textContent = 'Set Power!';
  document.getElementById('cast-button').classList.add('active');
  
  // Show power meter
  const powerMeter = document.querySelector('.power-meter');
  if (powerMeter) {
    powerMeter.style.display = 'block';
  }
  
  // Play sound effect
  SoundSystem.playSound('cast', { volume: 0.7 });
}

/**
 * Finish casting the line with current power
 */
export function finishCasting() {
  // Calculate cast distance based on power
  const maxDistance = this.canvas.width * 0.8;
  const distance = (this.castPower / 100) * maxDistance;
  
  // Set hook position
  this.hookPosition = {
    x: 100 + distance,
    y: 140 + Math.random() * 30
  };
  
  // Change game state
  this.state = 'waiting';
  
  // Update UI
  document.getElementById('cast-button').textContent = 'Waiting...';
  document.getElementById('cast-button').disabled = true;
  
  // Hide power meter
  const powerMeter = document.querySelector('.power-meter');
  if (powerMeter) {
    powerMeter.style.display = 'none';
  }
  
  // Play sound effects
  SoundSystem.playSound('splash', { volume: 0.4 + (this.castPower / 100) * 0.6 });
  
  // Create splash effect
  this.createSplashEffect(this.hookPosition.x, this.hookPosition.y);
  
  // Show toast message
  const castQuality = this.getCastQualityMessage(this.castPower);
  this.showToast(castQuality.message, 'info', 2000);
}

/**
 * Get a quality message for the cast based on power
 * @param {number} power - Cast power
 * @returns {Object} Cast quality info
 */
export function getCastQualityMessage(power) {
  if (power < 20) {
    return { 
      quality: 'poor', 
      message: 'Poor cast! Try holding longer for more power.',
      modifier: 0.5
    };
  } else if (power < 40) {
    return { 
      quality: 'weak', 
      message: 'Weak cast. You can do better!',
      modifier: 0.7
    };
  } else if (power < 70) {
    return { 
      quality: 'good', 
      message: 'Good cast!',
      modifier: 1.0
    };
  } else if (power < 90) {
    return { 
      quality: 'great', 
      message: 'Great cast! Perfect spot for fishing.',
      modifier: 1.2
    };
  } else {
    return { 
      quality: 'perfect', 
      message: 'Perfect cast! Increased chance for rare fish!',
      modifier: 1.5
    };
  }
}

/**
 * Check for a fish bite
 * @param {number} deltaTime - Time since last frame in ms
 */
export function checkForBite(deltaTime) {
  if (this.state !== 'waiting') return;
  
  // Get current fishing conditions
  const player = GameState.getState('player');
  const fishing = GameState.getState('fishing');
  
  // Calculate base bite chance adjusted by environmental factors
  const baseChance = 0.0005 * deltaTime; // Base chance per millisecond
  const catchRateModifier = weatherSystem.getCatchRateModifier();
  
  // Apply equipment bonuses
  const rodBonus = player.equipment.rod.catchBonus || 0;
  const lureBonus = player.equipment.lure.attractPower || 1;
  
  // Apply cast quality bonus
  const castQuality = this.getCastQualityMessage(this.castPower);
  const castBonus = castQuality.modifier;
  
  // Calculate final chance
  const finalChance = baseChance * catchRateModifier * lureBonus * (1 + rodBonus) * castBonus;
  
  // Random check for bite
  if (Math.random() < finalChance) {
    this.fishBite();
  }
}

/**
 * Handle a fish bite event
 */
export function fishBite() {
  // Select a fish based on conditions
  const fish = this.selectFish();
  
  // Create appropriate challenge for this fish
  const challenge = this.createChallenge(fish);
  
  // Set active challenge
  this.activeChallenge = {
    fish,
    type: challenge.type,
    duration: challenge.duration,
    difficulty: challenge.difficulty,
    startTime: Date.now()
  };
  
  // Change game state
  this.state = 'challenge';
  
  // Set up challenge mechanics
  this.hookHasFish = true;
  this.fishResistance = fish.size * 10 + fish.rarity * 5;
  this.fishFatigue = 0;
  this.lineStrain = 0;
  this.reelProgress = 0;
  
  // Play sound effect
  SoundSystem.playSound('bite', { volume: 0.6 });
  
  // Create water ripple
  this.createWaterRipple(this.hookPosition.x, this.hookPosition.y);
  
  // Show challenge UI
  this.showChallengeUI(challenge.type, fish);
  
  // Show toast notification
  this.showToast(`Fish on! ${this.getChallengeDescription(challenge.type)}`, 'success', 3000);
  
  // Provide haptic feedback on mobile
  if (this.isMobile && this.vibrationSupported) {
    this.vibrate([100, 50, 100]);
  }
}

/**
 * Select a fish based on current conditions
 * @returns {Object} Selected fish
 */
export function selectFish() {
  // Get current conditions
  const conditions = {
    weather: weatherSystem.currentWeather,
    season: weatherSystem.currentSeason,
    timeOfDay: weatherSystem.currentTimeOfDay
  };
  
  // Get available fish for these conditions
  const fishing = GameState.getState('fishing');
  const availableFish = fishing.availableFish || fishCatalog.getAvailableFish(conditions);
  
  if (!availableFish || availableFish.length === 0) {
    // Fallback to full catalog if no available fish
    availableFish = fishCatalog.FISH_CATALOG;
  }
  
  // Get equipment bonuses that affect fish rarity
  const player = GameState.getState('player');
  const rarityBonus = player.equipment.lure.rarityBonus || 0;
  
  // Get environmental rarity bonus
  const environmentRarityBonus = weatherSystem.getRarityBonus();
  
  // Calculate combined bonus
  const totalRarityBonus = rarityBonus + environmentRarityBonus;
  
  // Determine rarity threshold with randomness
  // Higher rarity bonus = better chance at rare fish
  let rarityThreshold;
  const rarityRoll = Math.random();
  
  if (rarityRoll < 0.05 + totalRarityBonus * 0.2) {
    // 5-25% chance for legendary (rarity 5)
    rarityThreshold = 5;
  } else if (rarityRoll < 0.15 + totalRarityBonus * 0.3) {
    // 15-45% chance for epic (rarity 4)
    rarityThreshold = 4;
  } else if (rarityRoll < 0.35 + totalRarityBonus * 0.4) {
    // 35-75% chance for rare (rarity 3)
    rarityThreshold = 3;
  } else if (rarityRoll < 0.6 + totalRarityBonus * 0.3) {
    // 60-90% chance for uncommon (rarity 2) 
    rarityThreshold = 2;
  } else {
    // Remaining chance for common (rarity 1)
    rarityThreshold = 1;
  }
  
  // Filter fish by rarity threshold
  const possibleFish = availableFish.filter(fish => fish.rarity <= rarityThreshold);
  
  if (possibleFish.length === 0) {
    // Fallback to all fish if no matches
    return availableFish[Math.floor(Math.random() * availableFish.length)];
  }
  
  // Select random fish from possible catches
  return possibleFish[Math.floor(Math.random() * possibleFish.length)];
}

/**
 * Create a challenge based on fish type
 * @param {Object} fish - The fish to create challenge for
 * @returns {Object} Challenge configuration
 */
export function createChallenge(fish) {
  // Default challenge types
  const challengeTypes = ['timing', 'reeling', 'balancing', 'patience'];
  
  // Select challenge type based on fish properties
  let challengeType;
  let difficulty;
  let duration;
  
  // Check for special challenge in fish data
  if (fish.specialEffect && fish.specialEffect.challenge) {
    challengeType = fish.specialEffect.challenge;
    difficulty = 0.8 + (fish.rarity * 0.15);
    duration = 5000 + (fish.rarity * 1000);
  } else {
    // Select based on fish properties
    if (fish.size > 2.5) {
      // Big fish require strength
      challengeType = 'reeling';
      difficulty = 0.6 + (fish.size * 0.1);
      duration = 6000 + (fish.size * 1000);
    } else if (fish.rarity >= 4) {
      // Rare fish require precision
      challengeType = 'balancing';
      difficulty = 0.5 + (fish.rarity * 0.1);
      duration = 5000 + (fish.rarity * 800);
    } else if (fish.name.includes('Bass') || fish.name.includes('Pike')) {
      // Aggressive fish require quick timing
      challengeType = 'timing';
      difficulty = 0.5 + (fish.rarity * 0.1);
      duration = 4000 + (fish.rarity * 500);
    } else {
      // Default to patience for other fish
      challengeType = 'patience';
      difficulty = 0.4 + (fish.rarity * 0.1);
      duration = 4000 + (fish.rarity * 700);
    }
  }
  
  return {
    type: challengeType,
    difficulty: difficulty,
    duration: duration
  };
}

/**
 * Get description text for a challenge type
 * @param {string} challengeType - Type of challenge
 * @returns {string} Challenge description
 */
export function getChallengeDescription(challengeType) {
  switch (challengeType) {
    case 'timing':
      return "Click exactly when the marker aligns!";
    case 'reeling':
      return "Click rapidly to reel in without breaking the line!";
    case 'balancing':
      return "Keep the fish in the target zone!";
    case 'patience':
      return "Hold steady and don't move until the fish tires!";
    default:
      return "Catch the fish!";
  }
}

/**
 * Show the challenge UI for a specific challenge type
 * @param {string} challengeType - Type of challenge
 * @param {Object} fish - The fish being caught
 */
export function showChallengeUI(challengeType, fish) {
  // Show challenge overlay
  const overlay = document.getElementById('challenge-overlay');
  if (overlay) {
    overlay.style.display = 'flex';
  }
  
  // Set challenge title and description
  document.getElementById('challenge-title').textContent = `Fish On: ${fish.name}!`;
  document.getElementById('challenge-description').textContent = this.getChallengeDescription(challengeType);
  
  // Show the specific challenge UI based on type
  const challengeContainers = [
    'challenge-timing',
    'challenge-reeling',
    'challenge-balancing',
    'challenge-patience'
  ];
  
  // Hide all challenge containers first
  challengeContainers.forEach(id => {
    const container = document.getElementById(id);
    if (container) {
      container.style.display = 'none';
    }
  });
  
  // Show the relevant container
  const activeContainer = document.getElementById(`challenge-${challengeType}`);
  if (activeContainer) {
    activeContainer.style.display = 'block';
    
    // Initialize challenge-specific UI
    switch (challengeType) {
      case 'timing':
        this.initTimingChallenge(activeContainer);
        break;
      case 'reeling':
        this.initReelingChallenge(activeContainer);
        break;
      case 'balancing':
        this.initBalancingChallenge(activeContainer);
        break;
      case 'patience':
        this.initPatienceChallenge(activeContainer);
        break;
    }
  }
}

/**
 * Hide the challenge UI
 */
export function hideChallengeUI() {
  const overlay = document.getElementById('challenge-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

/**
 * Update the active challenge
 * @param {number} deltaTime - Time since last frame in ms
 */
export function updateChallenge(deltaTime) {
  if (!this.activeChallenge) return;
  
  // Update challenge timer
  this.challengeTimer += deltaTime;
  
  // Update challenge progress bar
  const progressFill = document.getElementById('challenge-progress-fill');
  if (progressFill) {
    const progress = Math.min(this.challengeTimer / this.activeChallenge.duration, 1);
    progressFill.style.width = `${progress * 100}%`;
    
    // Change color based on progress
    if (progress > 0.75) {
      progressFill.style.backgroundColor = '#F44336'; // Red at end
    } else if (progress > 0.5) {
      progressFill.style.backgroundColor = '#FFC107'; // Yellow in middle
    }
  }
  
  // Update based on challenge type
  switch (this.activeChallenge.type) {
    case 'timing':
      this.updateTimingChallenge(deltaTime);
      break;
    case 'reeling':
      this.updateReelingChallenge(deltaTime);
      break;
    case 'balancing':
      this.updateBalancingChallenge(deltaTime);
      break;
    case 'patience':
      this.updatePatienceChallenge(deltaTime);
      break;
  }
  
  // Check for challenge timeout
  if (this.challengeTimer >= this.activeChallenge.duration) {
    // Auto-fail if we reach the time limit
    this.completeChallenge(false);
  }
}

/**
 * Complete the current challenge
 * @param {boolean} success - Whether the challenge was successful
 */
export function completeChallenge(success) {
  // Hide challenge UI
  this.hideChallengeUI();
  
  if (success) {
    // Handle successful catch
    const fish = this.activeChallenge.fish;
    
    // Record catch in game state
    GameState.recordFishCatch(fish);
    
    // Play catch sound based on rarity
    SoundSystem.playCatchSound(fish.rarity);
    
    // Add experience and update collection
    this.addFisherXP(this.calculateCatchXP(fish));
    this.updateFishCollection(fish.name);
    
    // Update session stats
    this.sessionStats.catches++;
    this.sessionStats.totalValue += fish.value || 10;
    if (fish.rarity >= 3) {
      this.sessionStats.rareCatches++;
    }
    
    // Show the catch animation
    this.showCatchAnimation(fish);
    
    // Haptic feedback for successful catch
    if (this.isMobile && this.vibrationSupported) {
      this.vibrate([100, 50, 200]);
    }
  } else {
    // Handle failed catch
    this.showToast("The fish got away!", "error");
    
    // Play sound for failed catch
    SoundSystem.playSound('lineBreak');
    
    // Reset game state
    this.state = 'idle';
    this.activeChallenge = null;
    this.hookHasFish = false;
    
    // Enable cast button
    document.getElementById('cast-button').textContent = 'Cast Line';
    document.getElementById('cast-button').disabled = false;
    document.getElementById('cast-button').classList.remove('active');
    
    // Haptic feedback for lost fish
    if (this.isMobile && this.vibrationSupported) {
      this.vibrate([50, 50, 50]);
    }
  }
  
  // Update UI displays
  this.updateSessionStatsDisplay();
}

/**
 * Show the catch animation
 * @param {Object} fish - The caught fish
 */
export function showCatchAnimation(fish) {
  // Get the animation container
  const catchAnimation = document.getElementById('catch-animation');
  const catchReveal = document.getElementById('catch-reveal');
  
  if (!catchAnimation || !catchReveal) return;
  
  // Set fish details
  document.getElementById('caught-fish-name').textContent = fish.name;
  document.getElementById('caught-fish-rarity').textContent = this.getRarityText(fish.rarity);
  document.getElementById('caught-fish-value').textContent = `+${fish.value || 10} SurCoins`;
  
  // Show rarity stars
  const stars = '★'.repeat(fish.rarity);
  document.querySelector('.stars').textContent = stars;
  
  // Set appropriate color class based on rarity
  catchReveal.className = 'catch-reveal';
  catchReveal.classList.add(this.getRarityClass(fish.rarity));
  
  // Show the animation
  catchAnimation.style.display = 'flex';
  
  // Set fish image or placeholder
  const fishImage = document.getElementById('caught-fish-image');
  try {
    // Try to use AssetManager to get fish image
    // This assumes AssetManager has been imported at the top of the file
    if (typeof AssetManager !== 'undefined') {
      const img = AssetManager.getFishImage(fish.name);
      fishImage.innerHTML = '';
      fishImage.appendChild(img.cloneNode());
    } else {
      // Fall back to text
      fishImage.textContent = this.getFishEmoji(fish.rarity);
    }
  } catch (e) {
    console.error('Error setting fish image:', e);
    fishImage.textContent = this.getFishEmoji(fish.rarity);
  }
  
  // Update state
  this.state = 'catch_animation';
}

/**
 * Calculate XP for catching a fish
 * @param {Object} fish - The caught fish
 * @returns {number} XP earned
 */
export function calculateCatchXP(fish) {
  // Base XP based on rarity
  const baseXP = fish.rarity * 5;
  
  // Bonus for first time catching this species
  const firstCatchBonus = this.collectedFish.includes(fish.name) ? 0 : 10;
  
  // Bonus for special effects
  const specialBonus = (fish.specialEffect && fish.specialEffect.xpBonus) 
    ? fish.specialEffect.xpBonus 
    : 0;
  
  return baseXP + firstCatchBonus + specialBonus;
}

/**
 * Get rarity text for a fish
 * @param {number} rarity - Fish rarity (1-5)
 * @returns {string} Rarity text
 */
export function getRarityText(rarity) {
  switch (rarity) {
    case 5: return "Legendary";
    case 4: return "Epic";
    case 3: return "Rare";
    case 2: return "Uncommon";
    default: return "Common";
  }
}

/**
 * Get rarity class for CSS
 * @param {number} rarity - Fish rarity (1-5)
 * @returns {string} CSS class name
 */
export function getRarityClass(rarity) {
  switch (rarity) {
    case 5: return "legendary";
    case 4: return "epic";
    case 3: return "rare";
    case 2: return "uncommon";
    default: return "common";
  }
}

/**
 * Get emoji for fish based on rarity
 * @param {number} rarity - Fish rarity (1-5)
 * @returns {string} Fish emoji
 */
export function getFishEmoji(rarity) {
  switch (rarity) {
    case 5: return "🐋"; // Legendary
    case 4: return "🦈"; // Epic
    case 3: return "🐬"; // Rare
    case 2: return "🐡"; // Uncommon
    default: return "🐟"; // Common
  }
}

/**
 * Start fishing session
 */
export function startFishingSession() {
  if (this.fishingActive) return;
  
  console.log('[FishingGame] Starting fishing session');
  
  // Mark as active
  this.fishingActive = true;
  
  // Reset session stats
  this.sessionStats = {
    catches: 0,
    totalValue: 0,
    startTime: Date.now(),
    rareCatches: 0
  };
  
  // Generate fish
  this.generateFish();
  
  // Update available fish based on current conditions
  this.updateAvailableFish();
  
  // Update state in GameState
  GameState.startFishingSession();
  
  // Update UI
  this.updateSessionStatsDisplay();
  
  // Show weather conditions
  this.updateWeatherDisplay();
  
  // Show toast notification
  this.showToast("Fishing session started! Cast your line to begin.", "success");
  
  // Play ambient sounds based on current weather
  SoundSystem.startAmbientSound(
    weatherSystem.currentWeather, 
    weatherSystem.currentTimeOfDay
  );
}

/**
 * End current fishing session
 */
export function endFishing() {
  if (!this.fishingActive) return;
  
  console.log('[FishingGame] Ending fishing session');
  
  // Calculate session rewards
  const xpGained = this.calculateSessionXP(this.sessionStats);
  const coinsGained = this.sessionStats.totalValue;
  
  // Update player state
  const leveledUp = GameState.addPlayerXP(xpGained);
  GameState.addPlayerCurrency(coinsGained);
  
  // Mark session as ended
  this.fishingActive = false;
  
  // Update GameState
  GameState.endFishingSession();
  
  // Show summary
  this.showSessionSummary({
    catches: this.sessionStats.catches,
    totalValue: this.sessionStats.totalValue,
    xpGained: xpGained,
    leveledUp: leveledUp,
    session: this.sessionStats
  });
  
  // Show toast notification
  this.showToast(`Fishing ended! Gained ${xpGained} XP and ${coinsGained} coins.`, "info");
  
  // Stop ambient sounds
  SoundSystem.stopAmbientSounds();
  
  // Play sound effect
  SoundSystem.playSound('achievement');
  
  // Update UI
  this.updatePlayerInfo();
}

/**
 * Show session summary
 * @param {Object} summary - Session summary data
 */
export function showSessionSummary(summary) {
  // Show session summary overlay
  // This would typically be a custom UI element
  
  // For now, we'll just use a toast message
  const duration = summary.catches > 0 ? summary.catches * 1000 + 3000 : 3000;
  
  let message = `Fishing session complete!\n`;
  message += `Catches: ${summary.catches}\n`;
  message += `Value: ${summary.totalValue} SurCoins\n`;
  message += `XP: +${summary.xpGained}`;
  
  if (summary.leveledUp) {
    message += `\nLevel up! You are now level ${this.fisherLevel}`;
  }
  
  // Show the message
  this.showToast(message, "success", duration);
  
  // Check for achievements
  this.checkAchievements();
}

/**
 * Calculate session XP
 * @param {Object} stats - Session statistics
 * @returns {number} Total XP earned
 */
export function calculateSessionXP(stats) {
  // Base XP is 5 per catch
  const baseXP = stats.catches * 5;
  
  // Bonus for rare catches (10 XP per rare catch)
  const rareBonus = stats.rareCatches * 10;
  
  // Time bonus (1 XP per minute spent fishing, up to 30)
  const timeSpent = (Date.now() - stats.startTime) / 60000; // minutes
  const timeBonus = Math.min(Math.floor(timeSpent), 30);
  
  return baseXP + rareBonus + timeBonus;
} 