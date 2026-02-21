import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet, Text, View, Pressable, Dimensions, Platform, FlatList, ActivityIndicator, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import PremiumGate from '@/components/PremiumGate';
import { useApp } from '@/lib/AppContext';
import { TOPIK_LEVELS } from '@/lib/vocabulary';
import type { Word } from '@/lib/vocabulary';
import { detectGrammarPatterns } from '@/lib/grammar-patterns';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;

function PronunciationBreakdown({ pronunciation }: { pronunciation: string }) {
  const syllables = pronunciation.split('-');
  return (
    <View style={styles.breakdownRow}>
      {syllables.map((s, i) => (
        <View key={i} style={styles.syllableChip}>
          <Text style={styles.syllableText}>{s}</Text>
        </View>
      ))}
    </View>
  );
}

function WordFlashcard({ word, isBookmarked, onBookmark, showPronunciation }: {
  word: Word;
  isBookmarked: boolean;
  onBookmark: () => void;
  showPronunciation: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const flipProgress = useSharedValue(0);

  const handleFlip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = !flipped;
    setFlipped(next);
    setShowBreakdown(false);
    flipProgress.value = withSpring(next ? 1 : 0, { damping: 15, stiffness: 100 });
  }, [flipped, flipProgress]);

  const speakWord = useCallback((rate: number = 0.85) => {
    Speech.speak(word.korean, { language: 'ko-KR', rate, pitch: 1.0 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [word.korean]);

  const speakSlow = useCallback(() => {
    Speech.speak(word.korean, { language: 'ko-KR', rate: 0.5, pitch: 1.0 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [word.korean]);

  const speakRepeat = useCallback(() => {
    Speech.speak(word.korean, { language: 'ko-KR', rate: 0.85, pitch: 1.0, onDone: () => {
      setTimeout(() => Speech.speak(word.korean, { language: 'ko-KR', rate: 0.85, pitch: 1.0 }), 500);
    }});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [word.korean]);

  const speakExample = useCallback(() => {
    Speech.speak(word.example, { language: 'ko-KR', rate: 0.8, pitch: 1.0 });
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
            <Pressable onPress={(e) => { e.stopPropagation(); speakWord(); }} hitSlop={12} testID="speak-word">
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
            <Pressable onPress={(e) => { e.stopPropagation(); setShowBreakdown(!showBreakdown); }}>
              <Text style={styles.pronunciationText}>[{word.pronunciation}]</Text>
            </Pressable>
          )}
          {showPronunciation && showBreakdown && (
            <PronunciationBreakdown pronunciation={word.pronunciation} />
          )}
          <View style={[styles.posBadge, { backgroundColor: Colors.secondary + '20' }]}>
            <Text style={[styles.posText, { color: Colors.secondary }]}>{word.partOfSpeech}</Text>
          </View>
        </View>
        <View style={styles.ttsRow}>
          <Pressable onPress={(e) => { e.stopPropagation(); speakSlow(); }} style={styles.ttsChip}>
            <Ionicons name="play-back" size={14} color={Colors.textSecondary} />
            <Text style={styles.ttsChipText}>Slow</Text>
          </Pressable>
          <Pressable onPress={(e) => { e.stopPropagation(); speakRepeat(); }} style={styles.ttsChip}>
            <Ionicons name="repeat" size={14} color={Colors.textSecondary} />
            <Text style={styles.ttsChipText}>Repeat</Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          <View style={styles.tapHint}>
            <Ionicons name="sync-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.tapHintText}>Flip</Text>
          </View>
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
            {detectGrammarPatterns(word.example).length > 0 && (
              <View style={styles.grammarRow}>
                {detectGrammarPatterns(word.example).map((g, i) => (
                  <View key={i} style={styles.grammarTag}>
                    <Text style={styles.grammarTagText}>{g.pattern}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
          <Ionicons name="volume-medium" size={16} color={Colors.textMuted} />
        </Pressable>
      </Animated.View>
    </Pressable>
  );
}

export default function WordLearnScreen() {
  const insets = useSafeAreaInsets();
  const { settings, progress, dailyState, todayWords, dayNumber, bookmarks, markWordLearned, toggleBookmark, isLoading, earnXP, isPremium } = useApp();
  const [currentIndex, setCurrentIndex] = useState(dailyState?.currentWordIndex || 0);
  const flatListRef = useRef<FlatList>(null);

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const topPad = insets.top + webTopInset;

  const level = TOPIK_LEVELS.find(l => l.id === settings.selectedLevel);
  const learnedCount = dailyState?.learnedWordIds?.length || 0;
  const progressPercent = todayWords.length > 0 ? (learnedCount / todayWords.length) * 100 : 0;

  const [showComplete, setShowComplete] = useState(false);

  const isLevelLocked = !isPremium && settings.selectedLevel !== 'topik1-1';
  const isDayLocked = !isPremium && dayNumber > 10;
  const isLocked = isLevelLocked || isDayLocked;

  const handleNext = useCallback(async () => {
    if (currentIndex < todayWords.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      markWordLearned(todayWords[currentIndex].id);
      await earnXP(10, 'word_learned');
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      markWordLearned(todayWords[currentIndex].id);
      await earnXP(10, 'word_learned');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await earnXP(30, 'daily_complete');
      setShowComplete(true);
    }
  }, [currentIndex, todayWords, markWordLearned, earnXP]);

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

  if (isLocked) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.dayLabel}>Day {dayNumber}</Text>
            <Text style={styles.levelLabel}>{level?.sublevel} {level?.title}</Text>
          </View>
        </View>
        <PremiumGate
          title={isLevelLocked ? 'Level Locked' : 'Free Trial Complete'}
          description={isLevelLocked 
            ? 'Free users can only access Level 1. Upgrade to Premium to unlock all 6 TOPIK levels with 7,200 words.'
            : 'You\'ve completed your free 10-day trial of 200 words! Upgrade to Premium to continue learning all 1,200 Level 1 words and unlock all 6 levels.'}
        />
      </View>
    );
  }

  if (showComplete) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.dayLabel}>Day {dayNumber}</Text>
            <Text style={styles.levelLabel}>{level?.sublevel} {level?.title}</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.completeScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.completeIconBg}>
            <Ionicons name="checkmark-circle" size={64} color={Colors.primary} />
          </View>
          <Text style={styles.completeTitle}>Great Job!</Text>
          <Text style={styles.completeSubtitle}>You finished today's {todayWords.length} words</Text>
          
          <View style={styles.whatsNextSection}>
            <Text style={styles.whatsNextTitle}>What's Next?</Text>
            
            <Pressable
              style={[styles.nextActionCard, { borderColor: Colors.secondary + '40' }]}
              onPress={() => router.push('/(tabs)/quiz')}
              testID="take-quiz-btn"
            >
              <View style={[styles.nextActionIcon, { backgroundColor: Colors.secondary + '15' }]}>
                <Ionicons name="help-circle-outline" size={24} color={Colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.nextActionTitle}>Take Today's Quiz</Text>
                <Text style={styles.nextActionDesc}>Test what you just learned</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </Pressable>

            <Pressable
              style={[styles.nextActionCard, { borderColor: Colors.primary + '40' }]}
              onPress={() => router.push('/sentence-practice')}
              testID="practice-sentences-btn"
            >
              <View style={[styles.nextActionIcon, { backgroundColor: Colors.primary + '15' }]}>
                <Ionicons name="text-outline" size={24} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.nextActionTitle}>Practice Sentences</Text>
                <Text style={styles.nextActionDesc}>Build sentences with new words</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </Pressable>

            <Pressable
              style={[styles.nextActionCard, { borderColor: '#FF6B6B40' }]}
              onPress={() => router.push('/pronunciation-practice')}
            >
              <View style={[styles.nextActionIcon, { backgroundColor: '#FF6B6B15' }]}>
                <Ionicons name="mic-outline" size={24} color="#FF6B6B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.nextActionTitle}>Practice Pronunciation</Text>
                <Text style={styles.nextActionDesc}>Record and compare your voice</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </Pressable>

            <Pressable
              style={[styles.nextActionCard, { borderColor: Colors.streak + '40' }]}
              onPress={() => router.push('/daily-missions')}
            >
              <View style={[styles.nextActionIcon, { backgroundColor: Colors.streak + '15' }]}>
                <Ionicons name="flag-outline" size={24} color={Colors.streak} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.nextActionTitle}>Daily Missions</Text>
                <Text style={styles.nextActionDesc}>Complete tasks for bonus XP</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </Pressable>
          </View>

          <Pressable
            style={styles.reviewAgainBtn}
            onPress={() => { setShowComplete(false); setCurrentIndex(0); flatListRef.current?.scrollToIndex({ index: 0, animated: false }); }}
          >
            <Ionicons name="refresh" size={18} color={Colors.textSecondary} />
            <Text style={styles.reviewAgainBtnText}>Review Words Again</Text>
          </Pressable>
          <Pressable
            style={styles.goHomeBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="home-outline" size={18} color={Colors.textMuted} />
            <Text style={styles.goHomeBtnText}>Back to Home</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.dayLabel}>Day {dayNumber}</Text>
          <Text style={styles.levelLabel}>{level?.sublevel} {level?.title}</Text>
        </View>
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={18} color={Colors.streak} />
          <Text style={styles.streakText}>{progress.streak}</Text>
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
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLabel: {
    fontSize: 22,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  levelLabel: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
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
  grammarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  grammarTag: {
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  grammarTagText: {
    fontSize: 10,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.accent,
  },
  breakdownRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  syllableChip: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  syllableText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.primary,
  },
  ttsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ttsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.surface,
    borderRadius: 10,
  },
  ttsChipText: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tapHintText: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textMuted,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'web' ? 60 : 40,
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
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  completeIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  completeTitle: {
    fontSize: 28,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  completeSubtitle: {
    fontSize: 15,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  sentencePracticeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 28,
    width: '100%',
  },
  sentencePracticeBtnText: {
    fontSize: 17,
    fontFamily: 'NotoSansKR_700Bold',
    color: '#fff',
  },
  reviewAgainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reviewAgainBtnText: {
    fontSize: 15,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.textSecondary,
  },
  goHomeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  goHomeBtnText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textMuted,
  },
  completeScroll: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  whatsNextSection: {
    width: '100%',
    marginTop: 32,
    gap: 10,
  },
  whatsNextTitle: {
    fontSize: 18,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
    marginBottom: 4,
  },
  nextActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
  },
  nextActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextActionTitle: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  nextActionDesc: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
