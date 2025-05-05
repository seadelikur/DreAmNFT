// src/utils/storageUtils.js
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { v4 as uuidv4 } from 'uuid';

// Upload an image to Firebase Storage
export const uploadImage = async (uri, path = 'images', filename = null) => {
  try {
    // Generate a unique filename if not provided
    const imageName = filename || `${uuidv4()}.jpg`;
    const storagePath = `${path}/${imageName}`;

    // Resize and compress the image for optimal storage
    const resizedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1200 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Convert image to blob
    const response = await fetch(resizedImage.uri);
    const blob = await response.blob();

    // Upload to Firebase Storage
    const storage = getStorage();
    const imageRef = ref(storage, storagePath);
    await uploadBytes(imageRef, blob);

    // Get download URL
    const downloadUrl = await getDownloadURL(imageRef);

    return {
      success: true,
      url: downloadUrl,
      path: storagePath
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Upload an audio file to Firebase Storage
export const uploadAudio = async (uri, path = 'audio') => {
  try {
    // Generate a unique filename
    const audioName = `${uuidv4()}.m4a`;
    const storagePath = `${path}/${audioName}`;

    // Read audio file
    const response = await fetch(uri);
    const blob = await response.blob();

    // Upload to Firebase Storage
    const storage = getStorage();
    const audioRef = ref(storage, storagePath);
    await uploadBytes(audioRef, blob);

    // Get download URL
    const downloadUrl = await getDownloadURL(audioRef);

    return {
      success: true,
      url: downloadUrl,
      path: storagePath
    };
  } catch (error) {
    console.error('Error uploading audio:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete a file from Firebase Storage
export const deleteFile = async (storagePath) => {
  try {
    const storage = getStorage();
    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef);

    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting file:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Download a file to local device storage
export const downloadFile = async (url, filename) => {
  try {
    const downloadPath = `${FileSystem.documentDirectory}${filename}`;
    const { uri } = await FileSystem.downloadAsync(url, downloadPath);

    return {
      success: true,
      uri
    };
  } catch (error) {
    console.error('Error downloading file:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get file size in readable format
export const getFileSize = async (uri) => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);

    if (fileInfo.exists) {
      const fileSizeInBytes = fileInfo.size;

      if (fileSizeInBytes < 1024) {
        return `${fileSizeInBytes} B`;
      } else if (fileSizeInBytes < 1024 * 1024) {
        return `${(fileSizeInBytes / 1024).toFixed(2)} KB`;
      } else {
        return `${(fileSizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
      }
    }

    return '0 B';
  } catch (error) {
    console.error('Error getting file size:', error);
    return 'Unknown size';
  }
};