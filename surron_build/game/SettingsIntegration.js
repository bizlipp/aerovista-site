import GameCore from './GameCore.js';
import { store } from '../StateStackULTRA/store/gameStore.js';
import { updateSetting, resetSettings } from '../StateStackULTRA/slices/settingsSlice.js';

/**
 * Initialize settings UI and connect to the Redux store
 */
export function initSettings() {
  console.log('[SettingsIntegration] Initializing settings integration');
  
  // Get initial settings from store
  const settings = getSettings();
  
  // Apply settings to UI elements
  applySettingsToUI(settings);
  
  // Set up event listeners for settings controls
  setupSettingsEventListeners();
  
  // Subscribe to store changes to update UI
  store.subscribe(() => {
    const newSettings = getSettings();
    applySettingsToUI(newSettings);
  });
}

/**
 * Get current settings from the store
 */
function getSettings() {
  return store.getState().settings || {};
}

/**
 * Apply settings values to UI elements
 */
function applySettingsToUI(settings) {
  // Sound effects toggle
  const soundToggle = document.getElementById('sound-toggle');
  if (soundToggle) {
    soundToggle.checked = settings.soundEnabled !== false;
  }
  
  // Music toggle
  const musicToggle = document.getElementById('music-toggle');
  if (musicToggle) {
    musicToggle.checked = settings.musicEnabled !== false;
  }
  
  // Notifications toggle
  const notificationsToggle = document.getElementById('notifications-toggle');
  if (notificationsToggle) {
    notificationsToggle.checked = settings.notificationsEnabled !== false;
  }
}

/**
 * Set up event listeners for settings controls
 */
function setupSettingsEventListeners() {
  // Sound effects toggle
  const soundToggle = document.getElementById('sound-toggle');
  if (soundToggle) {
    soundToggle.addEventListener('change', () => {
      updateSettingValue('soundEnabled', soundToggle.checked);
    });
  }
  
  // Music toggle
  const musicToggle = document.getElementById('music-toggle');
  if (musicToggle) {
    musicToggle.addEventListener('change', () => {
      updateSettingValue('musicEnabled', musicToggle.checked);
    });
  }
  
  // Notifications toggle
  const notificationsToggle = document.getElementById('notifications-toggle');
  if (notificationsToggle) {
    notificationsToggle.addEventListener('change', () => {
      updateSettingValue('notificationsEnabled', notificationsToggle.checked);
    });
  }
  
  // Export button
  const exportButton = document.getElementById('export-button');
  if (exportButton) {
    exportButton.addEventListener('click', exportGameData);
  }
  
  // Process import button
  const processImportButton = document.getElementById('process-import');
  if (processImportButton) {
    processImportButton.addEventListener('click', importGameData);
  }
  
  // Reset confirm button
  const resetConfirmButton = document.getElementById('reset-confirm');
  if (resetConfirmButton) {
    resetConfirmButton.addEventListener('click', resetGameData);
  }
}

/**
 * Update a setting value in the store
 */
function updateSettingValue(key, value) {
  store.dispatch(updateSetting({ key, value }));
  console.log(`[SettingsIntegration] Updated setting: ${key} = ${value}`);
}

/**
 * Export game data to JSON
 */
function exportGameData() {
  try {
    const exportData = GameCore.exportState();
    const exportArea = document.getElementById('export-area');
    
    if (exportArea) {
      exportArea.value = exportData;
      document.getElementById('export-container').style.display = 'block';
      showNotification('success', 'Game data exported successfully!');
    }
  } catch (error) {
    console.error('[SettingsIntegration] Export error:', error);
    showNotification('error', 'Failed to export game data');
  }
}

/**
 * Import game data from JSON
 */
function importGameData() {
  try {
    const importArea = document.getElementById('import-area');
    if (!importArea || !importArea.value.trim()) {
      showNotification('error', 'No data to import');
      return;
    }
    
    const success = GameCore.importState(importArea.value);
    
    if (success) {
      showNotification('success', 'Game data imported successfully! Refreshing page...');
      document.getElementById('import-container').style.display = 'none';
      
      // Reload page after successful import
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      showNotification('error', 'Failed to import game data: Invalid format');
    }
  } catch (error) {
    console.error('[SettingsIntegration] Import error:', error);
    showNotification('error', 'Failed to import game data');
  }
}

/**
 * Reset all game data
 */
function resetGameData() {
  try {
    // Reset the Redux store
    store.dispatch(resetSettings());
    
    // Perform full GameCore reset
    GameCore.resetPlayerState();
    
    // Hide modal
    document.getElementById('reset-modal').style.display = 'none';
    
    showNotification('success', 'Game data has been reset. Refreshing page...');
    
    // Reload page after reset
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  } catch (error) {
    console.error('[SettingsIntegration] Reset error:', error);
    showNotification('error', 'Failed to reset game data');
  }
}

/**
 * Show a notification message
 */
function showNotification(type, message) {
  // Hide all notifications first
  document.getElementById('success-notification').style.display = 'none';
  document.getElementById('error-notification').style.display = 'none';
  
  // Show the appropriate notification
  const notification = document.getElementById(`${type}-notification`);
  if (notification) {
    notification.textContent = message;
    notification.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      notification.style.display = 'none';
    }, 5000);
  }
}

// Initialize when the module is loaded
document.addEventListener('DOMContentLoaded', initSettings);

export default {
  initSettings,
  getSettings,
  updateSettingValue,
  exportGameData,
  importGameData,
  resetGameData
}; 