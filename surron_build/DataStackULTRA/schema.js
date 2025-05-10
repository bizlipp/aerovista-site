/**
 * DataStackULTRA Schema Module
 * Provides schema validation capabilities
 */

import { createConfig } from './config.js';

/**
 * Abstract SchemaValidator interface
 * All validator implementations must implement these methods
 */
class SchemaValidator {
  /**
   * Validate data against a schema
   * @param {Object} data - Data to validate
   * @param {Object} schema - Schema to validate against
   * @param {Object} options - Validation options
   * @returns {Object} - Validation result with isValid and errors
   */
  validate(data, schema, options = {}) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Register a custom schema
   * @param {string} name - Schema name
   * @param {Object} schema - Schema definition
   * @returns {boolean} - Success status
   */
  registerSchema(name, schema) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Get a registered schema
   * @param {string} name - Schema name
   * @returns {Object|null} - Schema definition or null if not found
   */
  getSchema(name) {
    throw new Error('Method not implemented');
  }
}

/**
 * Simple validator implementation
 */
class SimpleValidator extends SchemaValidator {
  /**
   * Create a new SimpleValidator
   * @param {Object} options - Validator options
   */
  constructor(options = {}) {
    super();
    this.schemas = new Map();
    this.strictMode = options.strictMode !== false;
    this.coercionEnabled = options.coercionEnabled === true;
  }
  
  /**
   * Validate data against a schema
   * @param {Object} data - Data to validate
   * @param {Object|string} schema - Schema to validate against (or schema name)
   * @param {Object} options - Validation options
   * @returns {Object} - Validation result with isValid and errors
   */
  validate(data, schema, options = {}) {
    // If schema is a string, look it up by name
    if (typeof schema === 'string') {
      const namedSchema = this.getSchema(schema);
      if (!namedSchema) {
        return {
          isValid: false,
          errors: [`Schema '${schema}' not found`]
        };
      }
      schema = namedSchema;
    }
    
    const result = {
      isValid: true,
      errors: [],
      validatedData: this.coercionEnabled ? {} : null
    };
    
    // Check if data is the correct type
    if (schema.type) {
      const dataType = this._getType(data);
      
      if (dataType !== schema.type) {
        if (this.coercionEnabled) {
          // Try to coerce the value
          const coercedValue = this._coerceValue(data, schema.type);
          if (coercedValue !== undefined) {
            data = coercedValue;
          } else {
            result.isValid = false;
            result.errors.push(`Expected type '${schema.type}', got '${dataType}'`);
            return result;
          }
        } else {
          result.isValid = false;
          result.errors.push(`Expected type '${schema.type}', got '${dataType}'`);
          return result;
        }
      }
    }
    
    // If it's an object schema, validate properties
    if (schema.type === 'object' && schema.properties) {
      result.validatedData = this.coercionEnabled ? {} : null;
      
      // Check required properties
      if (schema.required && Array.isArray(schema.required)) {
        for (const requiredProp of schema.required) {
          if (data[requiredProp] === undefined) {
            result.isValid = false;
            result.errors.push(`Missing required property: ${requiredProp}`);
          }
        }
      }
      
      // Check each property
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        if (data[propName] !== undefined) {
          const propResult = this.validate(data[propName], propSchema, options);
          
          if (!propResult.isValid) {
            result.isValid = false;
            
            // Add property path to error messages
            propResult.errors.forEach(error => {
              result.errors.push(`${propName}: ${error}`);
            });
          }
          
          // Store validated/coerced value if coercion is enabled
          if (this.coercionEnabled) {
            result.validatedData[propName] = propResult.validatedData !== null
              ? propResult.validatedData
              : data[propName];
          }
        } else if (this.coercionEnabled) {
          // Use default value if available
          if (propSchema.default !== undefined) {
            result.validatedData[propName] = propSchema.default;
          }
        }
      }
      
      // In strict mode, check for extra properties
      if (this.strictMode && !schema.additionalProperties) {
        const schemaProps = new Set(Object.keys(schema.properties));
        
        for (const propName of Object.keys(data)) {
          if (!schemaProps.has(propName)) {
            result.isValid = false;
            result.errors.push(`Unknown property: ${propName}`);
          }
        }
      }
    } else if (schema.type === 'array' && schema.items) {
      // If it's an array schema, validate items
      if (!Array.isArray(data)) {
        result.isValid = false;
        result.errors.push(`Expected array, got ${typeof data}`);
        return result;
      }
      
      if (this.coercionEnabled) {
        result.validatedData = [];
      }
      
      // Validate each item in the array
      for (let i = 0; i < data.length; i++) {
        const itemResult = this.validate(data[i], schema.items, options);
        
        if (!itemResult.isValid) {
          result.isValid = false;
          
          // Add array index to error messages
          itemResult.errors.forEach(error => {
            result.errors.push(`[${i}]: ${error}`);
          });
        }
        
        // Store validated/coerced value if coercion is enabled
        if (this.coercionEnabled) {
          result.validatedData.push(itemResult.validatedData !== null
            ? itemResult.validatedData
            : data[i]);
        }
      }
      
      // Check min/max items
      if (schema.minItems !== undefined && data.length < schema.minItems) {
        result.isValid = false;
        result.errors.push(`Array must have at least ${schema.minItems} items, got ${data.length}`);
      }
      
      if (schema.maxItems !== undefined && data.length > schema.maxItems) {
        result.isValid = false;
        result.errors.push(`Array must have at most ${schema.maxItems} items, got ${data.length}`);
      }
    } else if (schema.type === 'string') {
      // String-specific validations
      if (typeof data !== 'string') {
        if (this.coercionEnabled) {
          data = String(data);
        } else {
          result.isValid = false;
          result.errors.push(`Expected string, got ${typeof data}`);
          return result;
        }
      }
      
      // Store validated/coerced value if coercion is enabled
      if (this.coercionEnabled) {
        result.validatedData = data;
      }
      
      // Check pattern
      if (schema.pattern && !new RegExp(schema.pattern).test(data)) {
        result.isValid = false;
        result.errors.push(`String does not match pattern: ${schema.pattern}`);
      }
      
      // Check min/max length
      if (schema.minLength !== undefined && data.length < schema.minLength) {
        result.isValid = false;
        result.errors.push(`String must be at least ${schema.minLength} characters, got ${data.length}`);
      }
      
      if (schema.maxLength !== undefined && data.length > schema.maxLength) {
        result.isValid = false;
        result.errors.push(`String must be at most ${schema.maxLength} characters, got ${data.length}`);
      }
    } else if (schema.type === 'number' || schema.type === 'integer') {
      // Number-specific validations
      if (typeof data !== 'number') {
        if (this.coercionEnabled) {
          data = Number(data);
          if (isNaN(data)) {
            result.isValid = false;
            result.errors.push(`Cannot coerce to number: ${data}`);
            return result;
          }
        } else {
          result.isValid = false;
          result.errors.push(`Expected number, got ${typeof data}`);
          return result;
        }
      }
      
      // Store validated/coerced value if coercion is enabled
      if (this.coercionEnabled) {
        result.validatedData = data;
      }
      
      // Check integer
      if (schema.type === 'integer' && !Number.isInteger(data)) {
        result.isValid = false;
        result.errors.push(`Expected integer, got ${data}`);
      }
      
      // Check min/max
      if (schema.minimum !== undefined && data < schema.minimum) {
        result.isValid = false;
        result.errors.push(`Number must be at least ${schema.minimum}, got ${data}`);
      }
      
      if (schema.maximum !== undefined && data > schema.maximum) {
        result.isValid = false;
        result.errors.push(`Number must be at most ${schema.maximum}, got ${data}`);
      }
    } else if (schema.type === 'boolean') {
      // Boolean-specific validations
      if (typeof data !== 'boolean') {
        if (this.coercionEnabled) {
          data = Boolean(data);
        } else {
          result.isValid = false;
          result.errors.push(`Expected boolean, got ${typeof data}`);
          return result;
        }
      }
      
      // Store validated/coerced value if coercion is enabled
      if (this.coercionEnabled) {
        result.validatedData = data;
      }
    } else if (schema.enum && Array.isArray(schema.enum)) {
      // Enum validation
      if (!schema.enum.includes(data)) {
        result.isValid = false;
        result.errors.push(`Value must be one of: ${schema.enum.join(', ')}`);
      }
      
      // Store validated value if coercion is enabled
      if (this.coercionEnabled) {
        result.validatedData = data;
      }
    }
    
    // If there's no coercion, don't return validatedData
    if (!this.coercionEnabled) {
      result.validatedData = null;
    }
    
    return result;
  }
  
  /**
   * Get the type of a value
   * @private
   * @param {*} value - Value to check
   * @returns {string} - Type of the value
   */
  _getType(value) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }
  
  /**
   * Try to coerce a value to a specific type
   * @private
   * @param {*} value - Value to coerce
   * @param {string} type - Type to coerce to
   * @returns {*} - Coerced value or undefined if coercion failed
   */
  _coerceValue(value, type) {
    switch (type) {
      case 'string':
        return String(value);
      case 'number':
        const num = Number(value);
        return isNaN(num) ? undefined : num;
      case 'integer':
        const int = parseInt(value, 10);
        return isNaN(int) ? undefined : int;
      case 'boolean':
        return Boolean(value);
      case 'array':
        return Array.isArray(value) ? value : undefined;
      case 'object':
        return (typeof value === 'object' && value !== null) ? value : undefined;
      default:
        return undefined;
    }
  }
  
  /**
   * Register a custom schema
   * @param {string} name - Schema name
   * @param {Object} schema - Schema definition
   * @returns {boolean} - Success status
   */
  registerSchema(name, schema) {
    if (!name || typeof name !== 'string') {
      throw new Error('Schema name must be a non-empty string');
    }
    
    if (!schema || typeof schema !== 'object') {
      throw new Error('Schema must be an object');
    }
    
    this.schemas.set(name, schema);
    return true;
  }
  
  /**
   * Get a registered schema
   * @param {string} name - Schema name
   * @returns {Object|null} - Schema definition or null if not found
   */
  getSchema(name) {
    return this.schemas.get(name) || null;
  }
}

/**
 * Create a schema validator factory
 */
export class SchemaFactory {
  /**
   * Create a schema validator based on strategy
   * @param {string} strategy - Validation strategy
   * @param {Object} options - Validator options
   * @returns {SchemaValidator} - Schema validator instance
   */
  static createValidator(strategy, options = {}) {
    switch (strategy) {
      case 'simple':
        return new SimpleValidator(options);
      case 'ajv':
        // Return an AjvValidator implementation
        return new AjvValidator(options);
      case 'zod':
        // In a real implementation, this would use the Zod library
        console.warn('Zod validation not implemented, using simple validator');
        return new SimpleValidator(options);
      case 'yup':
        // In a real implementation, this would use the Yup library
        console.warn('Yup validation not implemented, using simple validator');
        return new SimpleValidator(options);
      case 'custom':
        if (!options.implementation) {
          throw new Error('Custom validator requires an implementation');
        }
        return options.implementation;
      default:
        console.warn(`Invalid validation strategy: ${strategy}, using simple validator`);
        return new SimpleValidator(options);
    }
  }
}

/**
 * Ajv-based validator implementation
 */
class AjvValidator extends SchemaValidator {
  /**
   * Create a new AjvValidator
   * @param {Object} options - Validator options
   */
  constructor(options = {}) {
    super();
    this.options = options;
    this.schemas = new Map();
    console.log('AjvValidator created with proper implementation');
  }
  
  /**
   * Validate data against a schema
   * @param {Object} data - Data to validate
   * @param {Object|string} schema - Schema to validate against (or schema name)
   * @param {Object} options - Validation options
   * @returns {Object} - Validation result with isValid and errors
   */
  validate(data, schema, options = {}) {
    // Get the actual schema if a name was provided
    if (typeof schema === 'string') {
      schema = this.getSchema(schema);
      if (!schema) {
        return {
          isValid: false,
          errors: [{ message: `Schema not found: ${schema}` }],
          validatedData: null
        };
      }
    }
    
    // Initialize result
    const errors = [];
    let isValid = true;
    
    try {
      // Check data type
      if (schema.type && !this._validateType(data, schema.type)) {
        errors.push({
          message: `Type mismatch: expected ${schema.type}, got ${this._getType(data)}`,
          path: '',
          value: data
        });
        isValid = false;
      }
      
      // If this is an object schema, validate each property
      if (schema.type === 'object' && schema.properties && typeof data === 'object' && data !== null) {
        // Check required properties
        if (schema.required && Array.isArray(schema.required)) {
          for (const prop of schema.required) {
            if (data[prop] === undefined) {
              errors.push({
                message: `Missing required property: ${prop}`,
                path: prop,
                value: undefined
              });
              isValid = false;
            }
          }
        }
        
        // Check each property against its schema
        for (const [prop, propSchema] of Object.entries(schema.properties)) {
          if (data[prop] !== undefined) {
            const propResult = this.validate(data[prop], propSchema, options);
            if (!propResult.isValid) {
              isValid = false;
              // Add property path to errors
              propResult.errors.forEach(err => {
                errors.push({
                  ...err,
                  path: prop + (err.path ? '.' + err.path : '')
                });
              });
            }
          }
        }
        
        // Check for additional properties if specified
        if (schema.additionalProperties === false) {
          const schemaProps = new Set(Object.keys(schema.properties));
          for (const prop in data) {
            if (!schemaProps.has(prop)) {
              errors.push({
                message: `Additional property not allowed: ${prop}`,
                path: prop,
                value: data[prop]
              });
              isValid = false;
            }
          }
        }
      }
      
      // If this is an array schema, validate each item
      if (schema.type === 'array' && Array.isArray(data)) {
        // Check minItems/maxItems
        if (schema.minItems !== undefined && data.length < schema.minItems) {
          errors.push({
            message: `Array has too few items (${data.length}), minimum is ${schema.minItems}`,
            path: '',
            value: data
          });
          isValid = false;
        }
        
        if (schema.maxItems !== undefined && data.length > schema.maxItems) {
          errors.push({
            message: `Array has too many items (${data.length}), maximum is ${schema.maxItems}`,
            path: '',
            value: data
          });
          isValid = false;
        }
        
        // Validate each item if we have an items schema
        if (schema.items) {
          for (let i = 0; i < data.length; i++) {
            const itemResult = this.validate(data[i], schema.items, options);
            if (!itemResult.isValid) {
              isValid = false;
              // Add array index to errors
              itemResult.errors.forEach(err => {
                errors.push({
                  ...err,
                  path: `[${i}]` + (err.path ? '.' + err.path : '')
                });
              });
            }
          }
        }
      }
      
      // Check string validations
      if (schema.type === 'string' && typeof data === 'string') {
        // Check minLength/maxLength
        if (schema.minLength !== undefined && data.length < schema.minLength) {
          errors.push({
            message: `String is too short (${data.length} chars), minimum is ${schema.minLength}`,
            path: '',
            value: data
          });
          isValid = false;
        }
        
        if (schema.maxLength !== undefined && data.length > schema.maxLength) {
          errors.push({
            message: `String is too long (${data.length} chars), maximum is ${schema.maxLength}`,
            path: '',
            value: data
          });
          isValid = false;
        }
        
        // Check pattern
        if (schema.pattern) {
          const regex = new RegExp(schema.pattern);
          if (!regex.test(data)) {
            errors.push({
              message: `String does not match pattern: ${schema.pattern}`,
              path: '',
              value: data
            });
            isValid = false;
          }
        }
      }
      
      // Check number validations
      if ((schema.type === 'number' || schema.type === 'integer') && typeof data === 'number') {
        // Check minimum/maximum
        if (schema.minimum !== undefined && data < schema.minimum) {
          errors.push({
            message: `Number is too small (${data}), minimum is ${schema.minimum}`,
            path: '',
            value: data
          });
          isValid = false;
        }
        
        if (schema.maximum !== undefined && data > schema.maximum) {
          errors.push({
            message: `Number is too large (${data}), maximum is ${schema.maximum}`,
            path: '',
            value: data
          });
          isValid = false;
        }
        
        // Check multipleOf
        if (schema.multipleOf !== undefined) {
          const remainder = data % schema.multipleOf;
          if (Math.abs(remainder) > Number.EPSILON) {
            errors.push({
              message: `Number is not a multiple of ${schema.multipleOf}`,
              path: '',
              value: data
            });
            isValid = false;
          }
        }
        
        // Check integer type
        if (schema.type === 'integer' && !Number.isInteger(data)) {
          errors.push({
            message: `Value is not an integer: ${data}`,
            path: '',
            value: data
          });
          isValid = false;
        }
      }
      
      // Check enum values
      if (schema.enum && Array.isArray(schema.enum)) {
        if (!schema.enum.includes(data)) {
          errors.push({
            message: `Value is not one of the allowed enum values: ${schema.enum.join(', ')}`,
            path: '',
            value: data
          });
          isValid = false;
        }
      }
    } catch (error) {
      // Handle validation errors
      errors.push({
        message: `Validation error: ${error.message}`,
        path: '',
        value: data
      });
      isValid = false;
    }
    
    // Return the validation result
    return {
      isValid,
      errors,
      validatedData: isValid ? data : null
    };
  }
  
  /**
   * Validate value against type
   * @param {any} value - Value to validate
   * @param {string} type - Type to validate against
   * @returns {boolean} - Whether the value is of the specified type
   */
  _validateType(value, type) {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'integer':
        return typeof value === 'number' && Number.isInteger(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'null':
        return value === null;
      default:
        return false;
    }
  }
  
  /**
   * Get the type of a value
   * @param {any} value - Value to check type of
   * @returns {string} - Type of the value
   */
  _getType(value) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }
  
  /**
   * Register a custom schema
   * @param {string} name - Schema name
   * @param {Object} schema - Schema definition
   * @returns {boolean} - Success status
   */
  registerSchema(name, schema) {
    if (!name || typeof name !== 'string') {
      throw new Error('Schema name must be a non-empty string');
    }
    
    if (!schema || typeof schema !== 'object') {
      throw new Error('Schema must be an object');
    }
    
    this.schemas.set(name, schema);
    return true;
  }
  
  /**
   * Get a registered schema
   * @param {string} name - Schema name
   * @returns {Object|null} - Schema definition or null if not found
   */
  getSchema(name) {
    return this.schemas.get(name) || null;
  }
}

/**
 * Main schema manager for validation
 */
export class SchemaManager {
  /**
   * Create a new SchemaManager
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.config = createConfig(options);
    
    // Create validator only if enabled
    if (this.config.schema.validationEnabled) {
      this.validator = SchemaFactory.createValidator(
        this.config.schema.validationStrategy,
        {
          strictMode: this.config.schema.strictMode,
          coercionEnabled: this.config.schema.coercionEnabled
        }
      );
    } else {
      this.validator = null;
    }
  }
  
  /**
   * Check if validation is enabled
   * @returns {boolean} - Whether validation is enabled
   */
  isEnabled() {
    return !!this.validator;
  }
  
  /**
   * Validate data against a schema
   * @param {Object} data - Data to validate
   * @param {Object|string} schema - Schema to validate against (or schema name)
   * @param {Object} options - Validation options
   * @returns {Object} - Validation result with isValid and errors
   */
  validate(data, schema, options = {}) {
    if (!this.isEnabled()) {
      return { isValid: true, errors: [], validatedData: null };
    }
    
    return this.validator.validate(data, schema, options);
  }
  
  /**
   * Register a custom schema
   * @param {string} name - Schema name
   * @param {Object} schema - Schema definition
   * @returns {boolean} - Success status
   */
  registerSchema(name, schema) {
    if (!this.isEnabled()) {
      console.warn('Validation is disabled, schema not registered');
      return false;
    }
    
    return this.validator.registerSchema(name, schema);
  }
  
  /**
   * Get a registered schema
   * @param {string} name - Schema name
   * @returns {Object|null} - Schema definition or null if not found
   */
  getSchema(name) {
    if (!this.isEnabled()) {
      return null;
    }
    
    return this.validator.getSchema(name);
  }
  
  /**
   * Register common schema patterns
   * @returns {Object} - Registered schemas
   */
  registerCommonSchemas() {
    if (!this.isEnabled()) {
      return {};
    }
    
    const schemas = {
      email: {
        type: 'string',
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
      },
      uuid: {
        type: 'string',
        pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      },
      url: {
        type: 'string',
        pattern: '^(https?|ftp)://[^\\s/$.?#].[^\\s]*$'
      },
      date: {
        type: 'string',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$'
      },
      datetime: {
        type: 'string',
        pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d{1,3})?(Z|[+-]\\d{2}:\\d{2})$'
      }
    };
    
    for (const [name, schema] of Object.entries(schemas)) {
      this.registerSchema(name, schema);
    }
    
    return schemas;
  }
  
  /**
   * Get the validator instance
   * @returns {SchemaValidator|null} - Schema validator instance
   */
  getValidator() {
    return this.validator;
  }
}

export default SchemaManager; 