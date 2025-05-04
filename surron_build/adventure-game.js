// Surron Squad Adventure Game - Core Mechanics
class SurronGame {
  constructor() {
    this.player = {
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      reputation: 10,
      currency: 250,
      inventory: []
    };
    
    this.characters = {
      charlie: {
        name: "Charlie \"Throttle\"",
        level: 3,
        relationship: 5, // 1-10 scale
        stats: {
          power: 85,
          control: 35,
          durability: 50,
          pizzaCapacity: 95
        },
        specialSkill: "Voltage Overload",
        questsCompleted: 0
      },
      
      billy: {
        name: "Billy \"Baggin's\"",
        level: 2,
        relationship: 3,
        stats: {
          power: 45,
          control: 65,
          durability: 80,
          fishingSkill: 90
        },
        specialSkill: "Master Angler",
        questsCompleted: 0
      },
      
      tbd: {
        name: "TBD",
        level: 4,
        relationship: 2,
        stats: {
          power: 60,
          control: 90,
          durability: 70,
          techSkills: 98
        },
        specialSkill: "Neural Interface",
        questsCompleted: 0
      }
    };
    
    this.locations = {
      workshop: {
        name: "Charlie's Workshop",
        unlocked: true,
        description: "A cluttered workshop where Charlie builds his crazy mods. Expect pizza boxes, tools everywhere, and the constant smell of burning electronics.",
        activities: [
          {
            name: "Build Crazy Mods",
            requiresLevel: 3,
            rewardXP: 30,
            rewardItems: ["Random Motor Part"]
          },
          {
            name: "Learn Power Tuning",
            requiresQuest: "The First Volt",
            rewardXP: 50,
            rewardSkill: "Increase Charlie's Power stat"
          },
          {
            name: "Pizza Party",
            requiresItem: "Pizza",
            rewardRelationship: 1,
            description: "Share a pizza with the squad. Increases relationship with all characters."
          }
        ]
      },
      
      lake: {
        name: "Billy's Fishing Spot",
        unlocked: true,
        description: "A tranquil lake surrounded by trees, perfect for fishing and testing waterproof electronics. Billy has a small cabin here where he stores fishing gear and bike parts.",
        activities: [
          {
            name: "Go Fishing",
            requiresItem: "Fishing Rod",
            rewardXP: 20,
            rewardItems: ["Fish", "Random Lure"]
          },
          {
            name: "Test Waterproof Mods",
            requiresLevel: 2,
            rewardXP: 40,
            rewardSkill: "Increase Durability stat for all builds"
          },
          {
            name: "Relax and Restore Energy",
            requiresNothing: true,
            rewardEnergy: 50,
            description: "Take a break and enjoy the peaceful lake."
          }
        ]
      },
      
      lab: {
        name: "TBD's Secret Lab",
        unlocked: false,
        requiresLevel: 5,
        description: "A high-tech laboratory filled with cutting-edge equipment. Nobody knows how TBD got all this stuff, and he's not telling.",
        activities: [
          {
            name: "Program Controllers",
            requiresLevel: 5,
            rewardXP: 60,
            rewardItems: ["Programmed Controller"]
          },
          {
            name: "Research Advanced Materials",
            requiresLevel: 6,
            rewardXP: 70,
            rewardItems: ["Advanced Alloy"]
          },
          {
            name: "Analyze Performance Data",
            requiresLevel: 5,
            rewardXP: 50,
            rewardSkill: "Increase TBD's Tech Skills"
          }
        ]
      }
    };
    
    this.quests = {
      theFirstVolt: {
        id: "theFirstVolt",
        title: "The First Volt",
        description: "Complete your first 72V build to unlock Charlie's special power upgrade parts.",
        difficulty: "Beginner",
        status: "Active",
        progress: 60,
        character: "charlie",
        rewards: {
          currency: 100,
          reputation: 5,
          items: ["Power Module"],
          unlocks: ["Charlie Power Upgrade"]
        },
        steps: [
          {
            description: "Visit Charlie's Workshop",
            completed: true
          },
          {
            description: "Select battery components for a 72V build",
            completed: true
          },
          {
            description: "Assemble and test your first 72V battery pack",
            completed: false
          },
          {
            description: "Install the pack and test with Charlie",
            completed: false
          }
        ]
      },
      
      goneFishin: {
        id: "goneFishin",
        title: "Gone Fishin'",
        description: "Join Billy on his fishing trip and learn about waterproofing your electronics while catching some trophy bass.",
        difficulty: "Intermediate",
        status: "Not Started",
        progress: 0,
        character: "billy",
        rewards: {
          currency: 150,
          reputation: 10,
          items: ["Fishing Rod Mount"],
          unlocks: ["Waterproof Build Option"]
        },
        steps: [
          {
            description: "Visit Billy at the lake",
            completed: false
          },
          {
            description: "Catch your first fish",
            completed: false
          },
          {
            description: "Learn about waterproofing electronics",
            completed: false
          },
          {
            description: "Build a waterproof controller housing",
            completed: false
          },
          {
            description: "Test your waterproof build in the lake",
            completed: false
          }
        ]
      },
      
      tbdSecretLab: {
        id: "tbdSecretLab",
        title: "TBD's Secret Lab",
        description: "Gain access to TBD's secret laboratory where cutting-edge Sur-Ron tech is developed.",
        difficulty: "Advanced",
        status: "Locked",
        progress: 0,
        character: "tbd",
        requiresLevel: 5,
        rewards: {
          currency: 300,
          reputation: 20,
          items: ["Programmer Tool"],
          unlocks: ["Advanced Controller Programming"]
        },
        steps: [
          {
            description: "Reach player level 5",
            completed: false
          },
          {
            description: "Find clues about TBD's lab location",
            completed: false
          },
          {
            description: "Solve TBD's security puzzle",
            completed: false
          },
          {
            description: "Gain TBD's trust",
            completed: false
          },
          {
            description: "Access the secret laboratory",
            completed: false
          }
        ]
      }
    };
    
    this.inventory = [
      { 
        id: "battery_cell",
        icon: "🔋",
        name: "Battery Cell",
        description: "High-capacity lithium battery cell. Used in battery pack construction.",
        quantity: 2,
        value: 50,
        category: "Component"
      },
      { 
        id: "motor_part",
        icon: "⚙️",
        name: "Motor Part",
        description: "Component for electric motors. Increases power output.",
        quantity: 4,
        value: 75,
        category: "Component"
      },
      { 
        id: "controller",
        icon: "🔌",
        name: "Controller",
        description: "Basic motor controller. Manages power delivery to the motor.",
        quantity: 1,
        value: 200,
        category: "Component"
      },
      { 
        id: "fishing_rod",
        icon: "🎣",
        name: "Basic Rod",
        description: "Simple fishing rod. Perfect for beginners but won't catch the big ones.",
        quantity: 1,
        value: 100,
        category: "Equipment"
      },
      { 
        id: "wrench",
        icon: "🔧",
        name: "Wrench",
        description: "Standard wrench for bike maintenance.",
        quantity: 3,
        value: 25,
        category: "Tool"
      },
      { 
        id: "hammer",
        icon: "🔨",
        name: "Hammer",
        description: "For when finesse fails. Charlie's favorite tool.",
        quantity: 2,
        value: 20,
        category: "Tool"
      },
      { 
        id: "display",
        icon: "📱",
        name: "Display Unit",
        description: "Digital display showing speed, battery level, and other metrics.",
        quantity: 1,
        value: 150,
        category: "Component"
      },
      { 
        id: "toolkit",
        icon: "🧰",
        name: "Tool Kit",
        description: "Basic toolkit for bike maintenance and modifications.",
        quantity: 1,
        value: 120,
        category: "Tool"
      }
    ];
    
    this.savedBuilds = [];
    this.storyProgress = 5; // percentage
    this.currentChapter = 1;
    
    // Load game if available
    this.loadGame();
  }
  
  // Initialize game and UI
  init() {
    this.updateUI();
    this.setupEventListeners();
  }
  
  // Update UI with current game state
  updateUI() {
    // Update player info
    document.querySelector('.game-level').textContent = `Player Level: ${this.player.level}`;
    
    // Update adventure progress
    document.querySelector('.adventure-stats .stat-value').textContent = `${this.storyProgress}%`;
    document.querySelector('.adventure-stats .stat-fill').style.width = `${this.storyProgress}%`;
    
    // Update character stats
    this.updateCharacterStats();
    
    // Update quest progress
    this.updateQuestProgress();
    
    // Update resources
    const resourceValues = document.querySelectorAll('.stat-card:nth-child(3) .stat-value');
    resourceValues[0].textContent = this.player.currency;
    resourceValues[1].textContent = this.player.reputation;
    resourceValues[2].textContent = this.calculateTotalParts();
  }
  
  // Update character stats in UI
  updateCharacterStats() {
    // Charlie
    const charlieStats = document.querySelector('.character-card.charlie .character-stats');
    const charlieLevel = document.querySelector('.character-card.charlie .character-level');
    charlieLevel.textContent = this.characters.charlie.level;
    
    let statBars = charlieStats.querySelectorAll('.stat-bar');
    statBars[0].querySelector('.stat-fill').style.width = `${this.characters.charlie.stats.power}%`;
    statBars[1].querySelector('.stat-fill').style.width = `${this.characters.charlie.stats.control}%`;
    statBars[2].querySelector('.stat-fill').style.width = `${this.characters.charlie.stats.durability}%`;
    statBars[3].querySelector('.stat-fill').style.width = `${this.characters.charlie.stats.pizzaCapacity}%`;
    
    // Billy
    const billyStats = document.querySelector('.character-card.billy .character-stats');
    const billyLevel = document.querySelector('.character-card.billy .character-level');
    billyLevel.textContent = this.characters.billy.level;
    
    statBars = billyStats.querySelectorAll('.stat-bar');
    statBars[0].querySelector('.stat-fill').style.width = `${this.characters.billy.stats.power}%`;
    statBars[1].querySelector('.stat-fill').style.width = `${this.characters.billy.stats.control}%`;
    statBars[2].querySelector('.stat-fill').style.width = `${this.characters.billy.stats.durability}%`;
    statBars[3].querySelector('.stat-fill').style.width = `${this.characters.billy.stats.fishingSkill}%`;
    
    // TBD
    const tbdStats = document.querySelector('.character-card.tbd .character-stats');
    const tbdLevel = document.querySelector('.character-card.tbd .character-level');
    tbdLevel.textContent = this.characters.tbd.level;
    
    statBars = tbdStats.querySelectorAll('.stat-bar');
    statBars[0].querySelector('.stat-fill').style.width = `${this.characters.tbd.stats.power}%`;
    statBars[1].querySelector('.stat-fill').style.width = `${this.characters.tbd.stats.control}%`;
    statBars[2].querySelector('.stat-fill').style.width = `${this.characters.tbd.stats.durability}%`;
    statBars[3].querySelector('.stat-fill').style.width = `${this.characters.tbd.stats.techSkills}%`;
  }
  
  // Update quest progress in UI
  updateQuestProgress() {
    const questCards = document.querySelectorAll('.quest-card');
    
    // Update first quest (The First Volt)
    const firstVoltQuest = this.quests.theFirstVolt;
    const firstVoltCard = questCards[0];
    const firstVoltProgress = firstVoltCard.querySelector('.stat-fill');
    const firstVoltPercentage = firstVoltCard.querySelector('.quest-progress div:last-child');
    
    firstVoltProgress.style.width = `${firstVoltQuest.progress}%`;
    firstVoltPercentage.textContent = `${firstVoltQuest.progress}%`;
    
    // Update second quest (Gone Fishin')
    const goneFishinQuest = this.quests.goneFishin;
    const goneFishinCard = questCards[1];
    const goneFishinProgress = goneFishinCard.querySelector('.stat-fill');
    const goneFishinPercentage = goneFishinCard.querySelector('.quest-progress div:last-child');
    
    goneFishinProgress.style.width = `${goneFishinQuest.progress}%`;
    goneFishinPercentage.textContent = `${goneFishinQuest.progress}%`;
  }
  
  // Calculate total parts for display
  calculateTotalParts() {
    let total = 0;
    this.inventory.forEach(item => {
      if (item.category === 'Component') {
        total += item.quantity;
      }
    });
    return total;
  }
  
  // Setup event listeners
  setupEventListeners() {
    // This would connect all UI elements to their game functions
    
    // Inventory buttons
    document.getElementById('open-inventory').addEventListener('click', () => {
      this.openInventory();
    });
    
    // Location pins
    const locationPins = document.querySelectorAll('.location-pin');
    locationPins.forEach(pin => {
      pin.addEventListener('click', () => {
        const location = pin.dataset.location;
        this.visitLocation(location);
      });
    });
    
    // Quest progression
    // Character interactions
    // Etc.
  }
  
  // Open inventory
  openInventory() {
    const modal = document.getElementById('inventory-modal');
    modal.style.display = 'flex';
    
    const container = document.getElementById('full-inventory');
    container.innerHTML = '';
    
    this.inventory.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.className = 'inventory-item';
      itemElement.innerHTML = `
        <div class="item-icon">${item.icon}</div>
        <div class="item-quantity">${item.quantity}</div>
        <p class="item-name">${item.name}</p>
      `;
      
      // Add tooltip with item description
      itemElement.title = `${item.name}: ${item.description}\nValue: ${item.value} SurCoins`;
      
      // Add click event to show item details
      itemElement.addEventListener('click', () => {
        this.showItemDetails(item);
      });
      
      container.appendChild(itemElement);
    });
  }
  
  // Show item details
  showItemDetails(item) {
    alert(`${item.name}\n${item.description}\n\nCategory: ${item.category}\nValue: ${item.value} SurCoins\nQuantity: ${item.quantity}`);
    // This would eventually open a proper modal with item details and actions
  }
  
  // Visit a location
  visitLocation(locationKey) {
    const location = this.locations[locationKey];
    const modal = document.getElementById('location-modal');
    modal.style.display = 'flex';
    
    // Set the title
    document.getElementById('location-title').textContent = location.name;
    
    // Get the character associated with this location
    let character;
    if (locationKey === 'workshop') character = this.characters.charlie;
    else if (locationKey === 'lake') character = this.characters.billy;
    else if (locationKey === 'lab') character = this.characters.tbd;
    
    // Create the content
    let content = '';
    
    // Add character image
    let characterImage = '';
    if (locationKey === 'workshop') characterImage = 'images/surron-charlie-alert-pose.png';
    else if (locationKey === 'lake') characterImage = 'images/surron-billy-fishing_ready-pose.png';
    else if (locationKey === 'lab') characterImage = 'images/surron-tbd-terminal-ready.png';
    
    content += `<img src="${characterImage}" alt="${location.name}" style="width: 100%; height: 200px; object-fit: contain; margin-bottom: 1rem;">`;
    
    // Add description
    if (character) {
      content += `<p>"${this.getLocationQuote(locationKey, character)}" - ${character.name}</p>`;
    }
    
    content += `<p>${location.description}</p>`;
    
    // Add activities
    content += `
      <div style="margin-top: 1.5rem;">
        <h4>Available Activities:</h4>
        <ul>
    `;
    
    location.activities.forEach(activity => {
      let isAvailable = true;
      let lockReason = '';
      
      if (activity.requiresLevel && this.player.level < activity.requiresLevel) {
        isAvailable = false;
        lockReason = `Requires Level ${activity.requiresLevel}`;
      } else if (activity.requiresQuest && this.getQuestByTitle(activity.requiresQuest).status !== 'Completed') {
        isAvailable = false;
        lockReason = `Complete "${activity.requiresQuest}" quest first`;
      } else if (activity.requiresItem && !this.hasItem(activity.requiresItem)) {
        isAvailable = false;
        lockReason = `Requires ${activity.requiresItem}`;
      }
      
      if (isAvailable) {
        content += `<li>${activity.name}</li>`;
      } else {
        content += `<li>${activity.name} (LOCKED: ${lockReason})</li>`;
      }
    });
    
    content += `
        </ul>
      </div>
    `;
    
    // Add action button
    if (!location.unlocked) {
      content += `<button class="action-button" style="margin-top: 1.5rem; background-color: #555; cursor: not-allowed;">LOCKED: Reach Level ${location.requiresLevel}</button>`;
    } else {
      content += `<button class="action-button" style="margin-top: 1.5rem;" onclick="game.exploreLocation('${locationKey}')">Visit ${location.name.split("'")[0]}'s Area</button>`;
    }
    
    // Set the content
    document.getElementById('location-content').innerHTML = content;
  }
  
  // Get a random quote for a location
  getLocationQuote(location, character) {
    const quotes = {
      workshop: [
        "Welcome to where the magic happens! Or explosions. Usually explosions.",
        "Don't touch that. Or that. Actually, don't touch anything.",
        "If something catches fire, that's just part of the process."
      ],
      lake: [
        "The only place I get any peace and quiet. Or at least I used to.",
        "The fish aren't biting today. But the mosquitos sure are.",
        "There's a monster bass in this lake. I've named him Goliath."
      ],
      lab: [
        "Access denied. This facility requires proper authorization.",
        "My calculations indicate a 97.3% probability you shouldn't be here.",
        "I've optimized this space for maximum efficiency. Please don't disrupt it."
      ]
    };
    
    const locationQuotes = quotes[location];
    return locationQuotes[Math.floor(Math.random() * locationQuotes.length)];
  }
  
  // Get quest by title
  getQuestByTitle(title) {
    for (const key in this.quests) {
      if (this.quests[key].title === title) {
        return this.quests[key];
      }
    }
    return null;
  }
  
  // Check if player has an item
  hasItem(itemName) {
    for (const item of this.inventory) {
      if (item.name === itemName && item.quantity > 0) {
        return true;
      }
    }
    return false;
  }
  
  // Explore a location (adventure)
  exploreLocation(locationKey) {
    alert(`Exploring ${this.locations[locationKey].name} will be available in the next update!`);
    // This would trigger a mini-game or story progression related to the location
  }
  
  // Progress in a quest
  progressQuest(questId, stepIndex) {
    const quest = this.quests[questId];
    if (!quest) return;
    
    // Mark the step as completed
    if (stepIndex < quest.steps.length) {
      quest.steps[stepIndex].completed = true;
      
      // Calculate new progress percentage
      const completedSteps = quest.steps.filter(step => step.completed).length;
      quest.progress = Math.round((completedSteps / quest.steps.length) * 100);
      
      // Check if quest is completed
      if (quest.progress === 100) {
        quest.status = 'Completed';
        this.completeQuest(questId);
      }
      
      // Update UI
      this.updateQuestProgress();
    }
  }
  
  // Complete a quest
  completeQuest(questId) {
    const quest = this.quests[questId];
    
    // Give rewards
    this.player.currency += quest.rewards.currency;
    this.player.reputation += quest.rewards.reputation;
    
    // Add reward items
    quest.rewards.items.forEach(itemName => {
      this.addItemByName(itemName);
    });
    
    // Advance story if needed
    this.advanceStory(quest);
    
    // Update character relationship
    const character = quest.character;
    if (character && this.characters[character]) {
      this.characters[character].questsCompleted++;
      this.characters[character].relationship += 1;
    }
    
    // Show completion notification
    alert(`Quest Completed: ${quest.title}\n\nRewards:\n- ${quest.rewards.currency} SurCoins\n- ${quest.rewards.reputation} Reputation\n- Items: ${quest.rewards.items.join(', ')}`);
    
    // Update UI
    this.updateUI();
  }
  
  // Add item by name
  addItemByName(itemName) {
    // Find item in inventory
    const existingItem = this.inventory.find(item => item.name === itemName);
    
    if (existingItem) {
      // Increment quantity
      existingItem.quantity++;
    } else {
      // Create new item (simplified)
      this.inventory.push({
        id: itemName.toLowerCase().replace(/\s/g, '_'),
        icon: "📦",
        name: itemName,
        description: "A new item.",
        quantity: 1,
        value: 100,
        category: "Item"
      });
    }
  }
  
  // Advance story based on completed quest
  advanceStory(quest) {
    // Different quests progress the story differently
    let progressIncrease = 0;
    
    switch (quest.id) {
      case 'theFirstVolt':
        progressIncrease = 15;
        break;
      case 'goneFishin':
        progressIncrease = 20;
        break;
      case 'tbdSecretLab':
        progressIncrease = 30;
        break;
      default:
        progressIncrease = 5;
    }
    
    this.storyProgress += progressIncrease;
    
    // Cap at 100%
    if (this.storyProgress > 100) {
      this.storyProgress = 100;
    }
    
    // Check for chapter completion
    if (this.storyProgress >= 100 && this.currentChapter < 3) {
      this.completeChapter();
    }
  }
  
  // Complete a chapter
  completeChapter() {
    this.currentChapter++;
    this.storyProgress = 0;
    
    // Update UI to show chapter transition
    alert(`Chapter ${this.currentChapter-1} Complete!\n\nStarting Chapter ${this.currentChapter}: "${this.getChapterTitle(this.currentChapter)}"`);
    
    // Change chapter title in UI
    document.querySelector('.game-subtitle').textContent = `Chapter ${this.currentChapter}: ${this.getChapterTitle(this.currentChapter)}`;
  }
  
  // Get chapter title
  getChapterTitle(chapter) {
    const titles = [
      "The Voltage Uprising",
      "Lakeside Legends",
      "TBD's Revelation"
    ];
    
    return titles[chapter - 1] || "The Next Chapter";
  }
  
  // Save game to localStorage
  saveGame() {
    const gameData = {
      player: this.player,
      characters: this.characters,
      locations: this.locations,
      quests: this.quests,
      inventory: this.inventory,
      storyProgress: this.storyProgress,
      currentChapter: this.currentChapter
    };
    
    localStorage.setItem('surronSquadAdventure', JSON.stringify(gameData));
  }
  
  // Load game from localStorage
  loadGame() {
    const savedGame = localStorage.getItem('surronSquadAdventure');
    
    if (savedGame) {
      try {
        const gameData = JSON.parse(savedGame);
        
        // Restore all game data
        this.player = gameData.player;
        this.characters = gameData.characters;
        this.locations = gameData.locations;
        this.quests = gameData.quests;
        this.inventory = gameData.inventory;
        this.storyProgress = gameData.storyProgress;
        this.currentChapter = gameData.currentChapter;
        
        console.log('Game loaded successfully!');
      } catch (error) {
        console.error('Error loading game:', error);
      }
    }
    
    // Also load any saved bike builds
    this.loadSavedBuilds();
  }
  
  // Load saved bike builds
  loadSavedBuilds() {
    const savedBuilds = localStorage.getItem('surronSquadBuilds');
    
    if (savedBuilds) {
      try {
        this.savedBuilds = JSON.parse(savedBuilds);
        
        // Update garage stats
        const buildStats = document.querySelector('.stat-card:nth-child(2)');
        const statValues = buildStats.querySelectorAll('.stat-value');
        
        // Show completed builds
        statValues[0].textContent = this.savedBuilds.length;
        
        // For now, just assume 2 builds in progress
        statValues[1].textContent = '2';
      } catch (error) {
        console.error('Error loading saved builds:', error);
      }
    }
  }
}

// Initialize the game when document is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Create global game instance
  window.game = new SurronGame();
  game.init();
  
  // Add auto-save
  setInterval(() => {
    game.saveGame();
  }, 60000); // Save every minute
}); 