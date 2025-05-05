// src/screens/SettingsScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../styles/theme';
import { useApp } from '../context/AppContext';
import auth from '@react-native-firebase/auth';

const SettingsScreen = ({ navigation }) => {
  const {
    userProfile,
    appPreferences,
    updatePreferences,
    themeMode,
    toggleTheme,
    walletConnected,
    disconnectWallet,
    showToast
  } = useApp();

  const handleLogout = async () => {
    try {
      await auth().signOut();
      showToast({
        type: 'success',
        message: 'You have been logged out'
      });
    } catch (error) {
      console.error('Logout error:', error);
      showToast({
        type: 'error',
        title: 'Logout Failed',
        message: error.message
      });
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', onPress: handleLogout, style: 'destructive' }
      ]
    );
  };

  const confirmDisconnectWallet = () => {
    if (!walletConnected) return;

    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your wallet?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          onPress: () => {
            disconnectWallet();
            showToast({
              type: 'success',
              message: 'Wallet disconnected successfully'
            });
          },
          style: 'destructive'
        }
      ]
    );
  };

  const handleToggle = (preference) => {
    updatePreferences({
      [preference]: !appPreferences[preference]
    });
  };

  const renderSettingItem = ({ icon, title, onPress, color }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={22} color={color || colors.textSecondary} />
      </View>
      <Text style={styles.settingText}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
    </TouchableOpacity>
  );

  const renderToggleItem = ({ icon, title, value, onToggle, disabled }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={22} color={colors.textSecondary} />
      </View>
      <Text style={styles.settingText}>{title}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primaryLight }}
        thumbColor={value ? colors.primary : colors.textTertiary}
        disabled={disabled}
      />
    </View>
  );

  const renderSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {userProfile && (
          <View style={styles.profileSection}>
            <TouchableOpacity
              style={styles.profileHeader}
              onPress={() => navigation.navigate('EditProfile')}
            >
              {userProfile.profileImage ? (
                <Image
                  source={{ uri: userProfile.profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
                  <Ionicons name="person" size={24} color={colors.textTertiary} />
                </View>
              )}

              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userProfile.displayName}</Text>
                <Text style={styles.profileUsername}>@{userProfile.username}</Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        )}

        {renderSection({
          title: 'Account',
          children: (
            <>
              {renderSettingItem({
                icon: 'wallet-outline',
                title: walletConnected ? 'Manage Wallet' : 'Connect Wallet',
                onPress: walletConnected
                  ? () => navigation.navigate('WalletScreen')
                  : () => navigation.navigate('ConnectWallet')
              })}

              {walletConnected && (
                renderSettingItem({
                  icon: 'log-out-outline',
                  title: 'Disconnect Wallet',
                  onPress: confirmDisconnectWallet,
                  color: colors.error
                })
              )}

              {renderSettingItem({
                icon: 'shield-checkmark-outline',
                title: 'Privacy & Security',
                onPress: () => navigation.navigate('PrivacySecuritySettings')
              })}

              {renderSettingItem({
                icon: 'notifications-outline',
                title: 'Notifications',
                onPress: () => navigation.navigate('NotificationSettings')
              })}
            </>
          )
        })}

        {renderSection({
          title: 'Preferences',
          children: (
            <>
              {renderToggleItem({
                icon: 'moon-outline',
                title: 'Dark Mode',
                value: themeMode === 'dark',
                onToggle: toggleTheme
              })}

              {renderToggleItem({
                icon: 'notifications-outline',
                title: 'Enable Notifications',
                value: appPreferences.notificationsEnabled,
                onToggle: () => handleToggle('notificationsEnabled')
              })}

              {renderToggleItem({
                icon: 'alarm-outline',
                title: 'Dream Recording Reminders',
                value: appPreferences.dreamReminders,
                onToggle: () => handleToggle('dreamReminders'),
                disabled: !appPreferences.notificationsEnabled
              })}

              {renderToggleItem({
                icon: 'volume-high-outline',
                title: 'Sound Effects',
                value: appPreferences.soundEffects,
                onToggle: () => handleToggle('soundEffects')
              })}

              {renderToggleItem({
                icon: 'hand-left-outline',
                title: 'Haptic Feedback',
                value: appPreferences.hapticFeedback,
                onToggle: () => handleToggle('hapticFeedback')
              })}

              {renderToggleItem({
                icon: 'eye-off-outline',
                title: 'Show NSFW Content',
                value: appPreferences.showNSFWContent,
                onToggle: () => handleToggle('showNSFWContent')
              })}
            </>
          )
        })}

        {renderSection({
          title: 'Support',
          children: (
            <>
              {renderSettingItem({
                icon: 'help-circle-outline',
                title: 'Help Center',
                onPress: () => navigation.navigate('HelpCenter')
              })}

              {renderSettingItem({
                icon: 'chatbubble-ellipses-outline',
                title: 'Contact Support',
                onPress: () => navigation.navigate('ContactSupport')
              })}

              {renderSettingItem({
                icon: 'star-outline',
                title: 'Rate the App',
                onPress: () => {/* Open app store rating */}
              })}

              {renderSettingItem({
                icon: 'share-social-outline',
                title: 'Share DreAmNFT',
                onPress: () => {/* Share app functionality */}
              })}
            </>
          )
        })}

        {renderSection({
          title: 'About',
          children: (
            <>
              {renderSettingItem({
                icon: 'information-circle-outline',
                title: 'About DreAmNFT',
                onPress: () => navigation.navigate('About')
              })}

              {renderSettingItem({
                icon: 'document-text-outline',
                title: 'Terms of Service',
                onPress: () => navigation.navigate('Terms')
              })}

              {renderSettingItem({
                icon: 'lock-closed-outline',
                title: 'Privacy Policy',
                onPress: () => navigation.navigate('Privacy')
              })}
            </>
          )
        })}

        <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>DreAmNFT v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  profileSection: {
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileImagePlaceholder: {
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionContent: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingIcon: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  logoutButton: {
    backgroundColor: colors.errorLight,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  logoutButtonText: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.error,
  },
  versionText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});

export default SettingsScreen;