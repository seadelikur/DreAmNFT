// App.js
import React, { useEffect, useState } from 'react';
import { StatusBar, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { AppProvider } from './context/AppContext';
import { colors } from './styles/theme';
import { initializeLocalization } from './utils/localizationUtils';
import { initializeAnalytics } from './utils/analyticsUtils';
import * as SplashScreen from 'expo-splash-screen';
import { TouchableOpacity } from 'react-native';
import RNRestart from 'react-native-restart';

// Keep the splash screen visible while we initialize
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize localization
        await initializeLocalization();

        // Initialize analytics
        await initializeAnalytics();

        // All initialization complete
        setAppReady(true);

        // Hide splash screen
        await SplashScreen.hideAsync();
      } catch (e) {
        console.error('App initialization error:', e);
        setError(e.message);
        await SplashScreen.hideAsync();
      }
    };

    initialize();
  }, []);

  if (!appReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.text, fontSize: 16 }}>
          Loading DreAmNFT...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.error, fontSize: 18, marginBottom: 16 }}>
          Something went wrong!
        </Text>
        <Text style={{ color: colors.text, fontSize: 16, marginHorizontal: 32, textAlign: 'center' }}>
          {error}
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
            marginTop: 24
          }}
          onPress={() => RNRestart.Restart()}
        >
          <Text style={{ color: '#fff', fontSize: 16 }}>Restart App</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <AppProvider>
        <AppNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}