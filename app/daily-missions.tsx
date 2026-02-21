import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet, Text, View, Pressable, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/AppContext';

const MISSIONS_KEY = 'daily_missions_state';

interface MissionState {
  date: string;
  sentencesPracticed: number;
  wrongAnswersReviewed: boolean;
  pronunciationPracticed: number;
}

interface Mission {
  id: string;
  icon: string;
  title: string;
  description: string;
  current: number;
  target: number;
  xp: number;
  completed: boolean;
  action?: () => void;
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export default function DailyMissionsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, dailyState, bookmarks, wrongAnswers, todayWords, isLoading } = useApp();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const topPad = insets.top + webTopInset;

  const [missionState, setMissionState] = useState<MissionState>({
    date: getTodayString(),
    sentencesPracticed: 0,
    wrongAnswersReviewed: false,
    pronunciationPracticed: 0,
  });
  const [stateLoaded, setStateLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await AsyncStorage.getItem(MISSIONS_KEY);
        if (data) {
          const parsed = JSON.parse(data) as MissionState;
          if (parsed.date === getTodayString()) {
            setMissionState(parsed);
          } else {
            const fresh: MissionState = {
              date: getTodayString(),
              sentencesPracticed: 0,
              wrongAnswersReviewed: false,
              pronunciationPracticed: 0,
            };
            await AsyncStorage.setItem(MISSIONS_KEY, JSON.stringify(fresh));
            setMissionState(fresh);
          }
        }
      } catch {}
      setStateLoaded(true);
    })();
  }, []);

  const saveMissionState = useCallback(async (state: MissionState) => {
    setMissionState(state);
    await AsyncStorage.setItem(MISSIONS_KEY, JSON.stringify(state));
  }, []);

  const wordsPerDay = settings.courseMode === '10words' ? 10 : 20;
  const learnedCount = dailyState?.learnedWordIds?.length || 0;
  const quizCompleted = dailyState?.quizCompleted || false;
  const bookmarkCount = bookmarks.length;
  const wrongCount = wrongAnswers.length;

  const missions: Mission[] = useMemo(() => {
    const wordTarget = Math.min(wordsPerDay, todayWords.length);
    const bookmarkTarget = 5;
    const sentenceTarget = 5;

    return [
      {
        id: 'learn-words',
        icon: 'book-outline',
        title: `Learn ${wordTarget} new words`,
        description: 'Study today\'s vocabulary cards to complete this mission.',
        current: Math.min(learnedCount, wordTarget),
        target: wordTarget,
        xp: 50,
        completed: learnedCount >= wordTarget,
        action: () => router.push('/word-learn'),
      },
      {
        id: 'complete-quiz',
        icon: 'checkmark-circle-outline',
        title: 'Complete the daily quiz',
        description: 'Test your knowledge with today\'s quiz.',
        current: quizCompleted ? 1 : 0,
        target: 1,
        xp: 30,
        completed: quizCompleted,
        action: () => router.push('/(tabs)/quiz'),
      },
      {
        id: 'practice-sentences',
        icon: 'chatbubble-ellipses-outline',
        title: `Practice ${sentenceTarget} sentences`,
        description: 'Build sentences to improve your grammar skills.',
        current: Math.min(missionState.sentencesPracticed, sentenceTarget),
        target: sentenceTarget,
        xp: 40,
        completed: missionState.sentencesPracticed >= sentenceTarget,
        action: () => router.push('/sentence-practice'),
      },
      {
        id: 'review-wrong',
        icon: 'refresh-circle-outline',
        title: 'Review wrong answers',
        description: wrongCount > 0
          ? `You have ${wrongCount} word${wrongCount !== 1 ? 's' : ''} to review.`
          : 'No wrong answers to review. Great job!',
        current: wrongCount === 0 || missionState.wrongAnswersReviewed ? 1 : 0,
        target: 1,
        xp: 25,
        completed: wrongCount === 0 || missionState.wrongAnswersReviewed,
        action: () => {
          if (wrongCount > 0) {
            router.push('/review');
            saveMissionState({ ...missionState, wrongAnswersReviewed: true });
          }
        },
      },
      {
        id: 'pronunciation-practice',
        icon: 'mic-outline',
        title: 'Practice pronunciation',
        description: 'Record your voice and compare with native pronunciation.',
        current: missionState.pronunciationPracticed > 0 ? 1 : 0,
        target: 1,
        xp: 35,
        completed: missionState.pronunciationPracticed > 0,
        action: () => {
          saveMissionState({ ...missionState, pronunciationPracticed: missionState.pronunciationPracticed + 1 });
          router.push('/pronunciation-practice');
        },
      },
      {
        id: 'bookmark-words',
        icon: 'bookmark-outline',
        title: `Bookmark ${bookmarkTarget} words`,
        description: 'Save words you want to remember for later.',
        current: Math.min(bookmarkCount, bookmarkTarget),
        target: bookmarkTarget,
        xp: 20,
        completed: bookmarkCount >= bookmarkTarget,
        action: () => router.push('/word-learn'),
      },
    ];
  }, [wordsPerDay, todayWords.length, learnedCount, quizCompleted, missionState, wrongCount, bookmarkCount, saveMissionState]);

  const completedCount = missions.filter(m => m.completed).length;
  const totalXP = missions.filter(m => m.completed).reduce((sum, m) => sum + m.xp, 0);

  if (isLoading || !stateLoaded) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} testID="back-button">
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Daily Missions</Text>
          <Text style={styles.headerSubtitle}>오늘의 미션</Text>
        </View>
        <View style={styles.xpBadge}>
          <Ionicons name="flash" size={16} color={Colors.secondary} />
          <Text style={styles.xpBadgeText}>{totalXP} XP</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: 40 + webBottomInset }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <View style={styles.bannerIconWrap}>
            <Ionicons
              name={completedCount === missions.length ? 'trophy' : 'flag'}
              size={36}
              color={completedCount === missions.length ? Colors.primary : Colors.secondary}
            />
          </View>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>
              {completedCount === missions.length
                ? 'All missions complete!'
                : `${completedCount} of ${missions.length} missions done`}
            </Text>
            <Text style={styles.bannerSubtitle}>
              {completedCount === missions.length
                ? 'Amazing work today! Come back tomorrow.'
                : 'Complete missions to earn XP and build your streak.'}
            </Text>
          </View>
          <View style={styles.bannerProgress}>
            <View style={styles.bannerProgressBar}>
              <View style={[styles.bannerProgressFill, {
                width: `${(completedCount / missions.length) * 100}%`,
              }]} />
            </View>
            <Text style={styles.bannerProgressText}>{completedCount}/{missions.length}</Text>
          </View>
        </View>

        <View style={styles.missionsList}>
          {missions.map((mission) => (
            <Pressable
              key={mission.id}
              style={[styles.missionCard, mission.completed && styles.missionCardCompleted]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                mission.action?.();
              }}
              testID={`mission-${mission.id}`}
            >
              <View style={[
                styles.missionIconWrap,
                { backgroundColor: mission.completed ? Colors.success + '20' : Colors.surface },
              ]}>
                {mission.completed ? (
                  <Ionicons name="checkmark" size={24} color={Colors.success} />
                ) : (
                  <Ionicons name={mission.icon as any} size={24} color={Colors.secondary} />
                )}
              </View>

              <View style={styles.missionContent}>
                <Text style={[
                  styles.missionTitle,
                  mission.completed && styles.missionTitleCompleted,
                ]}>{mission.title}</Text>
                <Text style={styles.missionDescription}>{mission.description}</Text>

                <View style={styles.missionProgressRow}>
                  <View style={styles.missionProgressBar}>
                    <View style={[
                      styles.missionProgressFill,
                      {
                        width: `${Math.min((mission.current / mission.target) * 100, 100)}%`,
                        backgroundColor: mission.completed ? Colors.success : Colors.primary,
                      },
                    ]} />
                  </View>
                  <Text style={styles.missionProgressText}>{mission.current}/{mission.target}</Text>
                </View>
              </View>

              <View style={[
                styles.xpReward,
                mission.completed && styles.xpRewardCompleted,
              ]}>
                <Text style={[
                  styles.xpRewardText,
                  mission.completed && styles.xpRewardTextCompleted,
                ]}>+{mission.xp}</Text>
                <Text style={[
                  styles.xpLabel,
                  mission.completed && styles.xpLabelCompleted,
                ]}>XP</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={20} color={Colors.accent} />
          <Text style={styles.tipText}>
            Complete all daily missions to maximize your learning progress and maintain your streak!
          </Text>
        </View>
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
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.secondary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  xpBadgeText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.secondary,
  },
  scrollContent: {
    flex: 1,
  },
  banner: {
    marginHorizontal: 24,
    marginTop: 12,
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bannerIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  bannerContent: {
    gap: 4,
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 20,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  bannerSubtitle: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  bannerProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bannerProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  bannerProgressText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.primary,
    minWidth: 30,
    textAlign: 'right',
  },
  missionsList: {
    paddingHorizontal: 24,
    marginTop: 20,
    gap: 12,
  },
  missionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  missionCardCompleted: {
    borderColor: Colors.success + '30',
    backgroundColor: Colors.success + '08',
  },
  missionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionContent: {
    flex: 1,
    gap: 4,
  },
  missionTitle: {
    fontSize: 15,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  missionTitleCompleted: {
    color: Colors.success,
  },
  missionDescription: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  missionProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  missionProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  missionProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  missionProgressText: {
    fontSize: 11,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.textMuted,
    minWidth: 28,
    textAlign: 'right',
  },
  xpReward: {
    alignItems: 'center',
    backgroundColor: Colors.secondary + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    minWidth: 44,
  },
  xpRewardCompleted: {
    backgroundColor: Colors.success + '15',
  },
  xpRewardText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.secondary,
  },
  xpRewardTextCompleted: {
    color: Colors.success,
  },
  xpLabel: {
    fontSize: 10,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.secondary,
  },
  xpLabelCompleted: {
    color: Colors.success,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginHorizontal: 24,
    marginTop: 24,
    backgroundColor: Colors.accent + '10',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.accent + '20',
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    lineHeight: 19,
  },
});
