// questSlice.js
import { createSlice, createEntityAdapter } from '../toolkit.js';

// Create entity adapter for quests
const questsAdapter = createEntityAdapter();

const initialState = questsAdapter.getInitialState({
  isLoading: false,
  activeQuestId: null
});

export const questSlice = createSlice({
  name: 'quests',
  initialState,
  reducers: {
    // Add a new quest
    addQuest: (state, action) => {
      questsAdapter.addOne(state, action.payload);
    },
    
    // Add multiple quests
    addQuests: (state, action) => {
      questsAdapter.addMany(state, action.payload);
    },
    
    // Update a quest's status (Active, Completed, Failed)
    updateQuestStatus: (state, action) => {
      const { id, status } = action.payload;
      questsAdapter.updateOne(state, {
        id,
        changes: { status }
      });
    },
    
    // Update a quest's progress (0-100)
    updateQuestProgress: (state, action) => {
      const { questId, progress } = action.payload;
      questsAdapter.updateOne(state, {
        id: questId,
        changes: { progress }
      });
    },
    
    // Update a quest step's completion status
    updateQuestStep: (state, action) => {
      const { questId, stepIndex, completed } = action.payload;
      const quest = state.entities[questId];
      
      if (quest && quest.steps && quest.steps[stepIndex]) {
        quest.steps[stepIndex].completed = completed;
      }
    },
    
    // Progress a quest step (mark as completed)
    progressStep: (state, action) => {
      const { questId, stepIndex } = action.payload;
      const quest = state.entities[questId];
      
      if (quest && quest.steps && quest.steps[stepIndex]) {
        quest.steps[stepIndex].completed = true;
        
        // Update progress percentage
        const completedSteps = quest.steps.filter(step => step.completed).length;
        const totalSteps = quest.steps.length;
        quest.progress = Math.floor((completedSteps / totalSteps) * 100);
        
        // Auto complete quest if all steps are done
        if (quest.progress >= 100) {
          quest.status = 'Completed';
        }
      }
    },
    
    // Remove a quest
    removeQuest: (state, action) => {
      questsAdapter.removeOne(state, action.payload);
    },
    
    // Clear all quests
    clearQuests: (state) => {
      questsAdapter.removeAll(state);
    },
    
    // Set active quest
    setActiveQuest: (state, action) => {
      state.activeQuestId = action.payload;
    }
  }
});

// Export the actions
export const { 
  addQuest, 
  addQuests, 
  updateQuestStatus, 
  updateQuestProgress, 
  updateQuestStep,
  progressStep,
  removeQuest,
  clearQuests,
  setActiveQuest
} = questSlice.actions;

// Export the reducer
export default questSlice.reducer; 