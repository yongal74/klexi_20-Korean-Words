import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { fetch as expoFetch } from 'expo/fetch';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/AppContext';
import { Analytics } from '@/lib/analytics';

const CHAT_STORAGE_KEY = '@daily_korean_ai_chat';
const CHAT_COUNT_KEY = '@daily_korean_ai_chat_count';
const FREE_MESSAGE_LIMIT = 5;
const API_BASE = Platform.OS === 'web'
  ? `${typeof window !== 'undefined' ? window.location.protocol : 'https:'}//${process.env.EXPO_PUBLIC_DOMAIN || 'localhost:5000'}`
  : `https://${process.env.EXPO_PUBLIC_DOMAIN || 'localhost:5000'}`;

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const SUGGESTIONS = [
  '안녕하세요! (Hello!)',
  'How do I introduce myself?',
  "What does '감사합니다' mean?",
  'Teach me ordering food in Korean',
];

export default function AIChatScreen() {
  const insets = useSafeAreaInsets();
  const { settings, isPremium } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const freeMessagesLeft = Math.max(0, FREE_MESSAGE_LIMIT - messageCount);
  const isLocked = !isPremium && messageCount >= FREE_MESSAGE_LIMIT;

  useEffect(() => {
    AsyncStorage.getItem(CHAT_STORAGE_KEY).then((data) => {
      if (data) {
        try { setMessages(JSON.parse(data)); } catch {}
      }
    });
    AsyncStorage.getItem(CHAT_COUNT_KEY).then((data) => {
      if (data) setMessageCount(parseInt(data) || 0);
    });
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-50)));
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const speakWithDeviceTTS = useCallback((text: string) => {
    const koreanOnly = text.replace(/[a-zA-Z\(\)\/\-\[\]'"!?.,:;@#$%^&*0-9\n]/g, ' ').replace(/\s+/g, ' ').trim();
    const textToSpeak = koreanOnly.length > 5 ? koreanOnly : text;
    Speech.stop();
    setIsSpeaking(true);
    Speech.speak(textToSpeak, {
      language: 'ko-KR',
      rate: 0.9,
      pitch: 1.05,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  }, []);

  const speakWithAITTS = useCallback(async (text: string) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      setIsSpeaking(true);

      const response = await fetch(`${API_BASE}/api/ai-tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'nova' }),
      });

      if (!response.ok) {
        speakWithDeviceTTS(text);
        return;
      }

      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          const uri = `data:audio/mpeg;base64,${base64}`;
          const { sound } = await Audio.Sound.createAsync({ uri });
          soundRef.current = sound;
          sound.setOnPlaybackStatusUpdate((status) => {
            if ('didJustFinish' in status && status.didJustFinish) {
              setIsSpeaking(false);
            }
          });
          await sound.playAsync();
        } catch {
          setIsSpeaking(false);
        }
      };
      reader.readAsDataURL(blob);
    } catch {
      speakWithDeviceTTS(text);
    }
  }, [speakWithDeviceTTS]);

  const speakText = useCallback((text: string) => {
    if (isPremium) {
      speakWithAITTS(text);
    } else {
      speakWithDeviceTTS(text);
    }
  }, [isPremium, speakWithAITTS, speakWithDeviceTTS]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading || isLocked) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Analytics.aiChatSent(text.trim().length, parseInt(settings.selectedLevel?.replace(/\D/g, '') || '1') || 1);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    const newCount = messageCount + 1;
    setMessageCount(newCount);
    AsyncStorage.setItem(CHAT_COUNT_KEY, newCount.toString());

    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const apiMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await expoFetch(`${API_BASE}/api/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          userLevel: parseInt(settings.selectedLevel.replace(/\D/g, '').charAt(0) || '1'),
        }),
      });

      if (!response.ok) throw new Error('Failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let fullContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              fullContent += data.content;
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.role === 'assistant') {
                  updated[updated.length - 1] = { ...last, content: fullContent };
                }
                return updated;
              });
            }
            if (data.done) break;
            if (data.error) throw new Error(data.error);
          } catch (e) {
            if (!(e instanceof SyntaxError)) throw e;
          }
        }
      }

      if (fullContent) {
        speakText(fullContent);
      }
    } catch (error) {
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.role === 'assistant' && !last.content) {
          updated[updated.length - 1] = {
            ...last,
            content: 'Sorry, I couldn\'t respond right now. Please try again!',
          };
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, settings.selectedLevel, messageCount, isLocked, speakText]);

  const clearChat = useCallback(() => {
    setMessages([]);
    AsyncStorage.removeItem(CHAT_STORAGE_KEY);
  }, []);

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        {!isUser && (
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>달</Text>
            </View>
            <Text style={styles.botName}>Dalli</Text>
            {!isUser && item.content && (
              <Pressable
                onPress={() => speakText(item.content)}
                style={styles.speakBtn}
                hitSlop={8}
              >
                <Ionicons name={isSpeaking ? 'volume-high' : 'volume-medium-outline'} size={16} color={Colors.primary} />
              </Pressable>
            )}
          </View>
        )}
        <Text style={[styles.messageText, isUser && styles.userText]}>
          {item.content || (isLoading ? '...' : '')}
        </Text>
      </View>
    );
  }, [isLoading, isSpeaking, speakText]);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Korean Chat</Text>
          <Text style={styles.subtitle}>Practice with AI Tutor</Text>
        </View>
        {!isPremium && (
          <View style={styles.freeCountBadge}>
            <Ionicons name="chatbubble-outline" size={12} color={freeMessagesLeft > 0 ? Colors.primary : Colors.error} />
            <Text style={[styles.freeCountText, freeMessagesLeft === 0 && { color: Colors.error }]}>{freeMessagesLeft}</Text>
          </View>
        )}
        <Pressable onPress={clearChat} style={styles.clearBtn}>
          <Ionicons name="trash-outline" size={20} color={Colors.textSecondary} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyAvatar}>
              <Text style={styles.emptyAvatarText}>달리</Text>
            </View>
            <Text style={styles.emptyTitle}>Hi! I'm Dalli</Text>
            <Text style={styles.emptyDesc}>
              Your Korean conversation partner.{'\n'}Ask me anything or practice chatting in Korean!
            </Text>
            {!isPremium && (
              <View style={styles.freeBanner}>
                <Ionicons name="gift-outline" size={16} color={Colors.primary} />
                <Text style={styles.freeBannerText}>{freeMessagesLeft} free messages remaining</Text>
              </View>
            )}
            <View style={styles.suggestions}>
              {SUGGESTIONS.map((s, i) => (
                <Pressable key={i} style={[styles.suggestionBtn, isLocked && styles.suggestionBtnLocked]} onPress={() => !isLocked && sendMessage(s)} disabled={isLocked}>
                  <Text style={[styles.suggestionText, isLocked && styles.suggestionTextLocked]}>{s}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.messageList, { paddingBottom: 8 }]}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
          />
        )}

        {isLocked ? (
          <View style={[styles.lockedBar, { paddingBottom: Math.max(bottomPad, 12) }]}>
            <Ionicons name="lock-closed" size={18} color={Colors.streak} />
            <Text style={styles.lockedText}>Free messages used up</Text>
            <Pressable
              style={styles.upgradeBtn}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/premium'); }}
            >
              <Ionicons name="diamond" size={14} color="#1A1A1A" />
              <Text style={styles.upgradeBtnText}>Upgrade</Text>
            </Pressable>
          </View>
        ) : (
          <View style={[styles.inputBar, { paddingBottom: Math.max(bottomPad, 12) }]}>
            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder="Type in Korean or English..."
              placeholderTextColor={Colors.textMuted}
              multiline
              maxLength={500}
              editable={!isLoading}
              onSubmitEditing={() => sendMessage(input)}
              returnKeyType="send"
            />
            <Pressable
              style={[styles.sendBtn, (!input.trim() || isLoading) && styles.sendBtnDisabled]}
              onPress={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#1A1A1A" />
              ) : (
                <Ionicons name="send" size={20} color="#1A1A1A" />
              )}
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
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
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  freeCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
  },
  freeCountText: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.primary,
  },
  clearBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyAvatarText: {
    fontSize: 28,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.primary,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  freeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary + '10',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 20,
  },
  freeBannerText: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.primary,
  },
  suggestions: {
    width: '100%',
    gap: 8,
  },
  suggestionBtn: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestionBtnLocked: {
    opacity: 0.4,
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.text,
  },
  suggestionTextLocked: {
    color: Colors.textMuted,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  messageBubble: {
    maxWidth: '85%',
    marginBottom: 12,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.card,
    borderBottomLeftRadius: 4,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 10,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.primary,
  },
  botName: {
    fontSize: 11,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.primary,
  },
  speakBtn: {
    marginLeft: 'auto',
    padding: 2,
  },
  messageText: {
    fontSize: 15,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.text,
    lineHeight: 22,
  },
  userText: {
    color: '#1A1A1A',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  lockedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
    gap: 10,
  },
  lockedText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.textSecondary,
    flex: 1,
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.streak,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  upgradeBtnText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_700Bold',
    color: '#1A1A1A',
  },
});
