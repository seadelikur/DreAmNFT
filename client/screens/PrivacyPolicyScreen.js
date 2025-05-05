import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/theme';

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.content}>
        {`### Privacy Policy for DreAmNFT
Last Updated: ${new Date().toLocaleDateString()}

#### 1. Information We Collect
We collect the following types of information:
- Account information (email, username)
- Dream content you choose to share
- Device information for analytics

#### 2. How We Use Your Information
- To provide and improve our services
- For authentication and security
- To personalize your experience

#### 3. Data Security
We implement industry-standard security measures to protect your data.

#### 4. Third-Party Services
We use Firebase for authentication and storage. Review Google's privacy policy for details.

#### 5. Your Rights
You can request to access or delete your data at any time.

#### 6. Changes to This Policy
We may update this policy periodically.`}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text
  }
});