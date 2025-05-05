// screens/DreamDiaryScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Image
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { firestore, auth } from '../firebase/config';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  startAfter,
  limit,
  doc,
  updateDoc
} from 'firebase/firestore';
import { Calendar } from 'react-native-calendars';
import { format } from 'date-fns';
import DreamCard from '../components/DreamCard';

const ITEMS_PER_PAGE = 10;

const DreamDiaryScreen = ({ navigation }) => {
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'calendar'
  const [selectedDate, setSelectedDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDreams, setFilteredDreams] = useState([]);

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (currentUser) {
      if (viewMode === 'list') {
        loadDreams();
      } else {
        loadDreamDates();
      }
    }
  }, [currentUser, viewMode]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = dreams.filter(dream =>
        dream.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dream.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dream.tags?.some(tag => tag.includes(searchQuery.toLowerCase()))
      );
      setFilteredDreams(filtered);
    } else {
      setFilteredDreams(dreams);
    }
  }, [searchQuery, dreams]);

  const loadDreams = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      let dreamsQuery = query(
        collection(firestore, 'dreams'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(ITEMS_PER_PAGE)
      );

      // If a date is selected, filter by that date
      if (selectedDate) {
        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);

        dreamsQuery = query(
          collection(firestore, 'dreams'),
          where('userId', '==', currentUser.uid),
          where('createdAt', '>=', startDate),
          where('createdAt', '<=', endDate),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(dreamsQuery);

      if (snapshot.empty) {
        setDreams([]);
        setHasMore(false);
      } else {
        const dreamsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }));

        setDreams(dreamsData);
        setFilteredDreams(dreamsData);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(!selectedDate && snapshot.docs.length === ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.error('Error loading dreams:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreDreams = async () => {
    if (!hasMore || loadingMore || !lastVisible || selectedDate) return;

    try {
      setLoadingMore(true);

      const dreamsQuery = query(
        collection(firestore, 'dreams'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(ITEMS_PER_PAGE)
      );

      const snapshot = await getDocs(dreamsQuery);

      if (!snapshot.empty) {
        const moreDreamsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }));

        setDreams([...dreams, ...moreDreamsData]);
        setFilteredDreams([...filteredDreams, ...moreDreamsData]);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more dreams:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const loadDreamDates = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      const dreamsQuery = query(
        collection(firestore, 'dreams'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(dreamsQuery);

      if (!snapshot.empty) {
        const dates = {};

        snapshot.docs.forEach(doc => {
          const dream = doc.data();
          if (dream.createdAt) {
            const dateStr = format(dream.createdAt.toDate(), 'yyyy-MM-dd');

            // Mark dates with dreams
            dates[dateStr] = {
              marked: true,
              dotColor: dream.isNFT ? '#6200ee' : '#4caf50'
            };
          }
        });

        setMarkedDates(dates);
      }
    } catch (error) {
      console.error('Error loading dream dates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
    setViewMode('list');

    // Load dreams for the selected date
    setTimeout(() => loadDreams(), 100);
  };

  const clearDateFilter = () => {
    setSelectedDate(null);
    loadDreams();
  };

  const handleSearchClear = () => {
    setSearchQuery('');
  };

  const renderItem = ({ item }) => (
    <DreamCard
      dream={item}
      onPress={() => navigation.navigate('DreamDetail', { dreamId: item.id })}
    />
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="sleep" size={60} color="#ccc" />
      <Text style={styles.emptyText}>
        {selectedDate
          ? `No dreams recorded on ${format(new Date(selectedDate), 'MMMM d, yyyy')}`
          : 'No dreams recorded yet'
        }
      </Text>
      <Text style={styles.emptySubtext}>
        {selectedDate
          ? 'Try selecting a different date or clear the filter'
          : 'Start recording your dreams to build your dream diary'
        }
      </Text>

      {selectedDate && (
        <TouchableOpacity
          style={styles.clearFilterButton}
          onPress={clearDateFilter}
        >
          <Text style={styles.clearFilterText}>Clear Date Filter</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search your dreams..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity style={styles.clearButton} onPress={handleSearchClear}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : (
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          )}
        </View>

        <TouchableOpacity
          style={styles.viewModeButton}
          onPress={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
        >
          <Ionicons
            name={viewMode === 'list' ? 'calendar-outline' : 'list-outline'}
            size={24}
            color="#6200ee"
          />
        </TouchableOpacity>
      </View>

      {selectedDate && viewMode === 'list' && (
        <View style={styles.dateFilterContainer}>
          <Text style={styles.dateFilterText}>
            Showing dreams from {format(new Date(selectedDate), 'MMMM d, yyyy')}
          </Text>
          <TouchableOpacity onPress={clearDateFilter}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      {viewMode === 'calendar' ? (
        <View style={styles.calendarContainer}>
          <Calendar
            markedDates={markedDates}
            onDayPress={handleDateSelect}
            theme={{
              selectedDayBackgroundColor: '#6200ee',
              todayTextColor: '#6200ee',
              arrowColor: '#6200ee',
            }}
          />

          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4caf50' }]} />
              <Text style={styles.legendText}>Regular Dream</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#6200ee' }]} />
              <Text style={styles.legendText}>NFT Dream</Text>
            </View>
          </View>

          <Text style={styles.calendarHint}>
            Tap on a date to view dreams recorded on that day
          </Text>
        </View>
      ) : loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      ) : (
        <FlatList
          data={filteredDreams}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMoreDreams}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmptyComponent}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                style={styles.loadingMore}
                size="small"
                color="#6200ee"
              />
            ) : null
          }
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('RecordDream')}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
  },
  searchIcon: {
    marginLeft: 6,
  },
  clearButton: {
    padding: 6,
  },
  viewModeButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  dateFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f9f5ff',
  },
  dateFilterText: {
    fontSize: 14,
    color: '#6200ee',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  loadingMore: {
    paddingVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  clearFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  clearFilterText: {
    fontSize: 14,
    color: '#6200ee',
    fontWeight: '600',
  },
  calendarContainer: {
    padding: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
  calendarHint: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginTop: 16,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});

export default DreamDiaryScreen;