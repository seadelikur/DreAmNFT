import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../styles/theme';

export default function UserListItem({ user, onPress }) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
    >
      <Image
        source={{ uri: user.photoURL || 'https://i.imgur.com/0LKQ3Xv.png' }}
        style={styles.avatar}
      />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{user.displayName || 'Anonymous Dreamer'}</Text>
        <Text style={styles.username}>@{user.username || 'dreamer'}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16
  },
  textContainer: {
    flex: 1
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4
  },
  username: {
    fontSize: 14,
    color: colors.textSecondary
  }
});