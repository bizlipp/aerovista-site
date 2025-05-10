// characterSlice.js
import { createSlice, createEntityAdapter } from '../toolkit.js';

// Create entity adapter for characters
const charactersAdapter = createEntityAdapter();

const initialState = charactersAdapter.getInitialState({
  characters: {
    charlie: {
      id: 'charlie',
      name: 'Charlie "Throttle"',
      relationship: 0,
      questsCompleted: 0,
      level: 1,
      portrait: 'images/surron-charlie-alert-pose.png',
      stats: {
        power: 85,
        stealth: 30,
        tech: 60,
        charm: 50,
        intelligence: 65
      }
    },
    billy: {
      id: 'billy',
      name: 'Billy "Baggin\'s"',
      relationship: 0,
      questsCompleted: 0,
      level: 1,
      portrait: 'images/surron-billy-fishing_ready-pose.png',
      stats: {
        power: 60,
        stealth: 75,
        tech: 40,
        charm: 70,
        intelligence: 80
      }
    },
    tbd: {
      id: 'tbd',
      name: 'TBD',
      relationship: 0,
      questsCompleted: 0,
      level: 1,
      portrait: 'images/surron-tbd-terminal-ready.png',
      stats: {
        power: 30,
        stealth: 60,
        tech: 95,
        charm: 40,
        intelligence: 99
      }
    }
  }
});

export const characterSlice = createSlice({
  name: 'characters',
  initialState,
  reducers: {
    // Update relationship with a character
    updateRelationship: (state, action) => {
      const { character, delta } = action.payload;
      if (state.characters[character]) {
        state.characters[character].relationship += delta;
        
        // Cap relationship value between -10 and 10
        if (state.characters[character].relationship > 10) {
          state.characters[character].relationship = 10;
        } else if (state.characters[character].relationship < -10) {
          state.characters[character].relationship = -10;
        }
      }
    },
    
    // Increment quests completed by a character
    incrementQuestCount: (state, action) => {
      const characterId = action.payload;
      if (state.characters[characterId]) {
        state.characters[characterId].questsCompleted += 1;
        
        // Auto level up character after every 3 quests
        if (state.characters[characterId].questsCompleted % 3 === 0) {
          state.characters[characterId].level += 1;
        }
      }
    },
    
    // Set character level
    setCharacterLevel: (state, action) => {
      const { character, level } = action.payload;
      if (state.characters[character]) {
        state.characters[character].level = level;
      }
    },
    
    // Update character stats
    updateCharacterStat: (state, action) => {
      const { character, stat, value } = action.payload;
      if (state.characters[character] && state.characters[character].stats) {
        state.characters[character].stats[stat] = value;
      }
    }
  }
});

// Export the actions
export const { 
  updateRelationship, 
  incrementQuestCount, 
  setCharacterLevel,
  updateCharacterStat
} = characterSlice.actions;

// Export the reducer
export default characterSlice.reducer; 