// src/screens/ContactSupportScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../styles/theme';
import { useApp } from '../context/AppContext';
import firestore from '@react-native-firebase/firestore';

const ContactSupportScreen = ({ navigation }) => {
  const { userProfile, showToast } = useApp();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!subject.trim()) {
      newErrors.subject = 'Subject is required';
      isValid = false;
    }

    if (!message.trim()) {
      newErrors.message = 'Message is required';
      isValid = false;
    } else if (message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      await firestore().collection('supportTickets').add({
        userId: userProfile.id,
        userEmail: userProfile.email,
        username: userProfile.username,
        subject: subject.trim(),
        message: message.trim(),
        status: 'open',
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      showToast({
        type: 'success',
        title: 'Message Sent',
        message: 'We\'ll get back to you as soon as possible.'
      });

      navigation.goBack();
    } catch (error) {
      console.error('Submit support ticket error:', error);
      showToast({
        type: 'error',
        title: 'Failed to Send',
        message: 'Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Contact Support</Text>
          <Text style={styles.subtitle}>
            Have a question or need help? Our support team is here for you.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Subject</Text>
            <View style={[styles.inputContainer, errors.subject && styles.inputError]}>
              <TextInput
                style={styles.input}
                placeholder="What's your inquiry about?"
                placeholderTextColor={colors.textTertiary}
                value={subject}
                onChangeText={(text) => {
                  setSubject(text);
                  if (errors.subject) {
                    setErrors({ ...errors, subject: null });
                  }
                }}
              />
            </View>
            {errors.subject && <Text style={styles.errorText}>{errors.subject}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Message</Text>
            <View
              style={[
                styles.inputContainer,
                styles.textAreaContainer,
                errors.message && styles.inputError
              ]}
            >
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your issue or question in detail"
                placeholderTextColor={colors.textTertiary}
                value={message}
                onChangeText={(text) => {
                  setMessage(text);
                  if (errors.message) {
                    setErrors({ ...errors, message: null });
                  }
                }}
                multiline
                textAlignVertical="top"
              />
            </View>
            {errors.message && <Text style={styles.errorText}>{errors.message}</Text>}
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Send Message</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.contactInfo}>
          <Text style={styles.contactTitle}>Other Ways to Reach Us</Text>

          <View style={styles.contactItem}>
            <View style={styles.contactIcon}>
              <Ionicons name="mail-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.contactDetails}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>support@dreamnft.com</Text>
            </View>
          </View>

          <View style={styles.contactItem}>
            <View style={styles.contactIcon}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.contactDetails}>
              <Text style={styles.contactLabel}>Live Chat</Text>
              <Text style={styles.contactValue}>Available Mon-Fri, 9am-5pm EST</Text>
            </View>
          </View>

          <View style={styles.contactItem}>
            <View style={styles.contactIcon}>
              <Ionicons name="logo-twitter" size={20} color={colors.primary} />
            </View>
            <View style={styles.contactDetails}>
              <Text style={styles.contactLabel}>Twitter</Text>
              <Text style={styles.contactValue}>@DreAmNFT</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  textAreaContainer: {
    minHeight: 160,
    paddingTop: 12,
    paddingBottom: 12,
  },
  input: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 16,
    height: 56,
  },
  textArea: {
    height: 'auto',
    lineHeight: 24,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: '#FFFFFF',
  },
  contactInfo: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactDetails: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.text,
  },
});

export default ContactSupportScreen;