// fishingSelectors.js

export const getCurrentRod = (state) => state.fishing.currentRod;
export const getCurrentLure = (state) => state.fishing.currentLure;
export const getFishingStreak = (state) => state.fishing.streak;
export const getLastCatch = (state) => state.fishing.lastCatch;
export const isFishingActive = (state) => state.fishing.isActive;
export const getCatchHistory = (state) => state.fishing.catches;

// Derived bonus calculation
export const getCatchBonusMultiplier = (state) => {
  const lure = getCurrentLure(state);
  switch (lure) {
    case 'Premium Lure': return 1.5;
    case 'Shiny Spoon': return 2.0;
    default: return 1.0;
  }
};
