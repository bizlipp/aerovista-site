// locationSlice.js
import { createSlice } from '../toolkit.js';

const initialState = {
  locations: {
    workshop: {
      id: 'workshop',
      name: 'Charlie\'s Workshop',
      description: 'The headquarters of the Surron Squad. Always smells like motor oil and energy drinks.',
      background: 'images/backgrounds/workshop-night.jpg',
      unlocked: true,
      discovered: true,
      visited: false
    },
    'tubbs-hill': {
      id: 'tubbs-hill',
      name: 'Tubbs Hill',
      description: 'A popular trail with steep descents and technical sections. Perfect for testing bike mods.',
      background: 'images/backgrounds/tubbs-hill-trail.jpg',
      unlocked: false,
      discovered: true,
      visited: false
    },
    downtown: {
      id: 'downtown',
      name: 'Downtown CDA',
      description: 'The downtown area with shops, bars, and plenty of curious onlookers.',
      background: 'images/backgrounds/downtown-cda.jpg',
      unlocked: false,
      discovered: true,
      visited: false
    },
    lakefront: {
      id: 'lakefront',
      name: 'Lake Coeur d\'Alene',
      description: 'The beautiful lakefront with beaches, boats, and mysterious electrical readings.',
      background: 'images/backgrounds/lakefront.jpg',
      unlocked: false,
      discovered: false,
      visited: false
    },
    'downtown-garage': {
      id: 'downtown-garage',
      name: 'TBD\'s Secret Garage',
      description: 'A hidden workshop where TBD develops his most advanced tech.',
      background: 'images/backgrounds/secret-garage.jpg',
      unlocked: false,
      discovered: false,
      visited: false
    }
  }
};

export const locationSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {
    // Unlock a location
    unlockLocation: (state, action) => {
      const locationId = action.payload;
      if (state.locations[locationId]) {
        state.locations[locationId].unlocked = true;
        state.locations[locationId].discovered = true;
      }
    },
    
    // Mark a location as visited
    visitLocation: (state, action) => {
      const locationId = action.payload;
      if (state.locations[locationId]) {
        state.locations[locationId].visited = true;
      }
    },
    
    // Discover a location (make it visible on the map, but not necessarily unlocked)
    discoverLocation: (state, action) => {
      const locationId = action.payload;
      if (state.locations[locationId]) {
        state.locations[locationId].discovered = true;
      }
    },
    
    // Add a new location
    addLocation: (state, action) => {
      const location = action.payload;
      state.locations[location.id] = {
        ...location,
        unlocked: location.unlocked || false,
        discovered: location.discovered || false,
        visited: location.visited || false
      };
    },
    
    // Lock a location (make it inaccessible)
    lockLocation: (state, action) => {
      const locationId = action.payload;
      if (state.locations[locationId]) {
        state.locations[locationId].unlocked = false;
      }
    }
  }
});

// Export the actions
export const {
  unlockLocation,
  visitLocation,
  discoverLocation,
  addLocation,
  lockLocation
} = locationSlice.actions;

// Export the reducer
export default locationSlice.reducer; 