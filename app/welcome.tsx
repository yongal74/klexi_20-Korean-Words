import React, { useState } from 'react';
import {
  StyleSheet, Text, View, Pressable, Platform, TextInput, KeyboardAvoidingView, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/AppContext';
import type { UserProfile } from '@/lib/storage';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useApp();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const topPad = insets.top + webTopInset;

  const [mode, setMode] = useState<'landing' | 'signup' | 'login'>('landing');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleEmailAuth = async () => {
    if (!name.trim() && mode === 'signup') {
      setError('Please enter your name');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!password.trim() || password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const profile: UserProfile = {
      id: `user-${Date.now()}`,
      name: mode === 'signup' ? name.trim() : email.split('@')[0],
      email: email.trim(),
      provider: 'email',
      createdAt: new Date().toISOString(),
    };
    await signIn(profile);
    router.replace('/(tabs)');
  };

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'facebook') => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const providerNames = { google: 'Google', apple: 'Apple', facebook: 'Facebook' };
    const profile: UserProfile = {
      id: `${provider}-${Date.now()}`,
      name: `${providerNames[provider]} User`,
      email: `user@${provider}.com`,
      provider,
      createdAt: new Date().toISOString(),
    };
    await signIn(profile);
    router.replace('/(tabs)');
  };

  const handleSkip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const profile: UserProfile = {
      id: `guest-${Date.now()}`,
      name: 'Learner',
      email: '',
      provider: 'email',
      createdAt: new Date().toISOString(),
    };
    await signIn(profile);
    router.replace('/(tabs)');
  };

  if (mode === 'landing') {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoKorean}>한</Text>
          </View>
          <Text style={styles.appTitle}>Daily Korean</Text>
          <Text style={styles.appSubtitle}>Master Korean with TOPIK-based lessons,{'\n'}K-Culture themes & word networks</Text>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureItem}>
            <Ionicons name="book" size={22} color={Colors.primary} />
            <Text style={styles.featureText}>7,200+ Words</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="film" size={22} color={Colors.secondary} />
            <Text style={styles.featureText}>K-Drama</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="git-network" size={22} color={Colors.accent} />
            <Text style={styles.featureText}>Word Net</Text>
          </View>
        </View>

        <View style={styles.authButtons}>
          <Pressable style={styles.socialBtn} onPress={() => handleSocialLogin('google')}>
            <Ionicons name="logo-google" size={20} color="#fff" />
            <Text style={styles.socialBtnText}>Continue with Google</Text>
          </Pressable>

          <Pressable style={[styles.socialBtn, { backgroundColor: '#000' }]} onPress={() => handleSocialLogin('apple')}>
            <Ionicons name="logo-apple" size={20} color="#fff" />
            <Text style={styles.socialBtnText}>Continue with Apple</Text>
          </Pressable>

          <Pressable style={[styles.socialBtn, { backgroundColor: '#1877F2' }]} onPress={() => handleSocialLogin('facebook')}>
            <Ionicons name="logo-facebook" size={20} color="#fff" />
            <Text style={styles.socialBtnText}>Continue with Facebook</Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable style={[styles.socialBtn, styles.emailBtn]} onPress={() => setMode('signup')}>
            <Ionicons name="mail" size={20} color={Colors.primary} />
            <Text style={[styles.socialBtnText, { color: Colors.primary }]}>Sign up with Email</Text>
          </Pressable>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <Pressable onPress={() => setMode('login')}>
              <Text style={styles.loginLink}>Log in</Text>
            </Pressable>
          </View>
        </View>

        <Pressable style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip for now</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.textMuted} />
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: topPad }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <ScrollView contentContainerStyle={styles.formScroll} keyboardShouldPersistTaps="handled">
        <Pressable style={styles.backRow} onPress={() => setMode('landing')}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>

        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>{mode === 'signup' ? 'Create Account' : 'Welcome Back'}</Text>
          <Text style={styles.formSubtitle}>
            {mode === 'signup' ? 'Start your Korean learning journey' : 'Log in to continue learning'}
          </Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {mode === 'signup' && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor={Colors.textMuted}
                value={name}
                onChangeText={(t) => { setName(t); setError(''); }}
                autoCapitalize="words"
              />
            </View>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={(t) => { setEmail(t); setError(''); }}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={(t) => { setPassword(t); setError(''); }}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={18} color={Colors.textMuted} />
            </Pressable>
          </View>
        </View>

        <Pressable style={styles.submitBtn} onPress={handleEmailAuth}>
          <Text style={styles.submitBtnText}>{mode === 'signup' ? 'Create Account' : 'Log In'}</Text>
        </Pressable>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>
            {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
          </Text>
          <Pressable onPress={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); }}>
            <Text style={styles.switchLink}>{mode === 'signup' ? 'Log in' : 'Sign up'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoKorean: {
    fontSize: 40,
    fontFamily: 'NotoSansKR_700Bold',
    color: '#fff',
  },
  appTitle: {
    fontSize: 28,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  appSubtitle: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 16,
  },
  featureItem: {
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.textSecondary,
  },
  authButtons: {
    paddingHorizontal: 24,
    gap: 12,
    paddingTop: 16,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#4285F4',
    borderRadius: 14,
    paddingVertical: 14,
  },
  socialBtnText: {
    fontSize: 15,
    fontFamily: 'NotoSansKR_500Medium',
    color: '#fff',
  },
  emailBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textMuted,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 4,
  },
  loginText: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.primary,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    marginTop: 'auto',
    marginBottom: Platform.OS === 'web' ? 34 : 20,
  },
  skipText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textMuted,
  },
  formScroll: {
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  backRow: {
    paddingVertical: 12,
  },
  formHeader: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  formTitle: {
    fontSize: 26,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
  },
  formSubtitle: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    marginTop: 6,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.error + '15',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.error,
  },
  inputGroup: {
    marginBottom: 16,
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.textSecondary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.text,
    paddingVertical: 14,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_700Bold',
    color: '#fff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 20,
  },
  switchText: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
  },
  switchLink: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.primary,
  },
});
