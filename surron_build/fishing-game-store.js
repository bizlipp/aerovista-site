// fishing-game-store.js - Store-integrated fishing game
import { store } from './StateStackULTRA/store/gameStore.js';
import * as fishingSelectors from './StateStackULTRA/slices/fishingSelectors.js';
import * as FishingGameSession from './FishingGameSession.js';
import { initFishingUI } from './FishingUI.js';
import GameCore from './game/GameCore.js';

/**
 * StoreBasedFishingGame - A fishing game that integrates with the Redux store
 * for state management while maintaining the canvas-based visual experience
 */
class StoreBasedFishingGame {
  constructor(containerId) {
    // Get the container
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error('Fishing game container not found');
      return;
    }
    
    // Create the game layout
    this.createLayout();
    
    // Initialize the game
    this.initialize();
  }
  
  /**
   * Create the game layout with canvas and UI sections
   */
  createLayout() {
    // Clear container
    this.container.innerHTML = '';
    
    // Create layout structure
    this.container.innerHTML = `
      <div class="fishing-game-container">
        <div class="fishing-canvas-container"></div>
        <div class="fishing-ui-container"></div>
      </div>
    `;
    
    // Get references to containers
    this.canvasContainer = this.container.querySelector('.fishing-canvas-container');
    this.uiContainer = this.container.querySelector('.fishing-ui-container');
    
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = 600;
    this.canvas.height = 400;
    this.ctx = this.canvas.getContext('2d');
    this.canvasContainer.appendChild(this.canvas);
    
    // Add styles
    this.addStyles();
  }
  
  /**
   * Add CSS styles for the fishing game
   */
  addStyles() {
    const styleId = 'fishing-game-store-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .fishing-game-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-width: 100%;
      }
      
      .fishing-canvas-container {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
      }
      
      .fishing-ui-container {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
      }
      
      canvas {
        width: 100%;
        height: auto;
        background: #115577;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
      
      .fishing-controls {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }
      
      .fishing-btn {
        padding: 0.5rem 1rem;
        background: var(--squad-primary);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .fishing-btn:disabled {
        background: #555;
        cursor: not-allowed;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  /**
   * Initialize the fishing game
   */
  initialize() {
    // Start a fishing session in the store
    FishingGameSession.startFishing();
    
    // Initialize the fishing UI
    this.uiUnsubscribe = initFishingUI(this.uiContainer);
    
    // Add game controls to the canvas container
    this.createGameControls();
    
    // Game state
    this.state = 'waiting'; // waiting, casting, reeling, caught
    
    // Fishing game variables
    this.hook = { x: 0, y: 0, hasFish: false, fishType: null };
    this.activeFish = [];
    this.lastTimestamp = 0;
    this.castMeterValue = 0;
    this.castMeterDirection = 1;
    
    // Spawn initial fish
    this.spawnFish(5);
    
    // Add event listeners
    this.canvas.addEventListener('click', this.handleClick.bind(this));
    
    // Start game loop
    this.lastTimestamp = performance.now();
    this.gameLoopId = requestAnimationFrame(this.update.bind(this));
  }
  
  /**
   * Create game control buttons
   */
  createGameControls() {
    const controls = document.createElement('div');
    controls.className = 'fishing-controls';
    controls.innerHTML = `
      <button id="cast-btn" class="fishing-btn">Cast Line</button>
      <button id="reel-btn" class="fishing-btn" disabled>Reel In</button>
      <button id="end-fishing-btn" class="fishing-btn">End Fishing</button>
    `;
    
    this.canvasContainer.insertBefore(controls, this.canvas);
    
    // Add event listeners
    document.getElementById('cast-btn').addEventListener('click', () => {
      if (this.state === 'waiting') {
        this.state = 'casting';
        document.getElementById('cast-btn').disabled = true;
      }
    });
    
    document.getElementById('reel-btn').addEventListener('click', () => {
      if (this.state === 'reeling') {
        this.reelIn();
      }
    });
    
    document.getElementById('end-fishing-btn').addEventListener('click', () => {
      this.endGame();
    });
  }
  
  /**
   * Handle canvas click events
   * @param {Event} event - Click event
   */
  handleClick(event) {
    // Get click position relative to canvas
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Handle based on game state
    if (this.state === 'casting') {
      // Cast the line
      this.cast(this.castMeterValue);
    }
  }
  
  /**
   * Cast the fishing line
   * @param {number} power - Cast power (0-100)
   */
  cast(power) {
    // Calculate cast distance based on power
    const distance = power * 0.8;
    
    // Set hook position
    this.hook.x = 100 + (distance * 4);
    this.hook.y = 150;
    
    // Change state
    this.state = 'reeling';
    
    // Update UI
    document.getElementById('cast-btn').disabled = true;
    document.getElementById('reel-btn').disabled = false;
  }
  
  /**
   * Reel in the line and check for fish
   */
  reelIn() {
    if (this.hook.hasFish) {
      // Use FishingGameSession to resolve catch
      const caughtFish = FishingGameSession.resolveCatch();
    }
    
    // Reset hook
    this.hook.hasFish = false;
    this.hook.fishType = null;
    
    // Reset state
    this.state = 'waiting';
    
    // Reset UI
    document.getElementById('cast-btn').disabled = false;
    document.getElementById('reel-btn').disabled = true;
    
    // Spawn new fish
    if (Math.random() > 0.7) {
      this.spawnFish(1);
    }
  }
  
  /**
   * Spawn new fish in the lake
   * @param {number} count - Number of fish to spawn
   */
  spawnFish(count) {
    for (let i = 0; i < count; i++) {
      // Use FishingGameSession to determine fish type
      const fishType = FishingGameSession.chooseRandomFish(0);
      
      // Add fish to active fish
      this.activeFish.push({
        type: fishType,
        x: Math.random() * (this.canvas.width - 100) + 200,
        y: Math.random() * (this.canvas.height - 150) + 150,
        speedX: (Math.random() - 0.5) * 2,
        speedY: (Math.random() - 0.5) * 1,
        biteChance: this.calculateBiteChance(fishType)
      });
    }
  }
  
  /**
   * Calculate bite chance based on fish type and lure
   * @param {Object} fishType - Fish type object
   * @returns {number} Bite chance (0-1)
   */
  calculateBiteChance(fishType) {
    const state = store.getState();
    const lure = fishingSelectors.getCurrentLure(state);
    
    // Base chance depends on fish rarity
    let baseChance = 0;
    
    switch(fishType.rarity) {
      case 'legendary': baseChance = 0.05; break;
      case 'rare': baseChance = 0.1; break;
      case 'uncommon': baseChance = 0.2; break;
      case 'common': default: baseChance = 0.3; break;
    }
    
    // Apply lure bonus
    const lureBonus = lure?.attractPower ? (lure.attractPower - 1) * 0.1 : 0;
    
    return baseChance + lureBonus;
  }
  
  /**
   * Check if any fish are biting the hook
   */
  checkForBite() {
    // See if any fish are near the hook
    this.activeFish.forEach((fish, index) => {
      const distance = Math.sqrt(
        Math.pow(fish.x - this.hook.x, 2) + 
        Math.pow(fish.y - this.hook.y, 2)
      );
      
      // If fish is close and roll succeeds, it bites
      if (distance < 50 && Math.random() < fish.biteChance) {
        this.hook.hasFish = true;
        this.hook.fishType = fish.type;
        
        // Remove fish from active fish
        this.activeFish.splice(index, 1);
      }
    });
  }
  
  /**
   * End the fishing game
   */
  endGame() {
    // Calculate results
    const results = {
      caughtFish: [],
      totalValue: 0,
      sessionDuration: 0
    };
    
    // Get caught fish from the store
    const state = store.getState();
    const catchHistory = fishingSelectors.getCatchHistory(state);
    
    if (catchHistory && catchHistory.length > 0) {
      results.caughtFish = catchHistory;
      results.totalValue = catchHistory.reduce((sum, fish) => sum + fish.value, 0);
      results.sessionDuration = Math.floor((performance.now() - this.lastTimestamp) / 1000);
    }
    
    // Process results through FishingGameSession
    FishingGameSession.processFishingResults(results);
    
    // Clean up
    this.cleanup();
    
    // Trigger close event
    this.container.dispatchEvent(new CustomEvent('fishing-end', { detail: results }));
    
    // Close the fishing modal if it exists
    const fishingModal = document.getElementById('fishing-modal');
    if (fishingModal) {
      fishingModal.style.display = 'none';
    }
  }
  
  /**
   * Clean up resources when game ends
   */
  cleanup() {
    // Cancel animation frame
    if (this.gameLoopId) {
      cancelAnimationFrame(this.gameLoopId);
    }
    
    // Unsubscribe from store
    if (this.uiUnsubscribe) {
      this.uiUnsubscribe();
    }
    
    // Remove event listeners
    this.canvas.removeEventListener('click', this.handleClick);
  }
  
  /**
   * Game loop update function
   * @param {number} timestamp - Current timestamp
   */
  update(timestamp) {
    // Calculate delta time
    const deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;
    
    // Update game logic
    this.updateGameLogic(deltaTime);
    
    // Draw everything
    this.draw();
    
    // Continue game loop
    this.gameLoopId = requestAnimationFrame(this.update.bind(this));
  }
  
  /**
   * Update game logic based on current state
   * @param {number} deltaTime - Time since last update
   */
  updateGameLogic(deltaTime) {
    // Update based on game state
    switch (this.state) {
      case 'waiting':
        // Nothing to update
        break;
        
      case 'casting':
        // Update cast meter
        this.castMeterValue += this.castMeterDirection * deltaTime * 0.1;
        
        // Bounce between 0 and 100
        if (this.castMeterValue >= 100) {
          this.castMeterValue = 100;
          this.castMeterDirection = -1;
        } else if (this.castMeterValue <= 0) {
          this.castMeterValue = 0;
          this.castMeterDirection = 1;
        }
        break;
        
      case 'reeling':
        // Check for fish biting
        if (!this.hook.hasFish) {
          this.checkForBite();
        }
        break;
    }
    
    // Update fish positions
    this.updateFish(deltaTime);
  }
  
  /**
   * Update fish positions
   * @param {number} deltaTime - Time since last update
   */
  updateFish(deltaTime) {
    this.activeFish.forEach(fish => {
      // Move fish
      fish.x += fish.speedX * deltaTime * 0.05;
      fish.y += fish.speedY * deltaTime * 0.05;
      
      // Bounce off edges
      if (fish.x < 200 || fish.x > this.canvas.width - 50) {
        fish.speedX *= -1;
      }
      
      if (fish.y < 150 || fish.y > this.canvas.height - 50) {
        fish.speedY *= -1;
      }
      
      // Occasionally change direction
      if (Math.random() < 0.01) {
        fish.speedX = (Math.random() - 0.5) * 2;
        fish.speedY = (Math.random() - 0.5) * 1;
      }
    });
  }
  
  /**
   * Draw the game
   */
  draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw water
    this.ctx.fillStyle = '#115577';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw water surface
    this.ctx.fillStyle = '#88CCFF';
    this.ctx.fillRect(0, 0, this.canvas.width, 100);
    
    // Draw shore
    this.ctx.fillStyle = '#CC9966';
    this.ctx.fillRect(0, 0, 150, this.canvas.height);
    
    // Draw fishing rod
    this.drawFishingRod();
    
    // Draw fish
    this.drawFish();
    
    // Draw UI elements based on game state
    switch (this.state) {
      case 'waiting':
        // Draw instruction
        this.ctx.fillStyle = 'white';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Press "Cast Line" to begin fishing', this.canvas.width / 2, 50);
        break;
        
      case 'casting':
        // Draw cast power meter
        this.drawCastMeter();
        break;
        
      case 'reeling':
        // Draw fishing line
        this.drawFishingLine();
        
        // Draw hook
        this.drawHook();
        
        // Draw instruction
        this.ctx.fillStyle = 'white';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        
        if (this.hook.hasFish) {
          this.ctx.fillText('Fish on! Click "Reel In" to catch it!', this.canvas.width / 2, 50);
        } else {
          this.ctx.fillText('Waiting for a bite...', this.canvas.width / 2, 50);
        }
        break;
    }
  }
  
  // Drawing helper methods
  drawFishingRod() {
    // Draw fishing rod
    this.ctx.strokeStyle = '#8B4513';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(50, 100);
    this.ctx.lineTo(100, 50);
    this.ctx.stroke();
    
    // Draw person
    this.ctx.fillStyle = '#FFB6C1';
    this.ctx.beginPath();
    this.ctx.arc(40, 120, 15, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.fillStyle = '#6495ED';
    this.ctx.fillRect(30, 135, 20, 30);
  }
  
  drawFishingLine() {
    // Draw fishing line from rod tip to hook
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(100, 50);
    this.ctx.lineTo(this.hook.x, this.hook.y);
    this.ctx.stroke();
  }
  
  drawHook() {
    // Draw the hook
    this.ctx.fillStyle = 'silver';
    this.ctx.beginPath();
    this.ctx.arc(this.hook.x, this.hook.y, 5, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw hook extension
    this.ctx.beginPath();
    this.ctx.moveTo(this.hook.x, this.hook.y);
    this.ctx.lineTo(this.hook.x, this.hook.y + 10);
    this.ctx.lineTo(this.hook.x - 5, this.hook.y + 15);
    this.ctx.stroke();
    
    // If there's a fish on the hook, draw it
    if (this.hook.hasFish) {
      const fish = this.hook.fishType;
      this.ctx.fillStyle = this.getFishColor(fish);
      this.ctx.beginPath();
      this.ctx.ellipse(this.hook.x, this.hook.y + 5, fish.size / 2 || 20, fish.size / 4 || 10, 0, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Draw fish eye
      this.ctx.fillStyle = 'white';
      this.ctx.beginPath();
      this.ctx.arc(this.hook.x + 8, this.hook.y, 3, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.fillStyle = 'black';
      this.ctx.beginPath();
      this.ctx.arc(this.hook.x + 9, this.hook.y, 1, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Draw fish tail
      this.ctx.fillStyle = this.getFishColor(fish);
      this.ctx.beginPath();
      this.ctx.moveTo(this.hook.x - fish.size / 2 || 10, this.hook.y + 5);
      this.ctx.lineTo(this.hook.x - (fish.size / 2 + 10) || 20, this.hook.y);
      this.ctx.lineTo(this.hook.x - (fish.size / 2 + 10) || 20, this.hook.y + 10);
      this.ctx.closePath();
      this.ctx.fill();
    }
  }
  
  drawFish() {
    // Draw all active fish
    this.activeFish.forEach(fish => {
      this.ctx.fillStyle = this.getFishColor(fish.type);
      
      // Draw fish body
      this.ctx.beginPath();
      this.ctx.ellipse(fish.x, fish.y, fish.type.size / 2 || 20, fish.type.size / 4 || 10, 0, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Draw fish eye
      this.ctx.fillStyle = 'white';
      this.ctx.beginPath();
      this.ctx.arc(fish.x + 8, fish.y - 2, 3, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.fillStyle = 'black';
      this.ctx.beginPath();
      this.ctx.arc(fish.x + 9, fish.y - 2, 1, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Draw fish tail
      this.ctx.fillStyle = this.getFishColor(fish.type);
      this.ctx.beginPath();
      this.ctx.moveTo(fish.x - fish.type.size / 2 || 10, fish.y);
      this.ctx.lineTo(fish.x - (fish.type.size / 2 + 10) || 20, fish.y - 5);
      this.ctx.lineTo(fish.x - (fish.type.size / 2 + 10) || 20, fish.y + 5);
      this.ctx.closePath();
      this.ctx.fill();
    });
  }
  
  drawCastMeter() {
    // Draw background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(this.canvas.width / 2 - 100, 20, 200, 20);
    
    // Draw meter
    this.ctx.fillStyle = '#39FF14';
    this.ctx.fillRect(this.canvas.width / 2 - 100, 20, this.castMeterValue * 2, 20);
    
    // Draw border
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(this.canvas.width / 2 - 100, 20, 200, 20);
    
    // Draw instruction
    this.ctx.fillStyle = 'white';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Click to cast!', this.canvas.width / 2, 60);
  }
  
  /**
   * Get the color for a fish based on its rarity
   * @param {Object} fish - Fish object
   * @returns {string} Color
   */
  getFishColor(fish) {
    if (!fish) return '#6699CC';
    
    if (fish.color) return fish.color;
    
    // Determine color based on rarity
    switch(fish.rarity) {
      case 'legendary': return '#CC3333';
      case 'rare': return '#99CC66';
      case 'uncommon': return '#336699';
      case 'common':
      default: return '#6699CC';
    }
  }
}

/**
 * Start a new fishing session
 * @param {string} containerId - Container element ID
 * @param {Object} equipment - Optional fishing equipment
 * @returns {StoreBasedFishingGame} The fishing game instance
 */
export function startFishingSession(containerId, equipment = null) {
  // Set equipment in the store if provided
  if (equipment) {
    const rod = {
      id: `rod_${Date.now()}`,
      name: equipment.rod.name || 'Basic Rod',
      type: 'equipment',
      quality: equipment.rod.quality || 1,
      reelSpeed: equipment.rod.reelSpeed || 1,
      catchBonus: equipment.rod.catchBonus || 0
    };
    
    const lure = {
      id: `lure_${Date.now()}`,
      name: equipment.lure.name || 'Basic Lure',
      type: 'equipment',
      attractPower: equipment.lure.attractPower || 1,
      rarityBonus: equipment.lure.rarityBonus || 0
    };
    
    FishingGameSession.setFishingEquipment(rod.id, lure.id);
  }
  
  // Return new game instance
  return new StoreBasedFishingGame(containerId);
}

export default StoreBasedFishingGame; 