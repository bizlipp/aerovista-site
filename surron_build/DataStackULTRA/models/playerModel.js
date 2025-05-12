import { getDefaultInstance } from '../index.js';

const ds = getDefaultInstance();

const schema = {
  type: 'object',
  required: ['level', 'xp', 'currency'],
  properties: {
    level: { type: 'integer', minimum: 1, default: 1 },
    xp: { type: 'integer', minimum: 0 },
    currency: { type: 'number', minimum: 0 },
    inventory: { type: 'array', default: [] },
    relationships: {
      type: 'object',
      default: {},
      properties: {
        charlie: { type: 'integer', minimum: 0, maximum: 10 },
        billy: { type: 'integer', minimum: 0, maximum: 10 },
        tbd: { type: 'integer', minimum: 0, maximum: 10 }
      }
    }
  }
};

// Create and export the PlayerModel with set method
export const PlayerModel = {
  ...ds.createModel('player', schema, {
    keyPrefix: 'player:'
  }),
  
  // Add a set method that will create or update an instance
  async set(id, data) {
    const key = `player:${id}`;
    try {
      // Check if already exists
      const existing = await ds.get(key, null);
      
      if (existing) {
        // Update existing data
        const merged = { ...existing, ...data };
        await ds.set(key, merged);
        return { id, ...merged };
      } else {
        // Create new instance
        await ds.set(key, data);
        return { id, ...data };
      }
    } catch (error) {
      console.error(`Error setting player model ${id}:`, error);
      throw error;
    }
  }
}; 