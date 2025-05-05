// screens/DreamDetailScreen.js (continued)
import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Share } from 'react-native';
import { Audio } from 'expo-av';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { firestore, auth } from '../firebase/config';
import { collection, doc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import CommentSection from '../components/CommentSection';
import RarityBadge from '../components/RarityBadge';
import { mintDreamAsNFT } from '../utils/nftUtils';
import DreamTagList from '../components/DreamTagList';

const DreamDetailScreen = ({ route, navigation }) => {
  const { dreamId } = route.params;
  const [dream, setDream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [mintLoading, setMintLoading] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [comments, setComments] = useState([]);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const dreamRef = doc(firestore, 'dreams', dreamId);
    const unsubscribe = onSnapshot(dreamRef, (docSnap) => {
      if (docSnap.exists()) {
        setDream({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log('No such dream!');
        navigation.goBack();
      }
      setLoading(false);
    });

    // Load comments
    const commentsRef = collection(firestore, 'dreams', dreamId, 'comments');
    const commentsUnsubscribe = onSnapshot(commentsRef, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
      setComments(commentsData.sort((a, b) => b.timestamp - a.timestamp));
    });

    return () => {
      unsubscribe();
      commentsUnsubscribe();
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [dreamId]);

  const playSound = async () => {
    if (dream.audioUrl) {
      try {
        if (sound) {
          if (isPlaying) {
            await sound.pauseAsync();
            setIsPlaying(false);
          } else {
            await sound.playAsync();
            setIsPlaying(true);
          }
        } else {
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: dream.audioUrl },
            { shouldPlay: true }
          );
          setSound(newSound);
          setIsPlaying(true);

          newSound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
              setIsPlaying(false);
            }
          });
        }
      } catch (error) {
        console.error('Error playing sound', error);
      }
    }
  };

  const handleLike = async () => {
    if (!currentUser) return;

    setLikeLoading(true);
    try {
      const dreamRef = doc(firestore, 'dreams', dreamId);

      const isLiked = dream.likes?.includes(currentUser.uid);
      if (isLiked) {
        await updateDoc(dreamRef, {
          likes: arrayRemove(currentUser.uid),
          likeCount: (dream.likeCount || 1) - 1
        });
      } else {
        await updateDoc(dreamRef, {
          likes: arrayUnion(currentUser.uid),
          likeCount: (dream.likeCount || 0) + 1
        });
      }
    } catch (error) {
      console.error('Error updating like', error);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleMintNFT = async () => {
    if (!currentUser || dream.nftStatus === 'minted') return;

    setMintLoading(true);
    try {
      await mintDreamAsNFT(dream, currentUser.uid);
      // NFT status will be updated via the snapshot listener
    } catch (error) {
      console.error('Error minting NFT', error);
    } finally {
      setMintLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my dream "${dream.title}" on DreAmNFT!`,
        url: `https://dreamnft.app/dream/${dreamId}`,
      });
    } catch (error) {
      console.error('Error sharing dream', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (!dream) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Dream not found</Text>
      </View>
    );
  }

  const isOwner = currentUser && dream.userId === currentUser.uid;
  const isLiked = dream.likes?.includes(currentUser?.uid);
  const dreamDate = dream.createdAt?.toDate ? dream.createdAt.toDate() : new Date();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{dream.title}</Text>
        <Text style={styles.date}>
          {dreamDate.toLocaleDateString()} • {dreamDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </Text>

        {dream.nftStatus === 'minted' && (
          <View style={styles.nftBadge}>
            <MaterialCommunityIcons name="certificate" size={16} color="#FFD700" />
            <Text style={styles.nftText}>NFT</Text>
          </View>
        )}
      </View>

      {dream.imageUrl && (
        <Image source={{ uri: dream.imageUrl }} style={styles.image} />
      )}

      <View style={styles.content}>
        <Text style={styles.description}>
          {showFullDescription ? dream.description : `${dream.description.substring(0, 150)}${dream.description.length > 150 ? '...' : ''}`}
        </Text>

        {dream.description.length > 150 && (
          <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
            <Text style={styles.showMoreText}>
              {showFullDescription ? 'Show less' : 'Show more'}
            </Text>
          </TouchableOpacity>
        )}

        {dream.tags && dream.tags.length > 0 && (
          <DreamTagList tags={dream.tags} />
        )}

        {dream.rarity && (
          <RarityBadge rarity={dream.rarity} style={styles.rarityBadge} />
        )}

        {dream.audioUrl && (
          <TouchableOpacity style={styles.audioButton} onPress={playSound}>
            <FontAwesome name={isPlaying ? 'pause' : 'play'} size={20} color="#fff" />
            <Text style={styles.audioText}>{isPlaying ? 'Pause Audio' : 'Play Audio'}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike} disabled={likeLoading}>
            {likeLoading ? (
              <ActivityIndicator size="small" color="#6200ee" />
            ) : (
              <>
                <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={24} color={isLiked ? '#e91e63' : '#333'} />
                <Text style={styles.actionText}>{dream.likeCount || 0}</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Comments', { dreamId })}>
            <Ionicons name="chatbubble-outline" size={22} color="#333" />
            <Text style={styles.actionText}>{comments.length}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#333" />
          </TouchableOpacity>

          {!dream.nftStatus || dream.nftStatus === 'none' ? (
            <TouchableOpacity
              style={[styles.mintButton, mintLoading && styles.disabledButton]}
              onPress={handleMintNFT}
              disabled={mintLoading || !isOwner}
            >
              {mintLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name="ethereum" size={20} color="#fff" />
                  <Text style={styles.mintButtonText}>Mint as NFT</Text>
                </>
              )}
            </TouchableOpacity>
          ) : dream.nftStatus === 'pending' ? (
            <View style={[styles.mintButton, styles.pendingButton]}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.mintButtonText}>Minting...</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.viewNftButton}
              onPress={() => navigation.navigate('NFTDetail', { tokenId: dream.tokenId })}
            >
              <MaterialCommunityIcons name="eye-outline" size={20} color="#fff" />
              <Text style={styles.mintButtonText}>View NFT</Text>
            </TouchableOpacity>
          )}
        </View>

        <CommentSection
          dreamId={dreamId}
          comments={comments}
          navigation={navigation}
        />
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  nftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  nftText: {
    fontSize: 12,
    color: '#8D6E63',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
  },
  showMoreText: {
    color: '#6200ee',
    fontWeight: '600',
    marginBottom: 16,
  },
  rarityBadge: {
    marginBottom: 16,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  audioText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#333',
  },
  mintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  pendingButton: {
    backgroundColor: '#ff9800',
  },
  viewNftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  mintButtonText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
  }
});

export default DreamDetailScreen;