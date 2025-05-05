// src/screens/TransactionSuccessScreen.js
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { colors, fonts } from '../styles/theme';

const TransactionSuccessScreen = ({ route, navigation }) => {
  const { type, title, transactionHash, tokenId, listingId } = route.params || {};

  useEffect(() => {
    // Prevent going back with the hardware back button
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (e.data.action.type === 'GO_BACK') {
        e.preventDefault();
        handleDone();
      }
    });

    return unsubscribe;
  }, [navigation]);

  const getSuccessData = () => {
    switch (type) {
      case 'mint':
        return {
          title: 'NFT Minted Successfully',
          message: `Congratulations! Your dream "${title}" has been minted as an NFT with token ID #${tokenId}.`,
          animationSource: require('../assets/animations/nft-success.json'),
          detailsText: 'Token ID',
          detailsValue: `#${tokenId}`,
          primaryButtonText: 'View My NFT',
          primaryAction: () => navigation.replace('NFTDetail', { tokenId })
        };
      case 'listing':
        return {
          title: 'NFT Listed Successfully',
          message: `Your NFT "${title}" has been listed for sale on the marketplace.`,
          animationSource: require('../assets/animations/marketplace-success.json'),
          detailsText: 'Listing ID',
          detailsValue: `#${listingId}`,
          primaryButtonText: 'View Listing',
          primaryAction: () => navigation.replace('MarketplaceItem', { listingId })
        };
      case 'purchase':
        return {
          title: 'Purchase Successful',
          message: `You've successfully purchased "${title}". It has been added to your collection.`,
          animationSource: require('../assets/animations/purchase-success.json'),
          detailsText: 'Token ID',
          detailsValue: `#${tokenId}`,
          primaryButtonText: 'View My NFT',
          primaryAction: () => navigation.replace('NFTDetail', { tokenId })
        };
      case 'transfer':
        return {
          title: 'NFT Transferred Successfully',
          message: `Your NFT "${title}" has been transferred to the recipient.`,
          animationSource: require('../assets/animations/transfer-success.json'),
          detailsText: 'Token ID',
          detailsValue: `#${tokenId}`,
          primaryButtonText: 'Done',
          primaryAction: () => navigation.replace('MyNFTs')
        };
      default:
        return {
          title: 'Transaction Successful',
          message: 'Your blockchain transaction has been completed successfully.',
          animationSource: require('../assets/animations/transaction-success.json'),
          detailsText: 'Transaction',
          detailsValue: 'Completed',
          primaryButtonText: 'Done',
          primaryAction: () => handleDone()
        };
    }
  };

  const handleDone = () => {
    // Navigate back to the appropriate screen based on transaction type
    switch (type) {
      case 'mint':
        navigation.navigate('MyNFTs');
        break;
      case 'listing':
        navigation.navigate('MarketplaceTab');
        break;
      case 'purchase':
        navigation.navigate('MyNFTs');
        break;
      case 'transfer':
        navigation.navigate('MyNFTs');
        break;
      default:
        navigation.navigate('HomeTab');
    }
  };

  const openEtherscan = () => {
    if (transactionHash) {
      const url = `https://sepolia.etherscan.io/tx/${transactionHash}`;
      Linking.openURL(url);
    }
  };

  const shareTransaction = () => {
    if (transactionHash) {
      const url = `https://sepolia.etherscan.io/tx/${transactionHash}`;
      const message = `Check out my ${type} transaction on the Ethereum blockchain: ${url}`;

      Linking.canOpenURL('twitter://post')
        .then(supported => {
          if (supported) {
            return Linking.openURL(`twitter://post?message=${encodeURIComponent(message)}`);
          } else {
            return Linking.openURL(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`);
          }
        })
        .catch(err => console.error('Error sharing transaction:', err));
    }
  };

  const successData = getSuccessData();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Animation */}
          <View style={styles.animationContainer}>
            <LottieView
              source={successData.animationSource}
              autoPlay
              loop={false}
              style={styles.animation}
            />
          </View>

          {/* Success Message */}
          <Text style={styles.title}>{successData.title}</Text>
          <Text style={styles.message}>{successData.message}</Text>

          {/* Transaction Details */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{successData.detailsText}</Text>
              <Text style={styles.detailValue}>{successData.detailsValue}</Text>
            </View>

            {transactionHash && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Transaction Hash</Text>
                <TouchableOpacity onPress={openEtherscan}>
                  <Text style={styles.hashValue}>
                    {`${transactionHash.substring(0, 8)}...${transactionHash.substring(transactionHash.length - 6)}`}
                    <Ionicons name="open-outline" size={16} color={colors.primary} style={styles.linkIcon} />
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={styles.statusContainer}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Confirmed</Text>
              </View>
            </View>
          </View>

          {/* Share Button */}
          {transactionHash && (
            <TouchableOpacity style={styles.shareButton} onPress={shareTransaction}>
              <Ionicons name="share-social-outline" size={20} color={colors.primary} />
              <Text style={styles.shareButtonText}>Share on Twitter</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleDone}
        >
          <Text style={styles.secondaryButtonText}>Go to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={successData.primaryAction}
        >
          <Text style={styles.primaryButtonText}>{successData.primaryButtonText}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animationContainer: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  detailsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  hashValue: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.primary,
  },
  linkIcon: {
    marginLeft: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.success,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  shareButtonText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.primary,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  primaryButton: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: 'white',
  },
});

export default TransactionSuccessScreen;