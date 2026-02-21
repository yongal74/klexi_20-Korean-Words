import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable, Platform, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/colors';
import { getAllWords, Word } from '@/lib/vocabulary';
import {
  getWordConnections, getPersonalizedConnections,
  WordConnection, RelationType, RELATION_LABELS, RELATION_COLORS,
  NetworkLearningData, createEmptyLearningData, recordWordView,
} from '@/lib/word-network-engine';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const LEARNING_DATA_KEY = 'word_network_learning';

const CATEGORY_COLORS: Record<string, string> = {
  'Greetings & Manners': '#FF6B6B',
  'Family & People': '#4ECDC4',
  'Basic Verbs': '#45B7D1',
  'Food & Drinks': '#FFE66D',
  'Places & Locations': '#96CEB4',
  'Time & Calendar': '#DDA0DD',
  'Basic Adjectives': '#FF8E8E',
  'Transportation': '#45B7D1',
  'Daily Life': '#4ECDC4',
  'Numbers': '#FFEAA7',
  'Body Parts': '#FF6B6B',
  'Animals': '#96CEB4',
  'Education': '#45B7D1',
  'Communication': '#DDA0DD',
  'Travel & Tourism': '#FFE66D',
  'Workplace & Career': '#4ECDC4',
  'Business & Economics': '#C98A5E',
  'Business & Economy': '#C98A5E',
  'Environment & Nature': '#96CEB4',
  'Medicine & Health': '#FF8E8E',
  'Psychology & Emotions': '#DDA0DD',
  'Arts & Culture': '#FFE66D',
  'Science & Technology': '#45B7D1',
  'Science & Innovation': '#45B7D1',
  'Social Issues': '#FF6B6B',
  'Politics & Government': '#9B8EC4',
  'Law & Justice': '#C98A5E',
  'Law & Legal': '#C98A5E',
  'Literature & Writing': '#DDA0DD',
  'Philosophy & Abstract': '#9B8EC4',
  'Abstract/Academic': '#9B8EC4',
  'Miscellaneous': '#4ECDC4',
  'Verbs & Adjectives Extended': '#45B7D1',
  'Advanced Grammar/Expressions': '#FFE66D',
  'Academic Writing': '#C98A5E',
  'Korean Food Culture': '#FF6B6B',
  'Media & Entertainment': '#96CEB4',
};

function NetworkNode({ word, x, y, size, relationType, relationLabel, onPress }: {
  word: Word;
  x: number;
  y: number;
  size: number;
  relationType: RelationType;
  relationLabel: string;
  onPress: () => void;
}) {
  const color = RELATION_COLORS[relationType] || Colors.primary;
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
          backgroundColor: color + '30',
          borderColor: color,
          borderWidth: 2,
        },
      ]}
    >
      <Text style={[styles.nodeText, { fontSize: size > 50 ? 13 : 10, color }]} numberOfLines={1}>
        {word.korean}
      </Text>
    </Pressable>
  );
}

function RelationBadge({ type, label }: { type: RelationType; label: string }) {
  const color = RELATION_COLORS[type] || Colors.primary;
  const shortLabel = RELATION_LABELS[type] || label;
  return (
    <View style={[styles.relationBadge, { backgroundColor: color + '20', borderColor: color + '40' }]}>
      <View style={[styles.relationDot, { backgroundColor: color }]} />
      <Text style={[styles.relationBadgeText, { color }]}>{shortLabel}</Text>
    </View>
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
  const [learningData, setLearningData] = useState<NetworkLearningData>(createEmptyLearningData());

  useEffect(() => {
    (async () => {
      try {
        const data = await AsyncStorage.getItem(LEARNING_DATA_KEY);
        if (data) setLearningData(JSON.parse(data));
      } catch {}
    })();
  }, []);

  const saveLearningData = useCallback(async (data: NetworkLearningData) => {
    setLearningData(data);
    try { await AsyncStorage.setItem(LEARNING_DATA_KEY, JSON.stringify(data)); } catch {}
  }, []);

  const categoryWords = useMemo(() => {
    if (!selectedCategory) return [];
    return categories.find(c => c.category === selectedCategory)?.words || [];
  }, [selectedCategory, categories]);

  const connections = useMemo((): WordConnection[] => {
    if (!selectedWord) return [];
    return getPersonalizedConnections(selectedWord, allWords, learningData);
  }, [selectedWord, allWords, learningData]);

  useEffect(() => {
    if (selectedWord && connections.length > 0) {
      const connIds = connections.map(c => c.word.id);
      const updated = recordWordView(learningData, selectedWord.id, connIds);
      saveLearningData(updated);
    }
  }, [selectedWord?.id]);

  const speak = useCallback((text: string) => {
    Speech.speak(text, { language: 'ko-KR', rate: 0.85, pitch: 1.0 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const nodePositions = useMemo(() => {
    if (!selectedWord || connections.length === 0) return [];
    const centerX = (SCREEN_WIDTH - 40) / 2;
    const centerY = 140;
    const radius = Math.min(SCREEN_WIDTH - 120, 260) / 2;
    return connections.slice(0, 8).map((conn, i) => {
      const angle = (i / Math.min(connections.length, 8)) * Math.PI * 2 - Math.PI / 2;
      return {
        connection: conn,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        size: conn.strength > 0.8 ? 54 : conn.strength > 0.6 ? 48 : 42,
      };
    });
  }, [selectedWord, connections]);

  const relationTypes = useMemo(() => {
    const types = new Set<RelationType>();
    connections.forEach(c => types.add(c.relationType));
    return Array.from(types);
  }, [connections]);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Word Network</Text>
          <Text style={styles.subtitle}>언어학 기반 단어 연결망</Text>
        </View>
      </View>

      {!selectedCategory ? (
        <ScrollView contentContainerStyle={styles.catGrid} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionLabel}>카테고리를 선택하세요</Text>
          <View style={styles.theoryBox}>
            <Ionicons name="school-outline" size={16} color={Colors.secondary} />
            <Text style={styles.theoryText}>
              의미장 이론, 형태소 분석, 반의어/유의어 관계, 연어 패턴, 높임말 체계를 기반으로 단어를 연결합니다
            </Text>
          </View>
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
          <Pressable
            onPress={() => setSelectedCategory(null)}
            style={styles.navBackBtn}
          >
            <Ionicons name="arrow-back" size={18} color="#1A1A1A" />
            <Text style={styles.navBackText}>All Categories</Text>
          </Pressable>
          <View style={styles.catHeader}>
            <View style={[styles.catHeaderDot, { backgroundColor: CATEGORY_COLORS[selectedCategory] || Colors.primary }]} />
            <Text style={styles.catHeaderTitle}>{selectedCategory}</Text>
            <Text style={styles.catHeaderCount}>{categoryWords.length} words</Text>
          </View>
          <ScrollView contentContainerStyle={styles.wordGrid} showsVerticalScrollIndicator={false}>
            {categoryWords.map((w) => {
              const color = CATEGORY_COLORS[w.category] || Colors.primary;
              const hasHistory = learningData.history[w.id];
              return (
                <Pressable
                  key={w.id}
                  style={[styles.wordChip, hasHistory && styles.wordChipViewed]}
                  onPress={() => { setSelectedWord(w); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                >
                  <Text style={[styles.wordChipKr, { color }]}>{w.korean}</Text>
                  <Text style={styles.wordChipEn}>{w.english}</Text>
                  {hasHistory && (
                    <View style={styles.viewedBadge}>
                      <Ionicons name="checkmark-circle" size={12} color={Colors.primary} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
          <Pressable
            onPress={() => setSelectedWord(null)}
            style={styles.navBackBtn}
          >
            <Ionicons name="arrow-back" size={18} color="#1A1A1A" />
            <Text style={styles.navBackText}>{selectedCategory}</Text>
          </Pressable>

          <View style={styles.networkContainer}>
            <View style={[styles.centerNode, { backgroundColor: (CATEGORY_COLORS[selectedWord.category] || Colors.primary) }]}>
              <Text style={styles.centerNodeText}>{selectedWord.korean}</Text>
              <Text style={styles.centerNodeSub}>{selectedWord.english}</Text>
            </View>

            {nodePositions.map((np, i) => (
              <React.Fragment key={np.connection.word.id}>
                <View
                  style={[
                    styles.connectionLine,
                    {
                      left: (SCREEN_WIDTH - 40) / 2,
                      top: 140,
                      width: Math.sqrt(Math.pow(np.x - (SCREEN_WIDTH - 40) / 2, 2) + Math.pow(np.y - 140, 2)),
                      backgroundColor: RELATION_COLORS[np.connection.relationType] + '40',
                      height: np.connection.strength > 0.8 ? 2 : 1,
                      transform: [
                        { rotate: `${Math.atan2(np.y - 140, np.x - (SCREEN_WIDTH - 40) / 2)}rad` },
                      ],
                    },
                  ]}
                />
                <NetworkNode
                  word={np.connection.word}
                  x={np.x}
                  y={np.y}
                  size={np.size}
                  relationType={np.connection.relationType}
                  relationLabel={np.connection.relationLabel}
                  onPress={() => {
                    speak(np.connection.word.korean);
                  }}
                />
              </React.Fragment>
            ))}
          </View>

          {relationTypes.length > 0 && (
            <View style={styles.legendRow}>
              {relationTypes.map(type => (
                <RelationBadge key={type} type={type} label={RELATION_LABELS[type]} />
              ))}
            </View>
          )}

          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailKorean}>{selectedWord.korean}</Text>
                <Text style={styles.detailEnglish}>{selectedWord.english}</Text>
                <Text style={styles.detailPronunciation}>[{selectedWord.pronunciation}]</Text>
                <View style={styles.posTag}>
                  <Text style={styles.posTagText}>{selectedWord.partOfSpeech}</Text>
                </View>
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
            <Text style={styles.connectedTitle}>Linguistic Connections</Text>
            <Text style={styles.connectedSubtitle}>언어학 이론 기반 연결 단어</Text>
            {connections.map((conn) => (
              <Pressable
                key={conn.word.id}
                style={styles.connectedCard}
                onPress={() => { setSelectedWord(conn.word); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              >
                <View style={[styles.connRelDot, { backgroundColor: RELATION_COLORS[conn.relationType] }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.connectedKr}>{conn.word.korean}</Text>
                  <Text style={styles.connectedEn}>{conn.word.english}</Text>
                  <Text style={[styles.connRelLabel, { color: RELATION_COLORS[conn.relationType] }]}>
                    {conn.relationLabel}
                  </Text>
                </View>
                <View style={styles.strengthBar}>
                  <View style={[styles.strengthFill, { width: `${conn.strength * 100}%`, backgroundColor: RELATION_COLORS[conn.relationType] }]} />
                </View>
                <Pressable onPress={(e) => { e.stopPropagation(); speak(conn.word.korean); }} hitSlop={12}>
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
  theoryBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.secondary + '15',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.secondary + '30',
  },
  theoryText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.textSecondary,
    marginBottom: 12,
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
  navBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginVertical: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  navBackText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_700Bold',
    color: '#1A1A1A',
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
  wordChipViewed: {
    borderColor: Colors.primary + '40',
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
  viewedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
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
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  relationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  relationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  relationBadgeText: {
    fontSize: 10,
    fontFamily: 'NotoSansKR_500Medium',
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
  posTag: {
    backgroundColor: Colors.secondary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  posTagText: {
    fontSize: 11,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.secondary,
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
  connectedSubtitle: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    marginTop: -6,
    marginBottom: 4,
  },
  connectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  connRelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
  connRelLabel: {
    fontSize: 11,
    fontFamily: 'NotoSansKR_500Medium',
    marginTop: 2,
  },
  strengthBar: {
    width: 30,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
});
