// src/components/MarketplaceCard.js
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../styles/theme';
import RarityBadge from './RarityBadge';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // Two columns with padding

const MarketplaceCard = ({ item, onPress, marketplaceFee = 2.5 }) => {
  const {
    title,
    imageUrl,
    price,
    rarity,
    sellerUsername,
    sellerAvatar,
    tokenId,
    listingDate,
    isNew
  } = item;

  // Calculate days ago
  const daysAgo = Math.floor((new Date() - new Date(listingDate)) / (1000 * 60 * 60 * 24));
  const listedText = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl || 'https://via.placeholder.com/200x200?text=No+Image' }}
          style={styles.image}
          resizeMode="cover"
        />
        <RarityBadge rarity={parseInt(rarity)} style={styles.rarityBadge} />

        {isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>

        <View style={styles.priceContainer}>
          <Ionicons name="logo-ethereum" size={16} color={colors.primary} />
          <Text style={styles.price}>{price} ETH</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.sellerContainer}>
            <Image
              source={{ uri: sellerAvatar || 'https://via.placeholder.com/40x40?text=User' }}
              style={styles.sellerAvatar}
            />
            <Text style={styles.sellerName} numberOfLines={1}>{sellerUsername}</Text>
          </View>

          <Text style={styles.listedDate}>{listedText}</Text>
        </View>
      </View>

      <View style={styles.idBadge}>
        <Text style={styles.idText}>#{tokenId}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageContainer: {
    width: '100%',
    height: cardWidth,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  rarityBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: fonts.bold,
  },
  infoContainer: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.text,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sellerAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 4,
  },
  sellerName: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    flex: 1,
  },
  listedDate: {
    fontSize: 10,
    fontFamily: fonts.regular,
    color: colors.textTertiary,
  },
  idBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  idText: {
    fontSize: 10,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
});

export default MarketplaceCard;