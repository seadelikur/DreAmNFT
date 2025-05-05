// screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { auth, firestore } from '../firebase/config';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import DreamCard from '../components/DreamCard';
import NFTCard from '../components/NFTCard';

const ProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params || {};
  const [user, setUser] = useState(null);
  const [dreams, setDreams] = useState([]);
  const [nfts, setNfts] = useState([]);
  const [activeTab, setActiveTab] = useState('dreams');
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;
  const isOwnProfile = !userId || userId === currentUser?.uid;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const targetUserId = userId || currentUser?.uid;
        if (!targetUserId) {
          navigation.replace('Login');
          return;
        }

        // Fetch user profile
        const userDoc = await getDoc(doc(firestore, 'users', targetUserId));
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() });
        } else if (isOwnProfile) {
          // If it's current user but doc doesn't exist, use auth data
          setUser({
            id: currentUser.uid,
            displayName: currentUser.displayName || 'Anonymous',
            photoURL: currentUser.photoURL,
            email: currentUser.email
          });
        }

        // Fetch user's dreams
        const dreamsQuery = query(
          collection(firestore, 'dreams'),
          where('userId', '==', targetUserId),
          orderBy('createdAt', 'desc')
        );
        const dreamsSnapshot = await getDocs(dreamsQuery);
        const dreamsData = dreamsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }));
        setDreams(dreamsData);

        // Fetch user's NFTs (dreams that have been minted)
        const nftsData = dreamsData.filter(dream => dream.nftStatus === 'minted');
        setNfts(nftsData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, currentUser, navigation]);

  const renderDreamItem = ({ item }) => (
    <DreamCard dream={item} onPress={() => navigation.navigate('DreamDetail', { dreamId: item.id })} />
  );

  const renderNFTItem = ({ item }) => (
    <NFTCard
      nft={{
        id: item.tokenId,
        name: item.title,
        image: item.imageUrl,
        rarity: item.rarity
      }}
      onPress={() => navigation.navigate('NFTDetail', { tokenId: item.tokenId })}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image
            source={user.photoURL ? { uri: user.photoURL } : require('../assets/default-avatar.png')}
            style={styles.avatar}
          />

          <Text style={styles.username}>{user.displayName || 'Anonymous'}</Text>

          {user.bio && (
            <Text style={styles.bio}>{user.bio}</Text>
          )}

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dreams.length}</Text>
              <Text style={styles.statLabel}>Dreams</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{nfts.length}</Text>
              <Text style={styles.statLabel}>NFTs</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.followersCount || 0}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
          </View>

          {isOwnProfile ? (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.followButton}
              onPress={() => {/* Follow/unfollow logic */}}
            >
              <Text style={styles.followButtonText}>
                {user.isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'dreams' && styles.activeTab]}
            onPress={() => setActiveTab('dreams')}
          >
            <Ionicons
              name="moon"
              size={20}
              color={activeTab === 'dreams' ? '#6200ee' : '#888'}
            />
            <Text style={[styles.tabText, activeTab === 'dreams' && styles.activeTabText]}>
              Dreams
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'nfts' && styles.activeTab]}
            onPress={() => setActiveTab('nfts')}
          >
            <MaterialCommunityIcons
              name="ethereum"
              size={20}
              color={activeTab === 'nfts' ? '#6200ee' : '#888'}
            />
            <Text style={[styles.tabText, activeTab === 'nfts' && styles.activeTabText]}>
              NFTs
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'dreams' && (
          dreams.length > 0 ? (
            <FlatList
              data={dreams}
              renderItem={renderDreamItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="moon-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No dreams recorded yet</Text>
              {isOwnProfile && (
                <TouchableOpacity
                  style={styles.recordButton}
                  onPress={() => navigation.navigate('RecordDream')}
                >
                  <Text style={styles.recordButtonText}>Record a Dream</Text>
                </TouchableOpacity>
              )}
            </View>
          )
        )}

        {activeTab === 'nfts' && (
          nfts.length > 0 ? (
            <FlatList
              data={nfts}
              renderItem={renderNFTItem}
              keyExtractor={item => item.tokenId}
              scrollEnabled={false}
              numColumns={2}
              contentContainerStyle={styles.gridContent}
            />
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="ethereum" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No NFTs minted yet</Text>
              {isOwnProfile && dreams.length > 0 && (
                <TouchableOpacity
                  style={styles.mintButton}
                  onPress={() => navigation.navigate('DreamsList', { filter: 'notMinted' })}
                >
                  <Text style={styles.mintButtonText}>Mint a Dream as NFT</Text>
                </TouchableOpacity>
              )}
            </View>
          )
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#e91e63',
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#6200ee',
    borderRadius: 20,
  },
  editButtonText: {
    color: '#6200ee',
    fontWeight: '600',
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#6200ee',
    borderRadius: 20,
  },
  followButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#6200ee',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#6200ee',
  },
  listContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  gridContent: {
    paddingTop: 16,
    paddingHorizontal: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 16,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  recordButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  mintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  mintButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ProfileScreen;