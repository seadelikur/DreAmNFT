// screens/NFTGiftScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firestore, auth } from '../firebase/config';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { ethers } from 'ethers';
import contractData from '../../artifacts/contracts/DreamNFT.sol/DreAmNFT.json';

const NFTGiftScreen = ({ route, navigation }) => {
  const { tokenId } = route.params;
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [nft, setNft] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (tokenId) {
      loadNFTDetails();
    }
  }, [tokenId]);

  const loadNFTDetails = async () => {
    try {
      setLoading(true);

      // Get NFT details from Firestore
      const nftQuery = query(
        collection(firestore, 'nfts'),
        where('tokenId', '==', tokenId)
      );

      const snapshot = await getDocs(nftQuery);

      if (snapshot.empty) {
        Alert.alert('Error', 'NFT not found');
        navigation.goBack();
        return;
      }

      const nftData = {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      };

      // Check if current user owns this NFT
      if (nftData.ownerId !== currentUser.uid) {
        Alert.alert('Error', 'You do not own this NFT');
        navigation.goBack();
        return;
      }

      setNft(nftData);
    } catch (error) {
      console.error('Error loading NFT details:', error);
      Alert.alert('Error', 'Failed to load NFT details');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);

      const usersQuery = query.toLowerCase();

      // Search by display name
      const displayNameQuery = query(
        collection(firestore, 'users'),
        where('displayNameLower', '>=', usersQuery),
        where('displayNameLower', '<=', usersQuery + '\uf8ff'),
        where('uid', '!=', currentUser.uid)
      );

      const snapshot = await getDocs(displayNameQuery);

      if (!snapshot.empty) {
        const users = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setSearchResults(users);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setRecipient(user.displayName);
    setSearchResults([]);
  };

  const handleSendGift = async () => {
    if (!nft || !selectedUser) {
      Alert.alert('Error', 'Please select a recipient');
      return;
    }

    try {
      setSending(true);

      // In a real app, this would connect to the blockchain and transfer the NFT
      // For demo purposes, we'll simulate the transfer

      // Update NFT ownership in Firestore
      await updateDoc(doc(firestore, 'nfts', nft.id), {
        ownerId: selectedUser.id,
        previousOwnerId: currentUser.uid,
        transferredAt: serverTimestamp(),
        transferType: 'gift'
      });

      // Create a gift record
      await addDoc(collection(firestore, 'gifts'), {
        nftId: nft.id,
        tokenId: nft.tokenId,
        senderId: currentUser.uid,
        senderName: currentUser.displayName,
        recipientId: selectedUser.id,
        recipientName: selectedUser.displayName,
        message: message,
        createdAt: serverTimestamp()
      });

      // Create notification for recipient
      await addDoc(collection(firestore, 'notifications'), {
        userId: selectedUser.id,
        type: 'gift',
        actorId: currentUser.uid,
        actorName: currentUser.displayName,
        tokenId: nft.tokenId,
        nftTitle: nft.title,
        message: message,
        read: false,
        createdAt: serverTimestamp()
      });

      Alert.alert(
        'Success',
        `Your NFT has been gifted to ${selectedUser.displayName}`,
        [{ text: 'OK', onPress: () => navigation.navigate('Profile') }]
      );
    } catch (error) {
      console.error('Error sending gift:', error);
      Alert.alert('Error', 'Failed to send gift. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gift NFT</Text>
      </View>

      <View style={styles.nftContainer}>
        <Image
  // screens/NFTGiftScreen.js (continued)
            source={{ uri: nft.imageUrl }}
            style={styles.nftImage}
            resizeMode="cover"
          />

          <View style={styles.nftDetails}>
            <Text style={styles.nftTitle}>{nft.title || 'Untitled NFT'}</Text>
            <Text style={styles.nftDescription}>
              Token ID: #{nft.tokenId}
            </Text>
            {nft.rarity && (
              <View style={[styles.rarityBadge, styles[`${nft.rarity}Badge`]]}>
                <Text style={styles.rarityText}>
                  {nft.rarity.charAt(0).toUpperCase() + nft.rarity.slice(1)}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recipient</Text>
          <TextInput
            style={styles.input}
            placeholder="Search by username..."
            value={recipient}
            onChangeText={(text) => {
              setRecipient(text);
              if (!selectedUser || text !== selectedUser.displayName) {
                setSelectedUser(null);
                searchUsers(text);
              }
            }}
          />

          {searching && (
            <ActivityIndicator
              style={styles.searchingIndicator}
              size="small"
              color="#6200ee"
            />
          )}

          {searchResults.length > 0 && !selectedUser && (
            <View style={styles.searchResults}>
              {searchResults.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={styles.userItem}
                  onPress={() => handleUserSelect(user)}
                >
                  <Image
                    source={{ uri: user.photoURL || 'https://via.placeholder.com/50' }}
                    style={styles.userAvatar}
                  />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.displayName}</Text>
                    {user.bio && (
                      <Text style={styles.userBio} numberOfLines={1}>
                        {user.bio}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {selectedUser && (
            <View style={styles.selectedUser}>
              <Image
                source={{ uri: selectedUser.photoURL || 'https://via.placeholder.com/50' }}
                style={styles.selectedUserAvatar}
              />
              <View style={styles.selectedUserInfo}>
                <Text style={styles.selectedUserName}>{selectedUser.displayName}</Text>
                {selectedUser.bio && (
                  <Text style={styles.selectedUserBio} numberOfLines={1}>
                    {selectedUser.bio}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => {
                  setSelectedUser(null);
                  setRecipient('');
                }}
              >
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gift Message</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Write a message to accompany your gift..."
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={200}
          />
          <Text style={styles.characterCount}>
            {message.length}/200
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Ionicons name="information-circle-outline" size={20} color="#666" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Gifting this NFT will transfer ownership to the recipient.
            This action cannot be undone.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.giftButton,
            (!selectedUser || sending) && styles.disabledButton
          ]}
          onPress={handleSendGift}
          disabled={!selectedUser || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="gift-outline" size={20} color="#fff" />
              <Text style={styles.giftButtonText}>Send Gift</Text>
            </>
          )}
        </TouchableOpacity>
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
    },
    header: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333',
    },
    nftContainer: {
      padding: 16,
      alignItems: 'center',
    },
    nftImage: {
      width: '100%',
      height: 300,
      borderRadius: 12,
      backgroundColor: '#f0f0f0',
    },
    nftDetails: {
      alignItems: 'center',
      marginTop: 16,
    },
    nftTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 4,
    },
    nftDescription: {
      fontSize: 14,
      color: '#666',
      marginBottom: 8,
    },
    rarityBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 16,
      marginTop: 8,
    },
    commonBadge: {
      backgroundColor: '#e0e0e0',
    },
    uncommonBadge: {
      backgroundColor: '#4caf50',
    },
    rareBadge: {
      backgroundColor: '#2196f3',
    },
    epicBadge: {
      backgroundColor: '#9c27b0',
    },
    legendaryBadge: {
      backgroundColor: '#f44336',
    },
    rarityText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#fff',
    },
    section: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: '#f0f0f0',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 12,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
    },
    searchingIndicator: {
      marginTop: 12,
      alignSelf: 'center',
    },
    searchResults: {
      marginTop: 12,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      maxHeight: 200,
    },
    userItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    userAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#f0f0f0',
    },
    userInfo: {
      marginLeft: 12,
      flex: 1,
    },
    userName: {
      fontSize: 14,
      fontWeight: '500',
      color: '#333',
    },
    userBio: {
      fontSize: 12,
      color: '#666',
      marginTop: 2,
    },
    selectedUser: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      padding: 12,
      backgroundColor: '#f0f0f0',
      borderRadius: 8,
    },
    selectedUserAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#ddd',
    },
    selectedUserInfo: {
      marginLeft: 12,
      flex: 1,
    },
    selectedUserName: {
      fontSize: 14,
      fontWeight: '500',
      color: '#333',
    },
    selectedUserBio: {
      fontSize: 12,
      color: '#666',
      marginTop: 2,
    },
    removeButton: {
      padding: 8,
    },
    messageInput: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      height: 100,
      textAlignVertical: 'top',
    },
    characterCount: {
      fontSize: 12,
      color: '#666',
      alignSelf: 'flex-end',
      marginTop: 4,
    },
    infoSection: {
      flexDirection: 'row',
      padding: 16,
      backgroundColor: '#f9f5ff',
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 8,
    },
    infoIcon: {
      marginRight: 8,
    },
    infoText: {
      flex: 1,
      fontSize: 12,
      color: '#666',
      lineHeight: 18,
    },
    giftButton: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#6200ee',
      paddingVertical: 14,
      marginHorizontal: 16,
      marginBottom: 24,
      borderRadius: 8,
    },
    giftButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#fff',
      marginLeft: 8,
    },
    disabledButton: {
      opacity: 0.6,
    },
  });

  export default NFTGiftScreen;