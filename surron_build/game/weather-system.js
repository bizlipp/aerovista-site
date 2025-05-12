/**
 * weather-system.js
 * Dynamic weather system for the Surron Squad fishing game
 * Affects fishing conditions, fish availability, and visual effects
 */

// Weather conditions with their associated properties
const WEATHER_CONDITIONS = {
  sunny: {
    name: "Sunny",
    description: "Clear skies and calm waters. Good visibility for fishing.",
    catchRateModifier: 1.0,
    rarityBonus: 0,
    visualEffects: {
      skyColor: "#87CEEB",
      waterColor: "#3A85C7",
      lightIntensity: 1.0,
      particles: "none"
    },
    soundEffects: ["birds", "gentle_waves"],
    commonSpecies: ["Bluegill", "Smallmouth Bass", "Largemouth Bass"]
  },
  cloudy: {
    name: "Cloudy",
    description: "Overcast skies create ideal fishing conditions for many species.",
    catchRateModifier: 1.15,
    rarityBonus: 0.05,
    visualEffects: {
      skyColor: "#708090",
      waterColor: "#2C6186",
      lightIntensity: 0.8,
      particles: "none"
    },
    soundEffects: ["distant_thunder", "moderate_waves"],
    commonSpecies: ["Rainbow Trout", "Walleye", "Northern Pike"]
  },
  rainy: {
    name: "Rainy",
    description: "Rain disrupts the water surface, making it harder for fish to see you.",
    catchRateModifier: 1.25,
    rarityBonus: 0.1,
    visualEffects: {
      skyColor: "#465362",
      waterColor: "#244E6B",
      lightIntensity: 0.6,
      particles: "rain"
    },
    soundEffects: ["rain", "rain_on_water", "moderate_waves"],
    commonSpecies: ["Steelhead", "Salmon", "Catfish"]
  },
  stormy: {
    name: "Stormy",
    description: "Rough waters and lightning. Dangerous but potentially rewarding for brave anglers.",
    catchRateModifier: 0.75,
    rarityBonus: 0.25,
    visualEffects: {
      skyColor: "#1C2331",
      waterColor: "#1A3A50",
      lightIntensity: 0.4,
      particles: "heavy_rain"
    },
    soundEffects: ["thunder", "heavy_rain", "strong_waves"],
    commonSpecies: ["Muskie", "Tiger Muskie", "Albino Catfish", "Electric Freshwater Eel"]
  },
  foggy: {
    name: "Foggy",
    description: "Limited visibility but mysteriously good for fishing.",
    catchRateModifier: 1.1,
    rarityBonus: 0.15,
    visualEffects: {
      skyColor: "#D3D3D3",
      waterColor: "#5F8CA7",
      lightIntensity: 0.7,
      particles: "fog"
    },
    soundEffects: ["light_waves", "distant_boats"],
    commonSpecies: ["Catfish", "Sturgeon", "Walleye"]
  }
};

// Seasons with their effect on fishing
const SEASONS = {
  spring: {
    name: "Spring",
    description: "Spawning season for many fish species.",
    catchRateModifier: 1.2,
    rarityBonus: 0.05,
    commonWeather: ["sunny", "rainy", "cloudy"],
    visualEffects: {
      foliageColor: "#8FBC8F",
      ambientColor: "#E8F5E9"
    }
  },
  summer: {
    name: "Summer",
    description: "Warm waters make fish more active but sometimes lethargic during peak heat.",
    catchRateModifier: 1.0,
    rarityBonus: 0,
    commonWeather: ["sunny", "stormy", "cloudy"],
    visualEffects: {
      foliageColor: "#2E8B57",
      ambientColor: "#FFFDE7"
    }
  },
  fall: {
    name: "Fall",
    description: "Feeding frenzy as fish prepare for winter.",
    catchRateModifier: 1.3,
    rarityBonus: 0.1,
    commonWeather: ["cloudy", "rainy", "foggy"],
    visualEffects: {
      foliageColor: "#D2691E",
      ambientColor: "#FFF8E1"
    }
  },
  winter: {
    name: "Winter",
    description: "Challenging conditions but potential for unique catches.",
    catchRateModifier: 0.8,
    rarityBonus: 0.2,
    commonWeather: ["sunny", "cloudy", "foggy"],
    visualEffects: {
      foliageColor: "#FFFFFF",
      ambientColor: "#E1F5FE"
    }
  }
};

// Time of day effects
const TIME_OF_DAY = {
  morning: {
    name: "Morning",
    description: "Early morning is prime fishing time as fish are actively feeding.",
    catchRateModifier: 1.3,
    rarityBonus: 0.05,
    visualEffects: {
      skyColor: "#87CEFA",
      lightIntensity: 0.8,
      shadowLength: "long"
    }
  },
  day: {
    name: "Day",
    description: "High visibility but fish may be more cautious during bright daylight.",
    catchRateModifier: 0.9,
    rarityBonus: 0,
    visualEffects: {
      skyColor: "#4682B4",
      lightIntensity: 1.0,
      shadowLength: "short"
    }
  },
  evening: {
    name: "Evening",
    description: "Another feeding time as the light fades.",
    catchRateModifier: 1.2,
    rarityBonus: 0.1,
    visualEffects: {
      skyColor: "#FF7F50",
      lightIntensity: 0.7,
      shadowLength: "long"
    }
  },
  night: {
    name: "Night",
    description: "Different species become active at night.",
    catchRateModifier: 1.0,
    rarityBonus: 0.15,
    visualEffects: {
      skyColor: "#191970",
      lightIntensity: 0.3,
      shadowLength: "none"
    }
  }
};

/**
 * WeatherSystem class to handle dynamic weather changes
 */
class WeatherSystem {
  constructor() {
    // Initialize with default settings
    this.currentWeather = "sunny";
    this.currentSeason = "summer";
    this.currentTimeOfDay = "day";
    this.weatherChangeInterval = null;
    this.listeners = [];
    
    // Internal timers and state
    this._minuteCounter = 0;
    this._hourCounter = 12; // Start at noon
    this._dayCounter = 1;
    this._monthCounter = 6; // Start in summer
  }
  
  /**
   * Start the weather system with dynamic changes
   * @param {boolean} dynamicChange - Whether weather should change automatically
   * @param {number} changeInterval - Interval between changes in ms (default: 5 minutes)
   */
  start(dynamicChange = true, changeInterval = 300000) {
    if (dynamicChange) {
      this.weatherChangeInterval = setInterval(() => {
        this.updateGameTime();
        this.updateWeatherBasedOnTime();
      }, 60000); // Update game time every minute
      
      // Random initial weather based on season
      this.updateWeatherBasedOnTime(true);
    }
  }
  
  /**
   * Stop the weather system
   */
  stop() {
    if (this.weatherChangeInterval) {
      clearInterval(this.weatherChangeInterval);
      this.weatherChangeInterval = null;
    }
  }
  
  /**
   * Update the internal game time
   * 1 real minute = 1 game hour
   */
  updateGameTime() {
    this._minuteCounter++;
    this._hourCounter++;
    
    // Update hour
    if (this._hourCounter >= 24) {
      this._hourCounter = 0;
      this._dayCounter++;
      
      // Update month every 30 days
      if (this._dayCounter > 30) {
        this._dayCounter = 1;
        this._monthCounter++;
        
        // Update season
        if (this._monthCounter > 12) {
          this._monthCounter = 1;
        }
        
        this.updateSeason();
      }
    }
    
    // Update time of day
    if (this._hourCounter >= 5 && this._hourCounter < 9) {
      this.setTimeOfDay("morning");
    } else if (this._hourCounter >= 9 && this._hourCounter < 17) {
      this.setTimeOfDay("day");
    } else if (this._hourCounter >= 17 && this._hourCounter < 21) {
      this.setTimeOfDay("evening");
    } else {
      this.setTimeOfDay("night");
    }
  }
  
  /**
   * Update the season based on the month
   */
  updateSeason() {
    if (this._monthCounter >= 3 && this._monthCounter < 6) {
      this.setSeason("spring");
    } else if (this._monthCounter >= 6 && this._monthCounter < 9) {
      this.setSeason("summer");
    } else if (this._monthCounter >= 9 && this._monthCounter < 12) {
      this.setSeason("fall");
    } else {
      this.setSeason("winter");
    }
  }
  
  /**
   * Update weather based on current time and season
   * @param {boolean} force - Force immediate update
   */
  updateWeatherBasedOnTime(force = false) {
    // Only change weather occasionally (20% chance each hour)
    if (!force && Math.random() > 0.2) return;
    
    const season = SEASONS[this.currentSeason];
    
    // Select weather based on season's common weather patterns
    const possibleWeather = season.commonWeather;
    const randomWeather = possibleWeather[Math.floor(Math.random() * possibleWeather.length)];
    
    this.setWeather(randomWeather);
  }
  
  /**
   * Set the current weather
   * @param {string} weather - Weather condition name
   */
  setWeather(weather) {
    if (!WEATHER_CONDITIONS[weather]) {
      console.error(`Invalid weather condition: ${weather}`);
      return;
    }
    
    const oldWeather = this.currentWeather;
    this.currentWeather = weather;
    
    // Notify listeners of weather change
    this._notifyListeners('weather', {
      old: oldWeather,
      new: weather,
      data: WEATHER_CONDITIONS[weather]
    });
  }
  
  /**
   * Set the current season
   * @param {string} season - Season name
   */
  setSeason(season) {
    if (!SEASONS[season]) {
      console.error(`Invalid season: ${season}`);
      return;
    }
    
    const oldSeason = this.currentSeason;
    this.currentSeason = season;
    
    // Notify listeners of season change
    this._notifyListeners('season', {
      old: oldSeason,
      new: season,
      data: SEASONS[season]
    });
  }
  
  /**
   * Set the current time of day
   * @param {string} timeOfDay - Time of day
   */
  setTimeOfDay(timeOfDay) {
    if (!TIME_OF_DAY[timeOfDay]) {
      console.error(`Invalid time of day: ${timeOfDay}`);
      return;
    }
    
    const oldTimeOfDay = this.currentTimeOfDay;
    this.currentTimeOfDay = timeOfDay;
    
    // Notify listeners of time change
    this._notifyListeners('timeOfDay', {
      old: oldTimeOfDay,
      new: timeOfDay,
      data: TIME_OF_DAY[timeOfDay]
    });
  }
  
  /**
   * Get current conditions
   * @returns {Object} Current weather, season, and time of day data
   */
  getCurrentConditions() {
    return {
      weather: WEATHER_CONDITIONS[this.currentWeather],
      season: SEASONS[this.currentSeason],
      timeOfDay: TIME_OF_DAY[this.currentTimeOfDay],
      gameTime: {
        hour: this._hourCounter,
        day: this._dayCounter,
        month: this._monthCounter
      }
    };
  }
  
  /**
   * Get current total catch rate modifier based on all conditions
   * @returns {number} Combined catch rate modifier
   */
  getCatchRateModifier() {
    const weather = WEATHER_CONDITIONS[this.currentWeather];
    const season = SEASONS[this.currentSeason];
    const time = TIME_OF_DAY[this.currentTimeOfDay];
    
    return weather.catchRateModifier * season.catchRateModifier * time.catchRateModifier;
  }
  
  /**
   * Get current total rarity bonus based on all conditions
   * @returns {number} Combined rarity bonus
   */
  getRarityBonus() {
    const weather = WEATHER_CONDITIONS[this.currentWeather];
    const season = SEASONS[this.currentSeason];
    const time = TIME_OF_DAY[this.currentTimeOfDay];
    
    return weather.rarityBonus + season.rarityBonus + time.rarityBonus;
  }
  
  /**
   * Add an event listener
   * @param {string} event - Event type ('weather', 'season', 'timeOfDay', 'all')
   * @param {function} callback - Callback function
   */
  addEventListener(event, callback) {
    this.listeners.push({ event, callback });
  }
  
  /**
   * Remove an event listener
   * @param {function} callback - Callback function to remove
   */
  removeEventListener(callback) {
    this.listeners = this.listeners.filter(listener => listener.callback !== callback);
  }
  
  /**
   * Notify listeners of changes
   * @param {string} event - Event type
   * @param {Object} data - Event data
   * @private
   */
  _notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      if (listener.event === event || listener.event === 'all') {
        listener.callback(event, data);
      }
    });
  }
}

// Create and export singleton
const weatherSystem = new WeatherSystem();

export default weatherSystem;

// Also export constants for reference
export {
  WEATHER_CONDITIONS,
  SEASONS,
  TIME_OF_DAY
}; 