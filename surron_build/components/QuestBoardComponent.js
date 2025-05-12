/**
 * QuestBoardComponent.js
 * Displays available quests and allows player to start them
 */

import { ComponentBase } from './ComponentBase.js';
import { store } from '../StateStackULTRA/store/gameStore.js';
import { selectAllQuests } from '../StateStackULTRA/slices/questSlice.js';
import GameCore from '../game/GameCore.js';
import questIntegration from '../game/quest-integration.js';

export default class QuestBoardComponent extends ComponentBase {
  constructor() {
    super('quest-board');
    this.state = {
      quests: [],
      playerLevel: 1
    };
    this.unsubscribe = null;
    this.animations = true;
  }
  
  // Subscribe to store changes
  onMount() {
    // Initial state synchronization
    this.refreshFromStore();
    
    // Subscribe to state changes
    this.unsubscribe = store.subscribe(() => {
      this.refreshFromStore();
    });
    
    // Add event listeners
    this.addEventListeners();
  }
  
  // Get updated state from store
  refreshFromStore() {
    try {
      const state = store.getState();
      
      // Get quests from state using selector
      const quests = selectAllQuests(state) || [];
      
      // Get player level
      const playerLevel = state.player?.level || 1;
      
      // Only update if changed to avoid unnecessary renders
      if (this.state.quests.length !== quests.length || 
          this.state.playerLevel !== playerLevel ||
          JSON.stringify(this.state.quests) !== JSON.stringify(quests)) {
        
        // Update component state
        this.state = {
          quests,
          playerLevel
        };
        
        // Render with updated state
        this.render(this.state);
      }
    } catch (error) {
      console.error('[QuestBoardComponent] Error refreshing state:', error);
    }
  }
  
  // Clean up on unmount
  onUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
  
  // Render the quest board
  render(state) {
    if (!this.container) return;
    
    const { quests, playerLevel } = state;
    
    // Filter quests by player level (don't show quests too high level)
    const availableQuests = quests.filter(quest => 
      (quest.requiredLevel || 1) <= playerLevel + 2
    );
    
    // Sort quests by status and level
    const sortedQuests = availableQuests.sort((a, b) => {
      // Active quests first
      if (a.status === 'Active' && b.status !== 'Active') return -1;
      if (a.status !== 'Active' && b.status === 'Active') return 1;
      
      // Then by required level
      return (a.requiredLevel || 1) - (b.requiredLevel || 1);
    });
    
    // Update the quest board content
    this.container.innerHTML = `
      <div class="quest-board-header">
        <h3>Available Missions</h3>
        <div class="quest-board-filters">
          <button class="filter-btn active" data-filter="all">All</button>
          <button class="filter-btn" data-filter="active">Active</button>
          <button class="filter-btn" data-filter="available">Available</button>
          <button class="filter-btn" data-filter="completed">Completed</button>
        </div>
      </div>
      
      <div class="quest-list">
        ${sortedQuests.length === 0 ? 
          `<div class="empty-quests">
            <p>No active quests available. Check back after reaching higher levels!</p>
          </div>` : 
          `<div class="quest-grid">
            ${sortedQuests.map(quest => {
              const isLocked = (quest.requiredLevel || 1) > playerLevel;
              const isActive = quest.status === 'Active';
              const isCompleted = quest.status === 'Completed';
              const characterClass = quest.character || 'squad';
              
              // Get quest progress
              const completedSteps = quest.steps?.filter(step => step.completed)?.length || 0;
              const totalSteps = quest.steps?.length || 1;
              const progressPercent = Math.round((completedSteps / totalSteps) * 100);
              
              return `
                <div class="quest-card ${characterClass} ${isLocked ? 'locked' : ''} ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" 
                     data-quest-id="${quest.id}" 
                     data-status="${quest.status}" 
                     data-character="${characterClass}">
                  <div class="quest-difficulty">${quest.difficulty || 'Normal'}</div>
                  <h3 class="quest-title">${quest.title}</h3>
                  <p class="quest-description">${quest.description}</p>
                  
                  ${isActive ? `
                    <div class="quest-steps">
                      ${quest.steps?.map((step, index) => `
                        <div class="quest-step ${step.completed ? 'completed' : ''}">
                          <span class="step-number">${index + 1}</span>
                          <span class="step-text">${step.description}</span>
                        </div>
                      `).join('') || ''}
                    </div>
                  ` : ''}
                  
                  <div class="quest-info">
                    <span class="quest-character">${quest.character ? quest.character.charAt(0).toUpperCase() + quest.character.slice(1) : 'Squad'}</span>
                    <span class="quest-status ${quest.status.toLowerCase().replace(' ', '-')}">${quest.status}</span>
                  </div>
                  
                  ${!isCompleted ? `
                    <div class="quest-progress">
                      <div class="stat-bar">
                        <div class="stat-fill ${characterClass}" style="width: ${progressPercent}%"></div>
                      </div>
                      <span>${progressPercent}%</span>
                    </div>
                  ` : ''}
                  
                  <div class="quest-actions">
                    ${isActive ? `
                      <button class="btn-continue-quest" data-quest-id="${quest.id}">Continue</button>
                    ` : isCompleted ? `
                      <div class="quest-completed-badge">✓ Completed</div>
                    ` : !isLocked ? `
                      <button class="btn-start-quest" data-quest-id="${quest.id}">Start Quest</button>
                    ` : `
                      <div class="level-requirement">Level ${quest.requiredLevel} Required</div>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>`
        }
        
        <div class="quest-board-actions">
          <button id="refresh-quests" class="btn-secondary">Refresh Quests</button>
        </div>
      </div>
    `;
    
    // Add event listeners after rendering
    this.addEventListeners();
    
    // Apply animations to newly rendered elements
    if (this.animations) {
      this.applyAnimations();
    }
  }
  
  // Add event listeners to quest board elements
  addEventListeners() {
    if (!this.container) return;
    
    // Start quest button
    const startButtons = this.container.querySelectorAll('.btn-start-quest');
    startButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        const questId = event.target.dataset.questId;
        this.startQuest(questId);
      });
    });
    
    // Continue quest button
    const continueButtons = this.container.querySelectorAll('.btn-continue-quest');
    continueButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        const questId = event.target.dataset.questId;
        this.continueQuest(questId);
      });
    });
    
    // Refresh quests button
    const refreshButton = this.container.querySelector('#refresh-quests');
    if (refreshButton) {
      refreshButton.addEventListener('click', () => {
        // Refresh quests from integration
        questIntegration.refreshQuests();
        
        // Update UI
        this.refreshFromStore();
        
        // Apply simple animation to indicate refresh
        refreshButton.classList.add('refreshing');
        setTimeout(() => refreshButton.classList.remove('refreshing'), 500);
      });
    }
    
    // Quest card click for details
    const questCards = this.container.querySelectorAll('.quest-card');
    questCards.forEach(card => {
      card.addEventListener('click', (event) => {
        // Only trigger if not clicking a button
        if (!event.target.closest('button')) {
          const questId = card.dataset.questId;
          this.showQuestDetails(questId);
        }
      });
    });
    
    // Filter buttons
    const filterButtons = this.container.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        // Update active state
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Apply filter
        const filter = button.dataset.filter;
        this.filterQuests(filter);
      });
    });
  }
  
  // Start a new quest
  startQuest(questId) {
    try {
      // Get quest from state
      const state = store.getState();
      const quest = state.quests?.entities?.[questId];
      
      if (!quest) {
        console.error(`[QuestBoardComponent] Quest not found: ${questId}`);
        return;
      }
      
      // Dispatch action to update quest status
      store.dispatch({
        type: 'quests/updateQuestStatus',
        payload: {
          id: questId,
          status: 'Active'
        }
      });
      
      // Show notification
      this.showToast(`Started quest: ${quest.title}`);
      
      // Redirect to appropriate location based on quest type
      this.navigateToQuestLocation(quest);
      
    } catch (error) {
      console.error('[QuestBoardComponent] Error starting quest:', error);
    }
  }
  
  // Continue an active quest
  continueQuest(questId) {
    try {
      // Get quest from state
      const state = store.getState();
      const quest = state.quests?.entities?.[questId];
      
      if (!quest) {
        console.error(`[QuestBoardComponent] Quest not found: ${questId}`);
        return;
      }
      
      // Navigate to appropriate location
      this.navigateToQuestLocation(quest);
      
    } catch (error) {
      console.error('[QuestBoardComponent] Error continuing quest:', error);
    }
  }
  
  // Navigate to the appropriate location for a quest
  navigateToQuestLocation(quest) {
    // Determine location based on quest character or explicit location
    let targetLocation = 'squad-hq.html';
    
    if (quest.questPage) {
      // Explicit page in quest data
      targetLocation = quest.questPage;
    } else if (quest.location) {
      // Explicit location property
      targetLocation = `${quest.location}.html`;
    } else if (quest.character === 'billy') {
      // Billy's fishing location
      targetLocation = 'fishinggame.html';
    } else if (quest.character === 'charlie') {
      // Charlie's workshop
      targetLocation = 'workshop.html';
    } else if (quest.character === 'tbd') {
      // TBD's lab
      targetLocation = 'secretlab.html';
    }
    
    // Redirect to the location
    window.location.href = targetLocation;
  }
  
  // Show detailed quest info
  showQuestDetails(questId) {
    try {
      // Get quest from state
      const state = store.getState();
      const quest = state.quests?.entities?.[questId];
      
      if (!quest) {
        console.error(`[QuestBoardComponent] Quest not found: ${questId}`);
        return;
      }
      
      // Create quest details modal
      const modal = document.createElement('div');
      modal.className = 'quest-details-modal';
      modal.innerHTML = `
        <div class="quest-details-content ${quest.character || 'squad'}">
          <button class="close-modal">×</button>
          <h2>${quest.title}</h2>
          <div class="quest-status-badge ${quest.status.toLowerCase()}">${quest.status}</div>
          
          <div class="quest-character-info">
            <div class="quest-character-icon">${quest.character?.charAt(0).toUpperCase() || 'S'}</div>
            <div class="quest-character-name">${quest.character ? quest.character.charAt(0).toUpperCase() + quest.character.slice(1) : 'Squad'}'s Mission</div>
          </div>
          
          <p class="quest-full-description">${quest.description}</p>
          
          <div class="quest-rewards">
            <h3>Rewards</h3>
            <ul>
              <li>${quest.xpReward || 100} XP</li>
              <li>${quest.currencyReward || 50} SurCoins</li>
              ${quest.itemRewards ? quest.itemRewards.map(item => `<li>${item}</li>`).join('') : ''}
              <li>+1 Relationship with ${quest.character || 'Squad'}</li>
            </ul>
          </div>
          
          <div class="quest-steps-container">
            <h3>Steps</h3>
            <div class="quest-steps-list">
              ${quest.steps?.map((step, index) => `
                <div class="quest-step-detail ${step.completed ? 'completed' : ''}">
                  <div class="step-number">${index + 1}</div>
                  <div class="step-content">
                    <div class="step-description">${step.description}</div>
                    ${step.hint ? `<div class="step-hint">${step.hint}</div>` : ''}
                  </div>
                  ${step.completed ? '<div class="step-completed-mark">✓</div>' : ''}
                </div>
              `).join('') || '<div class="no-steps">No steps available</div>'}
            </div>
          </div>
          
          <div class="quest-actions-container">
            ${quest.status === 'Active' ? `
              <button class="btn-continue-quest" data-quest-id="${quest.id}">Continue Quest</button>
            ` : quest.status === 'Not Started' && (quest.requiredLevel || 1) <= state.player?.level ? `
              <button class="btn-start-quest" data-quest-id="${quest.id}">Start Quest</button>
            ` : quest.status === 'Completed' ? `
              <div class="quest-completed-message">You have completed this quest</div>
            ` : `
              <div class="quest-locked-message">Requires Level ${quest.requiredLevel}</div>
            `}
          </div>
        </div>
      `;
      
      // Add to document
      document.body.appendChild(modal);
      
      // Close button handler
      const closeButton = modal.querySelector('.close-modal');
      closeButton.addEventListener('click', () => {
        modal.classList.add('closing');
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 300);
      });
      
      // Action button handlers in modal
      const startButton = modal.querySelector('.btn-start-quest');
      if (startButton) {
        startButton.addEventListener('click', () => {
          this.startQuest(questId);
        });
      }
      
      const continueButton = modal.querySelector('.btn-continue-quest');
      if (continueButton) {
        continueButton.addEventListener('click', () => {
          this.continueQuest(questId);
        });
      }
      
      // Click outside to close
      modal.addEventListener('click', (event) => {
        if (event.target === modal) {
          closeButton.click();
        }
      });
      
      // Show modal with animation
      setTimeout(() => {
        modal.classList.add('visible');
      }, 10);
      
    } catch (error) {
      console.error('[QuestBoardComponent] Error showing quest details:', error);
    }
  }
  
  // Filter quests based on status
  filterQuests(filter) {
    if (!this.container) return;
    
    const questCards = this.container.querySelectorAll('.quest-card');
    
    questCards.forEach(card => {
      const status = card.dataset.status.toLowerCase();
      
      switch (filter) {
        case 'all':
          card.style.display = '';
          break;
        case 'active':
          card.style.display = status === 'active' ? '' : 'none';
          break;
        case 'available':
          card.style.display = (status === 'not started' && !card.classList.contains('locked')) ? '' : 'none';
          break;
        case 'completed':
          card.style.display = status === 'completed' ? '' : 'none';
          break;
      }
    });
  }
  
  // Apply animations to quest cards
  applyAnimations() {
    if (!this.container) return;
    
    const questCards = this.container.querySelectorAll('.quest-card');
    
    questCards.forEach((card, index) => {
      // Add animation with staggered delay
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 50 * index);
    });
  }
  
  // Show toast notification
  showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.style.position = 'fixed';
      toastContainer.style.bottom = '20px';
      toastContainer.style.right = '20px';
      toastContainer.style.zIndex = '1000';
      document.body.appendChild(toastContainer);
    }
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Remove after timeout
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }
}
