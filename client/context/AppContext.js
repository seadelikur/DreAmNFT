// src/context/AppContext.js
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { ethers } from 'ethers';
import * as Notifications from 'expo-notifications';
import { useFocusEffect } from '@react-navigation/native';

// Create context
const AppContext = createContext();

// Storage keys
const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: 'onboarding_completed',
  WALLET_ADDRESS: 'wallet_address',
  THEME_MODE: 'theme_mode',
  APP_PREFERENCES: 'app_preferences',
};

export const AppProvider = ({ children }) => {
  // Authentication & User
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  // Blockchain & Wallet
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [ethBalance, setEthBalance] = useState('0');
  const [provider, setProvider] = useState(null);

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // UI & Preferences
  const [themeMode, setThemeMode] = useState('light');
  const [appPreferences, setAppPreferences] = useState({
    notificationsEnabled: true,
    dreamReminders: true,
    soundEffects: true,
    hapticFeedback: true,
    showNSFWContent: false
  });

  // Toast/Alerts
  const [toastConfig, setToastConfig] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    duration: 3000
  });

  // Refs
  const toastTimeoutRef = useRef(null);

  // Initialization
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if onboarding is completed
        const onboardingStatus = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
        setOnboardingCompleted(onboardingStatus === 'true');

        // Load wallet address
        const storedWalletAddress = await AsyncStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS);
        if (storedWalletAddress) {
          setWalletAddress(storedWalletAddress);
          setWalletConnected(true);
        }

        // Load theme
        const storedTheme = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
        if (storedTheme) {
          setThemeMode(storedTheme);
        }

        // Load preferences
        const storedPreferences = await AsyncStorage.getItem(STORAGE_KEYS.APP_PREFERENCES);
        if (storedPreferences) {
          setAppPreferences(JSON.parse(storedPreferences));
        }

        // Initialize Ethereum provider (for testnet only)
        const infuraProvider = new ethers.providers.JsonRpcProvider(
          'https://sepolia.infura.io/v3/YOUR_INFURA_KEY'
        );
        setProvider(infuraProvider);

        // Initialize auth listener
        const unsubscribe = auth().onAuthStateChanged(handleAuthStateChange);

        return () => unsubscribe();
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Auth state handler
  const handleAuthStateChange = async (firebaseUser) => {
    if (firebaseUser) {
      setUser(firebaseUser);
      setIsAuthenticated(true);
      await loadUserProfile(firebaseUser.uid);
    } else {
      setUser(null);
      setUserProfile(null);
      setIsAuthenticated(false);
    }
  };

  // Load user profile from Firestore
  const loadUserProfile = async (uid) => {
    try {
      const userDoc = await firestore().collection('users').doc(uid).get();

      if (userDoc.exists) {
        setUserProfile({ ...userDoc.data(), uid });
      } else {
        console.warn('User document does not exist in Firestore');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // Load wallet balance
  const loadWalletBalance = async () => {
    if (walletAddress && provider) {
      try {
        const balance = await provider.getBalance(walletAddress);
        setEthBalance(ethers.utils.formatEther(balance));
      } catch (error) {
        console.error('Error loading wallet balance:', error);
      }
    }
  };

  // Effect to load wallet balance when address or provider changes
  useEffect(() => {
    if (walletAddress && provider) {
      loadWalletBalance();
    }
  }, [walletAddress, provider]);

  // Toggle theme
  const toggleTheme = async () => {
    const newTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newTheme);
    await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, newTheme);
  };

  // Update app preferences
  const updatePreferences = async (newPreferences) => {
    const updatedPreferences = { ...appPreferences, ...newPreferences };
    setAppPreferences(updatedPreferences);
    await AsyncStorage.setItem(STORAGE_KEYS.APP_PREFERENCES, JSON.stringify(updatedPreferences));
  };

  // Complete onboarding
  const completeOnboarding = async () => {
    setOnboardingCompleted(true);
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
  };

  // Connect wallet
  const connectWallet = async (address) => {
    if (!address) return;

    setWalletAddress(address);
    setWalletConnected(true);

    // Save to storage
    await AsyncStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, address);

    // If user is logged in, update their profile
    if (userProfile && userProfile.uid) {
      try {
        await firestore()
          .collection('users')
          .doc(userProfile.uid)
          .update({
            walletAddress: address,
            updatedAt: firestore.FieldValue.serverTimestamp()
          });

        // Update local user profile
        setUserProfile(prev => ({
          ...prev,
          walletAddress: address
        }));
      } catch (error) {
        console.error('Error updating wallet address in profile:', error);
      }
    }

    // Load balance
    loadWalletBalance();
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    setWalletAddress(null);
    setWalletConnected(false);
    setEthBalance('0');

    // Remove from storage
    await AsyncStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);

    // If user is logged in, update their profile
    if (userProfile && userProfile.uid) {
      try {
        await firestore()
          .collection('users')
          .doc(userProfile.uid)
          .update({
            walletAddress: null,
            updatedAt: firestore.FieldValue.serverTimestamp()
          });

        // Update local user profile
        setUserProfile(prev => ({
          ...prev,
          walletAddress: null
        }));
      } catch (error) {
        console.error('Error removing wallet address from profile:', error);
      }
    }
  };

  // Show toast
  const showToast = ({ type = 'success', title = '', message = '', duration = 3000 }) => {
    // Clear any existing timeout
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    setToastConfig({
      visible: true,
      type,
      title,
      message,
      duration
    });

    // Auto-hide toast after duration
    toastTimeoutRef.current = setTimeout(() => {
      setToastConfig(prev => ({ ...prev, visible: false }));
    }, duration);
  };

  // Hide toast
  const hideToast = () => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    setToastConfig(prev => ({ ...prev, visible: false }));
  };

  // Load notifications
  const loadNotifications = async () => {
    if (!userProfile || !userProfile.uid) return;

    try {
      const notificationsSnapshot = await firestore()
        .collection('notifications')
        .where('userId', '==', userProfile.uid)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      const notificationsData = notificationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setNotifications(notificationsData);

      // Count unread notifications
      const unreadCount = notificationsData.filter(notif => !notif.read).length;
      setUnreadNotificationsCount(unreadCount);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  // Effect to load notifications when userProfile changes
  useEffect(() => {
    if (userProfile && userProfile.uid) {
      loadNotifications();
    }
  }, [userProfile]);

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await firestore()
        .collection('notifications')
        .doc(notificationId)
        .update({
          read: true,
          updatedAt: firestore.FieldValue.serverTimestamp()
        });

      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );

      // Update unread count
      setUnreadNotificationsCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    if (!userProfile || !userProfile.uid || notifications.length === 0) return;

    try {
      // Get all unread notification IDs
      const unreadIds = notifications
        .filter(notif => !notif.read)
        .map(notif => notif.id);

      if (unreadIds.length === 0) return;

      // Batch update in Firestore
      const batch = firestore().batch();

      unreadIds.forEach(id => {
        const notifRef = firestore().collection('notifications').doc(id);
        batch.update(notifRef, {
          read: true,
          updatedAt: firestore.FieldValue.serverTimestamp()
        });
      });

      await batch.commit();

      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );

      // Reset unread count
      setUnreadNotificationsCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Set up real-time notification listener
  useEffect(() => {
    if (!userProfile || !userProfile.uid) return;

    const unsubscribe = firestore()
      .collection('notifications')
      .where('userId', '==', userProfile.uid)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .onSnapshot(snapshot => {
        if (snapshot) {
          const notificationsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          setNotifications(notificationsData);

          // Count unread notifications
          const unreadCount = notificationsData.filter(notif => !notif.read).length;
          setUnreadNotificationsCount(unreadCount);
        }
      }, error => {
        console.error('Notifications listener error:', error);
      });

    return () => unsubscribe();
  }, [userProfile]);

  // Context value
  const contextValue = {
    // Auth & User
    user,
    userProfile,
    setUserProfile,
    isAuthenticated,

    // App State
    loading,
    onboardingCompleted,
    completeOnboarding,

    // Wallet & Blockchain
    walletAddress,
    walletConnected,
    ethBalance,
    provider,
    connectWallet,
    disconnectWallet,
    loadWalletBalance,

    // Notifications
    notifications,
    unreadNotificationsCount,
    loadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,

    // Preferences
    themeMode,
    toggleTheme,
    appPreferences,
    updatePreferences,

    // Toast
    showToast,
    hideToast,
    toastConfig
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the AppContext
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};