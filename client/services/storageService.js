import storage from '@react-native-firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export const uploadProfileImage = async (uri, userId) => {
  try {
    // Generate unique filename
    const filename = `profile_images/${userId}_${uuidv4()}.jpg`;
    const reference = storage().ref(filename);

    // Upload the file
    await reference.putFile(uri);

    // Get download URL
    const downloadUrl = await reference.getDownloadURL();

    return downloadUrl;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

export const deleteProfileImage = async (url) => {
  try {
    if (!url) return;

    // Extract path from URL
    const path = decodeURIComponent(url.split('/o/')[1].split('?')[0]);
    await storage().ref(path).delete();
  } catch (error) {
    console.error('Error deleting profile image:', error);
    throw error;
  }
};