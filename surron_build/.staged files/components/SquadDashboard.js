/**
 * SquadDashboard.js
 * Displays squad member relationships and status
 */

import ComponentBase from '../ui/ComponentBase.js';
import { store } from '../../StateStackULTRA/store/gameStore.js';
import { getPlayerLevel } from '../selectors/playerSelectors.js';
import { showToast } from '../../game/popup-toast.js';

export default class SquadDashboard extends ComponentBase {
  constructor() {
    // Listen for changes to player and characters slices
    super(['player', 'characters']);
  }
  
  render(state) {
    if (!this.container) return;
    
    try {
      const playerState = state.player || {};
      const relationships = playerState.relationships || { charlie: 0, billy: 0, tbd: 0 };
      const playerLevel = getPlayerLevel(state);
      
      this.container.innerHTML = `
        <div class="component-container card">
          <h2>Squad Dashboard</h2>
          <p>Player Level: ${playerLevel || 1} - XP: ${playerState.xp || 0}</p>
          
          <div class="squad-relationships">
            ${Object.entries(relationships).map(([character, level]) => `
              <div class="relationship-card ${character}">
                <div class="character-avatar">
                  <img src="images/surron-${character}-default.png" alt="${character}" onerror="this.src='images/placeholder.png'">
                </div>
                <div class="relationship-details">
                  <h3>${character.charAt(0).toUpperCase() + character.slice(1)}</h3>
                  <div class="relationship-level">Relationship: ${level}/10</div>
                  <div class="stat-bar">
                    <div class="stat-fill ${character}" style="width: ${level * 10}%"></div>
                  </div>
                </div>
                <button class="btn-talk" data-character="${character}">Talk</button>
              </div>
            `).join('')}
          </div>
          
          <div class="squad-actions">
            <button id="squad-meeting" class="btn-primary">Squad Meeting</button>
            <button id="team-building" class="btn-secondary">Team Building Activity</button>
          </div>
        </div>
      `;
      
      this.addEventListeners();
    } catch (error) {
      console.error('Error rendering SquadDashboard:', error);
      this.handleRenderError(error);
    }
  }
  
  addEventListeners() {
    // Talk buttons
    const talkButtons = this.container.querySelectorAll('.btn-talk');
    talkButtons.forEach(button => {
      const character = button.dataset.character;
      this.addListener(button, 'click', () => this.handleTalkToCharacter(character));
    });
    
    // Squad meeting button
    const squadMeetingBtn = this.container.querySelector('#squad-meeting');
    if (squadMeetingBtn) {
      this.addListener(squadMeetingBtn, 'click', this.handleSquadMeeting.bind(this));
    }
    
    // Team building button
    const teamBuildingBtn = this.container.querySelector('#team-building');
    if (teamBuildingBtn) {
      this.addListener(teamBuildingBtn, 'click', this.handleTeamBuilding.bind(this));
    }
  }
  
  handleTalkToCharacter(character) {
    // Dispatch action to talk to character
    store.dispatch({
      type: 'characters/talkToCharacter',
      payload: character
    });
    
    // Show toast feedback
    showToast(`Talking to ${character.charAt(0).toUpperCase() + character.slice(1)}...`, 'info');
    
    // Improve relationship
    store.dispatch({
      type: 'player/updateRelationship',
      payload: { character, amount: 1 }
    });
  }
  
  handleSquadMeeting() {
    // Dispatch squad meeting action
    store.dispatch({
      type: 'player/triggerSquadMeeting',
      payload: null
    });
    
    // Show toast feedback
    showToast('Squad meeting in progress...', 'info');
    
    // Improve all relationships
    const characters = ['charlie', 'billy', 'tbd'];
    characters.forEach(character => {
      store.dispatch({
        type: 'player/updateRelationship',
        payload: { character, amount: 1 }
      });
    });
  }
  
  handleTeamBuilding() {
    // Dispatch team building action
    store.dispatch({
      type: 'player/triggerTeamBuilding',
      payload: null
    });
    
    // Show toast feedback
    showToast('Team building activity started!', 'success');
    
    // Improve all relationships by 2
    const characters = ['charlie', 'billy', 'tbd'];
    characters.forEach(character => {
      store.dispatch({
        type: 'player/updateRelationship',
        payload: { character, amount: 2 }
      });
    });
  }
}
