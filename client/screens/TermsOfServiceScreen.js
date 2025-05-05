import React from 'react';
import { View, ScrollView, Text, StyleSheet, Linking } from 'react-native';
import { colors } from '../styles/theme';

export default function TermsOfServiceScreen() {
  const openPrivacyPolicy = () => {
    // Replace with your actual privacy policy link
    Linking.openURL('https://dreamnft.app/privacy');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Terms of Service</Text>

      <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
      <Text style={styles.text}>
        By accessing or using DreAmNFT ("Service"), you agree to be bound by these Terms of Service ("Terms").
        If you disagree with any part of the terms, you may not access the Service.
      </Text>

      <Text style={styles.sectionTitle}>2. NFT Creation and Ownership</Text>
      <Text style={styles.text}>
        - You retain all intellectual property rights to your dream recordings and NFT creations.
        - By minting NFTs through our Service, you grant DreAmNFT a non-exclusive license to display and distribute your content.
        - You represent that you own or have permission to use all content you upload.
      </Text>

      <Text style={styles.sectionTitle}>3. Marketplace Rules</Text>
      <Text style={styles.text}>
        - All NFT transactions are final and recorded on the blockchain.
        - DreAmNFT takes a [X]% commission on secondary sales.
        - Prohibited content includes: illegal material, hate speech, and unauthorized copyrighted works.
      </Text>

      <Text style={styles.sectionTitle}>4. User Responsibilities</Text>
      <Text style={styles.text}>
        - You are responsible for maintaining the security of your account and wallet.
        - Any activity under your account is your responsibility.
        - You must be at least 18 years old or have parental consent to use our Service.
      </Text>

      <Text style={styles.sectionTitle}>5. Limitation of Liability</Text>
      <Text style={styles.text}>
        DreAmNFT is not liable for:
        - Any losses from NFT transactions
        - Technical issues or service interruptions
        - Unauthorized access to your account
        - Content created by users
      </Text>

      <Text style={styles.sectionTitle}>6. Modifications</Text>
      <Text style={styles.text}>
        We may modify these Terms at any time. Continued use after changes constitutes acceptance.
      </Text>

      <Text style={styles.sectionTitle}>7. Governing Law</Text>
      <Text style={styles.text}>
        These Terms shall be governed by the laws of [Your Jurisdiction] without regard to conflict of law provisions.
      </Text>

      <Text style={styles.linkText} onPress={openPrivacyPolicy}>
        View our Privacy Policy
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: colors.background
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 15,
    marginBottom: 10
  },
  text: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 10
  },
  linkText: {
    fontSize: 16,
    color: colors.link,
    marginTop: 20,
    textDecorationLine: 'underline',
    textAlign: 'center'
  }
});