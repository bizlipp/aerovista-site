/**
 * fishing-game-standalone.js
 * Entry point for the standalone fishing game
 */

// Import core modules
import GameState from './fishing-game-state.js';
import SoundSystem from './fishing-game-sound.js';
import AssetManager from './fishing-game-assets.js';
import weatherSystem from './game/weather-system.js';
import fishCatalog from './game/fish-catalog.js';

// Initialize loading UI elements
const loadingScreen = document.getElementById('loading-screen');
const loadingProgress = document.getElementById('loading-progress');
const loadingText = document.getElementById('loading-text');

// Game state
let gameInstance = null;
let gameInitialized = false;

/**
 * Initialize the game
 */
async function initGame() {
  try {
    // Step 1: Initialize basic systems
    loadingText.textContent = 'Initializing game systems...';
    updateLoadingProgress(5);
    
    // Initialize game state first
    GameState.initGameState();
    updateLoadingProgress(10);
    
    // Load sound settings
    SoundSystem.loadSoundSettings();
    updateLoadingProgress(15);
    
    // Step 2: Load critical assets
    loadingText.textContent = 'Loading essential assets...';
    
    // Show some progress movement while loading
    animateLoading(15, 30, 500);
    
    // Initialize asset manager and load critical assets
    const assetResult = await AssetManager.initAssets();
    updateLoadingProgress(30);
    
    // Step 3: Initialize audio system
    loadingText.textContent = 'Initializing sound system...';
    
    // Show more progress movement
    animateLoading(30, 40, 500);
    
    await SoundSystem.initSoundSystem();
    updateLoadingProgress(40);
    
    // Step 4: Initialize weather system
    loadingText.textContent = 'Setting up environment...';
    weatherSystem.start(true); // Start with dynamic weather changes
    updateLoadingProgress(50);
    
    // Update available fish based on weather conditions
    const conditions = {
      weather: weatherSystem.currentWeather,
      season: weatherSystem.currentSeason,
      timeOfDay: weatherSystem.currentTimeOfDay
    };
    
    const availableFish = fishCatalog.getAvailableFish(conditions);
    GameState.updateAvailableFish(availableFish);
    updateLoadingProgress(60);
    
    // Step 5: Initialize game instance
    loadingText.textContent = 'Starting game engine...';
    
    // Import game class dynamically to ensure other systems are ready first
    const { default: FishingGame } = await import('./fishing-game-core.js');
    updateLoadingProgress(70);
    
    // Create game instance
    gameInstance = new FishingGame();
    updateLoadingProgress(80);
    
    // Step 6: Initialize UI and controls
    loadingText.textContent = 'Setting up user interface...';
    initUIControls();
    updateLoadingProgress(90);
    
    // Step 7: Complete loading and start game
    loadingText.textContent = 'Ready to fish!';
    
    // Transition out loading screen
    setTimeout(() => {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
      
      // Start ambient sounds based on current conditions
      SoundSystem.startAmbientSound(weatherSystem.currentWeather, weatherSystem.currentTimeOfDay);
      
      // Mark as initialized
      gameInitialized = true;
    }, 500);
    
    // Asset loading will continue in the background
    AssetManager.onLoadingProgress((progress) => {
      console.log(`Background asset loading: ${progress}%`);
    });
    
  } catch (error) {
    console.error('Error initializing game:', error);
    loadingText.textContent = 'Error loading game. Please refresh the page.';
    loadingProgress.style.backgroundColor = '#F44336';
  }
}

/**
 * Initialize UI controls and event listeners
 */
function initUIControls() {
  // Settings menu controls
  const settingsButton = document.getElementById('settings-button');
  const settingsMenu = document.getElementById('settings-menu');
  const closeSettings = document.getElementById('close-settings');
  
  settingsButton.addEventListener('click', () => {
    settingsMenu.classList.add('visible');
  });
  
  closeSettings.addEventListener('click', () => {
    settingsMenu.classList.remove('visible');
  });
  
  // Sound controls
  const masterVolume = document.getElementById('master-volume');
  const sfxVolume = document.getElementById('sfx-volume');
  const musicVolume = document.getElementById('music-volume');
  const ambientVolume = document.getElementById('ambient-volume');
  const soundEnabled = document.getElementById('sound-enabled');
  
  masterVolume.addEventListener('input', () => {
    SoundSystem.setMasterVolume(masterVolume.value / 100);
    SoundSystem.saveSoundSettings();
  });
  
  sfxVolume.addEventListener('input', () => {
    SoundSystem.setSFXVolume(sfxVolume.value / 100);
    SoundSystem.saveSoundSettings();
  });
  
  musicVolume.addEventListener('input', () => {
    SoundSystem.setMusicVolume(musicVolume.value / 100);
    SoundSystem.saveSoundSettings();
  });
  
  ambientVolume.addEventListener('input', () => {
    SoundSystem.setAmbientVolume(ambientVolume.value / 100);
    SoundSystem.saveSoundSettings();
  });
  
  soundEnabled.addEventListener('change', () => {
    SoundSystem.enableSound(soundEnabled.checked);
    SoundSystem.saveSoundSettings();
  });
  
  // Apply saved sound settings to UI
  masterVolume.value = SoundSystem.getMasterVolume() * 100;
  sfxVolume.value = SoundSystem.getSFXVolume() * 100;
  musicVolume.value = SoundSystem.getMusicVolume() * 100;
  ambientVolume.value = SoundSystem.getAmbientVolume() * 100;
  soundEnabled.checked = SoundSystem.isSoundEnabled();
  
  // Mobile end fishing button
  const mobileEndButton = document.getElementById('mobile-end-fishing');
  mobileEndButton.addEventListener('click', () => {
    if (gameInstance) {
      gameInstance.endFishing();
    }
  });
  
  // Desktop end fishing button
  const endFishingButton = document.getElementById('end-fishing-button');
  endFishingButton.addEventListener('click', () => {
    if (gameInstance) {
      gameInstance.endFishing();
    }
  });
  
  // Listen for weather changes to update ambient sounds
  weatherSystem.addEventListener('weather', (type, data) => {
    SoundSystem.startAmbientSound(data.new, weatherSystem.currentTimeOfDay);
  });
  
  weatherSystem.addEventListener('timeOfDay', (type, data) => {
    SoundSystem.startAmbientSound(weatherSystem.currentWeather, data.new);
  });
}

/**
 * Update loading progress bar
 * @param {number} percent - Loading percentage (0-100)
 */
function updateLoadingProgress(percent) {
  loadingProgress.style.width = `${percent}%`;
}

/**
 * Animate loading progress smoothly between two values
 * @param {number} from - Starting percentage
 * @param {number} to - Ending percentage
 * @param {number} duration - Animation duration in ms
 */
function animateLoading(from, to, duration) {
  const startTime = performance.now();
  
  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = from + (to - from) * progress;
    
    updateLoadingProgress(current);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }
  
  requestAnimationFrame(animate);
}

// Start loading process when document is ready
document.addEventListener('DOMContentLoaded', initGame);

// Add event handler for visibility changes (pause/resume)
document.addEventListener('visibilitychange', () => {
  if (!gameInitialized) return;
  
  if (document.hidden) {
    // Pause game when tab is not visible
    SoundSystem.stopAmbientSounds();
    // Other pause logic (implemented in main game)
  } else {
    // Resume game when tab becomes visible again
    SoundSystem.startAmbientSound(weatherSystem.currentWeather, weatherSystem.currentTimeOfDay);
    // Other resume logic (implemented in main game)
  }
}); 