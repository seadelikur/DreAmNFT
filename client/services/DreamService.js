// /services/DreamService.js
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { Dream } from '../models/Dream';

class DreamService {
  constructor() {
    this.dreamsCollection = firestore().collection('dreams');
  }

  // Get dreams for home feed with pagination
  async getHomeFeed(userId, limit = 10, startAfter = null) {
    try {
      let query = this.dreamsCollection
        .where('isPublic', '==', true)
        .orderBy('createdAt', 'desc')
        .limit(limit);

      if (startAfter) {
        const startAfterDoc = await this.dreamsCollection.doc(startAfter).get();
        query = query.startAfter(startAfterDoc);
      }

      const snapshot = await query.get();

      if (snapshot.empty) {
        return { dreams: [], lastVisible: null };
      }

      const dreams = snapshot.docs.map(doc => {
        return new Dream({ id: doc.id, ...doc.data() });
      });

      const lastVisible = snapshot.docs[snapshot.docs.length - 1].id;

      return { dreams, lastVisible };
    } catch (error) {
      console.error('Error fetching home feed:', error);
      throw error;
    }
  }

  // Get dreams by specific user
  async getDreamsByUser(userId, limit = 10, startAfter = null) {
    try {
      let query = this.dreamsCollection
        .where('userId', '==', userId)
        .where('deletedAt', '==', null)
        .orderBy('createdAt', 'desc')
        .limit(limit);

      if (startAfter) {
        const startAfterDoc = await this.dreamsCollection.doc(startAfter).get();
        query = query.startAfter(startAfterDoc);
      }

      const snapshot = await query.get();

      if (snapshot.empty) {
        return { dreams: [], lastVisible: null };
      }

      const dreams = snapshot.docs.map(doc => {
        return new Dream({ id: doc.id, ...doc.data() });
      });

      const lastVisible = snapshot.docs[snapshot.docs.length - 1].id;

      return { dreams, lastVisible };
    } catch (error) {
      console.error('Error fetching user dreams:', error);
      throw error;
    }
  }

  // Get dreams that are NFTs (for marketplace or gallery)
  async getNFTDreams(limit = 10, startAfter = null) {
    try {
      let query = this.dreamsCollection
        .where('isNFT', '==', true)
        .where('isPublic', '==', true)
        .orderBy('createdAt', 'desc')
        .limit(limit);

      if (startAfter) {
        const startAfterDoc = await this.dreamsCollection.doc(startAfter).get();
        query = query.startAfter(startAfterDoc);
      }

      const snapshot = await query.get();

      if (snapshot.empty) {
        return { dreams: [], lastVisible: null };
      }

      const dreams = snapshot.docs.map(doc => {
        return new Dream({ id: doc.id, ...doc.data() });
      });

      const lastVisible = snapshot.docs[snapshot.docs.length - 1].id;

      return { dreams, lastVisible };
    } catch (error) {
      console.error('Error fetching NFT dreams:', error);
      throw error;
    }
  }

  // Get a single dream by ID
  async getDreamById(dreamId) {
    try {
      const doc = await this.dreamsCollection.doc(dreamId).get();

      if (!doc.exists) {
        throw new Error('Dream not found');
      }

      return new Dream({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('Error fetching dream:', error);
      throw error;
    }
  }

  // Create a new dream
  async createDream(dreamData, audioFile = null, imageFile = null) {
    try {
      // Create a new dream document to get an ID
      const dreamRef = this.dreamsCollection.doc();
      const dreamId = dreamRef.id;

      // Upload audio file if provided
      let audioUrl = null;
      if (audioFile) {
        const audioRef = storage().ref(`dreams/${dreamId}/audio.${audioFile.extension || 'mp3'}`);
        await audioRef.putFile(audioFile.uri);
        audioUrl = await audioRef.getDownloadURL();
      }

      // Upload image file if provided
      let imageUrl = null;
      if (imageFile) {
        const imageRef = storage().ref(`dreams/${dreamId}/image.${imageFile.extension || 'jpg'}`);
        await imageRef.putFile(imageFile.uri);
        imageUrl = await imageRef.getDownloadURL();
      }

      // Create the dream object
      const dream = new Dream({
        ...dreamData,
        id: dreamId,
        audioUrl,
        imageUrl,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp()
      });

      // Calculate rarity
      dream.calculateRarity();

      // Save to Firestore
      await dreamRef.set(dream.toFirestore());

      return dream;
    } catch (error) {
      console.error('Error creating dream:', error);
      throw error;
    }
  }

  // Update an existing dream
  async updateDream(dreamId, updateData) {
    try {
      const dreamRef = this.dreamsCollection.doc(dreamId);
      const dreamDoc = await dreamRef.get();

      if (!dreamDoc.exists) {
        throw new Error('Dream not found');
      }

      const existingDream = new Dream({ id: dreamDoc.id, ...dreamDoc.data() });

      // Merge data
      const updatedDream = new Dream({
        ...existingDream,
        ...updateData,
        updatedAt: firestore.FieldValue.serverTimestamp()
      });

      // Recalculate rarity if necessary
      if (updateData.description || updateData.aiValidationScore ||
          updateData.userTags || updateData.aiGeneratedTags) {
        updatedDream.calculateRarity();
      }

      // Update in Firestore
      await dreamRef.update(updatedDream.toFirestore());

      return updatedDream;
    } catch (error) {
      console.error('Error updating dream:', error);
      throw error;
    }
  }

  // Delete a dream (soft delete)
  async deleteDream(dreamId) {
    try {
      const dreamRef = this.dreamsCollection.doc(dreamId);
      await dreamRef.update({
        deletedAt: firestore.FieldValue.serverTimestamp(),
        isPublic: false
      });

      return true;
    } catch (error) {
      console.error('Error deleting dream:', error);
      throw error;
    }
  }

  // Toggle like on a dream
  async toggleLike(dreamId, userId) {
    try {
      // Check if user already liked this dream
      const likeRef = firestore()
        .collection('dreamLikes')
        .where('dreamId', '==', dreamId)
        .where('userId', '==', userId);

      const likeSnapshot = await likeRef.get();

      const dreamRef = this.dreamsCollection.doc(dreamId);

      if (likeSnapshot.empty) {
        // Add a like
        await firestore().collection('dreamLikes').add({
          dreamId,
          userId,
          createdAt: firestore.FieldValue.serverTimestamp()
        });

        // Increment dream likes count
        await dreamRef.update({
          likes: firestore.FieldValue.increment(1)
        });

        return { liked: true };
      } else {
        // Remove the like
        const likeDocId = likeSnapshot.docs[0].id;
        await firestore().collection('dreamLikes').doc(likeDocId).delete();

        // Decrement dream likes count
        await dreamRef.update({
          likes: firestore.FieldValue.increment(-1)
        });

        return { liked: false };
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  // Check if user has liked a dream
  async checkLikeStatus(dreamId, userId) {
    try {
      const likeRef = firestore()
        .collection('dreamLikes')
        .where('dreamId', '==', dreamId)
        .where('userId', '==', userId);

      const likeSnapshot = await likeRef.get();

      return !likeSnapshot.empty;
    } catch (error) {
      console.error('Error checking like status:', error);
      throw error;
    }
  }

  // Search dreams
  async searchDreams(query, tags = [], limit = 10) {
    try {
      // Simple search implementation - in a production app
      // you'd want to use a more sophisticated search service

      let baseQuery = this.dreamsCollection
        .where('isPublic', '==', true)
        .where('deletedAt', '==', null)
        .limit(limit);

      const snapshot = await baseQuery.get();

      if (snapshot.empty) {
        return [];
      }

      let dreams = snapshot.docs.map(doc => {
        return new Dream({ id: doc.id, ...doc.data() });
      });

      // Client-side filtering
      if (query) {
        const lowercaseQuery = query.toLowerCase();
        dreams = dreams.filter(dream => {
          return (
            dream.title.toLowerCase().includes(lowercaseQuery) ||
            dream.description.toLowerCase().includes(lowercaseQuery) ||
            dream.allTags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
          );
        });
      }

      // Filter by tags if provided
      if (tags && tags.length > 0) {
        dreams = dreams.filter(dream => {
          return tags.some(tag => dream.allTags.includes(tag));
        });
      }

      return dreams;
    } catch (error) {
      console.error('Error searching dreams:', error);
      throw error;
    }
  }
}

export default new DreamService();