// Adventure Engine for Surron Squad
// This file implements a lightweight adventure game engine for the Surron Squad website

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
        ]
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
        ]
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
        ]
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
        ]
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
        ]
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
        ]
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
        ]
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
        ]
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
    
    // Initialize the game with the first scene
    this.init();
  }
  
  // Initialize the game
  init() {
    this.loadScene(this.currentScene);
    this.updateStats();
  }
  
  // Load a specific scene
  loadScene(sceneId) {
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
        // Apply any effects from this choice
        if (choice.effect) {
          this.applyEffects(choice.effect);
        }
        
        // Move to the next scene
        this.loadScene(choice.nextScene);
      });
      
      this.choicesContainer.appendChild(button);
    });
  }
  
  // Apply effects to player state
  applyEffects(effects) {
    if (effects.parts !== undefined) {
      this.playerState.parts += effects.parts;
    }
    
    if (effects.reputation !== undefined) {
      this.playerState.reputation += effects.reputation;
    }
    
    if (effects.energy !== undefined) {
      this.playerState.energy += effects.energy;
      // Ensure energy stays within bounds
      this.playerState.energy = Math.max(0, Math.min(100, this.playerState.energy));
    }
    
    // Update the displayed stats
    this.updateStats();
  }
  
  // Update stat displays
  updateStats() {
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
        this.loadScene(this.currentScene);
        this.updateStats();
        
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
      this.loadScene(previousScene);
      this.sceneHistory = currentHistory;
    }
  }
}

// Initialize the adventure engine when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
  const adventure = new AdventureEngine();
  
  // Check for saved game
  const hasSavedGame = adventure.loadGame();
  
  // If no saved game, start a new adventure
  if (!hasSavedGame) {
    adventure.loadScene('intro');
  }
  
  // Auto-save every 30 seconds
  setInterval(() => {
    adventure.saveGame();
  }, 30000);
  
  // Make the adventure available globally for debugging
  window.adventure = adventure;
}); 