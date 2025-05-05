import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '../styles/theme';
import Button from './Button'; // Assuming you have a Button component

export default function EmptyState({
  icon = require('../assets/images/empty-box.png'), // Add this image to your assets
  title = "Nothing here yet",
  description = "When items appear, they'll show up here",
  buttonText,
  onPress
}) {
  return (
    <View style={styles.container}>
      <Image
        source={icon}
        style={styles.icon}
        resizeMode="contain"
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {buttonText && (
        <Button
          title={buttonText}
          onPress={onPress}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  icon: {
    width: 120,
    height: 120,
    marginBottom: 24,
    tintColor: colors.primary
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center'
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24
  },
  button: {
    width: '60%'
  }
});