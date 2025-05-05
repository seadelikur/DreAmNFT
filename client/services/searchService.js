import firestore from '@react-native-firebase/firestore';

export const searchDreams = async (query, userId = null) => {
  try {
    let queryRef = firestore()
      .collection('dreams')
      .orderBy('createdAt', 'desc')
      .limit(20);

    // If search query provided
    if (query && query.length > 0) {
      queryRef = queryRef
        .where('keywords', 'array-contains', query.toLowerCase())
        .limit(10);
    }

    // If user filter provided
    if (userId) {
      queryRef = queryRef.where('userId', '==', userId);
    }

    const snapshot = await queryRef.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

export const getSearchSuggestions = async (query) => {
  try {
    const snapshot = await firestore()
      .collection('searchSuggestions')
      .where('keyword', '>=', query.toLowerCase())
      .where('keyword', '<=', query.toLowerCase() + '\uf8ff')
      .limit(5)
      .get();

    return snapshot.docs.map(doc => doc.data().keyword);
  } catch (error) {
    console.error('Suggestion error:', error);
    return [];
  }
};