import React, { useState } from 'react';
import {
  StyleSheet, Text, View, Pressable, Platform, TextInput, KeyboardAvoidingView, ScrollView, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { signInWithGoogle } from '@/lib/auth';
import { Image } from 'react-native';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useApp();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const topPad = insets.top + webTopInset;

  const [mode, setMode] = useState<'landing' | 'signup' | 'login' | 'nickname'>('landing');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [pendingProvider, setPendingProvider] = useState<'google' | 'apple' | 'facebook' | 'guest' | null>(null);
  const [socialLoading, setSocialLoading] = useState(false);

  const handleEmailAuth = async () => {
    if (!name.trim() && mode === 'signup') {
      setError('Please enter your name');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (mode === 'signup') {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: email.trim(),
          name: name.trim(),
          provider: 'email',
        });
        if (profileError) console.error('Profile creation error:', profileError);
        
        await signIn({
          id: data.user.id,
          name: name.trim(),
          email: email.trim(),
          provider: 'email',
          createdAt: new Date().toISOString(),
        });
      }
    } else {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }
      
      if (data.user) {
        await signIn({
          id: data.user.id,
          name: 'Learner', // Will be overwritten by listener eventually
          email: email.trim(),
          provider: 'email',
          createdAt: new Date().toISOString(),
        });
      }
    }

    setTimeout(() => {
      router.replace('/(tabs)');
    }, 100);
  };

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'facebook') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (provider === 'google') {
      setSocialLoading(true);
      setError('');
      const { success, error: authError } = await signInWithGoogle();
      setSocialLoading(false);
      if (success) {
        router.replace('/(tabs)');
      } else {
        setError(authError || 'Google 로그인에 실패했어요');
      }
      return;
    }

    // Apple / Facebook: 닉네임 먼저
    setPendingProvider(provider);
    setName('');
    setError('');
    setMode('nickname');
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPendingProvider('guest');
    setName('');
    setError('');
    setMode('nickname');
  };

  const handleNicknameSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter your name or nickname');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const dummyEmail = pendingProvider === 'guest' 
      ? `guest-${Date.now()}@twentykorean.local` 
      : `${pendingProvider}-${Date.now()}@twentykorean.local`;
    const dummyPassword = `pass-${Date.now()}`;

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: dummyEmail,
      password: dummyPassword,
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email: pendingProvider === 'guest' ? null : dummyEmail,
        name: name.trim(),
        provider: pendingProvider || 'guest',
      });
      
      // Update local state explicitly to avoid race condition with auth listener
      if (!profileError) {
        await signIn({
          id: data.user.id,
          name: name.trim(),
          email: dummyEmail,
          provider: pendingProvider || 'guest',
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Give the auth listener a tiny bit of time to settle just in case
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 100);
  };

  if (mode === 'nickname') {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: topPad }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <ScrollView contentContainerStyle={styles.nicknameScroll} keyboardShouldPersistTaps="handled">
          <Pressable style={styles.backRow} onPress={() => { setMode('landing'); setPendingProvider(null); }}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>

          <View style={styles.nicknameHeader}>
            <View style={styles.nicknameIconBg}>
              <Ionicons name="person" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.nicknameTitle}>What should we call you?</Text>
            <Text style={styles.nicknameSubtitle}>Enter your name or nickname to personalize your learning experience</Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name / Nickname</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="happy-outline" size={18} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Alex, Min, Chris..."
                placeholderTextColor={Colors.textMuted}
                value={name}
                onChangeText={(t) => { setName(t); setError(''); }}
                autoCapitalize="words"
                autoFocus
              />
            </View>
          </View>

          <Pressable style={styles.submitBtn} onPress={handleNicknameSubmit}>
            <Text style={styles.submitBtnText}>Start Learning</Text>
            <Ionicons name="arrow-forward" size={18} color="#1A1A1A" />
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (mode === 'landing') {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <View style={styles.heroSection}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appTitle}>Klexi: 20 Korean Words</Text>
          <Text style={styles.appSubtitle}>Daily Korean in 20 Words</Text>
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
          <Pressable
            style={[styles.socialBtn, styles.googleBtn, socialLoading && { opacity: 0.6 }]}
            onPress={() => handleSocialLogin('google')}
            disabled={socialLoading}
          >
            {socialLoading ? (
              <ActivityIndicator size="small" color="#4285F4" style={{ marginRight: 8 }} />
            ) : (
              <View style={styles.googleIconWrap}>
                <Ionicons name="logo-google" size={18} color="#4285F4" />
              </View>
            )}
            <Text style={[styles.socialBtnText, { color: '#333' }]}>Continue with Google</Text>
          </Pressable>

          <Pressable style={[styles.socialBtn, styles.appleBtn]} onPress={() => handleSocialLogin('apple')}>
            <Ionicons name="logo-apple" size={22} color="#fff" />
            <Text style={styles.socialBtnText}>Continue with Apple</Text>
          </Pressable>

          <Pressable style={[styles.socialBtn, styles.facebookBtn]} onPress={() => handleSocialLogin('facebook')}>
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
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 24,
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 26,
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
    borderRadius: 14,
    paddingVertical: 14,
  },
  googleBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  googleIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleBtn: {
    backgroundColor: '#000',
  },
  facebookBtn: {
    backgroundColor: '#2C2C3A',
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
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  submitBtnText: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_700Bold',
    color: '#1A1A1A',
  },
  nicknameScroll: {
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  nicknameHeader: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32,
  },
  nicknameIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  nicknameTitle: {
    fontSize: 24,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
    textAlign: 'center',
  },
  nicknameSubtitle: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
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
