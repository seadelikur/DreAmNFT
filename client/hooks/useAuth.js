// hooks/useAuth.js
import { useContext, useState } from 'react';
import { AppContext } from '../AppContext';
import { firebase } from '../firebase';
import 'firebase/auth';

export default function useAuth() {
  const { setUserState } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Get user profile data from Firestore
      const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
      const userData = userDoc.data();

      setUserState({
        isAuthenticated: true,
        user: {
          uid: user.uid,
          email: user.email,
          ...userData
        }
      });

      setLoading(false);
      return user;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const register = async (email, password, username) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Create user profile in Firestore
      await firebase.firestore().collection('users').doc(user.uid).set({
        username,
        email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        profileImageUrl: null,
        bio: '',
        dreamCount: 0,
        nftCount: 0,
        followers: 0,
        following: 0
      });

      setUserState({
        isAuthenticated: true,
        user: {
          uid: user.uid,
          email: user.email,
          username
        }
      });

      setLoading(false);
      return user;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await firebase.auth().signOut();
      setUserState({
        isAuthenticated: false,
        user: null
      });
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const resetPassword = async (email) => {
    setLoading(true);
    setError(null);
    try {
      await firebase.auth().sendPasswordResetEmail(email);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const updateProfile = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const user = firebase.auth().currentUser;
      await firebase.firestore().collection('users').doc(user.uid).update(data);

      setUserState(prev => ({
        ...prev,
        user: {
          ...prev.user,
          ...data
        }
      }));

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return {
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    loading,
    error
  };
}