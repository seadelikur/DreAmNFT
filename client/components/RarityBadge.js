// components/RarityBadge.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const RarityBadge = ({ rarity, style }) => {
  let badgeStyle = {};
  let iconName = '';
  let rarityText = '';

  switch (rarity) {
    case 'common':
      badgeStyle = styles.commonBadge;
      iconName = 'star-outline';
      rarityText = 'Common';
      break;
    case 'uncommon':
      badgeStyle = styles.uncommonBadge;
      iconName = 'star-half-full';
      rarityText = 'Uncommon';
      break;
    case 'rare':
      badgeStyle = styles.rareBadge;
      iconName = 'star';
      rarityText = 'Rare';
      break;
    case 'epic':
      badgeStyle = styles.epicBadge;
      iconName = 'star-face';
      rarityText = 'Epic';
      break;
    case 'legendary':
      badgeStyle = styles.legendaryBadge;
      iconName = 'star-circle';
      rarityText = 'Legendary';
      break;
    default:
      return null;
  }

  return (
    <View style={[styles.badge, badgeStyle, style]}>
      <MaterialCommunityIcons name={iconName} size={16} color="#fff" />
      <Text style={styles.rarityText}>{rarityText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  commonBadge: {
    backgroundColor: '#78909C', // Blue Grey
  },
  uncommonBadge: {
    backgroundColor: '#66BB6A', // Green
  },
  rareBadge: {
    backgroundColor: '#42A5F5', // Blue
  },
  epicBadge: {
    backgroundColor: '#AB47BC', // Purple
  },
  legendaryBadge: {
    backgroundColor: '#FFA000', // Amber
  },
  rarityText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 12,
  },
});

export default RarityBadge;