// constants/Dimensions.js
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default {
  screenWidth: width,
  screenHeight: height,
  padding: {
    small: 8,
    medium: 16,
    large: 24,
    extraLarge: 32
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 16,
    round: 999
  },
  fontSize: {
    small: 12,
    regular: 14,
    medium: 16,
    large: 18,
    extraLarge: 24,
    title: 32
  },
  iconSize: {
    small: 16,
    medium: 24,
    large: 32
  }
};