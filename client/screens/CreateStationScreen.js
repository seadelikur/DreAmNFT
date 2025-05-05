// screens/CreateStationScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firestore, storage, auth } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import TagSelector from '../components/TagSelector';

const CreateStationScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);

  const currentUser = auth.currentUser;

  useEffect(() => {
    // Load popular tags
    const loadTags = async () => {
      try {
        // In a real app, fetch from Firestore
        // For demo, using hardcoded tags
        setTags([
          { id: '1', name: 'flying' },
          { id: '2', name: 'water' },
          { id: '3', name: 'nature' },
          { id: '4', name: 'space' },
          { id: '5', name: 'falling' },
          { id: '6', name: 'lucid' },
          { id: '7', name: 'childhood' },
          { id: '8', name: 'nightmare' },
          { id: '9', name: 'adventure' },
          { id: '10', name: 'fantasy' },
          { id: '11', name: 'memories' },
          { id: '12', name: 'future' },
        ]);
      } catch (error) {
        console.error('Error loading tags:', error);
      }
    };

    loadTags();

    // Request camera roll permissions
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to make this work!'
        );
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.cancelled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setError('Failed to select image. Please try again.');
    }
  };

  const uploadImage = async () => {
    if (!image) return null;

    try {
      setUploading(true);

      // Convert image to blob
      const response = await fetch(image);
      const blob = await response.blob();

      // Generate a unique filename
      const filename = `station_images/${currentUser.uid}_${Date.now()}`;
      const storageRef = ref(storage, filename);

      // Upload to Firebase Storage
      await uploadBytes(storageRef, blob);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      setUploading(false);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploading(false);
      setError('Failed to upload image. Please try again.');
      return null;
    }
  };

  const handleCreateStation = async () => {
    if (!name.trim()) {
      setError('Please enter a station name');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a station description');
      return;
    }

    if (!image) {
      setError('Please select a cover image');
      return;
    }

    if (selectedTags.length === 0) {
      setError('Please select at least one tag');
      return;
    }

    try {
      setCreating(true);
      setError(null);

      // Upload image and get URL
      const imageUrl = await uploadImage();

      if (!imageUrl) {
        setCreating(false);
        setError('Failed to upload image. Please try again.');
        return;
      }

      // In a real app, save to Firestore
      // For demo, we'll simulate success
      setTimeout(() => {
        setCreating(false);
        Alert.alert(
          'Success!',
          'Your dream station has been created successfully.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('DreamStations')
            }
          ]
        );
      }, 1500);

    } catch (error) {
      console.error('Error creating station:', error);
      setCreating(false);
      setError('Failed to create station. Please try again.');
    }
  };

  const handleTagSelection = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      if (selectedTags.length < 5) {
        setSelectedTags([...selectedTags, tag]);
      } else {
        Alert.alert('Limit Reached', 'You can select up to 5 tags');
      }
    }
  };

  const addCustomTag = (customTag) => {
    if (!customTag.trim()) return;

    if (selectedTags.includes(customTag.toLowerCase())) {
      return;
    }

    if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, customTag.toLowerCase()]);
    } else {
      Alert.alert('Limit Reached', 'You can select up to 5 tags');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Create Dream Station</Text>
          <TouchableOpacity
            style={[
              styles.createButton,
              (!name || !description || !image || selectedTags.length === 0 || creating) && styles.disabledButton
            ]}
            onPress={handleCreateStation}
            disabled={!name || !description || !image || selectedTags.length === 0 || creating}
          >
            {creating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Create</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formScroll}>
          <View style={styles.form}>
            <View style={styles.formField}>
              <Text style={styles.label}>Station Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter a name for your station"
                value={name}
                onChangeText={setName}
                maxLength={30}
              />
              <Text style={styles.charCount}>{name.length}/30</Text>
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Describe what kind of dreams will be featured in this station"
                value={description}
                onChangeText={setDescription}
                multiline
                maxLength={200}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{description.length}/200</Text>
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Cover Image</Text>
              <TouchableOpacity
                style={styles.imageSelector}
                onPress={pickImage}
                disabled={uploading}
              >
                {image ? (
                  <Image source={{ uri: image }} style={styles.previewImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={40} color="#ccc" />
                    <Text style={styles.placeholderText}>
                      Tap to select an image
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              {uploading && (
                <View style={styles.uploadingIndicator}>
                  <ActivityIndicator size="small" color="#6200ee" />
                  <Text style={styles.uploadingText}>Uploading...</Text>
                </View>
              )}
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Tags</Text>
              <Text style={styles.tagHelper}>
                Select up to 5 tags that describe the theme of your station
              </Text>

              <View style={styles.selectedTagsContainer}>
                {selectedTags.map((tag, index) => (
                  <View key={index} style={styles.selectedTag}>
                    <Text style={styles.selectedTagText}>#{tag}</Text>
                    <TouchableOpacity
                      onPress={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                    >
                      <Ionicons name="close-circle" size={16} color="#6200ee" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <TagSelector
                tags={tags.map(tag => tag.name)}
                selectedTags={selectedTags}
                onSelectTag={handleTagSelection}
                onAddCustomTag={addCustomTag}
                maxSelected={5}
              />
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={20} color="#d32f2f" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.infoContainer}>
              <Ionicons name="information-circle-outline" size={20} color="#666" />
              <Text style={styles.infoText}>
                After creation, you can add dreams to your station and invite others to contribute.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
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
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#6200ee',
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  formScroll: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  formField: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    color: '#666',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  imageSelector: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    height: 180,
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  uploadingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  tagHelper: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0ff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTagText: {
    fontSize: 14,
    color: '#6200ee',
    marginRight: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    marginLeft: 8,
    flex: 1,
  },
  infoContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});

export default CreateStationScreen;