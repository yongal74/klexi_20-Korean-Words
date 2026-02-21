import React, { useMemo, useCallback } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { getAllWords } from '@/lib/vocabulary';
import { getRelatedWords, RelatedWord } from '@/lib/related-words';

export default function RelatedWordsScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const topPad = insets.top + webTopInset;
  const { wordId } = useLocalSearchParams<{ wordId: string }>();

  const allWords = useMemo(() => getAllWords(), []);
  const word = useMemo(() => allWords.find(w => w.id === wordId), [allWords, wordId]);
  const relatedWords = useMemo(() => {
    if (!word) return [];
    return getRelatedWords(word, allWords);
  }, [word, allWords]);

  const regularWords = relatedWords.filter(w => !w.isDrama);
  const dramaWords = relatedWords.filter(w => w.isDrama);

  const speak = useCallback((text: string) => {
    Speech.speak(text, { language: 'ko-KR', rate: 0.85, pitch: 1.0 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  if (!word) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <Text style={styles.errorText}>Word not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{word.korean}</Text>
          <Text style={styles.subtitle}>{word.english} - Related Words</Text>
        </View>
        <Pressable onPress={() => speak(word.korean)} style={styles.speakMainBtn}>
          <Ionicons name="volume-high" size={20} color="#fff" />
        </Pressable>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Related Words ({regularWords.length})</Text>
        {regularWords.map((rw, i) => (
          <RelatedWordCard key={i} word={rw} onSpeak={speak} index={i} />
        ))}

        {dramaWords.length > 0 && (
          <>
            <View style={styles.dramaDivider}>
              <View style={styles.dramaIcon}>
                <Ionicons name="tv" size={18} color={Colors.accent} />
              </View>
              <Text style={styles.dramaSectionTitle}>K-Drama Expressions ({dramaWords.length})</Text>
            </View>
            {dramaWords.map((rw, i) => (
              <RelatedWordCard key={`drama-${i}`} word={rw} onSpeak={speak} index={i} isDrama />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function RelatedWordCard({ word, onSpeak, index, isDrama }: {
  word: RelatedWord; onSpeak: (t: string) => void; index: number; isDrama?: boolean;
}) {
  return (
    <Pressable
      onPress={() => onSpeak(word.korean)}
      style={[styles.wordCard, isDrama && { borderLeftWidth: 3, borderLeftColor: Colors.accent }]}
    >
      <View style={styles.wordIndex}>
        <Text style={[styles.wordIndexText, isDrama && { color: Colors.accent }]}>{index + 1}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.wordKorean}>{word.korean}</Text>
        <Text style={styles.wordEnglish}>{word.english}</Text>
        <Text style={styles.wordPronunciation}>[{word.pronunciation}]</Text>
      </View>
      <Ionicons name="volume-medium" size={16} color={Colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, gap: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontFamily: 'NotoSansKR_700Bold', color: Colors.text },
  subtitle: { fontSize: 13, fontFamily: 'NotoSansKR_400Regular', color: Colors.textSecondary },
  speakMainBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: 16 },
  errorText: { fontSize: 16, color: Colors.error, textAlign: 'center', marginTop: 100 },
  sectionTitle: { fontSize: 16, fontFamily: 'NotoSansKR_700Bold', color: Colors.text, marginBottom: 10, marginTop: 8 },
  dramaDivider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20, marginBottom: 12 },
  dramaIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.accent + '15', alignItems: 'center', justifyContent: 'center' },
  dramaSectionTitle: { fontSize: 16, fontFamily: 'NotoSansKR_700Bold', color: Colors.accent },
  wordCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: 14, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  wordIndex: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  wordIndexText: { fontSize: 12, fontFamily: 'NotoSansKR_700Bold', color: Colors.textSecondary },
  wordKorean: { fontSize: 16, fontFamily: 'NotoSansKR_700Bold', color: Colors.text },
  wordEnglish: { fontSize: 13, fontFamily: 'NotoSansKR_500Medium', color: Colors.primary },
  wordPronunciation: { fontSize: 11, fontFamily: 'NotoSansKR_400Regular', color: Colors.textMuted },
});
