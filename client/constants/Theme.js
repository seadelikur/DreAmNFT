// constants/Theme.js
import Colors from './Colors';
import Dimensions from './Dimensions';

export default {
  colors: Colors,
  spacing: Dimensions.padding,
  borderRadius: Dimensions.borderRadius,
  typography: {
    h1: {
      fontSize: Dimensions.fontSize.title,
      fontWeight: 'bold',
      color: Colors.text.primary
    },
    h2: {
      fontSize: Dimensions.fontSize.extraLarge,
      fontWeight: 'bold',
      color: Colors.text.primary
    },
    h3: {
      fontSize: Dimensions.fontSize.large,
      fontWeight: 'bold',
      color: Colors.text.primary
    },
    body: {
      fontSize: Dimensions.fontSize.regular,
      color: Colors.text.primary
    },
    caption: {
      fontSize: Dimensions.fontSize.small,
      color: Colors.text.secondary
    }
  },
  shadows: {
    small: {
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2
    },
    medium: {
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4
    },
    large: {
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 6
    }
  },
  buttons: {
    primary: {
      backgroundColor: Colors.primary,
      padding: Dimensions.padding.medium,
      borderRadius: Dimensions.borderRadius.medium
    },
    secondary: {
      backgroundColor: Colors.secondary,
      padding: Dimensions.padding.medium,
      borderRadius: Dimensions.borderRadius.medium
    },
    outline: {
      borderColor: Colors.primary,
      borderWidth: 1,
      padding: Dimensions.padding.medium,
      borderRadius: Dimensions.borderRadius.medium
    }
  }
};