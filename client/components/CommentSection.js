// components/CommentSection.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firestore, auth } from '../firebase/config';
import { collection, addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

const CommentSection = ({ dreamId, comments, navigation }) => {
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const currentUser = auth.currentUser;

  const handleAddComment = async () => {
    if (!commentText.trim() || !currentUser) return;

    setSubmitting(true);
    try {
      const commentData = {
        text: commentText.trim(),
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        userAvatar: currentUser.photoURL,
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(firestore, 'dreams', dreamId, 'comments'), commentData);
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = ({ item }) => {
    return (
      <View style={styles.commentItem}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: item.userId })}>
          <Image
            source={item.userAvatar ? { uri: item.userAvatar } : require('../assets/default-avatar.png')}
            style={styles.avatar}
          />
        </TouchableOpacity>
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: item.userId })}>
              <Text style={styles.userName}>{item.userName}</Text>
            </TouchableOpacity>
            <Text style={styles.timestamp}>
              {item.timestamp ? formatDistanceToNow(item.timestamp, { addSuffix: true }) : 'Just now'}
            </Text>
          </View>
          <Text style={styles.commentText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Comments</Text>

      {comments.length > 0 ? (
        <>
          <FlatList
            data={comments.slice(0, 3)}
            renderItem={renderComment}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />

          {comments.length > 3 && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('Comments', { dreamId })}
            >
              <Text style={styles.viewAllText}>View all {comments.length} comments</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <Text style={styles.noComments}>No comments yet. Be the first to comment!</Text>
      )}

      {currentUser ? (
        <View style={styles.commentForm}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          {submitting ? (
            <ActivityIndicator size="small" color="#6200ee" style={styles.submitIcon} />
          ) : (
            <TouchableOpacity
              style={[styles.submitButton, !commentText.trim() && styles.disabledButton]}
              onPress={handleAddComment}
              disabled={!commentText.trim() || submitting}
            >
              <Ionicons name="send" size={20} color={commentText.trim() ? "#6200ee" : "#ccc"} />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity
          style={styles.loginPrompt}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginPromptText}>Login to add comments</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontWeight: '600',
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  viewAllButton: {
    padding: 12,
    alignItems: 'center',
  },
  viewAllText: {
    color: '#6200ee',
    fontWeight: '600',
  },
  noComments: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 16,
  },
  commentForm: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  submitButton: {
    marginLeft: 8,
    padding: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  loginPrompt: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  loginPromptText: {
    color: '#6200ee',
    fontWeight: '600',
  },
});

export default CommentSection;