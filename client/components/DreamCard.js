// components/DreamCard.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import RarityBadge from './RarityBadge';

const DreamCard = ({ dream, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {dream.imageUrl ? (
        <Image source={{ uri: dream.imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.noImage}>
          <Ionicons name="image-outline" size={40} color="#ccc" />
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{dream.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{dream.description}</Text>

        <View style={styles.footer}>
          <View style={styles.metadata}>
            {dream.createdAt && (
              <Text style={styles.date}>
                {formatDistanceToNow(dream.createdAt, { addSuffix: true })}
              </Text>
            )}

            {dream.audioUrl && (
              <View style={styles.indicator}>
                <Ionicons name="mic" size={14} color="#6200ee" />
              </View>
            )}

            {dream.nftStatus === 'minted' && (
              <View style={styles.indicator}>
                <MaterialCommunityIcons name="ethereum" size={14} color="#FFD700" />
              </View>
            )}
          </View>

          {dream.rarity && (
            <RarityBadge rarity={dream.rarity} style={styles.rarityBadge} />
          )}
        </View>
      </View>

      {dream.likeCount > 0 && (
        <View style={styles.likesContainer}>
          <Ionicons name="heart" size={12} color="#e91e63" />
          <Text style={styles.likesText}>{dream.likeCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  image: {
    width: 100,
    height: 120,
    resizeMode: 'cover',
  },
  noImage: {
    width: 100,
    height: 120,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  indicator: {
    marginLeft: 8,
  },
  rarityBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  likesContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  likesText: {
    fontSize: 10,
    color: '#e91e63',
    marginLeft: 2,
    fontWeight: 'bold',
  },
});

export default DreamCard;