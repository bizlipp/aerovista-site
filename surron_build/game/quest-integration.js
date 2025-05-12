/**
 * quest-integration.js
 * 
 * Provides integration between the quest system and game components
 * such as the fishing mini-game, bike building, and other activities.
 * 
 * This facilitates mission progress tracking, state updates, and
 * proper synchronization between different game components.
 */

import { store } from '../StateStackULTRA/store/gameStore.js';
import GameCore from './GameCore.js';
import { progressStep, updateQuestStatus } from '../StateStackULTRA/slices/questSlice.js';
import { updateRelationship, incrementQuestCount } from '../StateStackULTRA/slices/characterSlice.js';

/**
 * Class for handling quest integrations across different game components
 */
class QuestIntegration {
  constructor() {
    this.activeQuests = null;
    this.activeQuestsByComponent = {
      fishing: [],
      building: [],
      racing: [],
      adventure: []
    };
    
    // Initialize by loading the current quest state
    this.refreshQuests();
  }
  
  /**
   * Refresh quests from the store
   */
  refreshQuests() {
    try {
      const state = store.getState();
      const quests = state.quests?.entities || {};
      
      // Get active quests
      this.activeQuests = Object.values(quests).filter(quest => 
        quest.status === 'Active'
      );
      
      // Categorize quests by component
      this.categorizeQuests();
      
      console.log('[QuestIntegration] Refreshed quests:', {
        active: this.activeQuests.length,
        byComponent: {
          fishing: this.activeQuestsByComponent.fishing.length,
          building: this.activeQuestsByComponent.building.length,
          racing: this.activeQuestsByComponent.racing.length,
          adventure: this.activeQuestsByComponent.adventure.length
        }
      });
    } catch (error) {
      console.error('[QuestIntegration] Error refreshing quests:', error);
    }
  }
  
  /**
   * Categorize quests by their related component
   */
  categorizeQuests() {
    // Reset categorized quests
    for (const component in this.activeQuestsByComponent) {
      this.activeQuestsByComponent[component] = [];
    }
    
    if (!this.activeQuests) return;
    
    // Categorize each quest
    this.activeQuests.forEach(quest => {
      // Categorize based on character, description, or explicit tag
      if (quest.component) {
        // Explicit component tag
        if (this.activeQuestsByComponent[quest.component]) {
          this.activeQuestsByComponent[quest.component].push(quest);
        }
      } else if (quest.character === 'billy' || quest.description?.toLowerCase().includes('fish')) {
        this.activeQuestsByComponent.fishing.push(quest);
      } else if (quest.character === 'charlie' || quest.description?.toLowerCase().includes('build')) {
        this.activeQuestsByComponent.building.push(quest);
      } else if (quest.description?.toLowerCase().includes('race') || quest.description?.toLowerCase().includes('speed')) {
        this.activeQuestsByComponent.racing.push(quest);
      } else {
        // Default to adventure if no other match
        this.activeQuestsByComponent.adventure.push(quest);
      }
    });
  }
  
  /**
   * Get quests related to a specific component
   * @param {string} component - Component name (fishing, building, racing, adventure)
   * @returns {Array} Array of quests for the component
   */
  getQuestsForComponent(component) {
    return this.activeQuestsByComponent[component] || [];
  }
  
  /**
   * Update a quest step based on activity in a component
   * @param {string} component - Component name
   * @param {Object} action - Action data {type, target, value}
   * @returns {boolean} True if any quest was updated
   */
  updateQuestProgress(component, action) {
    let updated = false;
    const quests = this.getQuestsForComponent(component);
    
    if (quests.length === 0) return false;
    
    quests.forEach(quest => {
      // Find a step that matches the action criteria
      const stepIndex = quest.steps?.findIndex(step => {
        // Skip already completed steps
        if (step.completed) return false;
        
        // Check if step description matches the action
        const desc = step.description.toLowerCase();
        
        switch (action.type) {
          case 'catch_fish':
            return desc.includes('catch') && 
                  (!action.target || desc.includes(action.target.toLowerCase()));
          case 'build_bike':
            return desc.includes('build') && 
                  (!action.target || desc.includes(action.target.toLowerCase()));
          case 'visit_location':
            return desc.includes('visit') && 
                  (!action.target || desc.includes(action.target.toLowerCase()));
          case 'collect_item':
            return desc.includes('collect') && 
                  (!action.target || desc.includes(action.target.toLowerCase()));
          default:
            return false;
        }
      });
      
      // Update the step if found
      if (stepIndex !== -1 && stepIndex !== undefined) {
        store.dispatch(progressStep({
          id: quest.id,
          step: stepIndex
        }));
        updated = true;
        
        // Check if character reputation should be updated
        if (quest.character) {
          store.dispatch(updateRelationship({
            character: quest.character,
            delta: 1
          }));
        }
        
        // Show notification through GameCore or other notification mechanism
        console.log(`[QuestIntegration] Updated quest ${quest.id}, step ${stepIndex}`);
      }
    });
    
    // If any updates were made, save state and refresh quests
    if (updated) {
      GameCore.save();
      this.refreshQuests();
    }
    
    return updated;
  }
  
  /**
   * Complete a quest
   * @param {string} questId - ID of quest to complete
   * @returns {boolean} True if quest was completed
   */
  completeQuest(questId) {
    try {
      // Update quest status
      store.dispatch(updateQuestStatus({
        id: questId,
        status: 'Completed'
      }));
      
      // Get quest details
      const state = store.getState();
      const quest = state.quests?.entities?.[questId];
      
      if (quest) {
        // Update character quest counter if applicable
        if (quest.character) {
          store.dispatch(incrementQuestCount(quest.character));
        }
        
        // Add quest to completed missions in player state
        GameCore.dispatch('completeMission', questId);
        
        // Add reputation and other rewards
        GameCore.addXP(quest.xpReward || 100);
        GameCore.addCurrency(quest.currencyReward || 50);
        
        // Save state
        GameCore.save();
        console.log(`[QuestIntegration] Completed quest ${questId}`);
        return true;
      }
    } catch (error) {
      console.error(`[QuestIntegration] Error completing quest ${questId}:`, error);
    }
    
    return false;
  }
  
  /**
   * Get all target items needed for quests in a component
   * @param {string} component - Component name
   * @returns {Set} Set of target items needed
   */
  getTargetItemsForComponent(component) {
    const targets = new Set();
    const quests = this.getQuestsForComponent(component);
    
    quests.forEach(quest => {
      quest.steps?.forEach(step => {
        if (!step.completed) {
          // Look for specific targets in step descriptions
          // Example: "Catch a Rainbow Trout" -> extracts "Rainbow Trout"
          const catchPattern = /catch (?:a|an) ([\w\s]+)/i;
          const buildPattern = /build (?:a|an) ([\w\s]+)/i;
          const collectPattern = /collect (?:a|an)? ([\w\s]+)/i;
          
          // Try each pattern based on component
          let match = null;
          if (component === 'fishing') {
            match = step.description.match(catchPattern);
          } else if (component === 'building') {
            match = step.description.match(buildPattern);
          } else {
            match = step.description.match(collectPattern);
          }
          
          if (match && match[1]) {
            targets.add(match[1].trim());
          }
        }
      });
    });
    
    return targets;
  }
  
  /**
   * Check if a specific item is a target for any active quest in the component
   * @param {string} component - Component name
   * @param {string} itemName - Name of the item to check
   * @returns {boolean} True if the item is a target
   */
  isTargetItem(component, itemName) {
    const targets = this.getTargetItemsForComponent(component);
    return targets.has(itemName);
  }
}

// Create singleton instance
const questIntegration = new QuestIntegration();
export default questIntegration; 