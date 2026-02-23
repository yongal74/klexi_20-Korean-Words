import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable, Platform, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/AppContext';
import { getGrammarByLevel, GRAMMAR_CATEGORIES, GrammarPoint } from '@/lib/grammar-data';
import PremiumGate from '@/components/PremiumGate';

const LEVEL_COLORS = [
  Colors.topik.level1, Colors.topik.level2, Colors.topik.level3,
  Colors.topik.level4, Colors.topik.level5, Colors.topik.level6,
];

function GrammarCard({ item, isExpanded, onToggle, color }: {
  item: GrammarPoint; isExpanded: boolean; onToggle: () => void; color: string;
}) {
  const speakExample = useCallback((text: string) => {
    Speech.speak(text, { language: 'ko-KR', rate: 0.85, pitch: 1.05 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return (
    <Pressable
      onPress={onToggle}
      style={[styles.grammarCard, isExpanded && { borderColor: color }]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: color + '20' }]}>
          <Text style={[styles.categoryText, { color }]}>{item.category}</Text>
        </View>
        <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textMuted} />
      </View>

      <View style={styles.titleRow}>
        <Text style={[styles.grammarTitle, { color }]}>{item.title}</Text>
        <Pressable onPress={() => speakExample(item.title)} hitSlop={10} style={styles.speakSmall}>
          <Ionicons name="volume-high" size={16} color={color} />
        </Pressable>
      </View>
      <Text style={styles.grammarRoman}>{item.titleRomanized}</Text>
      <Text style={styles.grammarMeaning}>{item.meaning}</Text>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.explanationBox}>
            <Ionicons name="book-outline" size={14} color={Colors.primary} />
            <Text style={styles.explanationText}>{item.explanation}</Text>
          </View>

          <View style={styles.structureBox}>
            <Text style={styles.structureLabel}>Structure</Text>
            <Text style={styles.structureText}>{item.structure}</Text>
          </View>

          <View style={styles.examplesSection}>
            <Text style={styles.examplesLabel}>Examples</Text>
            {item.examples.map((ex, i) => (
              <Pressable key={i} onPress={() => speakExample(ex.korean)} style={styles.exampleCard}>
                <View style={styles.exampleKoreanRow}>
                  <Text style={styles.exampleKorean}>{ex.korean}</Text>
                  <Ionicons name="volume-medium-outline" size={14} color={color} />
                </View>
                <Text style={styles.exampleEnglish}>{ex.english}</Text>
                <View style={[styles.highlightTag, { backgroundColor: color + '15' }]}>
                  <Ionicons name="color-wand-outline" size={11} color={color} />
                  <Text style={[styles.highlightText, { color }]}>{ex.highlight}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          <View style={styles.tipBox}>
            <Ionicons name="bulb-outline" size={14} color={Colors.streak} />
            <Text style={styles.tipText}>{item.tips}</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

export default function GrammarScreen() {
  const insets = useSafeAreaInsets();
  const { settings, isPremium } = useApp();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const topPad = insets.top + webTopInset;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const currentLevelNum = parseInt(settings.selectedLevel.replace(/\D/g, '').charAt(0) || '1');
  const [selectedLevel, setSelectedLevel] = useState(currentLevelNum);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const grammarPoints = useMemo(() => {
    const points = getGrammarByLevel(selectedLevel);
    if (selectedCategory) {
      return points.filter(p => p.category === selectedCategory);
    }
    return points;
  }, [selectedLevel, selectedCategory]);

  const categories = useMemo(() => {
    const points = getGrammarByLevel(selectedLevel);
    const cats = [...new Set(points.map(p => p.category))];
    return cats;
  }, [selectedLevel]);

  const levelColor = LEVEL_COLORS[(selectedLevel - 1) % 6];
  const isLevelLocked = !isPremium && selectedLevel > 1;

  const toggleExpand = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  const renderItem = useCallback(({ item }: { item: GrammarPoint }) => (
    <GrammarCard
      item={item}
      isExpanded={expandedId === item.id}
      onToggle={() => toggleExpand(item.id)}
      color={levelColor}
    />
  ), [expandedId, levelColor, toggleExpand]);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Grammar</Text>
          <Text style={styles.subtitle}>TOPIK Level {selectedLevel}</Text>
        </View>
        <View style={[styles.countBadge, { backgroundColor: levelColor + '20' }]}>
          <Text style={[styles.countText, { color: levelColor }]}>{grammarPoints.length}</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.levelTabs} contentContainerStyle={styles.levelTabsContent}>
        {[1, 2, 3, 4, 5, 6].map(lvl => {
          const isActive = selectedLevel === lvl;
          const color = LEVEL_COLORS[(lvl - 1) % 6];
          const locked = !isPremium && lvl > 1;
          return (
            <Pressable
              key={lvl}
              onPress={() => {
                if (!locked) {
                  setSelectedLevel(lvl);
                  setSelectedCategory(null);
                  setExpandedId(null);
                }
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[styles.levelTab, isActive && { backgroundColor: color + '20', borderColor: color }]}
            >
              {locked && <Ionicons name="lock-closed" size={10} color={Colors.textMuted} style={{ marginRight: 3 }} />}
              <Text style={[styles.levelTabText, isActive && { color }]}>Lv.{lvl}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryTabs} contentContainerStyle={styles.categoryTabsContent}>
        <Pressable
          onPress={() => { setSelectedCategory(null); setExpandedId(null); }}
          style={[styles.categoryTab, !selectedCategory && { backgroundColor: levelColor + '20', borderColor: levelColor }]}
        >
          <Text style={[styles.categoryTabText, !selectedCategory && { color: levelColor }]}>All</Text>
        </Pressable>
        {categories.map(cat => {
          const isActive = selectedCategory === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => { setSelectedCategory(cat); setExpandedId(null); }}
              style={[styles.categoryTab, isActive && { backgroundColor: levelColor + '20', borderColor: levelColor }]}
            >
              <Text style={[styles.categoryTabText, isActive && { color: levelColor }]}>{cat}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {isLevelLocked ? (
        <View style={styles.lockedContainer}>
          <PremiumGate title={`Level ${selectedLevel} Grammar`} description="Upgrade to Premium to unlock all grammar levels" />
        </View>
      ) : (
        <FlatList
          data={grammarPoints}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: bottomPad + 20 }]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!grammarPoints.length}
        />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  title: {
    fontSize: 20,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  countBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_700Bold',
  },
  levelTabs: {
    minHeight: 52,
    maxHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  levelTabsContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    alignItems: 'center',
  },
  levelTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  levelTabText: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.textSecondary,
  },
  categoryTabs: {
    maxHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryTabsContent: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  categoryTab: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  categoryTabText: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  lockedContainer: {
    flex: 1,
    padding: 16,
  },
  grammarCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: 'NotoSansKR_700Bold',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  grammarTitle: {
    fontSize: 22,
    fontFamily: 'NotoSansKR_700Bold',
  },
  speakSmall: {
    padding: 4,
  },
  grammarRoman: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  grammarMeaning: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.text,
    marginTop: 4,
  },
  expandedContent: {
    marginTop: 14,
    gap: 12,
  },
  explanationBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.primary + '08',
    borderRadius: 10,
    padding: 12,
    alignItems: 'flex-start',
  },
  explanationText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  structureBox: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 10,
    padding: 12,
  },
  structureLabel: {
    fontSize: 11,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  structureText: {
    fontSize: 15,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.text,
  },
  examplesSection: {
    gap: 8,
  },
  examplesLabel: {
    fontSize: 11,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  exampleCard: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  exampleKoreanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exampleKorean: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.text,
    flex: 1,
  },
  exampleEnglish: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  highlightTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  highlightText: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_500Medium',
  },
  tipBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.streak + '10',
    borderRadius: 10,
    padding: 12,
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
