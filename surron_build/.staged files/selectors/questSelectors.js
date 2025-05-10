export const getActiveQuests = state =>
  Object.values(state.quests.entities || {}).filter(q => q.status === 'Active');
