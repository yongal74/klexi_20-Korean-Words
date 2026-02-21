import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet, Text, View, Pressable, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/AppContext';
import { generateQuizOptions, getAllWords } from '@/lib/vocabulary';

type QuizState = 'ready' | 'active' | 'result';

export default function QuizScreen() {
  const insets = useSafeAreaInsets();
  const { todayWords, dailyState, completeQuiz, addWrongAnswer, wrongAnswers, isLoading } = useApp();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const topPad = insets.top + webTopInset;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const [quizState, setQuizState] = useState<QuizState>(
    dailyState?.quizCompleted ? 'result' : 'ready'
  );
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(dailyState?.quizScore || 0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [missedWords, setMissedWords] = useState<{ korean: string; english: string }[]>([]);

  const allWords = useMemo(() => getAllWords(), []);
  const quizWords = useMemo(() => {
    const shuffled = [...todayWords].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(10, shuffled.length));
  }, [todayWords]);

  const currentWord = quizWords[currentQ];
  const options = useMemo(() => {
    if (!currentWord) return [];
    return generateQuizOptions(currentWord, allWords, 4);
  }, [currentWord, allWords]);

  const shakeValue = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeValue.value }],
  }));

  const speakWord = useCallback((text: string) => {
    Speech.speak(text, { language: 'ko-KR', rate: 0.85, pitch: 1.0 });
  }, []);

  const handleAnswer = useCallback((answer: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    const correct = answer === currentWord.english;
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
      setMissedWords(prev => [...prev, { korean: currentWord.korean, english: currentWord.english }]);
      addWrongAnswer({
        korean: currentWord.korean,
        english: currentWord.english,
        pronunciation: currentWord.pronunciation,
        example: currentWord.example,
        exampleTranslation: currentWord.exampleTranslation,
      });
    }

    setTimeout(() => {
      if (currentQ < quizWords.length - 1) {
        setCurrentQ(q => q + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        const finalScore = correct ? score + 1 : score;
        completeQuiz(finalScore, quizWords.length);
        setScore(finalScore);
        setQuizState('result');
      }
    }, 1000);
  }, [selectedAnswer, currentWord, currentQ, quizWords.length, score, completeQuiz, shakeValue, addWrongAnswer]);

  const startQuiz = useCallback(() => {
    setQuizState('active');
    setCurrentQ(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setMissedWords([]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (quizState === 'ready') {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <View style={styles.readyContainer}>
          <View style={styles.quizIconContainer}>
            <Ionicons name="checkmark-circle" size={64} color={Colors.primary} />
          </View>
          <Text style={styles.readyTitle}>Daily Quiz</Text>
          <Text style={styles.readySubtitle}>
            Test your knowledge of today's {todayWords.length} words with a {Math.min(10, todayWords.length)}-question quiz
          </Text>
          <View style={styles.quizInfo}>
            <View style={styles.quizInfoItem}>
              <Ionicons name="help-circle-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.quizInfoText}>{Math.min(10, todayWords.length)} Questions</Text>
            </View>
            <View style={styles.quizInfoItem}>
              <Ionicons name="list-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.quizInfoText}>4 Choices Each</Text>
            </View>
            <View style={styles.quizInfoItem}>
              <Ionicons name="time-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.quizInfoText}>No Time Limit</Text>
            </View>
          </View>

          {wrongAnswers.length > 0 && (
            <Pressable style={styles.reviewBtn} onPress={() => router.push('/review')}>
              <Ionicons name="alert-circle" size={18} color={Colors.error} />
              <Text style={styles.reviewBtnText}>{wrongAnswers.length} words to review</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.error} />
            </Pressable>
          )}

          <Pressable style={styles.startButton} onPress={startQuiz}>
            <Ionicons name="play" size={22} color="#fff" />
            <Text style={styles.startButtonText}>Start Quiz</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (quizState === 'result') {
    const finalScore = dailyState?.quizCompleted ? dailyState.quizScore : score;
    const finalTotal = dailyState?.quizCompleted ? dailyState.quizTotal : quizWords.length;
    const percent = finalTotal > 0 ? Math.round((finalScore / finalTotal) * 100) : 0;
    const grade = percent >= 90 ? 'Perfect!' : percent >= 70 ? 'Great Job!' : percent >= 50 ? 'Good Try!' : 'Keep Studying!';
    const gradeColor = percent >= 90 ? Colors.success : percent >= 70 ? Colors.secondary : percent >= 50 ? Colors.accent : Colors.primary;

    return (
      <ScrollView style={[styles.container, { paddingTop: topPad }]} contentContainerStyle={[styles.resultContent, { paddingBottom: 120 + webBottomInset }]}>
        <View style={[styles.resultHeader, { borderColor: gradeColor + '30' }]}>
          <Ionicons
            name={percent >= 70 ? 'trophy' : 'ribbon'}
            size={56}
            color={gradeColor}
          />
          <Text style={[styles.gradeText, { color: gradeColor }]}>{grade}</Text>
          <Text style={styles.scoreText}>{finalScore} / {finalTotal}</Text>
          <Text style={styles.percentText}>{percent}%</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: Colors.success }]}>{finalScore}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: Colors.error }]}>{finalTotal - finalScore}</Text>
            <Text style={styles.statLabel}>Missed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: Colors.accent }]}>{percent}%</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>
        </View>

        {missedWords.length > 0 && (
          <View style={styles.missedSection}>
            <Text style={styles.missedTitle}>Words to Review</Text>
            {missedWords.map((w, i) => (
              <Pressable key={i} style={styles.missedWord} onPress={() => speakWord(w.korean)}>
                <Ionicons name="close-circle" size={16} color={Colors.error} />
                <Text style={styles.missedWordText}>{w.korean}</Text>
                <Text style={styles.missedWordEnglish}>{w.english}</Text>
                <Ionicons name="volume-medium" size={14} color={Colors.textMuted} />
              </Pressable>
            ))}
          </View>
        )}

        {wrongAnswers.length > 0 && (
          <Pressable style={styles.goReviewBtn} onPress={() => router.push('/review')}>
            <Ionicons name="book-outline" size={20} color="#fff" />
            <Text style={styles.goReviewBtnText}>Review All Wrong Answers ({wrongAnswers.length})</Text>
          </Pressable>
        )}

        <Pressable style={styles.retryButton} onPress={startQuiz}>
          <Ionicons name="refresh" size={20} color={Colors.primary} />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.quizHeader}>
        <Text style={styles.questionCount}>Question {currentQ + 1}/{quizWords.length}</Text>
        <View style={styles.quizProgressBar}>
          <View style={[styles.quizProgressFill, { width: `${((currentQ) / quizWords.length) * 100}%` }]} />
        </View>
      </View>

      <Animated.View style={[styles.questionCard, shakeStyle]}>
        <Text style={styles.questionLabel}>What does this mean?</Text>
        <Text style={styles.questionWord}>{currentWord?.korean}</Text>
        <Text style={styles.questionPronunciation}>[{currentWord?.pronunciation}]</Text>
        <Pressable onPress={() => speakWord(currentWord?.korean)} style={styles.speakQuizBtn}>
          <Ionicons name="volume-high" size={20} color={Colors.primary} />
        </Pressable>
      </Animated.View>

      <View style={styles.optionsContainer}>
        {options.map((option, i) => {
          let bgColor = Colors.card;
          let borderColor = Colors.border;
          let textColor = Colors.text;
          if (selectedAnswer) {
            if (option === currentWord.english) {
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
              onPress={() => handleAnswer(option)}
              disabled={!!selectedAnswer}
            >
              <View style={[styles.optionIndex, { borderColor }]}>
                <Text style={[styles.optionIndexText, { color: textColor }]}>{String.fromCharCode(65 + i)}</Text>
              </View>
              <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
              {selectedAnswer && option === currentWord.english && (
                <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
              )}
              {selectedAnswer && option === selectedAnswer && !isCorrect && option !== currentWord.english && (
                <Ionicons name="close-circle" size={22} color={Colors.error} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  readyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  quizIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  readyTitle: {
    fontSize: 28,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  readySubtitle: {
    fontSize: 15,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  quizInfo: {
    gap: 12,
    marginVertical: 16,
  },
  quizInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quizInfoText: {
    fontSize: 15,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.error + '10',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.error + '25',
    width: '100%',
  },
  reviewBtnText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.error,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 12,
  },
  startButtonText: {
    fontSize: 17,
    fontFamily: 'NotoSansKR_700Bold',
    color: '#fff',
  },
  quizHeader: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 8,
  },
  questionCount: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.textSecondary,
  },
  quizProgressBar: {
    height: 4,
    backgroundColor: Colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  quizProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  questionCard: {
    margin: 24,
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  questionLabel: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  questionWord: {
    fontSize: 40,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
    marginTop: 8,
  },
  questionPronunciation: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textMuted,
  },
  speakQuizBtn: {
    marginTop: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  optionIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIndexText: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_700Bold',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'NotoSansKR_500Medium',
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
  missedSection: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  missedTitle: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.error,
    marginBottom: 4,
  },
  missedWord: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  missedWordText: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.text,
  },
  missedWordEnglish: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  goReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.error,
    paddingVertical: 16,
    borderRadius: 16,
  },
  goReviewBtnText: {
    fontSize: 15,
    fontFamily: 'NotoSansKR_700Bold',
    color: '#fff',
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
});
