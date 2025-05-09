// quest-board.js
import GameCore from './game/GameCore.js';

const quests = [
  {
    id: 'heist_planning',
    title: 'Heist Planning',
    description: "Talk to TBD about the warehouse access codes.",
    character: 'tbd',
    requirement: () => GameCore.getPlayerState().level >= 2,
    completed: () => GameCore.getPlayerState().completedMissions?.includes('heist_planning'),
    reward: () => {
      GameCore.addXP(100);
      GameCore.addCurrency(200);
      GameCore.updateRelationship('tbd', 1);
    },
    markComplete: () => {
      const state = GameCore.getPlayerState();
      if (!state.completedMissions.includes('heist_planning')) {
        state.completedMissions.push('heist_planning');
        GameCore.save();
        dispatchEvent(new CustomEvent('questCompleted', { detail: 'heist_planning' }));
      }
    }
  },
  {
    id: 'fish_delivery',
    title: 'Fish Delivery',
    description: "Catch a fish for Billy and deliver it before it spoils.",
    character: 'billy',
    requirement: () => GameCore.getPlayerState().level >= 1,
    completed: () => GameCore.getPlayerState().completedMissions?.includes('fish_delivery'),
    reward: () => {
      GameCore.addXP(75);
      GameCore.addCurrency(150);
      GameCore.updateRelationship('billy', 1);
    },
    markComplete: () => {
      const state = GameCore.getPlayerState();
      if (!state.completedMissions.includes('fish_delivery')) {
        state.completedMissions.push('fish_delivery');
        GameCore.save();
        dispatchEvent(new CustomEvent('questCompleted', { detail: 'fish_delivery' }));
      }
    }
  },
  {
    id: 'charlie_build_review',
    title: 'Charlie\'s Build Review',
    description: "Show Charlie your latest build and survive the feedback.",
    character: 'charlie',
    requirement: () => GameCore.getPlayerState().builds?.length >= 1,
    completed: () => GameCore.getPlayerState().completedMissions?.includes('charlie_build_review'),
    reward: () => {
      GameCore.addXP(50);
      GameCore.updateRelationship('charlie', 2);
    },
    markComplete: () => {
      const state = GameCore.getPlayerState();
      if (!state.completedMissions.includes('charlie_build_review')) {
        state.completedMissions.push('charlie_build_review');
        GameCore.save();
        dispatchEvent(new CustomEvent('questCompleted', { detail: 'charlie_build_review' }));
      }
    }
  }
];

export function initQuestBoard(containerId = 'quest-board') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '<h3>📝 Active Quests</h3>';
  const list = document.createElement('ul');
  list.className = 'quest-list';

  let completedCount = 0;
  let totalCount = 0;

  quests.forEach(quest => {
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
  });

  const progressBar = document.createElement('div');
  progressBar.className = 'quest-progress';
  progressBar.innerHTML = `Progress: ${completedCount}/${totalCount} quests completed`;
  container.appendChild(progressBar);

  container.appendChild(list);
}

function getIcon(character) {
  switch(character) {
    case 'charlie': return '🍕';
    case 'billy': return '🎣';
    case 'tbd': return '🧠';
    default: return '🛠️';
  }
} 
