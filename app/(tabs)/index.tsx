import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet, Text, View, Pressable, Dimensions, Platform, FlatList, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, interpolate } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/AppContext';
import { TOPIK_LEVELS } from '@/lib/vocabulary';
import type { Word } from '@/lib/vocabulary';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;

function WordFlashcard({ word, isBookmarked, onBookmark, showPronunciation }: {
  word: Word;
  isBookmarked: boolean;
  onBookmark: () => void;
  showPronunciation: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const flipProgress = useSharedValue(0);

  const handleFlip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = !flipped;
    setFlipped(next);
    flipProgress.value = withSpring(next ? 1 : 0, { damping: 15, stiffness: 100 });
  }, [flipped, flipProgress]);

  const speakWord = useCallback(() => {
    Speech.speak(word.korean, { language: 'ko', rate: 0.7 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [word.korean]);

  const speakExample = useCallback(() => {
    Speech.speak(word.example, { language: 'ko', rate: 0.6 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [word.example]);

  const frontStyle = useAnimatedStyle(() => ({
    opacity: interpolate(flipProgress.value, [0, 0.5, 1], [1, 0, 0]),
    transform: [{ rotateY: `${interpolate(flipProgress.value, [0, 1], [0, 180])}deg` }],
  }));

  const backStyle = useAnimatedStyle(() => ({
    opacity: interpolate(flipProgress.value, [0, 0.5, 1], [0, 0, 1]),
    transform: [{ rotateY: `${interpolate(flipProgress.value, [0, 1], [180, 360])}deg` }],
  }));

  return (
    <Pressable onPress={handleFlip} style={styles.cardContainer}>
      <Animated.View style={[styles.card, frontStyle]}>
        <View style={styles.cardBadgeRow}>
          <View style={[styles.categoryBadge, { backgroundColor: Colors.primary + '20' }]}>
            <Text style={[styles.categoryText, { color: Colors.primary }]}>{word.category}</Text>
          </View>
          <View style={styles.cardActions}>
            <Pressable onPress={(e) => { e.stopPropagation(); speakWord(); }} hitSlop={12}>
              <Ionicons name="volume-high" size={20} color={Colors.primary} />
            </Pressable>
            <Pressable onPress={(e) => { e.stopPropagation(); onBookmark(); }} hitSlop={12}>
              <Ionicons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={isBookmarked ? Colors.accent : Colors.textMuted}
              />
            </Pressable>
          </View>
        </View>
        <View style={styles.cardCenter}>
          <Text style={styles.koreanText}>{word.korean}</Text>
          {showPronunciation && (
            <Text style={styles.pronunciationText}>[{word.pronunciation}]</Text>
          )}
          <View style={[styles.posBadge, { backgroundColor: Colors.secondary + '20' }]}>
            <Text style={[styles.posText, { color: Colors.secondary }]}>{word.partOfSpeech}</Text>
          </View>
        </View>
        <View style={styles.tapHint}>
          <Ionicons name="sync-outline" size={16} color={Colors.textMuted} />
          <Text style={styles.tapHintText}>Tap to reveal meaning</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.card, styles.cardBack, backStyle]}>
        <View style={styles.cardBadgeRow}>
          <View style={[styles.categoryBadge, { backgroundColor: Colors.secondary + '20' }]}>
            <Text style={[styles.categoryText, { color: Colors.secondary }]}>Answer</Text>
          </View>
          <View style={styles.cardActions}>
            <Pressable
              onPress={(e) => { e.stopPropagation(); router.push({ pathname: '/related-words-screen', params: { wordId: word.id } }); }}
              hitSlop={12}
            >
              <Ionicons name="git-branch-outline" size={20} color={Colors.secondary} />
            </Pressable>
            <Pressable onPress={(e) => { e.stopPropagation(); onBookmark(); }} hitSlop={12}>
              <Ionicons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={isBookmarked ? Colors.accent : Colors.textMuted}
              />
            </Pressable>
          </View>
        </View>
        <View style={styles.cardCenter}>
          <Text style={styles.koreanTextSmall}>{word.korean}</Text>
          <Text style={styles.englishText}>{word.english}</Text>
        </View>
        <Pressable onPress={(e) => { e.stopPropagation(); speakExample(); }} style={styles.exampleBox}>
          <View style={{ flex: 1 }}>
            <Text style={styles.exampleKorean}>{word.example}</Text>
            <Text style={styles.exampleEnglish}>{word.exampleTranslation}</Text>
          </View>
          <Ionicons name="volume-medium" size={16} color={Colors.textMuted} />
        </Pressable>
      </Animated.View>
    </Pressable>
  );
}

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const { settings, progress, dailyState, todayWords, dayNumber, bookmarks, markWordLearned, toggleBookmark, isLoading } = useApp();
  const [currentIndex, setCurrentIndex] = useState(dailyState?.currentWordIndex || 0);
  const flatListRef = useRef<FlatList>(null);

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const topPad = insets.top + webTopInset;

  const level = TOPIK_LEVELS.find(l => l.id === settings.selectedLevel);
  const learnedCount = dailyState?.learnedWordIds?.length || 0;
  const progressPercent = todayWords.length > 0 ? (learnedCount / todayWords.length) * 100 : 0;

  const handleNext = useCallback(() => {
    if (currentIndex < todayWords.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      markWordLearned(todayWords[currentIndex].id);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      markWordLearned(todayWords[currentIndex].id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [currentIndex, todayWords, markWordLearned]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [currentIndex]);

  const renderItem = useCallback(({ item }: { item: Word }) => (
    <View style={{ width: CARD_WIDTH, marginHorizontal: 24 }}>
      <WordFlashcard
        word={item}
        isBookmarked={bookmarks.includes(item.id)}
        onBookmark={() => toggleBookmark(item.id)}
        showPronunciation={settings.showPronunciation}
      />
    </View>
  ), [bookmarks, toggleBookmark, settings.showPronunciation]);

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.dayLabel}>Day {dayNumber}</Text>
          <Text style={styles.levelLabel}>{level?.sublevel} {level?.title}</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable
            style={styles.hangeulBtn}
            onPress={() => router.push('/hangeul')}
          >
            <Text style={styles.hangeulBtnText}>ㄱ</Text>
          </Pressable>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={18} color={Colors.streak} />
            <Text style={styles.streakText}>{progress.streak}</Text>
          </View>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${Math.min(progressPercent, 100)}%` }]} />
        </View>
        <Text style={styles.progressText}>{learnedCount}/{todayWords.length}</Text>
      </View>

      <View style={styles.cardSection}>
        <FlatList
          ref={flatListRef}
          data={todayWords}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          snapToInterval={CARD_WIDTH + 48}
          decelerationRate="fast"
          getItemLayout={(_, index) => ({
            length: CARD_WIDTH + 48,
            offset: (CARD_WIDTH + 48) * index,
            index,
          })}
          initialScrollIndex={currentIndex}
        />
      </View>

      <View style={styles.navigation}>
        <Pressable
          onPress={handlePrev}
          style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
          disabled={currentIndex === 0}
        >
          <Ionicons name="chevron-back" size={28} color={currentIndex === 0 ? Colors.textMuted : Colors.text} />
        </Pressable>

        <Text style={styles.counter}>{currentIndex + 1} / {todayWords.length}</Text>

        <Pressable
          onPress={handleNext}
          style={[styles.navButton, styles.navButtonPrimary]}
        >
          {currentIndex === todayWords.length - 1 ? (
            <Ionicons name="checkmark" size={28} color="#fff" />
          ) : (
            <Ionicons name="chevron-forward" size={28} color="#fff" />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  dayLabel: {
    fontSize: 26,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  levelLabel: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hangeulBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.secondary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hangeulBtnText: {
    fontSize: 18,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.secondary,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.streak + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.streak,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.textSecondary,
    minWidth: 45,
    textAlign: 'right',
  },
  cardSection: {
    flex: 1,
    justifyContent: 'center',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 24,
    minHeight: 340,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_500Medium',
  },
  cardCenter: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  koreanText: {
    fontSize: 42,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
    textAlign: 'center',
  },
  koreanTextSmall: {
    fontSize: 28,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  pronunciationText: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  posBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  posText: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_500Medium',
  },
  englishText: {
    fontSize: 28,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.primary,
    textAlign: 'center',
  },
  exampleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  exampleKorean: {
    fontSize: 15,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.text,
  },
  exampleEnglish: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tapHintText: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textMuted,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'web' ? 100 : 100,
    paddingTop: 16,
  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonPrimary: {
    backgroundColor: Colors.primary,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  counter: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.textSecondary,
  },
});
