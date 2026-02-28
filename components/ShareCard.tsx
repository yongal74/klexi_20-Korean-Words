import React from 'react';
import { StyleSheet, Text, View, Pressable, Share, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

interface ShareCardProps {
  streak: number;
  wordsLearned: number;
  dayNumber: number;
  level: string;
  compact?: boolean;
}

const APP_URL = 'https://twentykorean.com';
const SHARE_HASHTAG = '#TwentyKorean #LearnKorean #한국어';

export function ShareProgressCard({ streak, wordsLearned, dayNumber, level, compact = false }: ShareCardProps) {
  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const streakEmoji = streak >= 30 ? '🏆' : streak >= 7 ? '🔥' : '✨';
    const message = `${streakEmoji} Day ${dayNumber} of learning Korean with Twenty Korean!\n\n📚 ${wordsLearned} words learned\n🔥 ${streak} day streak\n📊 ${level}\n\nJust 20 smart words a day. Try it!\n${APP_URL}\n\n${SHARE_HASHTAG}`;

    try {
      await Share.share({
        message,
        ...(Platform.OS !== 'android' ? { url: APP_URL } : {}),
      });
    } catch {}
  };

  if (compact) {
    return (
      <Pressable style={styles.compactBtn} onPress={handleShare} testID="share-compact-btn">
        <Ionicons name="share-social-outline" size={20} color={Colors.primary} />
        <Text style={styles.compactText}>Share Progress</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>한</Text>
          </View>
          <View>
            <Text style={styles.appName}>Twenty Korean</Text>
            <Text style={styles.tagline}>Daily Korean in 20 Words</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="flame" size={22} color={Colors.streak} />
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Ionicons name="book" size={22} color={Colors.primary} />
          <Text style={styles.statValue}>{wordsLearned}</Text>
          <Text style={styles.statLabel}>Words</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Ionicons name="ribbon" size={22} color={Colors.secondary} />
          <Text style={styles.statValue}>Day {dayNumber}</Text>
          <Text style={styles.statLabel}>{level}</Text>
        </View>
      </View>

      <Pressable style={styles.shareBtn} onPress={handleShare} testID="share-progress-btn">
        <Ionicons name="share-social" size={18} color="#1A1A1A" />
        <Text style={styles.shareBtnText}>Share My Progress</Text>
      </Pressable>
    </View>
  );
}

export function ShareDailyCard({ wordsCount, dayNumber, level }: { wordsCount: number; dayNumber: number; level: string }) {
  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const message = `✅ Just finished Day ${dayNumber} — ${wordsCount} new Korean words learned!\n\n📖 ${level} on Twenty Korean\n💡 Daily Korean in 20 Words\n\n${APP_URL}\n\n${SHARE_HASHTAG}`;

    try {
      await Share.share({
        message,
        ...(Platform.OS !== 'android' ? { url: APP_URL } : {}),
      });
    } catch {}
  };

  return (
    <Pressable style={styles.dailyShareBtn} onPress={handleShare} testID="share-daily-btn">
      <View style={[styles.nextActionIcon, { backgroundColor: '#4A90D920' }]}>
        <Ionicons name="share-social-outline" size={24} color="#4A90D9" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.dailyShareTitle}>Share Today's Achievement</Text>
        <Text style={styles.dailyShareDesc}>Show friends your learning streak</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 18,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.primary,
  },
  appName: {
    fontSize: 15,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  tagline: {
    fontSize: 11,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
  },
  shareBtnText: {
    fontSize: 15,
    fontFamily: 'NotoSansKR_700Bold',
    color: '#1A1A1A',
  },
  compactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary + '15',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  compactText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.primary,
  },
  dailyShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#4A90D940',
  },
  nextActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyShareTitle: {
    fontSize: 15,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.text,
  },
  dailyShareDesc: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
