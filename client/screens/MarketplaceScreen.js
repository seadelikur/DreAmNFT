// src/screens/MarketplaceScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, fonts } from '../styles/theme';
import { useApp } from '../context/AppContext';
import MarketplaceCard from '../components/MarketplaceCard';
import EmptyState from '../components/EmptyState';
import FilterBar from '../components/FilterBar';
import { getMarketplaceItems } from '../services/firestoreService';
import { getMarketplaceFee } from '../utils/blockchainUtils';

const MarketplaceScreen = ({ navigation }) => {
  const { walletConnected, userProfile } = useApp();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [marketplaceFee, setMarketplaceFee] = useState(2.5);
  const [filterOptions, setFilterOptions] = useState({
    sortBy: 'recent', // 'recent', 'price-asc', 'price-desc', 'rarity'
    rarity: 'all', // 'all', '0', '1', '2', '3', '4' (common to legendary)
    onlyMine: false,
  });

  const loadMarketplaceItems = useCallback(async () => {
    try {
      setLoading(true);

      // Get marketplace fee
      if (walletConnected) {
        const { success, feePercentage } = await getMarketplaceFee();
        if (success) {
          setMarketplaceFee(feePercentage);
        }
      }

      // Get marketplace listings
      const { success, items } = await getMarketplaceItems(
        filterOptions,
        userProfile?.uid
      );

      if (success) {
        setMarketplaceItems(items);
      } else {
        console.error('Failed to load marketplace items');
      }
    } catch (error) {
      console.error('Error loading marketplace items:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [walletConnected, userProfile, filterOptions]);

  useFocusEffect(
    useCallback(() => {
      loadMarketplaceItems();
    }, [loadMarketplaceItems])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMarketplaceItems();
  }, [loadMarketplaceItems]);

  const handleFilterChange = (newFilters) => {
    setFilterOptions({ ...filterOptions, ...newFilters });
  };

  const navigateToItem = (item) => {
    navigation.navigate('MarketplaceItem', { item });
  };

  const renderItem = ({ item }) => (
    <MarketplaceCard
      item={item}
      onPress={() => navigateToItem(item)}
      marketplaceFee={marketplaceFee}
    />
  );

  const renderEmptyState = () => (
    <EmptyState
      icon="basket-outline"
      title="No NFTs Found"
      message="There are no NFTs currently listed in the marketplace. Check back later or be the first to list your dream NFT!"
      actionLabel="List Your Dream NFT"
      onAction={() => navigation.navigate('MyDreams')}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Dream Marketplace</Text>
      <FilterBar
        options={filterOptions}
        onChange={handleFilterChange}
        filterTypes={[
          { key: 'sortBy', label: 'Sort By' },
          { key: 'rarity', label: 'Rarity' },
          { key: 'onlyMine', label: 'My Listings' },
        ]}
      />
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading marketplace...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={marketplaceItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.listingId.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      <TouchableOpacity
        style={styles.listButton}
        onPress={() => navigation.navigate('MyDreams', { mode: 'select-to-list' })}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.listButtonText}>List NFT</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: 16,
  },
  listButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: colors.primary,
    borderRadius: 28,
    height: 56,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.darkShadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  listButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: fonts.semiBold,
    marginLeft: 8,
  },
});

export default MarketplaceScreen;