# Adventure Engine Documentation

## Overview

The Adventure Engine has been refactored to use a store-driven approach that better integrates with the GameCore architecture. This reduces code duplication and centralizes state management in the Redux store.

## Architecture Changes

1. **Store-Driven Design**: The adventure engine now uses the central Redux store for all state management instead of maintaining its own internal state.

2. **Integration Module**: A separate `AdventureIntegration.js` module has been created to handle the interaction between the Adventure Engine and GameCore, making the code more modular.

3. **Scene Completion**: Scene completion is now tracked in the Redux store, making it consistent across the application.

4. **Item Management**: Items from adventure rewards are now properly structured and added to the central inventory.

5. **Energy System**: Energy is now calculated based on scene completion rather than being stored as a separate value.

## How to Use the Adventure Engine

### Basic Setup

Make sure your HTML has the following structure for the adventure engine to work:

```html
<div class="adventure-scene">
  <div class="scene-image-container">
    <img id="scene-image" class="scene-image" src="" alt="Scene">
    <img id="character-portrait" class="character-portrait" src="" alt="">
  </div>
  
  <div class="dialogue-box">
    <span id="speaker-name" class="speaker"></span>
    <p id="dialogue-text" class="dialogue-text"></p>
  </div>
  
  <div id="choices-container" class="choices"></div>
  
  <div class="stats-container">
    <div class="stat-item">
      <span>Parts:</span>
      <span id="parts-stat" class="stat-value">0</span>
    </div>
    <div class="stat-item">
      <span>Reputation:</span>
      <span id="rep-stat" class="stat-value">0</span>
    </div>
    <div class="stat-item">
      <span>Energy:</span>
      <span id="energy-stat" class="stat-value">100%</span>
    </div>
  </div>
</div>
```

### Initializing the Adventure Engine

The Adventure Engine is automatically initialized when the page loads:

```javascript
// This happens automatically in adventure-engine.js
document.addEventListener('DOMContentLoaded', async function() {
  window.adventureEngine = new AdventureEngine();
  await window.adventureEngine.init();
});
```

### Creating Adventure Scenes

Define your adventure scenes in the `storyScenes` object within the AdventureEngine constructor:

```javascript
this.storyScenes = {
  'scene-id': {
    background: "path/to/background.jpg",
    speaker: "character-id",
    text: "Dialogue text goes here.",
    choices: [
      {
        text: "Choice text",
        nextScene: "next-scene-id",
        effect: {
          reputation: +5,
          parts: +2
        }
      }
    ],
    rewards: {
      xp: 50,
      currency: 100,
      character: "character-id",
      relationship: 1,
      item: "item_id",
      items: ["item_id_1", "item_id_2"],
      quest_complete: "quest_id"
    }
  }
};
```

### Using the AdventureIntegration Module

The AdventureIntegration module provides functions for managing adventure state:

```javascript
import AdventureIntegration from './game/AdventureIntegration.js';

// Initialize adventure progress if needed
AdventureIntegration.initializeAdventureProgress();

// Get the current scene
const currentScene = AdventureIntegration.getCurrentScene();

// Set the current scene
AdventureIntegration.setCurrentScene('scene-id');

// Mark a scene as completed
AdventureIntegration.completeScene('scene-id');

// Check if a scene is completed
const isCompleted = AdventureIntegration.isSceneCompleted('scene-id');

// Award rewards (returns levelUp info if player leveled up)
const levelUp = AdventureIntegration.awardRewards({
  xp: 100,
  currency: 50
});
```

## Redux Store Integration

The Adventure Engine interacts with the following Redux actions:

- `player/setCurrentScene` - Sets the current adventure scene
- `player/completeScene` - Marks a scene as completed
- `player/completeMission` - Marks a mission as completed
- `player/initAdventureProgress` - Initializes adventure progress
- `player/addXP` - Adds XP to the player
- `player/addCurrency` - Adds currency to the player
- `player/addItem` - Adds an item to the player's inventory
- `player/updateRelationship` - Updates relationship with a character

These actions are defined in the `playerSlice.js` file.

## Benefits of the Refactoring

1. **Reduced Duplication**: The adventure engine now uses the central state management instead of duplicating state logic.

2. **Better Separation of Concerns**: The UI logic is in the adventure-engine.js file, while the state management is handled by AdventureIntegration.js.

3. **Consistent State**: Player progress, inventory, and relationships are all stored in a single place.

4. **Improved Testability**: The separation of concerns makes it easier to test the adventure engine.

5. **Better Code Organization**: The code is now more modular and easier to maintain.

## Future Improvements

1. Add support for multiple adventure chapters
2. Create tools for adventure content creators
3. Implement a save/load feature for adventure progress
4. Add support for timed choices and events
5. Create a visual adventure editor 