// src/components/Toast.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../styles/theme';
import { useApp } from '../context/AppContext';

const Toast = () => {
  const { toastConfig, hideToast } = useApp();
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (toastConfig.visible) {
      // Slide in from top
      Animated.spring(translateY, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true
      }).start();
    } else {
      // Slide out to top
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  }, [toastConfig.visible]);

  if (!toastConfig.visible) return null;

  // Determine icon and color based on toast type
  const getIconConfig = () => {
    switch (toastConfig.type) {
      case 'success':
        return {
          name: 'checkmark-circle',
          color: colors.success,
          backgroundColor: colors.successLight
        };
      case 'error':
        return {
          name: 'close-circle',
          color: colors.error,
          backgroundColor: colors.errorLight
        };
      case 'warning':
        return {
          name: 'warning',
          color: colors.warning,
          backgroundColor: colors.warningLight
        };
      case 'info':
      default:
        return {
          name: 'information-circle',
          color: colors.info,
          backgroundColor: colors.infoLight
        };
    }
  };

  const { name, color, backgroundColor } = getIconConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }] }
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor }]}>
        <Ionicons name={name} size={24} color={color} />
      </View>

      <View style={styles.contentContainer}>
        {toastConfig.title ? (
          <Text style={styles.title}>{toastConfig.title}</Text>
        ) : null}
        <Text style={styles.message}>{toastConfig.message}</Text>
      </View>

      <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
        <Ionicons name="close" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: colors.card,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  closeButton: {
    padding: 5,
  },
});

export default Toast;