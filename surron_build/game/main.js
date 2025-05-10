// Main game integration file
import { bootGame } from './init.js';
import { store } from '../StateStackULTRA/store/gameStore.js';

document.addEventListener('DOMContentLoaded', async function() {
  // Initialize the state management system
  await bootGame();
  
  console.log('SurRon Squad game initialized with DataStackULTRA state management');
}); 