// screens/RecordDreamScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { auth, firestore, storage } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import TagSelector from '../components/TagSelector';
import { validateDreamRarity, validateDreamAuthenticiy } from '../utils/aiValidation';

const RecordDreamScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiValidating, setAiValidating] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [dreamValidated, setDreamValidated] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const currentUser = auth.currentUser;
  const durationInterval = useRef(null);

  useEffect(() => {
    // Request permissions
    const getPermissions = async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access microphone is required!');
      }

      if (Platform.OS !== 'web') {
        const { status: imageStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (imageStatus !== 'granted') {
          Alert.alert('Permission Denied', 'Permission to access media library is required to upload images!');
        }
      }
    };

    getPermissions();

    return () => {
      if (recording) {
        stopRecording();
      }
      if (sound) {
        sound.unloadAsync();
      }
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      if (recording) {
        console.log('Already recording...');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration counter
      durationInterval.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    console.log('Stopping recording..');
    if (!recording) return;

    setIsRecording(false);
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      console.log('Recording stopped, uri:', uri);

      // Create sound object for playback
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
      );
      setSound(newSound);

      setRecording(null);
    } catch (error) {
      console.error('stopRecording error:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const playSound = async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);

        // Listen for playback finishing
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
    } catch (error) {
      console.error('playSound error:', error);
    }
  };

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('pickImage error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const generateDreamImage = async () => {
    if (!description || description.length < 20) {
      Alert.alert('Error', 'Please provide a detailed dream description for image generation');
      return;
    }

    setGeneratingImage(true);
    setAiMessage('Generating dream visualization...');

    try {
      // Simulate AI image generation process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // In a real app, this would call an AI image generation API
      // For demo, we'll use a placeholder image
      setImage('https://picsum.photos/800/600');
      setGeneratingImage(false);
      setAiMessage('Dream image created successfully!');

      // Clear message after a delay
      setTimeout(() => {
        setAiMessage('');
      }, 3000);
    } catch (error) {
      console.error('AI image generation error:', error);
      Alert.alert('Error', 'Failed to generate dream image');
      setGeneratingImage(false);
      setAiMessage('');
    }
  };

  const validateDream = async () => {
    if (!description || description.length < 20) {
      Alert.alert('Validation Error', 'Please provide a detailed dream description for AI validation');
      return;
    }

    setAiValidating(true);
    setAiMessage('Analyzing dream content...');

    try {
      // Call AI validation service
      const validationResult = await validateDreamAuthenticiy(description);

      if (validationResult.isValid) {
        setDreamValidated(true);
        setAiMessage('Dream validated! It appears to be a genuine dream experience.');

        // Calculate rarity
        const rarityResult = await validateDreamRarity(description);
        setTags(prevTags => {
          // Add AI-suggested tags if not already present
          const newTags = [...prevTags];
          rarityResult.suggestedTags.forEach(tag => {
            if (!newTags.includes(tag)) {
              newTags.push(tag);
            }
          });
          return newTags;
        });

        // Set timeout to clear message
        setTimeout(() => {
          setAiMessage('');
        }, 3000);
      } else {
        setDreamValidated(false);
        setAiMessage('This doesn\'t seem like a genuine dream. Please provide a real dream experience.');
      }
    } catch (error) {
      console.error('AI validation error:', error);
      Alert.alert('Validation Error', 'Failed to validate dream content');
      setAiMessage('');
    } finally {
      setAiValidating(false);
    }
  };

  const uploadRecording = async () => {
    if (!sound) return null;

    try {
      const uri = recording ? recording.getURI() : sound._uri;
      const filename = `dreams/${currentUser.uid}/${Date.now()}.m4a`;
      const storageRef = ref(storage, filename);

      // Fetch the blob data
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to Firebase Storage
      await uploadBytes(storageRef, blob);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('uploadRecording error:', error);
      throw error;
    }
  };

  const uploadImage = async () => {
    if (!image) return null;

    try {
      const filename = `dreams/${currentUser.uid}/${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);

      // Fetch the blob data
      const response = await fetch(image);
      const blob = await response.blob();

      // Upload to Firebase Storage
      await uploadBytes(storageRef, blob);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('uploadImage error:', error);
      throw error;
    }
  };

  const saveDream = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a dream title');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please describe your dream');
      return;
    }

    setLoading(true);

    try {
      let audioUrl = null;
      let imageUrl = null;

      // Upload audio if available
      if (sound) {
        audioUrl = await uploadRecording();
      }

      // Upload image if available
      if (image) {
        imageUrl = await uploadImage();
      }

      // Calculate rarity based on description length, tags, and validation
      let rarity = 'common';
      if (description.length > 500 && tags.length >= 5) {
        rarity = 'epic';
      } else if (description.length > 300 && tags.length >= 3) {
        rarity = 'rare';
      } else if (description.length > 150 || tags.length >= 2) {
        rarity = 'uncommon';
      }

      // Create dream document
      const dreamData = {
        title: title.trim(),
        description: description.trim(),
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        userAvatar: currentUser.photoURL,
        audioUrl,
        imageUrl,
        tags,
        rarity,
        aiValidated: dreamValidated,
        likeCount: 0,
        likes: [],
        createdAt: serverTimestamp(),
        nftStatus: 'none'
      };

      const docRef = await addDoc(collection(firestore, 'dreams'), dreamData);
      console.log('Dream saved with ID: ', docRef.id);

      Alert.alert(
        'Success',
        'Your dream has been recorded!',
        [
          {
            text: 'View Dream',
            onPress: () => navigation.replace('DreamDetail', { dreamId: docRef.id })
          },
          {
            text: 'Record Another',
            onPress: () => {
              setTitle('');
              setDescription('');
              setTags([]);
              setRecording(null);
              setSound(null);
              setImage(null);
              setIsRecording(false);
              setIsPlaying(false);
              setRecordingDuration(0);
              setDreamValidated(false);
              setAiMessage('');
            }
          }
        ]
      );
    } catch (error) {
      console.error('saveDream error:', error);
      Alert.alert('Error', 'Failed to save dream');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Dream Title</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Give your dream a title..."
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Dream Description</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Describe your dream in detail..."
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.recordingSection}>
          <Text style={styles.label}>Voice Recording</Text>
          <Text style={styles.subLabel}>Record your dream while it's still fresh in your mind</Text>

          <View style={styles.recordingControls}>
            {!recording && !sound ? (
              <TouchableOpacity
                style={styles.recordButton}
                onPress={startRecording}
              >
                <Ionicons name="mic" size={24} color="#fff" />
                <Text style={styles.buttonText}>Start Recording</Text>
              </TouchableOpacity>
            ) : isRecording ? (
              <TouchableOpacity
                style={[styles.recordButton, styles.stopButton]}
                onPress={stopRecording}
              >
                <Ionicons name="stop" size={24} color="#fff" />
                <Text style={styles.buttonText}>Stop Recording</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.recordButton, isPlaying ? styles.pauseButton : styles.playButton]}
                onPress={playSound}
              >
                <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#fff" />
                <Text style={styles.buttonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
              </TouchableOpacity>
            )}

            {(isRecording || sound) && (
              <Text style={styles.durationText}>
                {formatDuration(recordingDuration)}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.imageSection}>
          <Text style={styles.label}>Dream Image</Text>
          <Text style={styles.subLabel}>Add an image that represents your dream</Text>

          {image ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={pickImage}
              >
                <Text style={styles.buttonTextSmall}>Change Image</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imageButtonsContainer}>
              <TouchableOpacity
                style={[styles.imageButton, styles.uploadButton]}
                onPress={pickImage}
              >
                <Ionicons name="image-outline" size={20} color="#6200ee" />
                <Text style={styles.imageButtonText}>Upload Image</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.imageButton, styles.generateButton, generatingImage && styles.disabledButton]}
                onPress={generateDreamImage}
                disabled={generatingImage}
              >
                <MaterialCommunityIcons name="brain" size={20} color="#fff" />
                <Text style={styles.generateButtonText}>Generate with AI</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.tagsSection}>
          <Text style={styles.label}>Dream Tags</Text>
          <Text style={styles.subLabel}>Add tags to categorize your dream</Text>

          <TagSelector
            selectedTags={tags}
            onTagsChange={setTags}
            maxTags={10}
          />
        </View>

        <View style={styles.aiSection}>
          <TouchableOpacity
            style={[styles.validateButton, aiValidating && styles.disabledButton]}
            onPress={validateDream}
            disabled={aiValidating}
          >
            {aiValidating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="shield-check" size={20} color="#fff" />
                <Text style={styles.validateButtonText}>Validate Dream with AI</Text>
              </>
            )}
          </TouchableOpacity>

          {aiMessage ? (
            <View style={styles.aiMessageContainer}>
              <Text style={styles.aiMessage}>{aiMessage}</Text>
            </View>
          ) : null}

          {dreamValidated && (
            <View style={styles.validatedBadge}>
              <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.validatedText}>AI Validated</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={saveDream}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save Dream</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  titleInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  descriptionInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 150,
  },
  recordingSection: {
    marginBottom: 20,
  },
  recordingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  stopButton: {
    backgroundColor: '#e91e63',
  },
  playButton: {
    backgroundColor: '#4CAF50',
  },
  pauseButton: {
    backgroundColor: '#FFA000',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  durationText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  imageSection: {
    marginBottom: 20,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    justifyContent: 'center',
  },
  uploadButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  generateButton: {
    backgroundColor: '#6200ee',
    marginLeft: 8,
  },
  imageButtonText: {
    color: '#6200ee',
    fontWeight: '600',
    marginLeft: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  changeImageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
  },
  buttonTextSmall: {
    color: '#6200ee',
    fontWeight: '600',
    fontSize: 14,
  },
  tagsSection: {
    marginBottom: 20,
  },
  aiSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  validateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  validateButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  aiMessageContainer: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    width: '100%',
  },
  aiMessage: {
    color: '#6200ee',
    textAlign: 'center',
  },
  validatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 12,
  },
  validatedText: {
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default RecordDreamScreen;