// screens/RecordScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, Title, ProgressBar, TextInput } from 'react-native-paper';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, storage, db } from '../services/firebase';
import { validateDream } from '../utils/dreamValidator';
import { generateImage } from '../utils/imageGenerator';

export default function RecordScreen({ navigation }) {
  const [recording, setRecording] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState('idle');
  const [audioUri, setAudioUri] = useState(null);
  const [duration, setDuration] = useState(0);
  const [dreamText, setDreamText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    return () => {
      if (recording) {
        stopRecording();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow microphone access to record dreams.');
        return;
      }

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );

      setRecording(recording);
      setRecordingStatus('recording');

      // Start duration timer
      setDuration(0);
      const interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      recording.setOnRecordingStatusUpdate(status => {
        if (status.isDoneRecording) {
          clearInterval(interval);
        }
      });

    } catch (error) {
      console.error('Failed to start recording', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setRecordingStatus('stopping');
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri);
      setRecordingStatus('stopped');
      setRecording(null);
    } catch (error) {
      console.error('Failed to stop recording', error);
      Alert.alert('Error', 'Failed to stop recording');
      setRecordingStatus('idle');
      setRecording(null);
    }
  };

  const playRecording = async () => {
    if (!audioUri) return;

    try {
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play recording', error);
      Alert.alert('Error', 'Failed to play recording');
    }
  };

  const saveDream = async () => {
    if (!audioUri || !dreamText) {
      Alert.alert('Missing Information', 'Please record your dream and provide a description.');
      return;
    }

    try {
      setProcessing(true);
      setProgress(0.1);

      // Convert audio to base64 for validation
      const audioBase64 = await FileSystem.readAsStringAsync(audioUri, { encoding: FileSystem.EncodingType.Base64 });
      setProgress(0.2);

      // Validate dream using AI
      const isValid = await validateDream(audioBase64);
      if (!isValid) {
        Alert.alert('Invalid Dream', 'Our AI detected that this might not be a real dream. Please try again with a genuine dream recording.');
        setProcessing(false);
        return;
      }
      setProgress(0.4);

      // Generate image from dream text
      const imageUrl = await generateImage(dreamText);
      setProgress(0.6);

      // Upload audio to Firebase Storage
      const audioBlob = await fetch(audioUri).then(r => r.blob());
      const audioFileName = `dreams/${auth.currentUser.uid}/${Date.now()}.m4a`;
      const audioRef = ref(storage, audioFileName);
      await uploadBytes(audioRef, audioBlob);
      const audioDownloadUrl = await getDownloadURL(audioRef);
      setProgress(0.8);

      // Save dream to Firestore
      const dreamData = {
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName,
        text: dreamText,
        audioUrl: audioDownloadUrl,
        imageUrl: imageUrl,
        duration: duration,
        createdAt: serverTimestamp(),
        likes: 0,
        comments: 0,
        isNFT: false
      };

      const docRef = await addDoc(collection(db, 'dreams'), dreamData);
      setProgress(1);

      Alert.alert(
        'Dream Saved',
        'Your dream has been saved successfully. Would you like to mint it as an NFT?',
        [
          {
            text: 'Not Now',
            style: 'cancel',
            onPress: () => {
              setProcessing(false);
              setAudioUri(null);
              setDreamText('');
              setRecordingStatus('idle');
            }
          },
          {
            text: 'Mint NFT',
            onPress: () => {
              setProcessing(false);
              navigation.navigate('CreateNFT', { dreamId: docRef.id });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Failed to save dream', error);
      Alert.alert('Error', 'Failed to save your dream. Please try again.');
      setProcessing(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Record Your Dream</Title>

      <View style={styles.recordingContainer}>
        <Text style={styles.instructions}>
          {recordingStatus === 'idle'
            ? 'Press the button below to start recording your dream.'
            : recordingStatus === 'recording'
              ? `Recording... ${formatDuration(duration)}`
              : 'Recording complete. You can play it back or save it.'}
        </Text>

        {recordingStatus === 'idle' ? (
          <Button
            mode="contained"
            icon="microphone"
            onPress={startRecording}
            style={styles.button}
          >
            Start Recording
          </Button>
        ) : recordingStatus === 'recording' ? (
          <Button
            mode="contained"
            icon="stop"
            onPress={stopRecording}
            style={[styles.button, styles.stopButton]}
          >
            Stop Recording
          </Button>
        ) : (
          <View style={styles.playbackControls}>
            <Button
              mode="outlined"
              icon="play"
              onPress={playRecording}
              style={styles.playButton}
            >
              Play
            </Button>
            <Button
              mode="outlined"
              icon="refresh"
              onPress={() => {
                setAudioUri(null);
                setRecordingStatus('idle');
              }}
              style={styles.retryButton}
            >
              Record Again
            </Button>
          </View>
        )}
      </View>

      {recordingStatus === 'stopped' && (
        <View style={styles.dreamTextContainer}>
          <TextInput
            label="Describe your dream"
            value={dreamText}
            onChangeText={setDreamText}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.dreamTextInput}
          />

          <Button
            mode="contained"
            icon="content-save"
            onPress={saveDream}
            style={styles.saveButton}
            disabled={processing || !dreamText}
            loading={processing}
          >
            Save Dream
          </Button>
        </View>
      )}

      {processing && (
        <View style={styles.processingContainer}>
          <Text>Processing your dream...</Text>
          <ProgressBar progress={progress} style={styles.progressBar} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  recordingContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  instructions: {
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    width: 200,
  },
  stopButton: {
    backgroundColor: 'red',
  },
  playbackControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  playButton: {
    marginRight: 10,
  },
  retryButton: {
    marginLeft: 10,
  },
  dreamTextContainer: {
    marginTop: 20,
  },
  dreamTextInput: {
    marginBottom: 20,
  },
  saveButton: {
    marginTop: 10,
  },
  processingContainer: {
    marginTop: 20,
  },
  progressBar: {
    marginTop: 10,
    height: 10,
  },
});