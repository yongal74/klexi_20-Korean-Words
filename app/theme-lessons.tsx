import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable, Platform, FlatList, SectionList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { THEME_META, getThemeWords, ThemeWordWithLevel, ThemeLessonMeta } from '@/lib/theme-data';
import { useApp } from '@/lib/AppContext';
import PremiumGate, { PremiumBadge } from '@/components/PremiumGate';

const LEVEL_LABELS = ['All', 'Lv.1', 'Lv.2', 'Lv.3', 'Lv.4', 'Lv.5', 'Lv.6'];
const LEVEL_FULL_LABELS = ['All Levels', 'TOPIK 1 · Beginner', 'TOPIK 2 · Elementary', 'TOPIK 3 · Intermediate', 'TOPIK 4 · Upper-Intermediate', 'TOPIK 5 · Advanced', 'TOPIK 6 · Expert'];
const LEVEL_COLORS = ['#888', '#8BC34A', '#66BB9A', '#5BA8C8', '#C98A5E', '#B89B6A', '#9B8EC4'];

function WordCard({ word, index, isExpanded, onToggle, showLevel }: {
  word: ThemeWordWithLevel;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  showLevel: boolean;
}) {
  const speak = useCallback((text: string) => {
    Speech.speak(text, { language: 'ko-KR', rate: 0.85, pitch: 1.0 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return (
    <Pressable onPress={onToggle} style={[styles.wordCard, isExpanded && styles.wordCardExpanded]}>
      <View style={styles.wordRow}>
        <View style={styles.wordIndex}>
          <Text style={styles.wordIndexText}>{index + 1}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.wordKorean}>{word.korean}</Text>
          <Text style={styles.wordEnglish}>{word.english}</Text>
        </View>
        {showLevel && (
          <View style={[styles.levelBadge, { backgroundColor: LEVEL_COLORS[word.level] + '20', borderColor: LEVEL_COLORS[word.level] + '50' }]}>
            <Text style={[styles.levelBadgeText, { color: LEVEL_COLORS[word.level] }]}>Lv.{word.level}</Text>
          </View>
        )}
        <Pressable onPress={(e) => { e.stopPropagation(); speak(word.korean); }} hitSlop={12}>
          <Ionicons name="volume-high" size={20} color={Colors.primary} />
        </Pressable>
      </View>
      {isExpanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.pronunciation}>[{word.pronunciation}]</Text>
          <Pressable onPress={() => speak(word.example)} style={styles.exampleBox}>
            <View style={{ flex: 1 }}>
              <Text style={styles.exampleKr}>{word.example}</Text>
              <Text style={styles.exampleEn}>{word.exampleTranslation}</Text>
            </View>
            <Ionicons name="volume-medium" size={16} color={Colors.textMuted} />
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}

export default function ThemeLessonsScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const topPad = insets.top + webTopInset;
  const { themeId } = useLocalSearchParams<{ themeId?: string }>();
  const { settings, isPremium } = useApp();

  const [selectedTheme, setSelectedTheme] = useState<string | null>(themeId || null);
  const [expandedWord, setExpandedWord] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number>(!isPremium ? 1 : 0);

  const theme = THEME_META.find(t => t.id === selectedTheme);

  const words = useMemo(() => {
    if (!selectedTheme) return [];
    return getThemeWords(selectedTheme, selectedLevel === 0 ? undefined : selectedLevel);
  }, [selectedTheme, selectedLevel]);

  const sections = useMemo(() => {
    if (selectedLevel !== 0 || words.length === 0) return [];
    const grouped: Record<number, ThemeWordWithLevel[]> = {};
    words.forEach(w => {
      if (!grouped[w.level]) grouped[w.level] = [];
      grouped[w.level].push(w);
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([lvl, data]) => ({
        level: Number(lvl),
        title: `TOPIK ${lvl}`,
        data,
      }));
  }, [words, selectedLevel]);

  if (!selectedTheme || !theme) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <View>
            <Text style={styles.title}>K-Culture Lessons</Text>
            <Text style={styles.subtitle}>Learn by Theme</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.themesGrid} showsVerticalScrollIndicator={false}>
          {THEME_META.map((t) => {
            const totalWords = getThemeWords(t.id).length;
            return (
              <Pressable
                key={t.id}
                style={[styles.themeCard, { borderColor: t.color + '40' }]}
                onPress={() => { setSelectedTheme(t.id); setSelectedLevel(0); setExpandedWord(null); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              >
                <View style={[styles.themeIconBg, { backgroundColor: t.color + '20' }]}>
                  <Ionicons name={t.icon as any} size={28} color={t.color} />
                </View>
                <Text style={styles.themeTitle}>{t.title}</Text>
                <Text style={styles.themeTitleKr}>{t.titleKr}</Text>
                <Text style={styles.themeDesc}>{t.description}</Text>
                <View style={styles.themeWordCount}>
                  <Text style={[styles.themeWordCountText, { color: t.color }]}>{totalWords} words · 6 levels</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  const showAllSections = selectedLevel === 0;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => { setSelectedTheme(null); setSelectedLevel(0); }} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{theme.title}</Text>
          <Text style={styles.subtitle}>{theme.titleKr} · {words.length} words</Text>
        </View>
        <View style={[styles.themeHeaderIcon, { backgroundColor: theme.color + '20' }]}>
          <Ionicons name={theme.icon as any} size={22} color={theme.color} />
        </View>
      </View>

      <View style={styles.levelButtonsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.levelButtonsScroll}>
          {LEVEL_LABELS.map((label, i) => {
            const isActive = selectedLevel === i;
            const count = i === 0 ? words.length : getThemeWords(selectedTheme, i).length;
            return (
              <Pressable
                key={i}
                style={[
                  styles.levelButton,
                  isActive && { backgroundColor: LEVEL_COLORS[i], borderColor: LEVEL_COLORS[i] },
                  !isActive && { borderColor: LEVEL_COLORS[i] + '60' },
                ]}
                onPress={() => {
                  if (!isPremium && (i === 0 || i > 1)) {
                    router.push('/premium');
                    return;
                  }
                  setSelectedLevel(i); setExpandedWord(null); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={[
                  styles.levelButtonLabel,
                  isActive && { color: i === 0 ? '#fff' : '#1A1A1A' },
                  !isActive && { color: LEVEL_COLORS[i] },
                ]}>
                  {label}
                </Text>
                <Text style={[
                  styles.levelButtonCount,
                  isActive && { color: i === 0 ? 'rgba(255,255,255,0.8)' : 'rgba(26,26,26,0.6)' },
                  !isActive && { color: Colors.textMuted },
                ]}>
                  {count}
                </Text>
                {!isPremium && (i === 0 || i > 1) && (
                  <Ionicons name="lock-closed" size={10} color={Colors.textMuted} style={{ marginLeft: 2 }} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {showAllSections ? (
        <SectionList
          sections={!isPremium ? sections.filter(s => s.level <= 1) : sections}
          keyExtractor={(item, i) => `${theme.id}-all-${item.level}-${i}`}
          renderSectionHeader={({ section }) => (
            <View style={[styles.sectionHeader, { borderLeftColor: LEVEL_COLORS[section.level] }]}>
              <View style={[styles.sectionHeaderDot, { backgroundColor: LEVEL_COLORS[section.level] }]} />
              <Text style={styles.sectionHeaderText}>{section.title}</Text>
              <Text style={[styles.sectionHeaderLevel, { color: LEVEL_COLORS[section.level] }]}>{LEVEL_FULL_LABELS[section.level]}</Text>
              <Pressable
                style={styles.sectionPracticeBtn}
                onPress={() => {
                  router.push(`/sentence-practice?themeId=${selectedTheme}&level=${section.level}`);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Ionicons name="text-outline" size={12} color={Colors.primary} />
                <Text style={styles.sectionPracticeBtnText}>Practice</Text>
              </Pressable>
              <Text style={styles.sectionHeaderCount}>{section.data.length}</Text>
            </View>
          )}
          renderItem={({ item, index, section }) => (
            <View style={styles.sectionWordWrapper}>
              <WordCard
                word={item}
                index={index}
                isExpanded={expandedWord === index + section.level * 1000}
                onToggle={() => setExpandedWord(expandedWord === index + section.level * 1000 ? null : index + section.level * 1000)}
                showLevel={false}
              />
            </View>
          )}
          contentContainerStyle={styles.wordList}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      ) : !isPremium && selectedLevel > 1 ? (
        <PremiumGate
          title="Premium Content"
          description={`Level ${selectedLevel} content is available for Premium users. Upgrade to unlock all 6 levels of K-Culture vocabulary.`}
        />
      ) : (
        <FlatList
          data={words}
          keyExtractor={(_, i) => `${theme.id}-${selectedLevel}-${i}`}
          renderItem={({ item, index }) => (
            <WordCard
              word={item}
              index={index}
              isExpanded={expandedWord === index}
              onToggle={() => setExpandedWord(expandedWord === index ? null : index)}
              showLevel={false}
            />
          )}
          contentContainerStyle={styles.wordList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {selectedLevel > 0 && (
        <Pressable
          style={styles.floatingPracticeBtn}
          onPress={() => {
            router.push(`/sentence-practice?themeId=${selectedTheme}&level=${selectedLevel}`);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Ionicons name="text-outline" size={20} color="#1A1A1A" />
          <Text style={styles.floatingPracticeBtnText}>Sentence Practice</Text>
        </Pressable>
      )}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
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
  title: {
    fontSize: 22,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  themeHeaderIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themesGrid: {
    padding: 20,
    gap: 14,
  },
  themeCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  themeIconBg: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  themeTitle: {
    fontSize: 17,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  themeTitleKr: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  themeDesc: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textMuted,
    marginTop: 2,
  },
  themeWordCount: {
    marginTop: 6,
  },
  themeWordCountText: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_500Medium',
  },
  levelButtonsContainer: {
    paddingBottom: 8,
  },
  levelButtonsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  levelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    minWidth: 60,
  },
  levelButtonLabel: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.textSecondary,
  },
  levelButtonCount: {
    fontSize: 11,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textMuted,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginTop: 8,
    marginBottom: 4,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    paddingLeft: 12,
    gap: 8,
  },
  sectionHeaderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  sectionHeaderLevel: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_400Regular',
    flex: 1,
  },
  sectionHeaderCount: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.textMuted,
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  sectionWordWrapper: {
    paddingHorizontal: 0,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  levelBadgeText: {
    fontSize: 10,
    fontFamily: 'NotoSansKR_700Bold',
  },
  wordList: {
    padding: 20,
    paddingBottom: 60,
    gap: 10,
  },
  wordCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  wordCardExpanded: {
    borderColor: Colors.primary + '40',
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  wordIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordIndexText: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.textMuted,
  },
  wordKorean: {
    fontSize: 17,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  wordEnglish: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  pronunciation: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.secondary,
  },
  exampleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  exampleKr: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.text,
  },
  sectionPracticeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sectionPracticeBtnText: {
    fontSize: 11,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.primary,
  },
  floatingPracticeBtn: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 50 : 30,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingPracticeBtnText: {
    fontSize: 15,
    fontFamily: 'NotoSansKR_700Bold',
    color: '#1A1A1A',
  },
  exampleEn: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
