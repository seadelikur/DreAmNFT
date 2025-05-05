// src/components/UserCard.js
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../styles/theme';

const UserCard = ({ user, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image
        source={
          user.profileImage
            ? { uri: user.profileImage }
            : require('../assets/images/default-avatar.png')
        }
        style={styles.avatar}
      />

      <View style={styles.infoContainer}>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.bio} numberOfLines={1}>
          {user.bio || 'No bio available'}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="moon-outline" size={14} color={colors.primary} />
            <Text style={styles.statText}>{user.dreamCount || 0} Dreams</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="cube-outline" size={14} color={colors.primary} />
            <Text style={styles.statText}>{user.nftCount || 0} NFTs</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={14} color={colors.primary} />
            <Text style={styles.statText}>{user.followerCount || 0} Followers</Text>
          </View>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    marginLeft: 4,
  },
});

export default UserCard;