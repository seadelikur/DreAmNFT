// src/screens/ListNFTScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../styles/theme';
import { useApp } from '../context/AppContext';
import RarityBadge from '../components/RarityBadge';
import { listNFTForSale } from '../utils/blockchainUtils';
import { updateDreamInFirestore } from '../services/firestoreService';
import { getMarketplaceFee } from '../utils/blockchainUtils';

const ListNFTScreen = ({ route, navigation }) => {
  const { dream } = route.params;
  const { walletConnected, walletAddress, showToast } = useApp();

  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState('');
  const [marketplaceFee, setMarketplaceFee] = useState(2.5); // Default 2.5%
  const [buttonDisabled, setButtonDisabled] = useState(true);

  useEffect(() => {
    if (!walletConnected) {
      Alert.alert(
        'Wallet Not Connected',
        'You need to connect your wallet to list an NFT for sale.',
        [
          { text: 'Cancel', onPress: () => navigation.goBack() },
          { text: 'Connect Wallet', onPress: () => navigation.navigate('Wallet') }
        ]
      );
    } else {
      loadMarketplaceFee();
    }

    // Enable/disable the list button based on price input
    setButtonDisabled(!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0);
  }, [walletConnected, price]);

  const loadMarketplaceFee = async () => {
    const { success, feePercentage } = await getMarketplaceFee();
    if (success) {
      setMarketplaceFee(feePercentage);
    }
  };

  const handlePriceChange = (text) => {
    // Only allow valid decimal numbers
    if (text === '' || /^\d*\.?\d*$/.test(text)) {
      setPrice(text);
    }
  };

  const calculateFeesAndRoyalties = () => {
    if (!price || isNaN(parseFloat(price))) return { marketplaceFee: 0, royaltyFee: 0, sellerReceives: 0 };

    const priceValue = parseFloat(price);
    const marketplaceFeeAmount = priceValue * (marketplaceFee / 100);
    const royaltyFeeAmount = priceValue * 0.025; // Assuming 2.5% royalty fee
    const sellerReceives = priceValue - marketplaceFeeAmount - royaltyFeeAmount;

    return {
      marketplaceFee: marketplaceFeeAmount,
      royaltyFee: royaltyFeeAmount,
      sellerReceives
    };
  };

  const handleListNFT = async () => {
    try {
      if (!walletConnected) {
        Alert.alert('Error', 'Please connect your wallet first.');
        return;
      }

      if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        Alert.alert('Error', 'Please enter a valid price.');
        return;
      }

      // Confirm listing
      Alert.alert(
        'Confirm Listing',
        `Are you sure you want to list "${dream.title}" for ${price} ETH?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'List NFT', onPress: processListing }
        ]
      );
    } catch (error) {
      console.error('Error preparing listing:', error);
      Alert.alert('Error', error.message);
    }
  };

  const processListing = async () => {
    try {
      setLoading(true);

      // List the NFT on the marketplace
      const { success, listingId, transactionHash, error } = await listNFTForSale(
        dream.tokenId,
        price
      );

      if (!success) {
        throw new Error(error || 'Failed to list NFT');
      }

      // Update dream record in Firestore
      const dreamData = {
        isListed: true,
        listingId,
        listingPrice: price,
        listingTransactionHash: transactionHash,
        listedAt: new Date().toISOString()
      };

      await updateDreamInFirestore(dream.id, dreamData);

      // Show success message
      showToast({
        type: 'success',
        title: 'NFT Listed',
        message: `Your NFT is now listed for ${price} ETH`
      });

      // Navigate to success screen
      navigation.navigate('TransactionSuccess', {
        type: 'listing',
        title: dream.title,
        transactionHash,
        listingId
      });

    } catch (error) {
      console.error('Error listing NFT:', error);
      Alert.alert('Listing Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const { marketplaceFee: marketplaceFeeAmount, royaltyFee, sellerReceives } = calculateFeesAndRoyalties();
  const rarityLabel = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'][dream?.rarity || 0];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* NFT Preview */}
          <View style={styles.previewCard}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: dream.imageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
              <RarityBadge rarity={dream.rarity} style={styles.rarityBadge} />
            </View>

            <View style={styles.previewInfo}>
              <Text style={styles.nftTitle}>{dream.title}</Text>
              <Text style={styles.nftId}>#{dream.tokenId}</Text>
              <Text style={styles.nftRarity}>{rarityLabel} Rarity</Text>
            </View>
          </View>

          {/* Pricing Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Set Your Price</Text>
            <Text style={styles.sectionDescription}>
              Enter the price at which you want to list your NFT. Consider the rarity and uniqueness of your dream.
            </Text>

            <View style={styles.priceInputContainer}>
              <Ionicons name="logo-ethereum" size={24} color={colors.primary} style={styles.ethIcon} />
              <TextInput
                style={styles.priceInput}
                value={price}
                onChangeText={handlePriceChange}
                placeholder="0.00"
                placeholderTextColor={colors.textTertiary}
                keyboardType="decimal-pad"
                maxLength={10}
              />
              <Text style={styles.currencyLabel}>ETH</Text>
            </View>
          </View>

          {/* Fees Section */}
          {price && !isNaN(parseFloat(price)) && parseFloat(price) > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fees & Earnings</Text>

              <View style={styles.feeItem}>
                <Text style={styles.feeLabel}>Listing Price</Text>
                <Text style={styles.feeValue}>{parseFloat(price).toFixed(3)} ETH</Text>
              </View>

              <View style={styles.feeItem}>
                <Text style={styles.feeLabel}>Marketplace Fee ({marketplaceFee}%)</Text>
                <Text style={styles.feeValue}>- {marketplaceFeeAmount.toFixed(3)} ETH</Text>
              </View>

              <View style={styles.feeItem}>
                <Text style={styles.feeLabel}>Creator Royalty (2.5%)</Text>
                <Text style={styles.feeValue}>- {royaltyFee.toFixed(3)} ETH</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.feeItem}>
                <Text style={styles.totalLabel}>You'll Receive</Text>
                <Text style={styles.totalValue}>{sellerReceives.toFixed(3)} ETH</Text>
              </View>
            </View>
          )}

          {/* Important Information */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={24} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              When someone buys your NFT, it will be transferred to them and you'll receive the payment minus fees. You can cancel the listing at any time.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.listButton, buttonDisabled && styles.disabledButton]}
          onPress={handleListNFT}
          disabled={buttonDisabled || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.listButtonText}>List for Sale</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  previewCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 24,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  rarityBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  previewInfo: {
    padding: 16,
  },
  nftTitle: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 4,
  },
  nftId: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  nftRarity: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.backgroundLight,
  },
  ethIcon: {
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    fontSize: 24,
    fontFamily: fonts.semiBold,
    color: colors.text,
    paddingVertical: 12,
  },
  currencyLabel: {
    fontSize: 18,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  feeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  feeLabel: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  feeValue: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.success,
  },
  infoBox: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginLeft: 12,
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 16,
    flexDirection: 'row',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  listButton: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listButtonText: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: 'white',
  },
  disabledButton: {
    backgroundColor: colors.primaryLight,
  },
});

export default ListNFTScreen;