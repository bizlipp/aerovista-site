/**
 * ComponentBase class - Stub implementation
 * This file serves as a fallback for modules that import ComponentBase
 */

import { store } from '../StateStackULTRA/store/gameStore.js';
import { showToast } from '../game/popup-toast.js';

// Base class for all UI components
export default class ComponentBase {
  constructor(stateSlices = []) {
    // Initialize component state
    this.state = {};
    this.listeners = [];
    this.subscriptions = [];
    this.container = null;
    this.stateSlices = stateSlices;
    
    console.log("ComponentBase stub initialized");
  }
  
  // Mount component to DOM
  mount(container) {
    if (!container) {
      console.error("Cannot mount component: No container provided");
      return;
    }
    
    this.container = container;
    this.render(store.getState());
    
    // Subscribe to store changes
    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      // Only re-render if watched slices change
      if (this.shouldComponentUpdate(state)) {
        this.render(state);
      }
    });
    
    this.subscriptions.push(unsubscribe);
    console.log("ComponentBase mounted to", container);
  }
  
  // Clean up resources when component is removed
  unmount() {
    // Remove all event listeners
    this.removeAllListeners();
    
    // Unsubscribe from store
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions = [];
    
    // Clear container
    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }
    
    console.log("ComponentBase unmounted");
  }
  
  // Determine if component should update based on state changes
  shouldComponentUpdate(newState) {
    // If no specific slices are watched, always update
    if (!this.stateSlices || this.stateSlices.length === 0) {
      return true;
    }
    
    // Otherwise, check if any watched slices changed
    return this.stateSlices.some(slice => 
      newState[slice] !== this.state[slice]
    );
  }
  
  // Add an event listener and track it for cleanup
  addListener(element, event, callback) {
    if (!element) return;
    
    element.addEventListener(event, callback);
    this.listeners.push({ element, event, callback });
  }
  
  // Remove all tracked event listeners
  removeAllListeners() {
    this.listeners.forEach(({ element, event, callback }) => {
      if (element) {
        element.removeEventListener(event, callback);
      }
    });
    this.listeners = [];
  }
  
  // Handle render errors gracefully
  handleRenderError(error) {
    console.error("Error rendering component:", error);
    
    if (this.container) {
      this.container.innerHTML = `
        <div style="padding: 20px; background: rgba(255,0,0,0.1); border-radius: 8px;">
          <h3>Component Error</h3>
          <p>There was a problem displaying this component.</p>
        </div>
      `;
    }
    
    // Show error toast
    if (typeof showToast === 'function') {
      showToast("Component rendering error: " + error.message, "error");
    }
  }
  
  // To be implemented by subclasses
  render(state) {
    console.warn("ComponentBase.render() called directly - should be overridden by subclass");
    if (this.container) {
      this.container.innerHTML = '<div>Base component - override render() in subclass</div>';
    }
  }
}
