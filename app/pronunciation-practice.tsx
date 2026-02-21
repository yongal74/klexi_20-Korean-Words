import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, Pressable, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/AppContext';
import { getDailyWords, Word, getAllWords } from '@/lib/vocabulary';

const PRONUNCIATION_KEY = 'pronunciation_practice_state';

type PracticePhase = 'listen' | 'record' | 'compare' | 'rate';

interface PracticeState {
  date: string;
  wordsCompleted: number;
  ratings: Record<string, number>;
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export default function PronunciationPracticeScreen() {
  const insets = useSafeAreaInsets();
  const { settings, todayWords } = useApp();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const topPad = insets.top + webTopInset;

  const practiceWords = useMemo(() => {
    if (todayWords.length > 0) return todayWords.slice(0, 10);
    const all = getAllWords();
    return all.slice(0, 10);
  }, [todayWords]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<PracticePhase>('listen');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [practiceState, setPracticeState] = useState<PracticeState>({
    date: getTodayString(),
    wordsCompleted: 0,
    ratings: {},
  });
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [listenCount, setListenCount] = useState(0);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const currentWord = practiceWords[currentIndex];

  useEffect(() => {
    (async () => {
      try {
        const data = await AsyncStorage.getItem(PRONUNCIATION_KEY);
        if (data) {
          const parsed = JSON.parse(data) as PracticeState;
          if (parsed.date === getTodayString()) {
            setPracticeState(parsed);
          }
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        setPermissionGranted(status === 'granted');
      } catch {
        setPermissionGranted(false);
      }
    })();
  }, []);

  const savePracticeState = useCallback(async (state: PracticeState) => {
    setPracticeState(state);
    try { await AsyncStorage.setItem(PRONUNCIATION_KEY, JSON.stringify(state)); } catch {}
  }, []);

  const speakWord = useCallback((text: string, rate: number = 0.85) => {
    Speech.speak(text, { language: 'ko-KR', rate, pitch: 1.0 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setListenCount(c => c + 1);
  }, []);

  const speakSlow = useCallback((text: string) => {
    Speech.speak(text, { language: 'ko-KR', rate: 0.5, pitch: 1.0 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setListenCount(c => c + 1);
  }, []);

  const startRecording = useCallback(async () => {
    if (!permissionGranted) return;
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (err) {
      console.log('Recording error:', err);
    }
  }, [permissionGranted]);

  const stopRecording = useCallback(async () => {
    if (!recordingRef.current) return;
    try {
      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recordingRef.current.getURI();
      setRecordingUri(uri);
      recordingRef.current = null;
      setIsRecording(false);
      setPhase('compare');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (err) {
      console.log('Stop recording error:', err);
      setIsRecording(false);
    }
  }, []);

  const playRecording = useCallback(async () => {
    if (!recordingUri) return;
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync({ uri: recordingUri });
      soundRef.current = sound;
      setIsPlaying(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
      await sound.playAsync();
    } catch (err) {
      console.log('Playback error:', err);
      setIsPlaying(false);
    }
  }, [recordingUri]);

  const rateAndNext = useCallback(async (rating: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newState: PracticeState = {
      ...practiceState,
      wordsCompleted: practiceState.wordsCompleted + 1,
      ratings: { ...practiceState.ratings, [currentWord.id]: rating },
    };
    await savePracticeState(newState);

    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    if (currentIndex < practiceWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setPhase('listen');
      setRecordingUri(null);
      setListenCount(0);
    } else {
      setPhase('rate');
    }
  }, [practiceState, currentWord, currentIndex, practiceWords.length, savePracticeState]);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
    };
  }, []);

  if (!currentWord) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const isComplete = phase === 'rate' && currentIndex >= practiceWords.length - 1;
  const avgRating = Object.values(practiceState.ratings).length > 0
    ? Object.values(practiceState.ratings).reduce((a, b) => a + b, 0) / Object.values(practiceState.ratings).length
    : 0;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Pronunciation Practice</Text>
          <Text style={styles.headerSubtitle}>발음 연습</Text>
        </View>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>{currentIndex + 1}/{practiceWords.length}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 + webBottomInset }}
        showsVerticalScrollIndicator={false}
      >
        {isComplete ? (
          <View style={styles.completeCard}>
            <Ionicons name="trophy" size={60} color={Colors.primary} />
            <Text style={styles.completeTitle}>Practice Complete!</Text>
            <Text style={styles.completeSubtitle}>연습 완료</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{practiceState.wordsCompleted}</Text>
                <Text style={styles.statLabel}>Words</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{avgRating.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Avg Rating</Text>
              </View>
            </View>
            <Pressable style={styles.doneBtn} onPress={() => router.back()}>
              <Text style={styles.doneBtnText}>Done</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${((currentIndex) / practiceWords.length) * 100}%` }]} />
            </View>

            <View style={styles.wordCard}>
              <Text style={styles.wordKorean}>{currentWord.korean}</Text>
              <Text style={styles.wordEnglish}>{currentWord.english}</Text>
              <Text style={styles.wordPronunciation}>[{currentWord.pronunciation}]</Text>
              {currentWord.example && (
                <View style={styles.exampleRow}>
                  <Text style={styles.exampleKr}>{currentWord.example}</Text>
                  <Text style={styles.exampleEn}>{currentWord.exampleTranslation}</Text>
                </View>
              )}
            </View>

            <View style={styles.phaseCard}>
              {phase === 'listen' && (
                <>
                  <View style={styles.phaseHeader}>
                    <Ionicons name="ear-outline" size={24} color={Colors.primary} />
                    <Text style={styles.phaseTitle}>Step 1: Listen</Text>
                  </View>
                  <Text style={styles.phaseDesc}>
                    Listen to the correct pronunciation, then proceed to record your voice.
                  </Text>
                  <View style={styles.listenButtons}>
                    <Pressable style={styles.listenBtn} onPress={() => speakWord(currentWord.korean)}>
                      <Ionicons name="volume-high" size={28} color="#1A1A1A" />
                      <Text style={styles.listenBtnText}>Normal</Text>
                    </Pressable>
                    <Pressable style={styles.listenBtnSlow} onPress={() => speakSlow(currentWord.korean)}>
                      <Ionicons name="speedometer-outline" size={28} color={Colors.secondary} />
                      <Text style={styles.listenBtnSlowText}>Slow</Text>
                    </Pressable>
                  </View>
                  {currentWord.example && (
                    <Pressable style={styles.sentenceBtn} onPress={() => speakWord(currentWord.example, 0.7)}>
                      <Ionicons name="chatbubble-outline" size={18} color={Colors.textSecondary} />
                      <Text style={styles.sentenceBtnText}>Listen to example sentence</Text>
                    </Pressable>
                  )}
                  <Pressable
                    style={[styles.nextPhaseBtn, listenCount === 0 && styles.nextPhaseBtnDisabled]}
                    onPress={() => {
                      if (listenCount > 0) {
                        setPhase('record');
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    }}
                  >
                    <Ionicons name="mic" size={20} color={listenCount > 0 ? '#1A1A1A' : Colors.textMuted} />
                    <Text style={[styles.nextPhaseBtnText, listenCount === 0 && { color: Colors.textMuted }]}>
                      Ready to Record
                    </Text>
                  </Pressable>
                </>
              )}

              {phase === 'record' && (
                <>
                  <View style={styles.phaseHeader}>
                    <Ionicons name="mic" size={24} color="#FF6B6B" />
                    <Text style={styles.phaseTitle}>Step 2: Record</Text>
                  </View>
                  {!permissionGranted ? (
                    <View style={styles.permissionBox}>
                      <Ionicons name="alert-circle-outline" size={32} color={Colors.secondary} />
                      <Text style={styles.permissionText}>
                        Microphone permission is needed to record your pronunciation.
                        {Platform.OS === 'web' ? ' Please allow microphone access in your browser.' : ' Please enable it in Settings.'}
                      </Text>
                      <Pressable style={styles.skipBtn} onPress={() => rateAndNext(3)}>
                        <Text style={styles.skipBtnText}>Skip this word</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.phaseDesc}>
                        Hold the button to record yourself saying: <Text style={{ fontFamily: 'NotoSansKR_700Bold', color: Colors.primary }}>{currentWord.korean}</Text>
                      </Text>
                      <Pressable
                        style={[styles.recordBtn, isRecording && styles.recordBtnActive]}
                        onPressIn={startRecording}
                        onPressOut={stopRecording}
                      >
                        <Ionicons name={isRecording ? 'radio' : 'mic'} size={40} color="#fff" />
                        <Text style={styles.recordBtnText}>
                          {isRecording ? 'Recording...' : 'Hold to Record'}
                        </Text>
                      </Pressable>
                      <Pressable style={styles.relistenBtn} onPress={() => speakWord(currentWord.korean)}>
                        <Ionicons name="volume-medium" size={18} color={Colors.textSecondary} />
                        <Text style={styles.relistenText}>Re-listen to pronunciation</Text>
                      </Pressable>
                    </>
                  )}
                </>
              )}

              {phase === 'compare' && (
                <>
                  <View style={styles.phaseHeader}>
                    <Ionicons name="swap-horizontal" size={24} color="#4ECDC4" />
                    <Text style={styles.phaseTitle}>Step 3: Compare & Rate</Text>
                  </View>
                  <Text style={styles.phaseDesc}>
                    Listen to both and rate how close your pronunciation was.
                  </Text>
                  <View style={styles.compareRow}>
                    <Pressable style={styles.compareBtn} onPress={() => speakWord(currentWord.korean)}>
                      <Ionicons name="volume-high" size={24} color={Colors.primary} />
                      <Text style={styles.compareBtnLabel}>Original</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.compareBtn, styles.compareBtnYour]}
                      onPress={playRecording}
                      disabled={isPlaying}
                    >
                      <Ionicons name={isPlaying ? 'radio' : 'play'} size={24} color="#4ECDC4" />
                      <Text style={[styles.compareBtnLabel, { color: '#4ECDC4' }]}>
                        {isPlaying ? 'Playing...' : 'Your Voice'}
                      </Text>
                    </Pressable>
                  </View>

                  <Text style={styles.rateLabel}>How was your pronunciation?</Text>
                  <View style={styles.ratingRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Pressable key={star} style={styles.starBtn} onPress={() => rateAndNext(star)}>
                        <Ionicons
                          name="star"
                          size={36}
                          color={star <= 3 ? Colors.secondary : Colors.primary}
                        />
                        <Text style={styles.starLabel}>
                          {star === 1 ? 'Retry' : star === 2 ? 'Poor' : star === 3 ? 'OK' : star === 4 ? 'Good' : 'Great'}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}
            </View>

            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>
                <Ionicons name="bulb-outline" size={14} color={Colors.secondary} /> Pronunciation Tips
              </Text>
              <Text style={styles.tipsText}>
                • Pay attention to the syllable stress and intonation{'\n'}
                • Korean is syllable-timed, each syllable gets equal length{'\n'}
                • Practice the final consonants (받침) clearly{'\n'}
                • Listen to slow mode multiple times before recording
              </Text>
            </View>
          </>
        )}
      </ScrollView>
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
  headerTitle: {
    fontSize: 20,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progressBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.primary,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  wordCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  wordKorean: {
    fontSize: 32,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  wordEnglish: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.primary,
    marginTop: 6,
  },
  wordPronunciation: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    marginTop: 4,
  },
  exampleRow: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignSelf: 'stretch',
  },
  exampleKr: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.text,
    textAlign: 'center',
  },
  exampleEn: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  phaseCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  phaseTitle: {
    fontSize: 18,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  phaseDesc: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  listenButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  listenBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  listenBtnText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_700Bold',
    color: '#1A1A1A',
  },
  listenBtnSlow: {
    flex: 1,
    backgroundColor: Colors.secondary + '20',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.secondary + '40',
  },
  listenBtnSlowText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.secondary,
  },
  sentenceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginBottom: 16,
  },
  sentenceBtnText: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  nextPhaseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
  },
  nextPhaseBtnDisabled: {
    backgroundColor: Colors.surface,
  },
  nextPhaseBtnText: {
    fontSize: 15,
    fontFamily: 'NotoSansKR_700Bold',
    color: '#1A1A1A',
  },
  permissionBox: {
    alignItems: 'center',
    gap: 12,
    padding: 20,
  },
  permissionText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  skipBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surface,
  },
  skipBtnText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.textSecondary,
  },
  recordBtn: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  recordBtnActive: {
    backgroundColor: '#FF4444',
    transform: [{ scale: 1.1 }],
  },
  recordBtnText: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_700Bold',
    color: '#fff',
  },
  relistenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  relistenText: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  compareRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  compareBtn: {
    flex: 1,
    backgroundColor: Colors.primary + '15',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  compareBtnYour: {
    backgroundColor: '#4ECDC4' + '15',
    borderColor: '#4ECDC4' + '30',
  },
  compareBtnLabel: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.primary,
  },
  rateLabel: {
    fontSize: 15,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starBtn: {
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  starLabel: {
    fontSize: 10,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  tipsCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.secondary + '10',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.secondary + '20',
  },
  tipsTitle: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.secondary,
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  completeCard: {
    margin: 20,
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  completeTitle: {
    fontSize: 24,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
    marginTop: 8,
  },
  completeSubtitle: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 40,
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  doneBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingHorizontal: 40,
    paddingVertical: 14,
    marginTop: 16,
  },
  doneBtnText: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_700Bold',
    color: '#1A1A1A',
  },
});
