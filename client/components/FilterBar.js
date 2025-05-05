import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/theme';

const FILTER_OPTIONS = [
  { id: 'all', label: 'All Dreams' },
  { id: 'recent', label: 'Recent' },
  { id: 'popular', label: 'Popular' },
  { id: 'featured', label: 'Featured' }
];

export default function FilterBar({ activeFilter, onFilterChange }) {
  return (
    <View style={styles.container}>
      {FILTER_OPTIONS.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.filterButton,
            activeFilter === option.id && styles.activeFilter
          ]}
          onPress={() => onFilterChange(option.id)}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === option.id && styles.activeFilterText
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8
  },
  activeFilter: {
    backgroundColor: colors.primary
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500'
  },
  activeFilterText: {
    color: '#fff'
  }
});