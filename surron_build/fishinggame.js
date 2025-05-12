/**
 * fishinggame.js
 * Main controller for the enhanced fishing game experience
 */

import { store } from './StateStackULTRA/store/gameStore.js';
import GameCore from './game/GameCore.js';
import enhancedFishing from './game/enhanced-fishing.js';
import weatherSystem from './game/weather-system.js';
import fishCatalog from './game/fish-catalog.js';
import { WEATHER_CONDITIONS, SEASONS, TIME_OF_DAY } from './game/weather-system.js';

class FishingGame {
  constructor() {
    // Canvas and rendering
    this.canvas = document.getElementById('fishing-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Game state
    this.state = 'idle'; // idle, casting, waiting, challenge, reeling
    this.fishingActive = false;
    this.castPower = 0;
    this.castDirection = 1;
    this.activeChallenge = null;
    this.lastCatch = null;
    this.gameLoopId = null;
    this.lastFrameTime = 0;
    
    // Environment
    this.waves = [];
    this.fish = [];
    this.hookPosition = { x: 100, y: 150 };
    this.hookHasFish = false;
    
    // Challenge state
    this.challengeScore = 0;
    this.challengeTimer = 0;
    this.challengeDuration = 0;
    
    // Initialize
    this.initializeEventListeners();
    this.initializeGame();
  }
  
  /**
   * Setup event listeners for buttons and interactions
   */
  initializeEventListeners() {
    // Casting button
    document.getElementById('cast-button').addEventListener('click', () => {
      if (this.state === 'idle') {
        this.startCasting();
      } else if (this.state === 'casting') {
        this.finishCasting();
      }
    });
    
    // End fishing button
    document.getElementById('end-fishing-button').addEventListener('click', () => {
      this.endFishing();
    });
    
    // Challenge interaction events
    document.getElementById('reel-button').addEventListener('click', () => {
      if (this.state === 'challenge' && this.activeChallenge?.type === 'reeling') {
        this.handleReelingClick();
      }
    });
    
    // Timing challenge click
    document.addEventListener('click', (e) => {
      if (this.state === 'challenge' && this.activeChallenge?.type === 'timing') {
        this.handleTimingClick();
      }
    });
    
    // Mouse move for balancing challenge
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.state === 'challenge' && this.activeChallenge?.type === 'balancing') {
        const rect = this.canvas.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        this.handleBalancingMove(mouseY / this.canvas.height);
      }
    });
    
    // Touch events for mobile
    this.canvas.addEventListener('touchmove', (e) => {
      if (this.state === 'challenge' && this.activeChallenge?.type === 'balancing') {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const touchY = e.touches[0].clientY - rect.top;
        this.handleBalancingMove(touchY / this.canvas.height);
      }
    });
    
    // Window resize handler
    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });
  }
  
  /**
   * Initialize the game and connect to enhanced fishing
   */
  initializeGame() {
    // Ensure canvas is properly sized
    this.resizeCanvas();
    
    // Start the fishing session with enhanced fishing
    this.startFishingSession();
    
    // Initialize weather display
    this.updateWeatherDisplay();
    
    // Setup weather listener
    weatherSystem.addEventListener('all', (event, data) => {
      this.updateWeatherDisplay();
    });
    
    // Start game loop
    this.lastFrameTime = performance.now();
    this.gameLoop(this.lastFrameTime);
  }
  
  /**
   * Resize canvas to fill container while maintaining aspect ratio
   */
  resizeCanvas() {
    const container = this.canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Set canvas size to match container while maintaining 4:3 aspect ratio
    this.canvas.width = containerWidth;
    this.canvas.height = containerWidth * 0.75; // 4:3 aspect ratio
    
    // Redraw the scene
    this.renderScene();
  }
  
  /**
   * Start the enhanced fishing session
   */
  startFishingSession() {
    if (this.fishingActive) return;
    
    // Start session with enhanced fishing
    const sessionData = enhancedFishing.startFishing();
    this.fishingActive = true;
    
    // Update UI with equipment info
    this.updateEquipmentDisplay(sessionData.equipment);
    
    // Generate some fish based on current conditions
    this.generateFish();
    
    // Show notification
    this.showToast("Fishing session started!", "success");
  }
  
  /**
   * End the current fishing session
   */
  endFishing() {
    if (!this.fishingActive) return;
    
    // End session with enhanced fishing
    const summary = enhancedFishing.endFishing();
    this.fishingActive = false;
    
    // Show summary toast
    this.showToast(`Fishing ended! You caught ${summary.stats.totalCatches} fish worth ${summary.stats.totalValue} SurCoins.`, "info");
    
    // Redirect back to Squad HQ
    setTimeout(() => {
      window.location.href = 'squad-hq.html';
    }, 3000);
  }
  
  /**
   * Start the casting process
   */
  startCasting() {
    this.state = 'casting';
    this.castPower = 0;
    this.castDirection = 1;
    
    // Update button text
    document.getElementById('cast-button').textContent = 'Set Power!';
  }
  
  /**
   * Finish casting with current power
   */
  finishCasting() {
    // Cast line with enhanced fishing
    const castResult = enhancedFishing.castLine(this.castPower, Math.random() * 45 + 67.5); // Cast at angle between 67.5 and 112.5 degrees
    
    // Set hook position based on power
    const distance = this.castPower * 4;
    this.hookPosition = {
      x: 100 + distance,
      y: 150
    };
    
    // Update state
    this.state = 'waiting';
    this.hookHasFish = false;
    
    // Update button text
    document.getElementById('cast-button').textContent = 'Recasting...';
    document.getElementById('cast-button').disabled = true;
    
    // Show toast
    this.showToast(`Cast line with ${this.castPower}% power!`, "info");
  }
  
  /**
   * Check for fish bite using enhanced fishing
   */
  checkForBite() {
    if (this.state !== 'waiting') return;
    
    const hasBite = enhancedFishing.checkForBite();
    
    if (hasBite) {
      // Get the active challenge
      const activeChallenge = enhancedFishing.activeChallenges[0];
      if (activeChallenge) {
        this.startChallenge(activeChallenge);
      }
    }
  }
  
  /**
   * Start a fishing challenge
   */
  startChallenge(challengeData) {
    this.state = 'challenge';
    this.activeChallenge = challengeData;
    this.challengeScore = 0;
    this.challengeTimer = 0;
    this.challengeDuration = challengeData.challenge.duration;
    this.hookHasFish = true;
    
    // Show challenge overlay
    const overlay = document.getElementById('challenge-overlay');
    overlay.style.display = 'flex';
    
    // Update challenge title and description
    document.getElementById('challenge-title').textContent = `Fish On! ${challengeData.fish.name}`;
    document.getElementById('challenge-description').textContent = this.getChallengeDescription(challengeData.challenge.type);
    
    // Show the specific challenge UI
    this.showChallengeUI(challengeData.challenge.type);
    
    // Play sound effect
    // TODO: Add sound effects
    
    // Show toast
    this.showToast(`${challengeData.fish.name} is biting! ${this.getChallengeDescription(challengeData.challenge.type)}`, "success");
  }
  
  /**
   * Get description text for challenge type
   */
  getChallengeDescription(challengeType) {
    switch(challengeType) {
      case 'timing':
        return 'Click at exactly the right moment!';
      case 'reeling':
        return 'Click rapidly to reel in the fish!';
      case 'balancing':
        return 'Keep the indicator in the target zone!';
      case 'patience':
        return 'Hold steady and wait for the right moment!';
      default:
        return 'Catch the fish!';
    }
  }
  
  /**
   * Show the UI for a specific challenge type
   */
  showChallengeUI(challengeType) {
    // Hide all challenge UIs first
    document.getElementById('challenge-timing').style.display = 'none';
    document.getElementById('challenge-reeling').style.display = 'none';
    document.getElementById('challenge-balancing').style.display = 'none';
    document.getElementById('challenge-patience').style.display = 'none';
    
    // Show the specific UI
    document.getElementById(`challenge-${challengeType}`).style.display = 'block';
    
    // Initialize challenge-specific elements
    switch(challengeType) {
      case 'timing':
        // Initialize timing challenge UI
        const timingIndicator = document.querySelector('.timing-indicator');
        timingIndicator.style.left = '0%';
        break;
      case 'reeling':
        // Initialize reeling challenge UI
        const reelingFill = document.querySelector('.reeling-fill');
        reelingFill.style.width = '0%';
        break;
      case 'balancing':
        // Initialize balancing challenge UI
        const balanceIndicator = document.querySelector('.balance-indicator');
        balanceIndicator.style.top = '50%';
        break;
      case 'patience':
        // Initialize patience challenge UI
        const patienceFill = document.querySelector('.patience-fill');
        patienceFill.style.width = '0%';
        break;
    }
  }
  
  /**
   * Complete the current challenge
   */
  completeChallenge(success) {
    if (this.state !== 'challenge' || !this.activeChallenge) return;
    
    // Hide challenge overlay
    document.getElementById('challenge-overlay').style.display = 'none';
    
    // Calculate final score (0-100)
    const finalScore = Math.min(100, this.challengeScore);
    
    // Complete challenge with enhanced fishing
    const result = enhancedFishing.completeChallenge(
      this.activeChallenge.fish.name,
      { score: finalScore }
    );
    
    if (result.success) {
      // Store last catch
      this.lastCatch = result.fish;
      
      // Update UI with catch info
      this.updateLastCatchDisplay(result.fish);
      
      // Show success message
      const qualityText = finalScore >= 90 ? 'Perfect' : 
                        finalScore >= 70 ? 'Great' : 
                        finalScore >= 50 ? 'Good' : 'Poor';
      
      this.showToast(`${qualityText} catch! ${result.fish.name} (${finalScore}% quality)`, "success");
    } else {
      // Show failure message
      this.showToast("The fish got away!", "error");
    }
    
    // Reset state
    this.state = 'idle';
    this.activeChallenge = null;
    this.hookHasFish = false;
    
    // Re-enable cast button
    document.getElementById('cast-button').textContent = 'Cast Line';
    document.getElementById('cast-button').disabled = false;
  }
  
  /**
   * Handle timing challenge click
   */
  handleTimingClick() {
    if (!this.activeChallenge || this.activeChallenge.challenge.type !== 'timing') return;
    
    // Get current position of timing indicator
    const timingIndicator = document.querySelector('.timing-indicator');
    const indicatorPos = parseFloat(timingIndicator.style.left) || 0;
    
    // Calculate score based on proximity to center (50%)
    const distance = Math.abs(indicatorPos - 50);
    this.challengeScore = Math.max(0, 100 - distance * 2);
    
    // Complete the challenge
    this.completeChallenge(true);
  }
  
  /**
   * Handle reeling challenge click
   */
  handleReelingClick() {
    if (!this.activeChallenge || this.activeChallenge.challenge.type !== 'reeling') return;
    
    // Increment score with each click (capped at 100)
    this.challengeScore = Math.min(100, this.challengeScore + 5);
    
    // Update reeling progress bar
    const reelingFill = document.querySelector('.reeling-fill');
    reelingFill.style.width = `${this.challengeScore}%`;
    
    // If we've reached max score, complete the challenge
    if (this.challengeScore >= 100) {
      this.completeChallenge(true);
    }
  }
  
  /**
   * Handle balancing challenge mouse movement
   */
  handleBalancingMove(normalizedY) {
    if (!this.activeChallenge || this.activeChallenge.challenge.type !== 'balancing') return;
    
    // Update indicator position
    const balanceIndicator = document.querySelector('.balance-indicator');
    balanceIndicator.style.top = `${normalizedY * 100}%`;
    
    // Check if in target zone (40-60%)
    const inTargetZone = normalizedY >= 0.4 && normalizedY <= 0.6;
    
    // Accrue score while in target zone
    if (inTargetZone) {
      this.challengeScore = Math.min(100, this.challengeScore + 0.5);
    } else {
      this.challengeScore = Math.max(0, this.challengeScore - 0.3);
    }
    
    // Update indicator color based on position
    balanceIndicator.style.backgroundColor = inTargetZone ? 'green' : 'red';
  }
  
  /**
   * Update weather display based on current weather system state
   */
  updateWeatherDisplay() {
    const conditions = weatherSystem.getCurrentConditions();
    if (!conditions) return;
    
    // Update weather icon
    const weatherIcon = document.getElementById('weather-icon');
    weatherIcon.textContent = this.getWeatherEmoji(conditions.weather.name);
    
    // Update weather info
    document.getElementById('weather-name').textContent = conditions.weather.name;
    document.getElementById('weather-time').textContent = `${conditions.timeOfDay.name}, ${conditions.season.name}`;
    document.getElementById('weather-description').textContent = conditions.weather.description;
    
    // Update weather effects in game
    this.updateWeatherEffects(conditions);
  }
  
  /**
   * Get emoji for weather condition
   */
  getWeatherEmoji(weather) {
    const weatherEmojis = {
      'Sunny': '☀️',
      'Cloudy': '☁️',
      'Rainy': '🌧️',
      'Stormy': '⛈️',
      'Foggy': '🌫️'
    };
    
    return weatherEmojis[weather] || '🌤️';
  }
  
  /**
   * Update visual effects based on weather
   */
  updateWeatherEffects(conditions) {
    // Implement weather visual effects here
    // This will be used in the renderScene method
  }
  
  /**
   * Update equipment display with current gear
   */
  updateEquipmentDisplay(equipment) {
    // Update rod info
    document.getElementById('rod-name').textContent = equipment.rod.name;
    document.getElementById('rod-quality').textContent = equipment.rod.quality;
    document.getElementById('rod-speed').textContent = equipment.rod.reelSpeed;
    
    // Update lure info
    document.getElementById('lure-name').textContent = equipment.lure.name;
    document.getElementById('lure-attract').textContent = equipment.lure.attractPower;
    document.getElementById('lure-rarity').textContent = `+${Math.round(equipment.lure.rarityBonus * 100)}%`;
  }
  
  /**
   * Update last catch display
   */
  updateLastCatchDisplay(fish) {
    // Hide no catch message
    document.getElementById('no-catch-message').style.display = 'none';
    
    // Show catch display
    const catchDisplay = document.getElementById('catch-display');
    catchDisplay.style.display = 'block';
    
    // Update catch info
    document.getElementById('catch-name').textContent = fish.name;
    document.getElementById('catch-rarity').textContent = this.getRarityText(fish.rarity);
    document.getElementById('catch-value').textContent = `${fish.value} SurCoins`;
    
    // Add rarity class for styling
    catchDisplay.className = `catch-display rarity-${fish.rarity}`;
  }
  
  /**
   * Get text representation of rarity
   */
  getRarityText(rarity) {
    const rarityTexts = ['', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
    return rarityTexts[rarity] || 'Common';
  }
  
  /**
   * Generate fish in the scene based on current conditions
   */
  generateFish() {
    // Clear existing fish
    this.fish = [];
    
    // Get available fish based on current conditions
    const conditions = {
      season: weatherSystem.currentSeason,
      timeOfDay: weatherSystem.currentTimeOfDay,
      weather: weatherSystem.currentWeather
    };
    
    const availableFish = fishCatalog.getAvailableFish(conditions);
    
    // Generate 5-10 fish with random positions
    const fishCount = Math.floor(Math.random() * 6) + 5;
    
    for (let i = 0; i < fishCount; i++) {
      // Randomly select a fish from available fish
      const fishType = availableFish[Math.floor(Math.random() * availableFish.length)];
      
      // Create fish object
      this.fish.push({
        type: fishType,
        x: Math.random() * this.canvas.width * 0.8 + this.canvas.width * 0.2,
        y: Math.random() * (this.canvas.height - 200) + 150,
        direction: Math.random() > 0.5 ? 1 : -1,
        speed: Math.random() * 0.5 + 0.2
      });
    }
  }
  
  /**
   * Main game loop
   */
  gameLoop(timestamp) {
    // Calculate delta time
    const deltaTime = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;
    
    // Update game state
    this.update(deltaTime);
    
    // Render the scene
    this.renderScene();
    
    // Continue the loop
    this.gameLoopId = requestAnimationFrame(this.gameLoop.bind(this));
  }
  
  /**
   * Update game state
   */
  update(deltaTime) {
    // Update based on game state
    switch(this.state) {
      case 'casting':
        // Update cast power
        this.castPower += this.castDirection * (deltaTime / 20);
        if (this.castPower >= 100) {
          this.castPower = 100;
          this.castDirection = -1;
        } else if (this.castPower <= 0) {
          this.castPower = 0;
          this.castDirection = 1;
        }
        break;
        
      case 'waiting':
        // Check for bite
        this.checkForBite();
        break;
        
      case 'challenge':
        // Update challenge timer
        this.challengeTimer += deltaTime;
        
        // Update challenge-specific logic
        this.updateChallengeLogic(deltaTime);
        
        // Check if challenge timed out
        if (this.challengeTimer >= this.challengeDuration) {
          this.completeChallenge(this.challengeScore >= 50);
        }
        break;
    }
    
    // Update fish positions
    this.updateFish(deltaTime);
    
    // Update waves
    this.updateWaves(deltaTime);
  }
  
  /**
   * Update challenge-specific logic
   */
  updateChallengeLogic(deltaTime) {
    if (!this.activeChallenge) return;
    
    const normalizedTime = this.challengeTimer / this.challengeDuration;
    
    switch(this.activeChallenge.challenge.type) {
      case 'timing':
        // Move timing indicator back and forth
        const timingIndicator = document.querySelector('.timing-indicator');
        const position = Math.sin(normalizedTime * Math.PI * 6) * 50 + 50;
        timingIndicator.style.left = `${position}%`;
        break;
        
      case 'patience':
        // Increase patience meter over time
        const patienceFill = document.querySelector('.patience-fill');
        patienceFill.style.width = `${normalizedTime * 100}%`;
        
        // Set challenge score based on progress
        this.challengeScore = normalizedTime * 100;
        break;
    }
  }
  
  /**
   * Update fish positions
   */
  updateFish(deltaTime) {
    // Move fish around
    this.fish.forEach(fish => {
      // Move fish based on direction and speed
      fish.x += fish.direction * fish.speed * (deltaTime / 16);
      
      // Occasionally change direction
      if (Math.random() < 0.01) {
        fish.direction *= -1;
      }
      
      // Keep fish within bounds
      if (fish.x < 0) {
        fish.x = 0;
        fish.direction = 1;
      } else if (fish.x > this.canvas.width) {
        fish.x = this.canvas.width;
        fish.direction = -1;
      }
    });
  }
  
  /**
   * Update wave animation
   */
  updateWaves(deltaTime) {
    // Create new waves occasionally
    if (Math.random() < 0.05) {
      this.waves.push({
        x: Math.random() * this.canvas.width,
        y: 120, // Water surface level
        radius: Math.random() * 10 + 5,
        maxRadius: Math.random() * 20 + 10,
        speed: Math.random() * 0.05 + 0.02
      });
    }
    
    // Update existing waves
    this.waves = this.waves.filter(wave => {
      // Expand wave
      wave.radius += wave.speed * deltaTime;
      
      // Remove if too large
      return wave.radius < wave.maxRadius;
    });
  }
  
  /**
   * Render the game scene
   */
  renderScene() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw sky
    this.drawSky();
    
    // Draw water
    this.drawWater();
    
    // Draw shore
    this.drawShore();
    
    // Draw waves
    this.drawWaves();
    
    // Draw fish
    this.drawFish();
    
    // Draw fishing rod and line if casting or waiting
    if (this.state === 'casting' || this.state === 'waiting' || this.state === 'challenge') {
      this.drawFishingRod();
    }
    
    // Draw UI elements based on game state
    this.drawStateUI();
  }
  
  /**
   * Draw the sky
   */
  drawSky() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, 120);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#4682B4');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, 120);
  }
  
  /**
   * Draw the water
   */
  drawWater() {
    const gradient = this.ctx.createLinearGradient(0, 120, 0, this.canvas.height);
    gradient.addColorStop(0, '#4682B4');
    gradient.addColorStop(1, '#104E8B');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 120, this.canvas.width, this.canvas.height - 120);
  }
  
  /**
   * Draw the shore
   */
  drawShore() {
    this.ctx.fillStyle = '#D2B48C';
    this.ctx.beginPath();
    this.ctx.moveTo(0, 120);
    this.ctx.lineTo(0, this.canvas.height);
    this.ctx.lineTo(100, this.canvas.height);
    this.ctx.lineTo(150, 120);
    this.ctx.closePath();
    this.ctx.fill();
  }
  
  /**
   * Draw waves on water surface
   */
  drawWaves() {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 2;
    
    this.waves.forEach(wave => {
      this.ctx.beginPath();
      this.ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
      this.ctx.stroke();
    });
  }
  
  /**
   * Draw fish in the water
   */
  drawFish() {
    this.fish.forEach(fish => {
      // Only draw fish if they're in the water
      if (fish.y > 120) {
        this.ctx.fillStyle = this.getFishColor(fish.type.rarity);
        
        // Draw fish shape
        this.ctx.save();
        this.ctx.translate(fish.x, fish.y);
        this.ctx.scale(fish.direction, 1);
        
        // Fish body
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 15, 8, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Tail
        this.ctx.beginPath();
        this.ctx.moveTo(-10, 0);
        this.ctx.lineTo(-20, -8);
        this.ctx.lineTo(-20, 8);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
      }
    });
  }
  
  /**
   * Get fish color based on rarity
   */
  getFishColor(rarity) {
    switch(rarity) {
      case 1: return '#6B8E23'; // Common - olive
      case 2: return '#4682B4'; // Uncommon - steel blue
      case 3: return '#9370DB'; // Rare - medium purple
      case 4: return '#FF8C00'; // Epic - dark orange
      case 5: return '#FF1493'; // Legendary - deep pink
      default: return '#6B8E23';
    }
  }
  
  /**
   * Draw fishing rod and line
   */
  drawFishingRod() {
    // Draw rod
    this.ctx.strokeStyle = '#8B4513';
    this.ctx.lineWidth = 5;
    this.ctx.beginPath();
    this.ctx.moveTo(80, this.canvas.height - 30);
    this.ctx.lineTo(60, 140);
    this.ctx.stroke();
    
    // Draw line
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(60, 140);
    this.ctx.lineTo(this.hookPosition.x, this.hookPosition.y);
    this.ctx.stroke();
    
    // Draw hook
    this.ctx.beginPath();
    this.ctx.arc(this.hookPosition.x, this.hookPosition.y, 3, 0, Math.PI * 2);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fill();
    
    // Draw fish on hook if caught
    if (this.hookHasFish) {
      this.ctx.fillStyle = this.getFishColor(this.activeChallenge?.fish.rarity || 1);
      this.ctx.beginPath();
      this.ctx.ellipse(this.hookPosition.x + 10, this.hookPosition.y, 15, 8, 0, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Fish tail
      this.ctx.beginPath();
      this.ctx.moveTo(this.hookPosition.x + 20, this.hookPosition.y);
      this.ctx.lineTo(this.hookPosition.x + 30, this.hookPosition.y - 8);
      this.ctx.lineTo(this.hookPosition.x + 30, this.hookPosition.y + 8);
      this.ctx.closePath();
      this.ctx.fill();
    }
  }
  
  /**
   * Draw UI elements based on current state
   */
  drawStateUI() {
    switch(this.state) {
      case 'idle':
        // Draw cast instruction
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Press "Cast Line" to begin fishing', this.canvas.width / 2, 50);
        break;
        
      case 'casting':
        // Draw power meter
        this.drawPowerMeter();
        break;
        
      case 'waiting':
        // Draw waiting message
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Waiting for a bite...', this.canvas.width / 2, 50);
        break;
    }
  }
  
  /**
   * Draw the casting power meter
   */
  drawPowerMeter() {
    // Draw meter background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(this.canvas.width / 2 - 100, 50, 200, 20);
    
    // Draw power level
    const powerColor = this.castPower < 30 ? '#FF6347' : 
                      this.castPower < 70 ? '#FFD700' : '#32CD32';
    
    this.ctx.fillStyle = powerColor;
    this.ctx.fillRect(this.canvas.width / 2 - 100, 50, this.castPower * 2, 20);
    
    // Draw power text
    this.ctx.fillStyle = 'white';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Power: ${Math.round(this.castPower)}%`, this.canvas.width / 2, 85);
  }
  
  /**
   * Display a toast notification
   */
  showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.backgroundColor = type === 'success' ? '#4CAF50' : 
                                type === 'error' ? '#F44336' : 
                                type === 'warning' ? '#FF9800' : '#2196F3';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '4px';
    toast.style.marginBottom = '10px';
    toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    
    toast.textContent = message;
    
    // Add to toast container
    const container = document.getElementById('toast-container');
    container.appendChild(toast);
    
    // Fade in
    setTimeout(() => {
      toast.style.opacity = '1';
    }, 10);
    
    // Remove after duration
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        container.removeChild(toast);
      }, 300);
    }, duration);
  }
}

// Initialize game when document is loaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Boot GameCore
    GameCore.boot().then(() => {
      // Initialize the fishing game
      window.fishingGame = new FishingGame();
      
      // Update player info
      updatePlayerInfo();
    }).catch(error => {
      console.error("Error booting GameCore:", error);
      showFallbackMessage("Failed to initialize game. Please try again later.");
    });
  } catch (error) {
    console.error("Fatal error initializing fishing game:", error);
    showFallbackMessage("Critical error. Please refresh the page and try again.");
  }
});

/**
 * Update player information display
 */
function updatePlayerInfo() {
  try {
    const playerState = GameCore.getPlayerState();
    
    // Update level
    document.getElementById('player-level').textContent = `Level ${playerState.level || 1}`;
    
    // Update currency
    document.getElementById('player-currency').textContent = `${playerState.currency || 0} SurCoins`;
  } catch (error) {
    console.error("Error updating player info:", error);
  }
}

/**
 * Show fallback message if game fails to load
 */
function showFallbackMessage(message) {
  const gameArea = document.querySelector('.game-area');
  if (gameArea) {
    gameArea.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: white; text-align: center; padding: 2rem;">
        <h2>Fishing Game Unavailable</h2>
        <p>${message}</p>
        <a href="squad-hq.html" class="back-button" style="margin-top: 1rem;">Return to Squad HQ</a>
      </div>
    `;
  }
} 