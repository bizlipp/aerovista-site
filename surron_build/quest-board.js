// quest-board.js
import gameBridge from './game/GameBridge.js';

const quests = [
  {
    id: 'heist_planning',
    title: 'Heist Planning',
    description: "Talk to TBD about the warehouse access codes.",
    character: 'tbd',
    requirement: () => {
      try {
        return gameBridge.getPlayerState().level >= 2;
      } catch (e) {
        return false;
      }
    },
    completed: () => {
      try {
        return gameBridge.isMissionCompleted('heist_planning');
      } catch (e) {
        return false;
      }
    },
    reward: () => {
      // Add XP
      gameBridge.addXP(100);
      
      // Add currency
      gameBridge.addCurrency(200);
      
      // Update relationship
      gameBridge.updateRelationship('tbd', 1);
      
      // Add reward item
      gameBridge.addItem('access_codes', 1);
      
      // Show notification
      gameBridge.showToast('+100 XP, +200 SurCoins, +1 TBD relationship, Received Access Codes');
      
      // Update UI after rewards
      if (typeof updatePlayerProfile === 'function') updatePlayerProfile();
      if (typeof updatePlayerLevel === 'function') updatePlayerLevel();
    },
    markComplete: () => {
      gameBridge.completeMission('heist_planning');
      
      // Trigger any related game progression
      unlockNextContent('tbd_quest');
    }
  },
  {
    id: 'fish_delivery',
    title: 'Fish Delivery',
    description: "Catch a fish for Billy and deliver it before it spoils.",
    character: 'billy',
    requirement: () => {
      try {
        return gameBridge.getPlayerState().level >= 1;
      } catch (e) {
        return false;
      }
    },
    completed: () => {
      try {
        return gameBridge.isMissionCompleted('fish_delivery');
      } catch (e) {
        return false;
      }
    },
    reward: () => {
      // Add XP
      gameBridge.addXP(75);
      
      // Add currency
      gameBridge.addCurrency(150);
      
      // Update relationship
      gameBridge.updateRelationship('billy', 1);
      
      // Add reward item
      gameBridge.addItem('fishing_lure_premium', 1);
      
      // Show notification
      gameBridge.showToast('+75 XP, +150 SurCoins, +1 Billy relationship, Received Premium Lure');
      
      // Update UI after rewards
      if (typeof updatePlayerProfile === 'function') updatePlayerProfile();
      if (typeof updatePlayerLevel === 'function') updatePlayerLevel();
    },
    markComplete: () => {
      gameBridge.completeMission('fish_delivery');
      
      // Trigger any related game progression
      unlockNextContent('billy_quest');
    }
  },
  {
    id: 'charlie_build_review',
    title: 'Charlie\'s Build Review',
    description: "Show Charlie your latest build and survive the feedback.",
    character: 'charlie',
    requirement: () => {
      try {
        const state = gameBridge.getPlayerState();
        return state && state.builds && state.builds.length >= 1;
      } catch (e) {
        return false;
      }
    },
    completed: () => {
      try {
        return gameBridge.isMissionCompleted('charlie_build_review');
      } catch (e) {
        return false;
      }
    },
    reward: () => {
      // Add XP
      gameBridge.addXP(50);
      
      // Update relationship
      gameBridge.updateRelationship('charlie', 2);
      
      // Add special reward item
      gameBridge.addItem('performance_upgrade_kit', 1);
      
      // Show notification
      gameBridge.showToast('+50 XP, +2 Charlie relationship, Received Performance Upgrade Kit');
      
      // Update UI after rewards
      if (typeof updatePlayerProfile === 'function') updatePlayerProfile();
      if (typeof updatePlayerLevel === 'function') updatePlayerLevel();
    },
    markComplete: () => {
      gameBridge.completeMission('charlie_build_review');
      
      // Trigger any related game progression
      unlockNextContent('charlie_quest');
    }
  }
];

/**
 * Helper function to unlock the next content after quest completion
 * @param {string} questLine - The quest line to progress
 */
function unlockNextContent(questLine) {
  // This would trigger specific content unlocks based on quest completion
  // For now, just trigger a state change event to notify other components
  window.dispatchEvent(new CustomEvent('questProgressionUpdate', {
    detail: { questLine }
  }));
  
  console.log(`Quest line progressed: ${questLine}`);
}

export function initQuestBoard(containerId = 'quest-board') {
  const container = document.getElementById(containerId);
  if (!container) return;

  gameBridge.onReady(() => {
    try {
      container.innerHTML = '<h3>📝 Active Quests</h3>';
      const list = document.createElement('ul');
      list.className = 'quest-list';

      let completedCount = 0;
      let totalCount = 0;

      quests.forEach(quest => {
        try {
          totalCount++;
          if (quest.completed()) {
            completedCount++;
            return;
          }
          
          // Check if quest requirements are met
          if (!quest.requirement()) {
            // For quests not meeting requirements, show locked state
            const li = document.createElement('li');
            li.className = `quest-item ${quest.character} locked`;
            
            const title = document.createElement('strong');
            title.innerHTML = `<span class='quest-char-icon ${quest.character}'>${getIcon(quest.character)}</span> ${quest.title}`;
            
            const desc = document.createElement('p');
            desc.textContent = quest.description;
            
            const lockedInfo = document.createElement('p');
            lockedInfo.className = 'quest-locked-info';
            
            // Show appropriate requirement message
            if (quest.character === 'charlie' && gameBridge.getPlayerState().builds.length < 1) {
              lockedInfo.textContent = 'Requirement: Build a bike first';
            } else {
              lockedInfo.textContent = `Requirement: Level ${quest.character === 'tbd' ? '2' : '1'}`;
            }
            
            li.appendChild(title);
            li.appendChild(desc);
            li.appendChild(lockedInfo);
            list.appendChild(li);
            return;
          }
          
          // Quest is available - create normal quest item
          const li = document.createElement('li');
          li.className = `quest-item ${quest.character}`;

          const title = document.createElement('strong');
          title.innerHTML = `<span class='quest-char-icon ${quest.character}'>${getIcon(quest.character)}</span> ${quest.title}`;

          const desc = document.createElement('p');
          desc.textContent = quest.description;

          const completeBtn = document.createElement('button');
          completeBtn.textContent = 'Complete Quest';
          completeBtn.className = 'btn';
          completeBtn.onclick = () => {
            // First give rewards
            quest.reward();
            
            // Then mark as complete (this saves state)
            quest.markComplete();
            
            // Refresh quest board to reflect changes
            initQuestBoard(containerId);
          };

          li.appendChild(title);
          li.appendChild(desc);
          li.appendChild(completeBtn);
          list.appendChild(li);
        } catch (e) {
          console.error(`Error processing quest: ${quest.id}`, e);
        }
      });

      // Add progress info
      const progressBar = document.createElement('div');
      progressBar.className = 'quest-progress';
      
      // Calculate and show percentage
      const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      
      progressBar.innerHTML = `
        Progress: ${completedCount}/${totalCount} quests completed (${completionPercentage}%)
        <div class="stat-bar" style="margin-top: 5px;">
          <div class="stat-fill charlie" style="width: ${completionPercentage}%;"></div>
        </div>
      `;
      
      container.appendChild(progressBar);
      container.appendChild(list);
      
      // If no active quests, show prompt
      if (list.children.length === 0) {
        const noQuests = document.createElement('p');
        noQuests.textContent = 'All quests completed! Check back later for more adventures.';
        container.appendChild(noQuests);
      }
    } catch (e) {
      console.error("Error initializing quest board:", e);
      container.innerHTML = '<h3>📝 Quests loading...</h3>';
    }
  });
}

function getIcon(character) {
  switch(character) {
    case 'charlie': return '🍕';
    case 'billy': return '🎣';
    case 'tbd': return '🧠';
    default: return '🛠️';
  }
} 
