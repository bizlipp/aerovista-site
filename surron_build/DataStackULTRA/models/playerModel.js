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

export const PlayerModel = ds.createModel('player', schema, {
  keyPrefix: 'player:'
}); 