import React, { useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable, Platform, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { THEME_LESSONS, ThemeWord } from '@/lib/theme-data';

function WordCard({ word, index, isExpanded, onToggle }: {
  word: ThemeWord;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const speak = useCallback((text: string) => {
    Speech.speak(text, { language: 'ko', rate: 0.7 });
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

  const [selectedTheme, setSelectedTheme] = useState<string | null>(themeId || null);
  const [expandedWord, setExpandedWord] = useState<number | null>(null);

  const theme = THEME_LESSONS.find(t => t.id === selectedTheme);

  if (!selectedTheme || !theme) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <View>
            <Text style={styles.title}>K-Culture Lessons</Text>
            <Text style={styles.subtitle}>테마별 학습</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.themesGrid} showsVerticalScrollIndicator={false}>
          {THEME_LESSONS.map((t) => (
            <Pressable
              key={t.id}
              style={[styles.themeCard, { borderColor: t.color + '40' }]}
              onPress={() => { setSelectedTheme(t.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            >
              <View style={[styles.themeIconBg, { backgroundColor: t.color + '20' }]}>
                <Ionicons name={t.icon as any} size={28} color={t.color} />
              </View>
              <Text style={styles.themeTitle}>{t.title}</Text>
              <Text style={styles.themeTitleKr}>{t.titleKr}</Text>
              <Text style={styles.themeDesc}>{t.description}</Text>
              <View style={styles.themeWordCount}>
                <Text style={[styles.themeWordCountText, { color: t.color }]}>{t.words.length} words</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => setSelectedTheme(null)} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{theme.title}</Text>
          <Text style={styles.subtitle}>{theme.titleKr}</Text>
        </View>
        <View style={[styles.themeHeaderIcon, { backgroundColor: theme.color + '20' }]}>
          <Ionicons name={theme.icon as any} size={22} color={theme.color} />
        </View>
      </View>

      <FlatList
        data={theme.words}
        keyExtractor={(_, i) => `${theme.id}-${i}`}
        renderItem={({ item, index }) => (
          <WordCard
            word={item}
            index={index}
            isExpanded={expandedWord === index}
            onToggle={() => setExpandedWord(expandedWord === index ? null : index)}
          />
        )}
        contentContainerStyle={styles.wordList}
        showsVerticalScrollIndicator={false}
      />
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
  exampleEn: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
