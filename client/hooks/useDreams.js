// hooks/useDreams.js
import { useState, useContext } from 'react';
import { firebase } from '../firebase';
import { AppContext } from '../AppContext';
import { DreamService } from '../services/DreamService';
import { AIService } from '../services/AIService';

export default function useDreams() {
  const { userState } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dreams, setDreams] = useState([]);

  const fetchUserDreams = async () => {
    if (!userState.isAuthenticated) return [];

    setLoading(true);
    setError(null);

    try {
      const userDreams = await DreamService.getUserDreams(userState.user.uid);
      setDreams(userDreams);
      setLoading(false);
      return userDreams;
    } catch (err) {
      setError('Failed to fetch dreams: ' + err.message);
      setLoading(false);
      throw err;
    }
  };

  const fetchDreamFeed = async () => {
    setLoading(true);
    setError(null);

    try {
      const dreamFeed = await DreamService.getDreamFeed();
      setDreams(dreamFeed);
      setLoading(false);
      return dreamFeed;
    } catch (err) {
      setError('Failed to fetch dream feed: ' + err.message);
      setLoading(false);
      throw err;
    }
  };

  const createDream = async (dreamData) => {
    if (!userState.isAuthenticated) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);

    try {
      // Validate dream using AI
      const isValid = await AIService.validateDream(dreamData.description, dreamData.audioUrl);

      if (!isValid) {
        throw new Error('Dream validation failed. The AI detected this may not be a genuine dream.');
      }

      // Create dream in database
      const newDream = await DreamService.createDream({
        ...dreamData,
        userId: userState.user.uid,
        username: userState.user.username,
        userProfileImage: userState.user.profileImageUrl
      });

      // Update local state
      setDreams(prev => [newDream, ...prev]);

      setLoading(false);
      return newDream;
    } catch (err) {
      setError('Failed to create dream: ' + err.message);
      setLoading(false);
      throw err;
    }
  };

  const updateDream = async (dreamId, updateData) => {
    if (!userState.isAuthenticated) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);

    try {
      const updatedDream = await DreamService.updateDream(dreamId, updateData);

      // Update local state
      setDreams(prev =>
        prev.map(dream =>
          dream.id === dreamId ? { ...dream, ...updateData } : dream
        )
      );

      setLoading(false);
      return updatedDream;
    } catch (err) {
      setError('Failed to update dream: ' + err.message);
      setLoading(false);
      throw err;
    }
  };

  const deleteDream = async (dreamId) => {
    if (!userState.isAuthenticated) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);

    try {
      await DreamService.deleteDream(dreamId);

      // Update local state
      setDreams(prev => prev.filter(dream => dream.id !== dreamId));

      setLoading(false);
      return true;
    } catch (err) {
      setError('Failed to delete dream: ' + err.message);
      setLoading(false);
      throw err;
    }
  };

  const toggleLike = async (dreamId) => {
    if (!userState.isAuthenticated) throw new Error('User not authenticated');

    try {
      const updatedDream = await DreamService.toggleLike(dreamId, userState.user.uid);

      // Update local state
      setDreams(prev =>
        prev.map(dream =>
          dream.id === dreamId ? updatedDream : dream
        )
      );

      return updatedDream;
    } catch (err) {
      console.error('Failed to toggle like:', err);
      throw err;
    }
  };

  return {
    dreams,
    loading,
    error,
    fetchUserDreams,
    fetchDreamFeed,
    createDream,
    updateDream,
    deleteDream,
    toggleLike
  };
}