/**
 * fish-catalog.js
 * Comprehensive catalog of fish for the Surron Squad fishing game
 * with expanded fish varieties, seasonal availability and special abilities
 */

/**
 * Complete fish catalog with detailed properties:
 * - name: Display name of the fish
 * - value: Base SurCoins value
 * - rarity: 1-5 scale (common to legendary)
 * - size: Relative size factor affecting catch difficulty and value
 * - type: Type of fish (freshwater, saltwater, etc.)
 * - season: When this fish is most abundant (spring, summer, fall, winter, or "all")
 * - timeOfDay: When this fish is most active (morning, day, evening, night, or "any")
 * - weather: Preferred weather conditions (sunny, cloudy, rainy, stormy, or "any")
 * - description: Brief description of the fish
 * - specialEffect: Any special bonus or effect when caught
 */
export const FISH_CATALOG = [
  // === COMMON (RARITY 1) ===
  {
    name: "Bluegill",
    value: 5,
    rarity: 1,
    size: 0.8,
    type: "freshwater",
    season: "all",
    timeOfDay: "any",
    weather: "any",
    description: "A common small sunfish found in most lakes and ponds.",
    specialEffect: null
  },
  {
    name: "Perch",
    value: 8,
    rarity: 1,
    size: 0.9,
    type: "freshwater",
    season: "all",
    timeOfDay: "morning",
    weather: "any",
    description: "Striped fish often found in schools near the shore.",
    specialEffect: null
  },
  {
    name: "Crappie",
    value: 7,
    rarity: 1,
    size: 0.85,
    type: "freshwater",
    season: "spring",
    timeOfDay: "morning",
    weather: "cloudy",
    description: "Popular panfish that's good for beginners to catch.",
    specialEffect: null
  },
  {
    name: "Smallmouth Bass",
    value: 12,
    rarity: 1,
    size: 1.2,
    type: "freshwater",
    season: "summer",
    timeOfDay: "day",
    weather: "sunny",
    description: "Aggressive fighter known for acrobatic jumps when hooked.",
    specialEffect: null
  },
  
  // === UNCOMMON (RARITY 2) ===
  {
    name: "Largemouth Bass",
    value: 18,
    rarity: 2,
    size: 1.5,
    type: "freshwater",
    season: "summer",
    timeOfDay: "evening",
    weather: "cloudy",
    description: "Popular game fish known for their large mouth and fighting spirit.",
    specialEffect: null
  },
  {
    name: "Rainbow Trout",
    value: 20,
    rarity: 2,
    size: 1.3,
    type: "freshwater",
    season: "spring",
    timeOfDay: "morning",
    weather: "cloudy",
    description: "Colorful trout with a distinctive rainbow stripe along its side.",
    specialEffect: "xpBonus: 5"
  },
  {
    name: "Catfish",
    value: 22,
    rarity: 2,
    size: 1.7,
    type: "freshwater",
    season: "summer",
    timeOfDay: "night",
    weather: "any",
    description: "Bottom-dwelling fish with whisker-like barbels and no scales.",
    specialEffect: null
  },
  {
    name: "Walleye",
    value: 25,
    rarity: 2,
    size: 1.4,
    type: "freshwater",
    season: "fall",
    timeOfDay: "evening",
    weather: "cloudy",
    description: "Prized for their tasty fillets, these fish have reflective eyes.",
    specialEffect: "valueBonus: 1.1"
  },
  
  // === RARE (RARITY 3) ===
  {
    name: "Northern Pike",
    value: 35,
    rarity: 3,
    size: 2.0,
    type: "freshwater",
    season: "fall",
    timeOfDay: "morning",
    weather: "cloudy",
    description: "Predatory fish with a long, torpedo-shaped body and sharp teeth.",
    specialEffect: "challenge: 'Quick Reaction'"
  },
  {
    name: "Steelhead",
    value: 40,
    rarity: 3,
    size: 1.8,
    type: "freshwater",
    season: "winter",
    timeOfDay: "day",
    weather: "rainy",
    description: "Ocean-going rainbow trout known for powerful fights when hooked.",
    specialEffect: "xpBonus: 10"
  },
  {
    name: "Muskie",
    value: 50,
    rarity: 3,
    size: 2.2,
    type: "freshwater",
    season: "fall",
    timeOfDay: "evening",
    weather: "stormy",
    description: "Elusive predator known as 'the fish of 10,000 casts'.",
    specialEffect: "challenge: 'Strength Test'"
  },
  
  // === EPIC (RARITY 4) ===
  {
    name: "Sturgeon",
    value: 75,
    rarity: 4,
    size: 3.0,
    type: "freshwater",
    season: "spring",
    timeOfDay: "night",
    weather: "any",
    description: "Ancient fish with a prehistoric appearance and armored plates.",
    specialEffect: "unlock: 'Ancient Fishing Techniques'"
  },
  {
    name: "Salmon",
    value: 60,
    rarity: 4,
    size: 2.5,
    type: "freshwater",
    season: "fall",
    timeOfDay: "day",
    weather: "rainy",
    description: "Powerful migratory fish that returns to its birthplace to spawn.",
    specialEffect: "relationshipBonus: 'billy'"
  },
  {
    name: "Tiger Muskie",
    value: 80,
    rarity: 4,
    size: 2.8,
    type: "freshwater",
    season: "summer",
    timeOfDay: "evening",
    weather: "stormy",
    description: "Hybrid between Northern Pike and Muskie, known for aggressive strikes.",
    specialEffect: "challenge: 'Ultimate Fighter'"
  },
  
  // === LEGENDARY (RARITY 5) ===
  {
    name: "Albino Catfish",
    value: 120,
    rarity: 5,
    size: 3.5,
    type: "freshwater",
    season: "summer",
    timeOfDay: "night",
    weather: "stormy",
    description: "Extremely rare white catfish that lives in the deepest parts of the lake.",
    specialEffect: "currencyMultiplier: 2"
  },
  {
    name: "Electric Freshwater Eel",
    value: 100,
    rarity: 5,
    size: 3.2,
    type: "freshwater",
    season: "summer",
    timeOfDay: "night",
    weather: "stormy",
    description: "Unusual eel with electric properties. Popular with Charlie for battery experiments.",
    specialEffect: "relationshipBonus: 'charlie'"
  },
  {
    name: "Billy's Bass",
    value: 150,
    rarity: 5,
    size: 4.0,
    type: "freshwater",
    season: "all",
    timeOfDay: "any",
    weather: "any",
    description: "The legendary fish that Billy has been trying to catch for years.",
    specialEffect: "questTrigger: 'billys_legendary_catch'"
  }
];

/**
 * Get fish by name
 * @param {string} name - Fish name
 * @returns {Object|null} Fish data or null if not found
 */
export function getFishByName(name) {
  return FISH_CATALOG.find(fish => fish.name === name) || null;
}

/**
 * Get all fish of a specific rarity
 * @param {number} rarity - Rarity level (1-5)
 * @returns {Array} Array of fish with the specified rarity
 */
export function getFishByRarity(rarity) {
  return FISH_CATALOG.filter(fish => fish.rarity === rarity);
}

/**
 * Get fish that are available in the current season
 * @param {string} season - Current season (spring, summer, fall, winter)
 * @returns {Array} Array of fish available in the specified season
 */
export function getSeasonalFish(season) {
  return FISH_CATALOG.filter(fish => 
    fish.season === season || fish.season === 'all'
  );
}

/**
 * Get fish that are active during a specific time of day
 * @param {string} timeOfDay - Time of day (morning, day, evening, night)
 * @returns {Array} Array of fish active during the specified time
 */
export function getTimeOfDayFish(timeOfDay) {
  return FISH_CATALOG.filter(fish => 
    fish.timeOfDay === timeOfDay || fish.timeOfDay === 'any'
  );
}

/**
 * Get fish that are available in specific weather conditions
 * @param {string} weather - Weather condition (sunny, cloudy, rainy, stormy)
 * @returns {Array} Array of fish available in the specified weather
 */
export function getWeatherFish(weather) {
  return FISH_CATALOG.filter(fish => 
    fish.weather === weather || fish.weather === 'any'
  );
}

/**
 * Get fish that match all the specified conditions
 * @param {Object} conditions - Object with season, timeOfDay, and weather properties
 * @returns {Array} Array of fish that match all conditions
 */
export function getAvailableFish(conditions) {
  return FISH_CATALOG.filter(fish => 
    (fish.season === conditions.season || fish.season === 'all') &&
    (fish.timeOfDay === conditions.timeOfDay || fish.timeOfDay === 'any') &&
    (fish.weather === conditions.weather || fish.weather === 'any')
  );
}

export default {
  FISH_CATALOG,
  getFishByName,
  getFishByRarity,
  getSeasonalFish,
  getTimeOfDayFish,
  getWeatherFish,
  getAvailableFish
}; 