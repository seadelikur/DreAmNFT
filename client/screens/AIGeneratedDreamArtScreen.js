// src/screens/AIGeneratedDreamArtScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, fonts } from '../styles/theme';
import { useApp } from '../context/AppContext';
import { generateDreamImage } from '../utils/aiUtils';
import { uploadImageToFirebase } from '../services/storageService';
import { updateDreamInFirestore } from '../services/firestoreService';

const STYLE_OPTIONS = [
  { id: 'surreal', name: 'Surrealist', icon: 'color-palette-outline' },
  { id: 'realistic', name: 'Realistic', icon: 'image-outline' },
  { id: 'abstract', name: 'Abstract', icon: 'layers-outline' },
  { id: 'anime', name: 'Anime', icon: 'sparkles-outline' }
];

const AIGeneratedDreamArtScreen = ({ route, navigation }) => {
  const { dream } = route.params || {};
  const { userProfile, showToast } = useApp();

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [dreamPrompt, setDreamPrompt] = useState(dream?.description || '');
  const [selectedStyle, setSelectedStyle] = useState('surreal');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (dream && dream.description) {
      setDreamPrompt(dream.description);
    }

    if (dream && dream.aiGeneratedImage) {
      setGeneratedImage(dream.aiGeneratedImage);
    }
  }, [dream]);

  const handleGenerateImage = async () => {
    try {
      if (!dreamPrompt.trim()) {
        Alert.alert('Error', 'Please enter a dream description');
        return;
      }

      setGenerating(true);
      setError(null);

      const result = await generateDreamImage(dreamPrompt, selectedStyle);

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate image');
      }

      setGeneratedImage(result.imageUrl);

      // If this is for a specific dream, update it in Firestore
      if (dream && dream.id) {
        await updateDreamInFirestore(dream.id, {
          aiGeneratedImage: result.imageUrl,
          aiGeneratedImagePath: result.storagePath,
          updatedAt: new Date().toISOString()
        });

        showToast({
          type: 'success',
          title: 'Dream Art Created',
          message: 'Your AI-generated dream art has been saved'
        });
      }
    } catch (error) {
      console.error('Error generating image:', error);
      setError(error.message);
      Alert.alert('Error', 'Failed to generate dream image. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleUploadImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant permission to access your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        setLoading(true);

        // Upload the image to Firebase
        const { success, url, path } = await uploadImageToFirebase(
          selectedImage.uri,
          `dream-images/${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        );

        if (!success) {
          throw new Error('Failed to upload image');
        }

        setGeneratedImage(url);

        // If this is for a specific dream, update it in Firestore
        if (dream && dream.id) {
          await updateDreamInFirestore(dream.id, {
            aiGeneratedImage: url,
            aiGeneratedImagePath: path,
            updatedAt: new Date().toISOString()
          });

          showToast({
            type: 'success',
            title: 'Image Uploaded',
            message: 'Your dream image has been saved'
          });
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (dream && dream.id) {
      navigation.goBack();
    } else {
      // If not attached to a dream, can save it to user's gallery
      Alert.alert(
        'Save Image',
        'Would you like to save this image to your Dream Art Gallery?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save',
            onPress: async () => {
              try {
                setLoading(true);

                // Create a new entry in the user's dream art gallery
                // This would typically be a separate collection in Firestore
                // Implementation depends on your data model

                showToast({
                  type: 'success',
                  title: 'Saved to Gallery',
                  message: 'Your dream art has been saved to your gallery'
                });

                navigation.navigate('DreamArtGallery');
              } catch (error) {
                console.error('Error saving to gallery:', error);
                Alert.alert('Error', 'Failed to save to gallery. Please try again.');
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.title}>Dream Art Generator</Text>
        <Text style={styles.subtitle}>
          Create a visual representation of your dream using AI
        </Text>

        {/* Dream Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dream Description</Text>
          <TextInput
            style={styles.dreamInput}
            multiline
            value={dreamPrompt}
            onChangeText={setDreamPrompt}
            placeholder="Describe your dream in detail..."
            placeholderTextColor={colors.textTertiary}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{dreamPrompt.length}/500</Text>
        </View>

        {/* Style Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Art Style</Text>
          <View style={styles.styleOptions}>
            {STYLE_OPTIONS.map((style) => (
              <TouchableOpacity
                key={style.id}
                style={[
                  styles.styleOption,
                  selectedStyle === style.id && styles.selectedStyle
                ]}
                onPress={() => setSelectedStyle(style.id)}
              >
                <Ionicons
                  name={style.icon}
                  size={24}
                  color={selectedStyle === style.id ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.styleText,
                    selectedStyle === style.id && styles.selectedStyleText
                  ]}
                >
                  {style.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.generateButton, generating && styles.disabledButton]}
          onPress={handleGenerateImage}
          disabled={generating || !dreamPrompt.trim()}
        >
          {generating ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="sparkles-outline" size={20} color="white" />
              <Text style={styles.generateButtonText}>Generate Dream Art</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleUploadImage}
          disabled={generating}
        >
          <Ionicons name="cloud-upload-outline" size={20} color={colors.text} />
          <Text style={styles.uploadButtonText}>Upload Your Own</Text>
        </TouchableOpacity>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={20} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Preview Section */}
        {generatedImage && (
          <View style={styles.previewSection}>
            <Text style={styles.sectionTitle}>Dream Art Preview</Text>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: generatedImage }}
                style={styles.generatedImage}
                resizeMode="cover"
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="white" />
                  <Text style={styles.saveButtonText}>
                    {dream && dream.id ? 'Done' : 'Save to Gallery'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 12,
  },
  dreamInput: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 12,
    minHeight: 120,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.text,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textTertiary,
    textAlign: 'right',
  },
  styleOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  styleOption: {
    width: '48%',
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 12,
    margin: '1%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  selectedStyle: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  styleText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  selectedStyleText: {
    color: colors.primary,
  },
  generateButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  generateButtonText: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: 'white',
    marginLeft: 8,
  },
  uploadButton: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  uploadButtonText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.text,
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: colors.primaryLight,
  },
  errorContainer: {
    backgroundColor: colors.errorLight,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.error,
    marginLeft: 8,
  },
  previewSection: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  generatedImage: {
    width: '100%',
    height: 360,
    borderRadius: 12,
  },
  saveButton: {
    backgroundColor: colors.success,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: 'white',
    marginLeft: 8,
  },
});

export default AIGeneratedDreamArtScreen;