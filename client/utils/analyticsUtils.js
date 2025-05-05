// src/utils/analyticsUtils.js
import analytics from '@react-native-firebase/analytics';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check if analytics consent was given
export const checkAnalyticsConsent = async () => {
  try {
    const consentString = await AsyncStorage.getItem('@analytics_consent');
    return consentString === 'true';
  } catch (error) {
    console.error('Error checking analytics consent:', error);
    return false;
  }
};

// Set analytics consent
export const setAnalyticsConsent = async (consent) => {
  try {
    await AsyncStorage.setItem('@analytics_consent', consent ? 'true' : 'false');

    // Enable/disable analytics based on consent
    await analytics().setAnalyticsCollectionEnabled(consent);

    return true;
  } catch (error) {
    console.error('Error setting analytics consent:', error);
    return false;
  }
};

// Track screen view
export const trackScreen = async (screenName, screenClass) => {
  try {
    const hasConsent = await checkAnalyticsConsent();
    if (!hasConsent) return;

    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
  } catch (error) {
    console.error('Error tracking screen view:', error);
  }
};

// Track user event
export const trackEvent = async (eventName, params = {}) => {
  try {
    const hasConsent = await checkAnalyticsConsent();
    if (!hasConsent) return;

    await analytics().logEvent(eventName, params);
  } catch (error) {
    console.error(`Error tracking event ${eventName}:`, error);
  }
};

// Track dream recording
export const trackDreamRecorded = async (dreamId, method, duration) => {
  await trackEvent('dream_recorded', {
    dream_id: dreamId,
    recording_method: method, // 'voice', 'text', 'both'
    recording_duration: duration, // in seconds
  });
};

// Track NFT minting
export const trackNFTMinted = async (dreamId, tokenId, rarity) => {
  await trackEvent('nft_minted', {
    dream_id: dreamId,
    token_id: tokenId,
    rarity: rarity,
  });
};

// Track NFT transaction
export const trackNFTTransaction = async (type, tokenId, price) => {
  await trackEvent('nft_transaction', {
    transaction_type: type, // 'buy', 'sell', 'gift', 'transfer'
    token_id: tokenId,
    price: price, // in ETH
    currency: 'ETH',
    platform: Platform.OS,
  });
};

// Track dream station interaction
export const trackStationInteraction = async (stationId, action) => {
  await trackEvent('station_interaction', {
    station_id: stationId,
    action: action, // 'create', 'view', 'add_dream', 'share'
  });
};

// Track user engagement
export const trackEngagement = async (action, contentType, contentId) => {
  await trackEvent('user_engagement', {
    action: action, // 'like', 'comment', 'share', 'follow'
    content_type: contentType, // 'dream', 'nft', 'user', 'station'
    content_id: contentId,
  });
};

// Initialize analytics
export const initializeAnalytics = async () => {
  try {
    const hasConsent = await checkAnalyticsConsent();
    await analytics().setAnalyticsCollectionEnabled(hasConsent);

    if (hasConsent) {
      // Log app open event
      await analytics().logAppOpen();
    }

    return true;
  } catch (error) {
    console.error('Error initializing analytics:', error);
    return false;
  }
};