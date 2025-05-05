// screens/NFTDetailScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Share } from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { firestore, auth } from '../firebase/config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import RarityBadge from '../components/RarityBadge';
import { getNFTMetadata, transferNFT } from '../utils/nftUtils';
import QRCode from 'react-native-qrcode-svg';

const NFTDetailScreen = ({ route, navigation }) => {
  const { tokenId } = route.params;
  const [nft, setNft] = useState(null);
  const [dream, setDream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transferLoading, setTransferLoading] = useState(false);
  const [marketplaceLoading, setMarketplaceLoading] = useState(false);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const loadNFTData = async () => {
      try {
        // Load NFT metadata from blockchain
        const metadata = await getNFTMetadata(tokenId);
        setNft(metadata);

        // Find the dream associated with this NFT
        const dreamsRef = collection(firestore, 'dreams');
        const q = query(dreamsRef, where('tokenId', '==', tokenId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setDream({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
        }
      } catch (error) {
        console.error('Error loading NFT data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNFTData();
  }, [tokenId]);

  const handleViewOnBlockchain = () => {
    // Use the appropriate blockchain explorer URL based on your network
    const blockchainUrl = `https://sepolia.etherscan.io/token/${nft.contract}?a=${tokenId}`;
    Linking.openURL(blockchainUrl);
  };

  const handleShareNFT = async () => {
    try {
      await Share.share({
        message: `Check out my NFT "${nft.name}" on DreAmNFT!`,
        url: `https://dreamnft.app/nft/${tokenId}`,
      });
    } catch (error) {
      console.error('Error sharing NFT', error);
    }
  };

  const handleTransferNFT = async () => {
    // This would typically open a modal to input recipient address
    navigation.navigate('TransferNFT', {
      tokenId: tokenId,
      contractAddress: nft.contract
    });
  };

  const handleListOnMarketplace = async () => {
    // Navigate to marketplace listing screen
    navigation.navigate('ListNFT', {
      tokenId: tokenId,
      contractAddress: nft.contract,
      nftData: nft,
      dreamData: dream
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (!nft) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>NFT not found</Text>
      </View>
    );
  }

  const isOwner = currentUser && dream && dream.userId === currentUser.uid;
  const mintDate = dream?.nftMintedAt?.toDate ? dream.nftMintedAt.toDate() : new Date();

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: nft.image }}
        style={styles.nftImage}
        resizeMode="contain"
      />

      <View style={styles.content}>
        <Text style={styles.title}>{nft.name}</Text>

        <View style={styles.ownerSection}>
          <Text style={styles.ownerLabel}>Owned by</Text>
          <TouchableOpacity
            style={styles.ownerButton}
            onPress={() => navigation.navigate('Profile', { userId: dream?.userId })}
          >
            <Text style={styles.ownerName}>{isOwner ? 'You' : (dream?.userName || 'Unknown')}</Text>
          </TouchableOpacity>
        </View>

        {dream?.rarity && (
          <RarityBadge rarity={dream.rarity} style={styles.rarityBadge} />
        )}

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{nft.description}</Text>

          <View style={styles.metadataSection}>
            <Text style={styles.sectionTitle}>NFT Details</Text>

            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Contract Address</Text>
              <Text style={styles.metadataValue} numberOfLines={1} ellipsizeMode="middle">
                {nft.contract}
              </Text>
            </View>

            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Token ID</Text>
              <Text style={styles.metadataValue}>{tokenId}</Text>
            </View>

            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Blockchain</Text>
              <Text style={styles.metadataValue}>Ethereum (Sepolia)</Text>
            </View>

            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Minted</Text>
              <Text style={styles.metadataValue}>
                {mintDate.toLocaleDateString()} at {mintDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </Text>
            </View>
          </View>

          {nft.attributes && nft.attributes.length > 0 && (
            <View style={styles.attributesSection}>
              <Text style={styles.sectionTitle}>Properties</Text>
              <View style={styles.attributesGrid}>
                {nft.attributes.map((attr, index) => (
                  <View key={index} style={styles.attributeItem}>
                    <Text style={styles.attributeType}>{attr.trait_type}</Text>
                    <Text style={styles.attributeValue}>{attr.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.qrSection}>
            <Text style={styles.sectionTitle}>QR Code</Text>
            <View style={styles.qrContainer}>
              <QRCode
                value={`https://dreamnft.app/nft/${tokenId}`}
                size={150}
                color="#6200ee"
                backgroundColor="white"
              />
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShareNFT}>
            <Ionicons name="share-outline" size={24} color="#6200ee" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleViewOnBlockchain}>
            <MaterialCommunityIcons name="ethereum" size={24} color="#6200ee" />
            <Text style={styles.actionText}>View on Blockchain</Text>
          </TouchableOpacity>

          {isOwner && (
            <>
              <TouchableOpacity
                style={[styles.transferButton, transferLoading && styles.disabledButton]}
                onPress={handleTransferNFT}
                disabled={transferLoading}
              >
                {transferLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <FontAwesome5 name="exchange-alt" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Transfer</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.marketplaceButton, marketplaceLoading && styles.disabledButton]}
                onPress={handleListOnMarketplace}
                disabled={marketplaceLoading}
              >
                {marketplaceLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="store-outline" size={20} color="#fff" />
                    <Text style={styles.buttonText}>List for Sale</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ScrollView>
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
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 18,
    color: '#e91e63',
  },
  nftImage: {
    width: '100%',
    height: 350,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  ownerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ownerLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 6,
  },
  ownerButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ownerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6200ee',
  },
  rarityBadge: {
    marginBottom: 16,
  },
  detailsCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
  },
  metadataSection: {
    marginBottom: 16,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  metadataLabel: {
    fontSize: 14,
    color: '#666',
  },
  metadataValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    maxWidth: '60%',
  },
  attributesSection: {
    marginBottom: 16,
  },
  attributesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  attributeItem: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    minWidth: '45%',
  },
  attributeType: {
    fontSize: 12,
    color: '#6200ee',
    fontWeight: '600',
  },
  attributeValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  qrSection: {
    alignItems: 'center',
  },
  qrContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    width: '48%',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6200ee',
    marginLeft: 8,
  },
  transferButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6200ee',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    width: '48%',
  },
  marketplaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    width: '48%',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default NFTDetailScreen;