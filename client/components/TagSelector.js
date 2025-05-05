// components/TagSelector.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TagSelector = ({ selectedTags = [], onTagsChange, maxTags = 5, suggestedTags = [] }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const commonTags = [
    'flying', 'falling', 'chase', 'water', 'lucid',
    'nightmare', 'recurring', 'childhood', 'family',
    'animals', 'fantasy', 'adventure', 'romance', 'scary'
  ];

  const handleAddTag = (tag) => {
    const cleanTag = tag.trim().toLowerCase();

    if (!cleanTag) return;
    if (selectedTags.includes(cleanTag)) return;
    if (selectedTags.length >= maxTags) return;

    onTagsChange([...selectedTags, cleanTag]);
    setInputValue('');
  };

  const handleRemoveTag = (tagToRemove) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleInputSubmit = () => {
    if (inputValue.trim()) {
      handleAddTag(inputValue);
    }
  };

  const filteredSuggestions = [...new Set([
    ...suggestedTags,
    ...commonTags
  ])].filter(tag =>
    !selectedTags.includes(tag) &&
    tag.includes(inputValue.toLowerCase())
  ).slice(0, 10);

  return (
    <View style={styles.container}>
      <View style={styles.tagsContainer}>
        {selectedTags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>#{tag}</Text>
            <TouchableOpacity
              style={styles.removeTagButton}
              onPress={() => handleRemoveTag(tag)}
            >
              <Ionicons name="close" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {selectedTags.length < maxTags && (
        <>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={selectedTags.length === 0 ? "Add tags (e.g. flying, nightmare)" : "Add another tag..."}
              value={inputValue}
              onChangeText={(text) => {
                setInputValue(text);
                setShowSuggestions(!!text);
              }}
              onSubmitEditing={handleInputSubmit}
              returnKeyType="done"
              maxLength={20}
            />
            {inputValue.trim() && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleInputSubmit}
              >
                <Ionicons name="add" size={18} color="#6200ee" />
              </TouchableOpacity>
            )}
          </View>

          {(showSuggestions && filteredSuggestions.length > 0) && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.suggestionsContainer}
              contentContainerStyle={styles.suggestionsList}
            >
              {filteredSuggestions.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionTag}
                  onPress={() => {
                    handleAddTag(tag);
                    setShowSuggestions(false);
                  }}
                >
                  <Text style={styles.suggestionText}>#{tag}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </>
      )}

      <Text style={styles.helperText}>
        {selectedTags.length} of {maxTags} tags used
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#fff',
    marginRight: 4,
  },
  removeTagButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  addButton: {
    padding: 6,
  },
  suggestionsContainer: {
    marginBottom: 12,
  },
  suggestionsList: {
    paddingVertical: 4,
  },
  suggestionTag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  suggestionText: {
    color: '#6200ee',
    fontSize: 14,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
  },
});

export default TagSelector;