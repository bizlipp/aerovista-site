/**
 * fishing-game-core.js
 * Core game implementation for Billy's Fishing Adventure
 * Standalone version adapted from the original fishinggame.js
 */

// Import core systems
import GameState from './fishing-game-state.js';
import SoundSystem from './fishing-game-sound.js';
import AssetManager from './fishing-game-assets.js';
import weatherSystem, { WEATHER_CONDITIONS, SEASONS, TIME_OF_DAY } from './game/weather-system.js';
import fishCatalog from './game/fish-catalog.js';

/**
 * Main game class for the fishing mini-game
 */
class FishingGame {
  /**
   * Initialize the fishing game
   */
  constructor() {
    // Initialize main references
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
    
    // Player progression tracking (synced with GameState)
    this.fisherLevel = 1;
    this.fisherXP = 0;
    this.xpToNextLevel = 100;
    this.collectedFish = [];
    this.sessionsCompleted = 0;
    this.totalCatches = 0;
    this.uniqueSpeciesCaught = 0;
    
    // Enhanced mobile and haptic support
    this.isMobile = this.detectMobile();
    this.touchProps = {
      startY: 0,
      dragDistance: 0,
      isPowerMeterVisible: false,
      lastTapTime: 0,
      tapInterval: 0,
      tapStrength: 0
    };
    
    // Reeling mechanics
    this.fishResistance = 0;
    this.fishFatigue = 0;
    this.lineStrain = 0;
    this.reelProgress = 0;
    this.lineBreakThreshold = 100;
    this.fishEscapeThreshold = 100;
    this.vibrationSupported = "vibrate" in navigator;
    
    // Session stats
    this.sessionStats = {
      catches: 0,
      totalValue: 0,
      startTime: 0,
      rareCatches: 0
    };
    
    // UI state indicators
    this.stateChangeIndicators = {
      xpGain: 0,
      currencyGain: 0,
      lastNotification: null,
      showingReward: false
    };
    
    // Start initialization
    this.initialize();
  }
  
  /**
   * Initialize the game
   */
  initialize() {
    console.log('[FishingGame] Initializing game');
    
    // Load game state
    this.loadGameState();
    
    // Set up the canvas
    this.resizeCanvas();
    
    // Initialize event listeners
    this.initializeEventListeners();
    
    // Create initial game elements
    this.createInitialElements();
    
    // Start game loop
    this.startGameLoop();
    
    // Start fishing session
    this.startFishingSession();
    
    // Show intro dialog
    this.showBillyDialog("Ready to catch some fish? Cast your line!", 5000);
  }
  
  /**
   * Load game state from StateManager
   */
  loadGameState() {
    // Get player state
    const player = GameState.getState('player');
    if (player) {
      this.fisherLevel = player.level || 1;
      this.fisherXP = player.xp || 0;
      this.xpToNextLevel = player.xpToNextLevel || 100;
      this.collectedFish = player.collectedFish || [];
      this.uniqueSpeciesCaught = this.collectedFish.length;
    }
    
    // Get fishing state
    const fishing = GameState.getState('fishing');
    if (fishing) {
      this.totalCatches = fishing.catches?.length || 0;
      this.lastCatch = fishing.lastCatch;
    }
    
    // Get mission state
    const missions = GameState.getState('missions');
    this.activeMissions = missions?.active || [];
    
    // Update UI with loaded state
    this.updatePlayerInfo();
  }
  
  /**
   * Initialize all event listeners
   */
  initializeEventListeners() {
    console.log('[FishingGame] Setting up event listeners');
    
    // Desktop casting button
    document.getElementById('cast-button').addEventListener('click', () => {
      if (this.state === 'idle') {
        this.startCasting();
      } else if (this.state === 'casting') {
        this.finishCasting();
      }
    });
    
    // Mobile casting button
    const castTouchButton = document.getElementById('cast-touch-button');
    if (castTouchButton) {
      // Long press to start casting, release to finish
      castTouchButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (this.state === 'idle') {
          this.startCasting();
          this.touchProps.isPowerMeterVisible = true;
          document.querySelector('.power-meter').style.display = 'block';
          
          // Provide haptic feedback
          this.vibrate(50);
        }
      });
      
      castTouchButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (this.state === 'casting') {
          this.finishCasting();
          this.touchProps.isPowerMeterVisible = false;
          document.querySelector('.power-meter').style.display = 'none';
          
          // Provide haptic feedback based on cast power
          const vibrationStrength = Math.round(this.castPower * 1.5);
          this.vibrate(vibrationStrength);
        }
      });
    }
    
    // End fishing buttons
    document.getElementById('end-fishing-button').addEventListener('click', () => {
      this.endFishing();
    });
    
    document.getElementById('mobile-end-fishing').addEventListener('click', () => {
      this.endFishing();
    });
    
    // Challenge interaction events
    document.getElementById('reel-button').addEventListener('click', () => {
      if (this.state === 'challenge' && this.activeChallenge?.type === 'reeling') {
        this.handleReelingClick();
      }
    });
    
    // Canvas events
    this.canvas.addEventListener('click', (e) => {
      if (this.state === 'challenge' && this.activeChallenge?.type === 'timing') {
        this.handleTimingClick();
      }
    });
    
    // Enhanced mobile touch events
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handleTouchStart(e);
    });
    
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.handleTouchMove(e);
    });
    
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.handleTouchEnd(e);
    });
    
    // Mouse move for balancing challenge
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.state === 'challenge' && this.activeChallenge?.type === 'balancing') {
        const rect = this.canvas.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        this.handleBalancingMove(mouseY / this.canvas.height);
      }
    });
    
    // Window resize handler
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.isMobile = this.detectMobile();
      this.setupMobileUI();
    });
    
    // Weather change events
    weatherSystem.addEventListener('all', (event, data) => {
      this.updateWeatherDisplay();
      
      // Generate some ripples when weather changes
      if (event === 'weather') {
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            const x = Math.random() * this.canvas.width;
            const y = 120 + Math.random() * 20;
            this.createWaterRipple(x, y);
          }, i * 300);
        }
        
        // Update available fish
        this.updateAvailableFish();
      }
    });
    
    // Continue button for catch animation
    document.getElementById('continue-button').addEventListener('click', () => {
      document.getElementById('catch-animation').style.display = 'none';
      this.state = 'idle';
      
      // Re-enable cast button
      document.getElementById('cast-button').disabled = false;
      document.getElementById('cast-button').textContent = 'Cast Line';
    });
  }
  
  /**
   * Create initial game elements
   */
  createInitialElements() {
    // Create initial ripples
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const x = Math.random() * this.canvas.width;
        const y = 120 + Math.random() * 20;
        this.createWaterRipple(x, y);
      }, i * 500);
    }
    
    // Generate fish in the water
    this.generateFish();
    
    // Update UI displays
    this.updateWeatherDisplay();
    this.updateEquipmentDisplay();
    this.initializeFishCollection();
    
    // Setup mobile-specific UI
    this.setupMobileUI();
  }
  
  /**
   * Start the game loop
   */
  startGameLoop() {
    this.lastFrameTime = performance.now();
    this.gameLoopId = requestAnimationFrame(this.gameLoop.bind(this));
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
    
    // Render frame
    this.render();
    
    // Continue loop
    this.gameLoopId = requestAnimationFrame(this.gameLoop.bind(this));
  }
  
  /**
   * Update game state
   * @param {number} deltaTime - Time since last frame in ms
   */
  update(deltaTime) {
    // Update based on current state
    switch (this.state) {
      case 'idle':
        // Ambient updates (ripples, etc.)
        break;
        
      case 'casting':
        // Update cast power
        this.updateCastPower(deltaTime);
        break;
        
      case 'waiting':
        // Check for fish bite
        this.checkForBite(deltaTime);
        break;
        
      case 'challenge':
        // Update active challenge
        this.updateChallenge(deltaTime);
        break;
    }
    
    // Always update environment elements
    this.updateWaves(deltaTime);
    this.updateFish(deltaTime);
  }
  
  /**
   * Update the cast power during casting state
   * @param {number} deltaTime - Time since last frame
   */
  updateCastPower(deltaTime) {
    // Update power based on direction
    this.castPower += this.castDirection * 0.15 * (deltaTime / 16);
    
    // Reverse direction at limits
    if (this.castPower >= 100) {
      this.castPower = 100;
      this.castDirection = -1;
    } else if (this.castPower <= 0) {
      this.castPower = 0;
      this.castDirection = 1;
    }
    
    // Update power meter UI
    const powerFill = document.getElementById('power-meter-fill');
    if (powerFill) {
      powerFill.style.width = `${this.castPower}%`;
    }
  }
  
  /**
   * Render the game
   */
  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw environment (sky, water, shore)
    this.drawEnvironment();
    
    // Draw state-specific elements
    this.drawStateElements();
    
    // Draw UI overlay elements
    this.drawUI();
  }
  
  /**
   * Draw the environment (sky, water, shore)
   */
  drawEnvironment() {
    // Get current conditions
    const weather = weatherSystem.currentWeather;
    const timeOfDay = weatherSystem.currentTimeOfDay;
    
    // Draw sky
    this.drawSky(weather, timeOfDay);
    
    // Draw water
    this.drawWater(weather);
    
    // Draw shore
    this.drawShore();
    
    // Draw waves
    this.drawWaves();
    
    // Draw fish
    this.drawFish();
    
    // Draw weather effects
    this.drawWeatherEffects(weather);
  }
  
  /**
   * Draw state-specific elements
   */
  drawStateElements() {
    switch (this.state) {
      case 'idle':
        // Draw idle state (rod on shore)
        this.drawFishingRod(50, 180, 45);
        break;
        
      case 'casting':
        // Draw casting state (rod in casting position)
        this.drawFishingRod(50, 180, 20 + this.castPower * 0.25);
        break;
        
      case 'waiting':
        // Draw waiting state (rod and line in water)
        this.drawFishingRod(50, 180, 70);
        this.drawFishingLine(50, 180, this.hookPosition.x, this.hookPosition.y);
        this.drawHook(this.hookPosition.x, this.hookPosition.y);
        break;
        
      case 'challenge':
        // Draw challenge state (rod and line with fish)
        this.drawFishingRod(50, 180, 60);
        this.drawFishingLine(50, 180, this.hookPosition.x, this.hookPosition.y);
        this.drawHook(this.hookPosition.x, this.hookPosition.y);
        
        if (this.hookHasFish) {
          this.drawHookedFish(this.hookPosition.x, this.hookPosition.y);
        }
        break;
    }
  }
  
  /**
   * Draw UI overlay elements
   */
  drawUI() {
    // Draw power meter if in casting state
    if (this.state === 'casting') {
      this.drawPowerMeter();
    }
    
    // Draw challenge UI if in challenge state
    if (this.state === 'challenge') {
      this.drawChallengeUI();
    }
  }
  
  /**
   * Resize canvas to fit container
   */
  resizeCanvas() {
    const container = this.canvas.parentElement;
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;
    
    // Maintain fixed aspect ratio
    const targetHeight = this.canvas.width * 0.6; // 5:3 aspect ratio
    
    if (targetHeight <= container.clientHeight) {
      this.canvas.height = targetHeight;
    } else {
      this.canvas.width = container.clientHeight / 0.6;
      this.canvas.height = container.clientHeight;
    }
  }
  
  /**
   * Detect if user is on a mobile device
   */
  detectMobile() {
    return (window.innerWidth <= 768) || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  /**
   * Setup mobile-specific UI
   */
  setupMobileUI() {
    if (this.isMobile) {
      // Show touch controls
      document.querySelector('.touch-controls').style.display = 'flex';
      
      // Hide desktop controls
      document.getElementById('controls-widget').style.display = 'none';
    } else {
      // Hide touch controls
      document.querySelector('.touch-controls').style.display = 'none';
      
      // Show desktop controls
      document.getElementById('controls-widget').style.display = 'block';
    }
  }
  
  /**
   * Show a dialog message from Billy
   * @param {string} text - Dialog text to show
   * @param {number} duration - How long to show the dialog
   */
  showBillyDialog(text, duration = 4000) {
    const dialog = document.getElementById('billy-dialog');
    
    dialog.textContent = text;
    dialog.classList.add('visible');
    
    // Hide after duration
    setTimeout(() => {
      dialog.classList.remove('visible');
    }, duration);
  }
  
  /**
   * Show a toast notification
   * @param {string} message - Message to show
   * @param {string} type - Toast type (info, success, error)
   * @param {number} duration - How long to show the toast
   */
  showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add to container
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.classList.add('visible');
    }, 10);
    
    // Remove after duration
    setTimeout(() => {
      toast.classList.add('fadeout');
      setTimeout(() => {
        if (container.contains(toast)) {
          container.removeChild(toast);
        }
      }, 300);
    }, duration);
  }
  
  /**
   * Trigger device vibration if supported
   * @param {number} pattern - Vibration pattern
   */
  vibrate(pattern) {
    if (this.vibrationSupported) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        console.warn('[FishingGame] Vibration failed:', e);
      }
    }
  }
  
  /**
   * Update player information in UI
   */
  updatePlayerInfo() {
    document.getElementById('player-level').textContent = `Level ${this.fisherLevel}`;
    
    const player = GameState.getState('player');
    if (player) {
      document.getElementById('player-currency').textContent = `${player.currency} SurCoins`;
    }
  }
  
  /**
   * Update weather display in UI
   */
  updateWeatherDisplay() {
    const weatherDisplay = document.getElementById('weather-display');
    if (!weatherDisplay) return;
    
    const currentWeather = weatherSystem.currentWeather;
    const currentSeason = weatherSystem.currentSeason;
    const currentTimeOfDay = weatherSystem.currentTimeOfDay;
    
    const weatherInfo = WEATHER_CONDITIONS[currentWeather];
    const seasonInfo = SEASONS[currentSeason];
    const timeInfo = TIME_OF_DAY[currentTimeOfDay];
    
    weatherDisplay.innerHTML = `
      <div class="weather-item">
        <span class="weather-icon">${this.getWeatherEmoji(currentWeather)}</span>
        <span class="weather-name">${weatherInfo.name}</span>
      </div>
      <div class="weather-item">
        <span class="season-icon">🍃</span>
        <span class="season-name">${seasonInfo.name}</span>
      </div>
      <div class="weather-item">
        <span class="time-icon">${currentTimeOfDay === 'night' ? '🌙' : '☀️'}</span>
        <span class="time-name">${timeInfo.name}</span>
      </div>
    `;
  }
  
  /**
   * Get emoji for a weather condition
   * @param {string} weather - Weather condition
   * @returns {string} Emoji for the weather
   */
  getWeatherEmoji(weather) {
    switch (weather) {
      case 'sunny': return '☀️';
      case 'cloudy': return '☁️';
      case 'rainy': return '🌧️';
      case 'stormy': return '⛈️';
      case 'foggy': return '🌫️';
      default: return '❓';
    }
  }
  
  /**
   * Update equipment display in UI
   */
  updateEquipmentDisplay() {
    const gearDisplay = document.getElementById('gear-display');
    if (!gearDisplay) return;
    
    const player = GameState.getState('player');
    if (!player || !player.equipment) return;
    
    const rod = player.equipment.rod;
    const lure = player.equipment.lure;
    
    gearDisplay.innerHTML = `
      <div class="gear-item">
        <span class="gear-icon">🎣</span>
        <div class="gear-info">
          <div class="gear-name">${rod.name}</div>
          <div class="gear-stats">
            <div class="stat">Quality: ${rod.quality}</div>
            <div class="stat">Reel Speed: ${rod.reelSpeed}</div>
          </div>
        </div>
      </div>
      <div class="gear-item">
        <span class="gear-icon">🪝</span>
        <div class="gear-info">
          <div class="gear-name">${lure.name}</div>
          <div class="gear-stats">
            <div class="stat">Attract: ${lure.attractPower}</div>
            <div class="stat">Rarity: +${lure.rarityBonus * 100}%</div>
          </div>
        </div>
      </div>
    `;
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
    
    const availableFish = fishCatalog.getAvailableFish(conditions);
    GameState.updateAvailableFish(availableFish);
  }
}

export default FishingGame; 