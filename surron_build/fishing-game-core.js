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
    this.targetHookPosition = { x: 100, y: 150 }; // For smooth animation
    this.hookHasFish = false;
    this.animations = []; // Store active animations
    
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
    
    // Tutorial system
    this.tutorial = {
      active: true,
      step: 0,
      steps: [
        {
          message: "Welcome to Billy's Fishing Adventure! Let's learn the basics.",
          trigger: 'start',
          position: 'center'
        },
        {
          message: "First, let's cast your line. Click the 'Cast Line' button to start.",
          trigger: 'idle',
          position: 'buttonCast',
          highlightElementId: 'cast-button'
        },
        {
          message: "Now click again to set your casting power! The longer you wait, the farther you'll cast.",
          trigger: 'casting',
          position: 'buttonCast',
          highlightElementId: 'cast-button'
        },
        {
          message: "Great! Now wait for a fish to bite. Different fish are active based on weather and time of day.",
          trigger: 'waiting',
          position: 'hook'
        },
        {
          message: "A fish is biting! Complete the challenge to catch it!",
          trigger: 'challenge',
          position: 'center'
        },
        {
          message: "You caught a fish! Each fish has a different value and rarity.",
          trigger: 'catch_animation',
          position: 'center'
        },
        {
          message: "Your catches are recorded in your collection. Try to catch all types of fish!",
          trigger: 'collection',
          position: 'right',
          highlightElementId: 'collection-widget'
        },
        {
          message: "The weather affects what fish are available. Keep an eye on conditions!",
          trigger: 'weather',
          position: 'right',
          highlightElementId: 'current-conditions-widget'
        },
        {
          message: "That's the basics! Happy fishing!",
          trigger: 'end',
          position: 'center'
        }
      ],
      shown: {}, // Track which steps have been shown
      tooltipElement: null
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
        }
      });
      
      castTouchButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (this.state === 'casting') {
          this.finishCasting();
        }
      });
    }
    
    // End fishing button
    document.getElementById('end-fishing-button').addEventListener('click', () => {
      this.endFishing();
    });
    
    document.getElementById('mobile-end-fishing').addEventListener('click', () => {
      this.endFishing();
    });
    
    // Challenge interaction events
    // Timing challenge - attaching to document for wide click area
    document.addEventListener('click', (e) => {
      if (this.state === 'challenge' && this.activeChallenge?.type === 'timing') {
        this.handleTimingClick();
      }
    });
    
    // Reeling challenge - specific button
    const reelButton = document.getElementById('reel-challenge-button');
    if (reelButton) {
      reelButton.addEventListener('click', (e) => {
        if (this.state === 'challenge' && this.activeChallenge?.type === 'reeling') {
          this.handleReelingClick();
        }
      });
    }
    
    // Mouse move for balancing challenge
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.state === 'challenge' && this.activeChallenge?.type === 'balancing') {
        const rect = this.canvas.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        this.handleBalancingMove(mouseY / this.canvas.height);
      }
    });
    
    // Enhanced mobile touch events
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (this.state === 'challenge') {
        const touch = e.touches[0];
        if (this.activeChallenge?.type === 'timing') {
          this.handleTimingClick();
        } else if (this.activeChallenge?.type === 'reeling') {
          this.handleReelingTouch();
        }
      }
    });
    
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (this.state === 'challenge' && this.activeChallenge?.type === 'balancing') {
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const touchY = touch.clientY - rect.top;
        this.handleBalancingMove(touchY / this.canvas.height);
      }
    });
    
    // Window resize handler
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.isMobile = this.detectMobile();
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
    
    // Update animations
    this.updateAnimations(deltaTime);
    
    // Smooth hook movement
    this.updateHookPosition(deltaTime);
    
    // Check for tutorial steps
    this.checkTutorial();
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
    // Get current player state
    const playerState = GameState.getState('player');
    if (!playerState) return;
    
    // Update level display
    const levelDisplay = document.getElementById('player-level');
    if (levelDisplay) {
      levelDisplay.textContent = `Level ${playerState.level}`;
    }
    
    // Update currency display
    const currencyDisplay = document.getElementById('player-currency');
    if (currencyDisplay) {
      currencyDisplay.textContent = `${playerState.currency} SurCoins`;
    }
    
    // Update fisher level properties
    this.fisherLevel = playerState.level;
    this.fisherXP = playerState.xp;
    this.xpToNextLevel = playerState.xpToNextLevel;
    
    // Update collection count
    const collectionCount = document.getElementById('collection-count');
    if (collectionCount) {
      collectionCount.textContent = `(${playerState.collectedFish.length}/${fishCatalog.FISH_CATALOG.length})`;
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
  
  /**
   * Update animations
   * @param {number} deltaTime - Time since last frame
   */
  updateAnimations(deltaTime) {
    // Update and filter animations
    this.animations = this.animations.filter(animation => {
      // Update animation
      animation.currentTime += deltaTime;
      
      // Check if animation is complete
      if (animation.currentTime >= animation.duration) {
        // If animation has onComplete callback, call it
        if (animation.onComplete) {
          animation.onComplete();
        }
        return false; // Remove animation
      }
      
      // Calculate progress (0 to 1)
      const progress = animation.currentTime / animation.duration;
      
      // If animation has update callback, call it with progress
      if (animation.update) {
        animation.update(progress);
      }
      
      return true; // Keep animation
    });
  }
  
  /**
   * Create a new animation
   * @param {Object} options - Animation options
   * @returns {Object} Animation object
   */
  createAnimation(options) {
    const animation = {
      currentTime: 0,
      duration: options.duration || 1000,
      update: options.update,
      onComplete: options.onComplete
    };
    
    this.animations.push(animation);
    return animation;
  }
  
  /**
   * Update hook position with smooth animation
   * @param {number} deltaTime - Time since last frame
   */
  updateHookPosition(deltaTime) {
    // Smooth movement towards target position
    const speed = 0.1 * (deltaTime / 16);
    
    this.hookPosition.x += (this.targetHookPosition.x - this.hookPosition.x) * speed;
    this.hookPosition.y += (this.targetHookPosition.y - this.hookPosition.y) * speed;
  }
  
  /**
   * Finish casting the line with current power
   */
  finishCasting() {
    // Calculate cast distance based on power
    const maxDistance = this.canvas.width * 0.8;
    const distance = (this.castPower / 100) * maxDistance;
    
    // Set target hook position (actual position will animate smoothly)
    this.targetHookPosition = {
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
    
    // Create splash effect with dynamic size based on cast power
    this.createEnhancedSplashEffect(this.targetHookPosition.x, this.targetHookPosition.y, this.castPower);
    
    // Show toast message
    const castQuality = this.getCastQualityMessage(this.castPower);
    this.showToast(castQuality.message, 'info', 2000);
    
    // Check tutorial state for transition
    if (this.tutorial.active) {
      this.checkTutorial();
    }
  }
  
  /**
   * Create an enhanced splash effect
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} power - Cast power (0-100)
   */
  createEnhancedSplashEffect(x, y, power) {
    // Create multiple splash particles for a more dynamic effect
    const particleCount = 5 + Math.floor(power / 20);
    const baseSize = 20 + (power / 5);
    
    for (let i = 0; i < particleCount; i++) {
      // Create water splash particle
      const splash = document.createElement('div');
      splash.className = 'splash';
      
      // Random size variation
      const sizeVariation = 0.5 + (Math.random() * 1);
      const size = baseSize * sizeVariation;
      
      // Random position variation
      const posX = x + (Math.random() * 30 - 15);
      const posY = y + (Math.random() * 20 - 10);
      
      // Set styles
      splash.style.width = `${size}px`;
      splash.style.height = `${size}px`;
      splash.style.left = `${posX}px`;
      splash.style.top = `${posY}px`;
      splash.style.opacity = `${0.7 + Math.random() * 0.3}`;
      
      // Random animation duration
      const duration = 600 + Math.random() * 400;
      splash.style.animationDuration = `${duration}ms`;
      
      // Add to water ripples container
      const rippleContainer = document.getElementById('water-ripples');
      if (rippleContainer) {
        rippleContainer.appendChild(splash);
        
        // Remove after animation completes
        setTimeout(() => {
          if (rippleContainer.contains(splash)) {
            rippleContainer.removeChild(splash);
          }
        }, duration);
      }
    }
    
    // Also create water ripples
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.createWaterRipple(x, y);
      }, i * 150);
    }
  }
  
  /**
   * Check and show tutorial steps based on game state
   */
  checkTutorial() {
    if (!this.tutorial.active) return;
    
    // Get current game state as trigger
    let currentTrigger = this.state;
    
    // Find matching tutorial steps for current state
    const matchingSteps = this.tutorial.steps.filter(step => 
      step.trigger === currentTrigger && !this.tutorial.shown[step.trigger]
    );
    
    if (matchingSteps.length > 0) {
      // Show the first matching step
      this.showTutorialStep(matchingSteps[0]);
      // Mark as shown
      this.tutorial.shown[matchingSteps[0].trigger] = true;
    } else if (currentTrigger === 'idle' && this.tutorial.step === 0) {
      // Special case for starting tutorial
      this.showTutorialStep(this.tutorial.steps[0]);
      this.tutorial.shown['start'] = true;
      this.tutorial.step = 1;
    }
  }
  
  /**
   * Show a tutorial step
   * @param {Object} step - Tutorial step to show
   */
  showTutorialStep(step) {
    // Create or get tutorial tooltip element
    if (!this.tutorial.tooltipElement) {
      this.tutorial.tooltipElement = document.createElement('div');
      this.tutorial.tooltipElement.className = 'tutorial-tooltip';
      document.body.appendChild(this.tutorial.tooltipElement);
    }
    
    // Set tooltip content
    this.tutorial.tooltipElement.innerHTML = `
      <div class="tutorial-content">
        <div class="tutorial-message">${step.message}</div>
        <div class="tutorial-controls">
          <button class="tutorial-next">Got it!</button>
          <button class="tutorial-skip">Skip Tutorial</button>
        </div>
      </div>
      <div class="tutorial-arrow"></div>
    `;
    
    // Position tooltip
    this.positionTutorialTooltip(step);
    
    // Highlight target element if specified
    if (step.highlightElementId) {
      const targetElement = document.getElementById(step.highlightElementId);
      if (targetElement) {
        targetElement.classList.add('tutorial-highlight');
        
        // Remove highlight after tutorial step is dismissed
        const removeHighlight = () => {
          targetElement.classList.remove('tutorial-highlight');
        };
        
        // Store reference to remove function
        this.tutorial.removeHighlight = removeHighlight;
      }
    }
    
    // Handle next button
    const nextButton = this.tutorial.tooltipElement.querySelector('.tutorial-next');
    if (nextButton) {
      nextButton.addEventListener('click', () => {
        this.dismissTutorialStep();
      });
    }
    
    // Handle skip button
    const skipButton = this.tutorial.tooltipElement.querySelector('.tutorial-skip');
    if (skipButton) {
      skipButton.addEventListener('click', () => {
        this.endTutorial();
      });
    }
    
    // Show tooltip with animation
    setTimeout(() => {
      this.tutorial.tooltipElement.classList.add('visible');
    }, 10);
  }
  
  /**
   * Position tutorial tooltip based on target position
   * @param {Object} step - Tutorial step with position info
   */
  positionTutorialTooltip(step) {
    const tooltip = this.tutorial.tooltipElement;
    if (!tooltip) return;
    
    tooltip.className = 'tutorial-tooltip'; // Reset classes
    
    // Position based on target
    switch (step.position) {
      case 'center':
        tooltip.style.top = '50%';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translate(-50%, -50%)';
        break;
        
      case 'buttonCast':
        const castButton = document.getElementById('cast-button');
        if (castButton) {
          const rect = castButton.getBoundingClientRect();
          tooltip.style.top = `${rect.bottom + 10}px`;
          tooltip.style.left = `${rect.left + rect.width / 2}px`;
          tooltip.style.transform = 'translateX(-50%)';
          tooltip.classList.add('tooltip-top');
        } else {
          // Fallback to center
          tooltip.style.top = '50%';
          tooltip.style.left = '50%';
          tooltip.style.transform = 'translate(-50%, -50%)';
        }
        break;
        
      case 'hook':
        // Position near hook
        tooltip.style.top = `${this.hookPosition.y + 40}px`;
        tooltip.style.left = `${this.hookPosition.x}px`;
        tooltip.style.transform = 'translateX(-50%)';
        tooltip.classList.add('tooltip-top');
        break;
        
      case 'right':
        // Position on right side near sidebar
        if (step.highlightElementId) {
          const element = document.getElementById(step.highlightElementId);
          if (element) {
            const rect = element.getBoundingClientRect();
            tooltip.style.top = `${rect.top + rect.height / 2}px`;
            tooltip.style.left = `${rect.left - 10}px`;
            tooltip.style.transform = 'translate(-100%, -50%)';
            tooltip.classList.add('tooltip-right');
          } else {
            // Fallback
            tooltip.style.top = '50%';
            tooltip.style.right = '300px';
            tooltip.style.transform = 'translateY(-50%)';
            tooltip.classList.add('tooltip-right');
          }
        } else {
          // Fallback
          tooltip.style.top = '50%';
          tooltip.style.right = '300px';
          tooltip.style.transform = 'translateY(-50%)';
          tooltip.classList.add('tooltip-right');
        }
        break;
        
      default:
        // Default to center
        tooltip.style.top = '50%';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translate(-50%, -50%)';
    }
  }
  
  /**
   * Dismiss current tutorial step
   */
  dismissTutorialStep() {
    if (!this.tutorial.tooltipElement) return;
    
    // Hide tooltip
    this.tutorial.tooltipElement.classList.remove('visible');
    
    // Remove highlight if present
    if (this.tutorial.removeHighlight) {
      this.tutorial.removeHighlight();
      this.tutorial.removeHighlight = null;
    }
    
    // Increment step counter
    this.tutorial.step++;
    
    // Check if tutorial is complete
    if (this.tutorial.step >= this.tutorial.steps.length) {
      this.endTutorial();
    }
  }
  
  /**
   * End the tutorial completely
   */
  endTutorial() {
    this.tutorial.active = false;
    
    // Remove tooltip element
    if (this.tutorial.tooltipElement) {
      if (this.tutorial.tooltipElement.parentNode) {
        this.tutorial.tooltipElement.parentNode.removeChild(this.tutorial.tooltipElement);
      }
      this.tutorial.tooltipElement = null;
    }
    
    // Remove any active highlights
    if (this.tutorial.removeHighlight) {
      this.tutorial.removeHighlight();
      this.tutorial.removeHighlight = null;
    }
    
    // Save tutorial completion to state
    GameState.updateState('player', (player) => ({
      ...player,
      tutorialComplete: true
    }));
    
    // Show completion message
    this.showToast("Tutorial complete! Happy fishing!", "success");
  }

  /**
   * Start a fishing challenge
   * @param {Object} challengeData - Data for the challenge
   */
  startChallenge(challengeData) {
    this.state = 'challenge';
    this.activeChallenge = challengeData;
    this.challengeScore = 0;
    this.challengeTimer = 0;
    this.challengeDuration = challengeData.duration || 10000;
    this.hookHasFish = true;
    
    // Initialize challenge-specific state based on challenge type
    switch(challengeData.type) {
      case 'timing':
        this.initTimingChallenge(document.getElementById('challenge-timing'));
        break;
      case 'reeling':
        this.initReelingChallenge(document.getElementById('challenge-reeling'));
        break;
      case 'balancing':
        this.initBalancingChallenge(document.getElementById('challenge-balancing'));
        break;
      case 'patience':
        this.initPatienceChallenge(document.getElementById('challenge-patience'));
        break;
    }
    
    // Show challenge overlay
    const overlay = document.getElementById('challenge-overlay');
    overlay.style.display = 'flex';
    
    // Update challenge title and description
    document.getElementById('challenge-title').textContent = `Fish On! ${challengeData.fish.name}`;
    document.getElementById('challenge-description').textContent = this.getChallengeDescription(challengeData.type);
    
    // Show the specific challenge UI
    this.showChallengeUI(challengeData.type);
    
    // Play catch sound based on fish rarity
    const soundId = challengeData.fish.rarity >= 4 ? 'catchRare' : 
                   challengeData.fish.rarity >= 3 ? 'catchUncommon' : 'catchCommon';
    this.soundSystem.playSound(soundId, { volume: 0.6 });
    
    // Provide haptic feedback on challenge start
    this.vibrate([100, 50, 100]);
    
    // Show toast notification
    this.showToast(`${challengeData.fish.name} is biting! ${this.getChallengeDescription(challengeData.type)}`, "success");
  }

  /**
   * Get description text for challenge type
   * @param {string} challengeType - Type of challenge
   * @returns {string} Challenge description
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
   * @param {string} challengeType - Type of challenge
   */
  showChallengeUI(challengeType) {
    // Hide all challenge UIs first
    document.getElementById('challenge-timing').style.display = 'none';
    document.getElementById('challenge-reeling').style.display = 'none';
    document.getElementById('challenge-balancing').style.display = 'none';
    document.getElementById('challenge-patience').style.display = 'none';
    
    // Show the specific UI
    document.getElementById(`challenge-${challengeType}`).style.display = 'block';
  }

  /**
   * Complete the current challenge
   * @param {boolean} success - Whether the challenge was successful
   */
  completeChallenge(success) {
    if (this.state !== 'challenge' || !this.activeChallenge) return;
    
    // Hide challenge overlay
    document.getElementById('challenge-overlay').style.display = 'none';
    
    // Calculate final score (0-100)
    const finalScore = Math.min(100, this.challengeScore);
    
    if (success) {
      // Get the caught fish with detailed info
      const fish = this.activeChallenge.fish;
      
      // Calculate quality-based value bonus (50-100% of base value)
      const qualityMultiplier = 0.5 + (finalScore / 200);
      const adjustedValue = Math.round(fish.value * qualityMultiplier);
      
      // Create catch result with metadata
      const catchResult = {
        fish: fish,
        name: fish.name,
        rarity: fish.rarity,
        value: adjustedValue,
        quality: finalScore,
        timestamp: Date.now()
      };
      
      // 1. Record catch in game state
      GameState.recordFishCatch(catchResult);
      
      // 2. Add currency reward
      GameState.addPlayerCurrency(adjustedValue);
      
      // 3. Add XP reward based on rarity and quality
      const baseXP = fish.rarity * 5;
      const qualityBonus = Math.round(finalScore / 20); // 0-5 bonus XP based on quality
      const xpGained = baseXP + qualityBonus;
      
      // Apply XP and check for level up
      const leveledUp = GameState.addPlayerXP(xpGained);
      
      // 4. Check for achievements
      this.checkFishingAchievements();
      
      // 5. Update UI displays
      this.updateFishCollection(fish.name);
      this.updateLastCatchDisplay(catchResult);
      this.updatePlayerInfo();
      
      // 6. Update session stats
      this.sessionStats.catches++;
      this.sessionStats.totalValue += adjustedValue;
      if (fish.rarity >= 3) {
        this.sessionStats.rareCatches++;
      }
      this.updateSessionStatsDisplay();
      
      // 7. Show appropriate success message
      const qualityText = finalScore >= 90 ? 'Perfect' : 
                         finalScore >= 70 ? 'Great' : 
                         finalScore >= 50 ? 'Good' : 'Poor';
      
      this.showToast(`${qualityText} catch! ${fish.name} (+${xpGained} XP, +${adjustedValue} coins)`, "success");
      
      // 8. Handle level up notification if needed
      if (leveledUp) {
        this.showToast(`Level Up! You are now level ${this.fisherLevel}!`, "success", 5000);
        
        // Create level up visual effect
        const levelUpEffect = document.createElement('div');
        levelUpEffect.className = 'level-up-effect';
        document.body.appendChild(levelUpEffect);
        
        // Remove after animation completes
        setTimeout(() => {
          if (document.body.contains(levelUpEffect)) {
            document.body.removeChild(levelUpEffect);
          }
        }, 1500);
      }
      
      // 9. Check if this is a first-time catch of this species
      const isNewSpecies = !this.collectedFish.includes(fish.name);
      if (isNewSpecies) {
        this.uniqueSpeciesCaught++;
        this.showToast(`New species discovered: ${fish.name}!`, "success", 3000);
        
        // Show a special message from Billy
        this.showBillyDialog(`Wow! You caught a ${this.getRarityText(fish.rarity).toLowerCase()} ${fish.name}! Adding it to your collection!`, 5000);
      }
      
      // 10. Save game state
      GameState.saveGameState();
      
      // 11. Show catch animation
      this.showCatchAnimation(catchResult);
    } else {
      // Handle failed catch
      this.showToast(`The ${this.activeChallenge.fish.name} got away!`, "error");
      SoundSystem.playSound('lineBreak', { volume: 0.6 });
      
      // Reset state
      this.returnToIdle();
    }
    
    // Reset challenge state
    this.activeChallenge = null;
  }

  /**
   * Check for fishing achievements after catching a fish
   */
  checkFishingAchievements() {
    const playerState = GameState.getState('player');
    const achievements = playerState.achievements;
    
    // First Catch achievement
    if (!achievements.firstCatch && this.totalCatches >= 1) {
      GameState.updateAchievement('firstCatch', true);
      this.showToast("Achievement Unlocked: First Catch!", "success", 3000);
    }
    
    // Variety Fisher (5 unique species)
    if (!achievements.varietyFisher && this.uniqueSpeciesCaught >= 5) {
      GameState.updateAchievement('varietyFisher', true);
      this.showToast("Achievement Unlocked: Variety Fisher!", "success", 3000);
      
      // Bonus reward for achievement
      GameState.addPlayerCurrency(100);
      this.showToast("+100 SurCoins bonus for Variety Fisher achievement!", "success", 3000);
    }
    
    // Master Angler (10 unique species)
    if (!achievements.masterAngler && this.uniqueSpeciesCaught >= 10) {
      GameState.updateAchievement('masterAngler', true);
      this.showToast("Achievement Unlocked: Master Angler!", "success", 3000);
      
      // Bonus reward for achievement
      GameState.addPlayerCurrency(250);
      this.showToast("+250 SurCoins bonus for Master Angler achievement!", "success", 3000);
    }
    
    // Collection Complete
    const totalFishSpecies = fishCatalog.FISH_CATALOG.length;
    if (!achievements.collectionComplete && this.uniqueSpeciesCaught >= totalFishSpecies) {
      GameState.updateAchievement('collectionComplete', true);
      this.showToast("Achievement Unlocked: Collection Complete!", "success", 5000);
      
      // Major bonus reward for completing collection
      GameState.addPlayerCurrency(1000);
      GameState.addPlayerXP(500);
      this.showToast("+1000 SurCoins and +500 XP bonus for completing the collection!", "success", 5000);
    }
  }

  /**
   * Return the game to idle state
   */
  returnToIdle() {
    // Reset game state
    this.state = 'idle';
    this.hookHasFish = false;
    this.activeChallenge = null;
    this.challengeScore = 0;
    this.challengeTimer = 0;
    
    // Reset UI elements
    const challengeOverlay = document.getElementById('challenge-overlay');
    if (challengeOverlay) {
      challengeOverlay.style.display = 'none';
    }
    
    // Reset any active timers
    if (this.challengeInterval) {
      clearInterval(this.challengeInterval);
      this.challengeInterval = null;
    }
    
    // Reset power meter
    const powerMeter = document.getElementById('power-meter-fill');
    if (powerMeter) {
      powerMeter.style.width = '0%';
    }
    
    // Enable casting button
    const castButton = document.getElementById('cast-button');
    if (castButton) {
      castButton.disabled = false;
      castButton.textContent = 'Cast Line';
    }
    
    // Reset hook position
    this.hookPosition = { x: this.canvas.width / 2, y: this.canvas.height / 3 };
    
    // Play ambient sound
    SoundSystem.playSound('ambient', { loop: true, volume: 0.3 });
  }

  /**
   * Update session stats display
   */
  updateSessionStatsDisplay() {
    // Update session catch count
    const sessionCatches = document.getElementById('session-catches');
    if (sessionCatches) {
      sessionCatches.textContent = this.sessionStats.catches;
    }
    
    // Update session value
    const sessionValue = document.getElementById('session-value');
    if (sessionValue) {
      sessionValue.textContent = this.sessionStats.totalValue;
    }
    
    // Update catch display visibility
    const noCatchMessage = document.getElementById('no-catch-message');
    const catchDisplay = document.getElementById('catch-display');
    
    if (this.sessionStats.catches > 0) {
      if (noCatchMessage) noCatchMessage.style.display = 'none';
      if (catchDisplay) catchDisplay.style.display = 'block';
    }
    
    // If there are rare catches, add a special indicator
    if (this.sessionStats.rareCatches > 0) {
      const catchHistory = document.getElementById('catch-history');
      if (catchHistory && !catchHistory.querySelector('.rare-catch-indicator')) {
        const rareIndicator = document.createElement('div');
        rareIndicator.className = 'rare-catch-indicator';
        rareIndicator.innerHTML = `<span class="rare-star">★</span> You've caught ${this.sessionStats.rareCatches} rare fish!`;
        catchHistory.prepend(rareIndicator);
      }
    }
  }

  /**
   * Start the casting process
   */
  startCasting() {
    // Change state to casting
    this.state = 'casting';
    this.castPower = 0;
    this.castDirection = 1;
    
    // Update UI
    const castButton = document.getElementById('cast-button');
    if (castButton) {
      castButton.textContent = 'Set Power';
    }
    
    // Show power meter
    const powerMeter = document.querySelector('.power-meter');
    if (powerMeter) {
      powerMeter.style.display = 'block';
    }
    
    // Show instruction toast for new players
    if (this.totalCatches < 3) {
      this.showToast("Click again to set casting power!", "info", 2000);
    }
    
    // Mobile-specific feedback
    if (this.isMobile) {
      // Show touch power meter
      const touchPowerMeter = document.querySelector('.power-meter');
      if (touchPowerMeter) {
        touchPowerMeter.style.display = 'block';
      }
      
      // Haptic feedback
      this.vibrate(50);
      
      // Update touch button
      const touchButton = document.getElementById('cast-touch-button');
      if (touchButton) {
        touchButton.textContent = 'RELEASE';
      }
    }
    
    // Play sound effect
    SoundSystem.playSound('rodPrep', { volume: 0.3 });
    
    // Rod preparation animation
    this.createAnimation({
      duration: 500,
      update: (progress) => {
        // Rod preparation animation could be handled in the drawing code
        // This is just to track the animation
      }
    });
  }

  /**
   * Check for fish bite while waiting
   * @param {number} deltaTime - Time since last frame
   */
  checkForBite(deltaTime) {
    // If we're not in waiting state, don't check
    if (this.state !== 'waiting') return;
    
    // Get current conditions
    const conditions = {
      weather: weatherSystem.currentWeather,
      season: weatherSystem.currentSeason,
      timeOfDay: weatherSystem.currentTimeOfDay
    };
    
    // Get player equipment
    const player = GameState.getState('player');
    const equipment = player?.equipment || {
      rod: { quality: 1, catchBonus: 0 },
      lure: { attractPower: 1, rarityBonus: 0 }
    };
    
    // Calculate bite probability based on various factors
    // Base chance adjusted by equipment quality and environmental factors
    const baseChancePerSecond = 0.15; // 15% chance per second
    const equipmentMultiplier = 1 + (equipment.rod.catchBonus / 10) + (equipment.lure.attractPower / 10);
    const weatherMultiplier = this.getWeatherBiteMultiplier(conditions.weather);
    const timeMultiplier = conditions.timeOfDay === 'dawn' || conditions.timeOfDay === 'dusk' ? 1.2 : 1.0;
    
    // Calculate final chance per frame
    const chancePerFrame = baseChancePerSecond * equipmentMultiplier * weatherMultiplier * timeMultiplier * (deltaTime / 1000);
    
    // Random check for bite
    if (Math.random() < chancePerFrame) {
      this.triggerBite();
    }
    
    // Create occasional ripples around hook for visual interest
    if (Math.random() < 0.01) {
      this.createWaterRipple(
        this.hookPosition.x + (Math.random() * 40 - 20),
        this.hookPosition.y + (Math.random() * 20 - 10)
      );
    }
    
    // Add occasional hook movement to simulate water motion
    if (Math.random() < 0.05) {
      this.targetHookPosition.x += Math.random() * 2 - 1;
      this.targetHookPosition.y += Math.random() * 1 - 0.5;
    }
  }

  /**
   * Trigger a fish bite and start challenge
   */
  triggerBite() {
    // Don't trigger if we're not in waiting state
    if (this.state !== 'waiting') return;
    
    // Select a fish based on current conditions
    const fish = this.selectRandomFish();
    
    // Create challenge based on fish properties
    const challengeType = this.selectChallengeType(fish);
    const challengeDifficulty = 0.5 + (fish.rarity * 0.1); // 0.6-1.0 based on rarity
    
    const challengeData = {
      type: challengeType,
      fish: fish,
      difficulty: challengeDifficulty,
      duration: 5000 + (fish.rarity * 1000)
    };
    
    // Visual and sound cues for bite
    this.createWaterRipple(this.hookPosition.x, this.hookPosition.y);
    
    // Add slight delay before starting challenge
    setTimeout(() => {
      // Add more ripples and effects
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          this.createWaterRipple(
            this.hookPosition.x + (Math.random() * 30 - 15),
            this.hookPosition.y + (Math.random() * 15 - 7)
          );
        }, i * 100);
      }
      
      // Create fish tugging animation
      const hookElement = document.createElement('div');
      hookElement.className = 'fish-tugging';
      hookElement.style.position = 'absolute';
      hookElement.style.left = `${this.hookPosition.x}px`;
      hookElement.style.top = `${this.hookPosition.y}px`;
      hookElement.style.width = '30px';
      hookElement.style.height = '30px';
      hookElement.style.borderRadius = '50%';
      
      const rippleContainer = document.getElementById('water-ripples');
      if (rippleContainer) {
        rippleContainer.appendChild(hookElement);
        
        // Remove after animation
        setTimeout(() => {
          if (rippleContainer.contains(hookElement)) {
            rippleContainer.removeChild(hookElement);
          }
        }, 500);
      }
      
      // Mobile-specific feedback
      if (this.isMobile && this.vibrationSupported) {
        // More intense vibration for higher rarity fish
        const intensity = 50 + (fish.rarity * 20);
        this.vibrate([intensity, 50, intensity]);
      }
      
      // Start the challenge
      this.startChallenge(challengeData);
    }, 300);
  }

  /**
   * Get weather bite chance multiplier
   * @param {string} weather - Current weather condition
   * @returns {number} - Multiplier for bite chance
   */
  getWeatherBiteMultiplier(weather) {
    switch (weather) {
      case 'sunny': return 1.0;
      case 'cloudy': return 1.1;
      case 'rainy': return 1.3;
      case 'stormy': return 0.8;
      case 'foggy': return 0.9;
      default: return 1.0;
    }
  }

  /**
   * Select a random fish based on current conditions
   * @returns {Object} Selected fish
   */
  selectRandomFish() {
    // Get current conditions
    const conditions = {
      weather: weatherSystem.currentWeather,
      season: weatherSystem.currentSeason,
      timeOfDay: weatherSystem.currentTimeOfDay
    };
    
    // Get player equipment for rarity bonus
    const player = GameState.getState('player');
    const rarityBonus = player?.equipment?.lure?.rarityBonus || 0;
    
    // Get fish available in these conditions
    const availableFish = fishCatalog.getAvailableFish(conditions);
    
    if (!availableFish || availableFish.length === 0) {
      // Fallback to some default fish if none available
      return {
        name: "Bluegill",
        rarity: 1,
        value: 10,
        size: 1.0
      };
    }
    
    // Apply rarity boost from equipment
    const rarityRoll = Math.random() + (rarityBonus * 0.2);
    
    // Select fish based on rarity roll
    if (rarityRoll > 0.98) {
      // Legendary fish (5%)
      const legendaryFish = availableFish.filter(f => f.rarity === 5);
      if (legendaryFish.length > 0) {
        return legendaryFish[Math.floor(Math.random() * legendaryFish.length)];
      }
    } else if (rarityRoll > 0.9) {
      // Epic fish (8%)
      const epicFish = availableFish.filter(f => f.rarity === 4);
      if (epicFish.length > 0) {
        return epicFish[Math.floor(Math.random() * epicFish.length)];
      }
    } else if (rarityRoll > 0.7) {
      // Rare fish (20%)
      const rareFish = availableFish.filter(f => f.rarity === 3);
      if (rareFish.length > 0) {
        return rareFish[Math.floor(Math.random() * rareFish.length)];
      }
    } else if (rarityRoll > 0.4) {
      // Uncommon fish (30%)
      const uncommonFish = availableFish.filter(f => f.rarity === 2);
      if (uncommonFish.length > 0) {
        return uncommonFish[Math.floor(Math.random() * uncommonFish.length)];
      }
    }
    
    // Common fish (default)
    const commonFish = availableFish.filter(f => f.rarity === 1);
    if (commonFish.length > 0) {
      return commonFish[Math.floor(Math.random() * commonFish.length)];
    }
    
    // Final fallback - return any fish
    return availableFish[Math.floor(Math.random() * availableFish.length)];
  }

  /**
   * Select appropriate challenge type based on fish properties
   * @param {Object} fish - The fish that bit
   * @returns {string} Challenge type
   */
  selectChallengeType(fish) {
    // Different fish may trigger different challenge types
    // based on their characteristics
    if (fish.rarity >= 4) {
      // Legendary and epic fish need precise timing
      return 'timing';
    } else if (fish.size > 2.0) {
      // Big fish require strength
      return 'reeling';
    } else if (fish.rarity === 3) {
      // Rare fish require balance
      return 'balancing';
    }
    
    // Default challenge types by fish rarity
    const challengeTypes = ['timing', 'reeling', 'balancing', 'patience'];
    return challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
  }

  /**
   * Handle timing challenge click/tap
   */
  handleTimingClick() {
    if (this.state !== 'challenge' || this.activeChallenge?.type !== 'timing') return;
    
    // Get current position of indicator and target
    const indicator = document.querySelector('.timing-indicator');
    const target = document.querySelector('.timing-target');
    
    if (!indicator || !target) return;
    
    // Get positions
    const indicatorLeft = parseFloat(indicator.style.left) || 0;
    const targetLeft = 40;  // Target is at 40% (from CSS)
    const targetWidth = 20; // Target is 20% wide (from CSS)
    
    // Calculate distance from center of target (ideal is 0)
    const distance = Math.abs(indicatorLeft - (targetLeft + targetWidth/2));
    
    // Calculate score based on distance (0-100)
    let score = 0;
    if (distance <= targetWidth/2) {
      // Inside target zone - proportional score based on distance to center
      const perfectScore = 100;
      const normalizedDistance = distance / (targetWidth/2);
      score = perfectScore * (1 - normalizedDistance * 0.5);
      
      // Visual feedback
      const feedbackClass = score > 90 ? 'perfect-hit' : score > 70 ? 'good-hit' : 'poor-hit';
      indicator.classList.add(feedbackClass);
      setTimeout(() => indicator.classList.remove(feedbackClass), 500);
      
      // Feedback message
      const qualityText = score > 90 ? 'Perfect!' : score > 70 ? 'Good!' : 'OK!';
      this.showToast(qualityText, score > 70 ? 'success' : 'info', 1000);
      
      // Success - complete challenge
      this.challengeScore = score;
      
      // Add slight delay for visual feedback
      setTimeout(() => {
        this.completeChallenge(true);
      }, 500);
      
      // Haptic feedback
      if (this.vibrationSupported) {
        if (score > 90) {
          this.vibrate([30, 50, 100]);
        } else if (score > 70) {
          this.vibrate([30, 50, 30]);
        } else {
          this.vibrate(30);
        }
      }
    } else {
      // Outside target zone - failure
      indicator.classList.add('poor-hit');
      setTimeout(() => indicator.classList.remove('poor-hit'), 500);
      this.showToast('Missed!', 'error', 1000);
      
      // Haptic feedback for miss
      if (this.vibrationSupported) {
        this.vibrate([10, 30, 10]);
      }
      
      setTimeout(() => {
        this.completeChallenge(false);
      }, 500);
    }
  }

  /**
   * Handle reeling challenge click
   */
  handleReelingClick() {
    if (this.state !== 'challenge' || this.activeChallenge?.type !== 'reeling') return;
    
    // Increase reel progress
    const reelingStrength = 5;
    this.reelProgress += reelingStrength;
    
    // Update visual indicator
    const reelingFill = document.querySelector('.reeling-fill');
    if (reelingFill) {
      const fillPercent = Math.min(100, this.reelProgress);
      reelingFill.style.width = `${fillPercent}%`;
    }
    
    // Check for success
    if (this.reelProgress >= 100) {
      // Success - calculate score based on how many clicks were needed
      const clickEfficiency = Math.min(1, this.idealClicks / this.clickCount);
      this.challengeScore = Math.round(clickEfficiency * 100);
      
      // Visual feedback
      const feedbackClass = this.challengeScore > 90 ? 'perfect-hit' : this.challengeScore > 70 ? 'good-hit' : 'poor-hit';
      document.querySelector('.reeling-meter').classList.add(feedbackClass);
      
      // Complete the challenge
      setTimeout(() => {
        this.completeChallenge(true);
      }, 500);
    }
    
    // Increase click count
    this.clickCount = (this.clickCount || 0) + 1;
    
    // Haptic feedback
    if (this.vibrationSupported) {
      this.vibrate(20);
    }
  }

  /**
   * Handle reeling challenge on touch devices
   * Optimized for rapid tapping on mobile
   */
  handleReelingTouch() {
    // Same as click but with additional touch-specific handling
    this.handleReelingClick();
    
    // Add animation feedback for touch
    const button = document.querySelector('.reeling-button');
    if (button) {
      button.classList.add('touch-active');
      setTimeout(() => button.classList.remove('touch-active'), 100);
    }
  }

  /**
   * Handle balancing challenge movement
   * @param {number} position - Y position normalized (0-1)
   */
  handleBalancingMove(position) {
    if (this.state !== 'challenge' || this.activeChallenge?.type !== 'balancing') return;
    
    // Update indicator position
    const indicator = document.querySelector('.balance-indicator');
    if (!indicator) return;
    
    // Calculate position with boundaries (0-100%)
    const positionPercent = Math.max(0, Math.min(100, position * 100));
    indicator.style.top = `${positionPercent}%`;
    
    // Check if in target zone
    const targetTop = 35; // From CSS
    const targetHeight = 30; // From CSS
    const inTarget = positionPercent >= targetTop && positionPercent <= (targetTop + targetHeight);
    
    // Update indicator appearance
    if (inTarget) {
      indicator.classList.add('in-target');
      
      // Increase score while in target
      this.balanceTime = (this.balanceTime || 0) + 1;
      
      // Update progress based on time in target zone
      const progressFill = document.getElementById('challenge-progress-fill');
      if (progressFill) {
        const fillPercent = Math.min(100, (this.balanceTime / this.targetBalanceTime) * 100);
        progressFill.style.width = `${fillPercent}%`;
      }
      
      // Check for success
      if (this.balanceTime >= this.targetBalanceTime) {
        // Calculate score based on stability
        this.challengeScore = 100 - Math.min(100, this.positionChanges);
        
        // Complete challenge
        setTimeout(() => {
          this.completeChallenge(true);
        }, 300);
      }
    } else {
      indicator.classList.remove('in-target');
      
      // Reduce balance time when outside target
      if (this.balanceTime > 0) {
        this.balanceTime = Math.max(0, this.balanceTime - 0.5);
        
        // Update progress
        const progressFill = document.getElementById('challenge-progress-fill');
        if (progressFill) {
          const fillPercent = Math.min(100, (this.balanceTime / this.targetBalanceTime) * 100);
          progressFill.style.width = `${fillPercent}%`;
        }
      }
    }
    
    // Track position changes for stability score
    if (!this.lastPosition) {
      this.lastPosition = positionPercent;
    } else {
      // Count significant movements
      if (Math.abs(this.lastPosition - positionPercent) > 5) {
        this.positionChanges = (this.positionChanges || 0) + 1;
        this.lastPosition = positionPercent;
      }
    }
  }

  /**
   * Initialize timing challenge
   * @param {HTMLElement} container - Challenge container
   */
  initTimingChallenge(container) {
    // Set up indicator animation
    const indicator = container.querySelector('.timing-indicator');
    if (!indicator) return;
    
    // Initial position (start from left)
    indicator.style.left = '0%';
    
    // Set up animation interval
    this.challengeInterval = setInterval(() => {
      // Get current position
      const currentPos = parseFloat(indicator.style.left) || 0;
      
      // Move indicator based on difficulty
      const moveSpeed = 1 + (this.activeChallenge.difficulty * 1.5);
      const newPos = currentPos + moveSpeed;
      
      // Check if we need to reset
      if (newPos > 100) {
        indicator.style.left = '0%';
      } else {
        indicator.style.left = `${newPos}%`;
      }
      
      // Update timer
      this.challengeTimer += 50;
      this.updateChallengeProgress();
      
      // Check for timeout
      if (this.challengeTimer >= this.challengeDuration) {
        clearInterval(this.challengeInterval);
        this.completeChallenge(false);
      }
    }, 50);
    
    // Set visible
    container.style.display = 'block';
    
    // Add instructional toast for new players
    if (this.totalCatches < 2) {
      this.showToast("Tap when the indicator aligns with the target!", "info", 2000);
    }
  }

  /**
   * Initialize reeling challenge
   * @param {HTMLElement} container - Challenge container
   */
  initReelingChallenge(container) {
    // Reset reeling state
    this.reelProgress = 0;
    this.clickCount = 0;
    this.fishResistance = 0;
    
    // Determine ideal clicks based on difficulty (higher difficulty = more clicks)
    this.idealClicks = 10 + Math.round(this.activeChallenge.difficulty * 10);
    
    // Reset visual elements
    const reelingFill = container.querySelector('.reeling-fill');
    if (reelingFill) {
      reelingFill.style.width = '0%';
    }
    
    const resistanceFill = container.querySelector('#resistance-fill');
    if (resistanceFill) {
      resistanceFill.style.width = '100%';
    }
    
    const fatigueFill = container.querySelector('#fatigue-fill');
    if (fatigueFill) {
      fatigueFill.style.width = '0%';
    }
    
    // Set up animation interval
    this.challengeInterval = setInterval(() => {
      // Simulate fish fighting back - slowly decrease progress if not reeling
      this.reelProgress = Math.max(0, this.reelProgress - 0.5);
      
      // Fish gets tired as challenge continues
      this.fishFatigue = Math.min(100, this.fishFatigue + 0.5);
      
      // Update visuals
      if (reelingFill) {
        reelingFill.style.width = `${this.reelProgress}%`;
      }
      
      if (resistanceFill) {
        const resistanceWidth = 100 - Math.min(80, this.fishFatigue);
        resistanceFill.style.width = `${resistanceWidth}%`;
      }
      
      if (fatigueFill) {
        fatigueFill.style.width = `${this.fishFatigue}%`;
      }
      
      // Update timer
      this.challengeTimer += 50;
      this.updateChallengeProgress();
      
      // Check for timeout or fish escape
      if (this.challengeTimer >= this.challengeDuration) {
        clearInterval(this.challengeInterval);
        
        // If progress is above 50%, success, otherwise failure
        this.completeChallenge(this.reelProgress >= 50);
      }
    }, 50);
    
    // Set visible
    container.style.display = 'block';
    
    // Add instructional toast for new players
    if (this.totalCatches < 2) {
      this.showToast("Tap rapidly to reel in the fish!", "info", 2000);
    }
    
    // Mobile-specific setup
    if (this.isMobile) {
      // Increase button prominence
      const reelButton = container.querySelector('.reeling-button');
      if (reelButton) {
        reelButton.style.transform = 'scale(1.05)';
        reelButton.style.boxShadow = '0 0 15px rgba(230, 57, 70, 0.5)';
      }
    }
  }

  /**
   * Initialize balancing challenge
   * @param {HTMLElement} container - Challenge container
   */
  initBalancingChallenge(container) {
    // Reset balancing state
    this.balanceTime = 0;
    this.positionChanges = 0;
    this.lastPosition = null;
    
    // Determine target balance time based on difficulty
    this.targetBalanceTime = 50 + Math.round(50 * this.activeChallenge.difficulty); 
    
    // Set up initial indicator position (middle)
    const indicator = container.querySelector('.balance-indicator');
    if (indicator) {
      indicator.style.top = '50%';
    }
    
    // Set up animation interval
    this.challengeInterval = setInterval(() => {
      // Apply random "fish movement" effect
      if (Math.random() < 0.3 && indicator) {
        // Get current position
        const currentPos = parseFloat(indicator.style.top) || 50;
        
        // Random movement based on difficulty
        const movement = (Math.random() * 10 - 5) * this.activeChallenge.difficulty;
        
        // Apply movement with boundaries
        const newPos = Math.max(0, Math.min(100, currentPos + movement));
        
        // Only apply movement if user hasn't provided input recently
        if (Date.now() - (this.lastInputTime || 0) > 500) {
          indicator.style.top = `${newPos}%`;
        }
      }
      
      // Update timer
      this.challengeTimer += 50;
      this.updateChallengeProgress();
      
      // Check for timeout
      if (this.challengeTimer >= this.challengeDuration) {
        clearInterval(this.challengeInterval);
        
        // If balance time is above threshold, success
        const threshold = this.targetBalanceTime * 0.6;
        this.completeChallenge(this.balanceTime >= threshold);
      }
    }, 50);
    
    // Set visible
    container.style.display = 'block';
    
    // Add instructional toast for new players
    if (this.totalCatches < 2) {
      if (this.isMobile) {
        this.showToast("Move your finger up and down to keep the indicator in the target zone!", "info", 3000);
      } else {
        this.showToast("Move your mouse up and down to keep the indicator in the target zone!", "info", 3000);
      }
    }
  }

  /**
   * Initialize patience challenge
   * @param {HTMLElement} container - Challenge container
   */
  initPatienceChallenge(container) {
    // Reset patience state
    this.patienceScore = 100;
    this.lastMovement = Date.now();
    
    // Set up animation interval
    this.challengeInterval = setInterval(() => {
      // Check for movement (will be updated by mousemove/touchmove handlers)
      const movementAge = Date.now() - this.lastMovement;
      
      // Update patience score - good if no movement
      if (movementAge > 500) {
        this.patienceScore = Math.min(100, this.patienceScore + 0.5);
      } else {
        this.patienceScore = Math.max(0, this.patienceScore - 5);
      }
      
      // Update visual fill
      const patienceFill = container.querySelector('.patience-fill');
      if (patienceFill) {
        patienceFill.style.width = `${this.patienceScore}%`;
      }
      
      // Show/hide warning
      const warning = container.querySelector('.patience-warning');
      if (warning) {
        warning.classList.toggle('hidden', movementAge > 300);
      }
      
      // Update timer
      this.challengeTimer += 50;
      this.updateChallengeProgress();
      
      // Check for success/timeout
      if (this.patienceScore >= 100) {
        // Success - full patience
        clearInterval(this.challengeInterval);
        this.challengeScore = 100;
        this.completeChallenge(true);
      } else if (this.challengeTimer >= this.challengeDuration) {
        // Timeout - check patience level
        clearInterval(this.challengeInterval);
        this.challengeScore = this.patienceScore;
        this.completeChallenge(this.patienceScore >= 50);
      }
    }, 50);
    
    // Set visible
    container.style.display = 'block';
    
    // Add instructional toast for new players
    if (this.totalCatches < 2) {
      this.showToast("Stay still and wait for the fish to tire out!", "info", 2000);
    }
  }

  /**
   * Update challenge progress bar
   */
  updateChallengeProgress() {
    const progressFill = document.getElementById('challenge-progress-fill');
    if (progressFill) {
      const progress = Math.min(100, (this.challengeTimer / this.challengeDuration) * 100);
      progressFill.style.width = `${progress}%`;
    }
  }
}

export default FishingGame; 