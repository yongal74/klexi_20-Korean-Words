import React, { useState, useCallback, useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/AppContext';

export default function ReviewScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const topPad = insets.top + webTopInset;
  const { wrongAnswers, removeWrongAnswer, clearWrongAnswers } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayIndex, setCurrentPlayIndex] = useState(-1);
  const playingRef = useRef(false);

  const speakWord = useCallback((korean: string) => {
    Speech.speak(korean, { language: 'ko-KR', rate: 0.85, pitch: 1.0 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const speakSentence = useCallback((sentence: string) => {
    Speech.speak(sentence, { language: 'ko-KR', rate: 0.8, pitch: 1.0 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const playAll = useCallback(async () => {
    if (wrongAnswers.length === 0) return;
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
      playingRef.current = false;
      setCurrentPlayIndex(-1);
      return;
    }

    setIsPlaying(true);
    playingRef.current = true;

    for (let i = 0; i < wrongAnswers.length; i++) {
      if (!playingRef.current) break;
      setCurrentPlayIndex(i);
      const w = wrongAnswers[i];

      await new Promise<void>((resolve) => {
        Speech.speak(w.korean, {
          language: 'ko-KR',
          rate: 0.85,
          pitch: 1.0,
          onDone: () => resolve(),
          onError: () => resolve(),
        });
      });

      if (!playingRef.current) break;
      await new Promise(r => setTimeout(r, 600));

      if (!playingRef.current) break;
      await new Promise<void>((resolve) => {
        Speech.speak(w.english, {
          language: 'en',
          rate: 0.8,
          onDone: () => resolve(),
          onError: () => resolve(),
        });
      });

      if (!playingRef.current) break;
      await new Promise(r => setTimeout(r, 400));

      if (w.sentence && playingRef.current) {
        await new Promise<void>((resolve) => {
          Speech.speak(w.sentence, {
            language: 'ko-KR',
            rate: 0.8,
            pitch: 1.0,
            onDone: () => resolve(),
            onError: () => resolve(),
          });
        });
        await new Promise(r => setTimeout(r, 800));
      }
    }

    setIsPlaying(false);
    playingRef.current = false;
    setCurrentPlayIndex(-1);
  }, [wrongAnswers, isPlaying]);

  const handleClear = useCallback(() => {
    Alert.alert(
      'Clear All Wrong Answers',
      'Remove all words from your review list?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => { clearWrongAnswers(); Speech.stop(); setIsPlaying(false); playingRef.current = false; } },
      ]
    );
  }, [clearWrongAnswers]);

  const handleRemove = useCallback((id: string) => {
    removeWrongAnswer(id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [removeWrongAnswer]);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => { Speech.stop(); router.back(); }} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Review Wrong Answers</Text>
          <Text style={styles.subtitle}>{wrongAnswers.length} words to review</Text>
        </View>
        {wrongAnswers.length > 0 && (
          <Pressable onPress={handleClear} hitSlop={10}>
            <Ionicons name="trash-outline" size={22} color={Colors.error} />
          </Pressable>
        )}
      </View>

      {wrongAnswers.length > 0 && (
        <Pressable
          style={[styles.playAllBtn, isPlaying && { backgroundColor: Colors.error }]}
          onPress={playAll}
        >
          <Ionicons name={isPlaying ? 'stop' : 'play'} size={20} color="#fff" />
          <Text style={styles.playAllText}>
            {isPlaying ? 'Stop Auto-Play' : 'Play All Words & Sentences'}
          </Text>
        </Pressable>
      )}

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {wrongAnswers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={56} color={Colors.success} />
            <Text style={styles.emptyTitle}>All Clear!</Text>
            <Text style={styles.emptyText}>No wrong answers to review. Take a quiz to add words here.</Text>
          </View>
        ) : (
          wrongAnswers.map((w, i) => (
            <View
              key={w.id}
              style={[styles.wordCard, currentPlayIndex === i && { borderColor: Colors.primary, backgroundColor: Colors.primary + '08' }]}
            >
              <View style={styles.wordHeader}>
                <View style={styles.wrongBadge}>
                  <Ionicons name="close-circle" size={14} color={Colors.error} />
                  <Text style={styles.wrongCount}>{w.wrongCount}x</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.wordKorean}>{w.korean}</Text>
                  <Text style={styles.wordEnglish}>{w.english}</Text>
                  <Text style={styles.wordPronunciation}>[{w.pronunciation}]</Text>
                </View>
                <View style={styles.wordActions}>
                  <Pressable onPress={() => speakWord(w.korean)} style={styles.actionBtn}>
                    <Ionicons name="volume-high" size={18} color={Colors.primary} />
                  </Pressable>
                  <Pressable onPress={() => handleRemove(w.id)} style={styles.actionBtn}>
                    <Ionicons name="checkmark" size={18} color={Colors.success} />
                  </Pressable>
                </View>
              </View>
              {w.sentence && (
                <Pressable onPress={() => speakSentence(w.sentence)} style={styles.sentenceBox}>
                  <Ionicons name="chatbubble-outline" size={14} color={Colors.secondary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sentenceKorean}>{w.sentence}</Text>
                    <Text style={styles.sentenceEnglish}>{w.exampleTranslation}</Text>
                  </View>
                  <Ionicons name="volume-medium" size={14} color={Colors.textMuted} />
                </Pressable>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, gap: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontFamily: 'NotoSansKR_700Bold', color: Colors.text },
  subtitle: { fontSize: 13, fontFamily: 'NotoSansKR_400Regular', color: Colors.textSecondary },
  playAllBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 16, marginVertical: 8, paddingVertical: 14, backgroundColor: Colors.primary, borderRadius: 14 },
  playAllText: { fontSize: 15, fontFamily: 'NotoSansKR_700Bold', color: '#fff' },
  content: { flex: 1, paddingHorizontal: 16 },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 22, fontFamily: 'NotoSansKR_700Bold', color: Colors.text },
  emptyText: { fontSize: 14, fontFamily: 'NotoSansKR_400Regular', color: Colors.textMuted, textAlign: 'center' },
  wordCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border },
  wordHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  wrongBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.error + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  wrongCount: { fontSize: 12, fontFamily: 'NotoSansKR_700Bold', color: Colors.error },
  wordKorean: { fontSize: 20, fontFamily: 'NotoSansKR_700Bold', color: Colors.text },
  wordEnglish: { fontSize: 14, fontFamily: 'NotoSansKR_500Medium', color: Colors.primary },
  wordPronunciation: { fontSize: 12, fontFamily: 'NotoSansKR_400Regular', color: Colors.textMuted },
  wordActions: { flexDirection: 'row', gap: 6 },
  actionBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  sentenceBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, backgroundColor: Colors.backgroundLight, borderRadius: 10, padding: 10 },
  sentenceKorean: { fontSize: 13, fontFamily: 'NotoSansKR_500Medium', color: Colors.text },
  sentenceEnglish: { fontSize: 11, fontFamily: 'NotoSansKR_400Regular', color: Colors.textSecondary },
});
