import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet, Text, View, Pressable, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { router, useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/AppContext';
import { getAllWords } from '@/lib/vocabulary';
import type { Word } from '@/lib/vocabulary';
import { getThemeWords } from '@/lib/theme-data';

type Mode = 'fill' | 'order';
type SessionState = 'active' | 'result';

interface Question {
  word: Word;
  type: Mode;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SentencePracticeScreen() {
  const insets = useSafeAreaInsets();
  const { todayWords, isLoading } = useApp();
  const { themeId, level } = useLocalSearchParams<{ themeId?: string; level?: string }>();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const topPad = insets.top + webTopInset;

  const [mode, setMode] = useState<Mode>('fill');
  const [sessionState, setSessionState] = useState<SessionState>('active');
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [orderedWords, setOrderedWords] = useState<string[]>([]);
  const [orderChecked, setOrderChecked] = useState(false);
  const [orderCorrect, setOrderCorrect] = useState<boolean | null>(null);

  const allWords = useMemo(() => getAllWords(), []);

  const practiceWords: Word[] = useMemo(() => {
    if (themeId) {
      const lvl = level ? Number(level) : undefined;
      const themeWords = getThemeWords(themeId, lvl);
      return themeWords.map((tw, i) => ({
        id: `theme-${themeId}-${lvl || 'all'}-${i}`,
        korean: tw.korean,
        english: tw.english,
        pronunciation: tw.pronunciation,
        partOfSpeech: '',
        example: tw.example,
        exampleTranslation: tw.exampleTranslation,
        category: themeId,
      }));
    }
    return todayWords;
  }, [themeId, level, todayWords]);

  const questions = useMemo(() => {
    const eligible = practiceWords.filter(w => w.example && w.example.length > 0);
    const shuffled = shuffleArray(eligible);
    const selected = shuffled.slice(0, Math.min(10, shuffled.length));
    return selected.map((word): Question => ({
      word,
      type: mode,
    }));
  }, [practiceWords, mode]);

  const currentQuestion = questions[currentQ];

  const fillOptions = useMemo(() => {
    if (!currentQuestion) return [];
    const correct = currentQuestion.word.korean;
    const distractors: string[] = [];
    const others = shuffleArray(allWords.filter(w => w.id !== currentQuestion.word.id && w.korean !== correct));
    for (const w of others) {
      if (distractors.length >= 3) break;
      if (!distractors.includes(w.korean)) {
        distractors.push(w.korean);
      }
    }
    while (distractors.length < 3) {
      distractors.push(`???${distractors.length}`);
    }
    return shuffleArray([correct, ...distractors]);
  }, [currentQuestion, allWords]);

  const sentenceWithBlank = useMemo(() => {
    if (!currentQuestion) return '';
    const { example, korean } = currentQuestion.word;
    return example.replace(korean, '________');
  }, [currentQuestion]);

  const jumbledWords = useMemo(() => {
    if (!currentQuestion) return [];
    const words = currentQuestion.word.example.split(/\s+/).filter(Boolean);
    return shuffleArray(words);
  }, [currentQuestion]);

  const correctSentenceWords = useMemo(() => {
    if (!currentQuestion) return [];
    return currentQuestion.word.example.split(/\s+/).filter(Boolean);
  }, [currentQuestion]);

  const shakeValue = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeValue.value }],
  }));

  const speakSentence = useCallback((text: string) => {
    Speech.speak(text, { language: 'ko-KR', rate: 0.8, pitch: 1.0 });
  }, []);

  const handleFillAnswer = useCallback((answer: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion?.word.korean;
    setIsCorrect(correct);

    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setScore(s => s + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      shakeValue.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }

    speakSentence(currentQuestion?.word.example || '');

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(q => q + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setSessionState('result');
      }
    }, 1200);
  }, [selectedAnswer, currentQuestion, currentQ, questions.length, shakeValue, speakSentence]);

  const handleChipTap = useCallback((word: string, index: number) => {
    if (orderChecked) return;
    setOrderedWords(prev => [...prev, word]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [orderChecked]);

  const handleRemoveOrdered = useCallback((index: number) => {
    if (orderChecked) return;
    setOrderedWords(prev => prev.filter((_, i) => i !== index));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [orderChecked]);

  const handleCheckOrder = useCallback(() => {
    const isCorrectOrder = orderedWords.join(' ') === correctSentenceWords.join(' ');
    setOrderChecked(true);
    setOrderCorrect(isCorrectOrder);

    if (isCorrectOrder) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setScore(s => s + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      shakeValue.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }

    speakSentence(currentQuestion?.word.example || '');
  }, [orderedWords, correctSentenceWords, shakeValue, speakSentence, currentQuestion]);

  const handleResetOrder = useCallback(() => {
    setOrderedWords([]);
    setOrderChecked(false);
    setOrderCorrect(null);
  }, []);

  const handleNextOrder = useCallback(() => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1);
      setOrderedWords([]);
      setOrderChecked(false);
      setOrderCorrect(null);
    } else {
      setSessionState('result');
    }
  }, [currentQ, questions.length]);

  const handleRestart = useCallback(() => {
    setCurrentQ(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setOrderedWords([]);
    setOrderChecked(false);
    setOrderCorrect(null);
    setSessionState('active');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const availableChips = useMemo(() => {
    const used = [...orderedWords];
    return jumbledWords.map((word, idx) => {
      const usedIndex = used.indexOf(word);
      if (usedIndex !== -1) {
        used.splice(usedIndex, 1);
        return { word, idx, used: true };
      }
      return { word, idx, used: false };
    });
  }, [jumbledWords, orderedWords]);

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} testID="back-button">
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Sentence Practice</Text>
            <Text style={styles.headerSubtitle}>문장 연습</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={56} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No sentences available yet.</Text>
          <Text style={styles.emptySubtext}>Learn some words first to practice sentences.</Text>
        </View>
      </View>
    );
  }

  if (sessionState === 'result') {
    const percent = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    const grade = percent >= 90 ? 'Perfect!' : percent >= 70 ? 'Great Job!' : percent >= 50 ? 'Good Try!' : 'Keep Practicing!';
    const gradeColor = percent >= 90 ? Colors.success : percent >= 70 ? Colors.secondary : percent >= 50 ? Colors.accent : Colors.primary;

    return (
      <ScrollView style={[styles.container, { paddingTop: topPad }]} contentContainerStyle={[styles.resultContent, { paddingBottom: 60 + webBottomInset }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} testID="back-button-result">
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Results</Text>
          </View>
        </View>

        <View style={[styles.resultHeader, { borderColor: gradeColor + '30' }]}>
          <Ionicons
            name={percent >= 70 ? 'trophy' : 'ribbon'}
            size={56}
            color={gradeColor}
          />
          <Text style={[styles.gradeText, { color: gradeColor }]}>{grade}</Text>
          <Text style={styles.scoreText}>{score} / {questions.length}</Text>
          <Text style={styles.percentText}>{percent}%</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: Colors.success }]}>{score}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: Colors.error }]}>{questions.length - score}</Text>
            <Text style={styles.statLabel}>Missed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: Colors.accent }]}>{percent}%</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>
        </View>

        <Pressable style={styles.retryButton} onPress={handleRestart} testID="retry-button">
          <Ionicons name="refresh" size={20} color={Colors.primary} />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>

        <Pressable style={styles.homeButton} onPress={() => router.back()} testID="home-button">
          <Ionicons name="home-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} testID="back-button-active">
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Sentence Practice</Text>
          <Text style={styles.headerSubtitle}>문장 연습</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Ionicons name="star" size={16} color={Colors.primary} />
          <Text style={styles.scoreBadgeText}>{score}</Text>
        </View>
      </View>

      <View style={styles.modeToggle}>
        <Pressable
          style={[styles.modeBtn, mode === 'fill' && styles.modeBtnActive]}
          onPress={() => { setMode('fill'); handleRestart(); }}
          testID="mode-fill"
        >
          <Ionicons name="text-outline" size={16} color={mode === 'fill' ? '#fff' : Colors.textSecondary} />
          <Text style={[styles.modeBtnText, mode === 'fill' && styles.modeBtnTextActive]}>Fill in Blank</Text>
        </Pressable>
        <Pressable
          style={[styles.modeBtn, mode === 'order' && styles.modeBtnActive]}
          onPress={() => { setMode('order'); handleRestart(); }}
          testID="mode-order"
        >
          <Ionicons name="swap-horizontal-outline" size={16} color={mode === 'order' ? '#fff' : Colors.textSecondary} />
          <Text style={[styles.modeBtnText, mode === 'order' && styles.modeBtnTextActive]}>Word Order</Text>
        </Pressable>
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.questionCount}>Question {currentQ + 1}/{questions.length}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((currentQ) / questions.length) * 100}%` }]} />
        </View>
      </View>

      <ScrollView
        style={styles.contentArea}
        contentContainerStyle={{ paddingBottom: 40 + webBottomInset }}
        showsVerticalScrollIndicator={false}
      >
        {mode === 'fill' ? (
          <>
            <Animated.View style={[styles.sentenceCard, shakeStyle]}>
              <Text style={styles.sentenceLabel}>Complete the sentence</Text>
              <Text style={styles.sentenceText}>{sentenceWithBlank}</Text>
              <View style={styles.divider} />
              <Text style={styles.translationText}>{currentQuestion?.word.exampleTranslation}</Text>
            </Animated.View>

            <View style={styles.optionsGrid}>
              {fillOptions.map((option, i) => {
                let bgColor = Colors.card;
                let borderColor = Colors.border;
                let textColor = Colors.text;
                if (selectedAnswer) {
                  if (option === currentQuestion?.word.korean) {
                    bgColor = Colors.success + '20';
                    borderColor = Colors.success;
                    textColor = Colors.success;
                  } else if (option === selectedAnswer && !isCorrect) {
                    bgColor = Colors.error + '20';
                    borderColor = Colors.error;
                    textColor = Colors.error;
                  }
                }
                return (
                  <Pressable
                    key={i}
                    style={[styles.optionButton, { backgroundColor: bgColor, borderColor }]}
                    onPress={() => handleFillAnswer(option)}
                    disabled={!!selectedAnswer}
                    testID={`fill-option-${i}`}
                  >
                    <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
                    {selectedAnswer && option === currentQuestion?.word.korean && (
                      <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                    )}
                    {selectedAnswer && option === selectedAnswer && !isCorrect && option !== currentQuestion?.word.korean && (
                      <Ionicons name="close-circle" size={20} color={Colors.error} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : (
          <>
            <View style={styles.sentenceCard}>
              <Text style={styles.sentenceLabel}>Arrange in correct order</Text>
              <Text style={styles.translationTextLarge}>{currentQuestion?.word.exampleTranslation}</Text>
            </View>

            <Animated.View style={[styles.buildArea, shakeStyle]}>
              <Text style={styles.buildLabel}>Your sentence:</Text>
              <View style={styles.builtSentence}>
                {orderedWords.length === 0 ? (
                  <Text style={styles.placeholderText}>Tap words below to build the sentence</Text>
                ) : (
                  orderedWords.map((word, i) => (
                    <Pressable
                      key={`built-${i}`}
                      style={[
                        styles.builtChip,
                        orderChecked && orderCorrect && styles.builtChipCorrect,
                        orderChecked && !orderCorrect && styles.builtChipWrong,
                      ]}
                      onPress={() => handleRemoveOrdered(i)}
                      testID={`built-chip-${i}`}
                    >
                      <Text style={[
                        styles.builtChipText,
                        orderChecked && orderCorrect && { color: Colors.success },
                        orderChecked && !orderCorrect && { color: Colors.error },
                      ]}>{word}</Text>
                    </Pressable>
                  ))
                )}
              </View>
              {orderChecked && !orderCorrect && (
                <View style={styles.correctAnswer}>
                  <Text style={styles.correctLabel}>Correct answer:</Text>
                  <Text style={styles.correctText}>{currentQuestion?.word.example}</Text>
                </View>
              )}
            </Animated.View>

            <View style={styles.chipPool}>
              {availableChips.map(({ word, idx, used }) => (
                <Pressable
                  key={`chip-${idx}`}
                  style={[styles.wordChip, used && styles.wordChipUsed]}
                  onPress={() => !used && handleChipTap(word, idx)}
                  disabled={used || orderChecked}
                  testID={`word-chip-${idx}`}
                >
                  <Text style={[styles.wordChipText, used && styles.wordChipTextUsed]}>{word}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.orderActions}>
              {!orderChecked ? (
                <>
                  <Pressable
                    style={[styles.actionBtn, styles.resetBtn]}
                    onPress={handleResetOrder}
                    testID="reset-order"
                  >
                    <Ionicons name="refresh" size={18} color={Colors.textSecondary} />
                    <Text style={styles.resetBtnText}>Reset</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionBtn, styles.checkBtn, orderedWords.length !== correctSentenceWords.length && styles.checkBtnDisabled]}
                    onPress={handleCheckOrder}
                    disabled={orderedWords.length !== correctSentenceWords.length}
                    testID="check-order"
                  >
                    <Ionicons name="checkmark" size={18} color="#fff" />
                    <Text style={styles.checkBtnText}>Check</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable
                  style={[styles.actionBtn, styles.nextBtn]}
                  onPress={handleNextOrder}
                  testID="next-order"
                >
                  <Text style={styles.nextBtnText}>{currentQ < questions.length - 1 ? 'Next' : 'See Results'}</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </Pressable>
              )}
            </View>
          </>
        )}
      </ScrollView>
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
  headerTitle: {
    fontSize: 22,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scoreBadgeText: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.primary,
  },
  modeToggle: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modeBtnActive: {
    backgroundColor: Colors.primary,
  },
  modeBtnText: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.textSecondary,
  },
  modeBtnTextActive: {
    color: '#fff',
  },
  progressSection: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 6,
  },
  questionCount: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.textSecondary,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sentenceCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  sentenceLabel: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textMuted,
  },
  sentenceText: {
    fontSize: 22,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
    lineHeight: 34,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surface,
  },
  translationText: {
    fontSize: 15,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  translationTextLarge: {
    fontSize: 18,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.text,
    lineHeight: 28,
  },
  optionsGrid: {
    marginTop: 20,
    gap: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'NotoSansKR_500Medium',
  },
  buildArea: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 120,
  },
  buildLabel: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textMuted,
    marginBottom: 10,
  },
  builtSentence: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    minHeight: 40,
  },
  placeholderText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textMuted,
  },
  builtChip: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  builtChipCorrect: {
    backgroundColor: Colors.success + '20',
    borderColor: Colors.success,
  },
  builtChipWrong: {
    backgroundColor: Colors.error + '20',
    borderColor: Colors.error,
  },
  builtChipText: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.primary,
  },
  correctAnswer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.surface,
    gap: 4,
  },
  correctLabel: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.success,
  },
  correctText: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.success,
  },
  chipPool: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
    justifyContent: 'center',
  },
  wordChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  wordChipUsed: {
    opacity: 0.3,
    backgroundColor: Colors.card,
  },
  wordChipText: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.text,
  },
  wordChipTextUsed: {
    color: Colors.textMuted,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    justifyContent: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  resetBtn: {
    backgroundColor: Colors.surface,
  },
  resetBtnText: {
    fontSize: 15,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.textSecondary,
  },
  checkBtn: {
    backgroundColor: Colors.primary,
    flex: 1,
    justifyContent: 'center',
  },
  checkBtnDisabled: {
    opacity: 0.4,
  },
  checkBtnText: {
    fontSize: 15,
    fontFamily: 'NotoSansKR_700Bold',
    color: '#fff',
  },
  nextBtn: {
    backgroundColor: Colors.primary,
    flex: 1,
    justifyContent: 'center',
  },
  nextBtnText: {
    fontSize: 15,
    fontFamily: 'NotoSansKR_700Bold',
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  resultContent: {
    padding: 24,
    gap: 20,
  },
  resultHeader: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 32,
    gap: 8,
    borderWidth: 1,
  },
  gradeText: {
    fontSize: 28,
    fontFamily: 'NotoSansKR_700Bold',
    marginTop: 8,
  },
  scoreText: {
    fontSize: 18,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.text,
  },
  percentText: {
    fontSize: 48,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'NotoSansKR_700Bold',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary + '15',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.primary,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    borderRadius: 16,
  },
  homeButtonText: {
    fontSize: 15,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.textSecondary,
  },
});
