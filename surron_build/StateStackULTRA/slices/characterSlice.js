// slices/characterSlice.js
import { createSlice } from "../toolkit.js";

const initialState = {
  charlie: {
    name: "Charlie \"Throttle\"",
    level: 3,
    relationship: 5,
    stats: {
      power: 85,
      control: 35,
      durability: 50,
      pizzaCapacity: 95
    },
    questsCompleted: 0
  },
  billy: {
    name: "Billy \"Baggin's\"",
    level: 2,
    relationship: 3,
    stats: {
      power: 45,
      control: 65,
      durability: 80,
      fishingSkill: 90
    },
    questsCompleted: 0
  },
  tbd: {
    name: "TBD",
    level: 4,
    relationship: 2,
    stats: {
      power: 60,
      control: 90,
      durability: 70,
      techSkills: 98
    },
    questsCompleted: 0
  }
};

const characterSlice = createSlice({
  name: 'characters',
  initialState,
  reducers: {
    updateRelationship(state, action) {
      const { character, delta } = action.payload;
      if (state[character]) {
        state[character].relationship = Math.max(0, Math.min(10, state[character].relationship + delta));
      }
    },
    incrementQuestCount(state, action) {
      const character = action.payload;
      if (state[character]) {
        state[character].questsCompleted++;
      }
    },
    adjustStat(state, action) {
      const { character, stat, amount } = action.payload;
      if (state[character]?.stats[stat] !== undefined) {
        state[character].stats[stat] = Math.max(0, state[character].stats[stat] + amount);
      }
    }
  }
});

export const { updateRelationship, incrementQuestCount, adjustStat } = characterSlice.actions;
export default characterSlice.reducer;
