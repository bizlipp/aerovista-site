// actionDispatchers.js – Replaces procedural methods from SurronGame with Redux actions
import { store } from './StateStackULTRA/store/gameStore.js';
import { progressStep, updateQuestStatus } from '../StateStackULTRA/slices/questSlice.js';
import { updateRelationship, incrementQuestCount } from '../StateStackULTRA/slices/characterSlice.js';
import { unlockLocation } from '../StateStackULTRA/slices/locationSlice.js';
import { playerActions } from '../StateStackULTRA/slices/playerSlice.js';
import GameCore from './game/GameCore.js';

export const dispatchers = {
  progressQuest(questId, stepIndex) {
    const state = store.getState();
    const quest = state.quests?.entities?.[questId];
    
    if (!quest) {
      console.error(`Quest with ID ${questId} not found`);
      return false;
    }
    
    // Update step completion status
    store.dispatch({
      type: 'quests/updateQuestStep',
      payload: {
        questId,
        stepIndex,
        completed: true
      }
    });
    
    // Update quest progress percentage
    const steps = quest.steps || [];
    const completedSteps = steps.filter(step => step.completed).length + 1; // +1 for the current step
    const progress = Math.floor((completedSteps / steps.length) * 100);
    
    store.dispatch({
      type: 'quests/updateQuestProgress',
      payload: {
        questId,
        progress
      }
    });
    
    // Check if all steps are completed
    if (progress >= 100) {
      completeQuest(questId);
      return true;
    }
    
    GameCore.save();
    return true;
  },

  completeQuest(questId, rewards = {}) {
    const state = store.getState();
    const quest = state.quests.entities[questId];
    if (!quest) return;

    // Give rewards
    if (rewards.currency) store.dispatch(playerActions.addCurrency(rewards.currency));
    if (rewards.reputation) store.dispatch(playerActions.updateReputation(rewards.reputation));
    if (rewards.items) {
      rewards.items.forEach(item => store.dispatch(playerActions.addItem({
        id: item.toLowerCase().replace(/\s+/g, '_'),
        name: item,
        quantity: 1,
        acquiredAt: Date.now()
      })));
    }

    // Character relationship
    if (quest.character) {
      store.dispatch(incrementQuestCount(quest.character));
      store.dispatch(updateRelationship({ character: quest.character, delta: 1 }));
    }

    store.dispatch(updateQuestStatus({ id: questId, status: 'Completed' }));

    // Show completion notification
    if (window.toast) {
      window.toast.show(`Quest Completed: ${quest.title}`, 'success');
    }

    GameCore.save();
  },

  addItemByName(name) {
    const id = name.toLowerCase().replace(/\s+/g, '_');
    store.dispatch(playerActions.addItem({
      id,
      name,
      quantity: 1,
      acquiredAt: Date.now()
    }));
  },

  completeChapter(newChapterNumber) {
    const titleMap = {
      1: "The Voltage Uprising",
      2: "Lakeside Legends",
      3: "TBD's Revelation"
    };

    store.dispatch(playerActions.setChapter({
      chapter: newChapterNumber,
      title: titleMap[newChapterNumber] || "The Next Chapter"
    }));

    // Add chapter completion rewards
    GameCore.addXP(500);
    GameCore.addCurrency(1000);
    
    // Add a special reward item
    const chapterRewardItem = `Chapter ${newChapterNumber} Completion Trophy`;
    addItemByName(chapterRewardItem);
    
    if (window.toast) {
      window.toast.show(`Chapter ${newChapterNumber} completed!`, 'success');
    }

    GameCore.save();
  },

  unlockArea(locationKey) {
    store.dispatch(unlockLocation(locationKey));

    if (window.toast) {
      const locationName = store.getState().locations[locationKey]?.name || locationKey;
      window.toast.show(`New area unlocked: ${locationName}`, 'info');
    }

    GameCore.save();
  }
};
