/**
 * QuestBoardComponent.js
 * Displays available quests and allows player to start them
 */

import ComponentBase from '../ui/ComponentBase.js';
import { store } from '../../StateStackULTRA/store/gameStore.js';
import { getActiveQuests } from '../selectors/questSelectors.js';
import { getPlayerLevel } from '../selectors/playerSelectors.js';
import { showToast } from '../../game/popup-toast.js';

export default class QuestBoardComponent extends ComponentBase {
  constructor() {
    // Listen for changes to quests and player slices
    super(['quests', 'player']);
  }
  
  render(state) {
    if (!this.container) return;
    
    try {
      const quests = getActiveQuests(state);
      const allQuests = state.quests?.entities || {};
      const playerLevel = getPlayerLevel(state);
      
      // Get completed quest count for UI
      const completedCount = Object.values(allQuests).filter(q => q.status === 'Completed').length;
      const totalQuests = Object.keys(allQuests).length;
      
      this.container.innerHTML = `
        <div class="component-container card">
          <div class="quest-board-header">
            <h2>Quest Board</h2>
            <div class="quest-stats">
              <span class="completed-count">${completedCount}/${totalQuests} Completed</span>
              <div class="quest-progress-bar">
                <div class="quest-progress-fill" style="width: ${(completedCount / Math.max(1, totalQuests)) * 100}%"></div>
              </div>
            </div>
          </div>
          
          ${quests.length === 0 ? 
            `<div class="empty-quests">
              <p>No active quests available. Check back after reaching higher levels!</p>
            </div>` : 
            `<div class="quest-grid">
              ${quests.map(quest => {
                const isLocked = quest.requiredLevel > playerLevel;
                return `
                  <div class="quest-card ${quest.character || 'squad'} ${isLocked ? 'locked' : ''}" data-quest-id="${quest.id}">
                    <div class="quest-difficulty">${quest.difficulty || 'Normal'}</div>
                    <h3>${quest.title}</h3>
                    <p>${quest.description}</p>
                    <div class="quest-info">
                      <span class="quest-character">${quest.character || 'Squad'}</span>
                      <span class="quest-status ${quest.status.toLowerCase()}">${quest.status}</span>
                    </div>
                    ${quest.progress ? 
                      `<div class="quest-progress">
                        <div class="stat-bar">
                          <div class="stat-fill ${quest.character || 'squad'}" style="width: ${quest.progress}%"></div>
                        </div>
                        <span>${quest.progress}%</span>
                      </div>` : ''
                    }
                    <div class="quest-actions">
                      <button class="btn-start-quest" data-quest-id="${quest.id}" ${isLocked ? 'disabled' : ''}>
                        ${isLocked ? `Level ${quest.requiredLevel} Required` : 'Start Quest'}
                      </button>
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
      
      this.addEventListeners();
    } catch (error) {
      console.error('Error rendering QuestBoardComponent:', error);
      this.handleRenderError(error);
    }
  }
  
  addEventListeners() {
    // Start quest buttons
    const startButtons = this.container.querySelectorAll('.btn-start-quest:not([disabled])');
    startButtons.forEach(button => {
      const questId = button.dataset.questId;
      this.addListener(button, 'click', () => this.handleStartQuest(questId));
    });
    
    // Refresh quests button
    const refreshButton = this.container.querySelector('#refresh-quests');
    if (refreshButton) {
      this.addListener(refreshButton, 'click', this.handleRefreshQuests.bind(this));
    }
    
    // Quest card clicks
    const questCards = this.container.querySelectorAll('.quest-card:not(.locked)');
    questCards.forEach(card => {
      const questId = card.dataset.questId;
      this.addListener(card, 'click', (e) => {
        // Don't trigger if the button was clicked
        if (e.target.classList.contains('btn-start-quest')) return;
        this.handleViewQuestDetails(questId);
      });
    });
  }
  
  handleStartQuest(questId) {
    // Dispatch action to start quest
    store.dispatch({
      type: 'quests/setActiveQuest',
      payload: questId
    });
    
    // Get quest info for UI feedback
    const state = store.getState();
    const quest = state.quests?.entities?.[questId];
    
    if (quest) {
      showToast(`Starting quest: ${quest.title}`, 'info');
      
      // Redirect to adventure page
      window.location.href = 'adventure.html';
    }
  }
  
  handleRefreshQuests() {
    // Dispatch action to refresh available quests
    store.dispatch({
      type: 'quests/refreshAvailableQuests',
      payload: null
    });
    
    showToast('Refreshed available quests', 'info');
  }
  
  handleViewQuestDetails(questId) {
    // Show quest details in a modal or new view
    const state = store.getState();
    const quest = state.quests?.entities?.[questId];
    
    if (quest) {
      // For now, just show a toast. In a full implementation, this would open a modal
      showToast(`Viewing details for: ${quest.title}`, 'info');
    }
  }
}
