import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/colors';

const ONBOARDING_KEY = '@daily_korean_onboarding_complete';

interface BulletPoint {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}

interface OnboardingPage {
  id: string;
  tagline: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  description: string;
  bullets: BulletPoint[];
  showButton?: boolean;
}

const PAGES: OnboardingPage[] = [
  {
    id: '1',
    tagline: 'Your Daily Korean Habit',
    title: '20 Words a Day\nThat Actually Stick',
    icon: 'flash',
    iconColor: Colors.primary,
    description:
      'Not hundreds of random words. Just 20 curated, high-frequency words daily — the ones native speakers actually use.',
    bullets: [
      { icon: 'time-outline', text: 'Only 10-15 minutes a day' },
      { icon: 'trending-up-outline', text: 'Level-aware progression (TOPIK 1-6)' },
      { icon: 'chatbubble-outline', text: 'Built for real conversations, not just tests' },
    ],
  },
  {
    id: '2',
    tagline: 'Beyond Vocabulary Lists',
    title: 'Word Network:\nSee How Korean Connects',
    icon: 'git-network',
    iconColor: Colors.secondary,
    description:
      'Korean isn\'t about single words — it\'s about patterns. Every word links to synonyms, collocations, and real expressions Koreans use.',
    bullets: [
      { icon: 'link-outline', text: 'Synonyms, antonyms & collocations' },
      { icon: 'layers-outline', text: 'See words inside real phrase patterns' },
      { icon: 'bulb-outline', text: 'Your brain stores Korean as a living system' },
    ],
  },
  {
    id: '3',
    tagline: 'Learn in Context',
    title: 'Sentences & Scripts,\nNot Just Flashcards',
    icon: 'document-text',
    iconColor: Colors.accent,
    description:
      'Every word set is reinforced with natural Korean sentences. Read, listen, shadow, and repeat — feel how the language flows.',
    bullets: [
      { icon: 'volume-high-outline', text: 'Audio with slow & normal speed' },
      { icon: 'mic-outline', text: 'Record and compare your pronunciation' },
      { icon: 'create-outline', text: 'Fill-in-blank & sentence building practice' },
    ],
  },
  {
    id: '4',
    tagline: 'Made for K-Culture Fans',
    title: 'Learn Through\nK-Drama, K-Pop & More',
    icon: 'sparkles',
    iconColor: '#FF6B6B',
    description:
      'Content organized by real-life and K-culture themes. Follow structured courses or jump into your current obsession.',
    bullets: [
      { icon: 'film-outline', text: 'K-Drama scenes & emotional expressions' },
      { icon: 'musical-notes-outline', text: 'K-Pop fan culture & lyrics vocabulary' },
      { icon: 'restaurant-outline', text: 'Ordering coffee, travel, daily small talk' },
    ],
  },
  {
    id: '5',
    tagline: 'Ready to Start?',
    title: 'Your Bridge Into\nReal Korean',
    icon: 'rocket',
    iconColor: Colors.streak,
    description:
      'From "I like K-culture" to "I can live in this language" — one smart set of 20 words at a time.',
    bullets: [
      { icon: 'shield-checkmark-outline', text: 'Smart spaced repetition keeps it in memory' },
      { icon: 'trophy-outline', text: 'XP, levels & achievement badges' },
      { icon: 'flag-outline', text: 'Daily missions to keep you motivated' },
    ],
    showButton: true,
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width: screenWidth } = useWindowDimensions();

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const handleGetStarted = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(tabs)');
  };

  const handleSkip = () => {
    scrollRef.current?.scrollTo({ x: screenWidth * (PAGES.length - 1), animated: true });
  };

  const handleNext = () => {
    if (currentIndex < PAGES.length - 1) {
      scrollRef.current?.scrollTo({ x: screenWidth * (currentIndex + 1), animated: true });
    }
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / screenWidth);
    if (index !== currentIndex && index >= 0 && index < PAGES.length) {
      setCurrentIndex(index);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      {currentIndex < PAGES.length - 1 && (
        <Pressable style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      )}

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {PAGES.map((item) => (
          <View key={item.id} style={[styles.page, { width: screenWidth }]}>
            <Text style={[styles.tagline, { color: item.iconColor }]}>{item.tagline}</Text>

            <View style={[styles.iconContainer, { backgroundColor: item.iconColor + '15' }]}>
              <Ionicons name={item.icon} size={56} color={item.iconColor} />
            </View>

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>

            <View style={styles.bulletsContainer}>
              {item.bullets.map((bullet, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <View style={[styles.bulletIcon, { backgroundColor: item.iconColor + '12' }]}>
                    <Ionicons name={bullet.icon} size={16} color={item.iconColor} />
                  </View>
                  <Text style={styles.bulletText}>{bullet.text}</Text>
                </View>
              ))}
            </View>

            {item.showButton && (
              <Pressable style={styles.getStartedBtn} onPress={handleGetStarted}>
                <Text style={styles.getStartedText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={20} color="#1A1A1A" />
              </Pressable>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomBar}>
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

        {currentIndex < PAGES.length - 1 && (
          <Pressable style={styles.nextBtn} onPress={handleNext}>
            <Ionicons name="arrow-forward" size={22} color="#1A1A1A" />
          </Pressable>
        )}
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
  scrollView: {
    flex: 1,
  },
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  tagline: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_700Bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },
  description: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  bulletsContainer: {
    width: '100%',
    gap: 12,
    paddingHorizontal: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bulletIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bulletText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.text,
    flex: 1,
  },
  getStartedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
    marginTop: 32,
  },
  getStartedText: {
    fontSize: 18,
    fontFamily: 'NotoSansKR_700Bold',
    color: '#1A1A1A',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  dotInactive: {
    backgroundColor: Colors.surface,
    width: 6,
  },
  nextBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
