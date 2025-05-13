/**
 * fishing-game-sound.js
 * Sound system for Billy's Fishing Game
 * Handles sound effects and ambient sounds with adaptive volume
 */

// Sound effect paths
const SOUND_PATHS = {
  // Fishing actions
  cast: 'sounds/fishing/cast.mp3',
  splash: 'sounds/fishing/splash.mp3',
  reel: 'sounds/fishing/reel.mp3',
  lineTension: 'sounds/fishing/line_tension.mp3',
  lineBreak: 'sounds/fishing/line_break.mp3',
  
  // Catch sounds by rarity
  catchCommon: 'sounds/fishing/catch_common.mp3',
  catchUncommon: 'sounds/fishing/catch_uncommon.mp3',
  catchRare: 'sounds/fishing/catch_rare.mp3',
  catchEpic: 'sounds/fishing/catch_epic.mp3',
  catchLegendary: 'sounds/fishing/catch_legendary.mp3',
  
  // UI sounds
  click: 'sounds/ui/click.mp3',
  upgrade: 'sounds/ui/upgrade.mp3',
  achievement: 'sounds/ui/achievement.mp3',
  levelUp: 'sounds/ui/level_up.mp3',
  
  // Ambient sounds
  ambientDay: 'sounds/ambient/day_ambient.mp3',
  ambientNight: 'sounds/ambient/night_ambient.mp3',
  ambientRain: 'sounds/ambient/rain.mp3',
  ambientStorm: 'sounds/ambient/storm.mp3',
  birds: 'sounds/ambient/birds.mp3',
  waves: 'sounds/ambient/waves.mp3',
  
  // Weather-specific sounds
  thunder: 'sounds/weather/thunder.mp3',
  rainLight: 'sounds/weather/rain_light.mp3',
  rainHeavy: 'sounds/weather/rain_heavy.mp3',
  wind: 'sounds/weather/wind.mp3'
};

// Sound setup
const sounds = {};
let masterVolume = 0.7;
let sfxVolume = 1.0;
let musicVolume = 0.5;
let ambientVolume = 0.8;
let enabled = true;
let currentAmbientSound = null;
let weatherSounds = [];

/**
 * Initialize the sound system
 * @returns {Promise} Promise that resolves when sounds are initialized
 */
export function initSoundSystem() {
  if (!enabled) return Promise.resolve();
  
  // Check if Audio is supported
  if (typeof Audio === 'undefined') {
    console.warn('[Sound] Audio not supported in this browser');
    enabled = false;
    return Promise.resolve();
  }
  
  // Load essential sounds first (those needed for immediate gameplay)
  const essentialSounds = ['cast', 'splash', 'reel', 'catchCommon'];
  
  return Promise.all(
    essentialSounds.map(soundId => loadSound(soundId))
  ).then(() => {
    console.log('[Sound] Essential sounds loaded');
    
    // Load other sounds in the background
    const otherSounds = Object.keys(SOUND_PATHS).filter(
      soundId => !essentialSounds.includes(soundId)
    );
    
    // Load in batches to prevent too many concurrent requests
    loadSoundBatches(otherSounds, 3);
    
    return true;
  }).catch(error => {
    console.error('[Sound] Error loading essential sounds:', error);
    // Continue even if sound loading fails
    return false;
  });
}

/**
 * Load sounds in batches to prevent too many concurrent requests
 * @param {Array} soundIds - Array of sound IDs to load
 * @param {number} batchSize - Number of sounds to load simultaneously
 */
function loadSoundBatches(soundIds, batchSize = 3) {
  if (!soundIds.length) return;
  
  const batch = soundIds.slice(0, batchSize);
  const remaining = soundIds.slice(batchSize);
  
  Promise.all(batch.map(soundId => loadSound(soundId)))
    .then(() => {
      if (remaining.length) {
        setTimeout(() => loadSoundBatches(remaining, batchSize), 300);
      } else {
        console.log('[Sound] All sounds loaded');
      }
    })
    .catch(error => {
      console.warn('[Sound] Error loading sound batch:', error);
      // Continue with remaining sounds even if some fail
      if (remaining.length) {
        setTimeout(() => loadSoundBatches(remaining, batchSize), 300);
      }
    });
}

/**
 * Load a single sound
 * @param {string} soundId - Sound identifier
 * @returns {Promise} Promise that resolves when sound is loaded
 */
function loadSound(soundId) {
  return new Promise((resolve, reject) => {
    if (!SOUND_PATHS[soundId]) {
      console.warn(`[Sound] No path defined for sound: ${soundId}`);
      reject(new Error(`No path defined for sound: ${soundId}`));
      return;
    }
    
    try {
      const audio = new Audio();
      
      // Handle success
      audio.addEventListener('canplaythrough', () => {
        sounds[soundId] = audio;
        resolve(audio);
      }, { once: true });
      
      // Handle errors
      audio.addEventListener('error', (e) => {
        console.warn(`[Sound] Failed to load sound: ${soundId}`, e);
        reject(e);
      }, { once: true });
      
      // Start loading
      audio.src = SOUND_PATHS[soundId];
      audio.load();
      
      // Set timeout to resolve anyway after 5 seconds (in case 'canplaythrough' never fires)
      setTimeout(() => {
        if (!sounds[soundId]) {
          sounds[soundId] = audio;
          resolve(audio);
        }
      }, 5000);
    } catch (e) {
      console.error(`[Sound] Error creating audio element for ${soundId}:`, e);
      reject(e);
    }
  });
}

/**
 * Play a sound effect
 * @param {string} soundId - Sound identifier
 * @param {Object} options - Playback options
 * @returns {HTMLAudioElement|null} The audio element or null if failed
 */
export function playSound(soundId, options = {}) {
  if (!enabled) return null;
  
  const defaults = {
    volume: 1.0,
    loop: false,
    rate: 1.0,
    interrupt: true,
    pitch: 0,
    pan: 0
  };
  
  const settings = { ...defaults, ...options };
  
  try {
    let audio = sounds[soundId];
    
    // If sound isn't loaded, try to load it
    if (!audio) {
      loadSound(soundId)
        .then(() => playSound(soundId, options))
        .catch(() => console.warn(`[Sound] Couldn't load sound: ${soundId}`));
      return null;
    }
    
    // If set to interrupt, or the sound isn't playing, play it
    if (settings.interrupt || audio.paused || audio.ended) {
      // Create a clone to allow multiple instances of the same sound
      const soundInstance = audio.cloneNode();
      
      // Apply settings
      soundInstance.volume = settings.volume * sfxVolume * masterVolume;
      soundInstance.loop = settings.loop;
      soundInstance.playbackRate = settings.rate;
      
      // Apply pitch variation if supported and requested
      if (settings.pitch !== 0 && window.AudioContext) {
        try {
          // This is a simple approximation, in a real implementation you'd use 
          // Web Audio API to properly shift pitch
          soundInstance.playbackRate = Math.pow(2, settings.pitch / 12) * settings.rate;
        } catch (e) {
          console.warn('[Sound] Pitch adjustment failed:', e);
        }
      }
      
      // Play the sound
      const playPromise = soundInstance.play();
      
      // Handle play() promise (modern browsers return a promise from play())
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn(`[Sound] Error playing sound ${soundId}:`, error);
        });
      }
      
      return soundInstance;
    }
    
    return audio;
  } catch (error) {
    console.warn(`[Sound] Error playing sound ${soundId}:`, error);
    return null;
  }
}

/**
 * Play a fish catch sound based on rarity with enhanced effects
 * @param {number} rarity - Fish rarity (1-5)
 */
export function playCatchSound(rarity) {
  if (!enabled) return null;
  
  let soundId;
  let volume = 1.0;
  let additionalSounds = [];
  
  switch (rarity) {
    case 5: 
      soundId = 'catchLegendary';
      volume = 1.0;
      // Add a magical shimmer effect for legendary fish
      additionalSounds.push({
        soundId: 'achievement', 
        options: { volume: 0.5, rate: 1.2, pitch: 4 }
      });
      break;
    case 4:
      soundId = 'catchEpic';
      volume = 0.9;
      // Add a subtle exciting effect for epic fish
      additionalSounds.push({
        soundId: 'achievement', 
        options: { volume: 0.3, rate: 1.1 }
      });
      break;
    case 3:
      soundId = 'catchRare';
      volume = 0.8;
      break;
    case 2:
      soundId = 'catchUncommon';
      volume = 0.7;
      break;
    default:
      soundId = 'catchCommon';
      volume = 0.6;
  }
  
  // Play main catch sound
  const mainSound = playSound(soundId, { volume });
  
  // Play additional effect sounds for special rarities
  additionalSounds.forEach(sound => {
    setTimeout(() => {
      playSound(sound.soundId, sound.options);
    }, 200); // Small delay to sequence the sounds
  });
  
  // For higher rarities, add water splash sounds
  if (rarity >= 3) {
    setTimeout(() => {
      playSound('splash', { volume: 0.3, pitch: -2 });
    }, 100);
  }
  
  return mainSound;
}

/**
 * Start ambient sound based on weather and time of day with enhanced effects
 * @param {string} weather - Current weather
 * @param {string} timeOfDay - Current time of day
 */
export function startAmbientSound(weather, timeOfDay) {
  if (!enabled) return;
  
  // Stop current ambient sounds
  stopAmbientSounds();
  
  // Primary ambient track based on time of day
  const isDaytime = timeOfDay === 'day' || timeOfDay === 'morning';
  const isPeakTime = timeOfDay === 'morning' || timeOfDay === 'evening';
  
  // Base ambient sound
  currentAmbientSound = playSound(
    isDaytime ? 'ambientDay' : 'ambientNight', 
    { loop: true, volume: ambientVolume * 0.6 }
  );
  
  // Add time-specific ambient sounds
  if (isPeakTime) {
    // Add more active wildlife sounds during peak fishing times
    weatherSounds.push(
      playSound('birds', { loop: true, volume: ambientVolume * 0.4 })
    );
  }
  
  // Add weather-specific ambient sounds
  switch (weather) {
    case 'rainy':
      weatherSounds.push(
        playSound('ambientRain', { loop: true, volume: ambientVolume * 0.4 })
      );
      
      // Occasional rain intensity changes
      scheduleWeatherVariation('rainLight', 'rainHeavy', 15000, 30000);
      break;
      
    case 'stormy':
      // Add base storm sounds
      weatherSounds.push(
        playSound('ambientStorm', { loop: true, volume: ambientVolume * 0.5 })
      );
      
      // Add wind effects
      weatherSounds.push(
        playSound('wind', { loop: true, volume: ambientVolume * 0.3 })
      );
      
      // Schedule thunder sounds with random timing and intensity
      scheduleWeatherEffect('thunder', { volume: ambientVolume * 0.8 }, 15000, 60000);
      break;
      
    case 'sunny':
      if (isDaytime) {
        // Add cheerful nature sounds for sunny days
        weatherSounds.push(
          playSound('birds', { loop: true, volume: ambientVolume * 0.3 })
        );
      }
      break;
      
    case 'foggy':
      // Add mysterious foggy sounds
      weatherSounds.push(
        playSound('wind', { loop: true, volume: ambientVolume * 0.2 })
      );
      
      // Add subtle ominous tones for fog
      if (!isDaytime) {
        // Distant eerie sounds in foggy nights
        scheduleWeatherEffect('thunder', { volume: ambientVolume * 0.1, pitch: -5 }, 45000, 120000);
      }
      break;
      
    case 'cloudy':
      // Add gentle wind for cloudy days
      weatherSounds.push(
        playSound('wind', { loop: true, volume: ambientVolume * 0.15 })
      );
      break;
  }
  
  // Always add some waves for fishing ambience, but adjust volume based on weather
  const waveVolume = weather === 'stormy' ? 0.4 : 0.25;
  weatherSounds.push(
    playSound('waves', { loop: true, volume: ambientVolume * waveVolume })
  );
  
  // Schedule random ambient nature sounds
  scheduleAmbientNatureSounds(weather, timeOfDay);
}

/**
 * Schedule random ambient nature sounds
 * @param {string} weather - Current weather
 * @param {string} timeOfDay - Current time of day
 */
function scheduleAmbientNatureSounds(weather, timeOfDay) {
  // Clear existing timer
  if (this.ambientNatureTimer) {
    clearTimeout(this.ambientNatureTimer);
  }
  
  // Determine possible sounds based on conditions
  const possibleSounds = [];
  
  if (timeOfDay === 'day' || timeOfDay === 'morning') {
    possibleSounds.push({
      soundId: 'birds',
      options: { volume: ambientVolume * 0.2, pitch: Math.random() * 4 - 2 },
      minDelay: 20000,
      maxDelay: 40000
    });
  }
  
  if (timeOfDay === 'evening' || timeOfDay === 'night') {
    possibleSounds.push({
      soundId: 'crickets',
      options: { volume: ambientVolume * 0.2 },
      minDelay: 15000,
      maxDelay: 30000
    });
  }
  
  // Add water splashes for all conditions
  possibleSounds.push({
    soundId: 'splash',
    options: { volume: ambientVolume * 0.1, pitch: -3 },
    minDelay: 10000,
    maxDelay: 30000
  });
  
  // If no sounds to play, exit
  if (possibleSounds.length === 0) return;
  
  // Select a random sound
  const sound = possibleSounds[Math.floor(Math.random() * possibleSounds.length)];
  
  // Calculate random delay
  const delay = sound.minDelay + Math.random() * (sound.maxDelay - sound.minDelay);
  
  // Schedule next sound
  this.ambientNatureTimer = setTimeout(() => {
    // Skip playing if sound system is disabled during the wait
    if (!enabled) return;
    
    // Play the sound
    playSound(sound.soundId, sound.options);
    
    // Schedule next sound
    scheduleAmbientNatureSounds(weather, timeOfDay);
  }, delay);
}

/**
 * Schedule weather variations (alternating between two sounds)
 * @param {string} sound1 - First sound ID
 * @param {string} sound2 - Second sound ID
 * @param {number} minDelay - Minimum delay between changes
 * @param {number} maxDelay - Maximum delay between changes
 */
function scheduleWeatherVariation(sound1, sound2, minDelay, maxDelay) {
  // Clear existing timer
  if (this.weatherVariationTimer) {
    clearTimeout(this.weatherVariationTimer);
  }
  
  // Current variation state
  if (!this.weatherVariationState) {
    this.weatherVariationState = {
      currentSound: Math.random() < 0.5 ? sound1 : sound2,
      intensity: 0.2 + Math.random() * 0.3
    };
  }
  
  // Calculate random delay
  const delay = minDelay + Math.random() * (maxDelay - minDelay);
  
  // Schedule variation
  this.weatherVariationTimer = setTimeout(() => {
    // Skip if sound system is disabled during the wait
    if (!enabled) return;
    
    // Toggle sound
    this.weatherVariationState.currentSound = 
      this.weatherVariationState.currentSound === sound1 ? sound2 : sound1;
    
    // Random intensity
    this.weatherVariationState.intensity = 0.2 + Math.random() * 0.3;
    
    // Play the sound
    playSound(
      this.weatherVariationState.currentSound, 
      { volume: ambientVolume * this.weatherVariationState.intensity }
    );
    
    // Schedule next variation
    scheduleWeatherVariation(sound1, sound2, minDelay, maxDelay);
  }, delay);
}

/**
 * Stop all ambient sounds
 */
export function stopAmbientSounds() {
  if (currentAmbientSound) {
    currentAmbientSound.pause();
    currentAmbientSound = null;
  }
  
  // Stop all weather sounds
  weatherSounds.forEach(sound => {
    if (sound) sound.pause();
  });
  weatherSounds = [];
  
  // Clear any scheduled weather effects
  if (this.weatherEffectTimer) {
    clearTimeout(this.weatherEffectTimer);
    this.weatherEffectTimer = null;
  }
}

/**
 * Schedule random weather effect sounds
 * @param {string} soundId - Sound identifier
 * @param {Object} options - Sound options
 * @param {number} minDelay - Minimum delay between sounds
 * @param {number} maxDelay - Maximum delay between sounds
 */
function scheduleWeatherEffect(soundId, options, minDelay, maxDelay) {
  // Clear existing timer
  if (this.weatherEffectTimer) {
    clearTimeout(this.weatherEffectTimer);
  }
  
  // Calculate random delay
  const delay = minDelay + Math.random() * (maxDelay - minDelay);
  
  // Schedule next sound
  this.weatherEffectTimer = setTimeout(() => {
    playSound(soundId, options);
    scheduleWeatherEffect(soundId, options, minDelay, maxDelay);
  }, delay);
}

/**
 * Set master volume for all sounds
 * @param {number} volume - Volume level (0-1)
 */
export function setMasterVolume(volume) {
  masterVolume = Math.max(0, Math.min(1, volume));
}

/**
 * Set sound effects volume
 * @param {number} volume - Volume level (0-1)
 */
export function setSFXVolume(volume) {
  sfxVolume = Math.max(0, Math.min(1, volume));
}

/**
 * Set music volume
 * @param {number} volume - Volume level (0-1)
 */
export function setMusicVolume(volume) {
  musicVolume = Math.max(0, Math.min(1, volume));
  
  // Update current ambient sound if playing
  if (currentAmbientSound) {
    currentAmbientSound.volume = musicVolume * masterVolume;
  }
}

/**
 * Set ambient sound volume
 * @param {number} volume - Volume level (0-1)
 */
export function setAmbientVolume(volume) {
  ambientVolume = Math.max(0, Math.min(1, volume));
  
  // Update current weather sounds if playing
  weatherSounds.forEach(sound => {
    if (sound) sound.volume = ambientVolume * masterVolume;
  });
}

/**
 * Enable or disable sound system
 * @param {boolean} isEnabled - Whether sound is enabled
 */
export function enableSound(isEnabled) {
  enabled = isEnabled;
  
  if (!enabled) {
    stopAmbientSounds();
  }
}

/**
 * Get sound enabled state
 * @returns {boolean} Whether sound is enabled
 */
export function isSoundEnabled() {
  return enabled;
}

/**
 * Save sound settings to localStorage
 */
export function saveSoundSettings() {
  try {
    const settings = {
      enabled,
      masterVolume,
      sfxVolume,
      musicVolume,
      ambientVolume
    };
    
    localStorage.setItem('fishing-sound-settings', JSON.stringify(settings));
  } catch (e) {
    console.warn('[Sound] Failed to save sound settings:', e);
  }
}

/**
 * Load sound settings from localStorage
 */
export function loadSoundSettings() {
  try {
    const savedSettings = localStorage.getItem('fishing-sound-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      
      enabled = settings.enabled !== undefined ? settings.enabled : true;
      masterVolume = settings.masterVolume !== undefined ? settings.masterVolume : 0.7;
      sfxVolume = settings.sfxVolume !== undefined ? settings.sfxVolume : 1.0;
      musicVolume = settings.musicVolume !== undefined ? settings.musicVolume : 0.5;
      ambientVolume = settings.ambientVolume !== undefined ? settings.ambientVolume : 0.8;
    }
  } catch (e) {
    console.warn('[Sound] Failed to load sound settings:', e);
  }
}

// Export a default object with all functions
export default {
  initSoundSystem,
  playSound,
  playCatchSound,
  startAmbientSound,
  stopAmbientSounds,
  setMasterVolume,
  setSFXVolume,
  setMusicVolume,
  setAmbientVolume,
  enableSound,
  isSoundEnabled,
  saveSoundSettings,
  loadSoundSettings
}; 