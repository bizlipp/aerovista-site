// chapter2.js - Chapter 2: Lakeside Legends
import { store } from '../StateStackULTRA/store/gameStore.js';
import { playerActions } from '../StateStackULTRA/slices/playerSlice.js';
import { progressStep, updateQuestStatus } from '../StateStackULTRA/slices/questSlice.js';
import { unlockLocation } from '../StateStackULTRA/slices/locationSlice.js';
import { dispatchers } from '../actionDispatchers.js';
import GameCore from '../game/GameCore.js';

// Chapter data
export const chapterData = {
  id: 2,
  title: "Lakeside Legends",
  description: "Join Billy's quest to test waterproof systems at Tubbs Hill while exploring the unexplained electrical disturbances at the lake.",
  requiredLevel: 3,
  mainCharacter: "billy",
  locations: ["tubbs-hill", "downtown", "lakefront"],
  rewardXP: 750,
  rewardCurrency: 1500,
  rewardItems: ["Premium Lure", "Waterproof Battery Case", "Billy's Lucky Hat"]
};

// Scene definitions with choices and outcomes
export const scenes = {
  // Scene 1: Tubbs Hill Trail
  "tubbs-hill-trail": {
    title: "The Tubbs Hill Trail",
    description: "Billy leads you up a winding trail at Tubbs Hill, carrying fishing gear and testing equipment.",
    background: "images/backgrounds/tubbs-hill-trail.jpg",
    character: {
      name: "Billy",
      portrait: "images/surron-billy-fishing_ready-pose.png",
      mood: "determined"
    },
    dialogue: [
      {
        speaker: "Billy",
        text: "This trail leads to my secret fishing spot. Nobody else knows about it... well, except for those hikers. And those kids. And that old guy with the dog. Okay, so it's not exactly secret."
      },
      {
        speaker: "Billy",
        text: "But it IS the perfect place to test our waterproof mods. Steep rocky trail, water access, and most importantly, far enough away that Charlie can't blow anything up."
      },
      {
        speaker: "You",
        text: "How did you find this place?"
      },
      {
        speaker: "Billy",
        text: "Been fishing here since I was a kid. My dad used to bring me. It's peaceful, you know? No cell service, no noise... just you and the water."
      },
      {
        speaker: "Billy",
        text: "But lately, something weird's been happening. Fish behavior is off, and I've been getting strange electrical readings from the water. That's why I wanted to bring you here."
      }
    ],
    choices: [
      {
        text: "Ask about the electrical readings",
        nextScene: "tubbs-hill-descent",
        outcome: {
          xp: 50,
          relationship: { billy: 1 },
          inventory: null
        }
      },
      {
        text: "Suggest testing the waterproof mods first",
        nextScene: "tubbs-hill-descent",
        outcome: {
          xp: 50,
          relationship: { billy: 0 },
          inventory: null
        }
      }
    ],
    onComplete: (choice) => {
      // Unlock the lakefront location
      dispatchers.unlockArea("lakefront");
      
      // Progress related quest if active
      const state = store.getState();
      const billyQuest = Object.values(state.quests?.entities || {}).find(
        q => q.character === 'billy' && q.status === 'Active'
      );
      
      if (billyQuest) {
        dispatchers.progressQuest(billyQuest.id, 0);
      }
      
      // Add XP
      GameCore.addXP(choice.outcome.xp);
      
      // Update relationship if needed
      if (choice.outcome.relationship) {
        for (const [character, amount] of Object.entries(choice.outcome.relationship)) {
          if (amount > 0) {
            GameCore.updateRelationship(character, amount);
          }
        }
      }
    }
  },
  
  // Scene 2: Tubbs Hill Descent
  "tubbs-hill-descent": {
    title: "Descent to the Shore",
    description: "The trail narrows and descends steeply toward the lake shore.",
    background: "images/backgrounds/tubbs-hill-descent.jpg",
    character: {
      name: "Billy",
      portrait: "images/surron-billy-fishing_ready-pose.png",
      mood: "curious"
    },
    dialogue: [
      {
        speaker: "Billy",
        text: "Watch your step here. It gets pretty steep. Last time Charlie came, he tumbled all the way down. Destroyed his prototype and scared away all the fish."
      },
      {
        speaker: "Billy",
        text: "About those readings... I've been measuring voltage in the water. Usually you get tiny amounts - normal stuff. But lately? It's spiking. Way higher than it should be."
      },
      {
        speaker: "Billy",
        text: "At first I thought maybe it was the power plant or something, but the pattern is weird. It comes and goes. Almost like... pulses."
      },
      {
        speaker: "You",
        text: "That doesn't sound natural. Could it be someone testing something in the water?"
      },
      {
        speaker: "Billy",
        text: "That's what I thought too. But who? And why here? That's what we're gonna find out. First, let's test our waterproof mods in the shallows, then we can take some new readings."
      }
    ],
    choices: [
      {
        text: "Help set up the testing equipment",
        nextScene: "lakefront-testing",
        outcome: {
          xp: 75,
          relationship: { billy: 1 },
          inventory: null
        }
      },
      {
        text: "Look around for anything unusual",
        nextScene: "lakefront-discovery",
        outcome: {
          xp: 100,
          relationship: { billy: 1 },
          inventory: { item: "Strange Metal Fragment", quantity: 1 }
        }
      }
    ],
    onComplete: (choice) => {
      // Progress story
      GameCore.addXP(choice.outcome.xp);
      
      // Add inventory item if there is one
      if (choice.outcome.inventory) {
        dispatchers.addItemByName(choice.outcome.inventory.item);
      }
      
      // Update relationship
      if (choice.outcome.relationship) {
        for (const [character, amount] of Object.entries(choice.outcome.relationship)) {
          if (amount > 0) {
            GameCore.updateRelationship(character, amount);
          }
        }
      }
    }
  },
  
  // Scene 3: Downtown Meeting
  "downtown-meet": {
    title: "Downtown Meeting",
    description: "Billy has called a meeting at the local coffee shop to discuss what you found at the lake.",
    background: "images/backgrounds/downtown-coffee-shop.jpg",
    character: {
      name: "Billy",
      portrait: "images/surron-billy-fishing_ready-pose.png",
      mood: "serious"
    },
    dialogue: [
      {
        speaker: "Billy",
        text: "Thanks for meeting me here. I didn't want to talk about this at the workshop. Charlie would just want to build some crazy device before we understand what's going on."
      },
      {
        speaker: "Billy",
        text: "I sent those readings we took to TBD. He confirmed it's not normal. The voltage patterns are... structured. Almost like a signal."
      },
      {
        speaker: "You",
        text: "A signal? From what?"
      },
      {
        speaker: "Billy",
        text: "That's the million-dollar question. TBD suggested we take more readings at different points around the lake, try to triangulate the source."
      },
      {
        speaker: "Billy",
        text: "He also wants us to collect water samples. Says there might be 'particulate anomalies' or something. I just know it's affecting the fish, and that's not good."
      }
    ],
    choices: [
      {
        text: "Agree to help Billy investigate further",
        nextScene: "lakers-scene",
        outcome: {
          xp: 100,
          relationship: { billy: 2 },
          inventory: null
        }
      },
      {
        text: "Suggest bringing Charlie into the loop",
        nextScene: "lakers-scene",
        outcome: {
          xp: 75,
          relationship: { billy: 0, charlie: 1 },
          inventory: null
        }
      }
    ],
    onComplete: (choice) => {
      // Unlock a new quest
      const questId = 'lakeside_investigation';
      const state = store.getState();
      const questExists = !!state.quests?.entities?.[questId];
      
      if (!questExists) {
        // Create new quest if it doesn't exist
        store.dispatch({
          type: 'quests/addQuest',
          payload: {
            id: questId,
            title: 'Lakeside Investigation',
            description: 'Help Billy investigate the strange electrical signals in the lake.',
            status: 'Active',
            character: 'billy',
            difficulty: 'Intermediate',
            progress: 0,
            steps: [
              { description: 'Collect water samples from 3 locations', completed: false },
              { description: 'Take electrical readings at designated spots', completed: false },
              { description: 'Analyze findings with TBD', completed: false },
              { description: 'Investigate the source of the signals', completed: false }
            ],
            rewards: {
              currency: 300,
              reputation: 15,
              items: ['Advanced Fishing Rod', 'Lake Map']
            }
          }
        });
      }
      
      // Add XP and update relationship
      GameCore.addXP(choice.outcome.xp);
      
      if (choice.outcome.relationship) {
        for (const [character, amount] of Object.entries(choice.outcome.relationship)) {
          if (amount > 0) {
            GameCore.updateRelationship(character, amount);
          }
        }
      }
    }
  },
  
  // Scene 4: Lakers Game
  "lakers-scene": {
    title: "Night at the Lakers Game",
    description: "Billy has invited you to the local baseball game to discuss the next steps while relaxing.",
    background: "images/backgrounds/lakers-game.jpg",
    character: {
      name: "Billy",
      portrait: "images/surron-billy-fishing_ready-pose.png",
      mood: "relaxed"
    },
    dialogue: [
      {
        speaker: "Billy",
        text: "Nothing like a Lakers game to clear your head. Hot dogs, cold drinks, and baseball. Perfect."
      },
      {
        speaker: "Billy",
        text: "So I've been thinking about our lake situation. TBD says we need specialized equipment to track down the source. Something about triangulation and signal strength."
      },
      {
        speaker: "Billy",
        text: "He's building us some gear, but in the meantime, we need to map out where the signal is strongest. That means more trips around the lake."
      },
      {
        speaker: "Billy",
        text: "And we need to be careful. If this is someone doing experiments in the lake, they might not want us poking around."
      },
      {
        speaker: "Announcer",
        text: "And it's a home run for the Lakers! The crowd goes wild!"
      },
      {
        speaker: "Billy",
        text: "YES! Did you see that? That's what I'm talking about! Look, I know this investigation stuff isn't as exciting as Charlie's explosions, but... it matters to me. The lake is special."
      }
    ],
    choices: [
      {
        text: "Promise to help Billy protect the lake",
        nextScene: "chapter2-end",
        outcome: {
          xp: 150,
          relationship: { billy: 2 },
          inventory: { item: "Lakers Cap", quantity: 1 }
        }
      },
      {
        text: "Suggest using Sur-Rons to cover more ground",
        nextScene: "chapter2-end",
        outcome: {
          xp: 125,
          relationship: { billy: 1 },
          inventory: { item: "Lake Map", quantity: 1 }
        }
      }
    ],
    onComplete: (choice) => {
      // Reward player
      GameCore.addXP(choice.outcome.xp);
      
      // Add item
      if (choice.outcome.inventory) {
        dispatchers.addItemByName(choice.outcome.inventory.item);
      }
      
      // Update relationship
      if (choice.outcome.relationship) {
        for (const [character, amount] of Object.entries(choice.outcome.relationship)) {
          if (amount > 0) {
            GameCore.updateRelationship(character, amount);
          }
        }
      }
      
      // Progress the quest
      const questId = 'lakeside_investigation';
      const state = store.getState();
      const questExists = !!state.quests?.entities?.[questId];
      
      if (questExists) {
        dispatchers.progressQuest(questId, 0);
      }
    }
  },
  
  // Chapter 2 Conclusion
  "chapter2-end": {
    title: "Chapter 2: New Horizons",
    description: "As Chapter 2 concludes, new mysteries and adventures await.",
    background: "images/backgrounds/lakeside-sunset.jpg",
    character: {
      name: "Narrator",
      portrait: null,
      mood: "neutral"
    },
    dialogue: [
      {
        speaker: "Narrator",
        text: "As you and Billy begin to unravel the mystery of the lake, new questions arise. What is causing the electrical signals? Who might be behind it, and why?"
      },
      {
        speaker: "Narrator",
        text: "The bond between you and the Surron Squad grows stronger. Billy appreciates your help with his investigation, and your skills with the Sur-Ron continue to improve."
      },
      {
        speaker: "Narrator",
        text: "But the adventure is just beginning. More challenges await, both on the trails and in the workshop."
      },
      {
        speaker: "Narrator",
        text: "The mystery of Tubbs Hill Lake will continue in upcoming adventures. For now, you've earned a well-deserved rest and the respect of your fellow squad members."
      }
    ],
    choices: [
      {
        text: "Continue to Squad HQ",
        nextScene: "return-to-hq",
        outcome: {
          xp: 200,
          relationship: null,
          inventory: null
        }
      }
    ],
    onComplete: (choice) => {
      // Complete chapter 2
      dispatchers.completeChapter(2);
      
      // Add final XP reward
      GameCore.addXP(choice.outcome.xp);
      
      // Unlock chapter 3 content (if available)
      const state = store.getState();
      const currentChapter = state.player?.chapter || 1;
      
      if (currentChapter >= 2) {
        // Unlock new location for Chapter 3
        dispatchers.unlockArea("downtown-garage");
        
        // Add chapter completion reward items
        chapterData.rewardItems.forEach(item => {
          dispatchers.addItemByName(item);
        });
        
        // Show completion toast
        if (window.toast) {
          window.toast.show(`Chapter 2 completed! New locations and items unlocked.`, 'success');
        }
      }
    }
  }
};

// XP Coins for Chapter 2
export const xpCoins = [
  {
    id: 'ch2_coin1',
    location: 'tubbs-hill',
    coordinates: { x: 25, y: 35 },
    value: 100,
    found: false,
    description: 'Under the fallen log',
    hint: 'That fallen log crossing the trail might be hiding something'
  },
  {
    id: 'ch2_coin2',
    location: 'lakefront',
    coordinates: { x: 65, y: 20 },
    value: 150,
    found: false,
    description: 'Near the dock post',
    hint: 'Check the dock posts where the water is shallow'
  },
  {
    id: 'ch2_coin3',
    location: 'downtown',
    coordinates: { x: 40, y: 70 },
    value: 125,
    found: false,
    description: 'Behind the coffee shop counter',
    hint: 'When the barista isn\'t looking, peek behind the counter'
  }
];

/**
 * Get all XP coins for Chapter 2
 * @returns {Array} XP coins for Chapter 2
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
 * Check if the player meets the requirements to start Chapter 2
 * @returns {boolean} Whether the player can start Chapter 2
 */
export function canStartChapter2() {
  const state = store.getState();
  const playerLevel = state.player?.level || 1;
  
  return playerLevel >= chapterData.requiredLevel;
}

/**
 * Start Chapter 2
 * @returns {boolean} Success status
 */
export function startChapter2() {
  if (!canStartChapter2()) {
    console.warn('Player does not meet requirements to start Chapter 2');
    return false;
  }
  
  // Update player state
  store.dispatch(playerActions.setActiveScene('tubbs-hill-trail'));
  
  // Unlock locations
  chapterData.locations.forEach(location => {
    dispatchers.unlockArea(location);
  });
  
  console.log('Chapter 2 started');
  return true;
}

/**
 * Get the title for a chapter number
 * @param {number} chapterNumber - The chapter number
 * @returns {string} The chapter title
 */
export function getChapterTitle(chapterNumber) {
  const titles = {
    1: "The Voltage Uprising",
    2: "Lakeside Legends",
    3: "TBD's Revelation"
  };
  
  return titles[chapterNumber] || `Chapter ${chapterNumber}`;
}

export default {
  chapterData,
  scenes,
  canStartChapter2,
  startChapter2,
  getChapterTitle,
  xpCoins,
  getXPCoins,
  findXPCoin,
  collectXPCoin
}; 