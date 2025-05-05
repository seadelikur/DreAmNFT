// screens/DreamArtGalleryScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  Dimensions,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { firebase, firestore } from '../firebase/config';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');
const ITEM_WIDTH = width / 2 - 24;

const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'adventure', name: 'Adventure' },
  { id: 'fantasy', name: 'Fantasy' },
  { id: 'horror', name: 'Horror' },
  { id: 'abstract', name: 'Abstract' },
  { id: 'surreal', name: 'Surreal' },
  { id: 'cosmic', name: 'Cosmic' }
];

const DreamArtGalleryScreen = ({ navigation, route }) => {
  const [arts, setArts] = useState([]);
  const [filteredArts, setFilteredArts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedArt, setSelectedArt] = useState(null);

  useEffect(() => {
    fetchDreamArts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedCategory, arts]);

  const fetchDreamArts = async () => {
    try {
      setLoading(true);

      // For demo purposes, we'll use mock data

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Mock art data
      const mockArts = Array(20).fill().map((_, index) => ({
        id: `art-${index + 1}`,
        title: getRandomArtTitle(),
        description: getRandomArtDescription(),
        imageUrl: `https://picsum.photos/500/500?random=${index + 50}`,
        category: getRandomCategory(),
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        creator: {
          id: `user-${Math.floor(Math.random() * 10) + 1}`,
          name: getRandomUsername(),
          avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 50) + 1}.jpg`
        },
        dreamPrompt: getRandomDreamPrompt(),
        likes: Math.floor(Math.random() * 100),
        minted: Math.random() > 0.7,
        tags: getRandomTags(),
        aiModel: getRandomAIModel()
      }));

      setArts(mockArts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dream arts:', error);
      setLoading(false);
    }
  };

  const getRandomArtTitle = () => {
    const titles = [
      'Floating Islands',
      'The Dream Weaver',
      'Cosmic Ocean',
      'Forest of Whispers',
      'Gates of Perception',
      'Ethereal Journey',
      'Beyond the Void',
      'Crystal Caverns',
      'Dance of Shadows',
      'Timeless Memory'
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  };

  const getRandomArtDescription = () => {
    const descriptions = [
      'AI-generated visualization of my dream about floating islands in a pastel sky.',
      'A surreal interpretation of meeting my subconscious mind personified.',
      'Generated from my recurring dream of swimming through galaxies and nebulae.',
      'My dream of an ancient forest where the trees communicate through whispers.',
      'Visual representation of crossing the threshold between waking and dreaming.',
      'A journey through abstract landscapes of my unconscious mind.',
      'Generated from my dream of staring into an infinite cosmic abyss.',
      'My lucid dream of exploring caves made of living crystal.',
      'A visualization of shadowy figures that appeared in my dream, dancing in rhythm.',
      'AI interpretation of a memory that feels both ancient and timeless.'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };

  const getRandomUsername = () => {
    const adjectives = ['Dream', 'Cosmic', 'Lucid', 'Astral', 'Night', 'Mystic'];
    const nouns = ['Explorer', 'Wanderer', 'Traveler', 'Voyager', 'Walker', 'Dreamer'];
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}`;
  };

  const getRandomCategory = () => {
    const categories = ['adventure', 'fantasy', 'horror', 'abstract', 'surreal', 'cosmic'];
    return categories[Math.floor(Math.random() * categories.length)];
  };

  const getRandomDreamPrompt = () => {
    const prompts = [
      'I was flying over floating islands in a pastel-colored sky',
      'I met a being who claimed to be my subconscious mind',
      'I was swimming through space, touching stars and nebulae',
      'I was in an ancient forest where trees whispered secrets',
      'I stood at a threshold between reality and dream',
      'I traveled through landscapes that shifted with my emotions',
      'I stood at the edge of a cosmic abyss that seemed alive',
      'I explored caves with walls made of living crystal',
      'Shadowy figures surrounded me, dancing in perfect harmony',
      'I relived a memory that felt ancient yet familiar'
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  };

  const getRandomTags = () => {
    const allTags = ['flying', 'space', 'mystical', 'nature', 'abstract', 'cosmic', 'surreal', 'water', 'ancient', 'consciousness'];
    const numTags = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...allTags].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numTags);
  };

  const getRandomAIModel = () => {
    const models = ['DreamForge AI', 'Midjourney v5', 'DALL-E 3', 'Stable Diffusion XL'];
    return models[Math.floor(Math.random() * models.length)];
  };

  const applyFilters = () => {
    if (!arts.length) return;

    let filtered = [...arts];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(art =>
        art.title.toLowerCase().includes(query) ||
        art.description.toLowerCase().includes(query) ||
        art.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(art => art.category === selectedCategory);
    }

    // Sort by newest first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredArts(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDreamArts();
    setRefreshing(false);
  };

  const handleArtPress = (art) => {
    setSelectedArt(art);
    setModalVisible(true);
  };

  const handleGenerateNew = () => {
    navigation.navigate('AIGeneratedDreamArtScreen');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.artItem}
      onPress={() => handleArtPress(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.artImage}
        resizeMode="cover"
      />
      <View style={styles.artInfo}>
        <Text style={styles.artTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.artMeta}>
          {item.minted && (
            <View style={styles.mintedBadge}>
              <Text style={styles.mintedText}>NFT</Text>
            </View>
          )}
          <View style={styles.likesContainer}>
            <Ionicons name="heart" size={12} color="#ff4081" />
            <Text style={styles.likesText}>{item.likes}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.selectedCategoryItem
      ]}
      onPress={() => handleCategorySelect(item.id)}
    >
      <Text style={[
        styles.categoryText,
        selectedCategory === item.id && styles.selectedCategoryText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading dream art gallery...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dream Art Gallery</Text>
        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGenerateNew}
        >
          <Ionicons name="add-circle" size={24} color="#6200ee" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search dream art..."
            placeholderTextColor="#999"
          />
          {searchQuery ? (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          data={CATEGORIES}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <FlatList
        data={filteredArts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.artsList}
        columnWrapperStyle={styles.row}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Art Found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search or generate your first dream art.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleGenerateNew}
            >
              <Text style={styles.emptyButtonText}>Generate Dream Art</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        {selectedArt && (
          <View style={styles.modalContainer}>
            <BlurView intensity={90} style={StyleSheet.absoluteFill} tint="dark" />

            <View style={styles.modalContent}>
              <ScrollView
                style={styles.modalScrollView}
                showsVerticalScrollIndicator={false}
              >
                <Image
                  source={{ uri: selectedArt.imageUrl }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />

                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>{selectedArt.title}</Text>
                    <Text style={styles.modalDate}>
                      Created on {formatDate(selectedArt.createdAt)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.modalDescription}>
                  {selectedArt.description}
                </Text>

                <Text style={styles.sectionTitle}>Dream Prompt</Text>
                <View style={styles.promptContainer}>
                  <Text style={styles.promptText}>
                    "{selectedArt.dreamPrompt}"
                  </Text>
                </View>

                <Text style={styles.sectionTitle}>Details</Text>
                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Category</Text>
                    <Text style={styles.detailValue}>
                      {selectedArt.category.charAt(0).toUpperCase() + selectedArt.category.slice(1)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>AI Model</Text>
                    <Text style={styles.detailValue}>{selectedArt.aiModel}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Creator</Text>
                    <Text style={styles.detailValue}>{selectedArt.creator.name}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>NFT Status</Text>
                    <Text style={[
                      styles.detailValue,
                      { color: selectedArt.minted ? '#4caf50' : '#f44336' }
                    ]}>
                      {selectedArt.minted ? 'Minted' : 'Not Minted'}
                    </Text>
                  </View>
                </View>

                {selectedArt.tags.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Tags</Text>
                    <View style={styles.tagsContainer}>
                      {selectedArt.tags.map((tag, index) => (
                        <View key={index} style={styles.tagItem}>
                          <Text style={styles.tagText}>#{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}

                <View style={styles.actionContainer}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      // Share functionality
                      setModalVisible(false);
                    }}
                  >
                    <Ionicons name="share-outline" size={20} color="#6200ee" />
                    <Text style={styles.actionButtonText}>Share</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      // Download functionality
                      setModalVisible(false);
                    }}
                  >
                    <Ionicons name="download-outline" size={20} color="#6200ee" />
                    <Text style={styles.actionButtonText}>Download</Text>
                  </TouchableOpacity>

                  {!selectedArt.minted && (
                    <TouchableOpacity
                      style={styles.mintButton}
                      onPress={() => {
                        setModalVisible(false);
                        navigation.navigate('MintNFT', { artId: selectedArt.id });
                      }}
                    >
                      <MaterialCommunityIcons name="ethereum" size={20} color="#fff" />
                      <Text style={styles.mintButtonText}>Mint as NFT</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleGenerateNew}
      >
        <LinearGradient
          colors={['#8e2de2', '#4a00e0']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  generateButton: {
    padding: 8,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  categoriesContainer: {
    marginBottom: 8,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  selectedCategoryItem: {
    backgroundColor: '#f0e6ff',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  selectedCategoryText: {
    color: '#6200ee',
    fontWeight: '500',
  },
  artsList: {
    padding: 12,
  },
  row: {
    justifyContent: 'space-between',
  },
  artItem: {
    width: ITEM_WIDTH,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  artImage: {
    width: '100%',
    height: ITEM_WIDTH,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  artInfo: {
    padding: 12,
  },
  artTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  artMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mintedBadge: {
    backgroundColor: '#e6f7ed',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mintedText: {
    fontSize: 10,
    color: '#4caf50',
    fontWeight: 'bold',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.85,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalScrollView: {
    maxHeight: height * 0.85,
  },
  modalImage: {
    width: '100%',
    height: width * 0.9,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  modalDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  promptContainer: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#6200ee',
  },
  promptText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  detailsContainer: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tagItem: {
    backgroundColor: '#f0e6ff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#6200ee',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0e6ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#6200ee',
    fontWeight: '500',
    marginLeft: 4,
  },
  mintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6200ee',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  mintButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    marginLeft: 4,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DreamArtGalleryScreen;