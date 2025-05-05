// screens/WalletScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { firebase, firestore, auth } from '../firebase/config';

const { width } = Dimensions.get('window');

const GAS_PRICE = 0.0015; // ETH
const NETWORK_FEE = 0.001; // ETH

const WalletScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [walletInfo, setWalletInfo] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('assets');

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);

      // In a real app, we would fetch from blockchain/wallet provider
      // For demo purposes, we'll use mock data

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock wallet data
      const mockWallet = {
        address: '0x8b21...e7a9',
        balances: {
          eth: 0.458,
          usdc: 125.75
        },
        totalValueUSD: 985.62,
        percentChange24h: 2.8
      };

      // Mock transaction data
      const mockTransactions = [
        {
          id: 'tx1',
          type: 'purchase',
          title: 'Purchased NFT',
          description: 'Cosmic Journey #1024',
          amount: '0.175',
          currency: 'ETH',
          timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
          status: 'completed',
          txHash: '0x72ae...f91b'
        },
        {
          id: 'tx2',
          type: 'sale',
          title: 'Sold NFT',
          description: 'Lucid Flight #782',
          amount: '0.25',
          currency: 'ETH',
          timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
          status: 'completed',
          txHash: '0xf19d...3a2c'
        },
        {
          id: 'tx3',
          type: 'deposit',
          title: 'Added Funds',
          description: 'Deposit from Coinbase',
          amount: '0.5',
          currency: 'ETH',
          timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000,
          status: 'completed',
          txHash: '0xe37a...8d1f'
        },
        {
          id: 'tx4',
          type: 'mint',
          title: 'Minted Dream NFT',
          description: 'The Endless Library',
          amount: '0.05',
          currency: 'ETH',
          timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
          status: 'completed',
          txHash: '0xa112...9e4b'
        }
      ];

      setWalletInfo(mockWallet);
      setTransactions(mockTransactions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load wallet data. Please try again.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWalletData();
    setRefreshing(false);
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return address;
  };

  const copyAddressToClipboard = () => {
    // In a real app, we would use Clipboard API
    Alert.alert('Copied!', 'Wallet address copied to clipboard.');
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'purchase':
        return <Ionicons name="cart" size={24} color="#6200ee" />;
      case 'sale':
        return <Ionicons name="cash" size={24} color="#4caf50" />;
      case 'deposit':
        return <Ionicons name="arrow-down-circle" size={24} color="#2196f3" />;
      case 'withdraw':
        return <Ionicons name="arrow-up-circle" size={24} color="#ff9800" />;
      case 'mint':
        return <FontAwesome5 name="paint-brush" size={22} color="#9c27b0" />;
      default:
        return <Ionicons name="swap-horizontal" size={24} color="#6200ee" />;
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderAssetItem = ({ item }) => (
    <View style={styles.assetItem}>
      <View style={styles.assetIconContainer}>
        <Image
          source={{ uri: item.logo }}
          style={styles.assetLogo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.assetInfo}>
        <Text style={styles.assetName}>{item.name}</Text>
        <Text style={styles.assetTicker}>{item.ticker}</Text>
      </View>
      <View style={styles.assetValues}>
        <Text style={styles.assetBalance}>{item.balance} {item.ticker}</Text>
        <Text style={styles.assetValue}>${item.valueUSD.toFixed(2)}</Text>
      </View>
    </View>
  );

  const renderTransactionItem = (transaction, index) => {
    const { type, title, description, amount, currency, timestamp, status } = transaction;

    return (
      <TouchableOpacity
        style={[
          styles.transactionItem,
          index === transactions.length - 1 ? { borderBottomWidth: 0 } : {}
        ]}
        onPress={() => navigation.navigate('TransactionDetail', { transaction })}
      >
        <View style={styles.transactionIconContainer}>
          {getTransactionIcon(type)}
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{title}</Text>
          <Text style={styles.transactionDescription}>{description}</Text>
          <Text style={styles.transactionDate}>{formatDate(timestamp)}</Text>
        </View>
        <View style={styles.transactionValues}>
          <View style={styles.transactionAmount}>
            <Text style={[
              styles.transactionAmountText,
              type === 'sale' || type === 'deposit' ? styles.positiveAmount : {}
            ]}>
              {type === 'sale' || type === 'deposit' ? '+' : '-'}{amount} {currency}
            </Text>
          </View>
          <View style={[
            styles.statusBadge,
            status === 'completed' ? styles.completedStatus : {}
          ]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wallet</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('WalletSettings')}
        >
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6200ee']}
          />
        }
      >
        <View style={styles.balanceCard}>
          <LinearGradient
            colors={['#8e2de2', '#4a00e0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.balanceGradient}
          >
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceTitle}>Total Balance</Text>
              <View style={styles.balanceChange}>
                <Ionicons
                  name={walletInfo?.percentChange24h >= 0 ? 'arrow-up' : 'arrow-down'}
                  size={16}
                  color={walletInfo?.percentChange24h >= 0 ? '#4caf50' : '#f44336'}
                />
                <Text style={[
                  styles.balanceChangeText,
                  walletInfo?.percentChange24h >= 0 ? styles.positiveChange : styles.negativeChange
                ]}>
                  {Math.abs(walletInfo?.percentChange24h).toFixed(2)}%
                </Text>
              </View>
            </View>

            <Text style={styles.balanceAmount}>${walletInfo?.totalValueUSD.toFixed(2)}</Text>

            <View style={styles.addressContainer}>
              <Text style={styles.addressLabel}>Wallet Address</Text>
              <View style={styles.addressRow}>
                <Text style={styles.addressText}>{formatAddress(walletInfo?.address)}</Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={copyAddressToClipboard}
                >
                  <Ionicons name="copy-outline" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('AddFunds')}
              >
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Add</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Send')}
              >
                <Ionicons name="arrow-up" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Send</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Swap')}
              >
                <Ionicons name="swap-horizontal" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Swap</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'assets' ? styles.activeTabButton : {}
            ]}
            onPress={() => setActiveTab('assets')}
          >
            <Text style={[
              styles.tabButtonText,
              activeTab === 'assets' ? styles.activeTabButtonText : {}
            ]}>
              Assets
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'transactions' ? styles.activeTabButton : {}
            ]}
            onPress={() => setActiveTab('transactions')}
          >
            <Text style={[
              styles.tabButtonText,
              activeTab === 'transactions' ? styles.activeTabButtonText : {}
            ]}>
              Transactions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'nfts' ? styles.activeTabButton : {}
            ]}
            onPress={() => setActiveTab('nfts')}
          >
            <Text style={[
              styles.tabButtonText,
              activeTab === 'nfts' ? styles.activeTabButtonText : {}
            ]}>
              NFTs
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'assets' && (
          <View style={styles.assetsContainer}>
            <View style={styles.assetItem}>
              <View style={styles.assetIconContainer}>
                <MaterialCommunityIcons name="ethereum" size={28} color="#627eea" />
              </View>
              <View style={styles.assetInfo}>
                <Text style={styles.assetName}>Ethereum</Text>
                <Text style={styles.assetTicker}>ETH</Text>
              </View>
              <View style={styles.assetValues}>
                <Text style={styles.assetBalance}>{walletInfo?.balances.eth.toFixed(4)} ETH</Text>
                <Text style={styles.assetValue}>
                  ${(walletInfo?.balances.eth * 2150).toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.assetItem}>
              <View style={styles.assetIconContainer}>
                <Image
                  source={{ uri: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' }}
                  style={styles.assetLogo}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.assetInfo}>
                <Text style={styles.assetName}>USD Coin</Text>
                <Text style={styles.assetTicker}>USDC</Text>
              </View>
              <View style={styles.assetValues}>
                <Text style={styles.assetBalance}>{walletInfo?.balances.usdc.toFixed(2)} USDC</Text>
                <Text style={styles.assetValue}>
                  ${walletInfo?.balances.usdc.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'transactions' && (
          <View style={styles.transactionsContainer}>
            {transactions.length > 0 ? (
              transactions.map((transaction, index) => (
                renderTransactionItem(transaction, index)
              ))
            ) : (
              <View style={styles.emptyStateContainer}>
                <Ionicons name="document-text-outline" size={48} color="#ccc" />
                <Text style={styles.emptyStateTitle}>No Transactions Yet</Text>
                <Text style={styles.emptyStateText}>
                  Your transaction history will appear here.
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'nfts' && (
          <View style={styles.nftsContainer}>
            <TouchableOpacity
              style={styles.nftCollectionCard}
              onPress={() => navigation.navigate('NFTCollection')}
            >
              <Image
                source={{ uri: 'https://picsum.photos/400/200' }}
                style={styles.nftCollectionImage}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.nftCollectionGradient}
              />
              <View style={styles.nftCollectionInfo}>
                <Text style={styles.nftCollectionName}>My Dream NFTs</Text>
                <Text style={styles.nftCollectionCount}>3 Items</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.emptyStateContainer}>
              <FontAwesome5 name="images" size={48} color="#ccc" />
              <Text style={styles.emptyStateTitle}>No Other Collections</Text>
              <Text style={styles.emptyStateText}>
                Explore the marketplace to discover more NFTs.
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => navigation.navigate('Marketplace')}
              >
                <Text style={styles.emptyStateButtonText}>Browse Marketplace</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  balanceCard: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  balanceGradient: {
    padding: 20,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceTitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  balanceChange: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  balanceChangeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  positiveChange: {
    color: '#4caf50',
  },
  negativeChange: {
    color: '#f44336',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  addressContainer: {
    marginBottom: 20,
  },
  addressLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#fff',
  },
  copyButton: {
    padding: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  tabButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: '#6200ee',
  },
  assetsContainer: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    marginBottom: 20,
  },
  assetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  assetIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assetLogo: {
    width: 30,
    height: 30,
  },
  assetInfo: {
    flex: 1,
    marginLeft: 12,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  assetTicker: {
    fontSize: 14,
    color: '#666',
  },
  assetValues: {
    alignItems: 'flex-end',
  },
  assetBalance: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  assetValue: {
    fontSize: 14,
    color: '#666',
  },
  transactionsContainer: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    marginBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0e6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  transactionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  transactionValues: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    marginBottom: 4,
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  positiveAmount: {
    color: '#4caf50',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  completedStatus: {
    backgroundColor: '#e8f5e9',
  },
  statusText: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: '500',
  },
  nftsContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  nftCollectionCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    height: 120,
  },
  nftCollectionImage: {
    width: '100%',
    height: '100%',
  },
  nftCollectionGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  nftCollectionInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  nftCollectionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  nftCollectionCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0e6ff',
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontSize: 14,
    color: '#6200ee',
    fontWeight: '500',
  },
});

export default WalletScreen;