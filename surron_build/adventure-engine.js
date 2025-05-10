// Adventure Engine for Surron Squad
// This file implements a lightweight adventure game engine for the Surron Squad website
import GameCore from './game/GameCore.js';

class AdventureEngine {
  constructor() {
    // Core story state
    this.currentScene = 'intro';
    this.playerState = {
      parts: 0,
      reputation: 0,
      energy: 100,
      inventory: []
    };
    
    // Character info
    this.characters = {
      narrator: {
        name: "Narrator",
        portrait: null,
        class: ""
      },
      charlie: {
        name: "Charlie \"Throttle\"",
        portrait: "images/surron-charlie-alert-pose.png",
        class: "charlie"
      },
      billy: {
        name: "Billy \"Baggin's\"",
        portrait: "images/surron-billy-fishing_ready-pose.png",
        class: "billy"
      },
      tbd: {
        name: "TBD",
        portrait: "images/surron-tbd-terminal-ready.png",
        class: "tbd"
      }
    };
    
    // Define the story structure - each scene has dialogue, choices, and consequences
    this.storyScenes = {
      'intro': {
        background: "images/backgrounds/workshop-night.jpg",
        speaker: "narrator",
        text: "It's midnight at Charlie's workshop. The faint smell of ozone and pizza hangs in the air. You've been invited to join the Surron Squad on a special mission.",
        choices: [
          {
            text: "\"What's this mission about?\"",
            nextScene: "mission-briefing"
          },
          {
            text: "\"Why am I here so late?\"",
            nextScene: "late-night"
          },
          {
            text: "\"I'm just here for the pizza.\"",
            nextScene: "pizza-response",
            effect: {
              energy: +10
            }
          }
        ]
      },
      'mission-briefing': {
        background: "images/backgrounds/workshop-night.jpg",
        speaker: "charlie",
        text: "We've got intel on a warehouse full of premium electric bike parts. Security's minimal. We go in, get the good stuff, and build the ultimate 72V monsters!",
        choices: [
          {
            text: "\"Isn't that stealing?\"",
            nextScene: "stealing-concern"
          },
          {
            text: "\"What parts are we talking about?\"",
            nextScene: "parts-details"
          },
          {
            text: "\"I'm in. When do we start?\"",
            nextScene: "eager-response",
            effect: {
              reputation: +5
            }
          }
        ]
      },
      'stealing-concern': {
        background: "images/backgrounds/workshop-night.jpg",
        speaker: "tbd",
        text: "Technically, we're rescuing abandoned inventory from a bankrupt manufacturer. I've analyzed the legal parameters. The company dissolved 3 months ago. The probability of prosecution is 0.03%.",
        choices: [
          {
            text: "\"That sounds... almost legitimate.\"",
            nextScene: "almost-legit"
          },
          {
            text: "\"I'm still not comfortable with this.\"",
            nextScene: "uncomfortable"
          },
          {
            text: "\"Let's just get the parts and go.\"",
            nextScene: "lets-go",
            effect: {
              reputation: +3
            }
          }
        ],
        rewards: {
          character: "tbd",
          relationship: 1
        }
      },
      'parts-details': {
        background: "images/backgrounds/workshop-table.jpg",
        speaker: "tbd",
        text: "My analysis indicates the warehouse contains approximately 37 72V controllers, 22 high-performance motors, and 15 battery packs with Samsung 40T cells. Total estimated value: $24,350.",
        choices: [
          {
            text: "\"How do we transport all of that?\"",
            nextScene: "transport-question"
          },
          {
            text: "\"What's our plan for getting in?\"",
            nextScene: "infiltration-plan"
          },
          {
            text: "\"Let's focus on the battery packs.\"",
            nextScene: "battery-focus",
            effect: {
              parts: +2
            }
          }
        ],
        rewards: {
          xp: 15
        }
      },
      'late-night': {
        background: "images/backgrounds/workshop-night.jpg",
        speaker: "billy",
        text: "Charlie says we have to go at night. Something about \"plausible deniability\" and \"lower security presence.\" I'd rather be sleeping... or fishing.",
        choices: [
          {
            text: "\"Makes sense. What's the mission?\"",
            nextScene: "mission-briefing"
          },
          {
            text: "\"I should probably go home...\"",
            nextScene: "try-to-leave"
          },
          {
            text: "\"Don't worry, we'll go fishing later.\"",
            nextScene: "fishing-promise",
            effect: {
              reputation: +2
            }
          }
        ],
        rewards: {
          character: "billy",
          relationship: 1
        }
      },
      'pizza-response': {
        background: "images/backgrounds/workshop-table.jpg",
        speaker: "charlie",
        text: "A person of culture! Pizza fuels the best heists. Grab a slice and let me tell you about tonight's mission. We're going after some premium electric bike parts!",
        choices: [
          {
            text: "\"Heist? Is this illegal?\"",
            nextScene: "stealing-concern"
          },
          {
            text: "\"Tell me more while I eat.\"",
            nextScene: "mission-briefing",
            effect: {
              energy: +10
            }
          },
          {
            text: "\"As long as there's more pizza afterward.\"",
            nextScene: "more-pizza",
            effect: {
              energy: +5,
              reputation: +1
            }
          }
        ],
        rewards: {
          character: "charlie",
          relationship: 2,
          xp: 10
        }
      },
      'transport-question': {
        background: "images/backgrounds/truck-loading.jpg",
        speaker: "billy",
        text: "I've got my truck. It's not pretty, but it'll hold everything. Charlie wanted to use shopping carts, but I talked him out of it.",
        choices: [
          {
            text: "\"Smart thinking, Billy.\"",
            nextScene: "infiltration-plan",
            effect: {
              reputation: +1
            }
          },
          {
            text: "\"Shopping carts would've been more fun.\"",
            nextScene: "cart-fun",
            effect: {
              reputation: -1
            }
          },
          {
            text: "\"Let's just focus on getting in first.\"",
            nextScene: "infiltration-plan"
          }
        ],
        rewards: {
          character: "billy",
          relationship: 1,
          xp: 15
        }
      },
      'infiltration-plan': {
        background: "images/backgrounds/warehouse-exterior.jpg",
        speaker: "tbd",
        text: "I've identified three possible entry points. The main gate has a 74% chance of triggering an alarm. The loading dock is unmonitored but requires climbing equipment. The side entrance has a simple electronic lock I can bypass.",
        choices: [
          {
            text: "\"Let's go with the side entrance.\"",
            nextScene: "side-entrance-choice",
            effect: {
              energy: -10
            }
          },
          {
            text: "\"The loading dock sounds safer.\"",
            nextScene: "loading-dock-choice",
            effect: {
              energy: -20
            }
          },
          {
            text: "\"I vote for the main gate. Direct approach.\"",
            nextScene: "main-gate-choice",
            effect: {
              energy: -5,
              reputation: +3
            }
          }
        ],
        rewards: {
          character: "tbd",
          relationship: 1,
          xp: 20
        }
      },
      // More scenes would be defined here
      'side-entrance-choice': {
        background: "images/backgrounds/warehouse-side.jpg",
        speaker: "tbd",
        text: "A logical choice. Give me 42 seconds to bypass the security system...",
        choices: [
          {
            text: "Continue...",
            nextScene: "inside-warehouse"
          }
        ],
        rewards: {
          xp: 25
        }
      },
      'inside-warehouse': {
        background: "images/backgrounds/warehouse-interior.jpg",
        speaker: "charlie",
        text: "We're in! Look at all these parts! It's like Christmas but with better voltage!",
        choices: [
          {
            text: "\"Let's grab what we need and go.\"",
            nextScene: "gathering-parts",
            effect: {
              parts: +5
            }
          },
          {
            text: "\"I'm having second thoughts about this.\"",
            nextScene: "second-thoughts"
          },
          {
            text: "\"Charlie, try not to get too excited.\"",
            nextScene: "calm-charlie",
            effect: {
              reputation: +2
            }
          }
        ],
        rewards: {
          character: "charlie",
          relationship: 1,
          xp: 30,
          item: "basic_controller"
        }
      },
      'gathering-parts': {
        background: "images/backgrounds/parts-collection.jpg",
        speaker: "narrator",
        text: "You and the squad begin collecting the most valuable parts. TBD methodically selects controllers, Billy focuses on structural components, and Charlie grabs everything that looks powerful.",
        choices: [
          {
            text: "Help TBD with electronics",
            nextScene: "help-tbd",
            effect: {
              parts: +3,
              energy: -10
            }
          },
          {
            text: "Assist Billy with frames and motors",
            nextScene: "help-billy",
            effect: {
              parts: +4,
              energy: -15
            }
          },
          {
            text: "Join Charlie's chaotic collection method",
            nextScene: "help-charlie",
            effect: {
              parts: +6,
              energy: -20,
              reputation: +3
            }
          }
        ],
        rewards: {
          xp: 50,
          currency: 100,
          items: ["motor_part", "battery_cell", "controller"]
        }
      },
      'help-tbd': {
        background: "images/backgrounds/parts-collection.jpg",
        speaker: "tbd",
        text: "Your assistance is appreciated. I've identified the optimal controller components with 99.7% efficiency. These will be... satisfactory.",
        choices: [
          {
            text: "Continue...",
            nextScene: "escape-warehouse"
          }
        ],
        rewards: {
          character: "tbd",
          relationship: 2,
          xp: 40,
          items: ["premium_controller", "display_unit"]
        }
      },
      'help-billy': {
        background: "images/backgrounds/parts-collection.jpg",
        speaker: "billy",
        text: "Thanks for the help. These motors will make solid builds. Grab that chromoly frame too - it'll handle Charlie's crazy riding without breaking.",
        choices: [
          {
            text: "Continue...",
            nextScene: "escape-warehouse"
          }
        ],
        rewards: {
          character: "billy",
          relationship: 2,
          xp: 40,
          items: ["motor_part", "frame_kit"]
        }
      },
      'help-charlie': {
        background: "images/backgrounds/parts-collection.jpg",
        speaker: "charlie",
        text: "YES! That's the spirit! Grab everything shiny! This battery pack is INSANE - it'll push 100 amps continuous. We're gonna melt tires with this setup!",
        choices: [
          {
            text: "Continue...",
            nextScene: "escape-warehouse"
          }
        ],
        rewards: {
          character: "charlie",
          relationship: 2,
          xp: 40,
          items: ["high_discharge_battery", "performance_controller"]
        }
      },
      'escape-warehouse': {
        background: "images/backgrounds/warehouse-exterior.jpg",
        speaker: "narrator",
        text: "With bags full of valuable parts, the squad makes a hasty exit. Billy's truck is loaded up, and you all speed away into the night. The heist was a success!",
        choices: [
          {
            text: "\"That was actually fun!\"",
            nextScene: "mission-complete"
          },
          {
            text: "\"Let's never do this again.\"",
            nextScene: "mission-complete"
          },
          {
            text: "\"What's our next target?\"",
            nextScene: "mission-complete",
            effect: {
              reputation: +5
            }
          }
        ],
        rewards: {
          xp: 100,
          currency: 250
        }
      },
      'mission-complete': {
        background: "images/backgrounds/workshop-night.jpg",
        speaker: "charlie",
        text: "Mission accomplished! With these parts, we can build the most insane Sur-Rons the world has ever seen. You're officially part of the Squad now!",
        choices: [
          {
            text: "Return to HQ",
            nextScene: "chapter-complete"
          }
        ],
        rewards: {
          quest_complete: "midnight_heist",
          xp: 200,
          currency: 500,
          reputation: 10
        }
      },
      'chapter-complete': {
        background: "images/backgrounds/workshop-night.jpg",
        speaker: "narrator",
        text: "Congratulations! You've completed the first chapter of the Surron Squad adventure. Return to Squad HQ to continue your journey.",
        choices: [
          {
            text: "Return to Squad HQ",
            action: "returnToHQ"
          }
        ]
      }
      // Additional scenes would continue the story
    };
    
    // Store history for potential "back" functionality
    this.sceneHistory = [];
    
    // DOM elements
    this.sceneImage = document.getElementById('scene-image');
    this.characterPortrait = document.getElementById('character-portrait');
    this.speakerName = document.getElementById('speaker-name');
    this.dialogueText = document.getElementById('dialogue-text');
    this.choicesContainer = document.getElementById('choices-container');
    
    // Stats display
    this.partsDisplay = document.getElementById('parts-stat');
    this.repDisplay = document.getElementById('rep-stat');
    this.energyDisplay = document.getElementById('energy-stat');
    
    // Loading indicator
    this.loadingIndicator = document.createElement('div');
    this.loadingIndicator.className = 'loading-indicator';
    this.loadingIndicator.innerHTML = `
      <div class="loading-spinner"></div>
      <p>Loading adventure...</p>
    `;
    this.loadingIndicator.style.position = 'fixed';
    this.loadingIndicator.style.top = '50%';
    this.loadingIndicator.style.left = '50%';
    this.loadingIndicator.style.transform = 'translate(-50%, -50%)';
    this.loadingIndicator.style.background = 'rgba(0, 0, 0, 0.8)';
    this.loadingIndicator.style.padding = '2rem';
    this.loadingIndicator.style.borderRadius = '12px';
    this.loadingIndicator.style.color = 'white';
    this.loadingIndicator.style.textAlign = 'center';
    this.loadingIndicator.style.zIndex = '1000';
    document.body.appendChild(this.loadingIndicator);
    
    // Level-up notification container
    this.createLevelUpContainer();
    
    // Check for saved game state
    this.initializeFromGameCore();
  }
  
  // Initialize from GameCore
  initializeFromGameCore() {
    // Check if GameCore is available
    this.hasGlobalState = typeof GameCore !== 'undefined';
    
    if (this.hasGlobalState) {
      console.log("GameCore available, checking for saved adventure progress");
      
      // Get player state
      const playerState = GameCore.getPlayerState();
      
      // Check if we have adventure progress
      if (playerState && playerState.adventureProgress) {
        console.log("Found saved adventure progress:", playerState.adventureProgress);
        
        // Restore current scene
        if (playerState.adventureProgress.currentScene) {
          this.currentScene = playerState.adventureProgress.currentScene;
          console.log("Restored scene:", this.currentScene);
        }
      } else {
        console.log("No saved adventure progress found, initializing fresh state");
        
        // Initialize adventure progress
        if (this.hasGlobalState && (!playerState.adventureProgress)) {
          // Initialize through GameCore dispatch
          GameCore.store.dispatch({
            type: 'player/initAdventureProgress',
            payload: {
              currentChapter: 1,
              completedScenes: [],
              currentScene: 'intro'
            }
          });
          
          // Save changes
          GameCore.save();
        }
      }
    } else {
      console.log("GameCore not available, using local state only");
    }
  }
  
  // Initialize the game and load the first scene
  init() {
    console.log("AdventureEngine.init() called");
    
    try {
      // Show loading indicator
      this.loadingIndicator.style.display = 'block';
      
      // Update data from GameCore if available
      if (this.hasGlobalState) {
        this.syncWithGameCore();
      }
      
      // Wait a moment to ensure DOM is ready
      setTimeout(() => {
        try {
          // Load the current scene
          this.navigateToScene(this.currentScene);
          this.updateStatusDisplay();
          
          // Hide loading indicator
          this.loadingIndicator.style.display = 'none';
          
          console.log("Adventure engine initialized successfully");
        } catch (error) {
          console.error("Error during scene loading:", error);
          this.showErrorMessage("Failed to load adventure scene. Please try refreshing the page.");
        }
      }, 500);
    } catch (error) {
      console.error("Error during adventure initialization:", error);
      this.showErrorMessage("Failed to initialize adventure. Please try refreshing the page.");
    }
  }
  
  // Show error message
  showErrorMessage(message) {
    // Hide loading indicator
    this.loadingIndicator.style.display = 'none';
    
    // Show error message
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';
    errorContainer.innerHTML = `
      <h3>Adventure Error</h3>
      <p>${message}</p>
      <button id="retry-adventure">Retry</button>
      <button id="return-to-hq">Return to HQ</button>
    `;
    errorContainer.style.position = 'fixed';
    errorContainer.style.top = '50%';
    errorContainer.style.left = '50%';
    errorContainer.style.transform = 'translate(-50%, -50%)';
    errorContainer.style.background = 'rgba(0, 0, 0, 0.9)';
    errorContainer.style.padding = '2rem';
    errorContainer.style.borderRadius = '12px';
    errorContainer.style.border = '3px solid #e63946';
    errorContainer.style.color = 'white';
    errorContainer.style.textAlign = 'center';
    errorContainer.style.zIndex = '1000';
    document.body.appendChild(errorContainer);
    
    // Add event listeners for buttons
    document.getElementById('retry-adventure').addEventListener('click', () => {
      location.reload();
    });
    
    document.getElementById('return-to-hq').addEventListener('click', () => {
      window.location.href = 'squad-hq.html';
    });
  }
  
  // Create level-up notification container
  createLevelUpContainer() {
    this.levelUpContainer = document.createElement('div');
    this.levelUpContainer.className = 'level-up-notification';
    this.levelUpContainer.style.display = 'none';
    this.levelUpContainer.style.position = 'fixed';
    this.levelUpContainer.style.top = '50%';
    this.levelUpContainer.style.left = '50%';
    this.levelUpContainer.style.transform = 'translate(-50%, -50%)';
    this.levelUpContainer.style.background = 'rgba(0, 0, 0, 0.9)';
    this.levelUpContainer.style.padding = '2rem';
    this.levelUpContainer.style.borderRadius = '12px';
    this.levelUpContainer.style.border = '3px solid var(--squad-neon)';
    this.levelUpContainer.style.color = 'white';
    this.levelUpContainer.style.textAlign = 'center';
    this.levelUpContainer.style.zIndex = '1000';
    this.levelUpContainer.style.boxShadow = '0 0 30px rgba(57, 255, 20, 0.5)';
    document.body.appendChild(this.levelUpContainer);
  }
  
  // Sync data with GameCore
  syncWithGameCore() {
    if (!this.hasGlobalState) return;
    
    // Get player state
    const playerState = GameCore.getPlayerState();
    if (!playerState) return;
    
    // Update local references from global state
    this.playerState.parts = playerState.inventory.length;
    console.log("Updated parts count:", this.playerState.parts);
    
    this.playerState.reputation = playerState.reputation;
    console.log("Updated reputation:", this.playerState.reputation);
  }
  
  // Navigate to a scene
  navigateToScene(sceneId) {
    // Save current scene to history before changing
    if (this.currentScene) {
      this.sceneHistory.push(this.currentScene);
    }
    
    // Update current scene
    this.currentScene = sceneId;
    const scene = this.storyScenes[sceneId];
    
    if (!scene) {
      console.error(`Scene ${sceneId} not found!`);
      return;
    }
    
    // Update scene in GameCore
    if (this.hasGlobalState) {
      // Update through GameCore dispatch
      GameCore.store.dispatch({
        type: 'player/setCurrentScene',
        payload: sceneId
      });
      
      // Save changes
      GameCore.save();
    }
    
    // Set the background image
    if (scene.background) {
      this.sceneImage.src = scene.background;
      this.sceneImage.alt = `Scene: ${sceneId}`;
    }
    
    // Set the character portrait
    const character = this.characters[scene.speaker];
    if (character) {
      this.speakerName.textContent = character.name;
      this.speakerName.className = `speaker ${character.class}`;
      
      if (character.portrait) {
        this.characterPortrait.src = character.portrait;
        this.characterPortrait.alt = character.name;
        this.characterPortrait.className = `character-portrait ${character.class}`;
        this.characterPortrait.style.display = 'block';
      } else {
        this.characterPortrait.style.display = 'none';
      }
    }
    
    // Set the dialogue text
    this.dialogueText.textContent = scene.text;
    
    // Generate choice buttons
    this.choicesContainer.innerHTML = '';
    scene.choices.forEach(choice => {
      const button = document.createElement('button');
      button.className = 'choice-button';
      button.textContent = choice.text;
      
      button.addEventListener('click', () => {
        // Mark current scene as completed in global state
        if (this.hasGlobalState && !window.playerState.adventureProgress.completedScenes.includes(sceneId)) {
          window.playerState.completeScene(sceneId);
        }
        
        // Apply any effects from this choice
        if (choice.effect) {
          this.applyEffects(choice.effect);
        }
        
        // Award rewards if this scene has them
        if (scene.rewards) {
          this.applyRewards(scene.rewards);
        }
        
        // Handle special actions
        if (choice.action === 'returnToHQ') {
          window.location.href = 'squad-hq.html';
          return;
        }
        
        // Move to the next scene
        this.navigateToScene(choice.nextScene);
      });
      
      this.choicesContainer.appendChild(button);
    });
  }
  
  // Complete a scene
  completeScene(sceneId) {
    // Mark scene as completed in GameCore
    if (this.hasGlobalState) {
      const playerState = GameCore.getPlayerState();
      
      if (playerState && playerState.adventureProgress && 
          !playerState.adventureProgress.completedScenes.includes(sceneId)) {
        
        // Complete scene through GameCore
        GameCore.store.dispatch({
          type: 'player/completeScene',
          payload: sceneId
        });
      }
    }
  }
  
  // Apply game effects
  applyEffects(effects) {
    // Apply effects to local state
    if (effects.parts) {
      this.playerState.parts += effects.parts;
      console.log(`${effects.parts > 0 ? '+' : ''}${effects.parts} parts`);
    }
    
    if (effects.reputation) {
      this.playerState.reputation += effects.reputation;
      console.log(`${effects.reputation > 0 ? '+' : ''}${effects.reputation} reputation`);
      
      // Update GameCore state
      if (this.hasGlobalState) {
        // We'd need a proper reducer for this in playerSlice
        // For now, just update through GameCore
      }
    }
    
    if (effects.energy) {
      this.playerState.energy += effects.energy;
      console.log(`${effects.energy > 0 ? '+' : ''}${effects.energy} energy`);
      
      // Cap energy between 0 and 100
      this.playerState.energy = Math.max(0, Math.min(100, this.playerState.energy));
    }
    
    // Update UI
    this.updateStatusDisplay();
    
    // Save changes
    if (this.hasGlobalState) {
      GameCore.save();
    }
  }
  
  // Apply rewards
  applyRewards(rewards) {
    let levelUp = null;
    
    // Add XP
    if (rewards.xp && this.hasGlobalState) {
      // Add XP through GameCore
      GameCore.addXP(rewards.xp);
    }
    
    // Add currency
    if (rewards.currency && this.hasGlobalState) {
      // Add currency through GameCore
      GameCore.addCurrency(rewards.currency);
    }
    
    // Improve relationship
    if (rewards.character && rewards.relationship && this.hasGlobalState) {
      // Update relationship through GameCore
      GameCore.updateRelationship(rewards.character, rewards.relationship);
    }
    
    // Add single item
    if (rewards.item && this.hasGlobalState) {
      // Add item through GameCore
      GameCore.addItem(rewards.item);
    }
    
    // Add multiple items
    if (rewards.items && rewards.items.length > 0 && this.hasGlobalState) {
      // Add items through GameCore
      rewards.items.forEach(item => GameCore.addItem(item));
    }
    
    // Complete quest
    if (rewards.quest_complete && this.hasGlobalState) {
      const playerState = GameCore.getPlayerState();
      
      if (playerState && !playerState.completedMissions.includes(rewards.quest_complete)) {
        // Complete mission through GameCore dispatch
        GameCore.store.dispatch({
          type: 'player/completeMission',
          payload: rewards.quest_complete
        });
      }
    }
    
    // Save changes
    if (this.hasGlobalState) {
      GameCore.save();
    }
    
    // Show level up notification if player leveled up
    if (levelUp) {
      this.showLevelUp(levelUp);
    }
    
    return levelUp;
  }
  
  // Show level up notification
  showLevelUp(levelUp) {
    // Build notification content
    let content = `
      <h2 style="color: var(--squad-neon); font-family: 'Bangers', cursive; font-size: 2rem; margin-top: 0;">LEVEL UP!</h2>
      <p style="font-size: 1.5rem; margin-bottom: 1.5rem;">You've reached level ${levelUp.newLevel}</p>
      <div style="text-align: left; margin-bottom: 1.5rem;">
        <p style="font-weight: bold; color: var(--squad-neon);">Rewards:</p>
        <ul style="list-style: none; padding-left: 1rem;">
    `;
    
    if (levelUp.rewards.currency) {
      content += `<li>🪙 ${levelUp.rewards.currency} SurCoins</li>`;
    }
    
    if (levelUp.rewards.items && levelUp.rewards.items.length > 0) {
      levelUp.rewards.items.forEach(item => {
        content += `<li>📦 ${item.name}</li>`;
      });
    }
    
    if (levelUp.rewards.unlockedFeatures && levelUp.rewards.unlockedFeatures.length > 0) {
      levelUp.rewards.unlockedFeatures.forEach(feature => {
        let featureName = feature.replace(/_/g, ' ');
        featureName = featureName.charAt(0).toUpperCase() + featureName.slice(1);
        content += `<li>🔓 New Feature: ${featureName}</li>`;
      });
    }
    
    content += `
        </ul>
      </div>
      <button id="close-level-up" style="background: var(--squad-neon); color: black; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; font-weight: bold; font-size: 1.1rem; cursor: pointer;">AWESOME!</button>
    `;
    
    // Set content and show notification
    this.levelUpContainer.innerHTML = content;
    this.levelUpContainer.style.display = 'block';
    
    // Add event listener to close button
    document.getElementById('close-level-up').addEventListener('click', () => {
      this.levelUpContainer.style.display = 'none';
    });
  }
  
  // Update stat displays
  updateStatusDisplay() {
    this.partsDisplay.textContent = this.playerState.parts;
    this.repDisplay.textContent = this.playerState.reputation;
    this.energyDisplay.textContent = `${this.playerState.energy}%`;
  }
  
  // Save game progress
  saveGame() {
    const gameData = {
      currentScene: this.currentScene,
      playerState: this.playerState,
      sceneHistory: this.sceneHistory
    };
    
    localStorage.setItem('surronSquadAdventure', JSON.stringify(gameData));
    
    // Also save to global player state if available
    if (this.hasGlobalState) {
      GameCore.save();
    }
  }
  
  // Load saved game
  loadGame() {
    const savedGame = localStorage.getItem('surronSquadAdventure');
    
    if (savedGame) {
      try {
        const gameData = JSON.parse(savedGame);
        
        this.currentScene = gameData.currentScene;
        this.playerState = gameData.playerState;
        this.sceneHistory = gameData.sceneHistory;
        
        // Load the current scene
        this.navigateToScene(this.currentScene);
        this.updateStatusDisplay();
        
        return true;
      } catch (error) {
        console.error('Error loading saved game:', error);
        return false;
      }
    }
    
    return false;
  }
  
  // Go back to the previous scene
  goBack() {
    if (this.sceneHistory.length > 0) {
      const previousScene = this.sceneHistory.pop();
      // We don't want to add the current scene to history when going back
      const currentHistory = [...this.sceneHistory];
      this.navigateToScene(previousScene);
      this.sceneHistory = currentHistory;
    }
  }
}

// Initialize the adventure engine when the document is loaded
document.addEventListener('DOMContentLoaded', async function() {
  console.log("DOM loaded, preparing to initialize adventure engine");
  
  // Show loading indicator
  const loadingIndicator = document.createElement('div');
  loadingIndicator.id = 'adventure-initial-loading';
  loadingIndicator.className = 'initial-loading';
  loadingIndicator.innerHTML = `
    <div class="loading-spinner"></div>
    <p>Loading Adventure...</p>
  `;
  document.body.appendChild(loadingIndicator);
  
  try {
    // Initialize GameCore first
    console.log("Initializing GameCore");
    await GameCore.boot();
    
    // Then initialize adventure engine
    console.log("GameCore loaded, initializing adventure");
    initializeAdventure();
  } catch (error) {
    console.error("Error initializing GameCore:", error);
    // Still try to initialize adventure with local state only
    console.log("Proceeding with adventure initialization using local state only");
    initializeAdventure();
  }
});

// Function to initialize the adventure engine
function initializeAdventure() {
  try {
    window.adventureEngine = new AdventureEngine();
    
    // Initialize the game with the first scene
    window.adventureEngine.init();
    
    // Remove initial loading indicator
    const loadingIndicator = document.getElementById('adventure-initial-loading');
    if (loadingIndicator) {
      loadingIndicator.parentNode.removeChild(loadingIndicator);
    }
    
    console.log("Adventure engine initialization complete");
  } catch (e) {
    console.error("Error initializing adventure engine:", e);
  }
} 