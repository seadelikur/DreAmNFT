// screens/HomeScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import DreamCard from '../components/DreamCard';
import { DreamService } from '../services/DreamService';
import Colors from '../constants/Colors';
import Dimensions from '../constants/Dimensions';
import SubscriptionService from '../services/SubscriptionService';

export default function HomeScreen({ navigation }) {
  const { userState } = useContext(AppContext);
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedType, setFeedType] = useState('trending'); // trending, following, newest
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    loadDreams();
    checkSubscription();
  }, [feedType]);

  const checkSubscription = async () => {
    if (userState.isAuthenticated) {
      const userSubscription = await SubscriptionService.getUserSubscription(userState.user.uid);
      setSubscription(userSubscription);
    }
  };

  const loadDreams = async () => {
    setLoading(true);
    try {
      let dreamsList;
      switch (feedType) {
        case 'following':
          dreamsList = await DreamService.getFollowingDreams(userState.user.uid);
          break;
        case 'newest':
          dreamsList = await DreamService.getDreams('newest');
          break;
        default:
          dreamsList = await DreamService.getDreams('trending');
          break;
      }
      setDreams(dreamsList);
    } catch (error) {
      console.error('Failed to load dreams:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDreams();
  };

  const handleDreamPress = (dream) => {
    navigation.navigate('DreamDetail', { dreamId: dream.id });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>DreAmNFT</Text>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('Search')}
        >
          <MaterialCommunityIcons name="magnify" size={28} color={Colors.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <MaterialCommunityIcons name="bell" size={28} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFeedTypeSelector = () => (
    <View style={styles.feedSelector}>
      <TouchableOpacity
        style={[styles.feedTypeButton, feedType === 'trending' && styles.activeFeedType]}
        onPress={() => setFeedType('trending')}
      >
        <Text style={[styles.feedTypeText, feedType === 'trending' && styles.activeFeedTypeText]}>Trending</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.feedTypeButton, feedType === 'following' && styles.activeFeedType]}
        onPress={() => setFeedType('following')}
      >
        <Text style={[styles.feedTypeText, feedType === 'following' && styles.activeFeedTypeText]}>Following</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.feedTypeButton, feedType === 'newest' && styles.activeFeedType]}
        onPress={() => setFeedType('newest')}
      >
        <Text style={[styles.feedTypeText, feedType === 'newest' && styles.activeFeedTypeText]}>Newest</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSubscriptionBanner = () => {
    if (!userState.isAuthenticated || subscription?.status !== 'free') return null;

    return (
      <TouchableOpacity
        style={styles.subscriptionBanner}
        onPress={() => navigation.navigate('Subscription')}
      >
        <MaterialCommunityIcons name="star" size={24} color={Colors.white} />
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>Upgrade to Premium</Text>
          <Text style={styles.bannerDescription}>Create more dreams, access AI features, and more!</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.white} />
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="sleep" size={64} color={Colors.gray} />
      <Text style={styles.emptyText}>No dreams found</Text>
      <Text style={styles.emptySubtext}>
        {feedType === 'following'
          ? 'Start following other dreamers to see their dreams here'
          : 'Be the first to share your dream!'}
      </Text>
      {feedType === 'following' && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate('Search', { initialTab: 'users' })}
        >
          <Text style={styles.emptyButtonText}>Find Dreamers to Follow</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderFeedTypeSelector()}
      {renderSubscriptionBanner()}

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading dreams...</Text>
        </View>
      ) : (
        <FlatList
          data={dreams}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DreamCard
              dream={item}
              onPress={() => handleDreamPress(item)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={dreams.length === 0 ? { flex: 1 } : styles.dreamsList}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('Record')}
      >
        <MaterialCommunityIcons name="microphone" size={28} color={Colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Dimensions.padding.medium,
    paddingVertical: Dimensions.padding.small
  },
  headerTitle: {
    fontSize: Dimensions.fontSize.large,
    fontWeight: 'bold',
    color: Colors.primary
  },
  headerActions: {
    flexDirection: 'row'
  },
  iconButton: {
    padding: 8,
    marginLeft: 8
  },
  feedSelector: {
    flexDirection: 'row',
    paddingHorizontal: Dimensions.padding.medium,
    marginBottom: 16
  },
  feedTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 20
  },
  activeFeedType: {
    backgroundColor: Colors.primary
  },
  feedTypeText: {
    fontSize: Dimensions.fontSize.regular,
    color: Colors.text.primary
  },
  activeFeedTypeText: {
    color: Colors.white,
    fontWeight: '500'
  },
  subscriptionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    margin: Dimensions.padding.medium,
    padding: Dimensions.padding.medium,
    borderRadius: Dimensions.borderRadius.medium
  },
  bannerTextContainer: {
    flex: 1,
    marginHorizontal: Dimensions.padding.medium
  },
  bannerTitle: {
    fontSize: Dimensions.fontSize.medium,
    fontWeight: 'bold',
    color: Colors.white
  },
  bannerDescription: {
    fontSize: Dimensions.fontSize.small,
    color: Colors.white,
    opacity: 0.9
  },
  dreamsList: {
    padding: Dimensions.padding.medium
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    fontSize: Dimensions.fontSize.medium,
    color: Colors.text.secondary
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Dimensions.padding.large
  },
  emptyText: {
    fontSize: Dimensions.fontSize.large,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: 16
  },
  emptySubtext: {
    fontSize: Dimensions.fontSize.medium,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 8
  },
  emptyButton: {
    marginTop: 24,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: Dimensions.borderRadius.medium
  },
  emptyButtonText: {
    color: Colors.white,
    fontSize: Dimensions.fontSize.medium,
    fontWeight: '500'
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Dimensions.shadows.large
  }
});