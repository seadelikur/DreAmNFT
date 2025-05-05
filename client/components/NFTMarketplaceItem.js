// components/NFTMarketplaceItem.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;

const NFTMarketplaceItem = ({ nft, onPress }) => {
  const {
    name,
    imageUrl,
    price,
    currency,
    likes,
    rarity
  } = nft;

  // Function to format the NFT name to fit in the card
  const formatName = (name) => {
    if (name.length > 18) {
      return name.substring(0, 15) + '...';
    }
    return name;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.gradient}
        />

        <View style={styles.rarityBadge}>
          <Text style={styles.rarityText}>R{rarity}</Text>
        </View>

        <View style={styles.likesContainer}>
          <Ionicons name="heart" size={14} color="#ff4081" />
          <Text style={styles.likesText}>{likes}</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {formatName(name)}
        </Text>

        <View style={styles.priceContainer}>
          <MaterialCommunityIcons
            name={currency === 'ETH' ? 'ethereum' : 'cash'}
            size={16}
            color="#6200ee"
          />
          <Text style={styles.price}>
            {price} {currency}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.buyButton}
        onPress={onPress}
      >
        <Text style={styles.buyButtonText}>Buy Now</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: ITEM_WIDTH,
    margin: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  imageContainer: {
    width: '100%',
    height: ITEM_WIDTH,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  rarityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rarityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  likesContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  likesText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  infoContainer: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6200ee',
    marginLeft: 4,
  },
  buyButton: {
    backgroundColor: '#f0e6ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    margin: 12,
    marginTop: 0,
    alignItems: 'center',
  },
  buyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6200ee',
  },
});

export default NFTMarketplaceItem;