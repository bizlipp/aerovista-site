/**
 * DataStackULTRA Storage Module
 * Provides persistent and in-memory storage capabilities
 */

import { createConfig } from './config.js';

/**
 * Abstract Storage interface
 * All storage implementations must implement these methods
 */
class Storage {
  /**
   * Set a value in storage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @param {Object} options - Storage options
   * @returns {Promise<boolean>} - Success status
   */
  async set(key, value, options = {}) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Get a value from storage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key not found
   * @returns {Promise<*>} - Retrieved value or default
   */
  async get(key, defaultValue = null) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Check if a key exists in storage
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} - Whether the key exists
   */
  async has(key) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Remove a value from storage
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} - Success status
   */
  async remove(key) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Clear all values from storage
   * @returns {Promise<boolean>} - Success status
   */
  async clear() {
    throw new Error('Method not implemented');
  }
  
  /**
   * Get all keys in storage
   * @returns {Promise<Array<string>>} - Array of keys
   */
  async keys() {
    throw new Error('Method not implemented');
  }
  
  /**
   * Get all values in storage
   * @returns {Promise<Array<*>>} - Array of values
   */
  async values() {
    throw new Error('Method not implemented');
  }
  
  /**
   * Get all entries in storage
   * @returns {Promise<Array<[string, *]>>} - Array of key-value pairs
   */
  async entries() {
    throw new Error('Method not implemented');
  }
  
  /**
   * Get the number of items in storage
   * @returns {Promise<number>} - Number of items
   */
  async size() {
    throw new Error('Method not implemented');
  }
}

/**
 * Local Storage implementation
 */
class LocalStorageAdapter extends Storage {
  /**
   * Create a new LocalStorageAdapter
   * @param {Object} options - Storage options
   */
  constructor(options = {}) {
    super();
    this.prefix = options.prefix || 'datastack:';
    this.serialize = options.serialize || JSON.stringify;
    this.deserialize = options.deserialize || JSON.parse;
  }
  
  /**
   * Generate a prefixed key
   * @private
   * @param {string} key - Storage key
   * @returns {string} - Prefixed key
   */
  _prefixKey(key) {
    return `${this.prefix}${key}`;
  }
  
  /**
   * Remove prefix from a key
   * @private
   * @param {string} prefixedKey - Prefixed key
   * @returns {string} - Original key
   */
  _unprefixKey(prefixedKey) {
    return prefixedKey.slice(this.prefix.length);
  }
  
  /**
   * Set a value in localStorage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @param {Object} options - Storage options
   * @returns {Promise<boolean>} - Success status
   */
  async set(key, value, options = {}) {
    try {
      const prefixedKey = this._prefixKey(key);
      const serialized = this.serialize(value);
      localStorage.setItem(prefixedKey, serialized);
      return true;
    } catch (error) {
      console.error(`Failed to set key ${key} in localStorage:`, error);
      return false;
    }
  }
  
  /**
   * Get a value from localStorage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key not found
   * @returns {Promise<*>} - Retrieved value or default
   */
  async get(key, defaultValue = null) {
    try {
      const prefixedKey = this._prefixKey(key);
      const serialized = localStorage.getItem(prefixedKey);
      
      if (serialized === null) {
        return defaultValue;
      }
      
      return this.deserialize(serialized);
    } catch (error) {
      console.error(`Failed to get key ${key} from localStorage:`, error);
      return defaultValue;
    }
  }
  
  /**
   * Check if a key exists in localStorage
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} - Whether the key exists
   */
  async has(key) {
    const prefixedKey = this._prefixKey(key);
    return localStorage.getItem(prefixedKey) !== null;
  }
  
  /**
   * Remove a value from localStorage
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} - Success status
   */
  async remove(key) {
    try {
      const prefixedKey = this._prefixKey(key);
      localStorage.removeItem(prefixedKey);
      return true;
    } catch (error) {
      console.error(`Failed to remove key ${key} from localStorage:`, error);
      return false;
    }
  }
  
  /**
   * Clear all values with prefix from localStorage
   * @returns {Promise<boolean>} - Success status
   */
  async clear() {
    try {
      // Only remove items with our prefix
      const keys = Object.keys(localStorage);
      
      for (const key of keys) {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
  }
  
  /**
   * Get all keys in localStorage with our prefix
   * @returns {Promise<Array<string>>} - Array of keys
   */
  async keys() {
    try {
      const allKeys = Object.keys(localStorage);
      const prefixedKeys = allKeys.filter(key => key.startsWith(this.prefix));
      return prefixedKeys.map(this._unprefixKey.bind(this));
    } catch (error) {
      console.error('Failed to get keys from localStorage:', error);
      return [];
    }
  }
  
  /**
   * Get all values in localStorage with our prefix
   * @returns {Promise<Array<*>>} - Array of values
   */
  async values() {
    try {
      const allKeys = Object.keys(localStorage);
      const values = [];
      
      for (const key of allKeys) {
        if (key.startsWith(this.prefix)) {
          const serialized = localStorage.getItem(key);
          values.push(this.deserialize(serialized));
        }
      }
      
      return values;
    } catch (error) {
      console.error('Failed to get values from localStorage:', error);
      return [];
    }
  }
  
  /**
   * Get all entries in localStorage with our prefix
   * @returns {Promise<Array<[string, *]>>} - Array of key-value pairs
   */
  async entries() {
    try {
      const allKeys = Object.keys(localStorage);
      const entries = [];
      
      for (const key of allKeys) {
        if (key.startsWith(this.prefix)) {
          const serialized = localStorage.getItem(key);
          const value = this.deserialize(serialized);
          entries.push([this._unprefixKey(key), value]);
        }
      }
      
      return entries;
    } catch (error) {
      console.error('Failed to get entries from localStorage:', error);
      return [];
    }
  }
  
  /**
   * Get the number of items in localStorage with our prefix
   * @returns {Promise<number>} - Number of items
   */
  async size() {
    try {
      const allKeys = Object.keys(localStorage);
      return allKeys.filter(key => key.startsWith(this.prefix)).length;
    } catch (error) {
      console.error('Failed to get size from localStorage:', error);
      return 0;
    }
  }
}

/**
 * IndexedDB Storage implementation
 */
class IndexedDBAdapter extends Storage {
  /**
   * Create a new IndexedDBAdapter
   * @param {Object} options - Storage options
   */
  constructor(options = {}) {
    super();
    this.dbName = options.dbName || 'datastack-db';
    this.storeName = options.storeName || 'datastack-store';
    this.version = options.version || 1;
    this.db = null;
    this.isReady = false;
    this.readyPromise = this._initDB();
  }
  
  /**
   * Initialize the IndexedDB database
   * @private
   * @returns {Promise<void>} - Promise that resolves when DB is ready
   */
  async _initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.isReady = true;
        resolve();
      };
      
      request.onerror = (event) => {
        console.error('Failed to open IndexedDB:', event.target.error);
        reject(event.target.error);
      };
    });
  }
  
  /**
   * Ensure the database is ready before performing operations
   * @private
   * @returns {Promise<IDBDatabase>} - The database instance
   */
  async _ensureReady() {
    if (!this.isReady) {
      await this.readyPromise;
    }
    return this.db;
  }
  
  /**
   * Get a transaction and store for the specified mode
   * @private
   * @param {string} mode - Transaction mode ('readonly' or 'readwrite')
   * @returns {Object} - Object with transaction and store
   */
  async _getStore(mode) {
    const db = await this._ensureReady();
    const transaction = db.transaction(this.storeName, mode);
    const store = transaction.objectStore(this.storeName);
    return { transaction, store };
  }
  
  /**
   * Set a value in IndexedDB
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @param {Object} options - Storage options
   * @returns {Promise<boolean>} - Success status
   */
  async set(key, value, options = {}) {
    try {
      const { store } = await this._getStore('readwrite');
      
      return new Promise((resolve, reject) => {
        const request = store.put(value, key);
        
        request.onsuccess = () => resolve(true);
        request.onerror = (event) => {
          console.error(`Failed to set key ${key} in IndexedDB:`, event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error(`Failed to set key ${key} in IndexedDB:`, error);
      return false;
    }
  }
  
  /**
   * Get a value from IndexedDB
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key not found
   * @returns {Promise<*>} - Retrieved value or default
   */
  async get(key, defaultValue = null) {
    try {
      const { store } = await this._getStore('readonly');
      
      return new Promise((resolve, reject) => {
        const request = store.get(key);
        
        request.onsuccess = (event) => {
          resolve(event.target.result !== undefined ? event.target.result : defaultValue);
        };
        
        request.onerror = (event) => {
          console.error(`Failed to get key ${key} from IndexedDB:`, event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error(`Failed to get key ${key} from IndexedDB:`, error);
      return defaultValue;
    }
  }
  
  /**
   * Check if a key exists in IndexedDB
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} - Whether the key exists
   */
  async has(key) {
    try {
      const { store } = await this._getStore('readonly');
      
      return new Promise((resolve, reject) => {
        const request = store.count(key);
        
        request.onsuccess = (event) => {
          resolve(event.target.result > 0);
        };
        
        request.onerror = (event) => {
          console.error(`Failed to check if key ${key} exists in IndexedDB:`, event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error(`Failed to check if key ${key} exists in IndexedDB:`, error);
      return false;
    }
  }
  
  /**
   * Remove a value from IndexedDB
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} - Success status
   */
  async remove(key) {
    try {
      const { store } = await this._getStore('readwrite');
      
      return new Promise((resolve, reject) => {
        const request = store.delete(key);
        
        request.onsuccess = () => resolve(true);
        request.onerror = (event) => {
          console.error(`Failed to remove key ${key} from IndexedDB:`, event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error(`Failed to remove key ${key} from IndexedDB:`, error);
      return false;
    }
  }
  
  /**
   * Clear all values from IndexedDB
   * @returns {Promise<boolean>} - Success status
   */
  async clear() {
    try {
      const { store } = await this._getStore('readwrite');
      
      return new Promise((resolve, reject) => {
        const request = store.clear();
        
        request.onsuccess = () => resolve(true);
        request.onerror = (event) => {
          console.error('Failed to clear IndexedDB:', event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Failed to clear IndexedDB:', error);
      return false;
    }
  }
  
  /**
   * Get all keys in IndexedDB
   * @returns {Promise<Array<string>>} - Array of keys
   */
  async keys() {
    try {
      const { store } = await this._getStore('readonly');
      
      return new Promise((resolve, reject) => {
        const keys = [];
        const request = store.openCursor();
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          
          if (cursor) {
            keys.push(cursor.key);
            cursor.continue();
          } else {
            resolve(keys);
          }
        };
        
        request.onerror = (event) => {
          console.error('Failed to get keys from IndexedDB:', event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Failed to get keys from IndexedDB:', error);
      return [];
    }
  }
  
  /**
   * Get all values in IndexedDB
   * @returns {Promise<Array<*>>} - Array of values
   */
  async values() {
    try {
      const { store } = await this._getStore('readonly');
      
      return new Promise((resolve, reject) => {
        const values = [];
        const request = store.openCursor();
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          
          if (cursor) {
            values.push(cursor.value);
            cursor.continue();
          } else {
            resolve(values);
          }
        };
        
        request.onerror = (event) => {
          console.error('Failed to get values from IndexedDB:', event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Failed to get values from IndexedDB:', error);
      return [];
    }
  }
  
  /**
   * Get all entries in IndexedDB
   * @returns {Promise<Array<[string, *]>>} - Array of key-value pairs
   */
  async entries() {
    try {
      const { store } = await this._getStore('readonly');
      
      return new Promise((resolve, reject) => {
        const entries = [];
        const request = store.openCursor();
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          
          if (cursor) {
            entries.push([cursor.key, cursor.value]);
            cursor.continue();
          } else {
            resolve(entries);
          }
        };
        
        request.onerror = (event) => {
          console.error('Failed to get entries from IndexedDB:', event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Failed to get entries from IndexedDB:', error);
      return [];
    }
  }
  
  /**
   * Get the number of items in IndexedDB
   * @returns {Promise<number>} - Number of items
   */
  async size() {
    try {
      const { store } = await this._getStore('readonly');
      
      return new Promise((resolve, reject) => {
        const request = store.count();
        
        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
        
        request.onerror = (event) => {
          console.error('Failed to get size from IndexedDB:', event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Failed to get size from IndexedDB:', error);
      return 0;
    }
  }
}

/**
 * Memory Storage implementation using Map
 */
class MemoryAdapter extends Storage {
  /**
   * Create a new MemoryAdapter
   * @param {Object} options - Storage options
   */
  constructor(options = {}) {
    super();
    this.store = new Map();
    this.maxItems = options.maxItems || 1000;
    this.expiryTime = options.expiryTime || 3600000; // 1 hour default
    this.expirations = new Map();
  }
  
  /**
   * Set a value in memory
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @param {Object} options - Storage options
   * @returns {Promise<boolean>} - Success status
   */
  async set(key, value, options = {}) {
    try {
      // Check if we're at the limit and need to remove oldest
      if (this.store.size >= this.maxItems && !this.store.has(key)) {
        const oldestKey = this._findOldestKey();
        if (oldestKey) {
          this.store.delete(oldestKey);
          this.expirations.delete(oldestKey);
        }
      }
      
      this.store.set(key, value);
      
      // Set expiration if needed
      const ttl = options.ttl || this.expiryTime;
      if (ttl > 0) {
        this.expirations.set(key, Date.now() + ttl);
      }
      
      return true;
    } catch (error) {
      console.error(`Failed to set key ${key} in memory:`, error);
      return false;
    }
  }
  
  /**
   * Find the oldest key in the store
   * @private
   * @returns {string|null} - Oldest key or null if store is empty
   */
  _findOldestKey() {
    if (this.expirations.size === 0) {
      return this.store.keys().next().value || null;
    }
    
    let oldestKey = null;
    let oldestTime = Infinity;
    
    for (const [key, expiryTime] of this.expirations.entries()) {
      if (expiryTime < oldestTime) {
        oldestTime = expiryTime;
        oldestKey = key;
      }
    }
    
    return oldestKey;
  }
  
  /**
   * Clean up expired items
   * @private
   */
  _cleanExpired() {
    const now = Date.now();
    for (const [key, expiryTime] of this.expirations.entries()) {
      if (expiryTime <= now) {
        this.store.delete(key);
        this.expirations.delete(key);
      }
    }
  }
  
  /**
   * Get a value from memory
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key not found
   * @returns {Promise<*>} - Retrieved value or default
   */
  async get(key, defaultValue = null) {
    try {
      this._cleanExpired();
      
      if (this.store.has(key)) {
        return this.store.get(key);
      }
      
      return defaultValue;
    } catch (error) {
      console.error(`Failed to get key ${key} from memory:`, error);
      return defaultValue;
    }
  }
  
  /**
   * Check if a key exists in memory
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} - Whether the key exists
   */
  async has(key) {
    this._cleanExpired();
    return this.store.has(key);
  }
  
  /**
   * Remove a value from memory
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} - Success status
   */
  async remove(key) {
    try {
      this.store.delete(key);
      this.expirations.delete(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove key ${key} from memory:`, error);
      return false;
    }
  }
  
  /**
   * Clear all values from memory
   * @returns {Promise<boolean>} - Success status
   */
  async clear() {
    try {
      this.store.clear();
      this.expirations.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear memory store:', error);
      return false;
    }
  }
  
  /**
   * Get all keys in memory
   * @returns {Promise<Array<string>>} - Array of keys
   */
  async keys() {
    this._cleanExpired();
    return Array.from(this.store.keys());
  }
  
  /**
   * Get all values in memory
   * @returns {Promise<Array<*>>} - Array of values
   */
  async values() {
    this._cleanExpired();
    return Array.from(this.store.values());
  }
  
  /**
   * Get all entries in memory
   * @returns {Promise<Array<[string, *]>>} - Array of key-value pairs
   */
  async entries() {
    this._cleanExpired();
    return Array.from(this.store.entries());
  }
  
  /**
   * Get the number of items in memory
   * @returns {Promise<number>} - Number of items
   */
  async size() {
    this._cleanExpired();
    return this.store.size;
  }
}

/**
 * Storage factory to create storage instances based on configuration
 */
export class StorageFactory {
  /**
   * Create a storage instance based on strategy
   * @param {string} strategy - Storage strategy
   * @param {Object} options - Storage options
   * @returns {Storage} - Storage instance
   */
  static createStorage(strategy, options = {}) {
    switch (strategy) {
      case 'localStorage':
        return new LocalStorageAdapter(options);
      case 'indexedDB':
        return new IndexedDBAdapter(options);
      case 'map':
        return new MemoryAdapter(options);
      case 'custom':
        if (!options.implementation) {
          throw new Error('Custom storage requires an implementation');
        }
        return options.implementation;
      default:
        console.warn(`Invalid storage strategy: ${strategy}, using localStorage`);
        return new LocalStorageAdapter(options);
    }
  }
}

/**
 * Main storage manager that combines persistent and memory storage
 */
export class StorageManager {
  /**
   * Create a new StorageManager
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.config = createConfig(options);
    
    // Create persistent storage
    this.persistentStorage = StorageFactory.createStorage(
      this.config.storage.persistentStrategy,
      {
        prefix: 'datastack:persistent:',
        dbName: 'datastack-persistent',
        storeName: 'datastack-store'
      }
    );
    
    // Create memory storage
    this.memoryStorage = StorageFactory.createStorage(
      this.config.storage.memoryStrategy,
      {
        maxItems: this.config.storage.maxCachedItems,
        expiryTime: this.config.storage.itemExpiryTime
      }
    );
  }
  
  /**
   * Set a value in storage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @param {Object} options - Storage options
   * @returns {Promise<boolean>} - Success status
   */
  async set(key, value, options = {}) {
    // Always store in memory for quick access
    await this.memoryStorage.set(key, value, options);
    
    // Store in persistent storage if not temporary
    if (!options.temporary) {
      return this.persistentStorage.set(key, value, options);
    }
    
    return true;
  }
  
  /**
   * Get a value from storage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key not found
   * @returns {Promise<*>} - Retrieved value or default
   */
  async get(key, defaultValue = null) {
    // Try to get from memory first
    const memoryValue = await this.memoryStorage.get(key);
    
    if (memoryValue !== null) {
      return memoryValue;
    }
    
    // If not in memory, try persistent storage
    const persistentValue = await this.persistentStorage.get(key, defaultValue);
    
    // Cache in memory for next time
    if (persistentValue !== defaultValue) {
      await this.memoryStorage.set(key, persistentValue);
    }
    
    return persistentValue;
  }
  
  /**
   * Check if a key exists in storage
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} - Whether the key exists
   */
  async has(key) {
    // Check memory first
    if (await this.memoryStorage.has(key)) {
      return true;
    }
    
    // Then check persistent storage
    return this.persistentStorage.has(key);
  }
  
  /**
   * Remove a value from storage
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} - Success status
   */
  async remove(key) {
    // Remove from both storages
    const memoryResult = await this.memoryStorage.remove(key);
    const persistentResult = await this.persistentStorage.remove(key);
    
    return memoryResult && persistentResult;
  }
  
  /**
   * Clear all values from storage
   * @returns {Promise<boolean>} - Success status
   */
  async clear() {
    // Clear both storages
    const memoryResult = await this.memoryStorage.clear();
    const persistentResult = await this.persistentStorage.clear();
    
    return memoryResult && persistentResult;
  }
  
  /**
   * Get all keys in storage
   * @returns {Promise<Array<string>>} - Array of keys
   */
  async keys() {
    // Get keys from both storages
    const memoryKeys = await this.memoryStorage.keys();
    const persistentKeys = await this.persistentStorage.keys();
    
    // Combine and deduplicate
    return [...new Set([...memoryKeys, ...persistentKeys])];
  }
  
  /**
   * Get the number of items in persistent storage
   * @returns {Promise<number>} - Number of items
   */
  async size() {
    return this.persistentStorage.size();
  }
  
  /**
   * Get the persistent storage instance
   * @returns {Storage} - Persistent storage instance
   */
  getPersistentStorage() {
    return this.persistentStorage;
  }
  
  /**
   * Get the memory storage instance
   * @returns {Storage} - Memory storage instance
   */
  getMemoryStorage() {
    return this.memoryStorage;
  }
}

export default StorageManager; 