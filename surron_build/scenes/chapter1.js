// scenes/chapter1.js
import { store } from '../StateStackULTRA/store/gameStore.js';
import { playerActions } from '../StateStackULTRA/slices/playerSlice.js';
import { dispatchers } from '../actionDispatchers.js';
import GameCore from '../game/GameCore.js';

// Chapter data
export const chapterData = {
  id: 1,
  title: "The Voltage Uprising",
  description: "Join Charlie and the Surron Squad on their first adventure to test new bike modifications.",
  requiredLevel: 1,
  mainCharacter: "charlie",
  locations: ["workshop", "tubbs-hill", "downtown"],
  rewardXP: 500,
  rewardCurrency: 1000,
  rewardItems: ["Basic Controller", "Performance Battery", "Charlie's Toolkit"]
};

// Scene definitions with choices and outcomes
export const scenes = {
  'intro': {
    background: "images/backgrounds/workshop-night.jpg",
    speaker: "narrator",
    text: "It's midnight at Charlie's workshop. The faint smell of ozone and pizza hangs in the air. You've been invited to join the Surron Squad on a special mission.",
    choices: [
      { text: "\"What's this mission about?\"", nextScene: "mission-briefing" },
      { text: "\"Why am I here so late?\"", nextScene: "late-night" },
      { text: "\"I'm just here for the pizza.\"", nextScene: "pizza-response", effect: { energy: +10 } }
    ],
    onComplete: (choice) => {
      // Initialize player state in chapter 1
      GameCore.addXP(10);
      dispatchers.unlockArea("workshop");
    }
  },
  
  // ... existing scenes ...
  
  // NEW SCENE: Tubbs Hill Trail
  'tubbs-hill-trail': {
    background: "images/backgrounds/tubbs-hill-overlook.jpg",
    speaker: "charlie",
    text: "Tubbs Hill at dawn. Still damp from the morning dew, and perfect for testing grip mods. Let's rip.",
    choices: [
      {
        text: "\"I'm ready—let's push the throttle.\"",
        nextScene: "tubbs-hill-descent",
        outcome: { reputation: +3, energy: -10 }
      },
      {
        text: "\"Is this even legal?\"",
        nextScene: "charlie-shrug"
      }
    ],
    onComplete: (choice) => {
      // Add XP and relationship points
      GameCore.addXP(20);
      GameCore.updateRelationship("charlie", 1);
      
      // Update player stats based on choice
      if (choice.outcome) {
        if (choice.outcome.reputation) {
          dispatchers.addReputation(choice.outcome.reputation);
        }
      }
    }
  },

  'tubbs-hill-descent': {
    background: "images/backgrounds/tubbs-hill-trail.jpg",
    speaker: "narrator",
    text: "The descent is fast, root-riddled, and glorious. You barely hold traction—but your build holds up. Just barely.",
    choices: [
      { text: "\"Whew. Worth it.\"", nextScene: "mission-complete", effect: { parts: +2 } }
    ],
    onComplete: (choice) => {
      // Add XP reward
      GameCore.addXP(40);
      
      // Add parts
      if (choice.effect && choice.effect.parts) {
        dispatchers.addParts(choice.effect.parts);
      }
    }
  },

  // NEW SCENE: Downtown CDA Encounter
  'downtown-meet': {
    background: "images/backgrounds/downtown-cda.jpg",
    speaker: "billy",
    text: "Charlie said to meet outside Lakers. He better not be starting something again...",
    choices: [
      { text: "\"Let's find him.\"", nextScene: "lakers-scene" },
      { text: "\"We should split up.\"", nextScene: "split-search", effect: { energy: -5 } }
    ],
    onComplete: (choice) => {
      // Unlock downtown location
      dispatchers.unlockArea("downtown");
    }
  },

  'lakers-scene': {
    background: "images/backgrounds/lakers-bar.jpg",
    speaker: "charlie",
    text: "There you are! I may have challenged a guy to a wheelie duel. Don't worry—it's for pinks.",
    choices: [
      { text: "\"DUDE. Seriously?\"", nextScene: "mission-complete", effect: { reputation: +2 } }
    ],
    onComplete: (choice) => {
      // Add XP, currency and items
      GameCore.addXP(50);
      GameCore.addCurrency(100);
      
      // Add controller item
      dispatchers.addItemByName("controller");
      
      // Add reputation
      if (choice.effect && choice.effect.reputation) {
        dispatchers.addReputation(choice.effect.reputation);
      }
    }
  },
  
  // Chapter completion scene
  'mission-complete': {
    background: "images/backgrounds/workshop-night.jpg",
    speaker: "narrator",
    text: "With the mission complete, you've earned the respect of the Surron Squad. Charlie hints at bigger adventures to come...",
    choices: [
      { text: "\"I can't wait to see what's next.\"", nextScene: "chapter1-end" }
    ],
    onComplete: (choice) => {
      // Add final XP reward
      GameCore.addXP(100);
    }
  },
  
  'chapter1-end': {
    background: "images/backgrounds/squad-sunset.jpg",
    speaker: "narrator",
    text: "As the sun sets on your first adventure with the Surron Squad, you realize this is just the beginning. New challenges and opportunities await...",
    choices: [
      { text: "Return to Squad HQ", nextScene: "return-to-hq" }
    ],
    onComplete: (choice) => {
      // Complete chapter 1
      dispatchers.completeChapter(1);
      
      // Add chapter completion rewards
      GameCore.addXP(chapterData.rewardXP);
      GameCore.addCurrency(chapterData.rewardCurrency);
      
      // Add reward items
      chapterData.rewardItems.forEach(item => {
        dispatchers.addItemByName(item);
      });
      
      // Show completion toast
      if (window.toast) {
        window.toast.show(`Chapter 1 completed! New locations and items unlocked.`, 'success');
      }
    }
  }
};

// XP Coins for Chapter 1
export const xpCoins = [
  {
    id: 'ch1_coin1',
    location: 'workshop',
    coordinates: { x: 75, y: 45 },
    value: 50,
    found: false,
    description: 'Hidden behind the workbench',
    hint: 'Check Charlie\'s workbench carefully'
  },
  {
    id: 'ch1_coin2',
    location: 'tubbs-hill',
    coordinates: { x: 30, y: 65 },
    value: 75,
    found: false,
    description: 'Near the trail entrance',
    hint: 'Look for something shiny at the trailhead'
  },
  {
    id: 'ch1_coin3',
    location: 'downtown',
    coordinates: { x: 60, y: 80 },
    value: 100,
    found: false,
    description: 'Under the bench at Laker\'s',
    hint: 'The bench near Lakers has seen many visitors drop things'
  }
];

/**
 * Get all XP coins for Chapter 1
 * @returns {Array} XP coins for Chapter 1
 */
export function getXPCoins() {
  return xpCoins;
}

/**
 * Find an XP coin by ID
 * @param {string} coinId - The ID of the coin to find
 * @returns {Object|null} The coin object or null if not found
 */
export function findXPCoin(coinId) {
  return xpCoins.find(coin => coin.id === coinId) || null;
}

/**
 * Collect an XP coin and add its value to the player's XP
 * @param {string} coinId - The ID of the coin to collect
 * @returns {boolean} Whether the coin was successfully collected
 */
export function collectXPCoin(coinId) {
  const coin = findXPCoin(coinId);
  if (!coin || coin.found) return false;
  
  // Mark the coin as found
  coin.found = true;
  
  // Add XP to the player
  GameCore.addXP(coin.value);
  
  // Show a toast notification
  if (window.toast) {
    window.toast.show(`Found XP Coin (${coin.value} XP)!`, 'success');
  }
  
  // Save the game state
  GameCore.save();
  
  return true;
}

/**
 * Check if the player meets the requirements to start Chapter 1
 * @returns {boolean} Whether the player can start Chapter 1
 */
export function canStartChapter1() {
  const state = store.getState();
  const playerLevel = state.player?.level || 1;
  
  return playerLevel >= chapterData.requiredLevel;
}

/**
 * Start Chapter 1
 * @returns {boolean} Success status
 */
export function startChapter1() {
  if (!canStartChapter1()) {
    console.warn('Player does not meet requirements to start Chapter 1');
    return false;
  }
  
  // Update player state
  store.dispatch(playerActions.setActiveScene('intro'));
  
  // Unlock locations
  chapterData.locations.forEach(location => {
    dispatchers.unlockArea(location);
  });
  
  console.log('Chapter 1 started');
  return true;
}

export default {
  chapterData,
  scenes,
  canStartChapter1,
  startChapter1
};
  