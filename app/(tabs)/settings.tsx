import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable, Platform, Switch, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/AppContext';
import { TOPIK_LEVELS } from '@/lib/vocabulary';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, resetDaily, progress, wrongAnswers, customWords, userProfile, signOut, isLoading } = useApp();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const topPad = insets.top + webTopInset;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const handleLevelChange = (levelId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateSettings({ selectedLevel: levelId });
  };

  const handleCourseModeChange = (mode: '20words' | '10words') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateSettings({
      courseMode: mode,
      wordsPerDay: mode === '10words' ? 10 : 20,
    });
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Today\'s Progress',
      'This will reset your flashcard and quiz progress for today. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetDaily();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

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
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Course Mode</Text>
        <Text style={styles.sectionSubtitle}>Choose your daily word count and course duration</Text>
        <View style={styles.courseModeRow}>
          <Pressable
            style={[styles.courseModeCard, settings.courseMode === '20words' && styles.courseModeActive]}
            onPress={() => handleCourseModeChange('20words')}
          >
            <Text style={[styles.courseModeNumber, settings.courseMode === '20words' && { color: Colors.primary }]}>20</Text>
            <Text style={styles.courseModeLabel}>words/day</Text>
            <Text style={styles.courseModeDuration}>2 months</Text>
            {settings.courseMode === '20words' && <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />}
          </Pressable>
          <Pressable
            style={[styles.courseModeCard, settings.courseMode === '10words' && styles.courseModeActive]}
            onPress={() => handleCourseModeChange('10words')}
          >
            <Text style={[styles.courseModeNumber, settings.courseMode === '10words' && { color: Colors.secondary }]}>10</Text>
            <Text style={styles.courseModeLabel}>words/day</Text>
            <Text style={styles.courseModeDuration}>4 months</Text>
            {settings.courseMode === '10words' && <Ionicons name="checkmark-circle" size={18} color={Colors.secondary} />}
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TOPIK Level</Text>
        <Text style={styles.sectionSubtitle}>Select your current Korean level</Text>
        <View style={styles.levelGrid}>
          {TOPIK_LEVELS.map((lvl) => {
            const isSelected = lvl.id === settings.selectedLevel;
            return (
              <Pressable
                key={lvl.id}
                style={[
                  styles.levelCard,
                  isSelected && { borderColor: lvl.color, borderWidth: 2, backgroundColor: lvl.color + '10' },
                ]}
                onPress={() => handleLevelChange(lvl.id)}
              >
                <View style={[styles.levelHeader, { backgroundColor: lvl.color }]}>
                  <Text style={styles.levelNumber}>{lvl.sublevel.split(' ')[1]}</Text>
                </View>
                <View style={styles.levelBody}>
                  <Text style={styles.levelTitle}>{lvl.sublevel}</Text>
                  <Text style={styles.levelTitleSub}>{lvl.title}</Text>
                  <Text style={styles.levelDays}>{lvl.days}</Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={lvl.color} style={{ marginTop: 4 }} />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Study Preferences</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="text" size={20} color={Colors.textSecondary} />
            <Text style={styles.settingLabel}>Show Pronunciation</Text>
          </View>
          <Switch
            value={settings.showPronunciation}
            onValueChange={(v) => updateSettings({ showPronunciation: v })}
            trackColor={{ false: Colors.surface, true: Colors.primary + '50' }}
            thumbColor={settings.showPronunciation ? Colors.primary : Colors.textMuted}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tools</Text>
        <Pressable style={styles.toolButton} onPress={() => router.push('/hangeul')}>
          <View style={[styles.toolIcon, { backgroundColor: Colors.secondary + '15' }]}>
            <Text style={[styles.toolIconText, { color: Colors.secondary }]}>ㄱ</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.toolText}>Learn Hangeul</Text>
            <Text style={styles.toolSubtext}>Korean alphabet basics</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </Pressable>

        <Pressable style={styles.toolButton} onPress={() => router.push('/custom-words')}>
          <View style={[styles.toolIcon, { backgroundColor: Colors.primary + '15' }]}>
            <Ionicons name="create-outline" size={20} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.toolText}>My Custom Words</Text>
            <Text style={styles.toolSubtext}>{customWords.length} words added</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </Pressable>

        <Pressable style={styles.toolButton} onPress={() => router.push('/review')}>
          <View style={[styles.toolIcon, { backgroundColor: Colors.error + '15' }]}>
            <Ionicons name="alert-circle-outline" size={20} color={Colors.error} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.toolText}>Review Wrong Answers</Text>
            <Text style={styles.toolSubtext}>{wrongAnswers.length} words to review</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </Pressable>

        <Pressable style={styles.toolButton} onPress={() => router.push('/theme-lessons')}>
          <View style={[styles.toolIcon, { backgroundColor: '#DDA0DD15' }]}>
            <Ionicons name="film-outline" size={20} color="#DDA0DD" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.toolText}>K-Culture Themes</Text>
            <Text style={styles.toolSubtext}>K-Drama, K-Pop, K-Food lessons</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </Pressable>

        <Pressable style={styles.toolButton} onPress={() => router.push('/word-network')}>
          <View style={[styles.toolIcon, { backgroundColor: Colors.secondary + '15' }]}>
            <Ionicons name="git-network-outline" size={20} color={Colors.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.toolText}>Word Network</Text>
            <Text style={styles.toolSubtext}>Explore word connections</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Pressable style={styles.actionButton} onPress={handleReset}>
          <Ionicons name="refresh-circle-outline" size={22} color={Colors.error} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.actionText, { color: Colors.error }]}>Reset Today's Progress</Text>
            <Text style={styles.actionSubtext}>Start today's lesson from scratch</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </Pressable>
      </View>

      {userProfile && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.accountCard}>
            <View style={styles.accountAvatar}>
              <Ionicons name="person" size={24} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.accountName}>{userProfile.name}</Text>
              {userProfile.email ? <Text style={styles.accountEmail}>{userProfile.email}</Text> : null}
            </View>
          </View>
          <Pressable
            style={styles.signOutBtn}
            onPress={() => {
              Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: async () => { await signOut(); router.replace('/welcome'); } },
              ]);
            }}
          >
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={[styles.actionText, { color: Colors.error }]}>Sign Out</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutName}>Daily Korean</Text>
          <Text style={styles.aboutVersion}>Version 3.0.0</Text>
          <Text style={styles.aboutDesc}>
            Master Korean vocabulary with daily lessons based on TOPIK curriculum.
            Features K-Culture themes, Word Network, Hangeul learning, TTS, and more.
          </Text>
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 26,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 24,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  courseModeRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  courseModeCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  courseModeActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: Colors.primary + '08',
  },
  courseModeNumber: {
    fontSize: 32,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  courseModeLabel: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.textSecondary,
  },
  courseModeDuration: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textMuted,
    marginTop: 2,
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  levelCard: {
    width: '47%',
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  levelHeader: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 20,
    fontFamily: 'NotoSansKR_700Bold',
    color: '#fff',
  },
  levelBody: {
    padding: 12,
    gap: 2,
    alignItems: 'center',
  },
  levelTitle: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  levelTitleSub: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  levelDays: {
    fontSize: 11,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textMuted,
    marginTop: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.text,
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toolIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolIconText: {
    fontSize: 20,
    fontFamily: 'NotoSansKR_700Bold',
  },
  toolText: {
    fontSize: 15,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.text,
  },
  toolSubtext: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionText: {
    fontSize: 15,
    fontFamily: 'NotoSansKR_500Medium',
  },
  actionSubtext: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  aboutCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  aboutName: {
    fontSize: 20,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.primary,
  },
  aboutVersion: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textMuted,
  },
  aboutDesc: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 6,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  accountAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountName: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  accountEmail: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
