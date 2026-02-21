import React, { useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable, Platform, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { HANGEUL_SECTIONS, SYLLABLE_EXAMPLES, HANGEUL_PRINCIPLES, HangeulChar } from '@/lib/hangeul';

function CharCard({ char, isExpanded, onToggle }: { char: HangeulChar; isExpanded: boolean; onToggle: () => void }) {
  const speak = useCallback(() => {
    Speech.speak(char.example, { language: 'ko-KR', rate: 0.85, pitch: 1.0 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [char.example]);

  const typeColor = char.type === 'consonant' ? Colors.primary :
    char.type === 'vowel' ? Colors.secondary :
    char.type === 'double_consonant' ? '#DDA0DD' : Colors.accent;

  return (
    <Pressable onPress={onToggle} style={[styles.charCard, isExpanded && { borderColor: typeColor }]}>
      <View style={styles.charRow}>
        <Text style={[styles.charText, { color: typeColor }]}>{char.char}</Text>
        <View style={styles.charInfo}>
          <Text style={styles.charRoman}>{char.romanization}</Text>
          <Text style={styles.charSound} numberOfLines={1}>{char.sound}</Text>
        </View>
        <Pressable onPress={speak} hitSlop={10} style={[styles.speakBtn, { backgroundColor: typeColor + '15' }]}>
          <Ionicons name="volume-high" size={18} color={typeColor} />
        </Pressable>
      </View>
      {isExpanded && (
        <View style={styles.charExpanded}>
          <View style={styles.tipBox}>
            <Ionicons name="bulb-outline" size={14} color={Colors.accent} />
            <Text style={styles.tipText}>{char.tip}</Text>
          </View>
          <View style={styles.exampleRow}>
            <Text style={styles.exampleWord}>{char.example}</Text>
            <Text style={styles.exampleMeaning}>= {char.exampleMeaning}</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

export default function HangeulScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const topPad = insets.top + webTopInset;
  const [selectedSection, setSelectedSection] = useState(0);
  const [expandedChar, setExpandedChar] = useState<string | null>(null);
  const [showSyllables, setShowSyllables] = useState(false);
  const [showPrinciples, setShowPrinciples] = useState(false);
  const [expandedPrinciple, setExpandedPrinciple] = useState<number | null>(null);

  const section = HANGEUL_SECTIONS[selectedSection];

  const speakSyllable = useCallback((text: string) => {
    Speech.speak(text, { language: 'ko-KR', rate: 0.8, pitch: 1.0 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>한글 Hangeul</Text>
          <Text style={styles.subtitle}>Korean Alphabet</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={styles.tabsContent}>
        <Pressable
          style={[styles.tab, showPrinciples && !showSyllables && styles.tabActivePrinciple]}
          onPress={() => { setShowPrinciples(true); setShowSyllables(false); }}
        >
          <Text style={[styles.tabText, showPrinciples && !showSyllables && styles.tabTextActive]}>
            원리 Principles
          </Text>
        </Pressable>
        {HANGEUL_SECTIONS.map((s, i) => (
          <Pressable
            key={i}
            style={[styles.tab, !showPrinciples && !showSyllables && selectedSection === i && styles.tabActive]}
            onPress={() => { setSelectedSection(i); setExpandedChar(null); setShowPrinciples(false); setShowSyllables(false); }}
          >
            <Text style={[styles.tabText, !showPrinciples && !showSyllables && selectedSection === i && styles.tabTextActive]}>
              {s.titleKorean}
            </Text>
          </Pressable>
        ))}
        <Pressable
          style={[styles.tab, showSyllables && styles.tabActive]}
          onPress={() => { setShowSyllables(true); setShowPrinciples(false); }}
        >
          <Text style={[styles.tabText, showSyllables && styles.tabTextActive]}>
            음절 Syllables
          </Text>
        </Pressable>
      </ScrollView>

      {showPrinciples && !showSyllables ? (
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.principlesIntro}>How Hangeul Works — The Science Behind Korean Letters</Text>
          <Text style={styles.sectionDesc}>한글은 세계에서 가장 과학적인 문자입니다</Text>
          {HANGEUL_PRINCIPLES.map((principle, i) => (
            <Pressable
              key={i}
              style={[styles.principleCard, expandedPrinciple === i && styles.principleCardActive]}
              onPress={() => setExpandedPrinciple(expandedPrinciple === i ? null : i)}
            >
              <View style={styles.principleHeader}>
                <View style={[styles.principleIconBg, expandedPrinciple === i && { backgroundColor: Colors.secondary + '25' }]}>
                  <Ionicons name={principle.icon as any} size={22} color={expandedPrinciple === i ? Colors.secondary : Colors.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.principleTitle}>{principle.title}</Text>
                  <Text style={styles.principleTitleKr}>{principle.titleKr}</Text>
                </View>
                <Ionicons name={expandedPrinciple === i ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textMuted} />
              </View>
              {expandedPrinciple === i && (
                <View style={styles.principleBody}>
                  <Text style={styles.principleContent}>{principle.content}</Text>
                  <View style={styles.principleDetails}>
                    {principle.details.map((d, j) => (
                      <View key={j} style={styles.principleDetail}>
                        <Text style={styles.principleDetailLabel}>{d.label}</Text>
                        <Text style={styles.principleDetailDesc}>{d.description}</Text>
                        {d.visual && <Text style={styles.principleDetailVisual}>{d.visual}</Text>}
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </Pressable>
          ))}
        </ScrollView>
      ) : showSyllables ? (
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionDesc}>Korean syllables combine consonant + vowel (+ optional final consonant)</Text>
          <View style={styles.syllableFormula}>
            <View style={[styles.formulaPart, { backgroundColor: Colors.primary + '20' }]}>
              <Text style={[styles.formulaText, { color: Colors.primary }]}>Consonant</Text>
            </View>
            <Text style={styles.formulaPlus}>+</Text>
            <View style={[styles.formulaPart, { backgroundColor: Colors.secondary + '20' }]}>
              <Text style={[styles.formulaText, { color: Colors.secondary }]}>Vowel</Text>
            </View>
            <Text style={styles.formulaPlus}>+</Text>
            <View style={[styles.formulaPart, { backgroundColor: Colors.accent + '20' }]}>
              <Text style={[styles.formulaText, { color: Colors.accent }]}>(Final)</Text>
            </View>
          </View>
          {SYLLABLE_EXAMPLES.map((s, i) => (
            <Pressable key={i} style={styles.syllableCard} onPress={() => speakSyllable(s.syllable)}>
              <Text style={styles.syllableChar}>{s.syllable}</Text>
              <View style={styles.syllableBreakdown}>
                <Text style={[styles.syllablePart, { color: Colors.primary }]}>{s.consonant}</Text>
                <Text style={styles.syllablePlus}>+</Text>
                <Text style={[styles.syllablePart, { color: Colors.secondary }]}>{s.vowel}</Text>
                {s.finalConsonant && (
                  <>
                    <Text style={styles.syllablePlus}>+</Text>
                    <Text style={[styles.syllablePart, { color: Colors.accent }]}>{s.finalConsonant}</Text>
                  </>
                )}
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={styles.syllableRoman}>{s.romanization}</Text>
                <Text style={styles.syllableMeaning}>{s.meaning}</Text>
              </View>
              <Ionicons name="volume-high" size={16} color={Colors.textMuted} />
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionDesc}>{section.description}</Text>
          {section.chars.map((char, i) => (
            <CharCard
              key={i}
              char={char}
              isExpanded={expandedChar === char.char}
              onToggle={() => setExpandedChar(expandedChar === char.char ? null : char.char)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, gap: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontFamily: 'NotoSansKR_700Bold', color: Colors.text },
  subtitle: { fontSize: 13, fontFamily: 'NotoSansKR_400Regular', color: Colors.textSecondary },
  tabs: { maxHeight: 44, marginBottom: 8 },
  tabsContent: { paddingHorizontal: 16, gap: 8 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.surface },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 13, fontFamily: 'NotoSansKR_500Medium', color: Colors.textSecondary },
  tabTextActive: { color: '#fff' },
  content: { flex: 1, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 20, fontFamily: 'NotoSansKR_700Bold', color: Colors.text, marginTop: 8, marginBottom: 4 },
  sectionDesc: { fontSize: 13, fontFamily: 'NotoSansKR_400Regular', color: Colors.textSecondary, marginBottom: 16 },
  charCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border },
  charRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  charText: { fontSize: 36, fontFamily: 'NotoSansKR_700Bold', width: 50, textAlign: 'center' },
  charInfo: { flex: 1, gap: 2 },
  charRoman: { fontSize: 16, fontFamily: 'NotoSansKR_700Bold', color: Colors.text },
  charSound: { fontSize: 12, fontFamily: 'NotoSansKR_400Regular', color: Colors.textSecondary },
  speakBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  charExpanded: { marginTop: 12, gap: 8, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12 },
  tipBox: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: Colors.accent + '10', borderRadius: 10, padding: 10 },
  tipText: { flex: 1, fontSize: 13, fontFamily: 'NotoSansKR_400Regular', color: Colors.accent, lineHeight: 18 },
  exampleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  exampleWord: { fontSize: 20, fontFamily: 'NotoSansKR_700Bold', color: Colors.text },
  exampleMeaning: { fontSize: 14, fontFamily: 'NotoSansKR_400Regular', color: Colors.textSecondary },
  syllableFormula: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 },
  formulaPart: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  formulaText: { fontSize: 13, fontFamily: 'NotoSansKR_700Bold' },
  formulaPlus: { fontSize: 16, color: Colors.textMuted },
  syllableCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: 14, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  syllableChar: { fontSize: 28, fontFamily: 'NotoSansKR_700Bold', color: Colors.text, width: 40, textAlign: 'center' },
  syllableBreakdown: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  syllablePart: { fontSize: 18, fontFamily: 'NotoSansKR_700Bold' },
  syllablePlus: { fontSize: 12, color: Colors.textMuted },
  syllableRoman: { fontSize: 13, fontFamily: 'NotoSansKR_500Medium', color: Colors.text },
  syllableMeaning: { fontSize: 11, fontFamily: 'NotoSansKR_400Regular', color: Colors.textMuted },
  tabActivePrinciple: { backgroundColor: Colors.secondary },
  principlesIntro: { fontSize: 18, fontFamily: 'NotoSansKR_700Bold', color: Colors.text, marginTop: 8, marginBottom: 4, lineHeight: 26 },
  principleCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: Colors.border },
  principleCardActive: { borderColor: Colors.secondary + '50' },
  principleHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  principleIconBg: { width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  principleTitle: { fontSize: 15, fontFamily: 'NotoSansKR_700Bold', color: Colors.text },
  principleTitleKr: { fontSize: 12, fontFamily: 'NotoSansKR_400Regular', color: Colors.textSecondary, marginTop: 1 },
  principleBody: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.border, gap: 12 },
  principleContent: { fontSize: 14, fontFamily: 'NotoSansKR_400Regular', color: Colors.textSecondary, lineHeight: 22 },
  principleDetails: { gap: 8 },
  principleDetail: { backgroundColor: Colors.surface, borderRadius: 12, padding: 12, gap: 4 },
  principleDetailLabel: { fontSize: 14, fontFamily: 'NotoSansKR_700Bold', color: Colors.primary },
  principleDetailDesc: { fontSize: 13, fontFamily: 'NotoSansKR_400Regular', color: Colors.text, lineHeight: 20 },
  principleDetailVisual: { fontSize: 12, fontFamily: 'NotoSansKR_500Medium', color: Colors.accent, marginTop: 2 },
});
