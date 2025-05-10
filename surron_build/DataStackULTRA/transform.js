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
 * Transform Manager for DataStackULTRA
 * Handles data transformations for serialization/deserialization
 */
class TransformManager {
  constructor(config) {
    this.config = config;
    this.pipelines = new Map();
    
    // Register built-in transform pipelines
    this.registerDefaultPipelines();
  }
  
  /**
   * Register built-in pipelines
   */
  registerDefaultPipelines() {
    // JSON serialization pipeline
    this.registerPipeline('json', [
      {
        name: 'stringify',
        transform: (data) => JSON.stringify(data),
        reverse: (data) => {
          try {
            return JSON.parse(data);
          } catch (e) {
            console.error('JSON parse error:', e);
            return data; // Return original if parse fails
          }
        }
      }
    ]);
    
    // Compression (simple)
    this.registerPipeline('compress', [
      {
        name: 'compress',
        transform: (data) => {
          if (typeof data !== 'string') {
            data = JSON.stringify(data);
          }
          // Very simple compression (just a placeholder)
          return `compressed:${data}`;
        },
        reverse: (data) => {
          if (typeof data === 'string' && data.startsWith('compressed:')) {
            const decompressed = data.substring(11);
            try {
              return JSON.parse(decompressed);
            } catch (e) {
              return decompressed;
            }
          }
          return data;
        }
      }
    ]);
  }
  
  /**
   * Register a transform pipeline
   * @param {string} name - Pipeline name
   * @param {Array} steps - Pipeline steps
   * @returns {boolean} - Success status
   */
  registerPipeline(name, steps) {
    if (!name || typeof name !== 'string') {
      console.error('Pipeline name must be a non-empty string');
      return false;
    }
    
    if (!Array.isArray(steps) || steps.length === 0) {
      console.error('Pipeline steps must be a non-empty array');
      return false;
    }
    
    this.pipelines.set(name, steps);
    return true;
  }
  
  /**
   * Apply a transform to data
   * @param {*} data - Data to transform
   * @param {string|Object} pipeline - Pipeline name or pipeline object
   * @param {boolean} reverse - Whether to apply reverse transform
   * @returns {*} - Transformed data
   */
  transform(data, pipeline, reverse = false) {
    let pipelineSteps;
    
    if (typeof pipeline === 'string') {
      pipelineSteps = this.pipelines.get(pipeline);
      if (!pipelineSteps) {
        console.error(`Transform pipeline '${pipeline}' not found`);
        return data;
      }
    } else if (Array.isArray(pipeline)) {
      pipelineSteps = pipeline;
    } else if (typeof pipeline === 'object' && pipeline !== null) {
      pipelineSteps = [pipeline];
    } else {
      console.error('Invalid pipeline specification');
      return data;
    }
    
    let result = data;
    
    // Apply each step in the pipeline
    if (reverse) {
      // Apply steps in reverse order
      for (let i = pipelineSteps.length - 1; i >= 0; i--) {
        const step = pipelineSteps[i];
        if (typeof step.reverse === 'function') {
          try {
            result = step.reverse(result);
          } catch (e) {
            console.error(`Error in reverse transform step ${step.name || i}:`, e);
          }
        }
      }
    } else {
      // Apply steps in normal order
      for (let i = 0; i < pipelineSteps.length; i++) {
        const step = pipelineSteps[i];
        if (typeof step.transform === 'function') {
          try {
            result = step.transform(result);
          } catch (e) {
            console.error(`Error in transform step ${step.name || i}:`, e);
          }
        }
      }
    }
    
    return result;
  }
  
  /**
   * Create a mapper for transforming data according to a schema
   * @param {Object} schema - Schema to map data against
   * @returns {Object} - Data mapper
   */
  createMapper(schema) {
    // Return a simple mapper object
    return {
      /**
       * Map data from one format to another
       * @param {Object} data - Data to map
       * @param {Object} options - Mapping options
       * @returns {Object} - Mapped data
       */
      map: (data, options = {}) => {
        if (!data || typeof data !== 'object') {
          return data;
        }
        
        const result = {};
        
        // If schema has properties, map according to schema
        if (schema.properties) {
          for (const [key, propSchema] of Object.entries(schema.properties)) {
            if (data[key] !== undefined) {
              result[key] = data[key];
            } else if (propSchema.default !== undefined) {
              result[key] = propSchema.default;
            }
          }
          
          return result;
        }
        
        // If no schema properties, return data as is
        return data;
      }
    };
  }
}

export default TransformManager; 