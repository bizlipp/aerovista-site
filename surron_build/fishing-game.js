// Surron Squad Fishing Mini-Game
import GameCore from './game/GameCore.js';

class FishingGame {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);
    
    // Game dimensions
    this.width = 600;
    this.height = 400;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    // Game state
    this.state = 'waiting'; // waiting, casting, reeling, caught
    this.playerRod = {
      x: 100,
      y: 100,
      power: 50, // Casting power percentage
      rodQuality: 1, // Will be affected by equipment
      reelSpeed: 1, // Will be affected by equipment
      catchBonus: 0 // Will be affected by equipment
    };
    
    // Fish state
    this.fishTypes = [
      { name: 'Small Perch', value: 10, rarity: 'common', difficulty: 1, size: 20, color: '#88CCFF' },
      { name: 'Bluegill', value: 15, rarity: 'common', difficulty: 1, size: 25, color: '#6699CC' },
      { name: 'Crappie', value: 20, rarity: 'common', difficulty: 2, size: 30, color: '#99CCFF' },
      { name: 'Bass', value: 50, rarity: 'uncommon', difficulty: 3, size: 40, color: '#336699' },
      { name: 'Trout', value: 75, rarity: 'uncommon', difficulty: 3, size: 35, color: '#99AACC' },
      { name: 'Walleye', value: 100, rarity: 'rare', difficulty: 4, size: 45, color: '#FFCC66' },
      { name: 'Northern Pike', value: 150, rarity: 'rare', difficulty: 5, size: 60, color: '#99CC66' },
      { name: 'Billy\'s Monster Bass', value: 500, rarity: 'legendary', difficulty: 10, size: 80, color: '#CC3333' }
    ];
    
    this.activeFish = [];
    this.hook = { x: 0, y: 0, hasFish: false, fishType: null };
    this.lure = {
      type: 'Basic Lure',
      attractPower: 1,
      rarityBonus: 0
    };
    
    // Time tracking
    this.lastTimestamp = 0;
    this.castTime = 0;
    
    // Cast meter animation
    this.castMeterDirection = 1;
    this.castMeterValue = 0;
    
    // Fishing results
    this.caughtFish = [];
    this.sessionValue = 0;
    
    // Bind methods
    this.handleClick = this.handleClick.bind(this);
    this.update = this.update.bind(this);
    this.draw = this.draw.bind(this);
    this.startGame = this.startGame.bind(this);
    this.endGame = this.endGame.bind(this);
    
    // Set up user interface
    this.createUI();
    
    // Add event listeners
    this.canvas.addEventListener('click', this.handleClick);
    
    // Start game loop
    this.lastTimestamp = performance.now();
    requestAnimationFrame(this.update);
  }
  
  createUI() {
    // Create UI container
    this.uiContainer = document.createElement('div');
    this.uiContainer.className = 'fishing-ui';
    this.container.appendChild(this.uiContainer);
    
    // Create game controls
    const controls = document.createElement('div');
    controls.className = 'fishing-controls';
    controls.innerHTML = `
      <button id="cast-btn" class="fishing-btn">Cast Line</button>
      <button id="reel-btn" class="fishing-btn" disabled>Reel In</button>
      <button id="end-fishing-btn" class="fishing-btn">End Fishing</button>
    `;
    this.uiContainer.appendChild(controls);
    
    // Create fishing stats
    const stats = document.createElement('div');
    stats.className = 'fishing-stats';
    stats.innerHTML = `
      <div class="stat-row">
        <span>Rod Quality:</span>
        <span id="rod-quality">Basic</span>
      </div>
      <div class="stat-row">
        <span>Lure Type:</span>
        <span id="lure-type">Basic Lure</span>
      </div>
      <div class="stat-row">
        <span>Fish Caught:</span>
        <span id="fish-count">0</span>
      </div>
      <div class="stat-row">
        <span>Session Value:</span>
        <span id="session-value">0 SurCoins</span>
      </div>
    `;
    this.uiContainer.appendChild(stats);
    
    // Create catch log
    const catchLog = document.createElement('div');
    catchLog.className = 'catch-log';
    catchLog.innerHTML = `
      <h3>Catch Log</h3>
      <ul id="catch-list"></ul>
    `;
    this.uiContainer.appendChild(catchLog);
    
    // Add event listeners to buttons
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
      // Explicitly close the modal
      const fishingModal = document.getElementById('fishing-modal');
      if (fishingModal) {
        fishingModal.style.display = 'none';
      }
    });
    
    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
      .fishing-ui {
        margin-top: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      
      .fishing-controls {
        display: flex;
        gap: 0.5rem;
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
      
      .fishing-stats {
        background: rgba(0, 0, 0, 0.3);
        padding: 1rem;
        border-radius: 8px;
      }
      
      .stat-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
      }
      
      .catch-log {
        background: rgba(0, 0, 0, 0.3);
        padding: 1rem;
        border-radius: 8px;
        max-height: 200px;
        overflow-y: auto;
      }
      
      .catch-log h3 {
        margin-top: 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        padding-bottom: 0.5rem;
      }
      
      #catch-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      #catch-list li {
        padding: 0.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
      }
      
      #catch-list li:last-child {
        border-bottom: none;
      }
      
      #catch-list .fish-name {
        font-weight: bold;
      }
      
      #catch-list .fish-value {
        color: var(--squad-neon);
      }
      
      canvas {
        background: #115577;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
    `;
    document.head.appendChild(style);
  }
  
  startGame() {
    // Reset game state
    this.state = 'waiting';
    this.caughtFish = [];
    this.sessionValue = 0;
    this.activeFish = [];
    
    // Spawn initial fish
    this.spawnFish(5);
    
    // Update UI
    document.getElementById('fish-count').textContent = '0';
    document.getElementById('session-value').textContent = '0 SurCoins';
    document.getElementById('catch-list').innerHTML = '';
    document.getElementById('cast-btn').disabled = false;
    document.getElementById('reel-btn').disabled = true;
  }
  
  endGame() {
    this.state = 'ended';
    
    // Calculate total catch value
    let totalValue = 0;
    this.caughtFish.forEach(fish => {
      totalValue += fish.value;
    });
    
    // Update player stats if available
    // Use GameCore instead of playerState
    if (GameCore) {
      // Add currency
      GameCore.addCurrency(totalValue);
      
      console.log(`[FISHING] Adding ${totalValue} currency to player`);
      
      // Add reputation - future replacement should use GameCore function
      // For now, modify directly since there's no explicit GameCore method for this
      const currentState = GameCore.getPlayerState();
      if (currentState && typeof currentState.reputation === 'number') {
        GameCore.updateRelationship('billy', 1);
        
        // Calculate XP gain - more fish = more XP
        const xpGained = this.caughtFish.length * 5 + Math.floor(totalValue / 10);
        
        // Add XP
        GameCore.addXP(xpGained);
        
        console.log(`[FISHING] Added ${xpGained} XP and increased Billy relationship`);
      }
    }
    
    // Display final results
    this.showResultsDialog(totalValue);
    
    // Clean up event listeners
    this.canvas.removeEventListener('click', this.handleClick);
  }
  
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
  
  spawnFish(count) {
    for (let i = 0; i < count; i++) {
      // Determine fish type based on rarity
      const fishType = this.getRandomFishType();
      
      // Add fish to active fish
      this.activeFish.push({
        type: fishType,
        x: Math.random() * (this.width - 100) + 200,
        y: Math.random() * (this.height - 150) + 150,
        speedX: (Math.random() - 0.5) * 2,
        speedY: (Math.random() - 0.5) * 1,
        biteChance: 0.2 + (0.1 * this.lure.attractPower)
      });
    }
  }
  
  getRandomFishType() {
    // Apply lure rarity bonus
    const rarityRoll = Math.random() * (1 + this.lure.rarityBonus);
    
    if (rarityRoll > 0.97) {
      // Legendary fish (very rare)
      return this.fishTypes.find(fish => fish.rarity === 'legendary');
    } else if (rarityRoll > 0.85) {
      // Rare fish
      return this.fishTypes.filter(fish => fish.rarity === 'rare')[
        Math.floor(Math.random() * this.fishTypes.filter(fish => fish.rarity === 'rare').length)
      ];
    } else if (rarityRoll > 0.6) {
      // Uncommon fish
      return this.fishTypes.filter(fish => fish.rarity === 'uncommon')[
        Math.floor(Math.random() * this.fishTypes.filter(fish => fish.rarity === 'uncommon').length)
      ];
    } else {
      // Common fish
      return this.fishTypes.filter(fish => fish.rarity === 'common')[
        Math.floor(Math.random() * this.fishTypes.filter(fish => fish.rarity === 'common').length)
      ];
    }
  }
  
  cast(power) {
    // Calculate cast distance based on power and rod quality
    const distance = power * (0.8 + (this.playerRod.rodQuality * 0.2));
    
    // Set hook position
    this.hook.x = 100 + (distance * 4);
    this.hook.y = 150;
    
    // Change state
    this.state = 'reeling';
    
    // Enable reel button
    document.getElementById('reel-btn').disabled = false;
    
    // Disable cast button
    document.getElementById('cast-btn').disabled = true;
  }
  
  reelIn() {
    if (this.hook.hasFish) {
      // Caught a fish!
      const caughtFish = this.hook.fishType;
      
      // Add to caught list
      this.caughtFish.push(caughtFish);
      
      // Update session value
      this.sessionValue += caughtFish.value;
      
      // Update UI
      document.getElementById('fish-count').textContent = this.caughtFish.length;
      document.getElementById('session-value').textContent = `${this.sessionValue} SurCoins`;
      
      // Add to catch log
      const catchList = document.getElementById('catch-list');
      const listItem = document.createElement('li');
      listItem.innerHTML = `
        <span class="fish-name">${caughtFish.name}</span>
        <span class="fish-value">${caughtFish.value} SurCoins</span>
      `;
      catchList.insertBefore(listItem, catchList.firstChild);
      
      // Show catch notification
      this.showCatchNotification(caughtFish);
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
  
  showCatchNotification(fish) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'catch-notification';
    notification.innerHTML = `
      <h3>Fish Caught!</h3>
      <p class="fish-name">${fish.name}</p>
      <p class="fish-value">${fish.value} SurCoins</p>
    `;
    
    // Style the notification
    notification.style.position = 'absolute';
    notification.style.top = '50%';
    notification.style.left = '50%';
    notification.style.transform = 'translate(-50%, -50%)';
    notification.style.background = 'rgba(0, 0, 0, 0.8)';
    notification.style.color = 'white';
    notification.style.padding = '1.5rem';
    notification.style.borderRadius = '12px';
    notification.style.textAlign = 'center';
    notification.style.zIndex = '1000';
    notification.style.boxShadow = '0 0 20px rgba(57, 255, 20, 0.5)';
    notification.style.border = '2px solid var(--squad-neon)';
    
    // Add to container
    this.container.appendChild(notification);
    
    // Remove after delay
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.5s';
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 500);
    }, 2000);
  }
  
  showResultsDialog(totalValue) {
    // Calculate rewards
    const totalFish = this.caughtFish.length;
    
    // Generate report
    let report = `<h3>Fishing Session Completed!</h3>`;
    report += `<p>Fish Caught: <strong>${totalFish}</strong></p>`;
    report += `<p>Total Value: <strong>${totalValue} SurCoins</strong></p>`;
    
    if (this.caughtFish.length > 0) {
      report += `<h4>Your Catch:</h4>`;
      report += `<ul>`;
      this.caughtFish.forEach(fish => {
        report += `<li>${fish.name} (${fish.value} SurCoins)</li>`;
      });
      report += `</ul>`;
    } else {
      report += `<p>You didn't catch any fish today. Better luck next time!</p>`;
    }
    
    // Create dialog
    const dialog = document.createElement('div');
    dialog.className = 'fishing-results-dialog';
    dialog.innerHTML = report;
    
    // Style the dialog
    dialog.style.position = 'absolute';
    dialog.style.top = '50%';
    dialog.style.left = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
    dialog.style.background = 'rgba(0, 0, 0, 0.9)';
    dialog.style.color = 'white';
    dialog.style.padding = '2rem';
    dialog.style.borderRadius = '12px';
    dialog.style.zIndex = '1000';
    dialog.style.maxWidth = '400px';
    dialog.style.boxShadow = '0 0 30px rgba(57, 255, 20, 0.3)';
    dialog.style.border = '2px solid var(--squad-primary)';
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.padding = '0.5rem 1rem';
    closeButton.style.background = 'var(--squad-primary)';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.marginTop = '1rem';
    
    dialog.appendChild(closeButton);
    
    // Add to container
    this.container.appendChild(dialog);
    
    // Add close handler
    closeButton.addEventListener('click', () => {
      // Remove dialog
      if (dialog.parentNode) {
        dialog.parentNode.removeChild(dialog);
      }
      
      // Remove the fishing game
      if (this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
      
      // Close the fishing modal
      const fishingModal = document.getElementById('fishing-modal');
      if (fishingModal) {
        fishingModal.style.display = 'none';
      }
    });
  }
  
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
  
  updateFish(deltaTime) {
    this.activeFish.forEach(fish => {
      // Move fish
      fish.x += fish.speedX * deltaTime * 0.05;
      fish.y += fish.speedY * deltaTime * 0.05;
      
      // Bounce off edges
      if (fish.x < 200 || fish.x > this.width - 50) {
        fish.speedX *= -1;
      }
      
      if (fish.y < 150 || fish.y > this.height - 50) {
        fish.speedY *= -1;
      }
      
      // Occasionally change direction
      if (Math.random() < 0.01) {
        fish.speedX = (Math.random() - 0.5) * 2;
        fish.speedY = (Math.random() - 0.5) * 1;
      }
    });
  }
  
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
  
  update(timestamp) {
    // Calculate delta time
    const deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;
    
    // Update game logic
    this.updateGameLogic(deltaTime);
    
    // Draw everything
    this.draw();
    
    // Continue game loop
    requestAnimationFrame(this.update);
  }
  
  draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw water
    this.ctx.fillStyle = '#115577';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw water surface
    this.ctx.fillStyle = '#88CCFF';
    this.ctx.fillRect(0, 0, this.width, 100);
    
    // Draw shore
    this.ctx.fillStyle = '#CC9966';
    this.ctx.fillRect(0, 0, 150, this.height);
    
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
        this.ctx.fillText('Press "Cast Line" to begin fishing', this.width / 2, 50);
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
          this.ctx.fillText('Fish on! Click "Reel In" to catch it!', this.width / 2, 50);
        } else {
          this.ctx.fillText('Waiting for a bite...', this.width / 2, 50);
        }
        break;
    }
  }
  
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
      this.ctx.fillStyle = fish.color;
      this.ctx.beginPath();
      this.ctx.ellipse(this.hook.x, this.hook.y + 5, fish.size / 2, fish.size / 4, 0, 0, Math.PI * 2);
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
      this.ctx.fillStyle = fish.color;
      this.ctx.beginPath();
      this.ctx.moveTo(this.hook.x - fish.size / 2, this.hook.y + 5);
      this.ctx.lineTo(this.hook.x - fish.size / 2 - 10, this.hook.y);
      this.ctx.lineTo(this.hook.x - fish.size / 2 - 10, this.hook.y + 10);
      this.ctx.closePath();
      this.ctx.fill();
    }
  }
  
  drawFish() {
    // Draw all active fish
    this.activeFish.forEach(fish => {
      this.ctx.fillStyle = fish.type.color;
      
      // Draw fish body
      this.ctx.beginPath();
      this.ctx.ellipse(fish.x, fish.y, fish.type.size / 2, fish.type.size / 4, 0, 0, Math.PI * 2);
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
      this.ctx.fillStyle = fish.type.color;
      this.ctx.beginPath();
      this.ctx.moveTo(fish.x - fish.type.size / 2, fish.y);
      this.ctx.lineTo(fish.x - fish.type.size / 2 - 10, fish.y - 5);
      this.ctx.lineTo(fish.x - fish.type.size / 2 - 10, fish.y + 5);
      this.ctx.closePath();
      this.ctx.fill();
    });
  }
  
  drawCastMeter() {
    // Draw background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(this.width / 2 - 100, 20, 200, 20);
    
    // Draw meter
    this.ctx.fillStyle = '#39FF14';
    this.ctx.fillRect(this.width / 2 - 100, 20, this.castMeterValue * 2, 20);
    
    // Draw border
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(this.width / 2 - 100, 20, 200, 20);
    
    // Draw instruction
    this.ctx.fillStyle = 'white';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Click to cast!', this.width / 2, 60);
  }
  
  // Upgrades and equipment
  upgradeRod(quality, name) {
    this.playerRod.rodQuality = quality;
    document.getElementById('rod-quality').textContent = name;
  }
  
  upgradeLure(lureName, attractPower, rarityBonus) {
    this.lure.type = lureName;
    this.lure.attractPower = attractPower;
    this.lure.rarityBonus = rarityBonus;
    document.getElementById('lure-type').textContent = lureName;
  }
}

// Function to start a fishing session
function startFishingSession(containerId, equipment) {
  // Create container if it doesn't exist
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  }
  
  // Create fishing game instance
  const fishingGame = new FishingGame(containerId);
  
  // Apply equipment if provided
  if (equipment) {
    if (equipment.rod) {
      fishingGame.upgradeRod(equipment.rod.quality, equipment.rod.name);
    }
    
    if (equipment.lure) {
      fishingGame.upgradeLure(equipment.lure.name, equipment.lure.attractPower, equipment.lure.rarityBonus);
    }
  }
  
  // Start the game
  fishingGame.startGame();
  
  return fishingGame;
} 