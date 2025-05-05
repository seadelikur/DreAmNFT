// src/screens/OnboardingScreen.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../styles/theme';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: '1',
    title: 'Record Your Dreams',
    description: 'Capture your dreams through text, audio, or images as soon as you wake up. Our AI helps validate authentic dream experiences.',
    image: require('../assets/images/onboarding-record.png'),
    backgroundColor: '#6C63FF20'
  },
  {
    id: '2',
    title: 'Transform Dreams to NFTs',
    description: 'Mint your dreams as unique NFTs on the blockchain. Each dream is assigned a rarity based on content and emotional intensity.',
    image: require('../assets/images/onboarding-nft.png'),
    backgroundColor: '#4ECDC420'
  },
  {
    id: '3',
    title: 'Explore Dream Stations',
    description: 'Discover curated collections of dreams grouped by themes and experiences. Create your own stations to share with the community.',
    image: require('../assets/images/onboarding-stations.png'),
    backgroundColor: '#FF6B6B20'
  },
  {
    id: '4',
    title: 'AI Dream Analysis',
    description: 'Gain insights into your dream patterns with AI-powered analysis. Understand emotions, recurring themes, and hidden meanings.',
    image: require('../assets/images/onboarding-analysis.png'),
    backgroundColor: '#1A535C20'
  },
  {
    id: '5',
    title: 'Connect & Share',
    description: 'Join a community of dreamers. Follow others, like and comment on dreams, and build your collection of dream NFTs.',
    image: require('../assets/images/onboarding-social.png'),
    backgroundColor: '#FFE66D20'
  }
];

const OnboardingScreen = () => {
  const navigation = useNavigation();
  const { completeOnboarding } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = (index) => {
    if (slidesRef.current) {
      slidesRef.current.scrollToIndex({ index });
    }
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      scrollTo(currentIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    completeOnboarding();
    navigation.reset({
      index: 0,
      routes: [{ name: 'AuthStack' }],
    });
  };

  const renderDot = ({ index }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    const dotWidth = scrollX.interpolate({
      inputRange,
      outputRange: [8, 20, 8],
      extrapolate: 'clamp'
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 1, 0.3],
      extrapolate: 'clamp'
    });

    return (
      <Animated.View
        style={[
          styles.dot,
          {
            width: dotWidth,
            opacity
          }
        ]}
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleFinish}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        data={onboardingData}
        renderItem={({ item }) => (
          <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
            <Image source={item.image} style={styles.image} />
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />

      <View style={styles.dotsContainer}>
        {onboardingData.map((_, index) => renderDot({ index }))}
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>
            {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons
            name={currentIndex === onboardingData.length - 1 ? 'checkbox-outline' : 'arrow-forward'}
            size={20}
            color="#FFFFFF"
            style={styles.buttonIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  skipText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: width * 0.8,
    height: height * 0.4,
    resizeMode: 'contain',
    marginBottom: 40,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginHorizontal: 4,
  },
  bottomContainer: {
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: '#FFFFFF',
  },
  buttonIcon: {
    marginLeft: 8,
  },
});

export default OnboardingScreen;