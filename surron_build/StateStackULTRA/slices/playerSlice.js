// StateStackULTRA/slices/playerSlice.js
export const playerSlice = {
  name: 'player',
  initialState: {
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    currency: 250,
    reputation: 0,
    inventory: [],
    builds: [],
    unlockedParts: [],
    completedMissions: [],
    adventureProgress: {
      currentChapter: 1,
      completedScenes: [],
      currentScene: 'intro'
    },
    relationships: {
      charlie: 1,
      billy: 1,
      tbd: 1
    },
    achievements: []
  },
  reducers: {
    addXP: (state, amount) => ({ 
      ...state, 
      xp: state.xp + amount 
    }),
    
    levelUp: (state, newLevel) => ({
      ...state,
      level: newLevel,
      xp: 0,
      xpToNextLevel: Math.floor(state.xpToNextLevel * 1.5)
    }),
    
    addCurrency: (state, amount) => ({ 
      ...state, 
      currency: state.currency + amount 
    }),
    
    addItem: (state, item) => {
      // Check if item with this ID already exists
      const existingItemIndex = state.inventory.findIndex(i => i.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Create a new inventory array with the updated item
        const updatedInventory = [...state.inventory];
        updatedInventory[existingItemIndex] = {
          ...updatedInventory[existingItemIndex],
          quantity: updatedInventory[existingItemIndex].quantity + 1
        };
        
        return {
          ...state,
          inventory: updatedInventory
        };
      } else {
        // Add new item to inventory
        return {
          ...state,
          inventory: [...state.inventory, item]
        };
      }
    },
    
    updateRelationship: (state, { character, delta }) => {
      const score = Math.max(0, Math.min(10, (state.relationships[character] || 1) + delta));
      return {
        ...state,
        relationships: { ...state.relationships, [character]: score }
      };
    },
    
    completeScene: (state, sceneId) => {
      // Only add the scene if it's not already in completedScenes
      if (state.adventureProgress.completedScenes.includes(sceneId)) {
        return state;
      }
      
      return {
        ...state,
        adventureProgress: {
          ...state.adventureProgress,
          completedScenes: [...state.adventureProgress.completedScenes, sceneId]
        }
      };
    },
    
    setCurrentScene: (state, sceneId) => ({
      ...state,
      adventureProgress: {
        ...state.adventureProgress,
        currentScene: sceneId
      }
    }),
    
    incrementChapter: (state) => ({
      ...state,
      adventureProgress: {
        ...state.adventureProgress,
        currentChapter: state.adventureProgress.currentChapter + 1,
        completedScenes: []
      }
    }),
    
    completeMission: (state, missionId) => {
      // Only add the mission if it's not already in completedMissions
      if (state.completedMissions.includes(missionId)) {
        return state;
      }
      
      return {
        ...state,
        completedMissions: [...state.completedMissions, missionId],
        reputation: state.reputation + 5 // Award reputation for mission completion
      };
    },
    
    initBuilds: (state, buildsArray = []) => ({
      ...state,
      builds: buildsArray
    }),
    
    addBuild: (state, build) => ({
      ...state,
      builds: [...(state.builds || []), build]
    }),
    
    initAdventureProgress: (state, progress) => ({
      ...state,
      adventureProgress: progress
    }),
    
    unlockPart: (state, partId) => {
      // Only add if not already unlocked
      if (state.unlockedParts.includes(partId)) {
        return state;
      }
      
      return {
        ...state,
        unlockedParts: [...state.unlockedParts, partId]
      };
    },
    
    loadFromStorage: (state, payload) => ({ ...state, ...payload })
  }
};
