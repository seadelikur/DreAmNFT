// assets/index.js

// This file exports all assets from a single location for easy imports

// Icons
export { default as icons } from './icons';

// Images
export { default as images } from './images';

// Logo
export * from './logo/logo-data';

// Theme
export { default as theme } from './theme/theme';

// Animations
export * from './animations';

// Sounds
export const sounds = {
  ui: {
    buttonPress: require('./sounds/ui/button_press.mp3'),
    toggleOn: require('./sounds/ui/toggle_on.mp3'),
    toggleOff: require('./sounds/ui/toggle_off.mp3'),
    notification: require('./sounds/ui/notification.mp3'),
    success: require('./sounds/ui/success.mp3'),
    error: require('./sounds/ui/error.mp3'),
  },
  dream: {
    recordStart: require('./sounds/dream/record_start.mp3'),
    recordStop: require('./sounds/dream/record_stop.mp3'),
    timerTick: require('./sounds/dream/timer_tick.mp3'),
  },
  nft: {
    mintSuccess: require('./sounds/nft/mint_success.mp3'),
    purchased: require('./sounds/nft/nft_purchased.mp3'),
    rarityReveal: require('./sounds/nft/rarity_reveal.mp3'),
  },
  stations: {
    ambient1: require('./sounds/stations/ambient_1.mp3'),
    ambient2: require('./sounds/stations/ambient_2.mp3'),
    meditation1: require('./sounds/stations/meditation_1.mp3'),
    meditation2: require('./sounds/stations/meditation_2.mp3'),
  },
  transitions: {
    screenTransition: require('./sounds/transitions/screen_transition.mp3'),
    popIn: require('./sounds/transitions/pop_in.mp3'),
    popOut: require('./sounds/transitions/pop_out.mp3'),
    swipe: require('./sounds/transitions/swipe.mp3'),
  },
};

// Font mapping
export const fonts = {
  regular: require('./fonts/Poppins-Regular.ttf'),
  medium: require('./fonts/Poppins-Medium.ttf'),
  semiBold: require('./fonts/Poppins-SemiBold.ttf'),
  bold: require('./fonts/Poppins-Bold.ttf'),
};

// Export asset loading function
export const loadAllAssets = async () => {
  try {
    // This would handle font loading and other asset initialization
    console.log('Loading all app assets...');

    // In a real app, this would use Font.loadAsync from expo-font
    // and Asset.loadAsync from expo-asset

    return true;
  } catch (error) {
    console.error('Failed to load assets:', error);
    return false;
  }
};