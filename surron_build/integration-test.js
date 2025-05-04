/**
 * Surron Squad Integration Tests
 * 
 * This file tests that the various components of the game are working together properly:
 * - Player state management
 * - Adventure engine integration
 * - Reward systems
 * - Cross-module functionality
 */

class IntegrationTest {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      tests: []
    };
    
    // Reset player state before running tests
    this.resetState();
  }
  
  // Reset the player state to a clean state
  resetState() {
    // Check if PlayerState exists
    if (typeof PlayerState !== 'undefined') {
      if (window.playerState) {
        window.playerState.reset();
      } else {
        window.playerState = new PlayerState();
        window.playerState.reset();
      }
    } else {
      console.error('PlayerState class not found - tests cannot run');
    }
  }
  
  // Log test results with color
  logResult(name, passed, details = '') {
    const result = {
      name: name,
      passed: passed,
      details: details
    };
    
    this.testResults.tests.push(result);
    
    if (passed) {
      this.testResults.passed++;
      console.log(`%c✓ PASSED: ${name}`, 'color: green; font-weight: bold;');
      if (details) console.log(`  ${details}`);
    } else {
      this.testResults.failed++;
      console.log(`%c✗ FAILED: ${name}`, 'color: red; font-weight: bold;');
      if (details) console.log(`  ${details}`);
    }
  }
  
  // Run all tests
  runTests() {
    console.log('%cStarting Surron Squad Integration Tests', 'color: blue; font-size: 16px; font-weight: bold;');
    
    // Test player state basics
    this.testPlayerStateLoading();
    this.testXPSystem();
    this.testInventorySystem();
    this.testRelationshipSystem();
    
    // Test adventure integration
    this.testAdventureIntegration();
    
    // Output summary
    console.log('%cTest Summary:', 'color: blue; font-size: 14px; font-weight: bold;');
    console.log(`Total Tests: ${this.testResults.passed + this.testResults.failed}`);
    console.log(`%cPassed: ${this.testResults.passed}`, 'color: green;');
    console.log(`%cFailed: ${this.testResults.failed}`, 'color: red;');
    
    // Return the results object
    return this.testResults;
  }
  
  // Test player state loading
  testPlayerStateLoading() {
    if (typeof PlayerState === 'undefined') {
      this.logResult('Player State Loading', false, 'PlayerState class not found');
      return;
    }
    
    try {
      // Create a new player state
      const state = new PlayerState();
      
      // Check that it has the expected properties
      const requiredProps = ['level', 'xp', 'currency', 'inventory', 'relationships'];
      const hasAllProps = requiredProps.every(prop => state.hasOwnProperty(prop));
      
      this.logResult(
        'Player State Loading', 
        hasAllProps, 
        hasAllProps ? 'Player state has all required properties' : 'Missing required properties'
      );
    } catch (error) {
      this.logResult('Player State Loading', false, `Error creating player state: ${error.message}`);
    }
  }
  
  // Test XP and leveling system
  testXPSystem() {
    if (!window.playerState) {
      this.logResult('XP System', false, 'No global playerState found');
      return;
    }
    
    try {
      // Reset state
      window.playerState.reset();
      
      // Initial state check
      const initialLevel = window.playerState.level;
      const initialXP = window.playerState.xp;
      
      if (initialLevel !== 1 || initialXP !== 0) {
        this.logResult('XP System - Initial State', false, `Expected level 1, XP 0 but got level ${initialLevel}, XP ${initialXP}`);
        return;
      }
      
      // Add some XP but not enough to level up
      const smallXP = Math.floor(window.playerState.xpToNextLevel / 2);
      const levelUpResult1 = window.playerState.addXP(smallXP);
      
      if (levelUpResult1 !== null) {
        this.logResult('XP System - Small XP', false, 'Expected no level up but got one');
        return;
      }
      
      if (window.playerState.level !== 1) {
        this.logResult('XP System - Small XP', false, `Level changed unexpectedly to ${window.playerState.level}`);
        return;
      }
      
      // Add enough XP to level up
      const largeXP = window.playerState.xpToNextLevel;
      const levelUpResult2 = window.playerState.addXP(largeXP);
      
      if (levelUpResult2 === null || levelUpResult2.newLevel !== 2) {
        this.logResult('XP System - Level Up', false, 'Expected level up to level 2');
        return;
      }
      
      // Check rewards
      if (!levelUpResult2.rewards || !levelUpResult2.rewards.currency) {
        this.logResult('XP System - Level Rewards', false, 'Expected level up rewards');
        return;
      }
      
      this.logResult('XP System', true, 'XP System functioning correctly');
    } catch (error) {
      this.logResult('XP System', false, `Error testing XP system: ${error.message}`);
    }
  }
  
  // Test inventory management
  testInventorySystem() {
    if (!window.playerState) {
      this.logResult('Inventory System', false, 'No global playerState found');
      return;
    }
    
    try {
      // Reset state
      window.playerState.reset();
      
      // Check initial inventory
      if (window.playerState.inventory.length !== 0) {
        this.logResult('Inventory System - Initial State', false, `Expected empty inventory but found ${window.playerState.inventory.length} items`);
        return;
      }
      
      // Add an item
      window.playerState.addItem('test_item');
      
      // Check inventory has the item
      if (window.playerState.inventory.length !== 1) {
        this.logResult('Inventory System - Add Item', false, `Expected 1 item but found ${window.playerState.inventory.length}`);
        return;
      }
      
      // Add the same item again to check quantity
      window.playerState.addItem('test_item');
      
      // Should still have 1 item but quantity 2
      if (window.playerState.inventory.length !== 1) {
        this.logResult('Inventory System - Add Duplicate', false, `Expected 1 item but found ${window.playerState.inventory.length}`);
        return;
      }
      
      const item = window.playerState.inventory.find(i => i.id === 'test_item');
      if (!item || item.quantity !== 2) {
        this.logResult('Inventory System - Item Quantity', false, `Expected item quantity 2 but found ${item ? item.quantity : 'no item'}`);
        return;
      }
      
      this.logResult('Inventory System', true, 'Inventory system functioning correctly');
    } catch (error) {
      this.logResult('Inventory System', false, `Error testing inventory system: ${error.message}`);
    }
  }
  
  // Test character relationship system
  testRelationshipSystem() {
    if (!window.playerState) {
      this.logResult('Relationship System', false, 'No global playerState found');
      return;
    }
    
    try {
      // Reset state
      window.playerState.reset();
      
      // Check initial relationship values
      const characters = ['charlie', 'billy', 'tbd'];
      const initialCheckPassed = characters.every(char => 
        window.playerState.relationships[char] === 1
      );
      
      if (!initialCheckPassed) {
        this.logResult('Relationship System - Initial Values', false, 'Expected all relationships to start at 1');
        return;
      }
      
      // Increase relationship with charlie
      window.playerState.changeRelationship('charlie', 2);
      
      // Check relationship increased
      if (window.playerState.relationships.charlie !== 3) {
        this.logResult('Relationship System - Increase', false, `Expected Charlie relationship 3 but got ${window.playerState.relationships.charlie}`);
        return;
      }
      
      // Check bounds (shouldn't go above 10)
      window.playerState.changeRelationship('charlie', 10);
      if (window.playerState.relationships.charlie !== 10) {
        this.logResult('Relationship System - Upper Bound', false, `Expected Charlie relationship 10 but got ${window.playerState.relationships.charlie}`);
        return;
      }
      
      // Check lower bound (shouldn't go below 1)
      window.playerState.changeRelationship('charlie', -20);
      if (window.playerState.relationships.charlie !== 1) {
        this.logResult('Relationship System - Lower Bound', false, `Expected Charlie relationship 1 but got ${window.playerState.relationships.charlie}`);
        return;
      }
      
      this.logResult('Relationship System', true, 'Relationship system functioning correctly');
    } catch (error) {
      this.logResult('Relationship System', false, `Error testing relationship system: ${error.message}`);
    }
  }
  
  // Test adventure engine integration
  testAdventureIntegration() {
    // This test would need a mounted DOM to fully test
    // Instead, we'll just check that the integration points exist
    
    if (!window.playerState) {
      this.logResult('Adventure Integration', false, 'No global playerState found');
      return;
    }
    
    try {
      // Check that adventure progress exists in player state
      if (!window.playerState.hasOwnProperty('adventureProgress')) {
        this.logResult('Adventure Integration - Progress Tracking', false, 'Missing adventureProgress property');
        return;
      }
      
      if (!window.playerState.adventureProgress.hasOwnProperty('completedScenes')) {
        this.logResult('Adventure Integration - Completed Scenes', false, 'Missing completedScenes array');
        return;
      }
      
      // Check completeScene method exists
      if (typeof window.playerState.completeScene !== 'function') {
        this.logResult('Adventure Integration - Scene Completion', false, 'Missing completeScene method');
        return;
      }
      
      // Test the scene completion method
      window.playerState.completeScene('test-scene');
      
      if (!window.playerState.adventureProgress.completedScenes.includes('test-scene')) {
        this.logResult('Adventure Integration - Scene Tracking', false, 'Scene was not added to completedScenes');
        return;
      }
      
      this.logResult('Adventure Integration', true, 'Adventure integration points exist and function correctly');
    } catch (error) {
      this.logResult('Adventure Integration', false, `Error testing adventure integration: ${error.message}`);
    }
  }
}

// Execute tests and show results on page load
document.addEventListener('DOMContentLoaded', function() {
  // Create test container
  const container = document.createElement('div');
  container.style.maxWidth = '800px';
  container.style.margin = '2rem auto';
  container.style.padding = '2rem';
  container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  container.style.borderRadius = '12px';
  container.style.color = 'white';
  
  document.body.appendChild(container);
  
  // Add header
  const header = document.createElement('h1');
  header.textContent = 'Surron Squad Integration Tests';
  header.style.color = '#39FF14';
  header.style.fontFamily = 'Bangers, cursive';
  header.style.marginTop = '0';
  container.appendChild(header);
  
  // Add instructions
  const instructions = document.createElement('p');
  instructions.textContent = 'Open the browser console (F12) to see detailed test results.';
  container.appendChild(instructions);
  
  // Wait for player state to be loaded
  const waitForTests = document.createElement('p');
  waitForTests.textContent = 'Waiting for player state to be ready...';
  container.appendChild(waitForTests);
  
  // Listen for player state ready
  document.addEventListener('playerStateReady', function() {
    // Run tests
    waitForTests.textContent = 'Running tests...';
    
    setTimeout(() => {
      const test = new IntegrationTest();
      const results = test.runTests();
      
      // Update UI with results
      waitForTests.textContent = 'Tests completed!';
      
      // Create results summary
      const summary = document.createElement('div');
      summary.style.marginTop = '2rem';
      
      const total = results.passed + results.failed;
      const passPercent = Math.round((results.passed / total) * 100);
      
      summary.innerHTML = `
        <h2>Test Summary</h2>
        <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
          <div style="flex: 1; padding: 1rem; background-color: rgba(0, 255, 0, 0.2); border-radius: 8px; text-align: center;">
            <div style="font-size: 2rem; font-weight: bold; color: #39FF14;">${results.passed}</div>
            <div>PASSED</div>
          </div>
          <div style="flex: 1; padding: 1rem; background-color: rgba(255, 0, 0, 0.2); border-radius: 8px; text-align: center;">
            <div style="font-size: 2rem; font-weight: bold; color: #FF3939;">${results.failed}</div>
            <div>FAILED</div>
          </div>
        </div>
        <div style="height: 24px; background-color: rgba(0, 0, 0, 0.5); border-radius: 12px; overflow: hidden; margin-bottom: 1rem;">
          <div style="height: 100%; width: ${passPercent}%; background-color: #39FF14;"></div>
        </div>
        <p>${passPercent}% of tests passing</p>
      `;
      
      container.appendChild(summary);
      
      // Add detailed results
      const details = document.createElement('div');
      details.innerHTML = '<h2>Test Details</h2>';
      
      const list = document.createElement('ul');
      list.style.paddingLeft = '1.5rem';
      
      results.tests.forEach(test => {
        const item = document.createElement('li');
        item.innerHTML = `
          <span style="color: ${test.passed ? '#39FF14' : '#FF3939'}">${test.passed ? '✓' : '✗'}</span>
          <span style="font-weight: bold; margin-left: 0.5rem;">${test.name}</span>
        `;
        
        if (test.details) {
          const detailsText = document.createElement('div');
          detailsText.textContent = test.details;
          detailsText.style.fontSize = '0.9rem';
          detailsText.style.marginLeft = '1.5rem';
          detailsText.style.opacity = '0.8';
          item.appendChild(detailsText);
        }
        
        list.appendChild(item);
      });
      
      details.appendChild(list);
      container.appendChild(details);
      
      // Add return to HQ button
      const backButton = document.createElement('a');
      backButton.textContent = 'Return to Squad HQ';
      backButton.href = 'squad-hq.html';
      backButton.style.display = 'inline-block';
      backButton.style.marginTop = '2rem';
      backButton.style.padding = '0.75rem 1.5rem';
      backButton.style.backgroundColor = '#39FF14';
      backButton.style.color = 'black';
      backButton.style.textDecoration = 'none';
      backButton.style.borderRadius = '8px';
      backButton.style.fontWeight = 'bold';
      
      container.appendChild(backButton);
    }, 500);
  });
}); 