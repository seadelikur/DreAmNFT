// src/screens/MarketplaceItemScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../styles/theme';
import { useApp } from '../context/AppContext';
import RarityBadge from '../components/RarityBadge';
import DreamAudioPlayer from '../components/DreamAudioPlayer';
import UserAvatar from '../components/UserAvatar';
import { fetchFromIPFS } from '../utils/ipfsUtils';
import { buyNFT, getListingDetails, getDreamNFTDetails } from '../utils/blockchainUtils';
import { getUser } from '../services/firestoreService';

const MarketplaceItemScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const { walletConnected, walletAddress, showToast } = useApp();

  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [nftData, setNftData] = useState(null);
  const [seller, setSeller] = useState(null);
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    loadNFTDetails();
  }, []);

  const loadNFTDetails = async () => {
    try {
      setLoading(true);

      // Fetch listing details from blockchain
      const { success: listingSuccess, ...listingDetails } = await getListingDetails(item.listingId);

      if (!listingSuccess) {
        throw new Error('Failed to fetch listing details');
      }

      // Fetch NFT details from blockchain
      const { success: nftSuccess, ...nftDetails } = await getDreamNFTDetails(listingDetails.tokenId);

      if (!nftSuccess) {
        throw new Error('Failed to fetch NFT details');
      }

      // Fetch metadata from IPFS
      const { success: ipfsSuccess, data } = await fetchFromIPFS(nftDetails.uri);

      if (!ipfsSuccess || !data) {
        throw new Error('Failed to fetch metadata from IPFS');
      }

      // Fetch seller data from Firestore
      const { success: sellerSuccess, user } = await getUser(listingDetails.seller);

      setNftData({
        ...nftDetails,
        ...listingDetails
      });

      setMetadata(data);

      if (sellerSuccess) {
        setSeller(user);
      }
    } catch (error) {
      console.error('Error loading NFT details:', error);
      Alert.alert('Error', 'Failed to load NFT details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNFT = async () => {
    if (!walletConnected) {
      Alert.alert(
        'Wallet Not Connected',
        'Please connect your wallet to purchase this NFT.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Connect Wallet', onPress: () => navigation.navigate('Wallet') }
        ]
      );
      return;
    }

    // Confirm purchase
    Alert.alert(
      'Confirm Purchase',
      `Are you sure you want to buy this NFT for ${nftData.price} ETH?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Buy Now', onPress: processPurchase }
      ]
    );
  };

  const processPurchase = async () => {
    try {
      setBuying(true);

      const { success, transactionHash, error } = await buyNFT(
        item.listingId,
        nftData.price
      );

      if (!success) {
        throw new Error(error || 'Transaction failed');
      }

      // Show success message
      showToast({
        type: 'success',
        title: 'Purchase Successful',
        message: 'You have successfully purchased this NFT!'
      });

      // Navigate to success screen
      navigation.navigate('TransactionSuccess', {
        type: 'purchase',
        title: metadata?.name || 'Dream NFT',
        transactionHash,
        tokenId: nftData.tokenId
      });

    } catch (error) {
      console.error('Error purchasing NFT:', error);
      Alert.alert('Transaction Failed', error.message);
    } finally {
      setBuying(false);
    }
  };

  const openEtherscan = (hash) => {
    const url = `https://sepolia.etherscan.io/tx/${hash}`;
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading NFT details...</Text>
      </View>
    );
  }

  const isOwner = walletAddress && seller && seller.walletAddress === walletAddress;
  const rarityLabel = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'][nftData?.rarity || 0];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* NFT Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: metadata?.image || item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <RarityBadge rarity={nftData?.rarity || 0} style={styles.rarityBadge} />
        <View style={styles.idBadge}>
          <Text style={styles.idText}>#{nftData?.tokenId}</Text>
        </View>
      </View>

      {/* NFT Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{metadata?.name || item.title}</Text>

        {/* Seller Info */}
        <View style={styles.sellerContainer}>
          <UserAvatar
            uri={seller?.photoURL}
            size={40}
            username={seller?.username}
          />
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerLabel}>Creator</Text>
            <Text style={styles.sellerName}>{seller?.username || 'Unknown'}</Text>
          </View>
        </View>

        {/* Description */}
        {metadata?.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{metadata.description}</Text>
          </View>
        )}

        {/* Audio Player (if available) */}
        {metadata?.audio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dream Audio</Text>
            <DreamAudioPlayer audioUrl={metadata.audio} />
          </View>
        )}

        {/* Properties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Properties</Text>
          <View style={styles.propertiesGrid}>
            <View style={styles.propertyItem}>
              <Text style={styles.propertyLabel}>Rarity</Text>
              <Text style={styles.propertyValue}>{rarityLabel}</Text>
            </View>

            {metadata?.attributes?.map((attr, index) => (
              <View key={index} style={styles.propertyItem}>
                <Text style={styles.propertyLabel}>{attr.trait_type}</Text>
                <Text style={styles.propertyValue}>{attr.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Ionicons name="pricetag-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.detailLabel}>Price</Text>
              <Text style={styles.detailValue}>{nftData?.price} ETH</Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.detailLabel}>Listed On</Text>
              <Text style={styles.detailValue}>
                {new Date(nftData?.createdAt).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="card-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.detailLabel}>Token ID</Text>
              <Text style={styles.detailValue}>{nftData?.tokenId}</Text>
            </View>

            <TouchableOpacity
              style={styles.detailItem}
              onPress={() => openEtherscan(nftData?.transactionHash)}
            >
              <Ionicons name="open-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.detailLabel}>View on Etherscan</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Action Button */}
      <View style={styles.buttonContainer}>
        {isOwner ? (
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>This is your listing</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.buyButton, buying && styles.disabledButton]}
            onPress={handleBuyNFT}
            disabled={buying}
          >
            {buying ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="cart-outline" size={20} color="white" />
                <Text style={styles.buyButtonText}>
                  Buy for {nftData?.price} ETH
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  imageContainer: {
    width: '100%',
    height: 350,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  rarityBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  idBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  idText: {
    color: 'white',
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
  infoContainer: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: 16,
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  sellerInfo: {
    marginLeft: 12,
  },
  sellerLabel: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  sellerName: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  propertiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -4,
  },
  propertyItem: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 12,
    margin: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  propertyLabel: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  propertyValue: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  detailsContainer: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    marginLeft: 12,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  buttonContainer: {
    padding: 24,
    paddingTop: 0,
  },
  buyButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: fonts.semiBold,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  disabledButton: {
    backgroundColor: colors.primaryLight,
  },
});

export default MarketplaceItemScreen;