/**
 * AdventureEngineComponent.js
 * Renders adventures, chapters, and story elements
 */

import ComponentBase from '../ui/ComponentBase.js';
import { store } from '../../StateStackULTRA/store/gameStore.js';
import { getPlayerLevel } from '../selectors/playerSelectors.js';
import { getActiveQuests } from '../selectors/questSelectors.js';
import { showToast } from '../../game/popup-toast.js';

export default class AdventureEngineComponent extends ComponentBase {
  constructor() {
    // Listen for changes to relevant state slices
    super(['player', 'quests', 'locations']);
    
    // Component state
    this.activeScene = null;
    this.sceneHistory = [];
    this.dialogHistory = [];
    this.choices = [];
  }
  
  render(state) {
    if (!this.container) return;
    
    try {
      const activeQuests = getActiveQuests(state);
      const playerLevel = getPlayerLevel(state);
      const currentLocation = state.locations?.currentLocation || 'Camp';
      
      // Handle first render - load initial scene if needed
      if (!this.activeScene) {
        this.loadInitialScene(state);
      }
      
      this.container.innerHTML = `
        <div class="component-container card adventure-container">
          <div class="adventure-header">
            <h2>Adventure: ${this.activeScene?.title || 'Surron Squad'}</h2>
            <div class="location-info">${currentLocation}</div>
          </div>
          
          <div class="scene-container">
            <div class="scene-background" style="background-image: url('${this.activeScene?.background || 'images/backgrounds/default-scene.jpg'}')"></div>
            
            <div class="scene-content">
              ${this.activeScene ? `
                <div class="scene-text">
                  <p>${this.activeScene.text}</p>
                </div>
                
                ${this.activeScene.character ? `
                  <div class="character-portrait">
                    <img src="images/surron-${this.activeScene.character}-talk.png" 
                         alt="${this.activeScene.character}" 
                         onerror="this.src='images/placeholder.png'">
                    <div class="character-name">${this.activeScene.character.charAt(0).toUpperCase() + this.activeScene.character.slice(1)}</div>
                  </div>
                ` : ''}
                
                <div class="dialog-history">
                  ${this.dialogHistory.map(dialog => `
                    <div class="dialog-entry ${dialog.type}">
                      ${dialog.character ? 
                        `<span class="dialog-character">${dialog.character}:</span> ` : 
                        ''}
                      ${dialog.text}
                    </div>
                  `).join('')}
                </div>
              ` : `
                <div class="no-adventure">
                  <p>No active adventure. Start a quest to begin!</p>
                  ${activeQuests.length > 0 ? `
                    <div class="available-quests">
                      <h3>Available Quests</h3>
                      <ul>
                        ${activeQuests.map(quest => `
                          <li>
                            <button class="btn-start-quest" data-quest-id="${quest.id}">
                              ${quest.title}
                            </button>
                          </li>
                        `).join('')}
                      </ul>
                    </div>
                  ` : ''}
                </div>
              `}
            </div>
          </div>
          
          <div class="adventure-choices">
            ${this.choices.map((choice, index) => `
              <button class="choice-button" data-choice-index="${index}">
                ${choice.text}
              </button>
            `).join('')}
          </div>
          
          <div class="adventure-controls">
            <button id="adventure-back" ${this.sceneHistory.length ? '' : 'disabled'}>Back</button>
            <button id="adventure-map">Map</button>
          </div>
        </div>
      `;
      
      this.addEventListeners();
    } catch (error) {
      console.error('Error rendering AdventureEngineComponent:', error);
      this.handleRenderError(error);
    }
  }
  
  addEventListeners() {
    // Choice buttons
    const choiceButtons = this.container.querySelectorAll('.choice-button');
    choiceButtons.forEach(button => {
      const choiceIndex = parseInt(button.dataset.choiceIndex, 10);
      this.addListener(button, 'click', () => this.handleChoice(choiceIndex));
    });
    
    // Start quest buttons
    const questButtons = this.container.querySelectorAll('.btn-start-quest');
    questButtons.forEach(button => {
      const questId = button.dataset.questId;
      this.addListener(button, 'click', () => this.startQuest(questId));
    });
    
    // Back button
    const backButton = this.container.querySelector('#adventure-back:not([disabled])');
    if (backButton) {
      this.addListener(backButton, 'click', this.goBack.bind(this));
    }
    
    // Map button
    const mapButton = this.container.querySelector('#adventure-map');
    if (mapButton) {
      this.addListener(mapButton, 'click', this.showMap.bind(this));
    }
  }
  
  loadInitialScene(state) {
    // Check for active quest
    const activeQuests = getActiveQuests(state);
    
    if (activeQuests.length > 0) {
      // Get the first active quest
      const activeQuest = activeQuests[0];
      
      // Create an initial scene based on the quest
      this.activeScene = {
        id: 'quest_start',
        title: activeQuest.title,
        text: activeQuest.description,
        character: activeQuest.character || 'charlie',
        background: 'images/backgrounds/camp-morning.jpg'
      };
      
      // Set initial choices
      this.choices = [
        { 
          text: 'Begin Quest', 
          action: () => this.loadScene({
            id: 'quest_intro',
            title: `${activeQuest.title} - Introduction`,
            text: 'Let\'s get started on this quest. First things first...',
            character: activeQuest.character || 'charlie',
            background: 'images/backgrounds/trail-forest.jpg'
          })
        },
        { 
          text: 'Ask for Details', 
          action: () => {
            this.addDialog({
              character: activeQuest.character || 'Charlie',
              text: 'We need to complete this mission ASAP. It\'s critical for the squad.',
              type: 'npc'
            });
          }
        },
        { text: 'Decline Quest', action: () => this.endQuest() }
      ];
    } else {
      // Default welcome scene
      this.activeScene = {
        id: 'welcome',
        title: 'Surron Squad HQ',
        text: 'Welcome to Surron Squad! Start a quest to begin your adventure.',
        background: 'images/backgrounds/squad-hq.jpg'
      };
      
      // No choices for welcome screen
      this.choices = [];
    }
  }
  
  loadScene(scene) {
    // Save current scene to history
    if (this.activeScene) {
      this.sceneHistory.push({...this.activeScene, choices: [...this.choices]});
    }
    
    // Set new scene
    this.activeScene = scene;
    
    // Clear dialog history if specified
    if (scene.clearDialog) {
      this.dialogHistory = [];
    }
    
    // Set new choices
    this.choices = scene.choices || [];
    
    // Update location if specified
    if (scene.location) {
      store.dispatch({
        type: 'locations/setCurrentLocation',
        payload: scene.location
      });
    }
    
    // Add scene text as dialog if specified
    if (scene.addToDialog) {
      this.addDialog({
        character: scene.character,
        text: scene.text,
        type: 'narrative'
      });
    }
    
    // Re-render with new scene
    this.render(store.getState());
  }
  
  handleChoice(index) {
    const choice = this.choices[index];
    
    if (!choice) return;
    
    // Add choice to dialog history
    this.addDialog({
      text: choice.text,
      type: 'player'
    });
    
    // Execute the choice action
    if (typeof choice.action === 'function') {
      choice.action();
    }
    
    // If the choice has a next scene, load it
    if (choice.nextScene) {
      this.loadScene(choice.nextScene);
    }
  }
  
  addDialog(dialog) {
    this.dialogHistory.push(dialog);
    
    // Limit history length
    if (this.dialogHistory.length > 10) {
      this.dialogHistory.shift();
    }
    
    // Re-render to show new dialog
    this.render(store.getState());
  }
  
  goBack() {
    if (this.sceneHistory.length === 0) return;
    
    // Get the last scene from history
    const previousScene = this.sceneHistory.pop();
    
    // Restore it as the active scene
    this.activeScene = previousScene;
    this.choices = previousScene.choices || [];
    
    // Re-render
    this.render(store.getState());
  }
  
  showMap() {
    // In a real implementation, this would show a map of available locations
    showToast('Map feature coming soon!', 'info');
  }
  
  startQuest(questId) {
    // Dispatch action to start quest
    store.dispatch({
      type: 'quests/setActiveQuest',
      payload: questId
    });
    
    // Get quest info
    const state = store.getState();
    const quest = state.quests?.entities?.[questId];
    
    if (quest) {
      // Create a scene for this quest
      this.loadScene({
        id: `quest_${questId}`,
        title: quest.title,
        text: quest.description,
        character: quest.character || 'charlie',
        background: 'images/backgrounds/trail-begin.jpg',
        location: quest.location || 'Trail Start'
      });
    }
  }
  
  endQuest() {
    // Clear the current adventure
    this.activeScene = null;
    this.choices = [];
    this.sceneHistory = [];
    this.dialogHistory = [];
    
    // Reset active quest
    store.dispatch({
      type: 'quests/clearActiveQuest',
      payload: null
    });
    
    // Return to default location
    store.dispatch({
      type: 'locations/setCurrentLocation',
      payload: 'Camp'
    });
    
    // Re-render
    this.render(store.getState());
    
    // Show toast
    showToast('Quest declined. Returned to camp.', 'info');
  }

  unmount() {}
}
