/**
 * AeroVista Theme Configuration
 * Centralizes colors, gradients, and styling variables
 */

export const colors = {
  primary: '#00d2ff',
  secondary: '#474dff',
  accent: '#3a47d5',
  hot: '#ff3caf',
  warning: '#ffb347',
  surface: '#1a1d24',
  surfaceAlt: '#242832',
  text: '#ffffff',
  textSoft: '#ffffffcc'
};

export const gradients = {
  primary: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
  hot: `linear-gradient(135deg, ${colors.hot} 0%, ${colors.warning} 100%)`,
  
  // Division specific gradients
  skyforge: 'linear-gradient(135deg, rgba(255, 60, 175, 0.27) 0%, rgba(73, 46, 255, 0.4) 100%)',
  horizon: 'linear-gradient(135deg, rgba(0, 138, 191, 0.27) 0%, rgba(0, 210, 255, 0.2) 100%)',
  vespera: 'linear-gradient(135deg, rgba(255, 60, 175, 0.27) 0%, rgba(255, 179, 71, 0.2) 100%)',
  summit: 'linear-gradient(135deg, rgba(255, 179, 71, 0.2) 0%, rgba(255, 60, 175, 0.27) 100%)',
  lumina: 'linear-gradient(135deg, rgba(58, 71, 213, 0.53) 0%, rgba(196, 113, 237, 0.33) 100%)',
  nexus: 'linear-gradient(135deg, rgba(0, 210, 255, 0.2) 0%, rgba(71, 77, 255, 0.33) 100%)',
  echoverse: 'linear-gradient(135deg, rgba(255, 60, 175, 0.27) 0%, rgba(71, 77, 255, 0.33) 100%)',
  
  // App specific gradients
  bytepad: 'linear-gradient(135deg, rgba(0, 210, 255, 0.2) 0%, rgba(58, 71, 213, 0.53) 100%)',
  vaultmaster: 'linear-gradient(135deg, rgba(255, 60, 175, 0.27) 0%, rgba(58, 71, 213, 0.53) 100%)',
  rydesync: 'linear-gradient(135deg, rgba(71, 77, 255, 0.33) 0%, rgba(0, 210, 255, 0.2) 100%)'
};

export const shadows = {
  card: '0 10px 30px -5px rgba(0, 0, 0, 0.3)',
  neon: `0 0 15px rgba(0, 210, 255, 0.5), 0 0 30px rgba(0, 210, 255, 0.2)`,
  hotNeon: `0 0 15px rgba(255, 60, 175, 0.5), 0 0 30px rgba(255, 60, 175, 0.2)`,
  soft: '0 5px 15px rgba(0, 0, 0, 0.1)',
  text: '0 2px 5px rgba(0, 0, 0, 0.2)',
};

export const borders = {
  radius: {
    small: '4px',
    base: '8px',
    large: '16px',
    round: '50%'
  }
};

export const animations = {
  transition: {
    fast: '0.15s',
    medium: '0.3s',
    slow: '0.5s'
  }
};

export const typography = {
  fontFamily: {
    heading: '"Chakra Petch", sans-serif',
    body: '"Inter", sans-serif'
  },
  fontSize: {
    small: '0.875rem',
    base: '1rem',
    large: '1.25rem',
    xl: '1.5rem',
    xxl: '2rem',
    xxxl: '3rem'
  }
}; 