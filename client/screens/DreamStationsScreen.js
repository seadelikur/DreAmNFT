// screens/DreamStationsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { firestore, auth } from '../firebase/config';
import { collection, query, orderBy, getDocs, where, limit } from 'firebase/firestore';
import { Audio } from 'expo-av';

const DreamStationsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stations, setStations] = useState([]);
  const [featuredDreams, setFeaturedDreams] = useState([]);
  const [popularStations, setPopularStations] = useState([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [sound, setSound] = useState(null);

  const currentUser = auth.currentUser;

  useEffect(() => {
    loadStations();
    loadFeaturedDreams();
    loadPopularStations();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadStations = async () => {
    try {
      setLoading(true);

      // In a real app, query Firestore for stations
      // For demo, we'll use hardcoded stations
      const demoStations = [
        {
          id: '1',
          name: 'Flying Dreams',
          description: 'Listen to dreams of soaring through the skies',
          imageUrl: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c',
          dreamCount: 42,
          tags: ['flying', 'freedom', 'sky']
        },
        {
          id: '2',
          name: 'Ocean Depths',
          description: 'Underwater dream experiences and oceanic journeys',
          imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
          dreamCount: 38,
          tags: ['water', 'ocean', 'swimming']
        },
        {
          id: '3',
          name: 'Nightmares',
          description: 'Confronting fears through shared nightmare experiences',
          imageUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0',
          dreamCount: 27,
          tags: ['fear', 'dark', 'nightmare']
        },
        {
          id: '4',
          name: 'Lucid Dreams',
          description: 'The art of conscious dreaming and control',
          imageUrl: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be',
          dreamCount: 56,
          tags: ['lucid', 'control', 'awareness']
        },
        {
          id: '5',
          name: 'Childhood Dreams',
          description: 'Nostalgic dream experiences from childhood',
          imageUrl: 'https://images.unsplash.com/photo-1471899236350-e3016a782883',
          dreamCount: 33,
          tags: ['childhood', 'memories', 'nostalgia']
        }
      ];

      setStations(demoStations);
    } catch (error) {
      console.error('Error loading stations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFeaturedDreams = async () => {
    try {
      // In a real app, query Firestore for featured dreams with audio
      // For demo, we'll use hardcoded dreams
      const demoDreams = [
        {
          id: '101',
          title: 'Flying Over Mountains',
          userId: 'user1',
          userName: 'DreamExplorer',
          audioUrl: 'https://example.com/audio1.mp3', // This should be a real URL in production
          duration: 125, // seconds
          description: 'I was flying over snow-capped mountains with eagles',
          imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
          likes: 42
        },
        {
          id: '102',
          title: 'Underwater City',
          userId: 'user2',
          userName: 'OceanDreamer',
          audioUrl: 'https://example.com/audio2.mp3', // This should be a real URL in production
          duration: 98, // seconds
          description: 'Discovered an ancient city beneath the waves',
          imageUrl: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be',
          likes: 38
        },
        {
          id: '103',
          title: 'Talking Animals',
          userId: 'user3',
          userName: 'WildImagination',
          audioUrl: 'https://example.com/audio3.mp3', // This should be a real URL in production
          duration: 142, // seconds
          description: 'All the animals in the forest could talk to me',
          imageUrl: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca',
          likes: 27
        }
      ];

      setFeaturedDreams(demoDreams);
    } catch (error) {
      console.error('Error loading featured dreams:', error);
    }
  };

  const loadPopularStations = async () => {
    try {
      // In a real app, query Firestore for popular stations
      // For demo, we'll use a subset of our stations
      setPopularStations([
        {
          id: '4',
          name: 'Lucid Dreams',
          description: 'The art of conscious dreaming and control',
          imageUrl: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be',
          dreamCount: 56,
          tags: ['lucid', 'control', 'awareness'],
          listeners: 128
        },
        {
          id: '1',
          name: 'Flying Dreams',
          description: 'Listen to dreams of soaring through the skies',
          imageUrl: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c',
          dreamCount: 42,
          tags: ['flying', 'freedom', 'sky'],
          listeners: 96
        },
        {
          id: '3',
          name: 'Nightmares',
          description: 'Confronting fears through shared nightmare experiences',
          imageUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0',
          dreamCount: 27,
          tags: ['fear', 'dark', 'nightmare'],
          listeners: 74
        }
      ]);
    } catch (error) {
      console.error('Error loading popular stations:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadStations(),
      loadFeaturedDreams(),
      loadPopularStations()
    ]);
    setRefreshing(false);
  };

  const playAudio = async (dream) => {
    try {
      // Stop current playback if any
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      // In a real app, this would play the actual audio from the URL
      // For demo purposes, we'll just simulate playback
      setCurrentlyPlaying(dream);

      // Create dummy sound for demo
      const { sound: newSound } = await Audio.Sound.createAsync(
        require('../assets/demo-dream-audio.mp3'), // You would need this file or replace with a remote URL
        { shouldPlay: true }
      );

      setSound(newSound);

      // Add this to handle when audio finishes playing
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setCurrentlyPlaying(null);
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      setCurrentlyPlaying(null);
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
    setCurrentlyPlaying(null);
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const renderStationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.stationItem}
      onPress={() => navigation.navigate('StationDetail', { stationId: item.id })}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.stationImage}
      />
      <View style={styles.stationInfo}>
        <Text style={styles.stationName}>{item.name}</Text>
        <Text style={styles.stationDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.stationMeta}>
          <Text style={styles.stationCount}>
            {item.dreamCount} dreams
          </Text>
          <View style={styles.tagContainer}>
            {item.tags.slice(0, 2).map((tag, index) => (
              <Text key={index} style={styles.tagText}>#{tag}</Text>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFeaturedDream = ({ item }) => (
    <TouchableOpacity
      style={styles.featuredDreamItem}
      onPress={() => navigation.navigate('DreamDetail', { dreamId: item.id })}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.featuredDreamImage}
      />
      <View style={styles.featuredDreamInfo}>
        <Text style={styles.featuredDreamTitle}>{item.title}</Text>
        <Text style={styles.featuredDreamUser}>by {item.userName}</Text>
        <View style={styles.featuredDreamMeta}>
          <Text style={styles.featuredDreamDuration}>
            {formatDuration(item.duration)}
          </Text>
          <View style={styles.featuredDreamLikes}>
            <Ionicons name="heart" size={14} color="#e91e63" />
            <Text style={styles.likesCount}>{item.likes}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.playButton,
          currentlyPlaying?.id === item.id && styles.stopButton
        ]}
        onPress={() => {
          if (currentlyPlaying?.id === item.id) {
            stopAudio();
          } else {
            playAudio(item);
          }
        }}
      >
        <Ionicons
          name={currentlyPlaying?.id === item.id ? "stop" : "play"}
          size={18}
          color="#fff"
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderPopularStation = ({ item }) => (
    <TouchableOpacity
      style={styles.popularStationItem}
      onPress={() => navigation.navigate('StationDetail', { stationId: item.id })}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.popularStationImage}
      />
      <View style={styles.popularStationOverlay}>
        <Text style={styles.popularStationName}>{item.name}</Text>
        <View style={styles.listenersContainer}>
          <Ionicons name="headset" size={14} color="#fff" />
          <Text style={styles.listenersCount}>{item.listeners}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dream Stations</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateStation')}
        >
          <Ionicons name="add" size={20} color="#6200ee" />
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      ) : (
        <FlatList
          data={stations}
          renderItem={renderStationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Featured Dreams</Text>
                <FlatList
                  horizontal
                  data={featuredDreams}
                  renderItem={renderFeaturedDream}
                  keyExtractor={item => item.id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.featuredDreamsList}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Popular Stations</Text>
                <View style={styles.popularStationsGrid}>
                  {popularStations.map(station => (
                    <View key={station.id} style={styles.popularStationWrapper}>
                      {renderPopularStation({item: station})}
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>All Stations</Text>
            </>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#6200ee']}
            />
          }
        />
      )}

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
            <Text style={styles.playingUser} numberOfLines={1}>
              by {currentlyPlaying.userName}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.stopPlayingButton}
            onPress={stopAudio}
          >
            <Ionicons name="stop" size={24} color="#6200ee" />
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f9f5ff',
    borderRadius: 16,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6200ee',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
  section: {
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  featuredDreamsList: {
    paddingLeft: 16,
  },
  featuredDreamItem: {
    width: 240,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  featuredDreamImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#f0f0f0',
  },
  featuredDreamInfo: {
    padding: 12,
  },
  featuredDreamTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featuredDreamUser: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  featuredDreamMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredDreamDuration: {
    fontSize: 12,
    color: '#666',
  },
  featuredDreamLikes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  playButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(98, 0, 238, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: 'rgba(233, 30, 99, 0.8)',
  },
  popularStationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 12,
  },
  popularStationWrapper: {
    width: '33.33%',
    padding: 4,
  },
  popularStationItem: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  popularStationImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  popularStationOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 8,
  },
  popularStationName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  listenersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listenersCount: {
    fontSize: 10,
    color: '#fff',
    marginLeft: 4,
  },
  divider: {
    height: 8,
    backgroundColor: '#f9f9f9',
    marginVertical: 8,
  },
  stationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stationImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  stationInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  stationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stationDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  stationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stationCount: {
    fontSize: 12,
    color: '#666',
  },
  tagContainer: {
    flexDirection: 'row',
  },
  tagText: {
    fontSize: 12,
    color: '#6200ee',
    marginLeft: 8,
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
    borderRadius: 20,
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
  playingUser: {
    fontSize: 12,
    color: '#666',
  },
  stopPlayingButton: {
    padding: 8,
  },
});

export default DreamStationsScreen;