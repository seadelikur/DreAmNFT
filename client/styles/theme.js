// src/styles/theme.js
// Light theme colors
const lightColors = {
  primary: '#6C63FF',
  primaryLight: '#6C63FF20',
  secondary: '#4ECDC4',
  background: '#FFFFFF',
  backgroundLight: '#F7F7F9',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#666687',
  textTertiary: '#8E8EA9',
  border: '#E6E6F2',
  success: '#4CAF50',
  successLight: '#4CAF5020',
  error: '#FF4D4F',
  errorLight: '#FF4D4F20',
  warning: '#FFC107',
  warningLight: '#FFC10720',
  info: '#2196F3',
  infoLight: '#2196F320',
};

// Dark theme colors
const darkColors = {
  primary: '#6C63FF',
  primaryLight: '#6C63FF30',
  secondary: '#4ECDC4',
  background: '#1A1A2E',
  backgroundLight: '#24243C',
  card: '#24243C',
  text: '#F7F7F9',
  textSecondary: '#B0B0CC',
  textTertiary: '#8282A9',
  border: '#33334D',
  success: '#52C41A',
  successLight: '#52C41A30',
  error: '#FF4D4F',
  errorLight: '#FF4D4F30',
  warning: '#FAAD14',
  warningLight: '#FAAD1430',
  info: '#1890FF',
  infoLight: '#1890FF30',
};

// Font families
const fonts = {
  regular: 'System',
  medium: 'System-Medium',
  semiBold: 'System-Semibold',
  bold: 'System-Bold',
};

// Mix based on mode
const getColors = (mode = 'light') => {
  return mode === 'dark' ? darkColors : lightColors;
};

export { getColors, fonts };
export const colors = lightColors; // Default export is light theme