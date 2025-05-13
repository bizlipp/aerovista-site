/**
 * fishing-game-challenges.js
 * Challenge implementation for Billy's Fishing Adventure
 * Contains all the different challenge types and their game mechanics
 */

import SoundSystem from './fishing-game-sound.js';

/**
 * =================== TIMING CHALLENGE ===================
 * Players must click/tap at the right moment when indicator aligns
 */

/**
 * Initialize the timing challenge
 * @param {HTMLElement} container - Challenge container element
 */
export function initTimingChallenge(container) {
  // Set up challenge HTML
  container.innerHTML = `
    <div class="timing-challenge">
      <div class="timing-track">
        <div class="timing-target"></div>
        <div class="timing-indicator"></div>
      </div>
      <div class="timing-instruction">Click when the marker aligns with the target!</div>
      <div class="fish-struggle-indicator">
        <div class="fish-icon">🐟</div>
        <div class="struggle-text">The fish is testing your timing!</div>
      </div>
    </div>
  `;
  
  // Initialize challenge state
  this.timingState = {
    position: 0,
    direction: 1,
    speed: 1 + (this.activeChallenge.difficulty * 1.5),
    targetHit: false,
    hitAccuracy: 0,
    pulseEffect: 0
  };
  
  // Animate the target to pulse to draw attention
  const target = document.querySelector('.timing-target');
  if (target) {
    target.style.animation = 'pulse 0.8s infinite';
  }
  
  // Play sound
  SoundSystem.playSound('reel', { volume: 0.5, loop: true });
  
  // Add fish icon based on fish type
  const fishIcon = document.querySelector('.fish-icon');
  if (fishIcon && this.activeChallenge && this.activeChallenge.fish) {
    const fish = this.activeChallenge.fish;
    fishIcon.textContent = this.getFishEmoji(fish.rarity);
  }
}

/**
 * Update the timing challenge
 * @param {number} deltaTime - Time since last frame in ms
 */
export function updateTimingChallenge(deltaTime) {
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
 * Pulse the timing indicator for visual feedback
 */
export function pulseIndicator() {
  this.timingState.pulseEffect = 1;
  const indicator = document.querySelector('.timing-indicator');
  if (indicator) {
    indicator.style.boxShadow = '0 0 10px rgba(255,255,255,1)';
  }
  
  // Play a subtle sound for the direction change
  SoundSystem.playSound('lineTension', { volume: 0.1 });
}

/**
 * Handle timing challenge click
 */
export function handleTimingClick() {
  if (this.state !== 'challenge' || this.activeChallenge?.type !== 'timing') return;
  
  // Calculate accuracy (position 50 is perfect)
  const accuracy = 100 - Math.abs(this.timingState.position - 50) * 2;
  this.timingState.hitAccuracy = accuracy;
  this.timingState.targetHit = true;
  
  // Provide feedback
  const indicator = document.querySelector('.timing-indicator');
  if (indicator) {
    if (accuracy >= 80) {
      indicator.classList.add('perfect-hit');
      this.challengeScore = 100;
      this.showToast("Perfect timing!", "success");
      SoundSystem.playSound('catchRare', { volume: 0.7 });
    } else if (accuracy >= 50) {
      indicator.classList.add('good-hit');
      this.challengeScore = 75;
      this.showToast("Good timing!", "success");
      SoundSystem.playSound('catchUncommon', { volume: 0.6 });
    } else {
      indicator.classList.add('poor-hit');
      this.challengeScore = 25;
      this.showToast("Poor timing!", "warning");
      SoundSystem.playSound('lineBreak', { volume: 0.4 });
    }
  }
  
  // Stop the timing sound
  SoundSystem.playSound('reel', { interrupt: true });
  
  // Complete the challenge after a delay to show the result
  setTimeout(() => {
    this.completeChallenge(this.challengeScore >= 50);
  }, 1000);
}

/**
 * =================== REELING CHALLENGE ===================
 * Players must tap/click rapidly to reel in the fish without breaking the line
 */

/**
 * Initialize the reeling challenge
 * @param {HTMLElement} container - Challenge container element
 */
export function initReelingChallenge(container) {
  // Set up challenge HTML
  container.innerHTML = `
    <div class="reeling-challenge">
      <div class="fish-strength-indicator">
        <div class="fish-icon">🐟</div>
        <div class="strength-text">Fish Strength</div>
        <div class="strength-meter">
          <div class="strength-fill"></div>
        </div>
      </div>
      <div class="reeling-meter">
        <div class="strain-warning"></div>
        <div class="strain-bar">
          <div class="strain-fill"></div>
        </div>
      </div>
      <div class="progress-meter">
        <div class="progress-fill"></div>
      </div>
      <div class="reeling-instruction">
        <span class="mobile-only">Tap rapidly to reel in the fish!</span>
        <span class="desktop-only">Click rapidly to reel in the fish!</span>
        <div class="strain-warning-text">Be careful not to break the line!</div>
      </div>
      <button class="reel-button" id="reel-challenge-button">REEL!</button>
    </div>
  `;
  
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
    fishStrength: 50 + (this.activeChallenge.fish.rarity * 10)
  };
  
  // Set up reeling button
  const reelButton = document.getElementById('reel-challenge-button');
  if (reelButton) {
    reelButton.addEventListener('click', this.handleReelingClick.bind(this));
    
    // Add touch event for mobile
    if (this.isMobile) {
      reelButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.handleReelingClick();
      });
    }
  }
  
  // Set initial fish strength display
  const strengthFill = document.querySelector('.strength-fill');
  if (strengthFill) {
    strengthFill.style.width = '100%';
  }
  
  // Add fish icon based on fish type
  const fishIcon = document.querySelector('.fish-icon');
  if (fishIcon && this.activeChallenge && this.activeChallenge.fish) {
    const fish = this.activeChallenge.fish;
    fishIcon.textContent = this.getFishEmoji(fish.rarity);
  }
  
  // Play line tension sound
  SoundSystem.playSound('lineTension', { volume: 0.3, loop: true });
  
  // Hide strain warning text initially
  const warningText = document.querySelector('.strain-warning-text');
  if (warningText) {
    warningText.style.opacity = '0';
  }
}

/**
 * Update the reeling challenge
 * @param {number} deltaTime - Time since last frame in ms
 */
export function updateReelingChallenge(deltaTime) {
  if (!this.reelingState) return;
  
  // Decay reel power over time
  this.reelingState.reelPower = Math.max(0, this.reelingState.reelPower - (this.reelingState.reelDecay * deltaTime / 16));
  
  // Calculate strain based on reel power
  if (this.reelingState.reelPower > 0) {
    // Increase strain when reeling
    this.reelingState.lineStrain += (this.reelingState.strainIncrease * this.reelingState.reelPower / 100) * (deltaTime / 16);
    
    // Increase progress when reeling
    this.reelingState.progress += (this.reelingState.reelPower / 20) * (deltaTime / 16);
    
    // Decrease fish strength when reeling successfully
    this.reelingState.fishStrength -= (this.reelingState.reelPower / 200) * (deltaTime / 16);
  } else {
    // Decrease strain when not reeling
    this.reelingState.lineStrain = Math.max(0, this.reelingState.lineStrain - 0.5 * (deltaTime / 16));
    
    // Fish recovers strength when not being reeled
    this.reelingState.fishStrength = Math.min(100, this.reelingState.fishStrength + 0.1 * (deltaTime / 16));
  }
  
  // Cap strain and fish strength
  this.reelingState.lineStrain = Math.min(this.reelingState.maxStrain, this.reelingState.lineStrain);
  this.reelingState.fishStrength = Math.max(0, this.reelingState.fishStrength);
  
  // Update UI
  this.updateReelingUI();
  
  // Fish tugs back occasionally
  if (Math.random() < 0.01 && this.reelingState.fishStrength > 20) {
    const tugStrength = (this.reelingState.fishStrength / 100) * 10 * this.activeChallenge.difficulty;
    this.reelingState.lineStrain += tugStrength;
    
    // Provide visual and haptic feedback for the tug
    const reelButton = document.getElementById('reel-challenge-button');
    if (reelButton) {
      reelButton.classList.add('fish-tugging');
      setTimeout(() => reelButton.classList.remove('fish-tugging'), 500);
    }
    
    // Play sound for the tug
    SoundSystem.playSound('lineTension', { volume: 0.4 + (tugStrength / 20) });
    
    // Vibrate for mobile
    if (this.isMobile && this.vibrationSupported) {
      this.vibrate(Math.round(tugStrength * 5));
    }
  }
  
  // Check for line break
  if (this.reelingState.lineStrain >= this.reelingState.maxStrain) {
    SoundSystem.playSound('lineBreak');
    SoundSystem.playSound('lineTension', { interrupt: true });
    this.showToast("The line broke! Reeled too hard.", "error");
    this.completeChallenge(false);
    return;
  }
  
  // Check for challenge completion
  if (this.reelingState.progress >= this.reelingState.progressNeeded || this.reelingState.fishStrength <= 0) {
    this.challengeScore = 100;
    SoundSystem.playSound('lineTension', { interrupt: true });
    this.completeChallenge(true);
  }
}

/**
 * Update the reeling challenge UI
 */
export function updateReelingUI() {
  // Update strain meter
  const strainFill = document.querySelector('.strain-fill');
  if (strainFill) {
    strainFill.style.width = `${(this.reelingState.lineStrain / this.reelingState.maxStrain) * 100}%`;
    
    // Change color based on strain
    if (this.reelingState.lineStrain > this.reelingState.maxStrain * 0.7) {
      strainFill.style.backgroundColor = '#F44336'; // Red
    } else if (this.reelingState.lineStrain > this.reelingState.maxStrain * 0.4) {
      strainFill.style.backgroundColor = '#FFC107'; // Yellow
    } else {
      strainFill.style.backgroundColor = '#4CAF50'; // Green
    }
  }
  
  // Update progress meter
  const progressFill = document.querySelector('.progress-fill');
  if (progressFill) {
    progressFill.style.width = `${(this.reelingState.progress / this.reelingState.progressNeeded) * 100}%`;
  }
  
  // Update fish strength meter
  const strengthFill = document.querySelector('.strength-fill');
  if (strengthFill) {
    strengthFill.style.width = `${this.reelingState.fishStrength}%`;
    
    // Change color based on remaining strength
    if (this.reelingState.fishStrength < 30) {
      strengthFill.style.backgroundColor = '#F44336'; // Red - almost caught
    } else if (this.reelingState.fishStrength < 60) {
      strengthFill.style.backgroundColor = '#FFC107'; // Yellow - tiring
    } else {
      strengthFill.style.backgroundColor = '#2196F3'; // Blue - strong
    }
  }
  
  // Update warning indicator
  const warning = document.querySelector('.strain-warning');
  if (warning) {
    warning.style.opacity = this.reelingState.lineStrain > this.reelingState.maxStrain * 0.7 ? '1' : '0';
  }
  
  // Update warning text
  const warningText = document.querySelector('.strain-warning-text');
  if (warningText) {
    if (this.reelingState.lineStrain > this.reelingState.maxStrain * 0.7) {
      warningText.style.opacity = '1';
      warningText.style.color = '#F44336';
    } else {
      warningText.style.opacity = '0';
    }
  }
  
  // Update reel button size based on power
  const reelButton = document.getElementById('reel-challenge-button');
  if (reelButton) {
    const scale = 1 + (this.reelingState.reelPower / 300);
    reelButton.style.transform = `scale(${scale})`;
  }
}

/**
 * Handle reel button click
 */
export function handleReelingClick() {
  if (this.state !== 'challenge' || this.activeChallenge?.type !== 'reeling') return;
  
  // Calculate time since last reel
  const now = Date.now();
  const timeSinceLast = now - (this.reelingState.lastReelTime || 0);
  this.reelingState.lastReelTime = now;
  
  // Calculate power based on click frequency
  let powerIncrease;
  
  if (timeSinceLast < 200) {
    // Clicking extremely fast
    powerIncrease = 15;
  } else if (timeSinceLast < 400) {
    // Clicking very fast
    powerIncrease = 10;
  } else if (timeSinceLast < 600) {
    // Clicking at moderate speed
    powerIncrease = 7;
  } else {
    // Clicking slowly
    powerIncrease = 5;
  }
  
  // Increase reel power
  this.reelingState.reelPower = Math.min(100, this.reelingState.reelPower + powerIncrease);
  
  // Play sound
  SoundSystem.playSound('reel', { volume: 0.3 + (this.reelingState.reelPower / 200) });
  
  // Haptic feedback on mobile
  if (this.isMobile && this.vibrationSupported) {
    this.vibrate(Math.min(50, 10 + this.reelingState.reelPower / 2));
  }
}

/**
 * Handle mobile reel touch event
 */
export function handleReelingTouch() {
  // Just call the click handler as the logic is the same
  this.handleReelingClick();
}

/**
 * =================== BALANCING CHALLENGE ===================
 * Players must keep an indicator within a target zone by moving up and down
 */

/**
 * Initialize the balancing challenge
 * @param {HTMLElement} container - Challenge container element
 */
export function initBalancingChallenge(container) {
  // Set up challenge HTML
  container.innerHTML = `
    <div class="balancing-challenge">
      <div class="balance-track">
        <div class="balance-target"></div>
        <div class="balance-indicator"></div>
      </div>
      <div class="balance-instruction">
        <span class="mobile-only">Move your finger up and down to keep the fish in the target zone!</span>
        <span class="desktop-only">Move your mouse up and down to keep the fish in the target zone!</span>
      </div>
    </div>
  `;
  
  // Initialize challenge state
  this.balancingState = {
    position: 50, // Start in the middle
    targetPosition: 50,
    targetSize: 30 - this.activeChallenge.difficulty * 10, // Target size (smaller = harder)
    targetMin: 0,
    targetMax: 0,
    fishPull: 0,
    fishPullDirection: Math.random() > 0.5 ? 1 : -1,
    fishPullForce: this.activeChallenge.difficulty * 0.8,
    inTargetTime: 0,
    timeNeeded: 3000 // Time needed in target to win
  };
  
  // Calculate target bounds
  this.balancingState.targetMin = 50 - (this.balancingState.targetSize / 2);
  this.balancingState.targetMax = 50 + (this.balancingState.targetSize / 2);
  
  // Position the target zone
  const target = document.querySelector('.balance-target');
  if (target) {
    target.style.top = `${this.balancingState.targetMin}%`;
    target.style.height = `${this.balancingState.targetSize}%`;
  }
  
  // Play sound
  SoundSystem.playSound('lineTension', { volume: 0.4, loop: true });
}

/**
 * Update the balancing challenge
 * @param {number} deltaTime - Time since last frame in ms
 */
export function updateBalancingChallenge(deltaTime) {
  if (!this.balancingState) return;
  
  // Update fish pull direction occasionally
  if (Math.random() < 0.02) {
    this.balancingState.fishPullDirection *= -1;
  }
  
  // Update fish pull force
  this.balancingState.fishPull += this.balancingState.fishPullDirection * 
                                 (this.balancingState.fishPullForce * deltaTime / 16);
  
  // Cap pull force
  this.balancingState.fishPull = Math.max(-5, Math.min(5, this.balancingState.fishPull));
  
  // Apply pull to position if no recent input
  if (Date.now() - (this.balancingState.lastInputTime || 0) > 500) {
    this.balancingState.position += this.balancingState.fishPull * (deltaTime / 16);
    
    // Keep within bounds
    this.balancingState.position = Math.max(0, Math.min(100, this.balancingState.position));
  }
  
  // Update indicator position
  const indicator = document.querySelector('.balance-indicator');
  if (indicator) {
    indicator.style.top = `${this.balancingState.position}%`;
    
    // Change color based on whether in target zone
    const inTarget = this.balancingState.position >= this.balancingState.targetMin && 
                     this.balancingState.position <= this.balancingState.targetMax;
    
    indicator.classList.toggle('in-target', inTarget);
    
    // Track time in target
    if (inTarget) {
      this.balancingState.inTargetTime += deltaTime;
      
      // Check for win condition
      if (this.balancingState.inTargetTime >= this.balancingState.timeNeeded) {
        this.challengeScore = 100;
        SoundSystem.playSound('lineTension', { interrupt: true });
        this.completeChallenge(true);
      }
    } else {
      // Reset time if outside target
      this.balancingState.inTargetTime = Math.max(0, this.balancingState.inTargetTime - deltaTime * 2);
    }
  }
  
  // Update progress in challenge progress bar
  const progressFill = document.getElementById('challenge-progress-fill');
  if (progressFill) {
    const progress = Math.min(this.balancingState.inTargetTime / this.balancingState.timeNeeded, 1);
    progressFill.style.width = `${progress * 100}%`;
  }
}

/**
 * Handle mouse move for balancing challenge
 * @param {number} normalizedY - Y position normalized to 0-1
 */
export function handleBalancingMove(normalizedY) {
  if (this.state !== 'challenge' || this.activeChallenge?.type !== 'balancing') return;
  
  // Update position based on mouse/touch Y position
  this.balancingState.position = normalizedY * 100;
  this.balancingState.lastInputTime = Date.now();
  
  // Play subtle sound
  if (Math.random() < 0.1) {
    SoundSystem.playSound('lineTension', { volume: 0.1 + Math.random() * 0.1 });
  }
}

/**
 * =================== PATIENCE CHALLENGE ===================
 * Players must hold steady without moving until the fish tires
 */

/**
 * Initialize the patience challenge
 * @param {HTMLElement} container - Challenge container element
 */
export function initPatienceChallenge(container) {
  // Set up challenge HTML
  container.innerHTML = `
    <div class="patience-challenge">
      <div class="patience-meter">
        <div class="patience-fill"></div>
      </div>
      <div class="patience-warning hidden">Hold steady!</div>
      <div class="patience-instruction">
        <span>Stay calm and don't move until the fish tires out!</span>
      </div>
    </div>
  `;
  
  // Initialize challenge state
  this.patienceState = {
    steadyTime: 0,
    movementDetected: false,
    lastX: 0,
    lastY: 0,
    warningTime: 0,
    timeNeeded: this.activeChallenge.duration * 0.8,
    sensitivityThreshold: 5 - this.activeChallenge.difficulty * 2 // Lower = more sensitive
  };
  
  // Capture initial position
  const rect = this.canvas.getBoundingClientRect();
  this.patienceState.lastX = rect.width / 2;
  this.patienceState.lastY = rect.height / 2;
  
  // Setup movement detection
  document.addEventListener('mousemove', this.handlePatienceMouseMove);
  document.addEventListener('touchmove', this.handlePatienceTouchMove);
  
  // Play tension sound
  SoundSystem.playSound('lineTension', { volume: 0.2, loop: true });
}

/**
 * Clean up patience challenge
 */
export function cleanupPatienceChallenge() {
  // Remove event listeners
  document.removeEventListener('mousemove', this.handlePatienceMouseMove);
  document.removeEventListener('touchmove', this.handlePatienceTouchMove);
}

/**
 * Update the patience challenge
 * @param {number} deltaTime - Time since last frame in ms
 */
export function updatePatienceChallenge(deltaTime) {
  if (!this.patienceState) return;
  
  if (this.patienceState.movementDetected) {
    // Decrease steady time when movement detected
    this.patienceState.steadyTime = Math.max(0, this.patienceState.steadyTime - deltaTime * 2);
    this.patienceState.warningTime += deltaTime;
    
    // Show warning
    const warning = document.querySelector('.patience-warning');
    if (warning) {
      warning.classList.remove('hidden');
    }
    
    // Reset after a delay
    if (this.patienceState.warningTime > 1000) {
      this.patienceState.movementDetected = false;
      this.patienceState.warningTime = 0;
      
      // Hide warning
      if (warning) {
        warning.classList.add('hidden');
      }
    }
  } else {
    // Increase steady time when still
    this.patienceState.steadyTime += deltaTime;
    
    // Create ripples occasionally for visual feedback
    if (Math.random() < 0.02) {
      this.createWaterRipple(this.hookPosition.x, this.hookPosition.y);
    }
  }
  
  // Update progress meter
  const fill = document.querySelector('.patience-fill');
  if (fill) {
    fill.style.width = `${(this.patienceState.steadyTime / this.patienceState.timeNeeded) * 100}%`;
  }
  
  // Update challenge progress
  const progressFill = document.getElementById('challenge-progress-fill');
  if (progressFill) {
    const progress = Math.min(this.patienceState.steadyTime / this.patienceState.timeNeeded, 1);
    progressFill.style.width = `${progress * 100}%`;
  }
  
  // Check for win condition
  if (this.patienceState.steadyTime >= this.patienceState.timeNeeded) {
    this.challengeScore = 100;
    SoundSystem.playSound('lineTension', { interrupt: true });
    this.cleanupPatienceChallenge();
    this.completeChallenge(true);
  }
}

/**
 * Handle mouse movement for patience challenge
 * @param {MouseEvent} e - Mouse move event
 */
export function handlePatienceMouseMove(e) {
  if (this.state !== 'challenge' || this.activeChallenge?.type !== 'patience') return;
  
  // Check for significant movement
  const deltaX = Math.abs(e.clientX - this.patienceState.lastX);
  const deltaY = Math.abs(e.clientY - this.patienceState.lastY);
  
  if (deltaX > this.patienceState.sensitivityThreshold || 
      deltaY > this.patienceState.sensitivityThreshold) {
    this.patienceState.movementDetected = true;
    SoundSystem.playSound('lineTension', { volume: 0.4 });
  }
  
  // Update last position
  this.patienceState.lastX = e.clientX;
  this.patienceState.lastY = e.clientY;
}

/**
 * Handle touch movement for patience challenge
 * @param {TouchEvent} e - Touch move event
 */
export function handlePatienceTouchMove(e) {
  if (this.state !== 'challenge' || this.activeChallenge?.type !== 'patience') return;
  
  const touch = e.touches[0];
  
  // Check for significant movement
  const deltaX = Math.abs(touch.clientX - this.patienceState.lastX);
  const deltaY = Math.abs(touch.clientY - this.patienceState.lastY);
  
  if (deltaX > this.patienceState.sensitivityThreshold || 
      deltaY > this.patienceState.sensitivityThreshold) {
    this.patienceState.movementDetected = true;
    SoundSystem.playSound('lineTension', { volume: 0.4 });
    
    // Haptic feedback
    if (this.isMobile && this.vibrationSupported) {
      this.vibrate(50);
    }
  }
  
  // Update last position
  this.patienceState.lastX = touch.clientX;
  this.patienceState.lastY = touch.clientY;
} 