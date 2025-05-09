/**
 * StateStackULTRA Configuration Module
 * Defines configuration options for state management
 */

/**
 * @typedef {Object} StateConfig
 * @property {boolean} immutable - Whether state should be treated as immutable
 * @property {boolean} strictMode - Whether to enforce strict state mutations
 * @property {Object} history - History tracking configuration
 * @property {boolean} history.enabled - Whether to track state history
 * @property {number} history.maxSize - Maximum number of history entries to keep
 */

/**
 * @typedef {Object} ActionConfig
 * @property {boolean} asyncActionsEnabled - Whether to enable async actions
 * @property {boolean} validateActionTypes - Whether to validate action types
 * @property {string[]} reservedActionTypes - Action types that are reserved by the system
 */

/**
 * @typedef {Object} MiddlewareConfig
 * @property {boolean} enabled - Whether to enable middleware
 * @property {string[]} defaultMiddleware - Array of default middleware to apply
 */

/**
 * @typedef {Object} PersistConfig
 * @property {boolean} enabled - Whether to enable state persistence
 * @property {string} storage - Storage strategy ('local', 'session', 'datastack', 'custom')
 * @property {string[]} whitelist - State properties to persist (empty means all)
 * @property {string[]} blacklist - State properties to exclude from persistence
 * @property {number} throttle - Throttle time for persistence in milliseconds
 */

/**
 * @typedef {Object} StateStackConfig
 * @property {StateConfig} state - State configuration
 * @property {ActionConfig} action - Action configuration
 * @property {MiddlewareConfig} middleware - Middleware configuration
 * @property {PersistConfig} persist - Persistence configuration
 * @property {Object} logging - Logging configuration
 * @property {boolean} logging.enabled - Whether to log state changes
 * @property {string} logging.level - Log level ('debug', 'info', 'warn', 'error')
 * @property {boolean} logging.verbose - Whether to include verbose details in logs
 */

/**
 * Default configuration for StateStackULTRA
 * @type {StateStackConfig}
 */
export const DEFAULT_CONFIG = Object.freeze({
  state: {
    immutable: true,
    strictMode: true,
    history: {
      enabled: true,
      maxSize: 50
    }
  },
  action: {
    asyncActionsEnabled: true,
    validateActionTypes: true,
    reservedActionTypes: ['INIT', 'RESET', 'HYDRATE', 'PERSIST']
  },
  middleware: {
    enabled: true,
    defaultMiddleware: ['logger', 'thunk']
  },
  persist: {
    enabled: false,
    storage: 'local',
    whitelist: [],
    blacklist: [],
    throttle: 1000
  },
  logging: {
    enabled: true,
    level: 'info',
    verbose: false
  }
});

/**
 * Create a configuration by merging default with custom options
 * @param {Partial<StateStackConfig>} options - Custom configuration options
 * @returns {StateStackConfig} - Merged configuration
 */
export function createConfig(options = {}) {
  // Deep merge default config with provided options
  const config = {
    state: {
      ...DEFAULT_CONFIG.state,
      ...(options.state || {}),
      history: {
        ...DEFAULT_CONFIG.state.history,
        ...(options.state?.history || {})
      }
    },
    action: {
      ...DEFAULT_CONFIG.action,
      ...(options.action || {})
    },
    middleware: {
      ...DEFAULT_CONFIG.middleware,
      ...(options.middleware || {})
    },
    persist: {
      ...DEFAULT_CONFIG.persist,
      ...(options.persist || {})
    },
    logging: {
      ...DEFAULT_CONFIG.logging,
      ...(options.logging || {})
    }
  };
  
  // Validate configuration
  if (config.persist.enabled && !['local', 'session', 'datastack', 'custom'].includes(config.persist.storage)) {
    console.warn(`Invalid persistence storage: ${config.persist.storage}, using local`);
    config.persist.storage = 'local';
  }

  if (!['debug', 'info', 'warn', 'error'].includes(config.logging.level)) {
    console.warn(`Invalid logging level: ${config.logging.level}, using info`);
    config.logging.level = 'info';
  }
  
  // Return immutable configuration
  return Object.freeze(config);
}

export default { createConfig, DEFAULT_CONFIG }; 