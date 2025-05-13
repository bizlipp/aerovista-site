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
    
    // Challenge interaction events - using event delegation pattern
    // For timing challenges - catch any click on the document
    document.addEventListener('click', (e) => {
      if (this.state === 'challenge' && this.activeChallenge?.type === 'timing') {
        this.handleTimingClick();
      }
    });
    
    // For reeling challenges - use the specific button
    const reelButton = document.getElementById('reel-challenge-button');
    if (reelButton) {
      reelButton.addEventListener('mousedown', (e) => {
        if (this.state === 'challenge' && this.activeChallenge?.type === 'reeling') {
          this.handleReelingClick();
        }
      });
      
      reelButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (this.state === 'challenge' && this.activeChallenge?.type === 'reeling') {
          this.handleReelingTouch();
        }
      });
    }
    
    // For balancing challenges - use mouse movement on canvas
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
      // Return to idle state after closing catch animation
      this.returnToIdle();
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
   * Handle specific challenge click events
   * This delegating method routes clicks to the appropriate handler
   * @param {Event} e - Click event
   */
  handleChallengeInteraction(e) {
    if (this.state !== 'challenge' || !this.activeChallenge) return;
    
    // Get challenge type
    const type = this.activeChallenge.type;
    
    // Route to appropriate handler
    switch (type) {
      case 'timing':
        this.handleTimingClick();
        break;
      case 'reeling':
        // Only handle if clicked on the reel button
        if (e.target.closest('#reel-challenge-button')) {
          this.handleReelingClick();
        }
        break;
      case 'balancing':
        // Balancing uses mousemove, not clicks
        break;
      case 'patience':
        // Patience requires no user input
        break;
    }
  }

  /**
   * Update the challenge UI progress
   */
  updateChallengeProgress() {
    if (!this.activeChallenge) return;
    
    // Update progress bar
    const progressFill = document.getElementById('challenge-progress-fill');
    if (progressFill) {
      const progress = Math.min(100, (this.challengeTimer / this.challengeDuration) * 100);
      progressFill.style.width = `${progress}%`;
      
      // Change color based on progress
      if (progress > 75) {
        progressFill.style.backgroundColor = '#F44336'; // Red when almost out of time
      } else if (progress > 50) {
        progressFill.style.backgroundColor = '#FFC107'; // Yellow as warning
      }
    }
  }

  /**
   * Start a challenge when fish bites
   */
  startChallenge(challengeData) {
    // Bind important challenge methods to ensure "this" context is correct
    this.handleTimingClick = this.handleTimingClick.bind(this);
    this.handleReelingClick = this.handleReelingClick.bind(this);
    this.handleReelingTouch = this.handleReelingTouch.bind(this);
    this.handleBalancingMove = this.handleBalancingMove.bind(this);
    this.handlePatienceMouseMove = this.handlePatienceMouseMove.bind(this);
    this.handlePatienceTouchMove = this.handlePatienceTouchMove.bind(this);
    this.handleChallengeInteraction = this.handleChallengeInteraction.bind(this);
    
    // Set general challenge state
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
    
    // Add event listener for challenge interactions
    document.addEventListener('click', this.handleChallengeInteraction);
    
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
    SoundSystem.playSound(soundId, { volume: 0.6 });
    
    // Provide haptic feedback on challenge start
    this.vibrate([100, 50, 100]);
    
    // Show toast notification
    this.showToast(`${challengeData.fish.name} is biting! ${this.getChallengeDescription(challengeData.type)}`, "success");
  }

  /**
   * Cleanup event listeners and state when completing challenges
   */
  cleanupChallengeEvents() {
    // Remove challenge interaction listener
    document.removeEventListener('click', this.handleChallengeInteraction);
    
    // Remove patience-specific listeners
    if (this.patienceState && this.patienceState.active) {
      document.removeEventListener('mousemove', this.handlePatienceMouseMove);
      document.removeEventListener('touchmove', this.handlePatienceTouchMove);
      this.patienceState.active = false;
    }
    
    // Clear any intervals
    if (this.challengeInterval) {
      clearInterval(this.challengeInterval);
      this.challengeInterval = null;
    }
  }

  /**
   * Complete the current challenge and transition to result
   */
  completeChallenge(success) {
    // Cleanup event listeners and timers first
    this.cleanupChallengeEvents();
    
    // Stop challenge-related sounds
    SoundSystem.stopChallengeSound();
    
    // Hide challenge overlay
    document.getElementById('challenge-overlay').style.display = 'none';
    
    if (success) {
      // Get the caught fish with detailed info
      const fish = this.activeChallenge.fish;
      
      // Calculate quality-based value bonus (50-100% of base value)
      const qualityMultiplier = 0.5 + (this.challengeScore / 200);
      const adjustedValue = Math.round(fish.value * qualityMultiplier);
      
      // Create catch result with metadata
      const catchResult = {
        fish: fish,
        name: fish.name,
        rarity: fish.rarity,
        value: adjustedValue,
        quality: this.challengeScore,
        timestamp: Date.now()
      };
      
      // 1. Record catch in game state
      GameState.recordFishCatch(catchResult);
      
      // 2. Add currency reward
      GameState.addPlayerCurrency(adjustedValue);
      
      // 3. Add XP reward based on rarity and quality
      const baseXP = fish.rarity * 5;
      const qualityBonus = Math.round(this.challengeScore / 20); // 0-5 bonus XP based on quality
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
      const qualityText = this.challengeScore >= 90 ? 'Perfect' : 
                       this.challengeScore >= 70 ? 'Great' : 
                       this.challengeScore >= 50 ? 'Good' : 'Poor';
      
      this.showToast(`${qualityText} catch! ${fish.name} (+${xpGained} XP, +${adjustedValue} coins)`, "success");
      
      // 8. Show catch animation
      document.getElementById('catch-animation').style.display = 'flex';
      
      // 9. Update catch animation content
      document.getElementById('caught-fish-name').textContent = fish.name;
      document.getElementById('caught-fish-rarity').innerHTML = `${this.getRarityText(fish.rarity)} <span class="stars">${this.getRarityStars(fish.rarity)}</span>`;
      document.getElementById('caught-fish-value').textContent = `+${adjustedValue} SurCoins`;
      
      // 10. Set emoji/image based on fish rarity
      const fishImage = document.getElementById('caught-fish-image');
      fishImage.textContent = this.getFishEmoji(fish.rarity);
      
      // 11. Provide haptic feedback for catch
      this.vibrate([100, 50, 200]);
    } else {
      // Handle failed catch
      this.showToast("The fish got away!", "error");
      SoundSystem.playSound('lineBreak', { volume: 0.6 });
      
      // Create escape visual effect
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          const x = this.hookPosition.x + (Math.random() * 30 - 15);
          const y = this.hookPosition.y + (Math.random() * 20 - 10);
          this.createWaterRipple(x, y);
        }, i * 100);
      }
      
      // Return to idle state immediately
      this.returnToIdle();
    }
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
   * Return to idle state and reset for next cast
   */
  returnToIdle() {
    // Reset game state
    this.state = 'idle';
    this.activeChallenge = null;
    this.hookHasFish = false;
    this.challengeTimer = 0;
    this.challengeScore = 0;
    
    // Clear any challenge intervals
    if (this.challengeInterval) {
      clearInterval(this.challengeInterval);
      this.challengeInterval = null;
    }
    
    // Reset any challenge-specific state
    this.timingState = null;
    this.reelingState = null;
    this.balancingState = null;
    this.patienceState = null;
    
    // Cleanup any event listeners from challenges
    this.cleanupChallengeListeners();
    
    // Hide challenge overlay
    const overlay = document.getElementById('challenge-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
    
    // Enable cast button
    const castButton = document.getElementById('cast-button');
    if (castButton) {
      castButton.textContent = 'Cast Line';
      castButton.disabled = false;
      castButton.classList.remove('active');
    }
    
    // Reset hook position
    this.hookPosition = { x: 100, y: 150 };
    this.targetHookPosition = { x: 100, y: 150 };
    
    // Stop any challenge-related sounds
    SoundSystem.stopChallengeSound();
    
    // Show ambient water sounds
    SoundSystem.playSound('ambient', { volume: 0.3, loop: true });
  }

  /**
   * Clean up any event listeners from challenges
   */
  cleanupChallengeListeners() {
    // Remove patience challenge event listeners if they exist
    if (this.patienceState && this.patienceState.active) {
      document.removeEventListener('mousemove', this.handlePatienceMouseMove);
      document.removeEventListener('touchmove', this.handlePatienceTouchMove);
      this.patienceState.active = false;
    }
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
    console.log('[FishingGame] Initializing timing challenge');
    
    // Show the container
    container.style.display = 'block';
    
    // Reset any existing state
    this.timingState = {
      position: 0,
      direction: 1,
      speed: 1 + (this.activeChallenge.difficulty * 1.5),
      targetHit: false,
      hitAccuracy: 0,
      pulseEffect: 0
    };
    
    // Set up indicator element
    const indicator = container.querySelector('.timing-indicator');
    const target = container.querySelector('.timing-target');
    
    if (indicator && target) {
      // Initial position (start from left)
      indicator.style.left = '0%';
      
      // Animate target to draw attention
      target.style.animation = 'pulse 0.8s infinite';
    }
    
    // Play sound
    SoundSystem.playSound('reel', { volume: 0.5, loop: true });
    
    // Update challenge description with fish name
    const instruction = container.querySelector('.timing-instruction');
    if (instruction && this.activeChallenge.fish) {
      const fishName = this.activeChallenge.fish.name;
      instruction.textContent = `This ${fishName} requires perfect timing! Click when the marker aligns with the target!`;
    }
  }

  /**
   * Initialize reeling challenge
   * @param {HTMLElement} container - Challenge container
   */
  initReelingChallenge(container) {
    console.log('[FishingGame] Initializing reeling challenge');
    
    // Show the container
    container.style.display = 'block';
    
    // Initialize challenge state
    this.reelingState = {
      reelPower: 0,
      lineStrain: 0,
      progress: 0,
      lastReelTime: 0,
      reelDecay: 0.5, // How quickly reel power decays
      strainIncrease: this.activeChallenge.difficulty * 0.6, // How quickly strain increases
      progressNeeded: 100, // Progress needed to win
      maxStrain: 100, // Maximum strain before line breaks
      fishStrength: 50 + (this.activeChallenge.fish.rarity * 10),
      clickCount: 0,
      idealClicks: 15 + (this.activeChallenge.fish.rarity * 3)
    };
    
    // Set up reeling button
    const reelButton = container.querySelector('#reel-challenge-button');
    if (reelButton) {
      // Make button text more dynamic based on fish
      const fishRarity = this.activeChallenge.fish.rarity;
      if (fishRarity >= 4) {
        reelButton.textContent = 'REEL HARD!';
      } else if (fishRarity >= 3) {
        reelButton.textContent = 'REEL STEADY!';
      } else {
        reelButton.textContent = 'REEL!';
      }
    }
    
    // Reset UI elements
    const strainFill = container.querySelector('.strain-fill');
    const progressFill = container.querySelector('.progress-fill');
    const strengthFill = container.querySelector('.strength-fill');
    
    if (strainFill) strainFill.style.width = '0%';
    if (progressFill) progressFill.style.width = '0%';
    if (strengthFill) strengthFill.style.width = '100%';
    
    // Hide warning text initially
    const warningText = container.querySelector('.strain-warning-text');
    if (warningText) {
      warningText.style.opacity = '0';
    }
    
    // Play sound
    SoundSystem.playSound('lineTension', { volume: 0.3, loop: true });
    
    // Update instruction text
    const instruction = container.querySelector('.reeling-instruction');
    if (instruction && this.activeChallenge.fish) {
      const fishName = this.activeChallenge.fish.name;
      instruction.innerHTML = `
        <span class="mobile-only">Tap rapidly to reel in the ${fishName}!</span>
        <span class="desktop-only">Click rapidly to reel in the ${fishName}!</span>
        <div class="strain-warning-text">Be careful not to break the line!</div>
      `;
    }
  }

  /**
   * Initialize balancing challenge
   * @param {HTMLElement} container - Challenge container
   */
  initBalancingChallenge(container) {
    console.log('[FishingGame] Initializing balancing challenge');
    
    // Show the container
    container.style.display = 'block';
    
    // Initialize challenge state
    this.balancingState = {
      targetPosition: 40, // Start target at 40% from top
      targetDirection: 1, // 1 = down, -1 = up
      targetSpeed: 0.3 + (this.activeChallenge.difficulty * 0.2),
      lastPosition: undefined,
      successTime: 0,
      requiredTime: 3000, // Time needed in target zone in ms
      positionChanges: 0
    };
    
    // Set up track and indicators
    const target = container.querySelector('.balance-target');
    const indicator = container.querySelector('.balance-indicator');
    
    if (target && indicator) {
      target.style.top = `${this.balancingState.targetPosition}%`;
      
      // Start indicator in middle
      indicator.style.top = '50%';
      
      // Add animation to target to draw attention
      target.style.animation = 'pulse 1s infinite';
    }
    
    // Play sound
    SoundSystem.playSound('waterSplash', { volume: 0.2, loop: true });
    
    // Update challenge description with fish name
    const instruction = container.querySelector('p');
    if (instruction && this.activeChallenge.fish) {
      const fishName = this.activeChallenge.fish.name;
      instruction.textContent = `This ${fishName} is strong! ${this.isMobile ? 'Move your finger' : 'Move your mouse'} up and down to keep the indicator in the target zone!`;
    }
  }

  /**
   * Initialize patience challenge
   * @param {HTMLElement} container - Challenge container
   */
  initPatienceChallenge(container) {
    console.log('[FishingGame] Initializing patience challenge');
    
    // Show the container
    container.style.display = 'block';
    
    // Initialize challenge state
    this.patienceState = {
      patienceTime: 0,
      requiredTime: 5000 + (this.activeChallenge.difficulty * 1000), // Time required in ms
      playerMoving: false,
      movementCount: 0,
      lastMouseX: 0,
      lastMouseY: 0,
      testInProgress: false,
      testDuration: 0,
      testTimer: 0,
      active: true // Flag to track if this challenge is active for event cleanup
    };
    
    // Set up UI elements
    const patienceFill = container.querySelector('.patience-fill');
    const patienceWarning = container.querySelector('.patience-warning');
    
    if (patienceFill) {
      patienceFill.style.width = '0%';
    }
    
    if (patienceWarning) {
      patienceWarning.classList.add('hidden');
    }
    
    // Add event listeners for mouse/touch movement
    this.handlePatienceMouseMove = this.handlePatienceMouseMove.bind(this);
    this.handlePatienceTouchMove = this.handlePatienceTouchMove.bind(this);
    
    document.addEventListener('mousemove', this.handlePatienceMouseMove);
    document.addEventListener('touchmove', this.handlePatienceTouchMove, { passive: false });
    
    // Play ambient sound
    SoundSystem.playSound('ambientNight', { volume: 0.3, loop: true });
    
    // Update challenge description with fish name
    const instruction = container.querySelector('p');
    if (instruction && this.activeChallenge.fish) {
      const fishName = this.activeChallenge.fish.name;
      instruction.textContent = `This ${fishName} requires patience! Stay completely still until it tires!`;
    }
  }

  /**
   * Handle mouse move in patience challenge
   * @param {MouseEvent} e - Mouse move event
   */
  handlePatienceMouseMove(e) {
    if (this.state !== 'challenge' || this.activeChallenge?.type !== 'patience' || !this.patienceState) {
      return;
    }
    
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // Skip first time to initialize values
    if (this.patienceState.lastMouseX === 0 && this.patienceState.lastMouseY === 0) {
      this.patienceState.lastMouseX = mouseX;
      this.patienceState.lastMouseY = mouseY;
      return;
    }
    
    // Calculate movement distance
    const distance = Math.sqrt(
      Math.pow(mouseX - this.patienceState.lastMouseX, 2) +
      Math.pow(mouseY - this.patienceState.lastMouseY, 2)
    );
    
    // If movement is significant, mark as moving
    if (distance > 3) {
      this.patienceState.playerMoving = true;
      this.patienceState.movementCount++;
    }
    
    // Update last position
    this.patienceState.lastMouseX = mouseX;
    this.patienceState.lastMouseY = mouseY;
  }

  /**
   * Handle touch move in patience challenge
   * @param {TouchEvent} e - Touch move event
   */
  handlePatienceTouchMove(e) {
    if (this.state !== 'challenge' || this.activeChallenge?.type !== 'patience' || !this.patienceState) {
      return;
    }
    
    // Prevent scrolling
    e.preventDefault();
    
    if (e.touches.length === 0) return;
    
    const touch = e.touches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;
    
    // Skip first time to initialize values
    if (this.patienceState.lastMouseX === 0 && this.patienceState.lastMouseY === 0) {
      this.patienceState.lastMouseX = touchX;
      this.patienceState.lastMouseY = touchY;
      return;
    }
    
    // Calculate movement distance
    const distance = Math.sqrt(
      Math.pow(touchX - this.patienceState.lastMouseX, 2) +
      Math.pow(touchY - this.patienceState.lastMouseY, 2)
    );
    
    // If movement is significant, mark as moving
    if (distance > 5) { // Higher threshold for touch to account for subtle movements
      this.patienceState.playerMoving = true;
      this.patienceState.movementCount++;
    }
    
    // Update last position
    this.patienceState.lastMouseX = touchX;
    this.patienceState.lastMouseY = touchY;
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

  /**
   * Update the active challenge
   * @param {number} deltaTime - Time since last frame in ms
   */
  updateChallenge(deltaTime) {
    if (!this.activeChallenge) return;
    
    // Update challenge timer
    this.challengeTimer += deltaTime;
    
    // Update challenge progress bar
    const progressFill = document.getElementById('challenge-progress-fill');
    if (progressFill) {
      const progress = Math.min(this.challengeTimer / this.challengeDuration, 1);
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
    if (this.challengeTimer >= this.challengeDuration) {
      // Auto-fail if we reach the time limit
      this.completeChallenge(false);
    }
  }

  /**
   * Update the timing challenge animation and state
   * @param {number} deltaTime - Time since last frame
   */
  updateTimingChallenge(deltaTime) {
    if (!this.timingState) return;
    
    // Move the indicator back and forth
    this.timingState.position += this.timingState.direction * this.timingState.speed * (deltaTime / 16);
    
    // Add some randomness occasionally to simulate fish struggling
    if (Math.random() < 0.02) {
      this.timingState.speed = 1 + (this.activeChallenge.difficulty * 1.5) + (Math.random() * 0.5);
    }
    
    // Reverse direction at edges
    if (this.timingState.position >= 100) {
      this.timingState.position = 100;
      this.timingState.direction = -1;
      // Provide visual feedback on direction change
      this.pulseIndicator();
    } else if (this.timingState.position <= 0) {
      this.timingState.position = 0;
      this.timingState.direction = 1;
      // Provide visual feedback on direction change
      this.pulseIndicator();
    }
    
    // Update indicator position
    const indicator = document.querySelector('.timing-indicator');
    if (indicator) {
      indicator.style.left = `${this.timingState.position}%`;
      
      // Update pulse effect if active
      if (this.timingState.pulseEffect > 0) {
        this.timingState.pulseEffect -= deltaTime / 200;
        if (this.timingState.pulseEffect <= 0) {
          this.timingState.pulseEffect = 0;
          indicator.style.boxShadow = '';
        } else {
          indicator.style.boxShadow = `0 0 ${this.timingState.pulseEffect * 10}px rgba(255,255,255,${this.timingState.pulseEffect})`;
        }
      }
    }
    
    // Gradually increase speed for difficulty
    this.timingState.speed += 0.005 * (deltaTime / 16);
  }

  /**
   * Visual pulse effect for timing indicator
   */
  pulseIndicator() {
    if (!this.timingState) return;
    
    this.timingState.pulseEffect = 1;
    const indicator = document.querySelector('.timing-indicator');
    if (indicator) {
      indicator.style.boxShadow = '0 0 10px rgba(255,255,255,1)';
    }
    
    // Play a subtle sound for the direction change
    SoundSystem.playSound('lineTension', { volume: 0.1 });
  }

  /**
   * Update the reeling challenge state
   * @param {number} deltaTime - Time since last frame
   */
  updateReelingChallenge(deltaTime) {
    if (!this.reelingState) return;
    
    // Natural decay of reel power
    this.reelingState.reelPower -= this.reelingState.reelDecay * (deltaTime / 16);
    this.reelingState.reelPower = Math.max(0, this.reelingState.reelPower);
    
    // Update strain based on current reel power
    const strainChange = (this.reelingState.reelPower > this.reelingState.fishStrength) 
      ? this.reelingState.strainIncrease * (deltaTime / 16) 
      : -this.reelingState.strainIncrease * 0.5 * (deltaTime / 16);
    
    this.reelingState.lineStrain += strainChange;
    this.reelingState.lineStrain = Math.max(0, Math.min(this.reelingState.maxStrain, this.reelingState.lineStrain));
    
    // Update progress based on reel power vs fish strength
    if (this.reelingState.reelPower > this.reelingState.fishStrength * 0.5) {
      const progressGain = ((this.reelingState.reelPower - (this.reelingState.fishStrength * 0.5)) / this.reelingState.fishStrength) * (deltaTime / 16);
      this.reelingState.progress += progressGain * 2;
    } else {
      // If power too low, fish is escaping
      const progressLoss = (1 - (this.reelingState.reelPower / (this.reelingState.fishStrength * 0.5))) * (deltaTime / 100);
      this.reelingState.progress -= progressLoss;
      this.reelingState.progress = Math.max(0, this.reelingState.progress);
    }
    
    // Check for success or failure
    if (this.reelingState.progress >= this.reelingState.progressNeeded) {
      // Calculate score based on strain
      const strainPercentage = this.reelingState.lineStrain / this.reelingState.maxStrain;
      this.challengeScore = Math.round(100 * (1 - strainPercentage * 0.8));
      
      // Complete challenge successfully
      setTimeout(() => {
        this.completeChallenge(true);
      }, 300);
    } else if (this.reelingState.lineStrain >= this.reelingState.maxStrain) {
      // Line broke due to too much strain
      setTimeout(() => {
        this.completeChallenge(false);
      }, 300);
      
      // Visual feedback for line break
      const container = document.querySelector('.reeling-challenge');
      if (container) {
        container.classList.add('line-break');
      }
      
      // Play sound effect
      SoundSystem.playSound('lineBreak', { volume: 0.7 });
    }
    
    // Update UI
    this.updateReelingUI();
  }

  /**
   * Update the UI for the reeling challenge
   */
  updateReelingUI() {
    if (!this.reelingState) return;
    
    // Update strain bar
    const strainFill = document.querySelector('.strain-fill');
    if (strainFill) {
      strainFill.style.width = `${(this.reelingState.lineStrain / this.reelingState.maxStrain) * 100}%`;
      
      // Change color based on strain
      if (this.reelingState.lineStrain > this.reelingState.maxStrain * 0.8) {
        strainFill.style.backgroundColor = '#F44336'; // Red
      } else if (this.reelingState.lineStrain > this.reelingState.maxStrain * 0.5) {
        strainFill.style.backgroundColor = '#FFC107'; // Yellow
      } else {
        strainFill.style.backgroundColor = '#4CAF50'; // Green
      }
    }
    
    // Update progress bar
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
      progressFill.style.width = `${(this.reelingState.progress / this.reelingState.progressNeeded) * 100}%`;
    }
    
    // Show warning if strain is high
    const warningText = document.querySelector('.strain-warning-text');
    if (warningText) {
      if (this.reelingState.lineStrain > this.reelingState.maxStrain * 0.7) {
        warningText.style.opacity = '1';
        warningText.textContent = 'WARNING: Line is about to break!';
        
        // Add pulsing effect
        warningText.style.animation = 'pulse 0.5s infinite';
        
        // Provide haptic feedback
        if (this.vibrationSupported && Math.random() < 0.1) {
          this.vibrate([10, 10]);
        }
      } else if (this.reelingState.lineStrain > this.reelingState.maxStrain * 0.5) {
        warningText.style.opacity = '0.8';
        warningText.textContent = 'Careful: Line tension high';
        warningText.style.animation = 'none';
      } else {
        warningText.style.opacity = '0';
        warningText.style.animation = 'none';
      }
    }
    
    // Update fish strength indicator
    const strengthFill = document.querySelector('.strength-fill');
    if (strengthFill) {
      const strengthPercentage = (this.reelingState.fishStrength - (this.reelingState.progress / 2)) / this.reelingState.fishStrength;
      strengthFill.style.width = `${Math.max(0, Math.min(100, strengthPercentage * 100))}%`;
    }
  }

  /**
   * Update the balancing challenge state
   * @param {number} deltaTime - Time since last frame
   */
  updateBalancingChallenge(deltaTime) {
    if (!this.balancingState) return;
    
    // Apply natural movement of target zone (fish struggling)
    this.balancingState.targetPosition += this.balancingState.targetDirection * this.balancingState.targetSpeed * (deltaTime / 16);
    
    // Bounds check and reverse direction
    if (this.balancingState.targetPosition >= 80) {
      this.balancingState.targetPosition = 80;
      this.balancingState.targetDirection = -1;
    } else if (this.balancingState.targetPosition <= 20) {
      this.balancingState.targetPosition = 20;
      this.balancingState.targetDirection = 1;
    }
    
    // Random direction changes to simulate fish behavior
    if (Math.random() < 0.01) {
      this.balancingState.targetDirection *= -1;
    }
    
    // Random speed changes
    if (Math.random() < 0.03) {
      this.balancingState.targetSpeed = 0.2 + (Math.random() * 0.3) + (this.activeChallenge.difficulty * 0.2);
    }
    
    // Update target position in UI
    const target = document.querySelector('.balance-target');
    if (target) {
      target.style.top = `${this.balancingState.targetPosition}%`;
    }
    
    // Check if indicator is in target zone
    if (this.balancingState.lastPosition !== undefined) {
      const targetSize = 30; // Target height in percent
      const inTarget = Math.abs(this.balancingState.lastPosition - this.balancingState.targetPosition) <= targetSize / 2;
      
      if (inTarget) {
        // Increase success meter
        this.balancingState.successTime += deltaTime;
        
        // Visual feedback
        const indicator = document.querySelector('.balance-indicator');
        if (indicator) {
          indicator.classList.add('in-target');
        }
        
        // Check for success
        if (this.balancingState.successTime >= this.balancingState.requiredTime) {
          // Calculate score based on stability
          const stabilityFactor = Math.min(1, this.balancingState.requiredTime / this.balancingState.positionChanges);
          this.challengeScore = Math.round(stabilityFactor * 100);
          
          // Complete challenge
          setTimeout(() => {
            this.completeChallenge(true);
          }, 300);
        }
      } else {
        // Reset success meter if we leave the target
        this.balancingState.successTime = Math.max(0, this.balancingState.successTime - (deltaTime * 2));
        
        // Visual feedback
        const indicator = document.querySelector('.balance-indicator');
        if (indicator) {
          indicator.classList.remove('in-target');
        }
      }
    }
    
    // Update progress bar
    const progressFill = document.getElementById('challenge-progress-fill');
    if (progressFill) {
      const progressPercent = Math.min(100, (this.balancingState.successTime / this.balancingState.requiredTime) * 100);
      progressFill.style.width = `${progressPercent}%`;
    }
  }

  /**
   * Update the patience challenge state
   * @param {number} deltaTime - Time since last frame
   */
  updatePatienceChallenge(deltaTime) {
    if (!this.patienceState) return;
    
    // Increase patience timer if player is not moving
    if (!this.patienceState.playerMoving) {
      this.patienceState.patienceTime += deltaTime;
      
      // Occasional random "fish testing" movements
      if (Math.random() < 0.02 && !this.patienceState.testInProgress) {
        // Start a "fish testing patience" moment
        this.patienceState.testInProgress = true;
        this.patienceState.testDuration = 1000 + Math.random() * 2000; // 1-3 seconds
        this.patienceState.testTimer = 0;
        
        // Show warning
        const warning = document.querySelector('.patience-warning');
        if (warning) {
          warning.classList.remove('hidden');
        }
        
        // Subtle vibration
        if (this.vibrationSupported) {
          this.vibrate(20);
        }
      }
      
      // Update testing timer if active
      if (this.patienceState.testInProgress) {
        this.patienceState.testTimer += deltaTime;
        
        // Test complete
        if (this.patienceState.testTimer >= this.patienceState.testDuration) {
          this.patienceState.testInProgress = false;
          
          // Hide warning
          const warning = document.querySelector('.patience-warning');
          if (warning) {
            warning.classList.add('hidden');
          }
          
          // Add bonus to patience time
          this.patienceState.patienceTime += 500;
        }
      }
    } else {
      // Player moved - reset timer
      this.patienceState.patienceTime = Math.max(0, this.patienceState.patienceTime - (deltaTime * 2));
      
      // If in a test, failing is worse
      if (this.patienceState.testInProgress) {
        this.patienceState.patienceTime = Math.max(0, this.patienceState.patienceTime - (deltaTime * 5));
        this.patienceState.testInProgress = false;
        
        // Hide warning
        const warning = document.querySelector('.patience-warning');
        if (warning) {
          warning.classList.add('hidden');
        }
      }
      
      // Reset movement flag for next frame
      this.patienceState.playerMoving = false;
    }
    
    // Update patience meter
    const patienceFill = document.querySelector('.patience-fill');
    if (patienceFill) {
      const fillPercent = Math.min(100, (this.patienceState.patienceTime / this.patienceState.requiredTime) * 100);
      patienceFill.style.width = `${fillPercent}%`;
      
      // Change color based on progress
      if (fillPercent > 75) {
        patienceFill.style.backgroundColor = '#4CAF50'; // Green - almost there
      } else if (fillPercent > 50) {
        patienceFill.style.backgroundColor = '#8BC34A'; // Light green - good progress
      } else if (fillPercent > 25) {
        patienceFill.style.backgroundColor = '#FFEB3B'; // Yellow - some progress
      }
    }
    
    // Update progress bar
    const progressFill = document.getElementById('challenge-progress-fill');
    if (progressFill) {
      const progressPercent = Math.min(100, (this.patienceState.patienceTime / this.patienceState.requiredTime) * 100);
      progressFill.style.width = `${progressPercent}%`;
    }
    
    // Check for success
    if (this.patienceState.patienceTime >= this.patienceState.requiredTime) {
      // Calculate score based on movement counts
      const movementFactor = Math.max(0, 1 - (this.patienceState.movementCount / 20));
      this.challengeScore = Math.round(70 + (movementFactor * 30)); // 70-100 score range
      
      // Complete challenge
      setTimeout(() => {
        this.completeChallenge(true);
      }, 300);
    }
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
   * Get star display for fish rarity
   * @param {number} rarity - Fish rarity (1-5)
   * @returns {string} Stars as string
   */
  getRarityStars(rarity) {
    return '★'.repeat(rarity);
  }

  /**
   * Get text description of fish rarity
   * @param {number} rarity - Fish rarity (1-5)
   * @returns {string} Rarity name
   */
  getRarityText(rarity) {
    switch(rarity) {
      case 1: return 'Common';
      case 2: return 'Uncommon';
      case 3: return 'Rare';
      case 4: return 'Epic';
      case 5: return 'Legendary';
      default: return 'Common';
    }
  }

  /**
   * Get emoji for fish based on rarity
   * @param {number} rarity - Fish rarity (1-5)
   * @returns {string} Fish emoji
   */
  getFishEmoji(rarity) {
    switch(rarity) {
      case 1: return '🐟';
      case 2: return '🐠';
      case 3: return '🐡';
      case 4: return '🦈';
      case 5: return '🐋';
      default: return '🐟';
    }
  }
}

export default FishingGame; 