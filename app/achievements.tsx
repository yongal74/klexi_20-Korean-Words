import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/AppContext';
import { ACHIEVEMENTS, getGamificationData, GamificationData } from '@/lib/gamification';

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : 0;
  const { userLevel, gamification } = useApp();
  const [gamData, setGamData] = useState<GamificationData | null>(null);

  useEffect(() => {
    getGamificationData().then(setGamData);
  }, []);

  const unlockedCount = gamData ? Object.keys(gamData.achievements).length : Object.keys(gamification.achievements).length;
  const achievementData = gamData || gamification;

  const xpRewards = [
    { label: 'Learn a word', xp: '+10 XP', icon: 'book-outline' as const },
    { label: 'Quiz correct', xp: '+15 XP', icon: 'checkmark-circle-outline' as const },
    { label: 'Perfect quiz', xp: '+50 XP', icon: 'trophy-outline' as const },
    { label: 'Complete daily words', xp: '+30 XP', icon: 'today-outline' as const },
    { label: 'Review word', xp: '+8 XP', icon: 'refresh-outline' as const },
    { label: 'Sentence practice', xp: '+12 XP', icon: 'text-outline' as const },
    { label: 'Complete mission', xp: '+20 XP', icon: 'flag-outline' as const },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top + topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.levelCard}>
          <View style={styles.levelTopRow}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelNumber}>{userLevel.level}</Text>
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelLabel}>Level {userLevel.level}</Text>
              <Text style={styles.xpText}>
                {userLevel.currentXP} / {userLevel.xpForNext} XP
              </Text>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.round(userLevel.progress * 100)}%` },
                  ]}
                />
              </View>
            </View>
          </View>
          <Text style={styles.totalXPLabel}>
            {gamification.totalXP.toLocaleString()} Total XP
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{gamification.totalXP.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{unlockedCount}/{ACHIEVEMENTS.length}</Text>
            <Text style={styles.statLabel}>Unlocked</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userLevel.level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>All Achievements</Text>
        <View style={styles.achievementGrid}>
          {ACHIEVEMENTS.map((achievement) => {
            const unlockedAt = achievementData.achievements[achievement.id];
            const isUnlocked = !!unlockedAt;

            return (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  !isUnlocked && styles.achievementCardLocked,
                ]}
              >
                <View
                  style={[
                    styles.achievementIconWrap,
                    { backgroundColor: isUnlocked ? achievement.color + '20' : Colors.border },
                  ]}
                >
                  <Ionicons
                    name={achievement.icon as any}
                    size={28}
                    color={isUnlocked ? achievement.color : Colors.textMuted}
                  />
                  {!isUnlocked && (
                    <View style={styles.lockOverlay}>
                      <Ionicons name="lock-closed" size={14} color={Colors.textSecondary} />
                    </View>
                  )}
                  {isUnlocked && (
                    <View style={styles.checkOverlay}>
                      <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.achievementTitle,
                    !isUnlocked && { color: Colors.textMuted },
                  ]}
                  numberOfLines={1}
                >
                  {achievement.title}
                </Text>
                <Text
                  style={[
                    styles.achievementDesc,
                    !isUnlocked && { color: Colors.textMuted },
                  ]}
                  numberOfLines={2}
                >
                  {achievement.description}
                </Text>
                {isUnlocked && unlockedAt && (
                  <Text style={styles.unlockedDate}>
                    {new Date(unlockedAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>How to Earn XP</Text>
        <View style={styles.xpInfoCard}>
          {xpRewards.map((reward, index) => (
            <View
              key={reward.label}
              style={[
                styles.xpRewardRow,
                index < xpRewards.length - 1 && styles.xpRewardBorder,
              ]}
            >
              <View style={styles.xpRewardLeft}>
                <Ionicons name={reward.icon} size={20} color={Colors.textSecondary} />
                <Text style={styles.xpRewardLabel}>{reward.label}</Text>
              </View>
              <Text style={styles.xpRewardValue}>{reward.xp}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    fontFamily: 'NotoSansKR_700Bold',
    fontSize: 18,
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  levelCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  levelTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  levelBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary + '20',
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumber: {
    fontFamily: 'NotoSansKR_700Bold',
    fontSize: 28,
    color: Colors.primary,
  },
  levelInfo: {
    flex: 1,
  },
  levelLabel: {
    fontFamily: 'NotoSansKR_700Bold',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 4,
  },
  xpText: {
    fontFamily: 'NotoSansKR_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  totalXPLabel: {
    fontFamily: 'NotoSansKR_500Medium',
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'NotoSansKR_700Bold',
    fontSize: 18,
    color: Colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: 'NotoSansKR_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  sectionTitle: {
    fontFamily: 'NotoSansKR_700Bold',
    fontSize: 17,
    color: Colors.text,
    marginBottom: 12,
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  achievementCard: {
    width: '48%' as any,
    flexBasis: '47%',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  achievementCardLocked: {
    opacity: 0.4,
  },
  achievementIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  lockOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 2,
  },
  checkOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 1,
  },
  achievementTitle: {
    fontFamily: 'NotoSansKR_700Bold',
    fontSize: 14,
    color: Colors.text,
    marginBottom: 2,
  },
  achievementDesc: {
    fontFamily: 'NotoSansKR_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  unlockedDate: {
    fontFamily: 'NotoSansKR_400Regular',
    fontSize: 11,
    color: Colors.primary,
    marginTop: 6,
  },
  xpInfoCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  xpRewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  xpRewardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  xpRewardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  xpRewardLabel: {
    fontFamily: 'NotoSansKR_400Regular',
    fontSize: 14,
    color: Colors.text,
  },
  xpRewardValue: {
    fontFamily: 'NotoSansKR_700Bold',
    fontSize: 14,
    color: Colors.primary,
  },
});
