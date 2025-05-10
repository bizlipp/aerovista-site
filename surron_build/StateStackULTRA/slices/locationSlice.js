// slices/locationSlice.js
import { createSlice } from "../toolkit.js";

const initialState = {
  workshop: {
    name: "Charlie's Workshop",
    unlocked: true,
    requiresLevel: 1,
    description: "Charlie's DIY mod zone: pizza boxes, solder smoke, and chaos.",
    activities: [
      { name: "Build Crazy Mods", requiresLevel: 3 },
      { name: "Learn Power Tuning", requiresQuest: "The First Volt" },
      { name: "Pizza Party", requiresItem: "Pizza" }
    ]
  },
  lake: {
    name: "Billy's Fishing Spot",
    unlocked: true,
    requiresLevel: 1,
    description: "Quiet lake with Billy's shack. Great for fishing and chill mods.",
    activities: [
      { name: "Go Fishing", requiresItem: "Fishing Rod" },
      { name: "Test Waterproof Mods", requiresLevel: 2 },
      { name: "Relax and Restore Energy", requiresNothing: true }
    ]
  },
  lab: {
    name: "TBD's Secret Lab",
    unlocked: false,
    requiresLevel: 5,
    description: "Hacked-together lab full of black-market parts and glowing terminals.",
    activities: [
      { name: "Program Controllers", requiresLevel: 5 },
      { name: "Research Advanced Materials", requiresLevel: 6 },
      { name: "Analyze Performance Data", requiresLevel: 5 }
    ]
  }
};

const locationSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {
    unlockLocation(state, action) {
      const locationKey = action.payload;
      if (state[locationKey]) {
        state[locationKey].unlocked = true;
      }
    },
    updateLocationDescription(state, action) {
      const { locationKey, newDescription } = action.payload;
      if (state[locationKey]) {
        state[locationKey].description = newDescription;
      }
    }
  }
});

export const { unlockLocation, updateLocationDescription } = locationSlice.actions;
export default locationSlice.reducer;
