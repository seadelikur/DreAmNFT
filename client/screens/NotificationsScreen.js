// src/screens/NotificationSettingsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../styles/theme';
import { useApp } from '../context/AppContext';
import firestore from '@react-native-firebase/firestore';

const NotificationSettingsScreen = () => {
  const { userProfile, appPreferences, updatePreferences, showToast } = useApp();

  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    notificationsEnabled: appPreferences.notificationsEnabled || false,
    dreamReminders: appPreferences.dreamReminders || false,
    dreamReminderTime: appPreferences.dreamReminderTime || '08:00',
    likesAndComments: appPreferences.notificationSettings?.likesAndComments || true,
    mentions: appPreferences.notificationSettings?.mentions || true,
    newFollowers: appPreferences.notificationSettings?.newFollowers || true,
    dreamFeatures: appPreferences.notificationSettings?.dreamFeatures || true,
    marketplaceActivity: appPreferences.notificationSettings?.marketplaceActivity || true,
    nftSales: appPreferences.notificationSettings?.nftSales || true,
    systemAnnouncements: appPreferences.notificationSettings?.systemAnnouncements || true,
    emailNotifications: appPreferences.notificationSettings?.emailNotifications || true,
    pushNotifications: appPreferences.notificationSettings?.pushNotifications || true
  });

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const saveSettings = async () => {
    try {
      setLoading(true);

      // Update user preferences in Firestore
      const notificationSettings = {
        likesAndComments: settings.likesAndComments,
        mentions: settings.mentions,
        newFollowers: settings.newFollowers,
        dreamFeatures: settings.dreamFeatures,
        marketplaceActivity: settings.marketplaceActivity,
        nftSales: settings.nftSales,
        systemAnnouncements: settings.systemAnnouncements,
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications
      };

      // Update app context
      await updatePreferences({
        notificationsEnabled: settings.notificationsEnabled,
        dreamReminders: settings.dreamReminders,
        dreamReminderTime: settings.dreamReminderTime,
        notificationSettings
      });

      // Update user document in Firestore
      if (userProfile?.id) {
        await firestore()
          .collection('users')
          .doc(userProfile.id)
          .update({
            'preferences.notificationsEnabled': settings.notificationsEnabled,
            'preferences.dreamReminders': settings.dreamReminders,
            'preferences.dreamReminderTime': settings.dreamReminderTime,
            'preferences.notificationSettings': notificationSettings,
            updatedAt: firestore.FieldValue.serverTimestamp()
          });
      }

      showToast({
        type: 'success',
        title: 'Settings Saved',
        message: 'Your notification preferences have been updated'
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Could not save your notification settings'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderToggleSetting = ({ title, subtitle, value, onToggle, disabled }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primaryLight }}
        thumbColor={value ? colors.primary : colors.textTertiary}
        disabled={disabled}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>

        {renderToggleSetting({
          title: 'Enable Notifications',
          subtitle: 'Master switch for all notifications',
          value: settings.notificationsEnabled,
          onToggle: () => handleToggle('notificationsEnabled')
        })}

        {renderToggleSetting({
          title: 'Dream Recording Reminders',
          subtitle: 'Get reminded to record your dreams',
          value: settings.dreamReminders,
          onToggle: () => handleToggle('dreamReminders'),
          disabled: !settings.notificationsEnabled
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Social Notifications</Text>

        {renderToggleSetting({
          title: 'Likes & Comments',
          subtitle: 'When someone likes or comments on your dreams',
          value: settings.likesAndComments,
          onToggle: () => handleToggle('likesAndComments'),
          disabled: !settings.notificationsEnabled
        })}

        {renderToggleSetting({
          title: 'Mentions',
          subtitle: 'When someone mentions you in a comment',
          value: settings.mentions,
          onToggle: () => handleToggle('mentions'),
          disabled: !settings.notificationsEnabled
        })}

        {renderToggleSetting({
          title: 'New Followers',
          subtitle: 'When someone follows your profile',
          value: settings.newFollowers,
          onToggle: () => handleToggle('newFollowers'),
          disabled: !settings.notificationsEnabled
        })}

        {renderToggleSetting({
          title: 'Dream Features',
          subtitle: 'When your dream is featured in stations or galleries',
          value: settings.dreamFeatures,
          onToggle: () => handleToggle('dreamFeatures'),
          disabled: !settings.notificationsEnabled
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Marketplace Notifications</Text>

        {renderToggleSetting({
          title: 'Marketplace Activity',
          subtitle: 'Price changes and new listings',
          value: settings.marketplaceActivity,
          onToggle: () => handleToggle('marketplaceActivity'),
          disabled: !settings.notificationsEnabled
        })}

        {renderToggleSetting({
          title: 'NFT Sales',
          subtitle: 'When your NFT sells or you receive royalties',
          value: settings.nftSales,
          onToggle: () => handleToggle('nftSales'),
          disabled: !settings.notificationsEnabled
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Other Notifications</Text>

        {renderToggleSetting({
          title: 'System Announcements',
          subtitle: 'Updates, features, and important information',
          value: settings.systemAnnouncements,
          onToggle: () => handleToggle('systemAnnouncements'),
          disabled: !settings.notificationsEnabled
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Methods</Text>

        {renderToggleSetting({
          title: 'Email Notifications',
          subtitle: 'Receive notifications via email',
          value: settings.emailNotifications,
          onToggle: () => handleToggle('emailNotifications'),
          disabled: !settings.notificationsEnabled
        })}

        {renderToggleSetting({
          title: 'Push Notifications',
          subtitle: 'Receive notifications on your device',
          value: settings.pushNotifications,
          onToggle: () => handleToggle('pushNotifications'),
          disabled: !settings.notificationsEnabled
        })}
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={saveSettings}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.saveButtonText}>Save Settings</Text>
        )}
      </TouchableOpacity>
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
  section: {
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.text,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.text,
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  timePickerText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.text,
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: '#FFFFFF',
  },
});

export default NotificationSettingsScreen;