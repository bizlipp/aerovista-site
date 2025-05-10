// adventureUI.js
// This file handles UI rendering for the adventure game, separating view from state

import { store } from './StateStackULTRA/store/gameStore.js';
import * as selectors from './selectors.js';

// Main UI update function
export function updateUI() {
  const state = store.getState();
  
  updatePlayerStats(state);
  updateCharacterStats(state);
  updateQuestList(state);
  updateInventory(state);
  updateLocationsList(state);
}

// Update player stats in UI
export function updatePlayerStats(state) {
  const playerLevel = selectors.getPlayerLevel(state);
  const playerXP = selectors.getPlayerXP(state);
  const playerCurrency = selectors.getPlayerCurrency(state);
  const playerReputation = selectors.getPlayerReputation(state);
  
  // Update DOM elements if they exist
  const elements = {
    level: document.getElementById('player-level'),
    xp: document.getElementById('player-xp'),
    currency: document.getElementById('player-currency'),
    reputation: document.getElementById('player-reputation')
  };
  
  if (elements.level) elements.level.textContent = playerLevel;
  if (elements.xp) elements.xp.textContent = playerXP;
  if (elements.currency) elements.currency.textContent = playerCurrency;
  if (elements.reputation) elements.reputation.textContent = playerReputation;
  
  // Update XP progress bar if it exists
  const xpProgress = document.getElementById('xp-progress');
  if (xpProgress) {
    const xpToNextLevel = state.player?.xpToNextLevel || 100;
    const percentage = Math.min(100, Math.floor((playerXP / xpToNextLevel) * 100));
    xpProgress.style.width = `${percentage}%`;
    xpProgress.setAttribute('aria-valuenow', percentage);
  }
}

// Update character stats in UI
export function updateCharacterStats(state) {
  const characters = ['charlie', 'billy', 'tbd']; // Add more as needed
  
  characters.forEach(character => {
    const stats = selectors.getCharacterStats(state, character);
    const level = selectors.getCharacterLevel(state, character);
    const relationship = selectors.getCharacterRelationship(state, character);
    
    // Update relationship display if it exists
    const relationshipEl = document.getElementById(`${character}-relationship`);
    if (relationshipEl) {
      relationshipEl.textContent = relationship;
      
      // Update relationship tier label if it exists
      const tierEl = document.getElementById(`${character}-tier`);
      if (tierEl) {
        tierEl.textContent = getRelationshipTier(relationship);
      }
    }
    
    // Update character level if it exists
    const levelEl = document.getElementById(`${character}-level`);
    if (levelEl) {
      levelEl.textContent = level;
    }
    
    // Update character stats if they exist
    Object.entries(stats).forEach(([stat, value]) => {
      const statEl = document.getElementById(`${character}-${stat}`);
      if (statEl) {
        statEl.textContent = value;
        
        // Update stat bars if they exist
        const statBar = document.getElementById(`${character}-${stat}-bar`);
        if (statBar) {
          statBar.style.width = `${value}%`;
          statBar.setAttribute('aria-valuenow', value);
        }
      }
    });
  });
}

// Update quest list in UI
export function updateQuestList(state) {
  const questListEl = document.getElementById('quest-list');
  if (!questListEl) return;
  
  // Clear existing quests
  questListEl.innerHTML = '';
  
  // Get quests from state
  const quests = state.quests?.entities || {};
  
  // Sort quests by status (Active first, then Not Started, then Completed)
  const sortedQuests = Object.values(quests).sort((a, b) => {
    const statusOrder = { 'Active': 0, 'Not Started': 1, 'Completed': 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });
  
  // Add quests to the list
  sortedQuests.forEach(quest => {
    const questEl = document.createElement('div');
    questEl.className = `quest-item ${quest.status.toLowerCase().replace(' ', '-')}`;
    questEl.setAttribute('data-quest-id', quest.id);
    
    const progress = selectors.getQuestProgress(state, quest.id);
    const character = quest.character || 'squad';
    
    questEl.innerHTML = `
      <div class="quest-header">
        <h3 class="quest-title">${quest.title}</h3>
        <span class="quest-status ${quest.status.toLowerCase().replace(' ', '-')}">${quest.status}</span>
      </div>
      <div class="quest-description">${quest.description}</div>
      <div class="quest-character ${character}">${character.charAt(0).toUpperCase() + character.slice(1)}'s Quest</div>
      <div class="progress">
        <div class="progress-bar" role="progressbar" style="width: ${progress}%" 
             aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">${progress}%</div>
      </div>
    `;
    
    questEl.addEventListener('click', () => showQuestDetails(quest.id));
    questListEl.appendChild(questEl);
  });
}

// Update inventory in UI
export function updateInventory(state) {
  const inventoryEl = document.getElementById('inventory-list');
  if (!inventoryEl) return;
  
  // Clear existing inventory
  inventoryEl.innerHTML = '';
  
  // Get inventory from state
  const inventory = state.player?.inventory || [];
  
  // Group items by type
  const groupedItems = {};
  inventory.forEach(item => {
    const type = item.type || 'misc';
    if (!groupedItems[type]) {
      groupedItems[type] = [];
    }
    groupedItems[type].push(item);
  });
  
  // Add items to inventory by group
  Object.entries(groupedItems).forEach(([type, items]) => {
    // Create group header
    const groupHeader = document.createElement('div');
    groupHeader.className = 'item-group-header';
    groupHeader.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    inventoryEl.appendChild(groupHeader);
    
    // Add items
    items.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'inventory-item';
      itemEl.setAttribute('data-item-id', item.id);
      
      itemEl.innerHTML = `
        <div class="item-name">${item.name}</div>
        <div class="item-quantity">${item.quantity}</div>
      `;
      
      itemEl.addEventListener('click', () => showItemDetails(item));
      inventoryEl.appendChild(itemEl);
    });
  });
  
  // Update parts count if it exists
  const partsCountEl = document.getElementById('parts-count');
  if (partsCountEl) {
    const totalParts = selectors.getTotalParts(state);
    partsCountEl.textContent = totalParts;
  }
}

// Update locations list in UI
export function updateLocationsList(state) {
  const locationsListEl = document.getElementById('locations-list');
  if (!locationsListEl) return;
  
  // Clear existing locations
  locationsListEl.innerHTML = '';
  
  // Get locations from state
  const locations = state.locations || {};
  
  // Add locations to the list
  Object.entries(locations).forEach(([key, location]) => {
    if (!location.unlocked) return; // Skip locked locations
    
    const locationEl = document.createElement('div');
    locationEl.className = 'location-item';
    locationEl.setAttribute('data-location-key', key);
    
    locationEl.innerHTML = `
      <h3 class="location-name">${location.name}</h3>
      <div class="location-description">${location.description || ''}</div>
    `;
    
    locationEl.addEventListener('click', () => visitLocation(key));
    locationsListEl.appendChild(locationEl);
  });
}

// Show quest details
export function showQuestDetails(questId) {
  const state = store.getState();
  const quest = state.quests?.entities?.[questId];
  if (!quest) return;
  
  // Create modal or update existing modal with quest details
  const modalContent = `
    <h2>${quest.title}</h2>
    <p class="quest-description">${quest.description}</p>
    <div class="quest-meta">
      <span class="quest-difficulty">Difficulty: ${quest.difficulty}</span>
      <span class="quest-status">Status: ${quest.status}</span>
      <span class="quest-character">Character: ${quest.character.charAt(0).toUpperCase() + quest.character.slice(1)}</span>
    </div>
    <h3>Steps:</h3>
    <ul class="quest-steps">
      ${quest.steps.map((step, index) => `
        <li class="${step.completed ? 'completed' : ''}">
          ${step.description}
          ${step.completed ? 
            '<span class="step-status">✓</span>' : 
            `<button class="complete-step-btn" data-quest-id="${questId}" data-step-index="${index}">Complete</button>`
          }
        </li>
      `).join('')}
    </ul>
    <h3>Rewards:</h3>
    <ul class="quest-rewards">
      ${quest.rewards.currency ? `<li>Currency: ${quest.rewards.currency}</li>` : ''}
      ${quest.rewards.reputation ? `<li>Reputation: ${quest.rewards.reputation}</li>` : ''}
      ${quest.rewards.items ? quest.rewards.items.map(item => `<li>Item: ${item}</li>`).join('') : ''}
      ${quest.rewards.unlocks ? quest.rewards.unlocks.map(unlock => `<li>Unlocks: ${unlock}</li>`).join('') : ''}
    </ul>
  `;
  
  // Show modal (implement your modal system here)
  if (window.showModal) {
    window.showModal('Quest Details', modalContent);
  } else {
    alert(`Quest: ${quest.title}\n\nStatus: ${quest.status}\nProgress: ${quest.progress}%`);
  }
}

// Show item details
export function showItemDetails(item) {
  // Create modal or update existing modal with item details
  const modalContent = `
    <h2>${item.name}</h2>
    <div class="item-meta">
      <p>Type: ${item.type || 'Misc'}</p>
      <p>Value: ${item.value || 0}</p>
      <p>Quantity: ${item.quantity || 1}</p>
    </div>
  `;
  
  // Show modal (implement your modal system here)
  if (window.showModal) {
    window.showModal('Item Details', modalContent);
  } else {
    alert(`Item: ${item.name}\n\nType: ${item.type || 'Misc'}\nValue: ${item.value || 0}\nQuantity: ${item.quantity || 1}`);
  }
}

// Visit a location
export function visitLocation(locationKey) {
  const state = store.getState();
  const location = state.locations?.[locationKey];
  if (!location) return;
  
  // Get location quote from character if available
  const quote = getLocationQuote(location, 'charlie'); // Default to Charlie
  
  // Create modal or update existing modal with location details
  const modalContent = `
    <h2>${location.name}</h2>
    <p class="location-description">${location.description}</p>
    ${quote ? `<blockquote class="character-quote">${quote}</blockquote>` : ''}
    <h3>Activities:</h3>
    <ul class="location-activities">
      ${location.activities?.map(activity => `
        <li>
          <h4>${activity.name}</h4>
          <p>${activity.description || ''}</p>
          <button class="activity-btn" data-location="${locationKey}" data-activity="${activity.name}">Do Activity</button>
        </li>
      `).join('') || 'No activities available'}
    </ul>
  `;
  
  // Show modal (implement your modal system here)
  if (window.showModal) {
    window.showModal('Location', modalContent);
  } else {
    alert(`Location: ${location.name}\n\n${location.description}`);
  }
}

// Helper function to get relationship tier based on relationship value
function getRelationshipTier(relationshipValue) {
  if (relationshipValue >= 9) return 'Best Friends';
  if (relationshipValue >= 7) return 'Close Friend';
  if (relationshipValue >= 5) return 'Friend';
  if (relationshipValue >= 3) return 'Acquaintance';
  return 'Stranger';
}

// Helper function to get a character's quote about a location
function getLocationQuote(location, character) {
  // This could be expanded with more quotes for each character and location
  const quotes = {
    charlie: {
      workshop: "This is where the magic happens! Pass me that soldering iron!",
      lake: "Billy's always dragging me here. It's peaceful, but I'd rather be wrenching.",
      lab: "TBD's lab is INSANE. This is like sci-fi movie stuff. Don't touch anything!"
    },
    billy: {
      workshop: "Charlie's workshop is a fire hazard, but the guy knows his motors.",
      lake: "The best place to clear your head and catch some dinner. Try not to scare the fish.",
      lab: "I don't understand half the stuff in here, but TBD seems to know what he's doing."
    },
    tbd: {
      workshop: "Charlie's workshop: 78% inefficient layout, 92% effective results. Fascinating.",
      lake: "Optimal conditions for testing waterproof battery enclosures. Also, fish are... nice.",
      lab: "My workspace. Please don't disturb the calibrated equipment. That includes me."
    }
  };
  
  return quotes[character]?.[location.name.toLowerCase().replace(/[^a-z0-9]/g, '')] || null;
}

// Setup adventure UI
export function setupAdventureUI() {
  // Add event listeners and initialize UI components
  console.log("Setting up Adventure UI");
  
  // Load initial data from GameCore
  updateUI();
  
  // Add event listener for back button
  const backButton = document.querySelector('.back-button');
  if (backButton) {
    backButton.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'squad-hq.html';
    });
  }
}

// Render available chapters
export function renderAvailableChapters() {
  const chaptersContainer = document.getElementById('available-chapters');
  if (!chaptersContainer) return;
  
  chaptersContainer.innerHTML = '';
  
  // Get chapters from store
  const state = store.getState();
  const playerLevel = selectors.getPlayerLevel(state);
  
  // Import chapters data
  import('./scenes/chapter1.js').then(chapter1 => {
    import('./scenes/chapter2.js').then(chapter2 => {
      const chapters = [
        {
          id: 1,
          module: chapter1,
          canStart: chapter1.canStartChapter1,
          start: chapter1.startChapter1,
          ...chapter1.chapterData
        },
        {
          id: 2,
          module: chapter2,
          canStart: chapter2.canStartChapter2,
          start: chapter2.startChapter2,
          ...chapter2.chapterData
        }
      ];
      
      // Render each chapter
      chapters.forEach(chapter => {
        const isUnlocked = playerLevel >= chapter.requiredLevel;
        const chapterEl = document.createElement('div');
        chapterEl.className = `quest-card ${chapter.mainCharacter} ${isUnlocked ? 'unlocked' : 'locked'}`;
        
        chapterEl.innerHTML = `
          <div class="quest-difficulty">Level ${chapter.requiredLevel}+</div>
          <h3 class="quest-title">Chapter ${chapter.id}: ${chapter.title}</h3>
          <p class="quest-description">${chapter.description}</p>
          <div class="quest-character">
            <img src="images/surron-${chapter.mainCharacter}-alert-pose.png" alt="${chapter.mainCharacter}">
            <span>${chapter.mainCharacter.charAt(0).toUpperCase() + chapter.mainCharacter.slice(1)}'s Adventure</span>
          </div>
          <div class="quest-rewards">
            <div class="reward-item">
              <span class="reward-label">XP:</span>
              <span class="reward-value">${chapter.rewardXP}</span>
            </div>
            <div class="reward-item">
              <span class="reward-label">SurCoins:</span>
              <span class="reward-value">${chapter.rewardCurrency}</span>
            </div>
          </div>
          <button class="start-chapter-btn" ${!isUnlocked ? 'disabled' : ''}>
            ${isUnlocked ? 'Start Chapter' : `Reach Level ${chapter.requiredLevel} to Unlock`}
          </button>
        `;
        
        // Add event listener for start button
        const startButton = chapterEl.querySelector('.start-chapter-btn');
        if (startButton && isUnlocked) {
          startButton.addEventListener('click', () => {
            if (chapter.start()) {
              // If successful, redirect to adventure-engine.html
              window.location.href = 'adventure-engine.html';
            }
          });
        }
        
        chaptersContainer.appendChild(chapterEl);
      });
    });
  });
}

// Render characters
export function renderCharacters() {
  const charactersContainer = document.getElementById('character-cards');
  if (!charactersContainer) return;
  
  charactersContainer.innerHTML = '';
  
  // Get state
  const state = store.getState();
  const characters = state.characters?.characters || {};
  
  // Render each character
  Object.values(characters).forEach(character => {
    const characterEl = document.createElement('div');
    characterEl.className = `character-card ${character.id}`;
    
    characterEl.innerHTML = `
      <div class="character-header">
        <img src="${character.portrait}" alt="${character.name}" class="character-avatar">
        <div>
          <h3 class="character-name">${character.name}</h3>
          <p class="character-role">Level ${character.level} Squad Member</p>
        </div>
        <div class="character-level">${character.level}</div>
      </div>
      <div class="character-stats">
        ${
          Object.entries(character.stats).map(([stat, value]) => `
            <div class="stat-row">
              <div class="stat-name">${stat.charAt(0).toUpperCase() + stat.slice(1)}</div>
              <div class="stat-bar">
                <div class="stat-fill ${character.id}" style="width: ${value}%"></div>
              </div>
            </div>
          `).join('')
        }
        <div class="stat-row">
          <div class="stat-name">Relationship</div>
          <div class="stat-bar">
            <div class="stat-fill ${character.id}" style="width: ${(character.relationship + 10) * 5}%"></div>
          </div>
        </div>
      </div>
    `;
    
    charactersContainer.appendChild(characterEl);
  });
}

// Render available quests
export function renderAvailableQuests() {
  const questsContainer = document.getElementById('available-quests');
  if (!questsContainer) return;
  
  questsContainer.innerHTML = '';
  
  // Get quests from state
  const state = store.getState();
  const quests = state.quests?.entities || {};
  
  // If no quests, show message
  if (Object.keys(quests).length === 0) {
    questsContainer.innerHTML = `
      <div class="no-quests-message">
        <p>No quests available. Complete Chapter 1 to unlock more quests!</p>
        <button id="start-chapter-1" class="btn">Start Chapter 1</button>
      </div>
    `;
    
    // Add event listener for start chapter 1 button
    const startChapter1Button = document.getElementById('start-chapter-1');
    if (startChapter1Button) {
      startChapter1Button.addEventListener('click', () => {
        import('./scenes/chapter1.js').then(module => {
          if (module.startChapter1()) {
            window.location.href = 'adventure-engine.html';
          }
        });
      });
    }
    
    return;
  }
  
  // Add each quest to container
  Object.values(quests).filter(quest => quest.status !== 'Completed').forEach(quest => {
    const questEl = document.createElement('div');
    questEl.className = `quest-card ${quest.character || 'squad'}`;
    
    questEl.innerHTML = `
      <div class="quest-difficulty">${quest.difficulty || 'Normal'}</div>
      <h3 class="quest-title">${quest.title}</h3>
      <p class="quest-description">${quest.description}</p>
      <div class="quest-character">
        <img src="images/surron-${quest.character || 'charlie'}-alert-pose.png" alt="${quest.character || 'Charlie'}">
        <span>${(quest.character || 'Charlie').charAt(0).toUpperCase() + (quest.character || 'charlie').slice(1)}'s Quest</span>
      </div>
      <div class="quest-progress">
        <div class="quest-progress-fill" style="width: ${quest.progress || 0}%"></div>
      </div>
      <div class="quest-steps">
        ${
          (quest.steps || []).map((step, index) => `
            <div class="quest-step ${step.completed ? 'completed' : ''}">
              ${step.description}
            </div>
          `).join('')
        }
      </div>
      <button class="start-quest-btn">Continue Quest</button>
    `;
    
    // Add event listener to button
    const startButton = questEl.querySelector('.start-quest-btn');
    if (startButton) {
      startButton.addEventListener('click', () => {
        // Set active quest and redirect to appropriate location
        const state = store.getState();
        const locationKey = quest.location || 'workshop';
        const location = state.locations.locations[locationKey];
        
        if (location) {
          // Set active quest and redirect
          store.dispatch({
            type: 'quests/setActiveQuest',
            payload: quest.id
          });
          
          window.location.href = quest.questPage || 'adventure-engine.html';
        }
      });
    }
    
    questsContainer.appendChild(questEl);
  });
}

export default {
  updateUI,
  updatePlayerStats,
  updateCharacterStats,
  updateQuestList,
  updateInventory,
  updateLocationsList,
  showQuestDetails,
  showItemDetails,
  visitLocation,
  setupAdventureUI,
  renderAvailableChapters,
  renderCharacters,
  renderAvailableQuests
}; 