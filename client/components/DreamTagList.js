// components/DreamTagList.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const DreamTagList = ({ tags, onTagPress, style }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.container, style]}
      contentContainerStyle={styles.contentContainer}
    >
      {tags.map((tag, index) => (
        <TouchableOpacity
          key={index}
          style={styles.tagButton}
          onPress={() => onTagPress ? onTagPress(tag) : null}
          disabled={!onTagPress}
        >
          <Text style={styles.tagText}>#{tag}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  contentContainer: {
    paddingVertical: 4,
  },
  tagButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#6200ee',
  },
});

export default DreamTagList;