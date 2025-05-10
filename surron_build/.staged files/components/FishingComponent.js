/**
 * FishingComponent.js
 * Provides fishing gameplay mechanic
 */

import ComponentBase from '../ui/ComponentBase.js';
import { store } from '../../StateStackULTRA/store/gameStore.js';
import { getPlayerInventory } from '../selectors/playerSelectors.js';
import { showToast } from '../../game/popup-toast.js';

export default class FishingComponent extends ComponentBase {
  constructor() {
    // Listen for changes to player, fishing, and inventory
    super(['player', 'fishing']);
    
    // Component state
    this.isFishing = false;
    this.fishingProgress = 0;
    this.fishingInterval = null;
    this.catchChance = 0.4; // 40% chance to catch a fish
  }
  
  mount(container) {
    this.container = container;
    this.render();
    this.unsubscribe = store.subscribe(() => this.render());
  }

  render(state) {
    if (!this.container) return;
    
    try {
      const inventory = getPlayerInventory(state);
      const fishingData = state.fishing || {};
      const fishCaught = fishingData.totalCaught || 0;
      const fishingRod = inventory.find(i => i.type === 'equipment' && i.name.includes('Rod'))?.name || 'Basic Rod';
      const hasRod = inventory.some(i => i.type === 'equipment' && i.name.includes('Rod'));
      const fishingLevel = fishingData.level || 1;
      
      this.container.innerHTML = `
        <div class="component-container card">
          <h2>Fishing Spot</h2>
          <p>Take a break from riding and catch some fish!</p>
          
          <div class="fishing-stats">
            <div class="stat-row">
              <div class="stat-name">Fishing Level</div>
              <div class="stat-value">${fishingLevel}</div>
            </div>
            <div class="stat-row">
              <div class="stat-name">Total Fish Caught</div>
              <div class="stat-value">${fishCaught}</div>
            </div>
            <div class="stat-row">
              <div class="stat-name">Rod</div>
              <div class="stat-value">${fishingRod}</div>
            </div>
          </div>
          
          ${this.isFishing ? `
            <div class="fishing-progress">
              <div class="fishing-message">Fishing in progress...</div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${this.fishingProgress}%"></div>
              </div>
            </div>
          ` : ''}
          
          <div class="fishing-actions">
            <button id="start-fishing" class="btn-primary" ${!hasRod || this.isFishing ? 'disabled' : ''}>
              ${this.isFishing ? 'Fishing...' : 'Start Fishing'}
            </button>
            ${this.isFishing ? `<button id="stop-fishing" class="btn-danger">Stop Fishing</button>` : ''}
            <button id="buy-rod" class="btn-secondary">Buy Better Rod</button>
          </div>
          
          <div class="inventory-preview">
            <h3>Recent Catches</h3>
            ${inventory.filter(item => item.type === 'fish').length === 0 ? 
              '<p>No fish caught yet. Start fishing to fill your inventory!</p>' : 
              `<div class="fish-grid">
                ${inventory.filter(item => item.type === 'fish').slice(0, 5).map(fish => `
                  <div class="fish-item">
                    <div class="fish-name">${fish.name}</div>
                    <div class="fish-value">${fish.value} coins</div>
                  </div>
                `).join('')}
              </div>`
            }
          </div>
        </div>
      `;
      
      this.addEventListeners();
    } catch (error) {
      console.error('Error rendering FishingComponent:', error);
      this.handleRenderError(error);
    }
  }
  
  addEventListeners() {
    // Start fishing button
    const startButton = this.container.querySelector('#start-fishing:not([disabled])');
    if (startButton) {
      this.addListener(startButton, 'click', this.startFishing.bind(this));
    }
    
    // Stop fishing button
    const stopButton = this.container.querySelector('#stop-fishing');
    if (stopButton) {
      this.addListener(stopButton, 'click', this.stopFishing.bind(this));
    }
    
    // Buy rod button
    const buyButton = this.container.querySelector('#buy-rod');
    if (buyButton) {
      this.addListener(buyButton, 'click', this.buyRod.bind(this));
    }
  }
  
  startFishing() {
    if (this.isFishing) return;
    
    this.isFishing = true;
    this.fishingProgress = 0;
    
    // Show toast
    showToast('Started fishing...', 'info');
    
    // Simulate fishing progress
    this.fishingInterval = setInterval(() => {
      this.fishingProgress += 5;
      
      if (this.fishingProgress >= 100) {
        this.fishingProgress = 0;
        this.attemptCatch();
      }
      
      // Re-render to update progress
      this.render(store.getState());
    }, 500);
    
    // Dispatch fishing state to Redux
    store.dispatch({
      type: 'fishing/startFishing',
      payload: null
    });
    
    // Re-render immediately to show fishing state
    this.render(store.getState());
  }
  
  stopFishing() {
    if (!this.isFishing) return;
    
    this.isFishing = false;
    this.fishingProgress = 0;
    
    // Clear interval
    if (this.fishingInterval) {
      clearInterval(this.fishingInterval);
      this.fishingInterval = null;
    }
    
    // Dispatch fishing state to Redux
    store.dispatch({
      type: 'fishing/stopFishing',
      payload: null
    });
    
    // Show toast
    showToast('Stopped fishing', 'info');
    
    // Re-render to update UI
    this.render(store.getState());
  }
  
  attemptCatch() {
    // Get state data
    const state = store.getState();
    const fishingData = state.fishing || {};
    const fishingLevel = fishingData.level || 1;
    
    // Adjust catch chance based on fishing level and equipment
    const inventory = getPlayerInventory(state);
    const rodQuality = this.getRodQuality(inventory);
    
    // Calculate final catch chance (base + level bonus + rod bonus)
    const finalCatchChance = this.catchChance + (fishingLevel * 0.02) + (rodQuality * 0.05);
    
    // Random roll for catch
    if (Math.random() < finalCatchChance) {
      // Success! Choose a random fish from the possible catches
      const fish = this.getRandomFish(fishingLevel, rodQuality);
      
      // Dispatch action to add fish to inventory
      store.dispatch({
        type: 'player/addToInventory',
        payload: fish
      });
      
      // Dispatch action to track catch
      store.dispatch({
        type: 'fishing/catchFish',
        payload: { fish: fish.name, value: fish.value }
      });
      
      // Award XP
      store.dispatch({
        type: 'player/addXP',
        payload: 5 + (fish.rarity * 5)
      });
      
      // Show toast notification
      showToast(`Caught a ${fish.name}!`, 'success');
    } else {
      // Failed catch
      showToast('The fish got away!', 'error');
    }
  }
  
  getRodQuality(inventory) {
    // Find fishing rod in inventory
    const rod = inventory.find(i => i.type === 'equipment' && i.name.includes('Rod'));
    
    if (!rod) return 0;
    
    // Determine quality based on rod name
    if (rod.name.includes('Professional')) return 3;
    if (rod.name.includes('Advanced')) return 2;
    if (rod.name.includes('Good')) return 1;
    return 0; // Basic rod
  }
  
  getRandomFish(fishingLevel, rodQuality) {
    // List of possible fish to catch
    const fishList = [
      { name: 'Smallmouth Bass', type: 'fish', value: 10, rarity: 1 },
      { name: 'Largemouth Bass', type: 'fish', value: 15, rarity: 2 },
      { name: 'Trout', type: 'fish', value: 12, rarity: 1 },
      { name: 'Catfish', type: 'fish', value: 20, rarity: 2 },
      { name: 'Bluegill', type: 'fish', value: 5, rarity: 1 },
      { name: 'Perch', type: 'fish', value: 8, rarity: 1 },
      { name: 'Pike', type: 'fish', value: 25, rarity: 3 },
      { name: 'Salmon', type: 'fish', value: 30, rarity: 3 },
      { name: 'Sturgeon', type: 'fish', value: 50, rarity: 4 },
      { name: 'Rainbow Trout', type: 'fish', value: 18, rarity: 2 }
    ];
    
    // Filter available fish based on fishing level
    const availableFish = fishList.filter(fish => fish.rarity <= Math.min(4, Math.floor(fishingLevel / 2) + rodQuality));
    
    // Calculate weights (higher rarity fish have lower chance)
    const weights = availableFish.map(fish => 1 / (fish.rarity * fish.rarity));
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    // Random selection based on weights
    let random = Math.random() * totalWeight;
    let cumulativeWeight = 0;
    
    for (let i = 0; i < availableFish.length; i++) {
      cumulativeWeight += weights[i];
      if (random <= cumulativeWeight) {
        return { ...availableFish[i], catchTime: Date.now() };
      }
    }
    
    // Fallback to first fish if something goes wrong
    return { ...availableFish[0], catchTime: Date.now() };
  }
  
  buyRod() {
    // Get state data
    const state = store.getState();
    const inventory = getPlayerInventory(state);
    const currentRod = inventory.find(i => i.type === 'equipment' && i.name.includes('Rod'));
    const playerCurrency = state.player?.currency || 0;
    
    // Determine which rod to offer
    let nextRod;
    let cost;
    
    if (!currentRod || currentRod.name.includes('Basic')) {
      nextRod = { name: 'Good Fishing Rod', type: 'equipment', value: 50 };
      cost = 50;
    } else if (currentRod.name.includes('Good')) {
      nextRod = { name: 'Advanced Fishing Rod', type: 'equipment', value: 100 };
      cost = 100;
    } else if (currentRod.name.includes('Advanced')) {
      nextRod = { name: 'Professional Fishing Rod', type: 'equipment', value: 200 };
      cost = 200;
    } else {
      // Already have the best rod
      showToast('You already have the best fishing rod!', 'info');
      return;
    }
    
    // Check if player has enough currency
    if (playerCurrency < cost) {
      showToast(`Not enough coins! You need ${cost} coins for a ${nextRod.name}.`, 'error');
      return;
    }
    
    // Dispatch actions to buy the rod
    store.dispatch({
      type: 'player/removeCurrency',
      payload: cost
    });
    
    store.dispatch({
      type: 'player/addToInventory',
      payload: nextRod
    });
    
    // Show toast notification
    showToast(`Purchased ${nextRod.name}!`, 'success');
    
    // Re-render to update UI
    this.render(store.getState());
  }
  
  // Clean up on unmount
  unmount() {
    if (this.fishingInterval) {
      clearInterval(this.fishingInterval);
      this.fishingInterval = null;
    }
    
    // Call parent unmount
    super.unmount();
  }
}
