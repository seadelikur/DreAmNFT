// screens/NFTPurchaseScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { firebase, firestore, auth } from '../firebase/config';
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const NFTPurchaseScreen = ({ route, navigation }) => {
  const { nftId } = route.params;

  const [nft, setNft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0.5); // Mock balance
  const [gasOption, setGasOption] = useState('standard');

  useEffect(() => {
    fetchNFTDetails();
    fetchWalletBalance();
  }, [nftId]);

  const fetchNFTDetails = async () => {
    try {
      setLoading(true);

      // In a real app, we would fetch from Firestore
      // For demo purposes, we'll use mock data

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Mock NFT data
      const mockNFT = {
        id: nftId,
        name: 'Flying Over Mountains',
        description: 'A vivid flying dream where I soared over majestic mountain peaks with the sensation of complete freedom and weightlessness.',
        price: '0.175',
        currency: 'ETH',
        imageUrl: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606',
        creator: {
          id: 'user123',
          name: 'DreamExplorer',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
        },
        owner: {
          id: 'user456',
          name: 'CosmosDreamer',
          avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
        },
        tokenId: '7845',
        tokenStandard: 'ERC-721',
        contract: '0x8a23...e51c',
        blockchain: 'Ethereum',
        listed: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        rarity: 86,
        tags: ['flying', 'mountains', 'freedom']
      };

      setNft(mockNFT);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching NFT details:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load NFT details. Please try again.');
    }
  };

  const fetchWalletBalance = async () => {
    // In a real app, we would fetch from a wallet provider
    // For demo purposes, we'll use a mock balance

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock wallet balance (randomly between 0.3 and 0.7 ETH)
    const mockBalance = (Math.random() * 0.4 + 0.3).toFixed(4);
    setWalletBalance(parseFloat(mockBalance));
  };

  const handleGasOptionSelection = (option) => {
    setGasOption(option);
  };

  const getGasDetails = () => {
    switch (gasOption) {
      case 'slow':
        return { price: '0.002', time: '~10 min' };
      case 'standard':
        return { price: '0.005', time: '~3 min' };
      case 'fast':
        return { price: '0.012', time: '~30 sec' };
      default:
        return { price: '0.005', time: '~3 min' };
    }
  };

  const getTotalPrice = () => {
    if (!nft) return '0';

    const nftPrice = parseFloat(nft.price);
    const gasPrice = parseFloat(getGasDetails().price);
    const total = nftPrice + gasPrice;

    return total.toFixed(4);
  };

  const handlePurchase = async () => {
    if (!nft) return;

    const totalPrice = parseFloat(getTotalPrice());

    if (totalPrice > walletBalance) {
      Alert.alert(
        'Insufficient Funds',
        'Your wallet balance is too low to complete this purchase.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Funds', onPress: () => navigation.navigate('AddFunds') }
        ]
      );
      return;
    }

    try {
      setProcessing(true);

      // In a real app, this would call a smart contract to execute the purchase
      // For demo purposes, we'll simulate the purchase process

      // Simulate blockchain transaction time
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update wallet balance
      setWalletBalance((prevBalance) => {
        const newBalance = prevBalance - totalPrice;
        return parseFloat(newBalance.toFixed(4));
      });

      setProcessing(false);

      // Show success alert and navigate to the NFT detail screen
      Alert.alert(
        'Purchase Successful',
        `You are now the proud owner of "${nft.name}"`,
        [
          {
            text: 'View NFT',
            onPress: () => navigation.replace('NFTDetail', { nftId, purchased: true })
          }
        ]
      );
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      setProcessing(false);
      Alert.alert('Transaction Failed', 'There was an error processing your purchase. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading NFT details...</Text>
      </View>
    );
  }

  if (!nft) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#d32f2f" />
        <Text style={styles.errorTitle}>NFT Not Found</Text>
        <Text style={styles.errorText}>
          We couldn't find the NFT you're looking for.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const gasDetails = getGasDetails();
  const insufficientFunds = parseFloat(getTotalPrice()) > walletBalance;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Purchase</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.nftCard}>
          <Image
            source={{ uri: nft.imageUrl }}
            style={styles.nftImage}
            resizeMode="cover"
          />
          <View style={styles.nftInfo}>
            <Text style={styles.nftName}>{nft.name}</Text>
            <Text style={styles.nftTokenId}>TokenID: #{nft.tokenId}</Text>
            <View style={styles.nftPriceContainer}>
              <MaterialCommunityIcons name="ethereum" size={20} color="#6200ee" />
              <Text style={styles.nftPrice}>{nft.price} ETH</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Seller Information</Text>
          <View style={styles.sellerCard}>
            <Image
              source={{ uri: nft.owner.avatar }}
              style={styles.sellerAvatar}
            />
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{nft.owner.name}</Text>
              <Text style={styles.sellerAddress}>
                {nft.owner.id.substring(0, 6)}...{nft.owner.id.substring(nft.owner.id.length - 4)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Transaction Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Item Price</Text>
              <View style={styles.detailValueContainer}>
                <MaterialCommunityIcons name="ethereum" size={16} color="#333" />
                <Text style={styles.detailValue}>{nft.price} ETH</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Network</Text>
              <Text style={styles.detailValue}>{nft.blockchain}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Contract</Text>
              <Text style={styles.detailValue}>
                {nft.contract.substring(0, 6)}...{nft.contract.substring(nft.contract.length - 4)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Gas Options</Text>
          <View style={styles.gasOptionsContainer}>
            <TouchableOpacity
              style={[
                styles.gasOption,
                gasOption === 'slow' && styles.selectedGasOption
              ]}
              onPress={() => handleGasOptionSelection('slow')}
            >
              <Text style={styles.gasSpeed}>Slow</Text>
              <View style={styles.gasDetails}>
                <MaterialCommunityIcons name="ethereum" size={14} color="#333" />
                <Text style={styles.gasPrice}>0.002</Text>
              </View>
              <Text style={styles.gasTime}>~10 min</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.gasOption,
                gasOption === 'standard' && styles.selectedGasOption
              ]}
              onPress={() => handleGasOptionSelection('standard')}
            >
              <Text style={styles.gasSpeed}>Standard</Text>
              <View style={styles.gasDetails}>
                <MaterialCommunityIcons name="ethereum" size={14} color="#333" />
                <Text style={styles.gasPrice}>0.005</Text>
              </View>
              <Text style={styles.gasTime}>~3 min</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.gasOption,
                gasOption === 'fast' && styles.selectedGasOption
              ]}
              onPress={() => handleGasOptionSelection('fast')}
            >
              <Text style={styles.gasSpeed}>Fast</Text>
              <View style={styles.gasDetails}>
                <MaterialCommunityIcons name="ethereum" size={14} color="#333" />
                <Text style={styles.gasPrice}>0.012</Text>
              </View>
              <Text style={styles.gasTime}>~30 sec</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Transaction Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Item Price</Text>
            <View style={styles.summaryValueContainer}>
              <MaterialCommunityIcons name="ethereum" size={16} color="#333" />
              <Text style={styles.summaryValue}>{nft.price}</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Gas Fee ({gasOption})</Text>
            <View style={styles.summaryValueContainer}>
              <MaterialCommunityIcons name="ethereum" size={16} color="#333" />
              <Text style={styles.summaryValue}>{gasDetails.price}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <View style={styles.totalValueContainer}>
              <MaterialCommunityIcons name="ethereum" size={18} color="#333" />
              <Text style={styles.totalValue}>{getTotalPrice()}</Text>
            </View>
          </View>

          <View style={styles.walletContainer}>
            <Text style={styles.walletLabel}>Your Balance</Text>
            <View style={styles.walletBalanceContainer}>
              <MaterialCommunityIcons name="ethereum" size={16} color={insufficientFunds ? '#d32f2f' : '#4caf50'} />
              <Text style={[
                styles.walletBalance,
                insufficientFunds && styles.insufficientBalance
              ]}>
                {walletBalance.toFixed(4)}
              </Text>
            </View>
          </View>

          {insufficientFunds && (
            <View style={styles.warningContainer}>
              <Ionicons name="warning-outline" size={16} color="#d32f2f" />
              <Text style={styles.warningText}>
                Insufficient funds. Add more ETH to your wallet.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.purchaseButton,
            (insufficientFunds || processing) && styles.disabledButton
          ]}
          onPress={handlePurchase}
          disabled={insufficientFunds || processing}
        >
          {processing ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.purchaseButtonText}>Processing...</Text>
            </>
          ) : (
            <>
              {insufficientFunds ? (
                <Text style={styles.purchaseButtonText}>Add Funds</Text>
              ) : (
                <>
                  <MaterialCommunityIcons name="ethereum" size={20} color="#fff" />
                  <Text style={styles.purchaseButtonText}>
                    Purchase for {getTotalPrice()} ETH
                  </Text>
                </>
              )}
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  nftCard: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  nftImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  nftInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  nftName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  nftTokenId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  nftPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nftPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
    marginLeft: 4,
  },
  sectionContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  sellerInfo: {
    marginLeft: 12,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sellerAddress: {
    fontSize: 14,
    color: '#666',
  },
  detailsCard: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 4,
  },
  gasOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gasOption: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedGasOption: {
    borderColor: '#6200ee',
    backgroundColor: '#f0e6ff',
  },
  gasSpeed: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  gasDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  gasPrice: {
    fontSize: 14,
    color: '#333',
    marginLeft: 2,
  },
  gasTime: {
    fontSize: 12,
    color: '#666',
  },
  summaryContainer: {
    padding: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 4,
  },
  walletContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginTop: 12,
    paddingHorizontal: 12,
  },
  walletLabel: {
    fontSize: 14,
    color: '#666',
  },
  walletBalanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4caf50',
    marginLeft: 4,
  },
  insufficientBalance: {
    color: '#d32f2f',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  warningText: {
    fontSize: 14,
    color: '#d32f2f',
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#b39ddb',
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6200ee',
    fontWeight: '500',
  },
});

export default NFTPurchaseScreen;