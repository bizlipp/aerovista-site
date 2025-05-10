/**
 * DataStackULTRA
 * Comprehensive data management system with storage, validation, and transformations
 */

import { createConfig, DEFAULT_CONFIG } from './config.js';
import StorageManager from './storage.js';
import SchemaManager from './schema.js';
import TransformManager from './transform.js';

/**
 * Main DataStack class that integrates storage, schema validation, and transformations
 */
export class DataStack {
  /**
   * Create a new DataStack instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.config = createConfig(options);
    
    // Initialize components
    this.storage = new StorageManager(this.config);
    this.schema = new SchemaManager(this.config);
    this.transform = new TransformManager(this.config);
    
    // Register common schemas if validation is enabled
    if (this.config.schema.validationEnabled) {
      this.schema.registerCommonSchemas();
    }
  }
  
  /**
   * Store data with optional validation and transformation
   * @param {string} key - Storage key
   * @param {*} data - Data to store
   * @param {Object} options - Storage options
   * @param {string|Object} options.schema - Schema to validate against
   * @param {string|Object} options.transform - Transform to apply
   * @returns {Promise<boolean>} - Success status
   */
  async set(key, data, options = {}) {
    let valueToStore = data;
    
    // Apply transformation if specified
    if (options.transform) {
      valueToStore = this.transform.transform(valueToStore, options.transform);
    }
    
    // Validate data if schema is specified
    if (options.schema && this.schema.isEnabled()) {
      const validation = this.schema.validate(valueToStore, options.schema);
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
      
      // Use validated data if available (with type coercion)
      if (validation.validatedData !== null) {
        valueToStore = validation.validatedData;
      }
    }
    
    // Store data
    return this.storage.set(key, valueToStore, options);
  }
  
  /**
   * Retrieve data with optional transformation
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if not found
   * @param {Object} options - Retrieval options
   * @param {string|Object} options.transform - Transform to apply to retrieved data
   * @returns {Promise<*>} - Retrieved data
   */
  async get(key, defaultValue = null, options = {}) {
    // Retrieve data from storage
    const value = await this.storage.get(key, defaultValue);
    
    // Return default value if not found
    if (value === defaultValue) {
      return defaultValue;
    }
    
    // Apply transformation if specified
    if (options.transform) {
      return this.transform.transform(value, options.transform);
    }
    
    return value;
  }
  
  /**
   * Check if a key exists in storage
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} - Whether the key exists
   */
  async has(key) {
    return this.storage.has(key);
  }
  
  /**
   * Remove data from storage
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} - Success status
   */
  async remove(key) {
    return this.storage.remove(key);
  }
  
  /**
   * Clear all data from storage
   * @returns {Promise<boolean>} - Success status
   */
  async clear() {
    return this.storage.clear();
  }
  
  /**
   * Get all keys in storage
   * @returns {Promise<Array<string>>} - Array of keys
   */
  async keys() {
    return this.storage.keys();
  }
  
  /**
   * Get the number of items in storage
   * @returns {Promise<number>} - Number of items
   */
  async size() {
    return this.storage.size();
  }
  
  /**
   * Register a schema for validation
   * @param {string} name - Schema name
   * @param {Object} schema - Schema definition
   * @returns {boolean} - Success status
   */
  registerSchema(name, schema) {
    return this.schema.registerSchema(name, schema);
  }
  
  /**
   * Register a transform pipeline
   * @param {string} name - Pipeline name
   * @param {Array|Object} pipeline - Transform pipeline
   * @returns {boolean} - Success status
   */
  registerTransform(name, pipeline) {
    return this.transform.registerPipeline(name, pipeline);
  }
  
  /**
   * Create a model with schema validation and storage
   * @param {string} name - Model name
   * @param {Object} schema - Model schema
   * @param {Object} options - Model options
   * @returns {Object} - Model methods
   */
  createModel(name, schema, options = {}) {
    if (!name || typeof name !== 'string') {
      throw new Error('Model name must be a non-empty string');
    }
    
    if (!schema || typeof schema !== 'object') {
      throw new Error('Model schema must be an object');
    }
    
    // Register the schema
    this.registerSchema(name, schema);
    
    // Generate key prefix for this model
    const keyPrefix = options.keyPrefix || `model:${name}:`;
    
    // Create mapper for data transformation
    const mapper = this.transform.createMapper(schema);
    
    // Store reference to parent DataStack instance
    const dataStackInstance = this;
    
    // Return model methods
    return {
      /**
       * Create a new model instance
       * @param {string} id - Instance ID
       * @param {Object} data - Instance data
       * @returns {Promise<Object>} - Created instance
       */
      async create(id, data) {
        const key = `${keyPrefix}${id}`;
        
        // Check if already exists
        if (await dataStackInstance.has(id)) {
          throw new Error(`Model instance with ID ${id} already exists`);
        }
        
        // Validate and store
        await dataStackInstance.set(key, data, { schema: name });
        
        return { id, ...data };
      },
      
      /**
       * Get a model instance
       * @param {string} id - Instance ID
       * @returns {Promise<Object|null>} - Instance data or null if not found
       */
      async get(id) {
        const key = `${keyPrefix}${id}`;
        const data = await dataStackInstance.get(key, null);
        
        if (data === null) {
          return null;
        }
        
        return { id, ...data };
      },
      
      /**
       * Update a model instance
       * @param {string} id - Instance ID
       * @param {Object} data - New data (partial update)
       * @returns {Promise<Object>} - Updated instance
       */
      async update(id, data) {
        const key = `${keyPrefix}${id}`;
        
        // Get existing data
        const existing = await dataStackInstance.get(key, null);
        
        if (existing === null) {
          throw new Error(`Model instance with ID ${id} not found`);
        }
        
        // Merge with existing data
        const merged = { ...existing, ...data };
        
        // Validate and store
        await dataStackInstance.set(key, merged, { schema: name });
        
        return { id, ...merged };
      },
      
      /**
       * Delete a model instance
       * @param {string} id - Instance ID
       * @returns {Promise<boolean>} - Success status
       */
      async delete(id) {
        const key = `${keyPrefix}${id}`;
        return dataStackInstance.remove(key);
      },
      
      /**
       * Get all model instances
       * @returns {Promise<Array<Object>>} - Array of instances
       */
      async getAll() {
        const allKeys = await dataStackInstance.keys();
        const modelKeys = allKeys.filter(key => key.startsWith(keyPrefix));
        
        const instances = [];
        
        for (const key of modelKeys) {
          const id = key.slice(keyPrefix.length);
          const data = await dataStackInstance.get(key, null);
          
          if (data !== null) {
            instances.push({ id, ...data });
          }
        }
        
        return instances;
      },
      
      /**
       * Map data to model schema
       * @param {Object} data - Data to map
       * @returns {Object} - Mapped data
       */
      map(data) {
        return mapper(data);
      },
      
      /**
       * Validate data against model schema
       * @param {Object} data - Data to validate
       * @returns {Object} - Validation result
       */
      validate(data) {
        return dataStackInstance.schema.validate(data, name);
      }
    };
  }
  
  /**
   * Get the storage manager
   * @returns {StorageManager} - Storage manager
   */
  getStorageManager() {
    return this.storage;
  }
  
  /**
   * Get the schema manager
   * @returns {SchemaManager} - Schema manager
   */
  getSchemaManager() {
    return this.schema;
  }
  
  /**
   * Get the transform manager
   * @returns {TransformManager} - Transform manager
   */
  getTransformManager() {
    return this.transform;
  }
}

// Export components
export { StorageManager, SchemaManager, TransformManager, createConfig, DEFAULT_CONFIG };

// Default instance
let defaultInstance = null;

/**
 * Get the default DataStack instance
 * @param {Object} options - Configuration options
 * @returns {DataStack} - DataStack instance
 */
export function getDefaultInstance(options = {}) {
  if (!defaultInstance) {
    defaultInstance = new DataStack(options);
  }
  return defaultInstance;
}

/**
 * Create a new DataStack instance
 * @param {Object} options - Configuration options
 * @returns {DataStack} - DataStack instance
 */
export function createDataStack(options = {}) {
  return new DataStack(options);
}

export default {
  DataStack,
  StorageManager,
  SchemaManager,
  TransformManager,
  createConfig,
  DEFAULT_CONFIG,
  getDefaultInstance,
  createDataStack
}; 