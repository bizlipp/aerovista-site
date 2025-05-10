// slices/questSlice.js
import { createSlice, createEntityAdapter } from "../toolkit.js";

const questsAdapter = createEntityAdapter();

const initialQuests = [
  {
    id: 'theFirstVolt',
    title: 'The First Volt',
    description: 'Complete your first 72V build...',
    difficulty: 'Beginner',
    status: 'Active',
    progress: 60,
    character: 'charlie',
    steps: [
      { description: 'Visit Charlie\'s Workshop', completed: true },
      { description: 'Select battery components', completed: true },
      { description: 'Assemble and test battery pack', completed: false },
      { description: 'Install and test with Charlie', completed: false }
    ]
  },
  {
    id: 'goneFishin',
    title: 'Gone Fishin\'',
    description: 'Join Billy on his fishing trip...',
    difficulty: 'Intermediate',
    status: 'Not Started',
    progress: 0,
    character: 'billy',
    steps: [
      { description: 'Visit Billy at the lake', completed: false },
      { description: 'Catch your first fish', completed: false },
      { description: 'Learn about waterproofing', completed: false },
      { description: 'Build waterproof housing', completed: false },
      { description: 'Test build in lake', completed: false }
    ]
  }
];

const questSlice = createSlice({
  name: 'quests',
  initialState: questsAdapter.addMany(questsAdapter.getInitialState(), initialQuests),
  reducers: {
    progressStep: (state, action) => {
      const { id, step } = action.payload;
      const quest = state.entities[id];
      if (quest && quest.steps[step] && !quest.steps[step].completed) {
        quest.steps[step].completed = true;
        const completedSteps = quest.steps.filter(s => s.completed).length;
        quest.progress = Math.round((completedSteps / quest.steps.length) * 100);
        if (quest.progress === 100) {
          quest.status = 'Completed';
        }
      }
    },
    updateQuestStatus: (state, action) => {
      const { id, status } = action.payload;
      if (state.entities[id]) {
        state.entities[id].status = status;
      }
    }
  }
});

export const { selectAll: selectAllQuests, selectById: selectQuestById } = questsAdapter.getSelectors(state => state.quests);
export const { progressStep, updateQuestStatus } = questSlice.actions;
export default questSlice.reducer;
