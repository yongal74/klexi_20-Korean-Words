import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, Platform, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/AppContext';
import { TOPIK_LEVELS } from '@/lib/vocabulary';
import AdBanner from '@/components/AdBanner';

function StatCard({ icon, label, value, color }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconBg, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function DayBar({ day, maxScore }: { day: { date: string; wordsLearned: number; quizScore: number; quizTotal: number }; maxScore: number }) {
  const percent = maxScore > 0 ? (day.quizScore / day.quizTotal) * 100 : 0;
  const barHeight = Math.max(percent * 1.2, 8);
  const dateStr = day.date.split('-').slice(1).join('/');

  return (
    <View style={styles.barWrapper}>
      <View style={[styles.bar, { height: barHeight, backgroundColor: percent >= 70 ? Colors.success : percent >= 50 ? Colors.accent : Colors.primary }]} />
      <Text style={styles.barLabel}>{dateStr}</Text>
    </View>
  );
}

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { progress, settings, isLoading } = useApp();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const topPad = insets.top + webTopInset;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const level = TOPIK_LEVELS.find(l => l.id === settings.selectedLevel);
  const avgScore = progress.totalQuizzesTaken > 0
    ? Math.round((progress.totalCorrectAnswers / (progress.totalQuizzesTaken * 10)) * 100)
    : 0;

  const recentDays = progress.dailyHistory.slice(-7);

  if (isLoading) {
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
        <Text style={styles.title}>Your Progress</Text>
        <Text style={styles.subtitle}>{level?.sublevel} - {level?.title}</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard icon="flame" label="Day Streak" value={progress.streak} color={Colors.streak} />
        <StatCard icon="trophy" label="Best Streak" value={progress.bestStreak} color={Colors.accent} />
        <StatCard icon="book" label="Words Learned" value={progress.totalWordsLearned} color={Colors.secondary} />
        <StatCard icon="checkmark-circle" label="Avg Score" value={`${avgScore}%`} color={Colors.primary} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Last 7 Days</Text>
        {recentDays.length > 0 ? (
          <View style={styles.chartContainer}>
            <View style={styles.barChart}>
              {recentDays.map((day, i) => (
                <DayBar key={i} day={day} maxScore={10} />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="bar-chart-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Complete your first quiz to see progress</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Study History</Text>
        {progress.dailyHistory.length > 0 ? (
          progress.dailyHistory.slice().reverse().slice(0, 10).map((day, i) => {
            const percent = day.quizTotal > 0 ? Math.round((day.quizScore / day.quizTotal) * 100) : 0;
            return (
              <View key={i} style={styles.historyItem}>
                <View style={styles.historyLeft}>
                  <View style={[styles.historyDot, {
                    backgroundColor: percent >= 70 ? Colors.success : percent >= 50 ? Colors.accent : Colors.primary
                  }]} />
                  <View>
                    <Text style={styles.historyDate}>{day.date}</Text>
                    <Text style={styles.historyWords}>{day.wordsLearned} words studied</Text>
                  </View>
                </View>
                <View style={[styles.historyScore, {
                  backgroundColor: (percent >= 70 ? Colors.success : percent >= 50 ? Colors.accent : Colors.primary) + '15'
                }]}>
                  <Text style={[styles.historyScoreText, {
                    color: percent >= 70 ? Colors.success : percent >= 50 ? Colors.accent : Colors.primary
                  }]}>{percent}%</Text>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No study history yet</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TOPIK Level Progress</Text>
        {TOPIK_LEVELS.map((lvl) => {
          const isActive = lvl.id === settings.selectedLevel;
          return (
            <View key={lvl.id} style={[styles.levelItem, isActive && { borderColor: lvl.color }]}>
              <View style={[styles.levelDot, { backgroundColor: lvl.color }]}>
                <Text style={styles.levelDotText}>{lvl.sublevel.split(' ')[1]}</Text>
              </View>
              <View style={styles.levelInfo}>
                <View style={styles.levelNameRow}>
                  <Text style={styles.levelName}>{lvl.sublevel}</Text>
                  {isActive && (
                    <View style={[styles.activeBadge, { backgroundColor: lvl.color + '20' }]}>
                      <Text style={[styles.activeBadgeText, { color: lvl.color }]}>Current</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.levelDesc}>{lvl.description}</Text>
                <Text style={styles.levelDays}>{lvl.days}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <AdBanner size="large" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 26,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 28,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  chartContainer: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
  },
  barWrapper: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  bar: {
    width: 24,
    borderRadius: 6,
    minHeight: 8,
  },
  barLabel: {
    fontSize: 10,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textMuted,
  },
  emptyState: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textMuted,
    textAlign: 'center',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  historyDate: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.text,
  },
  historyWords: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  historyScore: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  historyScoreText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_700Bold',
  },
  levelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  levelDot: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelDotText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_700Bold',
    color: '#fff',
  },
  levelInfo: {
    flex: 1,
    gap: 2,
  },
  levelNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelName: {
    fontSize: 15,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeBadgeText: {
    fontSize: 11,
    fontFamily: 'NotoSansKR_700Bold',
  },
  levelDesc: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  levelDays: {
    fontSize: 11,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textMuted,
  },
});
