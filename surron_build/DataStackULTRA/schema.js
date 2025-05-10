/**
 * Schema Manager for DataStackULTRA
 * Provides simple schema validation for data
 */
class SchemaManager {
  constructor(config) {
    this.config = config;
    this.schemas = new Map();
    this.enabled = config.schema.validationEnabled;
  }
  
  /**
   * Register a schema for validation
   * @param {string} name - Schema name
   * @param {Object} schema - Schema definition
   * @returns {boolean} - Success status
   */
  registerSchema(name, schema) {
    if (!name || typeof name !== 'string') {
      console.error('Schema name must be a non-empty string');
      return false;
    }
    
    if (!schema || typeof schema !== 'object') {
      console.error('Schema must be an object');
      return false;
    }
    
    this.schemas.set(name, schema);
    return true;
  }
  
  /**
   * Register common schemas
   */
  registerCommonSchemas() {
    // Register basic schemas
    this.registerSchema('string', {
      type: 'string'
    });
    
    this.registerSchema('number', {
      type: 'number'
    });
    
    this.registerSchema('boolean', {
      type: 'boolean'
    });
    
    this.registerSchema('array', {
      type: 'array'
    });
    
    this.registerSchema('object', {
      type: 'object'
    });
    
    // Register more complex schemas
    this.registerSchema('id', {
      type: 'string',
      pattern: '^[a-zA-Z0-9_-]+$'
    });
    
    this.registerSchema('email', {
      type: 'string',
      format: 'email'
    });
    
    this.registerSchema('url', {
      type: 'string',
      format: 'uri'
    });
    
    this.registerSchema('date', {
      type: 'string',
      format: 'date-time'
    });
  }
  
  /**
   * Validate data against a schema
   * @param {*} data - Data to validate
   * @param {string|Object} schema - Schema name or schema object
   * @returns {Object} - Validation result
   */
  validate(data, schema) {
    if (!this.enabled) {
      return { isValid: true, errors: [], validatedData: null };
    }
    
    let schemaObj;
    
    if (typeof schema === 'string') {
      schemaObj = this.schemas.get(schema);
      if (!schemaObj) {
        console.error(`Schema '${schema}' not found`);
        return { isValid: false, errors: [`Schema '${schema}' not found`], validatedData: null };
      }
    } else if (typeof schema === 'object') {
      schemaObj = schema;
    } else {
      console.error('Schema must be a string or object');
      return { isValid: false, errors: ['Invalid schema specification'], validatedData: null };
    }
    
    return this.validateAgainstSchema(data, schemaObj);
  }
  
  /**
   * Check if validation is enabled
   * @returns {boolean} - Whether validation is enabled
   */
  isEnabled() {
    return this.enabled;
  }
  
  /**
   * Validate data against a schema object
   * @param {*} data - Data to validate
   * @param {Object} schema - Schema object
   * @returns {Object} - Validation result
   */
  validateAgainstSchema(data, schema) {
    const errors = [];
    let validatedData = null;
    
    // Check type
    if (schema.type) {
      const typeValid = this.validateType(data, schema.type);
      if (!typeValid) {
        errors.push(`Expected type ${schema.type}, got ${typeof data}`);
      }
    }
    
    // Check required properties
    if (schema.required && Array.isArray(schema.required) && typeof data === 'object') {
      for (const prop of schema.required) {
        if (data[prop] === undefined) {
          errors.push(`Missing required property: ${prop}`);
        }
      }
    }
    
    // Check properties
    if (schema.properties && typeof data === 'object') {
      validatedData = {};
      
      for (const [prop, propSchema] of Object.entries(schema.properties)) {
        if (data[prop] !== undefined) {
          const propValidation = this.validateAgainstSchema(data[prop], propSchema);
          
          if (!propValidation.isValid) {
            errors.push(...propValidation.errors.map(err => `${prop}: ${err}`));
          }
          
          validatedData[prop] = propValidation.validatedData || data[prop];
        } else if (propSchema.default !== undefined) {
          // Use default value
          validatedData[prop] = propSchema.default;
        }
      }
    }
    
    // Check pattern
    if (schema.pattern && typeof data === 'string') {
      const pattern = new RegExp(schema.pattern);
      if (!pattern.test(data)) {
        errors.push(`String does not match pattern: ${schema.pattern}`);
      }
    }
    
    // Check minimum/maximum for numbers
    if (typeof data === 'number') {
      if (schema.minimum !== undefined && data < schema.minimum) {
        errors.push(`Value ${data} is less than minimum ${schema.minimum}`);
      }
      
      if (schema.maximum !== undefined && data > schema.maximum) {
        errors.push(`Value ${data} is greater than maximum ${schema.maximum}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      validatedData: errors.length === 0 ? (validatedData || data) : null
    };
  }
  
  /**
   * Validate value type
   * @param {*} value - Value to validate
   * @param {string} type - Expected type
   * @returns {boolean} - Whether type is valid
   */
  validateType(value, type) {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'array':
        return Array.isArray(value);
      case 'integer':
        return Number.isInteger(value);
      case 'null':
        return value === null;
      default:
        return false;
    }
  }
}

export default SchemaManager; 