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
      gameBridge.addXP(100);
      gameBridge.addCurrency(200);
      gameBridge.updateRelationship('tbd', 1);
      gameBridge.showToast('+100 XP, +200 SurCoins, +1 TBD relationship');
    },
    markComplete: () => {
      gameBridge.completeMission('heist_planning');
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
      gameBridge.addXP(75);
      gameBridge.addCurrency(150);
      gameBridge.updateRelationship('billy', 1);
      gameBridge.showToast('+75 XP, +150 SurCoins, +1 Billy relationship');
    },
    markComplete: () => {
      gameBridge.completeMission('fish_delivery');
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
      gameBridge.addXP(50);
      gameBridge.updateRelationship('charlie', 2);
      gameBridge.showToast('+50 XP, +2 Charlie relationship');
    },
    markComplete: () => {
      gameBridge.completeMission('charlie_build_review');
    }
  }
];

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
          if (!quest.requirement()) return;

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
            quest.reward();
            quest.markComplete();
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

      const progressBar = document.createElement('div');
      progressBar.className = 'quest-progress';
      progressBar.innerHTML = `Progress: ${completedCount}/${totalCount} quests completed`;
      container.appendChild(progressBar);

      container.appendChild(list);
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
