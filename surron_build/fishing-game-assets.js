/**
 * fishing-game-assets.js
 * Asset management system for Billy's Fishing Game
 * Handles preloading, caching, and fallbacks for images and other assets
 */

// Asset paths
const ASSET_PATHS = {
  // Fishing equipment
  rodBasic: 'images/fishing/rods/rod_basic.png',
  rodPro: 'images/fishing/rods/rod_pro.png',
  rodMaster: 'images/fishing/rods/rod_master.png',
  lureBasic: 'images/fishing/lures/lure_basic.png',
  lurePremium: 'images/fishing/lures/lure_premium.png',
  lureRare: 'images/fishing/lures/lure_rare.png',
  
  // Fish images by rarity
  fishCommon: 'images/fishing/fish/common.png',
  fishUncommon: 'images/fishing/fish/uncommon.png',
  fishRare: 'images/fishing/fish/rare.png',
  fishEpic: 'images/fishing/fish/epic.png',
  fishLegendary: 'images/fishing/fish/legendary.png',
  
  // UI elements
  buttonCast: 'images/ui/btn_cast.png',
  buttonReel: 'images/ui/btn_reel.png',
  reelMeter: 'images/ui/reel_meter.png',
  powerMeter: 'images/ui/power_meter.png',
  
  // Environment
  waterSurface: 'images/environment/water_surface.png',
  shore: 'images/environment/shore.png',
  skySunny: 'images/environment/sky_sunny.png',
  skyCloudy: 'images/environment/sky_cloudy.png',
  skyRainy: 'images/environment/sky_rainy.png',
  skyStormy: 'images/environment/sky_stormy.png',
  
  // Effects
  splash: 'images/effects/splash.png',
  ripple: 'images/effects/ripple.png',
  bubble: 'images/effects/bubble.png',
  catchStar: 'images/effects/catch_star.png',
  
  // Characters
  billyIdle: 'images/characters/billy_idle.png',
  billyExcited: 'images/characters/billy_excited.png',
  
  // Fallback image (used when assets fail to load)
  fallback: 'images/fallback.png'
};

// Individual fish assets 
const FISH_ASSETS = {
  'Bluegill': 'images/fishing/fish/bluegill.png',
  'Perch': 'images/fishing/fish/perch.png',
  'Crappie': 'images/fishing/fish/crappie.png',
  'Smallmouth Bass': 'images/fishing/fish/smallmouth_bass.png',
  'Largemouth Bass': 'images/fishing/fish/largemouth_bass.png',
  'Rainbow Trout': 'images/fishing/fish/rainbow_trout.png',
  'Catfish': 'images/fishing/fish/catfish.png',
  'Walleye': 'images/fishing/fish/walleye.png',
  'Northern Pike': 'images/fishing/fish/northern_pike.png',
  'Steelhead': 'images/fishing/fish/steelhead.png',
  'Muskie': 'images/fishing/fish/muskie.png',
  'Sturgeon': 'images/fishing/fish/sturgeon.png',
  'Salmon': 'images/fishing/fish/salmon.png',
  'Tiger Muskie': 'images/fishing/fish/tiger_muskie.png',
  'Albino Catfish': 'images/fishing/fish/albino_catfish.png',
  'Electric Freshwater Eel': 'images/fishing/fish/electric_eel.png',
  'Billy\'s Bass': 'images/fishing/fish/billys_bass.png'
};

// Asset storage
const assets = {
  images: {},
  fonts: {},
  other: {}
};

// Asset loading stats
let totalAssets = 0;
let loadedAssets = 0;
let loadingErrors = 0;
let isLoadingComplete = false;
let loadingProgressCallbacks = [];

/**
 * Initialize the asset manager and begin loading critical assets
 * @returns {Promise} Promise that resolves when critical assets are loaded
 */
export function initAssets() {
  // Reset loading state
  loadedAssets = 0;
  loadingErrors = 0;
  isLoadingComplete = false;
  
  // Critical assets needed for initial render
  const criticalAssets = [
    'waterSurface', 
    'shore', 
    'skySunny', 
    'rodBasic',
    'fallback'
  ];
  
  // Set total assets count
  totalAssets = Object.keys(ASSET_PATHS).length + Object.keys(FISH_ASSETS).length;
  
  // Create fallback image for use when assets fail to load
  createFallbackImage();
  
  // First load critical assets
  console.log('[Assets] Loading critical assets...');
  return loadImageBatch(criticalAssets.map(id => ({ id, path: ASSET_PATHS[id] })))
    .then(() => {
      console.log('[Assets] Critical assets loaded');
      
      // Start loading remaining assets in the background
      loadRemainingAssets();
      
      return {
        progress: getLoadingProgress(),
        loaded: Object.keys(assets.images).length,
        total: totalAssets
      };
    })
    .catch(error => {
      console.error('[Assets] Error loading critical assets:', error);
      // Continue anyway, we'll use fallbacks
      return {
        progress: getLoadingProgress(),
        loaded: Object.keys(assets.images).length,
        total: totalAssets,
        error: true
      };
    });
}

/**
 * Load all remaining assets in the background
 */
function loadRemainingAssets() {
  // Load main assets first (non-fish)
  const remainingMainAssets = Object.entries(ASSET_PATHS)
    .filter(([id]) => !assets.images[id] && id !== 'fallback')
    .map(([id, path]) => ({ id, path }));
  
  // Load in batches to prevent too many concurrent requests
  const batchSize = 5;
  const mainBatches = [];
  
  for (let i = 0; i < remainingMainAssets.length; i += batchSize) {
    mainBatches.push(remainingMainAssets.slice(i, i + batchSize));
  }
  
  // Load main asset batches in sequence
  let mainPromise = Promise.resolve();
  
  mainBatches.forEach(batch => {
    mainPromise = mainPromise
      .then(() => loadImageBatch(batch))
      .catch(error => {
        console.warn('[Assets] Error loading asset batch:', error);
        // Continue despite errors
        return Promise.resolve();
      });
  });
  
  // After main assets, load fish assets
  mainPromise.then(() => {
    const fishAssets = Object.entries(FISH_ASSETS)
      .map(([name, path]) => ({ id: `fish_${name.replace(/\s+/g, '_')}`, path, name }));
    
    const fishBatches = [];
    
    for (let i = 0; i < fishAssets.length; i += batchSize) {
      fishBatches.push(fishAssets.slice(i, i + batchSize));
    }
    
    // Load fish asset batches in sequence
    let fishPromise = Promise.resolve();
    
    fishBatches.forEach(batch => {
      fishPromise = fishPromise
        .then(() => loadImageBatch(batch))
        .catch(error => {
          console.warn('[Assets] Error loading fish asset batch:', error);
          // Continue despite errors
          return Promise.resolve();
        });
    });
    
    // Mark loading as complete after all batches finish
    fishPromise.finally(() => {
      isLoadingComplete = true;
      console.log(`[Assets] All assets loaded: ${loadedAssets}/${totalAssets} (${loadingErrors} errors)`);
    });
  });
}

/**
 * Load a batch of images
 * @param {Array} imagesToLoad - Array of image definitions { id, path, [name] }
 * @returns {Promise} Promise that resolves when all images in batch are loaded or timed out
 */
function loadImageBatch(imagesToLoad) {
  return Promise.all(
    imagesToLoad.map(({ id, path, name }) => loadImage(id, path, name))
  );
}

/**
 * Load a single image
 * @param {string} id - Asset identifier
 * @param {string} path - Image file path
 * @param {string} [name] - Optional name for fish assets
 * @returns {Promise} Promise that resolves when image is loaded or timed out
 */
function loadImage(id, path, name) {
  return new Promise((resolve) => {
    // Skip if already loaded
    if (assets.images[id]) {
      resolve(assets.images[id]);
      return;
    }
    
    const img = new Image();
    
    // Set timeout to resolve after 5 seconds even if loading fails
    const timeoutId = setTimeout(() => {
      loadingErrors++;
      console.warn(`[Assets] Timeout loading image: ${id}`);
      
      // Use fallback for failed loads
      assets.images[id] = assets.images.fallback || createFallbackImage();
      
      // Store fish name if provided
      if (name) {
        assets.images[id].fishName = name;
      }
      
      incrementLoadedAssets();
      resolve(assets.images[id]);
    }, 5000);
    
    // Handle successful load
    img.onload = () => {
      clearTimeout(timeoutId);
      assets.images[id] = img;
      
      // Store fish name if provided
      if (name) {
        img.fishName = name;
      }
      
      incrementLoadedAssets();
      resolve(img);
    };
    
    // Handle load error
    img.onerror = () => {
      clearTimeout(timeoutId);
      loadingErrors++;
      console.warn(`[Assets] Error loading image: ${id}`);
      
      // Use fallback for failed loads
      assets.images[id] = assets.images.fallback || createFallbackImage();
      
      // Store fish name if provided
      if (name) {
        assets.images[id].fishName = name;
      }
      
      incrementLoadedAssets();
      resolve(assets.images[id]);
    };
    
    // Start loading the image
    img.src = path;
  });
}

/**
 * Create a fallback image for use when asset loading fails
 * @returns {HTMLImageElement} Fallback image
 */
function createFallbackImage() {
  // Create canvas for fallback image
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  // Draw warning pattern
  ctx.fillStyle = '#FF5555'; // Red background
  ctx.fillRect(0, 0, 64, 64);
  
  ctx.fillStyle = '#FFFF00'; // Yellow warning
  ctx.beginPath();
  ctx.moveTo(32, 10);
  ctx.lineTo(54, 50);
  ctx.lineTo(10, 50);
  ctx.closePath();
  ctx.fill();
  
  ctx.fillStyle = '#000000'; // Black exclamation mark
  ctx.fillRect(30, 22, 4, 16);
  ctx.fillRect(30, 42, 4, 4);
  
  // Convert to image
  const fallback = new Image();
  fallback.src = canvas.toDataURL('image/png');
  
  // Store in assets
  assets.images.fallback = fallback;
  
  return fallback;
}

/**
 * Increment loaded assets count and notify progress listeners
 */
function incrementLoadedAssets() {
  loadedAssets++;
  
  // Notify progress callbacks
  const progress = getLoadingProgress();
  loadingProgressCallbacks.forEach(callback => {
    try {
      callback(progress, loadedAssets, totalAssets);
    } catch (error) {
      console.error('[Assets] Error in progress callback:', error);
    }
  });
}

/**
 * Get current loading progress (0-100)
 * @returns {number} Loading progress percentage
 */
export function getLoadingProgress() {
  return Math.round((loadedAssets / totalAssets) * 100);
}

/**
 * Check if all assets have finished loading
 * @returns {boolean} Whether loading is complete
 */
export function isLoadingFinished() {
  return isLoadingComplete;
}

/**
 * Get an image asset by ID
 * @param {string} id - Asset identifier
 * @returns {HTMLImageElement} The image or fallback if not found
 */
export function getImage(id) {
  return assets.images[id] || assets.images.fallback || createFallbackImage();
}

/**
 * Get fish image by name
 * @param {string} fishName - Name of the fish
 * @returns {HTMLImageElement} Fish image or fallback by rarity
 */
export function getFishImage(fishName) {
  // First try direct fish image
  const fishId = `fish_${fishName.replace(/\s+/g, '_')}`;
  if (assets.images[fishId]) {
    return assets.images[fishId];
  }
  
  // Fall back to rarity-based image
  // This requires knowing the fish rarity, which would typically come from fish-catalog.js
  // For now, we'll assume a fallback mechanism based on name patterns
  
  if (fishName.includes('Legendary') || fishName === 'Billy\'s Bass') {
    return assets.images.fishLegendary || assets.images.fallback || createFallbackImage();
  } else if (fishName.includes('Epic') || fishName === 'Sturgeon' || fishName === 'Salmon') {
    return assets.images.fishEpic || assets.images.fallback || createFallbackImage();
  } else if (fishName.includes('Rare') || fishName === 'Northern Pike' || fishName === 'Muskie') {
    return assets.images.fishRare || assets.images.fallback || createFallbackImage();
  } else if (fishName.includes('Uncommon') || fishName === 'Rainbow Trout' || fishName === 'Walleye') {
    return assets.images.fishUncommon || assets.images.fallback || createFallbackImage();
  } else {
    return assets.images.fishCommon || assets.images.fallback || createFallbackImage();
  }
}

/**
 * Get equipment image
 * @param {string} type - Equipment type ('rod' or 'lure')
 * @param {string} name - Equipment name
 * @returns {HTMLImageElement} Equipment image or fallback
 */
export function getEquipmentImage(type, name) {
  // Process name to create ID
  const simpleName = name.toLowerCase().replace(/\s+/g, '');
  const id = `${type}${simpleName.charAt(0).toUpperCase() + simpleName.slice(1)}`;
  
  // Use specific ID if available
  if (assets.images[id]) {
    return assets.images[id];
  }
  
  // Fall back to basic equipment
  if (type === 'rod') {
    return assets.images.rodBasic || assets.images.fallback || createFallbackImage();
  } else if (type === 'lure') {
    return assets.images.lureBasic || assets.images.fallback || createFallbackImage();
  }
  
  return assets.images.fallback || createFallbackImage();
}

/**
 * Get environment image based on weather
 * @param {string} type - Image type ('sky')
 * @param {string} condition - Weather condition
 * @returns {HTMLImageElement} Environment image or fallback
 */
export function getEnvironmentImage(type, condition) {
  if (type === 'sky') {
    const id = `sky${condition.charAt(0).toUpperCase() + condition.slice(1)}`;
    return assets.images[id] || assets.images.skySunny || assets.images.fallback || createFallbackImage();
  }
  
  // Other environment types would go here
  
  return assets.images.fallback || createFallbackImage();
}

/**
 * Add a loading progress callback
 * @param {Function} callback - Function to call with progress updates
 * @returns {Function} Function to remove the callback
 */
export function onLoadingProgress(callback) {
  loadingProgressCallbacks.push(callback);
  
  // Return function to remove listener
  return () => {
    const index = loadingProgressCallbacks.indexOf(callback);
    if (index !== -1) {
      loadingProgressCallbacks.splice(index, 1);
    }
  };
}

/**
 * Get loading statistics
 * @returns {Object} Loading statistics
 */
export function getLoadingStats() {
  return {
    total: totalAssets,
    loaded: loadedAssets,
    errors: loadingErrors,
    isComplete: isLoadingComplete,
    progress: getLoadingProgress()
  };
}

// Export a default object with all functions
export default {
  initAssets,
  getImage,
  getFishImage,
  getEquipmentImage,
  getEnvironmentImage,
  getLoadingProgress,
  isLoadingFinished,
  onLoadingProgress,
  getLoadingStats
}; 