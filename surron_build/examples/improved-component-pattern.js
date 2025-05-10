/**
 * improved-component-pattern.js
 * 
 * This file demonstrates the recommended pattern for UI components
 * that integrate with the Redux architecture in the Surron Squad game.
 */

import { store } from '../StateStackULTRA/store/gameStore.js';
import * as selectors from '../selectors.js';
import { showToast } from '../game/popup-toast.js';

/**
 * Component class representing a UI component with Redux integration
 */
class Component {
  /**
   * Create a component
   * @param {string} containerId - ID of the container element
   * @param {Function} renderFn - Function to render the component
   * @param {string[]} stateSlices - State slices to watch for changes
   */
  constructor(containerId, renderFn, stateSlices = []) {
    this.containerId = containerId;
    this.container = null;
    this.renderFn = renderFn;
    this.stateSlices = stateSlices;
    this.prevState = {};
    this.unsubscribe = null;
    this.eventListeners = [];
  }
  
  /**
   * Initialize the component
   */
  init() {
    this.container = document.getElementById(this.containerId);
    
    if (!this.container) {
      console.error(`Container element with ID "${this.containerId}" not found`);
      return false;
    }
    
    // Subscribe to store changes
    this.unsubscribe = store.subscribe(() => {
      const currentState = store.getState();
      const shouldUpdate = this.shouldComponentUpdate(currentState);
      
      if (shouldUpdate) {
        this.render(currentState);
        this.prevState = this.getRelevantState(currentState);
      }
    });
    
    // Initial render
    this.render(store.getState());
    this.prevState = this.getRelevantState(store.getState());
    
    return true;
  }
  
  /**
   * Clean up the component
   */
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    
    // Remove event listeners
    this.eventListeners.forEach(({ element, type, listener }) => {
      element.removeEventListener(type, listener);
    });
    this.eventListeners = [];
  }
  
  /**
   * Add an event listener and track it for cleanup
   * @param {Element} element - Element to add listener to
   * @param {string} type - Event type
   * @param {Function} listener - Event listener
   */
  addListener(element, type, listener) {
    element.addEventListener(type, listener);
    this.eventListeners.push({ element, type, listener });
  }
  
  /**
   * Get the relevant state for this component
   * @param {Object} state - Full Redux state
   * @returns {Object} Relevant state slices
   */
  getRelevantState(state) {
    const relevantState = {};
    
    if (this.stateSlices.length === 0) {
      return state;
    }
    
    this.stateSlices.forEach(slice => {
      relevantState[slice] = state[slice];
    });
    
    return relevantState;
  }
  
  /**
   * Determine if the component should update
   * @param {Object} currentState - Current Redux state
   * @returns {boolean} Whether the component should update
   */
  shouldComponentUpdate(currentState) {
    const relevantState = this.getRelevantState(currentState);
    
    // Deep comparison with previous state
    return JSON.stringify(relevantState) !== JSON.stringify(this.prevState);
  }
  
  /**
   * Render the component
   * @param {Object} state - Current Redux state
   */
  render(state) {
    if (!this.container) return;
    
    try {
      // Clear container and re-render
      this.container.innerHTML = '';
      const content = this.renderFn(state);
      this.container.innerHTML = content;
      
      // Add event listeners after rendering
      this.addEventListeners();
    } catch (error) {
      console.error('Error rendering component:', error);
      this.handleRenderError(error);
    }
  }
  
  /**
   * Add event listeners to rendered elements
   * This should be implemented by child classes
   */
  addEventListeners() {
    // To be overridden by child classes
  }
  
  /**
   * Handle render errors
   * @param {Error} error - Render error
   */
  handleRenderError(error) {
    this.container.innerHTML = `
      <div class="error-message">
        <h3>Something went wrong</h3>
        <p>There was an error rendering this component. Please try refreshing the page.</p>
        <details>
          <summary>Technical Details</summary>
          <pre>${error.message}</pre>
        </details>
      </div>
    `;
    
    showToast('Error rendering component: ' + error.message, 'error');
  }
}

/**
 * Example implementation: Character Card Component
 */
export class CharacterCardComponent extends Component {
  constructor(containerId) {
    super(containerId, CharacterCardComponent.render, ['characters', 'player']);
  }
  
  /**
   * Render character cards
   * @param {Object} state - Redux state
   * @returns {string} HTML content
   */
  static render(state) {
    const characters = state.characters?.characters || {};
    
    if (Object.keys(characters).length === 0) {
      return '<p>No characters available</p>';
    }
    
    return `
      <div class="character-container">
        ${Object.values(characters).map(character => `
          <div class="character-card ${character.id}" data-character-id="${character.id}">
            <div class="character-header">
              <img src="${character.portrait}" alt="${character.name}" class="character-avatar">
              <div>
                <h3 class="character-name">${character.name}</h3>
                <p class="character-role">Level ${character.level} Squad Member</p>
              </div>
              <div class="character-level">${character.level}</div>
            </div>
            
            <div class="character-stats">
              ${Object.entries(character.stats).map(([stat, value]) => `
                <div class="stat-row">
                  <div class="stat-name">${stat.charAt(0).toUpperCase() + stat.slice(1)}</div>
                  <div class="stat-bar">
                    <div class="stat-fill ${character.id}" style="width: ${value}%"></div>
                  </div>
                </div>
              `).join('')}
              
              <div class="stat-row">
                <div class="stat-name">Relationship</div>
                <div class="stat-bar">
                  <div class="stat-fill ${character.id}" style="width: ${(character.relationship || 0) * 10}%"></div>
                </div>
              </div>
            </div>
            
            <button class="btn-talk" data-character="${character.id}">Talk to ${character.name}</button>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  /**
   * Add event listeners after rendering
   */
  addEventListeners() {
    const buttons = this.container.querySelectorAll('.btn-talk');
    
    buttons.forEach(button => {
      const characterId = button.dataset.character;
      
      this.addListener(button, 'click', () => {
        this.handleTalkToCharacter(characterId);
      });
    });
    
    const cards = this.container.querySelectorAll('.character-card');
    
    cards.forEach(card => {
      this.addListener(card, 'click', (event) => {
        // Don't trigger if the button was clicked
        if (event.target.closest('.btn-talk')) return;
        
        const characterId = card.dataset.characterId;
        this.handleViewCharacterDetails(characterId);
      });
    });
  }
  
  /**
   * Handle "Talk to Character" button click
   * @param {string} characterId - Character ID
   */
  handleTalkToCharacter(characterId) {
    const state = store.getState();
    const character = state.characters?.characters?.[characterId];
    
    if (!character) return;
    
    // Dispatch action to talk to character
    store.dispatch({
      type: 'characters/talkToCharacter',
      payload: characterId
    });
    
    // Show toast notification
    showToast(`Talking to ${character.name}...`, 'info');
    
    // Example of updating relationship
    store.dispatch({
      type: 'characters/updateRelationship',
      payload: { character: characterId, delta: 1 }
    });
  }
  
  /**
   * Handle viewing character details
   * @param {string} characterId - Character ID
   */
  handleViewCharacterDetails(characterId) {
    // Navigate to character details page
    window.location.href = `character-details.html?id=${characterId}`;
  }
}

/**
 * Example implementation: Quest List Component
 */
export class QuestListComponent extends Component {
  constructor(containerId) {
    super(containerId, QuestListComponent.render, ['quests', 'player']);
  }
  
  /**
   * Render quest list
   * @param {Object} state - Redux state
   * @returns {string} HTML content
   */
  static render(state) {
    const quests = state.quests?.entities || {};
    const playerLevel = selectors.getPlayerLevel(state);
    
    if (Object.keys(quests).length === 0) {
      return `
        <div class="no-quests-message">
          <p>No quests available. Complete Chapter 1 to unlock more quests!</p>
          <button id="start-chapter-1" class="btn">Start Chapter 1</button>
        </div>
      `;
    }
    
    // Sort quests by status
    const sortedQuests = Object.values(quests).sort((a, b) => {
      const statusOrder = { 'Active': 0, 'Not Started': 1, 'Completed': 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
    
    return `
      <div class="quests-container">
        ${sortedQuests.map(quest => {
          const isLocked = quest.requiredLevel > playerLevel;
          return `
            <div class="quest-card ${quest.character || 'squad'} ${isLocked ? 'locked' : ''}" 
                 data-quest-id="${quest.id}">
              <div class="quest-difficulty">${quest.difficulty || 'Normal'}</div>
              <h3 class="quest-title">${quest.title}</h3>
              <p class="quest-description">${quest.description}</p>
              <div class="quest-character">
                <img src="images/surron-${quest.character || 'charlie'}-alert-pose.png" 
                     alt="${quest.character || 'Charlie'}">
                <span>${(quest.character || 'Charlie').charAt(0).toUpperCase() + 
                       (quest.character || 'charlie').slice(1)}'s Quest</span>
              </div>
              <div class="quest-progress">
                <div class="quest-progress-fill" style="width: ${quest.progress || 0}%"></div>
              </div>
              
              ${quest.steps ? `
                <div class="quest-steps">
                  ${quest.steps.map((step, index) => `
                    <div class="quest-step ${step.completed ? 'completed' : ''}" data-step="${index}">
                      ${step.description}
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              
              <button class="start-quest-btn" ${isLocked ? 'disabled' : ''}>
                ${isLocked 
                  ? `Reach Level ${quest.requiredLevel} to Unlock` 
                  : quest.status === 'Completed' 
                    ? 'Completed!' 
                    : 'Start Quest'}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
  
  /**
   * Add event listeners after rendering
   */
  addEventListeners() {
    const buttons = this.container.querySelectorAll('.start-quest-btn:not([disabled])');
    
    buttons.forEach(button => {
      const questCard = button.closest('.quest-card');
      const questId = questCard?.dataset.questId;
      
      if (!questId) return;
      
      this.addListener(button, 'click', () => {
        this.handleStartQuest(questId);
      });
    });
    
    // Add listeners for quest steps
    const questSteps = this.container.querySelectorAll('.quest-step:not(.completed)');
    
    questSteps.forEach(step => {
      const questCard = step.closest('.quest-card');
      const questId = questCard?.dataset.questId;
      const stepIndex = step?.dataset.step;
      
      if (!questId || stepIndex === undefined) return;
      
      this.addListener(step, 'click', () => {
        this.handleCompleteStep(questId, parseInt(stepIndex, 10));
      });
    });
  }
  
  /**
   * Handle starting a quest
   * @param {string} questId - Quest ID
   */
  handleStartQuest(questId) {
    const state = store.getState();
    const quest = state.quests?.entities?.[questId];
    
    if (!quest) return;
    
    // Set active quest
    store.dispatch({
      type: 'quests/setActiveQuest',
      payload: questId
    });
    
    // Change quest status to active if needed
    if (quest.status === 'Not Started') {
      store.dispatch({
        type: 'quests/updateQuestStatus',
        payload: { id: questId, status: 'Active' }
      });
    }
    
    // Navigate to quest page
    window.location.href = quest.questPage || 'adventure-engine.html';
  }
  
  /**
   * Handle completing a quest step
   * @param {string} questId - Quest ID
   * @param {number} stepIndex - Step index
   */
  handleCompleteStep(questId, stepIndex) {
    // Dispatch action to complete step
    store.dispatch({
      type: 'quests/progressStep',
      payload: { id: questId, step: stepIndex }
    });
    
    // Show toast notification
    showToast('Quest step completed!', 'success');
  }
}

// Example usage
document.addEventListener('DOMContentLoaded', () => {
  // Initialize components
  const characterCards = new CharacterCardComponent('character-cards');
  characterCards.init();
  
  const questList = new QuestListComponent('quest-list');
  questList.init();
  
  // Clean up on page unload
  window.addEventListener('unload', () => {
    characterCards.destroy();
    questList.destroy();
  });
}); 