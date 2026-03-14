import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable, Platform, Switch, Alert, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/AppContext';
import { TOPIK_LEVELS } from '@/lib/vocabulary';
import AdBanner from '@/components/AdBanner';
import PremiumGate from '@/components/PremiumGate';
import {
  requestNotificationPermission,
  scheduleDailyReminder,
  cancelAllNotifications,
} from '@/lib/notifications';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, resetDaily, progress, wrongAnswers, customWords, userProfile, signOut, isLoading, isPremium } = useApp();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const topPad = insets.top + webTopInset;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const [notifyEnabled, setNotifyEnabled] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('@klexi_notify_enabled').then((v) => {
      if (v === 'true') setNotifyEnabled(true);
    });
  }, []);

  const handleNotifyToggle = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert('알림 권한 필요', '설정에서 알림 권한을 허용해주세요.');
        return;
      }
      await scheduleDailyReminder(20, progress.streak);
    } else {
      await cancelAllNotifications();
    }
    setNotifyEnabled(value);
    await AsyncStorage.setItem('@klexi_notify_enabled', String(value));
  };

  const handleLevelChange = (levelId: string) => {
    if (!isPremium && levelId !== 'topik1-1') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      router.push('/premium');
      return;
    }
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
                  {!isPremium && lvl.id !== 'topik1-1' && !isSelected && (
                    <Ionicons name="lock-closed" size={14} color={Colors.textMuted} style={{ marginTop: 4 }} />
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
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications-outline" size={20} color={Colors.textSecondary} />
            <View>
              <Text style={styles.settingLabel}>Daily Reminder</Text>
              <Text style={styles.settingSubLabel}>학습 알림 (오후 8시)</Text>
            </View>
          </View>
          <Switch
            value={notifyEnabled}
            onValueChange={handleNotifyToggle}
            trackColor={{ false: Colors.surface, true: Colors.primary + '50' }}
            thumbColor={notifyEnabled ? Colors.primary : Colors.textMuted}
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

        <Pressable style={styles.toolButton} onPress={() => router.push('/sentence-practice')}>
          <View style={[styles.toolIcon, { backgroundColor: Colors.accent + '15' }]}>
            <Ionicons name="text-outline" size={20} color={Colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.toolText}>Sentence Practice</Text>
            <Text style={styles.toolSubtext}>Fill-in-blank & word ordering</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </Pressable>

        <Pressable style={styles.toolButton} onPress={() => router.push('/pronunciation-practice')}>
          <View style={[styles.toolIcon, { backgroundColor: '#FF6B6B' + '15' }]}>
            <Ionicons name="mic-outline" size={20} color="#FF6B6B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.toolText}>Pronunciation Practice</Text>
            <Text style={styles.toolSubtext}>Record & compare your voice</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </Pressable>

        <Pressable style={styles.toolButton} onPress={() => router.push('/daily-missions')}>
          <View style={[styles.toolIcon, { backgroundColor: Colors.streak + '15' }]}>
            <Ionicons name="flag-outline" size={20} color={Colors.streak} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.toolText}>Daily Missions</Text>
            <Text style={styles.toolSubtext}>Complete tasks to build habits</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </Pressable>

        <Pressable style={styles.toolButton} onPress={() => router.push('/grammar')}>
          <View style={[styles.toolIcon, { backgroundColor: '#5BA8C815' }]}>
            <Ionicons name="construct-outline" size={20} color="#5BA8C8" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.toolText}>Grammar</Text>
            <Text style={styles.toolSubtext}>TOPIK grammar patterns by level</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.section}>
        <Pressable style={styles.premiumBanner} onPress={() => router.push('/premium')}>
          <View style={styles.premiumIcon}>
            <Ionicons name="diamond" size={22} color={Colors.streak} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
            <Text style={styles.premiumSubtitle}>Remove ads & unlock all features</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.streak} />
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
          <Text style={styles.aboutName}>Twenty Korean</Text>
          <Text style={styles.aboutVersion}>Version 3.0.0</Text>
          <Text style={styles.aboutDesc}>
            Twenty Korean helps you build real Korean with just 20 smart words a day.
          </Text>
        </View>
      </View>

      <AdBanner size="banner" />
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
  settingSubLabel: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textMuted,
    marginTop: 2,
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
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.streak + '15',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.streak + '30',
  },
  premiumIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.streak + '25',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.streak,
  },
  premiumSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
