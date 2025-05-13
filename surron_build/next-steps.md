# Next Steps for Implementing Fishing Game Core

## Overview

The `fishing-game-core.js` file will be the central component that ties together all the supporting systems we've created. It should implement the main game loop, rendering, and game state management while using our custom modules for state management, sound, and assets.

## Implementation Structure

1. **Class Structure**
   ```javascript
   class FishingGame {
     constructor() {
       // Initialize canvas and core properties
       this.canvas = document.getElementById('fishing-canvas');
       this.ctx = this.canvas.getContext('2d');
       
       // Game state properties
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
       
       // Mobile touch properties
       this.isMobile = this.detectMobile();
       this.touchProps = {
         startY: 0,
         dragDistance: 0,
         lastTapTime: 0,
         tapInterval: 0,
         tapStrength: 0
       };
       
       // Reeling properties
       this.fishResistance = 0;
       this.fishFatigue = 0;
       this.lineStrain = 0;
       this.reelProgress = 0;
       this.lineBreakThreshold = 100;
       
       // Initialize everything
       this.initialize();
     }
     
     // Methods: initialization, gameplay, rendering, etc.
   }
   ```

2. **Initialization Methods**
   ```javascript
   initialize() {
     // Set up the rendering canvas
     this.resizeCanvas();
     
     // Load game state from the state manager
     this.loadGameState();
     
     // Initialize event listeners
     this.initializeEventListeners();
     
     // Create initial game elements
     this.createInitialElements();
     
     // Start game loop
     this.startGameLoop();
   }
   
   loadGameState() {
     // Get player state from GameState
     const player = GameState.getState('player');
     const fishing = GameState.getState('fishing');
     
     // Update local properties based on state
     this.fisherLevel = player.level || 1;
     this.fisherXP = player.xp || 0;
     this.xpToNextLevel = player.xpToNextLevel || 100;
     this.collectedFish = player.collectedFish || [];
     
     // Set up fishing session if active
     if (fishing.isActive) {
       this.startFishingSession();
     }
   }
   ```

3. **Event Listeners**
   ```javascript
   initializeEventListeners() {
     // Desktop casting button
     document.getElementById('cast-button').addEventListener('click', () => {
       if (this.state === 'idle') {
         this.startCasting();
       } else if (this.state === 'casting') {
         this.finishCasting();
       }
     });
     
     // Mobile casting button with touch events
     const castTouchButton = document.getElementById('cast-touch-button');
     if (castTouchButton) {
       castTouchButton.addEventListener('touchstart', this.handleCastTouchStart.bind(this));
       castTouchButton.addEventListener('touchend', this.handleCastTouchEnd.bind(this));
     }
     
     // End fishing buttons
     document.getElementById('end-fishing-button').addEventListener('click', this.endFishing.bind(this));
     document.getElementById('mobile-end-fishing').addEventListener('click', this.endFishing.bind(this));
     
     // Challenge interaction events
     document.getElementById('reel-button').addEventListener('click', this.handleReelingClick.bind(this));
     
     // Canvas events for challenges
     this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
     this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
     this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
     this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
     this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
     
     // Window resize handler
     window.addEventListener('resize', this.handleResize.bind(this));
   }
   ```

4. **Game Loop**
   ```javascript
   startGameLoop() {
     this.lastFrameTime = performance.now();
     this.gameLoopId = requestAnimationFrame(this.gameLoop.bind(this));
   }
   
   gameLoop(timestamp) {
     // Calculate delta time in milliseconds
     const deltaTime = timestamp - this.lastFrameTime;
     this.lastFrameTime = timestamp;
     
     // Update game state
     this.update(deltaTime);
     
     // Render everything
     this.render();
     
     // Continue the loop
     this.gameLoopId = requestAnimationFrame(this.gameLoop.bind(this));
   }
   
   update(deltaTime) {
     // Update based on current game state
     switch (this.state) {
       case 'idle':
         // Update idle state animations
         break;
       case 'casting':
         // Update casting power meter
         this.updateCastPower(deltaTime);
         break;
       case 'waiting':
         // Check for fish bites
         this.checkForBite(deltaTime);
         break;
       case 'challenge':
         // Update active challenge
         this.updateChallenge(deltaTime);
         break;
     }
     
     // Always update environment
     this.updateEnvironment(deltaTime);
   }
   ```

5. **Rendering Methods**
   ```javascript
   render() {
     // Clear canvas
     this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
     
     // Draw environment
     this.drawEnvironment();
     
     // Draw fishing elements based on state
     switch (this.state) {
       case 'idle':
         this.drawIdleState();
         break;
       case 'casting':
         this.drawCastingState();
         break;
       case 'waiting':
         this.drawWaitingState();
         break;
       case 'challenge':
         this.drawChallengeState();
         break;
     }
     
     // Draw UI elements
     this.drawUI();
   }
   
   drawEnvironment() {
     // Draw sky based on weather and time of day
     this.drawSky();
     
     // Draw water surface
     this.drawWaterSurface();
     
     // Draw shore
     this.drawShore();
     
     // Draw weather effects
     this.drawWeatherEffects();
     
     // Draw fish in water
     this.drawFish();
   }
   ```

6. **Fishing Core Mechanics**
   ```javascript
   startCasting() {
     // Change game state
     this.state = 'casting';
     this.castPower = 0;
     this.castDirection = 1;
     
     // Update UI
     document.getElementById('cast-button').textContent = 'Set Power!';
     document.getElementById('cast-button').classList.add('active');
     
     // Display power meter
     this.showPowerMeter();
     
     // Play sound effect
     SoundSystem.playSound('cast');
   }
   
   finishCasting() {
     // Calculate cast based on power
     const distance = this.castPower * 4;
     this.hookPosition = {
       x: 100 + distance,
       y: 150
     };
     
     // Change state
     this.state = 'waiting';
     
     // Update UI
     document.getElementById('cast-button').textContent = 'Recasting...';
     document.getElementById('cast-button').disabled = true;
     
     // Hide power meter
     this.hidePowerMeter();
     
     // Play sound effects
     SoundSystem.playSound('splash');
     
     // Create splash effect
     this.createSplashEffect(this.hookPosition.x, this.hookPosition.y);
   }
   
   checkForBite(deltaTime) {
     if (this.state !== 'waiting') return;
     
     // Get current environment conditions
     const conditions = {
       weather: weatherSystem.currentWeather,
       season: weatherSystem.currentSeason,
       timeOfDay: weatherSystem.currentTimeOfDay
     };
     
     // Base bite chance adjusted by environment
     const baseChance = 0.0005 * deltaTime;
     const catchRateModifier = weatherSystem.getCatchRateModifier();
     
     // Equipment bonuses from player state
     const player = GameState.getState('player');
     const rodBonus = player.equipment.rod.catchBonus || 0;
     const lureBonus = player.equipment.lure.attractPower || 1;
     
     // Calculate final chance
     const finalChance = baseChance * catchRateModifier * lureBonus * (1 + rodBonus);
     
     // Random check for bite
     if (Math.random() < finalChance) {
       this.fishBite();
     }
   }
   
   fishBite() {
     // Select a fish based on conditions and rarity
     const fish = this.selectFish();
     
     // Create appropriate challenge
     const challenge = this.createChallenge(fish);
     
     // Start challenge
     this.startChallenge(fish, challenge);
     
     // Play sound effect
     SoundSystem.playSound('bite');
     
     // Create ripple
     this.createWaterRipple(this.hookPosition.x, this.hookPosition.y);
   }
   ```

7. **Challenge System**
   ```javascript
   startChallenge(fish, challenge) {
     // Set game state
     this.state = 'challenge';
     this.activeChallenge = challenge;
     this.challengeScore = 0;
     this.challengeTimer = 0;
     this.challengeDuration = challenge.duration || 5000;
     this.hookHasFish = true;
     
     // Set up reeling mechanics
     this.fishResistance = fish.rarity * 10 + Math.random() * 20;
     this.fishFatigue = 0;
     this.lineStrain = 0;
     this.reelProgress = 0;
     
     // Show challenge UI
     this.showChallengeUI(challenge.type);
     
     // Play sound effect
     SoundSystem.playSound('lineTension');
   }
   
   updateChallenge(deltaTime) {
     // Update challenge timer
     this.challengeTimer += deltaTime;
     
     // Different updates based on challenge type
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
       this.completeChallenge(this.challengeScore >= 50);
     }
   }
   
   completeChallenge(success) {
     // Hide challenge UI
     this.hideChallengeUI();
     
     if (success) {
       // Handle successful catch
       const fish = this.activeChallenge.fish;
       
       // Record the catch
       GameState.recordFishCatch(fish);
       
       // Show catch animation
       this.showCatchAnimation(fish);
       
       // Play appropriate sound based on fish rarity
       SoundSystem.playCatchSound(fish.rarity);
       
       // Update session stats
       this.updateSessionStats(fish);
     } else {
       // Handle failed catch
       this.showToast("The fish got away!", "error");
       SoundSystem.playSound('lineBreak');
     }
     
     // Reset game state
     this.state = 'idle';
     this.activeChallenge = null;
     this.hookHasFish = false;
     
     // Re-enable cast button
     document.getElementById('cast-button').textContent = 'Cast Line';
     document.getElementById('cast-button').disabled = false;
     document.getElementById('cast-button').classList.remove('active');
   }
   ```

8. **Utility Methods**
   ```javascript
   showToast(message, type = 'info', duration = 3000) {
     // Create toast element
     const toast = document.createElement('div');
     toast.className = `toast toast-${type}`;
     toast.textContent = message;
     
     // Add to toast container
     const container = document.getElementById('toast-container');
     container.appendChild(toast);
     
     // Animate and remove after duration
     setTimeout(() => {
       toast.classList.add('fadeout');
       setTimeout(() => {
         if (toast.parentNode) toast.parentNode.removeChild(toast);
       }, 300);
     }, duration);
   }
   
   resizeCanvas() {
     const container = this.canvas.parentElement;
     
     // Set canvas size to fill container with 4:3 aspect ratio
     this.canvas.width = container.clientWidth;
     this.canvas.height = container.clientWidth * 0.75;
   }
   
   detectMobile() {
     return (window.innerWidth <= 768) || 
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
   }
   ```

9. **Session Management**
   ```javascript
   startFishingSession() {
     if (this.fishingActive) return;
     
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
     
     // Update state in GameState
     GameState.startFishingSession();
     
     // Update UI
     this.updateSessionStatsDisplay();
     
     // Show toast notification
     this.showToast("Fishing session started!", "success");
     
     // Play ambient sounds based on current weather
     SoundSystem.startAmbientSound(
       weatherSystem.currentWeather, 
       weatherSystem.currentTimeOfDay
     );
   }
   
   endFishing() {
     if (!this.fishingActive) return;
     
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
   }
   ```

## Key Features to Focus On

1. **Fish Selection Logic**
   - Implement algorithm to select appropriate fish based on:
     - Current weather conditions
     - Player equipment stats
     - Season and time of day
     - Rarity chance calculations

2. **Challenge System**
   - Implement different challenge types with unique gameplay:
     - Timing: Click at exactly the right moment
     - Reeling: Tap/click rapidly with consideration for line strain
     - Balancing: Keep indicator in the sweet spot
     - Patience: Hold steady for a duration

3. **Mobile Support**
   - Ensure all interactions work well on touch devices
   - Create alternative controls for touch-only devices
   - Implement haptic feedback for key events

4. **Visual Feedback**
   - Create smooth, responsive visual feedback for all actions
   - Implement water effects, ripples, fish animations
   - Show clear feedback for challenge success/failure

## Implementation Order

1. Start with the basic game loop and rendering
2. Implement the casting and fish bite detection
3. Create the challenge system for catching fish
4. Add visual effects and animations
5. Implement session stats and rewards
6. Add UI rendering for equipment and catches
7. Polish mobile controls and interactions

## Special Considerations

1. **Mobile Performance**: 
   - Optimize rendering for mobile devices
   - Use simpler visuals when on slower devices

2. **State Management**:
   - Use GameState for all persistent data
   - Keep transient state in the class

3. **Fish Collection**:
   - Track caught fish in GameState
   - Display collection in UI with indicators for new catches

4. **Weather Integration**:
   - Visualize weather effects in the environment
   - Apply weather modifiers to fishing mechanics 