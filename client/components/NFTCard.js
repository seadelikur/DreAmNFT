// components/NFTCard.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import RarityBadge from './RarityBadge';

const { width } = Dimensions.get('window');
const cardWidth = (width - 32) / 2;

const NFTCard = ({ nft, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: nft.image }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{nft.name}</Text>

        <View style={styles.footer}>
          <MaterialCommunityIcons name="ethereum" size={16} color="#6200ee" />
          {nft.price && (
            <Text style={styles.price}>{nft.price} ETH</Text>
          )}

          {nft.rarity && (
            <RarityBadge rarity={nft.rarity} style={styles.rarityBadge} />
          )}
        </View>
      </View>

      <View style={styles.nftBadge}>
        <MaterialCommunityIcons name="certificate" size={12} color="#FFD700" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: cardWidth,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6200ee',
    marginLeft: 4,
  },
  rarityBadge: {
    position: 'absolute',
    right: 0,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  nftBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 4,
  },
});

export default NFTCard;