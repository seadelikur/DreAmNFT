// screens/DreamSoundArtScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import { firestore, auth, storage } from '../firebase/config';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

const DreamSoundArtScreen = ({ route, navigation }) => {
  const { dreamId } = route.params;
  const [dream, setDream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [visualizationData, setVisualizationData] = useState([]);
  const [selectedEffect, setSelectedEffect] = useState('echo');
  const [processingEffect, setProcessingEffect] = useState(false);
  const [processedAudio, setProcessedAudio] = useState(null);
  const [savingArt, setSavingArt] = useState(false);

  const currentUser = auth.currentUser;

  const effects = [
    { id: 'echo', name: 'Echo', icon: 'repeat' },
    { id: 'reverb', name: 'Reverb', icon: 'water' },
    { id: 'distortion', name: 'Distortion', icon: 'flash' },
    { id: 'slowdown', name: 'Slow Down', icon: 'hourglass' },
    { id: 'speedup', name: 'Speed Up', icon: 'speedometer' },
    { id: 'reverse', name: 'Reverse', icon: 'refresh' }
  ];

  useEffect(() => {
    loadDream();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [dreamId]);

  const loadDream = async () => {
    if (!dreamId) {
      navigation.goBack();
      return;
    }

    try {
      setLoading(true);

      const dreamDoc = await getDoc(doc(firestore, 'dreams', dreamId));
      if (!dreamDoc.exists()) {
        Alert.alert('Error', 'Dream not found');
        navigation.goBack();
        return;
      }

      const dreamData = {
        id: dreamDoc.id,
        ...dreamDoc.data(),
        createdAt: dreamDoc.data().createdAt?.toDate()
      };

      setDream(dreamData);

      // Generate visualization data
      generateVisualizationData();

    } catch (error) {
      console.error('Error loading dream:', error);
      Alert.alert('Error', 'Failed to load dream data');
    } finally {
      setLoading(false);
    }
  };

  const loadSound = async (audioUrl) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      return newSound;
    } catch (error) {
      console.error('Error loading sound:', error);
      Alert.alert('Error', 'Failed to load audio');
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (!status.isLoaded) return;

    setDuration(status.durationMillis || 0);
    setPosition(status.positionMillis || 0);
    setIsPlaying(status.isPlaying);

    if (status.didJustFinish) {
      setIsPlaying(false);
      setPosition(0);
    }
  };

  const handlePlayPause = async () => {
    if (!dream?.audioUrl) return;

    try {
      if (!sound) {
        const newSound = await loadSound(processedAudio || dream.audioUrl);
        await newSound.playAsync();
      } else if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleSliderChange = async (value) => {
    if (!sound) return;

    try {
      await sound.setPositionAsync(value);
      setPosition(value);
    } catch (error) {
      console.error('Error seeking audio:', error);
    }
  };

  const generateVisualizationData = () => {
    // In a real app, this would analyze the audio file
    // For demo purposes, we'll generate random data
    const dataPoints = 50;
    const data = [];

    for (let i = 0; i < dataPoints; i++) {
      data.push(Math.random() * 0.8 + 0.2); // Values between 0.2 and 1.0
    }

    setVisualizationData(data);
  };

  const applyEffect = async () => {
    if (!dream?.audioUrl) return;

    try {
      setProcessingEffect(true);

      // In a real app, this would send the audio to a server for processing
      // or use a local audio processing library
      // For demo purposes, we'll simulate processing

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate a processed audio URL (in reality, this would be a new file)
      setProcessedAudio(dream.audioUrl);

      // Reload sound with processed audio
      await loadSound(dream.audioUrl);

      // Generate new visualization
      generateVisualizationData();

      Alert.alert('Success', `Applied ${selectedEffect} effect to your dream audio`);
    } catch (error) {
      console.error('Error applying effect:', error);
      Alert.alert('Error', 'Failed to apply audio effect');
    } finally {
      setProcessingEffect(false);
    }
  };

  const saveSoundArt = async () => {
    if (!processedAudio || !currentUser) return;

    try {
      setSavingArt(true);

      // In a real app, this would save the processed audio file
      // For demo purposes, we'll just create a record in Firestore

      await addDoc(collection(firestore, 'soundArt'), {
        dreamId: dreamId,
        userId: currentUser.uid,
        originalAudioUrl: dream.audioUrl,
        processedAudioUrl: processedAudio,
        effect: selectedEffect,
        title: `${dream.title || 'Dream'} - ${selectedEffect} Art`,
        createdAt: serverTimestamp()
      });

      // Update the dream to indicate it has sound art
      await updateDoc(doc(firestore, 'dreams', dreamId), {
        hasSoundArt: true,
        updatedAt: serverTimestamp()
      });

      Alert.alert(
        'Success',
        'Your dream sound art has been saved',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving sound art:', error);
      Alert.alert('Error', 'Failed to save your sound art');
    } finally {
      setSavingArt(false);
    }
  };

  const shareAudio = async () => {
    if (!processedAudio) return;

    try {
      // In a real app, this would download the processed audio
      // For demo purposes, we'll use the original audio

      const fileUri = FileSystem.documentDirectory + 'dream_sound_art.mp3';
      const { uri } = await FileSystem.downloadAsync(dream.audioUrl, fileUri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error sharing audio:', error);
      Alert.alert('Error', 'Failed to share audio');
    }
  };

  const formatTime = (milliseconds) => {
    if (!milliseconds) return '0:00';

    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (!dream || !dream.audioUrl) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="music-off" size={60} color="#ccc" />
        <Text style={styles.errorText}>No audio available for this dream</Text>
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{dream.title || 'Untitled Dream'}</Text>
        <Text style={styles.subtitle}>Sound Art Studio</Text>
      </View>

      <View style={styles.visualizationContainer}>
        <View style={styles.visualization}>
          {visualizationData.map((value, index) => (
            <View
              key={index}
              style={[
                styles.visualizationBar,
                {
                  height: value * 100,
                  backgroundColor: processedAudio ? '#6200ee' : '#4caf50'
                }
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.playerContainer}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={handlePlayPause}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={30}
            color="#fff"
          />
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            onValueChange={handleSliderChange}
            minimumTrackTintColor="#6200ee"
            maximumTrackTintColor="#ddd"
            thumbTintColor="#6200ee"
          />

          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.effectsContainer}>
        <Text style={styles.sectionTitle}>Audio Effects</Text>
        <Text style={styles.effectsDescription}>
          Transform your dream audio with these effects
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.effectsList}
        >
          {effects.map((effect) => (
            <TouchableOpacity
              key={effect.id}
              style={[
                styles.effectButton,
                selectedEffect === effect.id && styles.selectedEffectButton
              ]}
              onPress={() => setSelectedEffect(effect.id)}
            >
              <MaterialCommunityIcons
                name={effect.icon}
                size={24}
                color={selectedEffect === effect.id ? '#fff' : '#6200ee'}
              />
              <Text
                style={[
                  styles.effectName,
                  selectedEffect === effect.id && styles.selectedEffectName
                ]}
              >
                {effect.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.applyButton, processingEffect && styles.disabledButton]}
          onPress={applyEffect}
          disabled={processingEffect}
        >
          {processingEffect ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="waveform" size={20} color="#fff" />
              <Text style={styles.applyButtonText}>Apply Effect</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {processedAudio && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.saveButton, savingArt && styles.disabledButton]}
            onPress={saveSoundArt}
            disabled={savingArt}
          >
            {savingArt ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Save Sound Art</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={shareAudio}
          >
            <Ionicons name="share-outline" size={20} color="#6200ee" />
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6200ee',
    fontWeight: '600',
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  visualizationContainer: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    margin: 16,
  },
  visualization: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  visualizationBar: {
    width: 4,
    backgroundColor: '#4caf50',
    borderRadius: 2,
    marginHorizontal: 1,
  },
  playerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  progressContainer: {
    flex: 1,
  },
  slider: {
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  effectsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  effectsDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  effectsList: {
    paddingBottom: 8,
  },
  effectButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 100,
  },
  selectedEffectButton: {
    backgroundColor: '#6200ee',
  },
  effectName: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
  },
  selectedEffectName: {
    color: '#fff',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6200ee',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 16,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  actionsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4caf50',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 14,
    borderRadius: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6200ee',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default DreamSoundArtScreen;