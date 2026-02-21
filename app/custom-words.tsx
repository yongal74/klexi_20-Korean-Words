import React, { useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable, Platform, TextInput, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/AppContext';
import { CustomWord } from '@/lib/storage';

const SENTENCE_TEMPLATES: Record<string, (korean: string, english: string) => { korean: string; english: string }[]> = {
  default: (korean, english) => [
    { korean: `${korean}을/를 배우고 있어요.`, english: `I am learning ${english}.` },
    { korean: `${korean}이/가 중요해요.`, english: `${english} is important.` },
    { korean: `${korean}을/를 알아요?`, english: `Do you know ${english}?` },
  ],
};

function generateSentences(korean: string, english: string): { korean: string; english: string }[] {
  return SENTENCE_TEMPLATES.default(korean, english);
}

export default function CustomWordsScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const topPad = insets.top + webTopInset;
  const { customWords, addCustomWord, removeCustomWord } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [korean, setKorean] = useState('');
  const [english, setEnglish] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [generatedSentences, setGeneratedSentences] = useState<{ korean: string; english: string }[]>([]);
  const [selectedSentence, setSelectedSentence] = useState(0);

  const handleGenerate = useCallback(() => {
    if (!korean.trim() || !english.trim()) return;
    const sentences = generateSentences(korean.trim(), english.trim());
    setGeneratedSentences(sentences);
    setSelectedSentence(0);
  }, [korean, english]);

  const handleAdd = useCallback(() => {
    if (!korean.trim() || !english.trim()) {
      Alert.alert('Missing Information', 'Please enter both Korean and English words.');
      return;
    }

    const sentence = generatedSentences[selectedSentence] || { korean: '', english: '' };
    const word: CustomWord = {
      id: `custom-${Date.now()}`,
      korean: korean.trim(),
      english: english.trim(),
      pronunciation: pronunciation.trim() || '',
      sentence: sentence.korean,
      sentenceTranslation: sentence.english,
      createdAt: new Date().toISOString(),
    };

    addCustomWord(word);
    setKorean('');
    setEnglish('');
    setPronunciation('');
    setGeneratedSentences([]);
    setShowForm(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [korean, english, pronunciation, generatedSentences, selectedSentence, addCustomWord]);

  const speakWord = useCallback((text: string) => {
    Speech.speak(text, { language: 'ko-KR', rate: 0.85, pitch: 1.0 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleDelete = useCallback((id: string) => {
    Alert.alert('Delete Word', 'Remove this word from your list?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeCustomWord(id) },
    ]);
  }, [removeCustomWord]);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>My Custom Words</Text>
          <Text style={styles.subtitle}>{customWords.length} words added</Text>
        </View>
        <Pressable
          style={[styles.addBtn, showForm && { backgroundColor: Colors.error }]}
          onPress={() => setShowForm(!showForm)}
        >
          <Ionicons name={showForm ? 'close' : 'add'} size={22} color="#fff" />
        </Pressable>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Add New Word</Text>
            <TextInput
              style={styles.input}
              placeholder="Korean word (한국어)"
              placeholderTextColor={Colors.textMuted}
              value={korean}
              onChangeText={setKorean}
            />
            <TextInput
              style={styles.input}
              placeholder="English meaning"
              placeholderTextColor={Colors.textMuted}
              value={english}
              onChangeText={setEnglish}
            />
            <TextInput
              style={styles.input}
              placeholder="Pronunciation (optional)"
              placeholderTextColor={Colors.textMuted}
              value={pronunciation}
              onChangeText={setPronunciation}
            />

            <Pressable style={styles.generateBtn} onPress={handleGenerate}>
              <Ionicons name="sparkles" size={18} color={Colors.secondary} />
              <Text style={styles.generateBtnText}>Generate Sentences</Text>
            </Pressable>

            {generatedSentences.length > 0 && (
              <View style={styles.sentenceOptions}>
                <Text style={styles.sentenceLabel}>Pick a sentence:</Text>
                {generatedSentences.map((s, i) => (
                  <Pressable
                    key={i}
                    style={[styles.sentenceOption, selectedSentence === i && styles.sentenceOptionActive]}
                    onPress={() => setSelectedSentence(i)}
                  >
                    <Ionicons
                      name={selectedSentence === i ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={selectedSentence === i ? Colors.primary : Colors.textMuted}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sentenceKorean}>{s.korean}</Text>
                      <Text style={styles.sentenceEnglish}>{s.english}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}

            <Pressable style={styles.saveBtn} onPress={handleAdd}>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.saveBtnText}>Save Word</Text>
            </Pressable>
          </View>
        )}

        {customWords.length === 0 && !showForm ? (
          <View style={styles.emptyState}>
            <Ionicons name="create-outline" size={56} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Custom Words Yet</Text>
            <Text style={styles.emptyText}>Add your own Korean words to practice. Tap the + button to start.</Text>
          </View>
        ) : (
          customWords.map((w) => (
            <View key={w.id} style={styles.wordCard}>
              <View style={styles.wordRow}>
                <Pressable onPress={() => speakWord(w.korean)} style={styles.speakBtn}>
                  <Ionicons name="volume-high" size={16} color={Colors.primary} />
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Text style={styles.wordKorean}>{w.korean}</Text>
                  <Text style={styles.wordEnglish}>{w.english}</Text>
                  {w.pronunciation ? <Text style={styles.wordPronunciation}>[{w.pronunciation}]</Text> : null}
                </View>
                <Pressable onPress={() => handleDelete(w.id)} hitSlop={10}>
                  <Ionicons name="trash-outline" size={18} color={Colors.textMuted} />
                </Pressable>
              </View>
              {w.sentence ? (
                <Pressable onPress={() => speakWord(w.sentence)} style={styles.sentenceBox}>
                  <Ionicons name="chatbubble-outline" size={13} color={Colors.secondary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sentenceK}>{w.sentence}</Text>
                    <Text style={styles.sentenceE}>{w.sentenceTranslation}</Text>
                  </View>
                  <Ionicons name="volume-medium" size={13} color={Colors.textMuted} />
                </Pressable>
              ) : null}
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
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: 16 },
  formCard: { backgroundColor: Colors.card, borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: Colors.primary + '30', gap: 12 },
  formTitle: { fontSize: 18, fontFamily: 'NotoSansKR_700Bold', color: Colors.text },
  input: { backgroundColor: Colors.backgroundLight, borderRadius: 12, padding: 14, fontSize: 15, fontFamily: 'NotoSansKR_400Regular', color: Colors.text, borderWidth: 1, borderColor: Colors.border },
  generateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, backgroundColor: Colors.secondary + '15', borderRadius: 12, borderWidth: 1, borderColor: Colors.secondary + '30' },
  generateBtnText: { fontSize: 14, fontFamily: 'NotoSansKR_700Bold', color: Colors.secondary },
  sentenceOptions: { gap: 8 },
  sentenceLabel: { fontSize: 13, fontFamily: 'NotoSansKR_500Medium', color: Colors.textSecondary },
  sentenceOption: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 10, borderRadius: 10, backgroundColor: Colors.backgroundLight },
  sentenceOptionActive: { backgroundColor: Colors.primary + '10', borderWidth: 1, borderColor: Colors.primary + '30' },
  sentenceKorean: { fontSize: 14, fontFamily: 'NotoSansKR_500Medium', color: Colors.text },
  sentenceEnglish: { fontSize: 12, fontFamily: 'NotoSansKR_400Regular', color: Colors.textSecondary },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, backgroundColor: Colors.primary, borderRadius: 14 },
  saveBtnText: { fontSize: 15, fontFamily: 'NotoSansKR_700Bold', color: '#fff' },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 22, fontFamily: 'NotoSansKR_700Bold', color: Colors.text },
  emptyText: { fontSize: 14, fontFamily: 'NotoSansKR_400Regular', color: Colors.textMuted, textAlign: 'center', paddingHorizontal: 20 },
  wordCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border },
  wordRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  speakBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
  wordKorean: { fontSize: 18, fontFamily: 'NotoSansKR_700Bold', color: Colors.text },
  wordEnglish: { fontSize: 14, fontFamily: 'NotoSansKR_500Medium', color: Colors.primary },
  wordPronunciation: { fontSize: 11, fontFamily: 'NotoSansKR_400Regular', color: Colors.textMuted },
  sentenceBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, backgroundColor: Colors.backgroundLight, borderRadius: 10, padding: 10 },
  sentenceK: { fontSize: 13, fontFamily: 'NotoSansKR_500Medium', color: Colors.text },
  sentenceE: { fontSize: 11, fontFamily: 'NotoSansKR_400Regular', color: Colors.textSecondary },
});
