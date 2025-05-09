/**
 * DataStackULTRA Transform Module
 * Provides data transformation capabilities
 */

import { createConfig } from './config.js';

/**
 * Abstract Transformer interface
 * All transformer implementations must implement these methods
 */
class Transformer {
  /**
   * Serialize data to a string
   * @param {*} data - Data to serialize
   * @param {Object} options - Serialization options
   * @returns {string} - Serialized data
   */
  serialize(data, options = {}) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Deserialize string to data
   * @param {string} serialized - Serialized data
   * @param {Object} options - Deserialization options
   * @returns {*} - Deserialized data
   */
  deserialize(serialized, options = {}) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Transform data from one format to another
   * @param {*} data - Data to transform
   * @param {Object} transformConfig - Transformation configuration
   * @returns {*} - Transformed data
   */
  transform(data, transformConfig = {}) {
    throw new Error('Method not implemented');
  }
}

/**
 * JSON Transformer implementation
 */
class JSONTransformer extends Transformer {
  /**
   * Create a new JSONTransformer
   * @param {Object} options - Transformer options
   */
  constructor(options = {}) {
    super();
    this.compactOutput = options.compactOutput !== false;
    this.reviver = options.reviver || null;
    this.replacer = options.replacer || null;
  }
  
  /**
   * Serialize data to a JSON string
   * @param {*} data - Data to serialize
   * @param {Object} options - Serialization options
   * @returns {string} - Serialized data
   */
  serialize(data, options = {}) {
    try {
      const space = (options.compact !== undefined ? options.compact : this.compactOutput) ? undefined : 2;
      const replacer = options.replacer || this.replacer;
      
      return JSON.stringify(data, replacer, space);
    } catch (error) {
      console.error('Failed to serialize data to JSON:', error);
      throw new Error(`Serialization error: ${error.message}`);
    }
  }
  
  /**
   * Deserialize JSON string to data
   * @param {string} serialized - Serialized data
   * @param {Object} options - Deserialization options
   * @returns {*} - Deserialized data
   */
  deserialize(serialized, options = {}) {
    try {
      const reviver = options.reviver || this.reviver;
      
      return JSON.parse(serialized, reviver);
    } catch (error) {
      console.error('Failed to deserialize JSON data:', error);
      throw new Error(`Deserialization error: ${error.message}`);
    }
  }
  
  /**
   * Transform data using specified operations
   * @param {*} data - Data to transform
   * @param {Object} transformConfig - Transformation configuration
   * @returns {*} - Transformed data
   */
  transform(data, transformConfig = {}) {
    // Simple implementation that allows renaming and filtering fields
    if (!data || typeof data !== 'object') {
      return data;
    }
    
    const result = Array.isArray(data) ? [] : {};
    
    // If data is an array, apply transformation to each item
    if (Array.isArray(data)) {
      return data.map(item => this.transform(item, transformConfig));
    }
    
    // Apply field renames and transformations
    const { rename, include, exclude, transform } = transformConfig;
    
    // First, determine which fields to include
    let fieldsToInclude;
    
    if (include && Array.isArray(include) && include.length > 0) {
      // Only include specified fields
      fieldsToInclude = new Set(include);
    } else if (exclude && Array.isArray(exclude) && exclude.length > 0) {
      // Include all fields except excluded ones
      fieldsToInclude = new Set(
        Object.keys(data).filter(key => !exclude.includes(key))
      );
    } else {
      // Include all fields
      fieldsToInclude = new Set(Object.keys(data));
    }
    
    // Process each field
    for (const [key, value] of Object.entries(data)) {
      // Skip if field should not be included
      if (!fieldsToInclude.has(key)) {
        continue;
      }
      
      // Get the target key (renamed or original)
      const targetKey = rename && rename[key] ? rename[key] : key;
      
      // Transform value if a transformer is specified
      const fieldTransform = transform && transform[key];
      const transformedValue = fieldTransform 
        ? (typeof fieldTransform === 'function' 
          ? fieldTransform(value, data) 
          : value) 
        : value;
      
      // Add to result
      result[targetKey] = transformedValue;
    }
    
    return result;
  }
}

/**
 * Transformer factory to create transformer instances based on configuration
 */
export class TransformerFactory {
  /**
   * Create a transformer instance based on format
   * @param {string} format - Serialization format
   * @param {Object} options - Transformer options
   * @returns {Transformer} - Transformer instance
   */
  static createTransformer(format, options = {}) {
    switch (format) {
      case 'json':
        return new JSONTransformer(options);
      case 'bson':
        // In a real implementation, this would use a BSON library
        console.warn('BSON format not implemented, using JSON');
        return new JSONTransformer(options);
      case 'protobuf':
        // In a real implementation, this would use Protocol Buffers
        console.warn('Protocol Buffers format not implemented, using JSON');
        return new JSONTransformer(options);
      case 'custom':
        if (!options.implementation) {
          throw new Error('Custom transformer requires an implementation');
        }
        return options.implementation;
      default:
        console.warn(`Invalid format: ${format}, using JSON`);
        return new JSONTransformer(options);
    }
  }
}

/**
 * Main transform manager for serialization and transformations
 */
export class TransformManager {
  /**
   * Create a new TransformManager
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.config = createConfig(options);
    
    // Create transformer
    this.transformer = TransformerFactory.createTransformer(
      this.config.transform.serializationFormat,
      {
        compactOutput: this.config.transform.compactOutput
      }
    );
    
    // Register transformation pipelines
    this.pipelines = new Map();
  }
  
  /**
   * Serialize data to a string
   * @param {*} data - Data to serialize
   * @param {Object} options - Serialization options
   * @returns {string} - Serialized data
   */
  serialize(data, options = {}) {
    return this.transformer.serialize(data, options);
  }
  
  /**
   * Deserialize string to data
   * @param {string} serialized - Serialized data
   * @param {Object} options - Deserialization options
   * @returns {*} - Deserialized data
   */
  deserialize(serialized, options = {}) {
    return this.transformer.deserialize(serialized, options);
  }
  
  /**
   * Transform data using a specific transformation config
   * @param {*} data - Data to transform
   * @param {Object|string} transformConfig - Transformation configuration or pipeline name
   * @returns {*} - Transformed data
   */
  transform(data, transformConfig) {
    if (typeof transformConfig === 'string') {
      const pipeline = this.pipelines.get(transformConfig);
      if (!pipeline) {
        throw new Error(`Transform pipeline '${transformConfig}' not found`);
      }
      return this._applyPipeline(data, pipeline);
    }
    
    return this.transformer.transform(data, transformConfig);
  }
  
  /**
   * Register a transformation pipeline
   * @param {string} name - Pipeline name
   * @param {Array|Object} pipeline - Transformation pipeline or config
   * @returns {boolean} - Success status
   */
  registerPipeline(name, pipeline) {
    if (!name || typeof name !== 'string') {
      throw new Error('Pipeline name must be a non-empty string');
    }
    
    if (!pipeline) {
      throw new Error('Pipeline configuration is required');
    }
    
    // Convert single transformation to a pipeline
    const normalizedPipeline = Array.isArray(pipeline) ? pipeline : [pipeline];
    
    this.pipelines.set(name, normalizedPipeline);
    return true;
  }
  
  /**
   * Apply a transformation pipeline to data
   * @private
   * @param {*} data - Data to transform
   * @param {Array} pipeline - Transformation pipeline
   * @returns {*} - Transformed data
   */
  _applyPipeline(data, pipeline) {
    return pipeline.reduce((result, config) => {
      return this.transformer.transform(result, config);
    }, data);
  }
  
  /**
   * Clone data by serializing and deserializing it
   * @param {*} data - Data to clone
   * @returns {*} - Cloned data
   */
  clone(data) {
    const serialized = this.serialize(data);
    return this.deserialize(serialized);
  }
  
  /**
   * Create a data mapper for a specific schema
   * @param {Object} schema - Schema to map to
   * @returns {Function} - Mapper function
   */
  createMapper(schema) {
    return (sourceData) => {
      if (!sourceData || typeof sourceData !== 'object') {
        return sourceData;
      }
      
      const result = {};
      
      // Map the fields according to the schema
      for (const [targetField, fieldDef] of Object.entries(schema)) {
        if (typeof fieldDef === 'string') {
          // Simple mapping: targetField <- sourceField
          result[targetField] = sourceData[fieldDef];
        } else if (typeof fieldDef === 'function') {
          // Function mapping: targetField <- fn(sourceData)
          result[targetField] = fieldDef(sourceData);
        } else if (fieldDef && typeof fieldDef === 'object') {
          // Object mapping with source field and transformation
          const { field, transform, default: defaultValue } = fieldDef;
          
          let value = field ? sourceData[field] : undefined;
          
          if (value === undefined && defaultValue !== undefined) {
            value = defaultValue;
          }
          
          if (transform && typeof transform === 'function') {
            value = transform(value, sourceData);
          }
          
          result[targetField] = value;
        }
      }
      
      return result;
    };
  }
  
  /**
   * Get the transformer instance
   * @returns {Transformer} - Transformer instance
   */
  getTransformer() {
    return this.transformer;
  }
}

export default TransformManager; 