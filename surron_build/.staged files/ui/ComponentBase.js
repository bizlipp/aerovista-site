/**
 * ComponentBase.js
 * Base class for UI components with Redux integration
 */

import { store } from '../../StateStackULTRA/store/gameStore.js';
import { showToast } from '../../game/popup-toast.js';

export default class ComponentBase {
  /**
   * Create a component
   * @param {string[]} stateSlices - State slices to watch for changes
   */
  constructor(stateSlices = []) {
    this.container = null;
    this.stateSlices = stateSlices;
    this.prevState = {};
    this.unsubscribe = null;
    this.eventListeners = [];
  }
  
  /**
   * Mount component to container
   * @param {HTMLElement} container - Container element
   */
  mount(container) {
    this.container = container;
    
    if (!this.container) {
      console.error('Cannot mount component: Container element is null');
      return false;
    }
    
    // Subscribe to store changes
    if (this.stateSlices.length > 0) {
      this.unsubscribe = store.subscribe(() => {
        const currentState = store.getState();
        const shouldUpdate = this.shouldComponentUpdate(currentState);
        
        if (shouldUpdate) {
          this.render(currentState);
          this.prevState = this.getRelevantState(currentState);
        }
      });
    }
    
    // Initial render
    this.render(store.getState());
    this.prevState = this.getRelevantState(store.getState());
    
    return true;
  }
  
  /**
   * Render component
   * @param {Object} state - Redux state
   */
  render(state) {
    try {
      // To be implemented by child classes
    } catch (error) {
      console.error('Error rendering component:', error);
      this.handleRenderError(error);
    }
  }
  
  /**
   * Clean up component
   */
  unmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    
    // Remove event listeners
    this.removeAllEventListeners();
  }
  
  /**
   * Add an event listener and track it for cleanup
   * @param {Element} element - Element to add listener to
   * @param {string} type - Event type
   * @param {Function} listener - Event listener
   */
  addListener(element, type, listener) {
    if (!element) return;
    
    element.addEventListener(type, listener);
    this.eventListeners.push({ element, type, listener });
  }
  
  /**
   * Remove all tracked event listeners
   */
  removeAllEventListeners() {
    this.eventListeners.forEach(({ element, type, listener }) => {
      if (element) {
        element.removeEventListener(type, listener);
      }
    });
    this.eventListeners = [];
  }
  
  /**
   * Get the relevant state for this component
   * @param {Object} state - Full Redux state
   * @returns {Object} Relevant state slices
   */
  getRelevantState(state) {
    const relevantState = {};
    
    if (this.stateSlices.length === 0) {
      return state;
    }
    
    this.stateSlices.forEach(slice => {
      relevantState[slice] = state[slice];
    });
    
    return relevantState;
  }
  
  /**
   * Determine if the component should update
   * @param {Object} currentState - Current Redux state
   * @returns {boolean} Whether the component should update
   */
  shouldComponentUpdate(currentState) {
    const relevantState = this.getRelevantState(currentState);
    
    // Deep comparison with previous state
    return JSON.stringify(relevantState) !== JSON.stringify(this.prevState);
  }
  
  /**
   * Handle render errors
   * @param {Error} error - Render error
   */
  handleRenderError(error) {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="error-message">
        <h3>Something went wrong</h3>
        <p>There was an error rendering this component. Please try refreshing the page.</p>
        <details>
          <summary>Technical Details</summary>
          <pre>${error.message}</pre>
        </details>
      </div>
    `;
    
    if (typeof showToast === 'function') {
      showToast('Error rendering component: ' + error.message, 'error');
    }
  }
}
