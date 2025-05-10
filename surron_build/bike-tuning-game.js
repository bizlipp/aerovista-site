// bike-tuning-game.js - Mini-game for tuning bikes to show Charlie

/**
 * TuningGame - A mini-game for tuning Sur-Ron bikes
 * Players need to optimize various parameters to get Charlie's approval
 */
class TuningGame {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error('Tuning game container not found');
      return;
    }
    
    // Game state
    this.parameters = {
      voltage: 50,
      amperage: 50,
      torque: 50,
      cooling: 50,
      weight: 50
    };
    
    // Target ranges for each parameter (min, ideal, max)
    this.targets = {
      voltage: { min: 40, ideal: 72, max: 85 },
      amperage: { min: 30, ideal: 65, max: 80 },
      torque: { min: 45, ideal: 70, max: 90 },
      cooling: { min: 60, ideal: 75, max: 95 },
      weight: { min: 20, ideal: 40, max: 60 }
    };
    
    // Charlie's comments based on performance
    this.comments = {
      excellent: [
        "PERFECT! This thing's going to RIP!",
        "OH YEAH! That's what I'm talking about!",
        "EPIC BUILD! This is Sur-Ron Squad material!",
        "You've got the Charlie stamp of approval!",
        "We're definitely taking this to the midnight trails!"
      ],
      good: [
        "Not bad! Could use a bit more juice though.",
        "Pretty solid. Let's push it a bit further.",
        "Good start. Let's crank the voltage higher!",
        "It's getting there. More power! MORE POWER!",
        "I like where this is going. Just a few tweaks..."
      ],
      poor: [
        "Is this a bicycle? WHERE'S THE POWER?",
        "My grandma could outrun this thing.",
        "Did you even try? This needs serious work.",
        "Are we building a Sur-Ron or a scooter?",
        "Back to the drawing board. This is embarrassing."
      ],
      danger: [
        "WHOA! Too hot! That battery's gonna explode!",
        "TOO MUCH! My eyebrows are singed just looking at it!",
        "DANGER ZONE! Even I think that's too extreme!",
        "You're trying to make a rocket, not a bike!",
        "That's gonna melt, catch fire, or both. Awesome but deadly!"
      ]
    };
    
    // Game progress and score
    this.score = 0;
    this.attempts = 0;
    this.maxAttempts = 3;
    this.gameComplete = false;
    
    // Create and render the game
    this.createGameUI();
    this.renderParameters();
    this.attachEventListeners();
  }
  
  /**
   * Create the game UI
   */
  createGameUI() {
    // Clear container
    this.container.innerHTML = '';
    
    // Create game layout
    this.container.innerHTML = `
      <div class="tuning-game">
        <div class="game-header">
          <h3>Sur-Ron Tuning Station</h3>
          <p>Tune the bike to Charlie's specifications. You have ${this.maxAttempts} attempts.</p>
        </div>
        
        <div class="tuning-parameters">
          <div class="parameter-row">
            <label for="voltage">Voltage (V):</label>
            <input type="range" id="voltage" min="0" max="100" value="${this.parameters.voltage}">
            <span class="parameter-value">${this.parameters.voltage}</span>
          </div>
          
          <div class="parameter-row">
            <label for="amperage">Amperage (A):</label>
            <input type="range" id="amperage" min="0" max="100" value="${this.parameters.amperage}">
            <span class="parameter-value">${this.parameters.amperage}</span>
          </div>
          
          <div class="parameter-row">
            <label for="torque">Torque (Nm):</label>
            <input type="range" id="torque" min="0" max="100" value="${this.parameters.torque}">
            <span class="parameter-value">${this.parameters.torque}</span>
          </div>
          
          <div class="parameter-row">
            <label for="cooling">Cooling (%):</label>
            <input type="range" id="cooling" min="0" max="100" value="${this.parameters.cooling}">
            <span class="parameter-value">${this.parameters.cooling}</span>
          </div>
          
          <div class="parameter-row">
            <label for="weight">Weight Reduction (%):</label>
            <input type="range" id="weight" min="0" max="100" value="${this.parameters.weight}">
            <span class="parameter-value">${this.parameters.weight}</span>
          </div>
        </div>
        
        <div class="tuning-actions">
          <button id="test-bike" class="btn-test">Test Bike</button>
          <button id="reset-tuning" class="btn-reset">Reset Tuning</button>
          <button id="show-charlie" class="btn-show-charlie" disabled>Show Charlie</button>
        </div>
        
        <div class="tuning-feedback">
          <div class="charlie-comment">
            <img src="images/surron-charlie-alert-pose.png" alt="Charlie" class="charlie-img">
            <div class="comment-bubble">
              <p>Let's see what you've got! Tune it up and hit Test.</p>
            </div>
          </div>
          
          <div class="test-results" style="display: none">
            <h4>Test Results</h4>
            <div class="parameters-chart">
              <!-- This will be filled dynamically -->
            </div>
            <p class="attempts-left">Attempts remaining: <span id="attempts-count">${this.maxAttempts}</span></p>
          </div>
        </div>
      </div>
    `;
    
    // Add styles
    this.addStyles();
  }
  
  /**
   * Add CSS styles for the game
   */
  addStyles() {
    const styleId = 'tuning-game-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .tuning-game {
        font-family: 'Rajdhani', sans-serif;
        color: var(--squad-text);
        background: var(--squad-dark);
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
      }
      
      .game-header {
        text-align: center;
        margin-bottom: 1.5rem;
      }
      
      .game-header h3 {
        font-family: 'Bangers', cursive;
        color: var(--squad-neon);
        font-size: 1.8rem;
        margin: 0 0 0.5rem 0;
      }
      
      .tuning-parameters {
        background: rgba(0, 0, 0, 0.3);
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
      }
      
      .parameter-row {
        display: flex;
        align-items: center;
        margin-bottom: 0.75rem;
      }
      
      .parameter-row label {
        flex: 0 0 150px;
        font-weight: bold;
      }
      
      .parameter-row input[type="range"] {
        flex: 1;
        height: 10px;
        background: #333;
        outline: none;
        border-radius: 5px;
      }
      
      .parameter-value {
        flex: 0 0 40px;
        text-align: right;
        font-weight: bold;
        margin-left: 10px;
      }
      
      .tuning-actions {
        display: flex;
        gap: 10px;
        margin-bottom: 1.5rem;
      }
      
      .tuning-actions button {
        flex: 1;
        padding: 0.75rem;
        border: none;
        border-radius: 5px;
        font-family: 'Rajdhani', sans-serif;
        font-weight: bold;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .btn-test {
        background: var(--squad-neon);
        color: black;
      }
      
      .btn-reset {
        background: #555;
        color: white;
      }
      
      .btn-show-charlie {
        background: var(--squad-primary);
        color: white;
      }
      
      .btn-show-charlie:disabled {
        background: #555;
        cursor: not-allowed;
        opacity: 0.5;
      }
      
      .tuning-feedback {
        background: rgba(0, 0, 0, 0.3);
        padding: 1rem;
        border-radius: 8px;
      }
      
      .charlie-comment {
        display: flex;
        align-items: flex-start;
        margin-bottom: 1rem;
      }
      
      .charlie-img {
        width: 80px;
        height: auto;
        margin-right: 15px;
      }
      
      .comment-bubble {
        background: var(--squad-primary);
        padding: 1rem;
        border-radius: 8px;
        position: relative;
        flex: 1;
      }
      
      .comment-bubble:before {
        content: '';
        position: absolute;
        left: -10px;
        top: 15px;
        border-width: 10px 10px 10px 0;
        border-style: solid;
        border-color: transparent var(--squad-primary) transparent transparent;
      }
      
      .parameters-chart {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin: 1rem 0;
      }
      
      .parameter-meter {
        height: 20px;
        background: #333;
        border-radius: 10px;
        overflow: hidden;
        position: relative;
      }
      
      .parameter-fill {
        height: 100%;
        background: var(--squad-neon);
        transition: width 0.5s;
      }
      
      .parameter-target {
        position: absolute;
        height: 100%;
        background: rgba(255, 255, 255, 0.2);
        border-left: 2px dashed white;
        border-right: 2px dashed white;
      }
      
      .parameter-label {
        display: flex;
        justify-content: space-between;
      }
      
      .parameter-status {
        font-weight: bold;
      }
      
      .status-good {
        color: #4CAF50;
      }
      
      .status-poor {
        color: #FF9800;
      }
      
      .status-danger {
        color: #F44336;
      }
      
      .attempts-left {
        text-align: right;
        font-style: italic;
        margin-top: 10px;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  /**
   * Attach event listeners to UI elements
   */
  attachEventListeners() {
    // Parameter sliders
    Object.keys(this.parameters).forEach(param => {
      const slider = document.getElementById(param);
      const valueDisplay = slider.nextElementSibling;
      
      slider.addEventListener('input', (e) => {
        this.parameters[param] = parseInt(e.target.value);
        valueDisplay.textContent = e.target.value;
      });
    });
    
    // Test button
    document.getElementById('test-bike').addEventListener('click', () => {
      this.testBike();
    });
    
    // Reset button
    document.getElementById('reset-tuning').addEventListener('click', () => {
      this.resetTuning();
    });
    
    // Show Charlie button
    document.getElementById('show-charlie').addEventListener('click', () => {
      this.showCharlie();
    });
  }
  
  /**
   * Update parameter displays
   */
  renderParameters() {
    Object.keys(this.parameters).forEach(param => {
      const slider = document.getElementById(param);
      const valueDisplay = slider.nextElementSibling;
      
      slider.value = this.parameters[param];
      valueDisplay.textContent = this.parameters[param];
    });
  }
  
  /**
   * Test the bike with current parameters
   */
  testBike() {
    // Increment attempts
    this.attempts++;
    document.getElementById('attempts-count').textContent = (this.maxAttempts - this.attempts);
    
    // Calculate score
    this.calculateScore();
    
    // Show results chart
    document.querySelector('.test-results').style.display = 'block';
    this.renderResultsChart();
    
    // Show Charlie's comment
    this.showCharlieComment();
    
    // Enable/disable Show Charlie button
    if (this.score >= 75 || this.attempts >= this.maxAttempts) {
      document.getElementById('show-charlie').disabled = false;
      this.gameComplete = true;
    }
    
    // If max attempts reached, disable test button
    if (this.attempts >= this.maxAttempts) {
      document.getElementById('test-bike').disabled = true;
    }
  }
  
  /**
   * Calculate score based on how close parameters are to targets
   */
  calculateScore() {
    let totalScore = 0;
    let maxPossibleScore = 0;
    
    Object.keys(this.parameters).forEach(param => {
      const value = this.parameters[param];
      const target = this.targets[param];
      
      // Calculate parameter score (0-100)
      let paramScore = 0;
      
      if (value < target.min) {
        // Too low
        paramScore = Math.max(0, 50 - ((target.min - value) * 5));
      } else if (value > target.max) {
        // Too high
        paramScore = Math.max(0, 50 - ((value - target.max) * 5));
      } else if (value < target.ideal) {
        // Between min and ideal
        paramScore = 50 + ((value - target.min) / (target.ideal - target.min)) * 50;
      } else {
        // Between ideal and max
        paramScore = 100 - ((value - target.ideal) / (target.max - target.ideal)) * 50;
      }
      
      totalScore += paramScore;
      maxPossibleScore += 100;
    });
    
    // Calculate final percentage score
    this.score = Math.round((totalScore / maxPossibleScore) * 100);
    
    console.log(`Bike test score: ${this.score}%`);
  }
  
  /**
   * Render the test results chart
   */
  renderResultsChart() {
    const chartContainer = document.querySelector('.parameters-chart');
    chartContainer.innerHTML = '';
    
    Object.keys(this.parameters).forEach(param => {
      const value = this.parameters[param];
      const target = this.targets[param];
      
      // Create parameter visualization
      const parameterDiv = document.createElement('div');
      
      // Determine status
      let status = 'good';
      let statusText = 'Good';
      
      if (value < target.min) {
        status = value < target.min * 0.5 ? 'poor' : 'poor';
        statusText = 'Too Low';
      } else if (value > target.max) {
        status = value > target.max * 1.5 ? 'danger' : 'poor';
        statusText = value > target.max * 1.5 ? 'DANGER!' : 'Too High';
      } else {
        status = 'good';
        statusText = 'Good';
      }
      
      parameterDiv.innerHTML = `
        <div class="parameter-label">
          <span>${param.charAt(0).toUpperCase() + param.slice(1)}</span>
          <span class="parameter-status status-${status}">${statusText}</span>
        </div>
        <div class="parameter-meter">
          <div class="parameter-target" style="
            left: ${target.min}%; 
            width: ${target.max - target.min}%;
          "></div>
          <div class="parameter-fill" style="width: ${value}%;"></div>
        </div>
      `;
      
      chartContainer.appendChild(parameterDiv);
    });
    
    // Add overall score
    const scoreDiv = document.createElement('div');
    scoreDiv.innerHTML = `
      <div class="parameter-label">
        <span>Overall Score</span>
        <span class="parameter-status status-${this.score >= 75 ? 'good' : this.score >= 50 ? 'poor' : 'danger'}">
          ${this.score}%
        </span>
      </div>
      <div class="parameter-meter">
        <div class="parameter-fill" style="width: ${this.score}%;"></div>
      </div>
    `;
    chartContainer.appendChild(scoreDiv);
  }
  
  /**
   * Show Charlie's comment based on score
   */
  showCharlieComment() {
    const commentBubble = document.querySelector('.comment-bubble');
    let comment = '';
    
    if (this.score >= 90) {
      // Excellent
      comment = this.comments.excellent[Math.floor(Math.random() * this.comments.excellent.length)];
    } else if (this.score >= 75) {
      // Good
      comment = this.comments.good[Math.floor(Math.random() * this.comments.good.length)];
    } else if (this.score >= 40) {
      // Poor
      comment = this.comments.poor[Math.floor(Math.random() * this.comments.poor.length)];
    } else {
      // Danger
      comment = this.comments.danger[Math.floor(Math.random() * this.comments.danger.length)];
    }
    
    commentBubble.innerHTML = `<p>${comment}</p>`;
  }
  
  /**
   * Reset tuning parameters
   */
  resetTuning() {
    // Reset parameters to default
    Object.keys(this.parameters).forEach(param => {
      this.parameters[param] = 50;
    });
    
    // Update UI
    this.renderParameters();
  }
  
  /**
   * Show Charlie the completed build
   */
  showCharlie() {
    if (!this.gameComplete) return;
    
    // Prepare result object
    const result = {
      score: this.score,
      parameters: {...this.parameters},
      attempts: this.attempts,
      feedback: this.score >= 75 ? 'approved' : 'needs_work'
    };
    
    // Dispatch event for build completion
    this.container.dispatchEvent(new CustomEvent('build-shown', { 
      detail: result
    }));
    
    // Close the game modal if it exists
    const gameModal = document.getElementById('tuning-game-modal');
    if (gameModal) {
      gameModal.style.display = 'none';
    }
    
    // Check for quest completion if score is good enough
    if (this.score >= 75 && window.gameBridge) {
      // Update state through GameBridge if available
      window.gameBridge.completeMission('charlie_build_review');
      window.gameBridge.showToast('Charlie approved your build design!', 'success');
      
      // Update quest board if it exists
      if (typeof window.updateQuestBoard === 'function') {
        window.updateQuestBoard();
      }
    }
  }
}

/**
 * Start the bike tuning game
 * @param {string} containerId - ID of the container element
 * @returns {TuningGame} The game instance
 */
export function startTuningGame(containerId) {
  return new TuningGame(containerId);
}

export default TuningGame; 