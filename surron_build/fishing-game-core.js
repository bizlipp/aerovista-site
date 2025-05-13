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
      // Register the catch
      const catchResult = {
        fish: this.activeChallenge.fish,
        quality: finalScore,
        timestamp: Date.now()
      };
      
      // Store last catch
      this.lastCatch = catchResult;
      
      // Add to catch history
      this.catchHistory.unshift(catchResult);
      if (this.catchHistory.length > 10) {
        this.catchHistory.pop();
      }
      
      // Update UI with catch info
      this.updateLastCatchDisplay(catchResult);
      
      // Show success message
      const qualityText = finalScore >= 90 ? 'Perfect' : 
                         finalScore >= 70 ? 'Great' : 
                         finalScore >= 50 ? 'Good' : 'Poor';
      
      this.showToast(`${qualityText} catch! ${catchResult.fish.name} (${finalScore}% quality)`, "success");
      
      // Play catch sound
      const soundId = catchResult.fish.rarity >= 4 ? 'legendarySuccess' : 
                     catchResult.fish.rarity >= 3 ? 'rareSuccess' : 'commonSuccess';
      this.soundSystem.playSound(soundId, { volume: 0.7 });
      
      // Vibrate for successful catch
      const vibrationPattern = [];
      for (let i = 0; i < catchResult.fish.rarity; i++) {
        vibrationPattern.push(50, 100);
      }
      this.vibrate(vibrationPattern);
      
      // Update session stats
      this.sessionStats.catches++;
      this.sessionStats.totalValue += catchResult.fish.value;
      if (catchResult.fish.rarity >= 3) {
        this.sessionStats.rareCatches++;
      }
      
      // Show catch animation
      this.showCatchAnimation(catchResult);
    } else {
      // Fish got away
      this.showToast(`The ${this.activeChallenge.fish.name} got away!`, "error");
      this.soundSystem.playSound('fishEscape', { volume: 0.6 });
      
      // Return to idle state
      this.returnToIdle();
    }
    
    // Reset challenge state
    this.activeChallenge = null;
    this.challengeScore = 0;
    this.challengeTimer = 0;
    this.state = 'idle';
  }

  /**
   * Return to idle state after a challenge or catching a fish
   */
  returnToIdle() {
    this.state = 'idle';
    this.hookPosition = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
    this.hookHasFish = false;
    this.activeChallenge = null;
    
    // Reset UI elements
    const overlay = document.getElementById('challenge-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
    
    // Re-enable casting button
    const castButton = document.getElementById('cast-button');
    if (castButton) {
      castButton.disabled = false;
      castButton.textContent = 'Cast Line';
    }
    
    // Update mobile UI if needed
    const touchButton = document.getElementById('cast-touch-button');
    if (touchButton && this.isMobile) {
      touchButton.disabled = false;
      touchButton.textContent = 'CAST';
      touchButton.style.display = 'block';
    }
    
    // Play ambient sound
    this.soundSystem.playSound('ambient', { loop: true, volume: 0.3 });
  }
}

export default FishingGame; 