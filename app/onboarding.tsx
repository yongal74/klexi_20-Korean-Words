import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  Platform,
  Dimensions,
  ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_KEY = '@daily_korean_onboarding_complete';

interface OnboardingPage {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  description: string;
  showButton?: boolean;
}

const PAGES: OnboardingPage[] = [
  {
    id: '1',
    title: 'Welcome to Daily Korean',
    icon: 'book',
    iconColor: Colors.primary,
    description:
      'Master Korean with daily vocabulary, quizzes, and cultural lessons. 7,200+ words across 6 TOPIK levels.',
  },
  {
    id: '2',
    title: 'Smart Learning System',
    icon: 'flash',
    iconColor: Colors.secondary,
    description:
      'Spaced repetition remembers what you know. Focus on words that need practice. Track progress with XP and levels.',
  },
  {
    id: '3',
    title: 'Powerful Practice Tools',
    icon: 'construct',
    iconColor: Colors.accent,
    description:
      'Sentence building, pronunciation recording, daily missions, K-Culture themes, and more — all in one app.',
  },
  {
    id: '4',
    title: 'Start Your Journey',
    icon: 'rocket',
    iconColor: Colors.streak,
    description:
      'Choose your TOPIK level, set your daily goal, and begin learning Korean today!',
    showButton: true,
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      if (value === 'true') {
        router.replace('/(tabs)');
      }
    });
  }, []);

  const handleGetStarted = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(tabs)');
  };

  const handleSkip = () => {
    flatListRef.current?.scrollToIndex({ index: 3, animated: true });
  };

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderPage = ({ item }: { item: OnboardingPage }) => (
    <View style={[styles.page, { width: SCREEN_WIDTH }]}>
      <View style={[styles.iconContainer, { backgroundColor: item.iconColor + '18' }]}>
        <Ionicons name={item.icon} size={80} color={item.iconColor} />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
      {item.showButton && (
        <Pressable style={styles.getStartedBtn} onPress={handleGetStarted}>
          <Text style={styles.getStartedText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="#1A1A1A" />
        </Pressable>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      {currentIndex < 3 && (
        <Pressable style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      )}

      <FlatList
        ref={flatListRef}
        data={PAGES}
        renderItem={renderPage}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      <View style={styles.dotsContainer}>
        {PAGES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  skipBtn: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 67 + 16 : 56,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.textSecondary,
  },
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  getStartedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
    marginTop: 40,
  },
  getStartedText: {
    fontSize: 18,
    fontFamily: 'NotoSansKR_700Bold',
    color: '#1A1A1A',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  dotInactive: {
    backgroundColor: Colors.surface,
  },
});
