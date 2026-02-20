import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable, Platform, Switch, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/AppContext';
import { TOPIK_LEVELS } from '@/lib/vocabulary';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, resetDaily, progress, isLoading } = useApp();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const topPad = insets.top + webTopInset;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const handleLevelChange = (levelId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateSettings({ selectedLevel: levelId });
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutName}>Daily Korean</Text>
          <Text style={styles.aboutVersion}>Version 1.0.0</Text>
          <Text style={styles.aboutDesc}>
            Master Korean vocabulary with daily 20-word lessons based on TOPIK curriculum.
            Features K-Drama, K-Pop, and K-Food themed vocabulary.
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
});
