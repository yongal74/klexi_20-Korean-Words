import React, { useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable, Platform, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/AppContext';
import { TOPIK_LEVELS } from '@/lib/vocabulary';
import AdBanner from '@/components/AdBanner';

const LEARNING_THEMES = [
  {
    id: 'word-learn',
    title: 'Word Learning',
    titleKr: '단어 학습',
    description: 'Daily TOPIK vocabulary flashcards',
    icon: 'book' as const,
    color: Colors.primary,
    route: '/word-learn' as const,
  },
  {
    id: 'theme-lessons',
    title: 'K-Culture Themes',
    titleKr: '테마 학습',
    description: 'K-Drama, K-Pop, K-Food & more',
    icon: 'film' as const,
    color: '#DDA0DD',
    route: '/theme-lessons' as const,
  },
  {
    id: 'word-network',
    title: 'Word Network',
    titleKr: '워드 네트워크',
    description: 'Explore word connections by category',
    icon: 'git-network' as const,
    color: Colors.secondary,
    route: '/word-network' as const,
  },
  {
    id: 'hangeul',
    title: 'Korean Alphabet',
    titleKr: '한글 학습',
    description: 'Learn consonants, vowels & syllables',
    icon: 'language' as const,
    color: Colors.accent,
    route: '/hangeul' as const,
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { settings, progress, dailyState, todayWords, dayNumber, userProfile, isAuthenticated, wrongAnswers, customWords, isLoading } = useApp();

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const topPad = insets.top + webTopInset;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/welcome');
    }
  }, [isLoading, isAuthenticated]);

  const level = TOPIK_LEVELS.find(l => l.id === settings.selectedLevel);
  const rawLearnedCount = dailyState?.learnedWordIds?.length || 0;
  const learnedCount = Math.min(rawLearnedCount, todayWords.length);
  const progressPercent = todayWords.length > 0 ? (learnedCount / todayWords.length) * 100 : 0;
  const userName = userProfile?.name || 'Learner';

  if (isLoading || !isAuthenticated) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: topPad }]}
      contentContainerStyle={{ paddingBottom: 120 + webBottomInset }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>안녕하세요! 👋</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
        <View style={styles.headerBadges}>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={18} color={Colors.streak} />
            <Text style={styles.streakText}>{progress.streak}</Text>
          </View>
        </View>
      </View>

      <View style={styles.todayCard}>
        <View style={styles.todayHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.todayLabel}>Day {dayNumber}</Text>
            <Text style={styles.todayLevel} numberOfLines={1}>{level?.sublevel} · {level?.title}</Text>
          </View>
          <Pressable
            style={styles.continueBtn}
            onPress={() => { router.push('/word-learn'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
            <Ionicons name="arrow-forward" size={16} color="#1A1A1A" />
          </Pressable>
        </View>
        <View style={styles.progressRow}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${Math.min(progressPercent, 100)}%` }]} />
          </View>
          <Text style={styles.progressText}>{learnedCount}/{todayWords.length}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Learning Paths</Text>
        <Text style={styles.sectionSubtitle}>학습 테마를 선택하세요</Text>
      </View>

      <View style={styles.themesGrid}>
        {LEARNING_THEMES.map((theme) => (
          <Pressable
            key={theme.id}
            style={styles.themeCard}
            onPress={() => {
              router.push(theme.route);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <View style={[styles.themeIconBg, { backgroundColor: theme.color + '18' }]}>
              <Ionicons name={theme.icon} size={26} color={theme.color} />
            </View>
            <Text style={styles.themeTitle}>{theme.title}</Text>
            <Text style={styles.themeTitleKr}>{theme.titleKr}</Text>
            <Text style={styles.themeDesc}>{theme.description}</Text>
          </Pressable>
        ))}
      </View>

      <AdBanner size="banner" />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
      </View>

      <View style={styles.quickGrid}>
        <Pressable style={styles.quickCard} onPress={() => router.push('/sentence-practice')}>
          <View style={[styles.quickIcon, { backgroundColor: Colors.primary + '15' }]}>
            <Ionicons name="text-outline" size={20} color={Colors.primary} />
          </View>
          <Text style={styles.quickLabel}>Sentences</Text>
          <Text style={styles.quickSubLabel}>Practice</Text>
        </Pressable>

        <Pressable style={styles.quickCard} onPress={() => router.push('/daily-missions')}>
          <View style={[styles.quickIcon, { backgroundColor: Colors.streak + '15' }]}>
            <Ionicons name="flag-outline" size={20} color={Colors.streak} />
          </View>
          <Text style={styles.quickLabel}>Missions</Text>
          <Text style={styles.quickSubLabel}>Daily</Text>
        </Pressable>

        <Pressable style={styles.quickCard} onPress={() => router.push('/review')}>
          <View style={[styles.quickIcon, { backgroundColor: Colors.error + '15' }]}>
            <Ionicons name="alert-circle-outline" size={20} color={Colors.error} />
          </View>
          <Text style={styles.quickLabel}>Review</Text>
          <Text style={styles.quickCount}>{wrongAnswers.length}</Text>
        </Pressable>

        <Pressable style={styles.quickCard} onPress={() => router.push('/custom-words')}>
          <View style={[styles.quickIcon, { backgroundColor: Colors.accent + '15' }]}>
            <Ionicons name="create-outline" size={20} color={Colors.accent} />
          </View>
          <Text style={styles.quickLabel}>My Words</Text>
          <Text style={styles.quickCount}>{customWords.length}</Text>
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{progress.totalWordsLearned}</Text>
          <Text style={styles.statLabel}>Words Learned</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{progress.bestStreak}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{progress.totalQuizzesTaken}</Text>
          <Text style={styles.statLabel}>Quizzes</Text>
        </View>
      </View>
    </ScrollView>
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
    paddingTop: 20,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
    marginTop: 2,
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 8,
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
  todayCard: {
    marginHorizontal: 24,
    marginTop: 16,
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  todayLabel: {
    fontSize: 20,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  todayLevel: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexShrink: 0,
  },
  continueBtnText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_700Bold',
    color: '#1A1A1A',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  section: {
    paddingHorizontal: 24,
    marginTop: 28,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    marginTop: 4,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 12,
  },
  themeCard: {
    width: '47%',
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
    flexGrow: 1,
  },
  themeIconBg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  themeTitle: {
    fontSize: 15,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  themeTitleKr: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  themeDesc: {
    fontSize: 11,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textMuted,
    marginTop: 2,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 10,
  },
  quickCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.textSecondary,
  },
  quickCount: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  quickSubLabel: {
    fontSize: 11,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 24,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textMuted,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
});
