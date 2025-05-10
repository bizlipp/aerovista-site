// fishingSlice.js – Redux state for fishing game
import { createSlice } from "../toolkit.js";

const initialState = {
  isActive: false,
  currentRod: 'Basic Rod',
  currentLure: 'Basic Lure',
  lastCatch: null,
  streak: 0,
  catches: []
};

const fishingSlice = createSlice({
  name: 'fishing',
  initialState,
  reducers: {
    startFishing(state) {
      state.isActive = true;
      state.lastCatch = null;
    },
    stopFishing(state) {
      state.isActive = false;
    },
    setRod(state, action) {
      state.currentRod = action.payload;
    },
    setLure(state, action) {
      state.currentLure = action.payload;
    },
    recordCatch(state, action) {
      const fish = action.payload;
      state.lastCatch = fish;
      state.catches.push(fish);
      state.streak += 1;
    },
    resetStreak(state) {
      state.streak = 0;
    }
  }
});

export const {
  startFishing,
  stopFishing,
  setRod,
  setLure,
  recordCatch,
  resetStreak
} = fishingSlice.actions;

export default fishingSlice.reducer;
