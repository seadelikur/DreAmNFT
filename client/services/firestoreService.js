import firestore from '@react-native-firebase/firestore';

export const updateUserProfile = async (userId, profileData) => {
  try {
    await firestore()
      .collection('users')
      .doc(userId)
      .update({
        ...profileData,
        updatedAt: firestore.FieldValue.serverTimestamp()
      });
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    return false;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const doc = await firestore()
      .collection('users')
      .doc(userId)
      .get();
    return doc.exists ? doc.data() : null;
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
};