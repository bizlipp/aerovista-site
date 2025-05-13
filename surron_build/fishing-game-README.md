# Billy's Fishing Adventure

A standalone fishing mini-game that offers a complete fishing experience with weather systems, fish variety, different challenge types, and progression.

## Getting Started

### Quick Start

1. Open `fishing-game.html` in a modern web browser
2. The game will load automatically and start a fishing session
3. Click the "Cast Line" button (or use the touch controls on mobile) to begin fishing

### Requirements

- Modern web browser with ES6 support (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Touch screen for best mobile experience (optional)

## Gameplay Guide

### Basic Controls

**Desktop:**
- Click "Cast Line" to start casting
- Click again to set casting power
- Click rapidly during "Reeling" challenges
- Use mouse movement for "Balancing" challenges
- Hold still during "Patience" challenges
- Click at the right moment for "Timing" challenges

**Mobile:**
- Touch and hold the red "CAST" button to start casting
- Release to set casting power
- Tap rapidly during "Reeling" challenges
- Slide finger for "Balancing" challenges
- Hold phone still during "Patience" challenges
- Tap at the right moment for "Timing" challenges

### Fishing Process

1. **Cast your line** - Hold longer for more power and greater distance
2. **Wait for a bite** - Fish activity depends on weather, time, and your equipment
3. **Complete the challenge** - Each fish type has a different challenge to catch it
4. **Collect your catch** - Earn XP and coins for each fish you catch
5. **Build your collection** - Try to catch all fish varieties

### Challenge Types

- **Timing Challenge**: Click/tap exactly when the indicator aligns with the target
- **Reeling Challenge**: Click/tap rapidly without breaking the line
- **Balancing Challenge**: Keep the indicator in the target zone
- **Patience Challenge**: Hold completely still until the fish tires out

### Weather System

The weather affects what fish are available and how likely they are to bite:

- **Sunny**: Good overall conditions, great visibility
- **Cloudy**: Improved catch rate for many species
- **Rainy**: Higher catch rate, slight bonus to rare fish
- **Stormy**: Lower catch rate but higher chance for rare fish
- **Foggy**: Good for certain species, moderate rarity bonus

Weather changes dynamically during gameplay.

### Seasons

The season affects fish availability:

- **Spring**: Spawning season for many fish, good catch rates
- **Summer**: Active fish but some are lethargic during peak heat
- **Fall**: Feeding frenzy as fish prepare for winter
- **Winter**: Challenging conditions but unique catches

### Time of Day

Fish are more or less active depending on the time:

- **Morning**: Prime fishing time
- **Day**: High visibility but cautious fish
- **Evening**: Another feeding time as light fades
- **Night**: Different species become active

## Features

- **Dynamic Weather System**: Changing conditions affect fish availability
- **Comprehensive Fish Catalog**: Various fish types with different rarities
- **Multiple Challenge Types**: Different gameplay for catching different fish
- **Player Progression**: Gain XP, level up, and track your fish collection
- **Equipment System**: Different rods and lures affect fishing success
- **Mission System**: Complete fishing objectives for rewards
- **Mobile Support**: Full touch control support for mobile devices
- **Persistence**: Game progress saves automatically

## Development Notes

### File Structure

- `fishing-game.html` - Main HTML entry point
- `fishing-game.css` - Complete styling for the game
- `fishing-game-standalone.js` - Entry point script that initializes the game
- `fishing-game-core.js` - Main game implementation
- `fishing-game-state.js` - State management system
- `fishing-game-sound.js` - Sound system for game effects
- `fishing-game-assets.js` - Asset loading and management
- `fishing-game-core-mechanics.js` - Core fishing gameplay
- `fishing-game-challenges.js` - Challenge system implementation
- `/game/weather-system.js` - Weather, season, and time system
- `/game/fish-catalog.js` - Fish data and selection logic

### Integration with Main Game

To integrate this mini-game back into the main game:

1. **State Integration**
   - Replace state management calls in `fishing-game-core.js`:
   ```javascript
   // Change from:
   import GameState from './fishing-game-state.js';
   GameState.updateState('player', { ... });
   
   // To:
   import { store } from './StateStackULTRA/store/gameStore.js';
   store.dispatch({ type: 'player/update', payload: { ... } });
   ```

2. **Component Mounting**
   - Mount the fishing game in your main game's UI:
   ```javascript
   import FishingGame from './fishing-game-core.js';
   
   function mountFishingGame(containerId) {
     // Prepare container
     const container = document.getElementById(containerId);
     container.innerHTML = ''; // Clear container
     
     // Add required HTML structure
     container.innerHTML = `
       <div class="game-area">
         <canvas id="fishing-canvas"></canvas>
         <!-- Other required elements -->
       </div>
     `;
     
     // Initialize game
     const game = new FishingGame();
     return game;
   }
   ```

3. **Asset Path Updates**
   - Update asset paths in `fishing-game-assets.js` to point to your main game's asset locations

4. **Quest/Mission Integration**
   - Connect the mission system to the main game's quest system in `fishing-game-core.js`

### Extending the Game

To add new fish or equipment:

1. **Add new fish** to `fish-catalog.js`:
   ```javascript
   {
     name: "New Special Fish",
     value: 100,
     rarity: 4,
     size: 2.0,
     type: "freshwater",
     season: "winter",
     timeOfDay: "night",
     weather: "stormy",
     description: "A rare fish that only appears during storms.",
     specialEffect: { 
       challenge: "balancing",
       xpBonus: 15 
     }
   }
   ```

2. **Add new equipment** by updating the state initialization in `fishing-game-state.js`

## Troubleshooting

- **Game not loading?** Check browser console for errors
- **Sounds not working?** Ensure browser permissions allow sound playback
- **Performance issues?** Try reducing browser tabs or restarting your device
- **Save not working?** Ensure cookies and localStorage are enabled

## Credits

- Developed as part of the AeroVista SurronSquad game
- Fish catalog inspired by various freshwater game fish species
- Weather system based on realistic seasonal fishing patterns 