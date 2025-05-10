/**
 * Gameplay Director
 * 
 * Guides players through the core gameplay loop by suggesting next activities
 * based on their current state and progression.
 */
import GameCore from './game/GameCore.js';
import { store } from './StateStackULTRA/store/gameStore.js';

class GameplayDirector {
  constructor() {
    this.currentSuggestion = null;
    this.suggestionsShown = [];
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
      this.initialize();
    });
    
    // Subscribe to state changes via Redux store
    store.subscribe(() => {
      this.updateSuggestion();
    });
    
    // Handle quest completion
    window.addEventListener('questCompleted', (event) => {
      const questId = event.detail;
      this.onQuestCompleted(questId);
    });
  }
  
  initialize() {
    console.log("Gameplay Director initialized");
    this.checkInitialState();
  }
  
  /**
   * Check player's initial state and provide appropriate guidance
   */
  checkInitialState() {    
    const state = GameCore.getPlayerState();
    if (!state) return;
    
    this.updateSuggestion();
    
    // Show first-time user guidance if needed
    if (state.level === 1 && !localStorage.getItem('tutorialShown')) {
      this.showTutorial();
      localStorage.setItem('tutorialShown', 'true');
    }
  }
  
  /**
   * Update the current gameplay suggestion based on player state
   */
  updateSuggestion(changedProperty = null) {
    const state = GameCore.getPlayerState();
    if (!state) return;
    
    const suggestion = this.suggestNextActivity();
    
    // Only show a new suggestion if it's different from the current one
    // or if certain significant properties changed
    const significantChanges = ['level', 'completedMissions', 'builds', 'fullReset', 'fullImport'];
    
    if (suggestion && 
        (this.currentSuggestion?.activity !== suggestion.activity || 
         significantChanges.includes(changedProperty))) {
      
      this.currentSuggestion = suggestion;
      
      // Show the suggestion if we haven't shown it recently
      if (!this.suggestionsShown.includes(suggestion.activity)) {
        this.showSuggestion(suggestion);
        this.suggestionsShown.push(suggestion.activity);
        
        // Limit stored suggestions
        if (this.suggestionsShown.length > 5) {
          this.suggestionsShown.shift();
        }
      }
    }
  }
  
  /**
   * Determine the next activity based on player state
   * @returns {Object} Suggested activity with message
   */
  suggestNextActivity() {
    const state = GameCore.getPlayerState();
    
    if (!state) return null;
    
    // First-time player with no builds
    if (state.builds.length === 0) {
      return {
        activity: "build",
        message: "Start by building your first bike in the workshop!",
        location: "buildpartsSelector.html"
      };
    }
    
    // Player has builds but no completed quests
    if (state.builds.length > 0 && 
        (!state.completedMissions || state.completedMissions.length === 0)) {
      return {
        activity: "quest",
        message: "Check out the quest board to show your bike to Charlie!",
        location: "#quest-board"
      };
    }
    
    // Player has completed first quest but hasn't gone fishing
    if (state.completedMissions && 
        state.completedMissions.includes('charlie_build_review') && 
        !state.completedMissions.includes('fish_delivery')) {
      return {
        activity: "fishing",
        message: "Try fishing with Billy to earn extra SurCoins!",
        location: "adventure.html"
      };
    }
    
    // Player has rewards to spend
    if (state.currency >= 500) {
      return {
        activity: "shop",
        message: "You have plenty of SurCoins! Visit the shop to buy upgrades.",
        location: "surron-shop.html"
      };
    }
    
    // Higher level player should try more advanced quests
    if (state.level >= 2 && 
        state.completedMissions && 
        !state.completedMissions.includes('heist_planning')) {
      return {
        activity: "tbd-quest",
        message: "You've reached level 2! Check out TBD's quest on the mission board.",
        location: "#quest-board"
      };
    }
    
    // Default suggestion for players who have done most things
    return {
      activity: "adventure",
      message: "Continue your Surron Squad adventure!",
      location: "adventure-engine.html"
    };
  }
  
  /**
   * Handle quest completion events
   * @param {string} questId - The completed quest ID
   */
  onQuestCompleted(questId) {
    // Clear the recent suggestion list to allow repeating suggestions
    // after significant progression events
    this.suggestionsShown = [];
    
    // Update suggestions immediately after quest completion
    this.updateSuggestion('completedMissions');
    
    // Show specific post-quest guidance
    switch(questId) {
      case 'charlie_build_review':
        this.showGuidanceToast("Nice work! You've completed Charlie's quest. Try fishing with Billy next!");
        break;
      case 'fish_delivery':
        this.showGuidanceToast("Fish delivered! As you level up, you'll unlock the Test Track and more activities.");
        break;
      case 'heist_planning':
        this.showGuidanceToast("Great job with TBD! Check out the shop to spend your SurCoins on upgrades.");
        break;
    }
  }
  
  /**
   * Show the gameplay suggestion to the player
   * @param {Object} suggestion - The suggestion to show
   */
  showSuggestion(suggestion) {
    if (!suggestion) return;
    
    // Create suggestion element
    const element = document.createElement('div');
    element.className = 'gameplay-suggestion';
    element.innerHTML = `
      <div class="suggestion-icon">💡</div>
      <div class="suggestion-content">
        <h3>Next Step</h3>
        <p>${suggestion.message}</p>
        ${suggestion.location ? 
          `<a href="${suggestion.location}" class="suggestion-action">Go there</a>` : ''}
      </div>
      <button class="suggestion-dismiss">&times;</button>
    `;
    
    // Style the suggestion
    Object.assign(element.style, {
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      backgroundColor: 'var(--squad-primary)',
      color: 'white',
      padding: '1rem',
      borderRadius: '8px',
      boxShadow: 'var(--squad-shadow)',
      zIndex: '1000',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      maxWidth: '400px',
      opacity: '0',
      transform: 'translateY(20px)',
      transition: 'opacity 0.3s, transform 0.3s'
    });
    
    // Style the dismiss button
    const dismissBtn = element.querySelector('.suggestion-dismiss');
    Object.assign(dismissBtn.style, {
      backgroundColor: 'transparent',
      border: 'none',
      color: 'white',
      fontSize: '1.5rem',
      cursor: 'pointer',
      position: 'absolute',
      top: '5px',
      right: '5px'
    });
    
    // Style the action link
    const actionLink = element.querySelector('.suggestion-action');
    if (actionLink) {
      Object.assign(actionLink.style, {
        display: 'inline-block',
        backgroundColor: 'white',
        color: 'var(--squad-primary)',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        textDecoration: 'none',
        fontWeight: 'bold',
        marginTop: '0.5rem'
      });
    }
    
    // Add dismiss event
    dismissBtn.addEventListener('click', () => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      setTimeout(() => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      }, 300);
    });
    
    // Add to document
    document.body.appendChild(element);
    
    // Trigger animation
    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, 10);
    
    // Auto remove after 15 seconds
    setTimeout(() => {
      if (element.parentNode) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        setTimeout(() => element.parentNode.removeChild(element), 300);
      }
    }, 15000);
  }
  
  /**
   * Show first-time user tutorial
   */
  showTutorial() {
    const tutorials = [
      {
        title: "Welcome to Surron Squad!",
        message: "This game is about building electric bikes and completing quests with your squad.",
        delay: 1000
      },
      {
        title: "First Steps",
        message: "Start by building your first bike in the workshop, then show it to Charlie for feedback.",
        delay: 5000
      },
      {
        title: "Game Progress",
        message: "Complete quests to earn XP, level up, and unlock new features like the Test Track.",
        delay: 9000
      },
      {
        title: "Need Help?",
        message: "Press Ctrl+Alt+D at any time to access the developer debug panel.",
        delay: 13000
      }
    ];
    
    // Show each tutorial message with delay
    tutorials.forEach((tutorial, index) => {
      setTimeout(() => {
        this.showGuidanceToast(tutorial.message, tutorial.title);
      }, tutorial.delay);
    });
  }
  
  /**
   * Show a simple toast notification with guidance
   * @param {string} message - The message to show
   * @param {string} title - Optional title
   */
  showGuidanceToast(message, title = "Gameplay Tip") {
    if (typeof window.addNotification === 'function') {
      window.addNotification('💡', title, message);
    } else {
      // Create a simple toast if addNotification isn't available
      const toast = document.createElement('div');
      toast.innerHTML = `<strong>${title}</strong><p>${message}</p>`;
      
      Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'var(--squad-neon)',
        color: 'black',
        padding: '1rem',
        borderRadius: '8px',
        boxShadow: 'var(--squad-shadow)',
        zIndex: '1000',
        maxWidth: '300px',
        opacity: '0',
        transform: 'translateY(20px)',
        transition: 'opacity 0.3s, transform 0.3s'
      });
      
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
      }, 10);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      }, 5000);
    }
  }
}

// Create and export the gameplay director
const director = new GameplayDirector();
export default director; 