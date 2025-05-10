// selectors.js (updated for Phase 2 use in UI)

// CHARACTER SELECTORS
export const getCharacterStats = (state, character) => state.characters[character]?.stats || {};
export const getCharacterLevel = (state, character) => state.characters[character]?.level ?? 1;
export const getCharacterRelationship = (state, character) => state.characters[character]?.relationship ?? 0;

// QUEST SELECTORS
export const getQuestProgress = (state, questId) => state.quests.entities[questId]?.progress ?? 0;
export const getQuestStatus = (state, questId) => state.quests.entities[questId]?.status || 'Unknown';

// LOCATION SELECTORS
export const getUnlockedLocations = (state) =>
  Object.entries(state.locations)
    .filter(([_, loc]) => loc.unlocked)
    .map(([key]) => key);

// PLAYER SELECTORS
export const getTotalParts = (state) =>
  (state.player?.inventory || []).reduce(
    (sum, item) => (item.category === 'Component' ? sum + item.quantity : sum),
    0
  );

export const getPlayerLevel = (state) => state.player?.level ?? 1;
export const getPlayerXP = (state) => state.player?.xp ?? 0;
export const getPlayerCurrency = (state) => state.player?.currency ?? 0;
export const getPlayerReputation = (state) => state.player?.reputation ?? 0;
  