import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable, Platform, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { getAllWords, Word } from '@/lib/vocabulary';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORY_COLORS: Record<string, string> = {
  'Greetings': '#FF6B6B',
  'People': '#4ECDC4',
  'Actions': '#45B7D1',
  'Food & Drink': '#FFE66D',
  'Places': '#96CEB4',
  'Time': '#DDA0DD',
  'Descriptions': '#FF8E8E',
  'Transportation': '#45B7D1',
  'K-Culture': '#FF6B6B',
  'K-Food': '#FFE66D',
  'Daily Life': '#4ECDC4',
  'Nature': '#96CEB4',
  'Activities': '#DDA0DD',
  'Events': '#FFEAA7',
  'Emotions': '#FF8E8E',
  'Health': '#4ECDC4',
  'Shopping': '#FFE66D',
  'Social': '#45B7D1',
  'K-Drama': '#FF6B6B',
  'K-Pop': '#DDA0DD',
  'Entertainment': '#96CEB4',
  'Seasons': '#45B7D1',
  'Life': '#4ECDC4',
  'Culture': '#FFE66D',
  'Communication': '#FF8E8E',
  'Motivation': '#96CEB4',
  'Business': '#45B7D1',
  'Society': '#DDA0DD',
};

function NetworkNode({ word, x, y, size, isSelected, onPress }: {
  word: Word;
  x: number;
  y: number;
  size: number;
  isSelected: boolean;
  onPress: () => void;
}) {
  const color = CATEGORY_COLORS[word.category] || Colors.primary;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.node,
        {
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: isSelected ? color : color + '30',
          borderColor: color,
          borderWidth: isSelected ? 2 : 1,
        },
      ]}
    >
      <Text style={[styles.nodeText, { fontSize: size > 50 ? 14 : 11, color: isSelected ? '#fff' : color }]} numberOfLines={1}>
        {word.korean}
      </Text>
    </Pressable>
  );
}

export default function WordNetworkScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const topPad = insets.top + webTopInset;

  const allWords = useMemo(() => getAllWords(), []);
  const categories = useMemo(() => {
    const catMap: Record<string, Word[]> = {};
    allWords.forEach(w => {
      if (!catMap[w.category]) catMap[w.category] = [];
      catMap[w.category].push(w);
    });
    return Object.entries(catMap)
      .map(([category, words]) => ({ category, words, count: words.length }))
      .sort((a, b) => b.count - a.count);
  }, [allWords]);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);

  const categoryWords = useMemo(() => {
    if (!selectedCategory) return [];
    return categories.find(c => c.category === selectedCategory)?.words || [];
  }, [selectedCategory, categories]);

  const connectedWords = useMemo(() => {
    if (!selectedWord) return [];
    return allWords
      .filter(w => w.id !== selectedWord.id && w.category === selectedWord.category)
      .slice(0, 8);
  }, [selectedWord, allWords]);

  const speak = useCallback((text: string) => {
    Speech.speak(text, { language: 'ko', rate: 0.7 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const nodePositions = useMemo(() => {
    if (!selectedWord) return [];
    const centerX = (SCREEN_WIDTH - 40) / 2;
    const centerY = 140;
    const radius = Math.min(SCREEN_WIDTH - 120, 260) / 2;
    return connectedWords.map((w, i) => {
      const angle = (i / connectedWords.length) * Math.PI * 2 - Math.PI / 2;
      return {
        word: w,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        size: 48,
      };
    });
  }, [selectedWord, connectedWords]);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <View>
          <Text style={styles.title}>Word Network</Text>
          <Text style={styles.subtitle}>워드 네트워크</Text>
        </View>
      </View>

      {!selectedCategory ? (
        <ScrollView contentContainerStyle={styles.catGrid} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionLabel}>Select a category to explore connections</Text>
          {categories.map((cat) => {
            const color = CATEGORY_COLORS[cat.category] || Colors.primary;
            return (
              <Pressable
                key={cat.category}
                style={styles.catCard}
                onPress={() => { setSelectedCategory(cat.category); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              >
                <View style={[styles.catDot, { backgroundColor: color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.catName}>{cat.category}</Text>
                  <Text style={styles.catCount}>{cat.count} words</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </Pressable>
            );
          })}
        </ScrollView>
      ) : !selectedWord ? (
        <View style={{ flex: 1 }}>
          <Pressable onPress={() => setSelectedCategory(null)} style={styles.breadcrumb}>
            <Ionicons name="arrow-back" size={16} color={Colors.textSecondary} />
            <Text style={styles.breadcrumbText}>All Categories</Text>
          </Pressable>
          <View style={styles.catHeader}>
            <View style={[styles.catHeaderDot, { backgroundColor: CATEGORY_COLORS[selectedCategory] || Colors.primary }]} />
            <Text style={styles.catHeaderTitle}>{selectedCategory}</Text>
            <Text style={styles.catHeaderCount}>{categoryWords.length} words</Text>
          </View>
          <ScrollView contentContainerStyle={styles.wordGrid} showsVerticalScrollIndicator={false}>
            {categoryWords.map((w) => {
              const color = CATEGORY_COLORS[w.category] || Colors.primary;
              return (
                <Pressable
                  key={w.id}
                  style={styles.wordChip}
                  onPress={() => { setSelectedWord(w); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                >
                  <Text style={[styles.wordChipKr, { color }]}>{w.korean}</Text>
                  <Text style={styles.wordChipEn}>{w.english}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => setSelectedWord(null)} style={styles.breadcrumb}>
            <Ionicons name="arrow-back" size={16} color={Colors.textSecondary} />
            <Text style={styles.breadcrumbText}>{selectedCategory}</Text>
          </Pressable>

          <View style={styles.networkContainer}>
            <View style={[styles.centerNode, { backgroundColor: (CATEGORY_COLORS[selectedWord.category] || Colors.primary) }]}>
              <Text style={styles.centerNodeText}>{selectedWord.korean}</Text>
              <Text style={styles.centerNodeSub}>{selectedWord.english}</Text>
            </View>

            {nodePositions.map((np, i) => (
              <React.Fragment key={np.word.id}>
                <View
                  style={[
                    styles.connectionLine,
                    {
                      left: (SCREEN_WIDTH - 40) / 2,
                      top: 140,
                      width: Math.sqrt(Math.pow(np.x - (SCREEN_WIDTH - 40) / 2, 2) + Math.pow(np.y - 140, 2)),
                      transform: [
                        { rotate: `${Math.atan2(np.y - 140, np.x - (SCREEN_WIDTH - 40) / 2)}rad` },
                      ],
                    },
                  ]}
                />
                <NetworkNode
                  word={np.word}
                  x={np.x}
                  y={np.y}
                  size={np.size}
                  isSelected={false}
                  onPress={() => {
                    speak(np.word.korean);
                  }}
                />
              </React.Fragment>
            ))}
          </View>

          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <View>
                <Text style={styles.detailKorean}>{selectedWord.korean}</Text>
                <Text style={styles.detailEnglish}>{selectedWord.english}</Text>
                <Text style={styles.detailPronunciation}>[{selectedWord.pronunciation}]</Text>
              </View>
              <Pressable onPress={() => speak(selectedWord.korean)} style={styles.speakBtn}>
                <Ionicons name="volume-high" size={22} color={Colors.primary} />
              </Pressable>
            </View>
            <Pressable onPress={() => speak(selectedWord.example)} style={styles.exampleBox}>
              <View style={{ flex: 1 }}>
                <Text style={styles.exampleKr}>{selectedWord.example}</Text>
                <Text style={styles.exampleEn}>{selectedWord.exampleTranslation}</Text>
              </View>
              <Ionicons name="volume-medium" size={16} color={Colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.connectedSection}>
            <Text style={styles.connectedTitle}>Connected Words</Text>
            {connectedWords.map((w) => (
              <Pressable
                key={w.id}
                style={styles.connectedCard}
                onPress={() => { setSelectedWord(w); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.connectedKr}>{w.korean}</Text>
                  <Text style={styles.connectedEn}>{w.english}</Text>
                </View>
                <Pressable onPress={(e) => { e.stopPropagation(); speak(w.korean); }} hitSlop={12}>
                  <Ionicons name="volume-high" size={18} color={Colors.textMuted} />
                </Pressable>
              </Pressable>
            ))}
          </View>
        </ScrollView>
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
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  catGrid: {
    padding: 20,
    gap: 8,
    paddingBottom: 60,
  },
  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  catName: {
    fontSize: 15,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.text,
  },
  catCount: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textMuted,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  breadcrumbText: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  catHeaderDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  catHeaderTitle: {
    fontSize: 18,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  catHeaderCount: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textMuted,
  },
  wordGrid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 60,
  },
  wordChip: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: '45%',
    flex: 1,
  },
  wordChipKr: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_700Bold',
  },
  wordChipEn: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  networkContainer: {
    height: 320,
    marginHorizontal: 20,
    position: 'relative',
  },
  centerNode: {
    position: 'absolute',
    left: '50%',
    top: 140,
    transform: [{ translateX: -40 }, { translateY: -40 }],
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  centerNodeText: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_700Bold',
    color: '#fff',
  },
  centerNodeSub: {
    fontSize: 10,
    fontFamily: 'NotoSansKR_400Regular',
    color: 'rgba(255,255,255,0.8)',
  },
  connectionLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: Colors.border,
    transformOrigin: 'left center',
    zIndex: 1,
  },
  node: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  nodeText: {
    fontFamily: 'NotoSansKR_700Bold',
    textAlign: 'center',
  },
  detailCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailKorean: {
    fontSize: 24,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  detailEnglish: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.primary,
    marginTop: 4,
  },
  detailPronunciation: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    marginTop: 4,
  },
  speakBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
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
  connectedSection: {
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
  connectedTitle: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  connectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  connectedKr: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  connectedEn: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
});
