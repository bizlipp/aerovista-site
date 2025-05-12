/**
 * BuildSelectorComponent.js
 * Allows player to customize and save Surron bike builds
 */

import ComponentBase from '../ui/ComponentBase.js';
import { store } from '../StateStackULTRA/store/gameStore.js';
import { getPlayerLevel } from '../selectors/playerSelectors.js';
import { showToast } from '../game/popup-toast.js';

export default class BuildSelectorComponent extends ComponentBase {
  constructor() {
    // Listen for changes to builds and player state
    super(['builds', 'player']);
    
    // Component state
    this.currentBuild = {
      id: `build_${Date.now()}`,
      name: 'New Build',
      frame: 'Standard',
      components: [],
      performance: {
        speed: 50,
        handling: 50,
        acceleration: 50,
        durability: 50
      }
    };
  }
  
  render(state) {
    if (!this.container) return;
    
    try {
      const builds = state.builds?.entities || {};
      const playerLevel = getPlayerLevel(state);
      const playerCurrency = state.player?.currency || 0;
      
      // Available components based on player level
      const availableComponents = this.getAvailableComponents(playerLevel);
      
      this.container.innerHTML = `
        <div class="component-container card">
          <h2>Surron Build Lab</h2>
          <p>Build and customize your dream Surron bike!</p>
          
          <div class="build-container">
            <div class="build-preview">
              <div class="build-image">
                <img src="images/bikeBuilds/surron-${this.currentBuild.frame.toLowerCase()}.png" 
                     alt="Surron ${this.currentBuild.frame}" 
                     onerror="this.src='images/bikeBuilds/surron-default.png'">
              </div>
              <div class="build-stats">
                ${Object.entries(this.currentBuild.performance).map(([stat, value]) => `
                  <div class="stat-row">
                    <div class="stat-name">${stat.charAt(0).toUpperCase() + stat.slice(1)}</div>
                    <div class="stat-bar">
                      <div class="stat-fill" style="width: ${value}%"></div>
                    </div>
                    <div class="stat-value">${value}</div>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <div class="build-options">
              <div class="build-form">
                <div class="form-group">
                  <label for="build-name">Build Name:</label>
                  <input type="text" id="build-name" value="${this.currentBuild.name}">
                </div>
                
                <div class="form-group">
                  <label for="frame-select">Frame:</label>
                  <select id="frame-select">
                    <option value="Standard" ${this.currentBuild.frame === 'Standard' ? 'selected' : ''}>Standard</option>
                    <option value="LightBee" ${this.currentBuild.frame === 'LightBee' ? 'selected' : ''}>Light Bee</option>
                    <option value="Storm" ${this.currentBuild.frame === 'Storm' ? 'selected' : ''}>Storm Bee</option>
                    ${playerLevel >= 10 ? `<option value="Ultra" ${this.currentBuild.frame === 'Ultra' ? 'selected' : ''}>Ultra Bee</option>` : ''}
                  </select>
                </div>
                
                <div class="components-section">
                  <h3>Components</h3>
                  <div class="component-list">
                    ${availableComponents.map(component => `
                      <div class="component-item ${this.currentBuild.components.includes(component.id) ? 'selected' : ''}">
                        <div class="component-info">
                          <span class="component-name">${component.name}</span>
                          <span class="component-cost">${component.cost} coins</span>
                        </div>
                        <div class="component-stats">
                          ${Object.entries(component.stats).map(([stat, value]) => 
                            value !== 0 ? `<span class="stat-change ${value > 0 ? 'positive' : 'negative'}">${stat}: ${value > 0 ? '+' : ''}${value}</span>` : ''
                          ).join('')}
                        </div>
                        <button class="component-toggle" data-component="${component.id}" 
                                ${playerCurrency < component.cost && !this.currentBuild.components.includes(component.id) ? 'disabled' : ''}>
                          ${this.currentBuild.components.includes(component.id) ? 'Remove' : 'Add'}
                        </button>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
              
              <div class="build-actions">
                <div class="currency-display">Available: ${playerCurrency} coins</div>
                <button id="save-build" class="btn-primary">Save Build</button>
                <button id="test-ride" class="btn-secondary">Test Ride</button>
                <button id="reset-build" class="btn-danger">Reset</button>
              </div>
            </div>
          </div>
          
          <div class="saved-builds">
            <h3>Your Builds</h3>
            ${Object.keys(builds).length === 0 ? 
              '<p>No saved builds yet. Create your first custom Surron!</p>' : 
              `<div class="build-list">
                ${Object.values(builds).map(build => `
                  <div class="build-card" data-build-id="${build.id}">
                    <h4>${build.name}</h4>
                    <div class="build-frame">Frame: ${build.frame}</div>
                    <div class="build-components">Components: ${build.components.length}</div>
                    <div class="build-actions">
                      <button class="btn-load-build" data-build-id="${build.id}">Load</button>
                      <button class="btn-delete-build" data-build-id="${build.id}">Delete</button>
                    </div>
                  </div>
                `).join('')}
              </div>`
            }
          </div>
        </div>
      `;
      
      this.addEventListeners();
    } catch (error) {
      console.error('Error rendering BuildSelectorComponent:', error);
      this.handleRenderError(error);
    }
  }
  
  addEventListeners() {
    // Build name input
    const nameInput = this.container.querySelector('#build-name');
    if (nameInput) {
      this.addListener(nameInput, 'change', (e) => {
        this.currentBuild.name = e.target.value;
      });
    }
    
    // Frame select
    const frameSelect = this.container.querySelector('#frame-select');
    if (frameSelect) {
      this.addListener(frameSelect, 'change', (e) => {
        this.currentBuild.frame = e.target.value;
        this.updateBuildStats();
        this.render(store.getState()); // Re-render to show updated frame
      });
    }
    
    // Component toggle buttons
    const componentButtons = this.container.querySelectorAll('.component-toggle:not([disabled])');
    componentButtons.forEach(button => {
      const componentId = button.dataset.component;
      this.addListener(button, 'click', () => this.toggleComponent(componentId));
    });
    
    // Save build button
    const saveButton = this.container.querySelector('#save-build');
    if (saveButton) {
      this.addListener(saveButton, 'click', this.saveBuild.bind(this));
    }
    
    // Test ride button
    const testButton = this.container.querySelector('#test-ride');
    if (testButton) {
      this.addListener(testButton, 'click', this.testRide.bind(this));
    }
    
    // Reset button
    const resetButton = this.container.querySelector('#reset-build');
    if (resetButton) {
      this.addListener(resetButton, 'click', this.resetBuild.bind(this));
    }
    
    // Load build buttons
    const loadButtons = this.container.querySelectorAll('.btn-load-build');
    loadButtons.forEach(button => {
      const buildId = button.dataset.buildId;
      this.addListener(button, 'click', () => this.loadBuild(buildId));
    });
    
    // Delete build buttons
    const deleteButtons = this.container.querySelectorAll('.btn-delete-build');
    deleteButtons.forEach(button => {
      const buildId = button.dataset.buildId;
      this.addListener(button, 'click', () => this.deleteBuild(buildId));
    });
  }
  
  getAvailableComponents(playerLevel) {
    // Simulate component availability based on player level
    const allComponents = [
      { id: 'battery_standard', name: 'Standard Battery', cost: 100, stats: { speed: 0, handling: 0, acceleration: 0, durability: 0 } },
      { id: 'battery_extended', name: 'Extended Battery', cost: 250, stats: { speed: 0, handling: -5, acceleration: 5, durability: 0 } },
      { id: 'motor_stock', name: 'Stock Motor', cost: 150, stats: { speed: 0, handling: 0, acceleration: 0, durability: 0 } },
      { id: 'motor_upgraded', name: 'Upgraded Motor', cost: 400, stats: { speed: 10, handling: 0, acceleration: 15, durability: -5 } },
      { id: 'controller_basic', name: 'Basic Controller', cost: 200, stats: { speed: 0, handling: 0, acceleration: 0, durability: 0 } },
      { id: 'controller_racing', name: 'Racing Controller', cost: 500, stats: { speed: 15, handling: 0, acceleration: 10, durability: -10 } },
      { id: 'suspension_stock', name: 'Stock Suspension', cost: 150, stats: { speed: 0, handling: 0, acceleration: 0, durability: 0 } },
      { id: 'suspension_fox', name: 'Fox Suspension', cost: 350, stats: { speed: 5, handling: 20, acceleration: 0, durability: 5 } },
      { id: 'tires_street', name: 'Street Tires', cost: 100, stats: { speed: 5, handling: 5, acceleration: 0, durability: -5 } },
      { id: 'tires_offroad', name: 'Off-Road Tires', cost: 120, stats: { speed: -5, handling: 15, acceleration: -5, durability: 10 } }
    ];
    
    // Filter components based on player level
    return allComponents.filter(component => {
      if (component.id.includes('upgraded') && playerLevel < 5) return false;
      if (component.id.includes('racing') && playerLevel < 8) return false;
      if (component.id.includes('fox') && playerLevel < 6) return false;
      return true;
    });
  }
  
  toggleComponent(componentId) {
    const components = [...this.currentBuild.components];
    const index = components.indexOf(componentId);
    
    if (index === -1) {
      // Add component
      components.push(componentId);
    } else {
      // Remove component
      components.splice(index, 1);
    }
    
    this.currentBuild.components = components;
    this.updateBuildStats();
    this.render(store.getState()); // Re-render to show updated components
  }
  
  updateBuildStats() {
    // Reset to base stats for the frame
    const baseStats = {
      Standard: { speed: 50, handling: 50, acceleration: 50, durability: 50 },
      LightBee: { speed: 60, handling: 60, acceleration: 55, durability: 45 },
      Storm: { speed: 55, handling: 45, acceleration: 60, durability: 60 },
      Ultra: { speed: 70, handling: 65, acceleration: 70, durability: 55 }
    };
    
    // Get base stats for selected frame
    const frameStats = baseStats[this.currentBuild.frame] || baseStats.Standard;
    
    // Start with frame stats
    const newStats = { ...frameStats };
    
    // Apply component modifications
    const allComponents = this.getAvailableComponents(99); // Get all possible components
    
    this.currentBuild.components.forEach(componentId => {
      const component = allComponents.find(c => c.id === componentId);
      if (component) {
        Object.entries(component.stats).forEach(([stat, value]) => {
          newStats[stat] += value;
        });
      }
    });
    
    // Ensure stats are within range
    Object.keys(newStats).forEach(stat => {
      newStats[stat] = Math.max(0, Math.min(100, newStats[stat]));
    });
    
    this.currentBuild.performance = newStats;
  }
  
  saveBuild() {
    // Validate build
    if (!this.currentBuild.name.trim()) {
      showToast('Please enter a build name', 'error');
      return;
    }
    
    // Dispatch action to save build
    store.dispatch({
      type: 'builds/addBuild',
      payload: { ...this.currentBuild, savedAt: Date.now() }
    });
    
    showToast(`Build "${this.currentBuild.name}" saved successfully!`, 'success');
    
    // Generate a new ID for the next build
    this.currentBuild.id = `build_${Date.now()}`;
  }
  
  testRide() {
    // In a real implementation, this would launch a test ride simulation
    showToast(`Testing "${this.currentBuild.name}" - Speed: ${this.currentBuild.performance.speed}, Handling: ${this.currentBuild.performance.handling}`, 'info');
    
    // Award some XP for testing
    store.dispatch({
      type: 'player/addXP',
      payload: 10
    });
  }
  
  resetBuild() {
    // Reset to default build
    this.currentBuild = {
      id: `build_${Date.now()}`,
      name: 'New Build',
      frame: 'Standard',
      components: [],
      performance: {
        speed: 50,
        handling: 50,
        acceleration: 50,
        durability: 50
      }
    };
    
    this.render(store.getState()); // Re-render with reset build
    showToast('Build reset to defaults', 'info');
  }
  
  loadBuild(buildId) {
    const state = store.getState();
    const build = state.builds?.entities?.[buildId];
    
    if (build) {
      // Clone the build to avoid direct state modification
      this.currentBuild = JSON.parse(JSON.stringify(build));
      this.render(state); // Re-render with loaded build
      showToast(`Loaded build: ${build.name}`, 'success');
    } else {
      showToast('Could not find build', 'error');
    }
  }
  
  deleteBuild(buildId) {
    // Dispatch action to delete build
    store.dispatch({
      type: 'builds/removeBuild',
      payload: buildId
    });
    
    showToast('Build deleted', 'info');
  }

  unmount() {}
}
