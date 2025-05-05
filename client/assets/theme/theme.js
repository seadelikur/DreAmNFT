// assets/theme/theme.js

import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Primary Colors
const COLORS = {
  primary: '#6A0DAD', // Deep Purple
  primaryLight: '#9B59B6', // Light Purple
  primaryDark: '#4A148C', // Dark Purple

  secondary: '#F1C40F', // Gold/Yellow for accents

  background: '#F8F8FA', // Light Background
  backgroundDark: '#131229', // Dark Background

  text: '#333333', // Text Color
  textLight: '#666666', // Secondary Text
  textDark: '#111111', // Dark Text
  textInverse: '#FFFFFF', // White text for dark backgrounds

  success: '#27AE60', // Green
  error: '#E74C3C', // Red
  warning: '#F39C12', // Orange
  info: '#3498DB', // Blue

  border: '#E0E0E0', // Light Border
  divider: '#EEEEEE', // Divider Color

  card: '#FFFFFF', // Card Background
  cardDark: '#1E1E30', // Dark Card Background

  shadow: 'rgba(0, 0, 0, 0.1)', // Shadow Color
  overlay: 'rgba(0, 0, 0, 0.5)', // Overlay Color
};

// Typography
const FONT = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semiBold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',

  size: {
    xs: 10,
    small: 12,
    medium: 14,
    large: 16,
    xl: 18,
    xxl: 22,
    xxxl: 24,
    title: 30,
  },
};

// Spacing
const SPACING = {
  xs: 4,
  small: 8,
  medium: 16,
  large: 24,
  xl: 32,
  xxl: 40,
};

// Border Radius
const RADIUS = {
  small: 4,
  medium: 8,
  large: 12,
  xl: 20,
  round: 50,
};

// Shadow styles
const SHADOWS = {
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 8,
  },
};

// Gradients
const GRADIENTS = {
  primary: ['#6A0DAD', '#9B59B6'],
  secondary: ['#F1C40F', '#F39C12'],
  card: ['#FFFFFF', '#F8F8FA'],
  dark: ['#131229', '#1E1E30'],
};

// Screen dimensions utility
const SIZES = {
  width,
  height,
  isSmallDevice: width < 375,
};

export default {
  COLORS,
  FONT,
  SPACING,
  RADIUS,
  SHADOWS,
  GRADIENTS,
  SIZES,
};