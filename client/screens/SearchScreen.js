// src/screens/SearchScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../styles/theme';
import { searchDreams, searchUsers, searchNFTs } from '../services/searchService';
import DreamCard from '../components/DreamCard';
import NFTCard from '../components/NFTCard';
import UserListItem from '../components/UserListItem';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'dreams', label: 'Dreams' },
  { id: 'nfts', label: 'NFTs' },
  { id: 'users', label: 'Users' },
  { id: 'tags', label: 'Tags' }
];

const POPULAR_SEARCHES = [
  'flying dreams', 'lucid dreaming', 'nightmare', 'falling', 'chase',
  'water', 'animals', 'celebrities', 'childhood home', 'teeth falling'
];

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState({
    dreams: [],
    nfts: [],
    users: [],
    tags: []
  });
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    // Load recent searches from storage
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    // In a real app, this would load from AsyncStorage or similar
    setRecentSearches([
      'flying', 'underwater city', 'time travel', 'childhood'
    ]);
  };

  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) return;

    try {
      setLoading(true);

      // Add to recent searches
      if (!recentSearches.includes(query)) {
        const updatedSearches = [query, ...recentSearches.slice(0, 4)];
        setRecentSearches(updatedSearches);
        // In a real app, save to AsyncStorage or similar
      }

      // Perform search based on active tab
      let dreamResults = [];
      let nftResults = [];
      let userResults = [];
      let tagResults = [];

      if (activeTab === 'all' || activeTab === 'dreams') {
        const { success, dreams } = await searchDreams(query);
        if (success) {
          dreamResults = dreams;
        }
      }

      if (activeTab === 'all' || activeTab === 'nfts') {
        const { success, nfts } = await searchNFTs(query);
        if (success) {
          nftResults = nfts;
        }
      }

      if (activeTab === 'all' || activeTab === 'users') {
        const { success, users } = await searchUsers(query);
        if (success) {
          userResults = users;
        }
      }

      if (activeTab === 'all' || activeTab === 'tags') {
        // For tags, we'd typically search for popular tags matching the query
        // This is a simplified version
        tagResults = ['dream', 'nightmare', 'flying', 'falling', 'water', 'chase']
          .filter(tag => tag.includes(query.toLowerCase()))
          .map(tag => ({ tag, count: Math.floor(Math.random() * 100) + 1 }));
      }

      setResults({
        dreams: dreamResults,
        nfts: nftResults,
        users: userResults,
        tags: tagResults
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setResults({
      dreams: [],
      nfts: [],
      users: [],
      tags: []
    });
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (searchQuery.trim()) {
      handleSearch();
    }
  };

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <FlatList
        data={TABS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === item.id && styles.activeTab
            ]}
            onPress={() => handleTabChange(item.id)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === item.id && styles.activeTabText
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Searches</Text>
        <View style={styles.tagsContainer}>
          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={styles.tagItem}
              onPress={() => {
                setSearchQuery(search);
                handleSearch(search);
              }}
            >
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.tagText}>{search}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Searches</Text>
        <View style={styles.tagsContainer}>
          {POPULAR_SEARCHES.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={styles.tagItem}
              onPress={() => {
                setSearchQuery(search);
                handleSearch(search);
              }}
            >
              <Ionicons name="trending-up-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.tagText}>{search}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderResults = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      );
    }

    const hasResults =
      results.dreams.length > 0 ||
      results.nfts.length > 0 ||
      results.users.length > 0 ||
      results.tags.length > 0;

    if (!hasResults && searchQuery.trim()) {
      return (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search-outline" size={64} color={colors.textTertiary} />
          <Text style={styles.noResultsTitle}>No results found</Text>
          <Text style={styles.noResultsText}>
            We couldn't find anything matching "{searchQuery}"
          </Text>
          <TouchableOpacity
            style={styles.tryAgainButton}
            onPress={clearSearch}
          >
            <Text style={styles.tryAgainButtonText}>Try Another Search</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={[1]} // Just a dummy item to render once
        keyExtractor={() => 'results'}
        renderItem={() => (
          <View style={styles.resultsContainer}>
            {/* Dreams Section */}
            {(activeTab === 'all' || activeTab === 'dreams') && results.dreams.length > 0 && (
              <View style={styles.resultSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Dreams</Text>
                  {activeTab === 'all' && results.dreams.length > 3 && (
                    <TouchableOpacity onPress={() => setActiveTab('dreams')}>
                      <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <FlatList
                  data={activeTab === 'all' ? results.dreams.slice(0, 3) : results.dreams}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <DreamCard
                      dream={item}
                      onPress={() => navigation.navigate('DreamDetail', { dreamId: item.id })}
                    />
                  )}
                  scrollEnabled={false}
                />
              </View>
            )}

            {/* NFTs Section */}
            {(activeTab === 'all' || activeTab === 'nfts') && results.nfts.length > 0 && (
              <View style={styles.resultSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>NFTs</Text>
                  {activeTab === 'all' && results.nfts.length > 2 && (
                    <TouchableOpacity onPress={() => setActiveTab('nfts')}>
                      <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <FlatList
                  data={activeTab === 'all' ? results.nfts.slice(0, 2) : results.nfts}
                  keyExtractor={(item) => item.id}
                  horizontal={activeTab === 'all'}
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <NFTCard
                      nft={item}
                      style={activeTab === 'all' ? styles.horizontalNFTCard : {}}
                      onPress={() => navigation.navigate('NFTDetail', { tokenId: item.tokenId })}
                    />
                  )}
                  contentContainerStyle={activeTab === 'all' ? styles.horizontalList : {}}
                />
              </View>
            )}

            {/* Users Section */}
            {(activeTab === 'all' || activeTab === 'users') && results.users.length > 0 && (
              <View style={styles.resultSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Users</Text>
                  {activeTab === 'all' && results.users.length > 3 && (
                    <TouchableOpacity onPress={() => setActiveTab('users')}>
                      <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {(activeTab === 'all' ? results.users.slice(0, 3) : results.users).map((user) => (
                  <UserListItem
                    key={user.id}
                    user={user}
                    onPress={() => navigation.navigate('UserProfile', { userId: user.id })}
                  />
                ))}
              </View>
            )}

            {/* Tags Section */}
            {(activeTab === 'all' || activeTab === 'tags') && results.tags.length > 0 && (
              <View style={styles.resultSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Tags</Text>
                  {activeTab === 'all' && results.tags.length > 6 && (
                    <TouchableOpacity onPress={() => setActiveTab('tags')}>
                      <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.tagsContainer}>
                  {(activeTab === 'all' ? results.tags.slice(0, 6) : results.tags).map((tag, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.tagItem}
                      onPress={() => {
                        setSearchQuery(tag.tag);
                        handleSearch(tag.tag);
                      }}
                    >
                      <Text style={styles.tagText}>{tag.tag}</Text>
                      <Text style={styles.tagCount}>{tag.count}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search dreams, NFTs, users..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => navigation.navigate('SearchFilters')}
        >
          <Ionicons name="options-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      {renderTabs()}

      {/* Content */}
      {searchQuery.trim() ? renderResults() : renderEmptyState()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  tabsContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: colors.primaryLight,
  },
  tabText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
  },
  emptyContainer: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.text,
    marginLeft: 4,
  },
  tagCount: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    marginTop: 12,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResultsTitle: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  tryAgainButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  tryAgainButtonText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: 'white',
  },
  resultsContainer: {
    padding: 16,
  },
  resultSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.primary,
  },
  horizontalList: {
    paddingRight: 16,
  },
  horizontalNFTCard: {
    width: 220,
    marginRight: 12,
  },
});

export default SearchScreen;