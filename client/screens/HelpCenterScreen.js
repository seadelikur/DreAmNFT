// src/screens/HelpCenterScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../styles/theme';

const faqData = [
  {
    id: '1',
    question: 'What is DreAmNFT?',
    answer: 'DreAmNFT is a platform that allows you to record your dreams and transform them into unique NFTs (Non-Fungible Tokens) on the blockchain. You can record dreams through text, audio, or images, and mint them as digital collectibles that can be shared, traded, or sold.'
  },
  {
    id: '2',
    question: 'How do I record a dream?',
    answer: 'To record a dream, tap the "+" button on the home screen and select "Record Dream". You can type your dream description, record an audio narration, or upload images. The app works best when you record your dream immediately after waking up, as dream memories fade quickly.'
  },
  {
    id: '3',
    question: 'What makes a dream authentic?',
    answer: 'DreAmNFT uses AI to validate dream authenticity based on linguistic patterns, emotional content, and narrative structure typical of real dreams. The authenticity score helps ensure that the content being minted is likely a genuine dream rather than fiction.'
  },
  {
    id: '4',
    question: 'How do I mint my dream as an NFT?',
    answer: 'After recording your dream, tap the "Mint as NFT" button. You\'ll need to connect a wallet (like MetaMask), add a title, description, and tags, and confirm the transaction. The minting process creates a unique token on the blockchain that represents your dream.'
  },
  {
    id: '5',
    question: 'What blockchain does DreAmNFT use?',
    answer: 'DreAmNFT uses the Ethereum blockchain, specifically the Sepolia testnet for testing and the Ethereum mainnet for production. This ensures your dream NFTs are secure, verifiable, and can be traded on popular NFT marketplaces.'
  },
  {
    id: '6',
    question: 'How are dream rarities calculated?',
    answer: 'Dream rarities are calculated based on several factors: dream length, emotional intensity, uniqueness of content, presence of recurring symbols, and AI-detected narrative complexity. Rarity levels range from Common to Legendary, with rarer dreams typically having higher value in the marketplace.'
  },
  {
    id: '7',
    question: 'What are Dream Stations?',
    answer: 'Dream Stations are curated collections of dreams organized by themes, emotions, or experiences. You can explore stations created by other users or create your own to showcase dreams that share common elements. It\'s a great way to discover patterns in collective dreaming.'
  },
  {
    id: '8',
    question: 'How do royalties work?',
    answer: 'When you mint a dream NFT, you automatically receive royalties (typically 2.5%) on all future sales of that NFT. This means if someone buys your dream NFT and later sells it to someone else, you will receive a percentage of that sale price.'
  },
  {
    id: '9',
    question: 'Is my wallet secure?',
    answer: 'DreAmNFT never stores your private keys or seed phrases. We use secure wallet connection methods that keep your crypto assets safe. Always practice good security habits like enabling two-factor authentication and never sharing your recovery phrase.'
  },
  {
    id: '10',
    question: 'How can I delete my account?',
    answer: 'You can delete your account from the Settings screen. Note that while your account data will be removed from our servers, any NFTs you have minted will remain on the blockchain as they cannot be deleted once created.'
  }
];

const HelpCenterScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaqs, setExpandedFaqs] = useState({});

  const filteredFaqs = searchQuery.trim() === ''
    ? faqData
    : faqData.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const toggleFaq = (id) => {
    setExpandedFaqs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@dreamnft.com?subject=DreAmNFT%20Support%20Request');
  };

  const handleDiscordJoin = () => {
    Linking.openURL('https://discord.gg/dreamnft');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Help Center</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for help..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Support Options */}
        <View style={styles.supportOptionsContainer}>
          <TouchableOpacity
            style={styles.supportOption}
            onPress={handleContactSupport}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="mail-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.supportOptionText}>Email Support</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.supportOption}
            onPress={handleDiscordJoin}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#5865F2' + '33' }]}>
              <Ionicons name="logo-discord" size={24} color="#5865F2" />
            </View>
            <Text style={styles.supportOptionText}>Join Discord</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.supportOption}
            onPress={() => navigation.navigate('Tutorials')}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.successLight }]}>
              <Ionicons name="play-outline" size={24} color={colors.success} />
            </View>
            <Text style={styles.supportOptionText}>Tutorials</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqContainer}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

          {filteredFaqs.length === 0 ? (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
              <Text style={styles.noResultsSubtext}>Try a different search term or browse the FAQs below</Text>
            </View>
          ) : (
            filteredFaqs.map(faq => (
              <TouchableOpacity
                key={faq.id}
                style={styles.faqItem}
                onPress={() => toggleFaq(faq.id)}
                activeOpacity={0.7}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Ionicons
                    name={expandedFaqs[faq.id] ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>

                {expandedFaqs[faq.id] && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Additional Help Topics */}
        <View style={styles.topicsContainer}>
          <Text style={styles.sectionTitle}>Help Topics</Text>

          <TouchableOpacity
            style={styles.topicItem}
            onPress={() => navigation.navigate('HelpTopic', { topic: 'getting-started' })}
          >
            <View style={styles.topicContent}>
              <Ionicons name="rocket-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.topicText}>Getting Started</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.topicItem}
            onPress={() => navigation.navigate('HelpTopic', { topic: 'wallet-setup' })}
          >
            <View style={styles.topicContent}>
              <Ionicons name="wallet-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.topicText}>Wallet Setup</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.topicItem}
            onPress={() => navigation.navigate('HelpTopic', { topic: 'nft-minting' })}
          >
            <View style={styles.topicContent}>
              <Ionicons name="diamond-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.topicText}>NFT Minting</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.topicItem}
            onPress={() => navigation.navigate('HelpTopic', { topic: 'marketplace' })}
          >
            <View style={styles.topicContent}>
              <Ionicons name="storefront-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.topicText}>Marketplace Guide</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.topicItem}
            onPress={() => navigation.navigate('HelpTopic', { topic: 'dream-analysis' })}
          >
            <View style={styles.topicContent}>
              <Ionicons name="analytics-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.topicText}>Dream Analysis</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
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
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  supportOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  supportOption: {
    alignItems: 'center',
    width: '30%',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  supportOptionText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.text,
    textAlign: 'center',
  },
  faqContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  faqAnswer: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginTop: 12,
    lineHeight: 22,
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noResultsText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  topicsContainer: {
    marginBottom: 24,
  },
  topicItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topicContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topicText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.text,
    marginLeft: 12,
  },
});

export default HelpCenterScreen;