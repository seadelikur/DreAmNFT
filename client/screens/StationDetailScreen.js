// screens/StationDetailScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Share,
  Animated
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { firestore, auth } from '../firebase/config';
import { doc, getDoc, collection, query, where, orderBy, getDocs, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import DreamCard from '../components/DreamCard';

const StationDetailScreen = ({ route, navigation }) => {
  const { stationId } = route.params;
  const [loading, setLoading] = useState(true);
  const [station, setStation] = useState(null);
  const [dreams, setDreams] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffleMode, setIsShuffleMode] = useState(false);
  const [playQueue, setPlayQueue] = useState([]);
  const [playHistory, setPlayHistory] = useState([]);
  const [filterTag, setFilterTag] = useState(null);

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [200, 80],
    extrapolate: 'clamp'
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100, 200],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp'
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 100, 200],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp'
  });

  useEffect(() => {
    loadStationDetails();
    loadDreams();
    checkFollowStatus();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [stationId]);

  const loadStationDetails = async () => {
    try {
      // In a real app, fetch from Firestore
      // For demo purposes, using hardcoded data
      const stationData = {
        id: stationId,
        name: stationId === '1' ? 'Flying Dreams' :
              stationId === '2' ? 'Ocean Depths' :
              stationId === '3' ? 'Nightmares' :
              stationId === '4' ? 'Lucid Dreams' : 'Dream Station',
        description: 'A collection of the most intriguing and vivid dreams shared by our community members. Listen, experience, and connect through the subconscious journeys of others.',
        imageUrl: stationId === '1' ? 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c' :
                 stationId === '2' ? 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' :
                 stationId === '3' ? 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0' :
                 stationId === '4' ? 'https://images.unsplash.com/photo-1566438480900-0609be27a4be' :
                 'https://images.unsplash.com/photo-1566438480900-0609be27a4be',
        creatorId: 'admin',
        creatorName: 'DreAmNFT Team',
        followers: 254,
        tags: ['dreams', 'sleep', 'imagination', 'subconscious', 'storytelling'],
        totalPlays: 1872,
        createdAt: '2023-09-01',
      };

      setStation(stationData);
    } catch (error) {
      console.error('Error loading station details:', error);
    }
  };

  const loadDreams = async () => {
    try {
      // In a real app, fetch from Firestore
      // For demo, using hardcoded data
      const dreamData = [
        {
          id: '1',
          title: 'Soaring Over Mountains',
          userId: 'user1',
          userName: 'SkyDreamer',
          userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
          audioUrl: 'https://example.com/audio1.mp3',
          duration: 128,
          description: 'In this dream, I was flying over majestic mountain ranges with eagles by my side. The feeling of freedom was indescribable.',
          imageUrl: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606',
          likes: 42,
          plays: 137,
          tags: ['flying', 'mountains', 'freedom'],
          createdAt: '2023-09-15',
        },
        {
          id: '2',
          title: 'Cloudwalking',
          userId: 'user2',
          userName: 'DreamWeaver',
          userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
          audioUrl: 'https://example.com/audio2.mp3',
          duration: 97,
          description: 'I was walking on clouds, feeling their softness beneath my feet. Each step created ripples in the cloud formation.',
          imageUrl: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c',
          likes: 38,
          plays: 112,
          tags: ['clouds', 'sky', 'walking'],
          createdAt: '2023-09-10',
        },
        {
          id: '3',
          title: 'Wings of My Own',
          userId: 'user3',
          userName: 'NightFlyer',
          userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
          audioUrl: 'https://example.com/audio3.mp3',
          duration: 145,
          description: 'I sprouted beautiful feathered wings and could fly anywhere. I visited places I have never seen before.',
          imageUrl: 'https://images.unsplash.com/photo-1499346030926-9a72daac6c63',
          likes: 56,
          plays: 189,
          tags: ['wings', 'flying', 'transformation'],
          createdAt: '2023-09-05',
        },
        {
          id: '4',
          title: 'Flying City',
          userId: 'user4',
          userName: 'SleepyTraveler',
          userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61',
          audioUrl: 'https://example.com/audio4.mp3',
          duration: 118,
          description: 'An entire city was floating among the clouds. I was flying between buildings and exploring this aerial metropolis.',
          imageUrl: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e',
          likes: 29,
          plays: 97,
          tags: ['city', 'flying', 'exploration'],
          createdAt: '2023-08-28',
        },
        {
          id: '5',
          title: 'Balloon Journey',
          userId: 'user5',
          userName: 'SkyWanderer',
          userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
          audioUrl: 'https://example.com/audio5.mp3',
          duration: 132,
          description: 'I was traveling in a hot air balloon across different landscapes, each more beautiful than the last.',
          imageUrl: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee',
          likes: 47,
          plays: 156,
          tags: ['balloon', 'journey', 'landscape'],
          createdAt: '2023-08-20',
        },
      ];

      setDreams(dreamData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading dreams:', error);
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      // In real app, check if current user follows this station
      setIsFollowing(Math.random() > 0.5); // Random for demo
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const toggleFollow = async () => {
    try {
      // In real app, update Firestore to follow/unfollow
      setIsFollowing(!isFollowing);

      // Update station with new follower count
      setStation(prev => ({
        ...prev,
        followers: isFollowing ? prev.followers - 1 : prev.followers + 1
      }));
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
  };

  const handlePlayAll = () => {
    if (dreams.length === 0) return;

    const queue = [...dreams];
    setPlayQueue(queue);
    playDream(queue[0]);
  };

  const handleShuffle = () => {
    if (dreams.length === 0) return;

    setIsShuffleMode(!isShuffleMode);

    // If turning on shuffle, shuffle the current queue
    if (!isShuffleMode) {
      const shuffled = [...dreams].sort(() => Math.random() - 0.5);
      setPlayQueue(shuffled);

      // If something is already playing, don't interrupt
      if (!currentlyPlaying) {
        playDream(shuffled[0]);
      }
    } else {
      // If turning off shuffle, restore the ordered list
      setPlayQueue([...dreams]);
    }
  };

  const playDream = async (dream) => {
    try {
      // Stop current playback if any
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      setCurrentlyPlaying(dream);
      setIsPlaying(true);

      // Add to play history
      setPlayHistory(prev => [dream, ...prev.slice(0, 9)]);

      // In a real app, this would play the actual audio from the URL
      // For demo purposes, we'll just simulate playback
      const { sound: newSound } = await Audio.Sound.createAsync(
        require('../assets/demo-dream-audio.mp3'), // You would need this file or replace with a remote URL
        { shouldPlay: true }
      );

      setSound(newSound);

      // Add this to handle when audio finishes playing
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          playNextInQueue();
        }
      });

      // Update play count
      const updatedDreams = dreams.map(d => {
        if (d.id === dream.id) {
          return { ...d, plays: d.plays + 1 };
        }
        return d;
      });
      setDreams(updatedDreams);

    } catch (error) {
      console.error('Error playing audio:', error);
      setCurrentlyPlaying(null);
      setIsPlaying(false);
    }
  };

  const playNextInQueue = () => {
    if (playQueue.length === 0) return;

    // Find index of current playing dream
    const currentIndex = playQueue.findIndex(d => d.id === currentlyPlaying?.id);

    // If it's the last one, either stop or loop back
    if (currentIndex === playQueue.length - 1) {
      // For demo, we'll stop at the end
      setCurrentlyPlaying(null);
      setIsPlaying(false);
      return;
    }

    // Otherwise play next
    const nextDream = playQueue[currentIndex + 1];
    playDream(nextDream);
  };

  const playPreviousInQueue = () => {
    if (playQueue.length === 0 || !currentlyPlaying) return;

    // Find index of current playing dream
    const currentIndex = playQueue.findIndex(d => d.id === currentlyPlaying.id);

    // If it's the first one, do nothing or loop to the end
    if (currentIndex <= 0) return;

    // Otherwise play previous
    const prevDream = playQueue[currentIndex - 1];
    playDream(prevDream);
  };

  const togglePlayPause = async () => {
    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }

    setIsPlaying(!isPlaying);
  };

  const handleFilterByTag = (tag) => {
    if (filterTag === tag) {
      setFilterTag(null); // Toggle off if already selected
    } else {
      setFilterTag(tag);
    }
  };

  const filteredDreams = filterTag
    ? dreams.filter(dream => dream.tags.includes(filterTag))
    : dreams;

  const handleShareStation = async () => {
    try {
      await Share.share({
        message: `Check out the "${station?.name}" dream station on DreAmNFT! Listen to amazing dream experiences.`,
        url: `https://dreamnft.app/stations/${stationId}`, // This would be your deep link in a real app
      });
    } catch (error) {
      console.error('Error sharing station:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (!station) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Station not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.headerContainer,
        { height: headerHeight }
      ]}>
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)', 'transparent']}
          style={styles.headerGradient}
        />
        <Animated.Image
          source={{ uri: station.imageUrl }}
          style={[styles.headerImage, { opacity: headerOpacity }]}
        />

        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Animated.Text
            style={[styles.navTitle, { opacity: titleOpacity }]}
            numberOfLines={1}
          >
            {station.name}
          </Animated.Text>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShareStation}
          >
            <Ionicons name="share-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[styles.headerContent, { opacity: headerOpacity }]}
        >
          <Text style={styles.stationName}>{station.name}</Text>
          <Text style={styles.followerCount}>
            {station.followers} followers • {station.totalPlays} plays
          </Text>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[
                styles.followButton,
                isFollowing ? styles.followingButton : {}
              ]}
              onPress={toggleFollow}
            >
              <Text style={[
                styles.followButtonText,
                isFollowing ? styles.followingButtonText : {}
              ]}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.playAllButton}
              onPress={handlePlayAll}
            >
              <Ionicons name="play" size={16} color="#fff" />
              <Text style={styles.playAllText}>Play All</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.shuffleButton,
                isShuffleMode ? styles.shuffleActiveButton : {}
              ]}
              onPress={handleShuffle}
            >
              <Ionicons
                name="shuffle"
                size={20}
                color={isShuffleMode ? "#6200ee" : "#666"}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.scrollContent}>
          <View style={styles.creatorSection}>
            <Text style={styles.sectionTitle}>About this Station</Text>
            <Text style={styles.stationDescription}>
              {station.description}
            </Text>
            <Text style={styles.createdBy}>
              Created by {station.creatorName}
            </Text>
          </View>

          <View style={styles.tagsSection}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tagsScrollView}
            >
              {station.tags.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.tagButton,
                    filterTag === tag ? styles.tagButtonActive : {}
                  ]}
                  onPress={() => handleFilterByTag(tag)}
                >
                  <Text style={[
                    styles.tagText,
                    filterTag === tag ? styles.tagTextActive : {}
                  ]}>
                    #{tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.dreamsSection}>
            <Text style={styles.sectionTitle}>
              Dreams {filterTag ? `• #${filterTag}` : ''}
              {filterTag && (
                <TouchableOpacity
                  style={styles.clearFilterButton}
                  onPress={() => setFilterTag(null)}
                >
                  <Text style={styles.clearFilterText}>Clear</Text>
                </TouchableOpacity>
              )}
            </Text>

            {filteredDreams.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Ionicons name="sad-outline" size={48} color="#ccc" />
                <Text style={styles.emptyStateText}>
                  No dreams found with this tag
                </Text>
              </View>
            ) : (
              filteredDreams.map((dream) => (
                <View key={dream.id} style={styles.dreamItem}>
                  <TouchableOpacity
                    style={styles.dreamPlayButton}
                    onPress={() => playDream(dream)}
                  >
                    <Ionicons
                      name={currentlyPlaying?.id === dream.id && isPlaying ? "pause" : "play"}
                      size={24}
                      color="#666"
                    />
                  </TouchableOpacity>

                  <View style={styles.dreamContent}>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('DreamDetail', { dreamId: dream.id })}
                    >
                      <Text style={styles.dreamTitle}>{dream.title}</Text>
                      <Text style={styles.dreamAuthor}>by {dream.userName}</Text>
                    </TouchableOpacity>

                    <View style={styles.dreamStats}>
                      <Text style={styles.dreamDuration}>
                        {Math.floor(dream.duration / 60)}:{(dream.duration % 60).toString().padStart(2, '0')}
                      </Text>
                      <View style={styles.dreamPlays}>
                        <Ionicons name="headset-outline" size={14} color="#666" />
                        <Text style={styles.playsCount}>{dream.plays}</Text>
                      </View>
                      <View style={styles.dreamLikes}>
                        <Ionicons name="heart-outline" size={14} color="#666" />
                        <Text style={styles.likesCount}>{dream.likes}</Text>
                      </View>
                    </View>
                  </View>

                  <Image
                    source={{ uri: dream.imageUrl }}
                    style={styles.dreamImage}
                  />
                </View>
              ))
            )}
          </View>
        </View>
      </Animated.ScrollView>

      {currentlyPlaying && (
        <View style={styles.playingBar}>
          <Image
            source={{ uri: currentlyPlaying.imageUrl }}
            style={styles.playingImage}
          />

          <View style={styles.playingInfo}>
            <Text style={styles.playingTitle} numberOfLines={1}>
              {currentlyPlaying.title}
            </Text>
            <Text style={styles.playingAuthor} numberOfLines={1}>
              by {currentlyPlaying.userName}
            </Text>
          </View>

          <View style={styles.playControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={playPreviousInQueue}
            >
              <Ionicons name="play-skip-back" size={24} color="#333" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.playPauseButton}
              onPress={togglePlayPause}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={playNextInQueue}
            >
              <Ionicons name="play-skip-forward" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    zIndex: 10,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    zIndex: 1,
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    zIndex: 0,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    height: 80,
    zIndex: 2,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 2,
  },
  stationName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  followerCount: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#6200ee',
    borderRadius: 20,
    marginRight: 12,
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  followingButtonText: {
    color: '#fff',
  },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    marginRight: 12,
  },
  playAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    marginLeft: 4,
  },
  shuffleButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  shuffleActiveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  scrollView: {
    flex: 1,
    paddingTop: 200, // Initial header height
  },
  scrollContent: {
    paddingBottom: 16,
  },
  creatorSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  stationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
  },
  createdBy: {
    fontSize: 12,
    color: '#666',
  },
  tagsSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tagsScrollView: {
    flexDirection: 'row',
  },
  tagButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    marginRight: 8,
  },
  tagButtonActive: {
    backgroundColor: '#6200ee',
  },
  tagText: {
    fontSize: 14,
    color: '#666',
  },
  tagTextActive: {
    color: '#fff',
  },
  dreamsSection: {
    padding: 16,
  },
  clearFilterButton: {
    marginLeft: 8,
  },
  clearFilterText: {
    fontSize: 12,
    color: '#6200ee',
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  dreamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dreamPlayButton: {
    padding: 8,
  },
  dreamContent: {
    flex: 1,
    marginLeft: 8,
  },
  dreamTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  dreamAuthor: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dreamStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dreamDuration: {
    fontSize: 12,
    color: '#666',
    marginRight: 12,
  },
  dreamPlays: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  playsCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  dreamLikes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  dreamImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  playingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f5ff',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  playingImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  playingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  playingAuthor: {
    fontSize: 12,
    color: '#666',
  },
  playControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: 8,
  },
  playPauseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6200ee',
  },
});

export default StationDetailScreen;