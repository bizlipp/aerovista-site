/**
 * tuning-challenges.js
 * 
 * Enhanced bike tuning mechanics for Surron Squad
 * Adds progressive difficulty, better rewards, and skill-based challenges
 */

import GameCore from './GameCore.js';
import { store } from '../StateStackULTRA/store/gameStore.js';

/**
 * BikeComponents - Defines available bike components and their tuning properties
 */
export const BikeComponents = {
  // Battery/electrical components
  batteryPack: {
    name: "Battery Pack",
    tuningParams: ["voltage", "capacity", "weight"],
    description: "Power storage for your electric bike.",
    baseStats: {
      voltage: 60,
      capacity: 32,
      weight: 12
    },
    upgrades: [
      {
        name: "72V Battery Pack",
        voltage: 72,
        capacity: 35,
        weight: 13,
        price: 400
      },
      {
        name: "Custom High-Output Pack",
        voltage: 84,
        capacity: 40,
        weight: 14,
        price: 800
      }
    ]
  },
  
  controller: {
    name: "Controller",
    tuningParams: ["amperage", "heatManagement", "programmability"],
    description: "Manages power delivery from battery to motor.",
    baseStats: {
      amperage: 50,
      heatManagement: 60,
      programmability: 40
    },
    upgrades: [
      {
        name: "Programmable Controller",
        amperage: 60,
        heatManagement: 65,
        programmability: 80,
        price: 350
      },
      {
        name: "High-Amp Racing Controller",
        amperage: 80,
        heatManagement: 75,
        programmability: 90,
        price: 650
      }
    ]
  },
  
  // Drivetrain components
  motor: {
    name: "Motor",
    tuningParams: ["power", "torque", "efficiency"],
    description: "Converts electrical energy to mechanical motion.",
    baseStats: {
      power: 65,
      torque: 70,
      efficiency: 80
    },
    upgrades: [
      {
        name: "High-Torque Motor",
        power: 75,
        torque: 85,
        efficiency: 75,
        price: 450
      },
      {
        name: "Racing Motor",
        power: 90,
        torque: 80,
        efficiency: 70,
        price: 850
      }
    ]
  },
  
  // Cooling system
  coolingSystem: {
    name: "Cooling System",
    tuningParams: ["heatDissipation", "weight", "reliability"],
    description: "Prevents motor and controller from overheating.",
    baseStats: {
      heatDissipation: 60,
      weight: 3,
      reliability: 75
    },
    upgrades: [
      {
        name: "Enhanced Heat Sink",
        heatDissipation: 75,
        weight: 3.5,
        reliability: 80,
        price: 200
      },
      {
        name: "Liquid Cooling System",
        heatDissipation: 90,
        weight: 5,
        reliability: 85,
        price: 500
      }
    ]
  },
  
  // Frame and weight reduction
  frame: {
    name: "Frame Modifications",
    tuningParams: ["weight", "strength", "style"],
    description: "Chassis modifications to reduce weight or improve rigidity.",
    baseStats: {
      weight: 50,
      strength: 80,
      style: 60
    },
    upgrades: [
      {
        name: "Lightweight Components",
        weight: 35,
        strength: 75,
        style: 70,
        price: 300
      },
      {
        name: "Carbon Fiber Kit",
        weight: 20,
        strength: 85,
        style: 90,
        price: 900
      }
    ]
  }
};

/**
 * TuningProfiles - Predefined tuning profiles with target ranges
 */
export const TuningProfiles = {
  balanced: {
    name: "Balanced Performance",
    description: "Good all-around performance with balanced power and range.",
    targets: {
      voltage: { min: 60, ideal: 72, max: 76 },
      amperage: { min: 50, ideal: 60, max: 70 },
      power: { min: 60, ideal: 70, max: 80 },
      torque: { min: 65, ideal: 75, max: 85 },
      heatDissipation: { min: 65, ideal: 75, max: 85 },
      weight: { min: 30, ideal: 40, max: 50 }
    },
    difficulty: 1,
    reward: {
      currency: 100,
      xp: 50
    }
  },
  
  speed: {
    name: "Maximum Speed",
    description: "Tuned for top speed at the expense of range and reliability.",
    targets: {
      voltage: { min: 72, ideal: 84, max: 90 },
      amperage: { min: 60, ideal: 75, max: 85 },
      power: { min: 80, ideal: 90, max: 95 },
      torque: { min: 60, ideal: 70, max: 80 },
      heatDissipation: { min: 75, ideal: 85, max: 95 },
      weight: { min: 20, ideal: 30, max: 40 }
    },
    difficulty: 1.5,
    reward: {
      currency: 150,
      xp: 75
    }
  },
  
  offroad: {
    name: "Off-Road Performance",
    description: "Maximum torque and durability for off-road conditions.",
    targets: {
      voltage: { min: 60, ideal: 72, max: 80 },
      amperage: { min: 60, ideal: 70, max: 80 },
      power: { min: 70, ideal: 80, max: 90 },
      torque: { min: 80, ideal: 90, max: 95 },
      heatDissipation: { min: 70, ideal: 80, max: 90 },
      weight: { min: 35, ideal: 45, max: 55 }
    },
    difficulty: 1.3,
    reward: {
      currency: 125,
      xp: 65
    }
  },
  
  efficiency: {
    name: "Maximum Range",
    description: "Optimized for battery efficiency and longest possible range.",
    targets: {
      voltage: { min: 48, ideal: 60, max: 72 },
      amperage: { min: 40, ideal: 50, max: 60 },
      power: { min: 50, ideal: 60, max: 70 },
      torque: { min: 60, ideal: 70, max: 80 },
      heatDissipation: { min: 60, ideal: 70, max: 80 },
      weight: { min: 25, ideal: 35, max: 45 }
    },
    difficulty: 1.2,
    reward: {
      currency: 110,
      xp: 60
    }
  },
  
  extreme: {
    name: "Charlie's Special",
    description: "Charlie's insane custom build. Extremely powerful but difficult to tune correctly.",
    targets: {
      voltage: { min: 82, ideal: 86, max: 90 },
      amperage: { min: 75, ideal: 82, max: 89 },
      power: { min: 85, ideal: 92, max: 98 },
      torque: { min: 80, ideal: 88, max: 95 },
      heatDissipation: { min: 85, ideal: 92, max: 98 },
      weight: { min: 15, ideal: 25, max: 35 }
    },
    difficulty: 2.0,
    reward: {
      currency: 250,
      xp: 125,
      relationship: {
        character: "charlie",
        points: 2
      },
      item: {
        id: "charlie_tuning_kit",
        name: "Charlie's Tuning Kit",
        type: "equipment",
        subType: "tuningTool",
        quality: 3,
        description: "Special tuning tools from Charlie. Increases tuning precision by 20%."
      }
    }
  }
};

/**
 * TuningChallenges - Mini-games for bike tuning
 */
export const TuningChallenges = {
  voltageAdjustment: {
    name: "Voltage Adjustment",
    description: "Precisely adjust the voltage to match the target value.",
    difficulty: 1.0,
    instructions: "Use the slider to set the voltage level. You need to be within 2V of the target value.",
    type: "precision",
    param: "voltage",
    bonusParam: "efficiency"
  },
  
  powerBalancing: {
    name: "Power Balancing",
    description: "Balance power output with heat management.",
    difficulty: 1.2,
    instructions: "Adjust both values to reach a balanced state where power equals heat dissipation capacity.",
    type: "balancing",
    param: "power",
    bonusParam: "heatDissipation"
  },
  
  thermalTuning: {
    name: "Thermal Management",
    description: "Optimize cooling system to handle the power output.",
    difficulty: 1.3,
    instructions: "Keep the temperature gauge in the green zone while increasing power.",
    type: "dynamic",
    param: "heatDissipation",
    bonusParam: "reliability"
  },
  
  torqueOptimization: {
    name: "Torque Optimization",
    description: "Find the sweet spot for maximum torque without overloading the system.",
    difficulty: 1.5,
    instructions: "Increase torque slowly while keeping the system stable.",
    type: "balancing",
    param: "torque",
    bonusParam: "efficiency"
  },
  
  weightReduction: {
    name: "Weight Reduction",
    description: "Carefully choose components to reduce weight without compromising strength.",
    difficulty: 1.4,
    instructions: "Remove components to reduce weight while maintaining structural integrity.",
    type: "balancing",
    param: "weight",
    bonusParam: "strength"
  }
};

/**
 * Enhanced Tuning Game controller class
 */
export class EnhancedTuningGame {
  constructor() {
    // Core state
    this.currentProfile = null;
    this.currentBuild = null;
    this.currentParameters = {};
    this.activeChallenges = [];
    this.completedChallenges = [];
    this.score = 0;
    this.attempts = 0;
    this.maxAttempts = 3;
    this.lastResult = null;
    
    // Player equipment and abilities
    this.playerSkills = {
      tuningPrecision: 1.0,
      heatManagement: 1.0,
      voltageControl: 1.0,
      weightOptimization: 1.0
    };
    
    // Load player skills from state
    this.loadPlayerSkills();
  }
  
  /**
   * Load player skills from saved state
   */
  loadPlayerSkills() {
    const playerState = GameCore.getPlayerState();
    
    if (playerState?.skills?.tuning) {
      this.playerSkills = {
        ...this.playerSkills,
        ...playerState.skills.tuning
      };
    }
    
    // Check inventory for tools that boost skills
    const inventory = playerState?.inventory || [];
    const tuningTools = inventory.filter(item => 
      item.type === 'equipment' && 
      item.subType === 'tuningTool'
    );
    
    // Apply skill boosts from tools
    tuningTools.forEach(tool => {
      if (tool.skillBoosts) {
        Object.keys(tool.skillBoosts).forEach(skill => {
          if (this.playerSkills[skill]) {
            this.playerSkills[skill] += tool.skillBoosts[skill];
          }
        });
      }
    });
  }
  
  /**
   * Initialize a new tuning session
   * @param {string} profileName - Name of the tuning profile to use
   * @param {Object} existingBuild - Optional existing build to start from
   * @returns {Object} Initial tuning session data
   */
  startTuning(profileName = 'balanced', existingBuild = null) {
    // Get profile
    this.currentProfile = TuningProfiles[profileName] || TuningProfiles.balanced;
    
    // Initialize build
    this.currentBuild = existingBuild || {
      batteryPack: { ...BikeComponents.batteryPack.baseStats },
      controller: { ...BikeComponents.controller.baseStats },
      motor: { ...BikeComponents.motor.baseStats },
      coolingSystem: { ...BikeComponents.coolingSystem.baseStats },
      frame: { ...BikeComponents.frame.baseStats }
    };
    
    // Set up aggregated parameters
    this.updateParameters();
    
    // Reset score and attempts
    this.score = 0;
    this.attempts = 0;
    this.completedChallenges = [];
    
    // Generate initial challenges
    this.activeChallenges = this.generateChallenges(3);
    
    return {
      profile: this.currentProfile,
      build: this.currentBuild,
      parameters: this.currentParameters,
      challenges: this.activeChallenges
    };
  }
  
  /**
   * Update aggregated parameters based on component settings
   */
  updateParameters() {
    // Calculate aggregated parameters from component stats
    this.currentParameters = {
      voltage: this.currentBuild.batteryPack.voltage,
      capacity: this.currentBuild.batteryPack.capacity,
      amperage: this.currentBuild.controller.amperage,
      power: this.calculatePower(),
      torque: this.currentBuild.motor.torque,
      efficiency: this.calculateEfficiency(),
      heatDissipation: this.calculateHeatDissipation(),
      weight: this.calculateTotalWeight(),
      strength: this.currentBuild.frame.strength,
      reliability: this.calculateReliability()
    };
  }
  
  /**
   * Calculate power output based on voltage, amperage and efficiency
   * @returns {number} Power value
   */
  calculatePower() {
    const voltage = this.currentBuild.batteryPack.voltage;
    const amperage = this.currentBuild.controller.amperage;
    const motorEfficiency = this.currentBuild.motor.efficiency / 100;
    
    // Power = Voltage * Amperage * Efficiency (normalized to 0-100 scale)
    return Math.min(100, (voltage * amperage * motorEfficiency) / 60);
  }
  
  /**
   * Calculate overall efficiency
   * @returns {number} Efficiency value
   */
  calculateEfficiency() {
    const motorEfficiency = this.currentBuild.motor.efficiency;
    const controllerProgrammability = this.currentBuild.controller.programmability;
    const weight = this.calculateTotalWeight();
    
    // Efficiency improves with better motor, controller, and lower weight
    const weightFactor = Math.max(0, 100 - weight) / 100;
    
    return (motorEfficiency * 0.6) + (controllerProgrammability * 0.2) + (weightFactor * 20);
  }
  
  /**
   * Calculate heat dissipation capability
   * @returns {number} Heat dissipation value
   */
  calculateHeatDissipation() {
    const coolingCapacity = this.currentBuild.coolingSystem.heatDissipation;
    const controllerHeatManagement = this.currentBuild.controller.heatManagement;
    
    return (coolingCapacity * 0.7) + (controllerHeatManagement * 0.3);
  }
  
  /**
   * Calculate total bike weight
   * @returns {number} Weight value
   */
  calculateTotalWeight() {
    return this.currentBuild.batteryPack.weight + 
           this.currentBuild.frame.weight + 
           this.currentBuild.coolingSystem.weight + 
           10; // Base weight for other components
  }
  
  /**
   * Calculate overall reliability
   * @returns {number} Reliability value
   */
  calculateReliability() {
    const heatDissipation = this.calculateHeatDissipation();
    const power = this.calculatePower();
    const coolingReliability = this.currentBuild.coolingSystem.reliability;
    
    // Reliability decreases as power exceeds cooling capacity
    const heatFactor = heatDissipation >= power ? 1 : 1 - ((power - heatDissipation) / 100);
    
    return coolingReliability * heatFactor;
  }
  
  /**
   * Generate tuning challenges based on current build
   * @param {number} count - Number of challenges to generate
   * @returns {Array} Array of challenge objects
   */
  generateChallenges(count = 3) {
    const challenges = [];
    const availableChallenges = Object.values(TuningChallenges);
    
    // Find parameters that need improvement
    const parametersToImprove = [];
    
    Object.keys(this.currentProfile.targets).forEach(param => {
      const target = this.currentProfile.targets[param];
      const current = this.currentParameters[param] || 0;
      
      if (current < target.min || current > target.max) {
        parametersToImprove.push(param);
      }
    });
    
    // If no parameters need improvement, choose random ones
    if (parametersToImprove.length === 0) {
      parametersToImprove.push(...Object.keys(this.currentProfile.targets));
    }
    
    // Create challenges for the parameters that need improvement
    for (let i = 0; i < Math.min(count, parametersToImprove.length); i++) {
      const param = parametersToImprove[i];
      
      // Find a challenge that affects this parameter
      const relevantChallenges = availableChallenges.filter(c => 
        c.param === param || c.bonusParam === param
      );
      
      if (relevantChallenges.length > 0) {
        // Choose a random relevant challenge
        const challenge = relevantChallenges[Math.floor(Math.random() * relevantChallenges.length)];
        
        // Get target value from profile
        const target = this.currentProfile.targets[challenge.param] || 
                       this.currentProfile.targets[challenge.bonusParam];
        
        challenges.push({
          id: `challenge_${i}_${Date.now()}`,
          type: challenge.type,
          name: challenge.name,
          description: challenge.description,
          instructions: challenge.instructions,
          param: challenge.param,
          bonusParam: challenge.bonusParam,
          target: target.ideal,
          minTarget: target.min,
          maxTarget: target.max,
          difficulty: challenge.difficulty * this.currentProfile.difficulty
        });
      }
    }
    
    // If we don't have enough challenges, add some random ones
    while (challenges.length < count) {
      const challenge = availableChallenges[Math.floor(Math.random() * availableChallenges.length)];
      
      // Get target value from profile or default
      const target = this.currentProfile.targets[challenge.param] || 
                    { min: 40, ideal: 70, max: 90 };
      
      challenges.push({
        id: `challenge_${challenges.length}_${Date.now()}`,
        type: challenge.type,
        name: challenge.name,
        description: challenge.description,
        instructions: challenge.instructions,
        param: challenge.param,
        bonusParam: challenge.bonusParam,
        target: target.ideal,
        minTarget: target.min,
        maxTarget: target.max,
        difficulty: challenge.difficulty * this.currentProfile.difficulty
      });
    }
    
    return challenges;
  }
  
  /**
   * Update a component's parameter
   * @param {string} component - Component name
   * @param {string} param - Parameter to update
   * @param {number} value - New value
   * @returns {Object} Updated parameters
   */
  updateComponent(component, param, value) {
    // Check if component and parameter exist
    if (this.currentBuild[component] && 
        this.currentBuild[component][param] !== undefined) {
      
      // Update the value
      this.currentBuild[component][param] = value;
      
      // Recalculate parameters
      this.updateParameters();
      
      return this.currentParameters;
    }
    
    return null;
  }
  
  /**
   * Complete a tuning challenge
   * @param {string} challengeId - ID of the challenge to complete
   * @param {Object} result - Challenge result data
   * @returns {Object} Completion result
   */
  completeChallenge(challengeId, result) {
    // Find the challenge
    const challengeIndex = this.activeChallenges.findIndex(c => c.id === challengeId);
    
    if (challengeIndex === -1) {
      return { success: false, error: "Challenge not found" };
    }
    
    const challenge = this.activeChallenges[challengeIndex];
    
    // Remove from active challenges
    this.activeChallenges.splice(challengeIndex, 1);
    
    // Calculate score based on how close to the target value
    let score = 0;
    const targetValue = challenge.target;
    const resultValue = result.value || 0;
    
    // Calculate difference as percentage of range
    const range = challenge.maxTarget - challenge.minTarget;
    const difference = Math.abs(targetValue - resultValue);
    const percentageDiff = (difference / range) * 100;
    
    // Score decreases as difference increases (max score 100)
    score = Math.max(0, 100 - percentageDiff);
    
    // Apply player skill bonus
    const skillBonus = this.getSkillBonusForChallenge(challenge);
    score = Math.min(100, score * skillBonus);
    
    // Update build parameters based on challenge result
    if (score >= 60) { // Success threshold
      // Update the primary parameter
      const component = this.getComponentForParameter(challenge.param);
      if (component) {
        this.updateComponent(component.name, component.param, resultValue);
      }
      
      // Smaller update to bonus parameter if applicable
      if (challenge.bonusParam) {
        const bonusComponent = this.getComponentForParameter(challenge.bonusParam);
        if (bonusComponent) {
          const currentValue = this.currentBuild[bonusComponent.name][bonusComponent.param];
          const bonusImprovement = (score / 100) * 10; // Max 10% improvement
          
          const newValue = Math.min(100, currentValue + bonusImprovement);
          this.updateComponent(bonusComponent.name, bonusComponent.param, newValue);
        }
      }
    }
    
    // Add to completed challenges
    this.completedChallenges.push({
      ...challenge,
      score,
      result: resultValue
    });
    
    // Update overall score
    this.score = this.calculateOverallScore();
    
    // Increment attempts
    this.attempts++;
    
    // Return result
    return {
      success: true,
      score,
      currentParameters: this.currentParameters,
      overallScore: this.score,
      attemptsRemaining: this.maxAttempts - this.attempts
    };
  }
  
  /**
   * Find which component controls a given parameter
   * @param {string} param - Parameter name
   * @returns {Object|null} Component info
   */
  getComponentForParameter(param) {
    for (const [componentName, component] of Object.entries(BikeComponents)) {
      if (component.tuningParams.includes(param)) {
        return {
          name: componentName,
          param: param
        };
      }
    }
    
    return null;
  }
  
  /**
   * Get skill bonus for a specific challenge
   * @param {Object} challenge - Challenge object
   * @returns {number} Skill bonus multiplier
   */
  getSkillBonusForChallenge(challenge) {
    switch(challenge.param) {
      case 'voltage':
        return this.playerSkills.voltageControl;
      case 'heatDissipation':
        return this.playerSkills.heatManagement;
      case 'weight':
        return this.playerSkills.weightOptimization;
      default:
        return this.playerSkills.tuningPrecision;
    }
  }
  
  /**
   * Calculate overall score based on completed challenges
   * @returns {number} Overall score
   */
  calculateOverallScore() {
    if (this.completedChallenges.length === 0) return 0;
    
    const totalScore = this.completedChallenges.reduce((sum, challenge) => sum + challenge.score, 0);
    return Math.round(totalScore / this.completedChallenges.length);
  }
  
  /**
   * Evaluate the final bike build
   * @returns {Object} Evaluation result
   */
  evaluateBuild() {
    // Calculate how well the build meets the target profile
    const targetParams = Object.keys(this.currentProfile.targets);
    let totalScore = 0;
    let maxPossibleScore = 0;
    
    targetParams.forEach(param => {
      const target = this.currentProfile.targets[param];
      const current = this.currentParameters[param] || 0;
      
      // Calculate parameter score (0-100)
      let paramScore = 0;
      
      if (current < target.min) {
        // Too low
        paramScore = Math.max(0, 50 - ((target.min - current) * 2));
      } else if (current > target.max) {
        // Too high
        paramScore = Math.max(0, 50 - ((current - target.max) * 2));
      } else if (current < target.ideal) {
        // Between min and ideal
        paramScore = 50 + ((current - target.min) / (target.ideal - target.min)) * 50;
      } else {
        // Between ideal and max
        paramScore = 100 - ((current - target.ideal) / (target.max - target.ideal)) * 50;
      }
      
      totalScore += paramScore;
      maxPossibleScore += 100;
    });
    
    // Calculate final percentage score
    const finalScore = Math.round((totalScore / maxPossibleScore) * 100);
    
    // Generate Charlie's comment based on score
    let comment = "";
    if (finalScore >= 90) {
      comment = "PERFECT! This thing's going to RIP! You've got the Charlie stamp of approval!";
    } else if (finalScore >= 75) {
      comment = "Pretty solid build. Let's push it a bit further next time, but this'll definitely shred!";
    } else if (finalScore >= 60) {
      comment = "Not bad for a beginner. It'll ride, but it's not gonna win any races.";
    } else if (finalScore >= 40) {
      comment = "Is this a bicycle? WHERE'S THE POWER? Back to the drawing board!";
    } else {
      comment = "Did you even try? My grandma could build better than this. SERIOUSLY disappointed.";
    }
    
    // Calculate rewards based on score and profile
    const rewards = this.calculateRewards(finalScore);
    
    // Apply rewards
    this.applyRewards(rewards);
    
    // Store the result
    this.lastResult = {
      score: finalScore,
      comment,
      parameters: { ...this.currentParameters },
      rewards
    };
    
    return this.lastResult;
  }
  
  /**
   * Calculate rewards based on final score
   * @param {number} score - Final evaluation score
   * @returns {Object} Rewards object
   */
  calculateRewards(score) {
    const profile = this.currentProfile;
    const baseRewards = profile.reward;
    
    // Scale rewards based on score
    const scaleFactor = score / 100;
    
    return {
      currency: Math.round(baseRewards.currency * scaleFactor),
      xp: Math.round(baseRewards.xp * scaleFactor),
      relationship: baseRewards.relationship && score >= 80 ? baseRewards.relationship : null,
      item: baseRewards.item && score >= 90 ? baseRewards.item : null
    };
  }
  
  /**
   * Apply rewards to player state
   * @param {Object} rewards - Rewards to apply
   */
  applyRewards(rewards) {
    // Add currency
    if (rewards.currency > 0) {
      GameCore.addCurrency(rewards.currency);
    }
    
    // Add XP
    if (rewards.xp > 0) {
      GameCore.addXP(rewards.xp);
    }
    
    // Improve relationship if applicable
    if (rewards.relationship) {
      const { character, points } = rewards.relationship;
      const playerState = GameCore.getPlayerState();
      const relationships = playerState.relationships || {};
      const currentLevel = relationships[character] || 0;
      
      store.dispatch({
        type: 'player/updateRelationship',
        payload: {
          character,
          level: currentLevel + points
        }
      });
    }
    
    // Add item if applicable
    if (rewards.item) {
      GameCore.addItem(rewards.item);
    }
  }
  
  /**
   * Save the current build
   * @param {string} name - Build name
   * @returns {Object} Saved build data
   */
  saveBuild(name) {
    const build = {
      id: `build_${Date.now()}`,
      name: name || `${this.currentProfile.name} Build`,
      components: { ...this.currentBuild },
      parameters: { ...this.currentParameters },
      profile: this.currentProfile.name,
      score: this.score,
      timestamp: Date.now()
    };
    
    // Save to localStorage
    const savedBuilds = JSON.parse(localStorage.getItem('surronSquadBuilds') || '[]');
    savedBuilds.push(build);
    localStorage.setItem('surronSquadBuilds', JSON.stringify(savedBuilds));
    
    return build;
  }
}

// Create singleton instance
const enhancedTuningGame = new EnhancedTuningGame();

export default enhancedTuningGame; 