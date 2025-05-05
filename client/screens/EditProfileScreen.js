// src/screens/EditProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, fonts } from '../styles/theme';
import { useApp } from '../context/AppContext';
import { updateUserProfile } from '../services/firestoreService';
import { uploadImageToFirebase } from '../services/storageService';

const EditProfileScreen = ({ navigation }) => {
  const { userProfile, setUserProfile, showToast } = useApp();

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    bio: '',
    profileImage: '',
    coverImage: '',
    website: '',
    twitter: '',
    instagram: ''
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        username: userProfile.username || '',
        bio: userProfile.bio || '',
        profileImage: userProfile.profileImage || '',
        coverImage: userProfile.coverImage || '',
        website: userProfile.website || '',
        twitter: userProfile.twitter || '',
        instagram: userProfile.instagram || ''
      });
    }
  }, [userProfile]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePickImage = async (type) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant permission to access your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'profile' ? [1, 1] : [3, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        setUploadingImage(true);

        // Upload the image to Firebase
        const path = `user-images/${userProfile.uid}/${type}-${Date.now()}`;
        const { success, url } = await uploadImageToFirebase(selectedImage.uri, path);

        if (success) {
          handleChange(type === 'profile' ? 'profileImage' : 'coverImage', url);
        } else {
          throw new Error('Failed to upload image');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const validateForm = () => {
    if (!formData.displayName.trim()) {
      Alert.alert('Error', 'Display name is required');
      return false;
    }

    if (!formData.username.trim()) {
      Alert.alert('Error', 'Username is required');
      return false;
    }

    // Username format validation
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
      Alert.alert(
        'Invalid Username',
        'Username must be 3-20 characters and can only contain letters, numbers, and underscores'
      );
      return false;
    }

    // Website validation if provided
    if (formData.website && !formData.website.startsWith('http')) {
      handleChange('website', `https://${formData.website}`);
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Update user profile in Firestore
      const { success } = await updateUserProfile(userProfile.uid, formData);

      if (!success) {
        throw new Error('Failed to update profile');
      }

      // Update local user profile state
      setUserProfile({
        ...userProfile,
        ...formData
      });

      showToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been successfully updated'
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Cover Image */}
          <View style={styles.coverImageContainer}>
            {formData.coverImage ? (
              <Image
                source={{ uri: formData.coverImage }}
                style={styles.coverImage}
              />
            ) : (
              <View style={[styles.coverImage, styles.placeholderCover]} />
            )}

            <TouchableOpacity
              style={styles.editCoverButton}
              onPress={() => handlePickImage('cover')}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="camera" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>

          {/* Profile Image */}
          <View style={styles.profileImageContainer}>
            {formData.profileImage ? (
              <Image
                source={{ uri: formData.profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImage, styles.placeholderProfile]}>
                <Ionicons name="person" size={40} color={colors.textTertiary} />
              </View>
            )}

            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => handlePickImage('profile')}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="camera" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Display Name</Text>
              <TextInput
                style={styles.input}
                value={formData.displayName}
                onChangeText={(text) => handleChange('displayName', text)}
                placeholder="Your display name"
                placeholderTextColor={colors.textTertiary}
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={formData.username}
                onChangeText={(text) => handleChange('username', text.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="username (letters, numbers, underscores)"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="none"
                maxLength={20}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.bio}
                onChangeText={(text) => handleChange('bio', text)}
                placeholder="Tell us about yourself and your dreams..."
                placeholderTextColor={colors.textTertiary}
                multiline
                maxLength={160}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{formData.bio.length}/160</Text>
            </View>

            <View style={styles.sectionTitle}>
              <Ionicons name="link-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.sectionTitleText}>Social Links</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Website</Text>
              <TextInput
                style={styles.input}
                value={formData.website}
                onChangeText={(text) => handleChange('website', text)}
                placeholder="https://yourwebsite.com"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Twitter</Text>
              <View style={styles.socialInputContainer}>
                <Text style={styles.socialPrefix}>@</Text>
                <TextInput
                  style={styles.socialInput}
                  value={formData.twitter}
                  onChangeText={(text) => handleChange('twitter', text.replace('@', ''))}
                  placeholder="username"
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Instagram</Text>
              <View style={styles.socialInputContainer}>
                <Text style={styles.socialPrefix}>@</Text>
                <TextInput
                  style={styles.socialInput}
                  value={formData.instagram}
                  onChangeText={(text) => handleChange('instagram', text.replace('@', ''))}
                  placeholder="username"
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 100,
  },
  coverImageContainer: {
    position: 'relative',
    height: 150,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  placeholderCover: {
    backgroundColor: colors.backgroundLight,
  },
  editCoverButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginTop: -50,
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: colors.background,
  },
  placeholderProfile: {
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editProfileButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  charCount: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textTertiary,
    textAlign: 'right',
    marginTop: 4,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitleText: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginLeft: 8,
  },
  socialInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  socialPrefix: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginRight: 4,
  },
  socialInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 16,
    flexDirection: 'row',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  saveButton: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: 'white',
  },
});

export default EditProfileScreen;