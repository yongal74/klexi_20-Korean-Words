import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable, Platform, Alert, ActivityIndicator, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { Analytics } from '@/lib/analytics';

const API_BASE = Platform.OS === 'web'
  ? ''
  : process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    nameKr: 'Plan',
    price: '$7.99',
    period: '/month',
    savings: '',
    popular: false,
    polarProductId: process.env.EXPO_PUBLIC_POLAR_MONTHLY_ID || '',
  },
  {
    id: 'yearly',
    name: 'Annual',
    nameKr: 'Plan',
    price: '$49.99',
    period: '/year',
    savings: 'Save 48%',
    popular: true,
    polarProductId: process.env.EXPO_PUBLIC_POLAR_YEARLY_ID || '',
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    nameKr: 'Access',
    price: '$99.99',
    period: 'one-time',
    savings: 'Best Value',
    popular: false,
    polarProductId: process.env.EXPO_PUBLIC_POLAR_LIFETIME_ID || '',
  },
];

const PREMIUM_FEATURES = [
  { icon: 'ban-outline' as const, title: 'Ad-Free Experience', titleKr: 'No Ads', desc: 'Remove all advertisements' },
  { icon: 'infinite-outline' as const, title: 'Unlimited Words', titleKr: 'Full Access', desc: 'Access all 7,200+ vocabulary words' },
  { icon: 'mic-outline' as const, title: 'Advanced Pronunciation', titleKr: 'Pro Audio', desc: 'AI-powered pronunciation scoring' },
  { icon: 'analytics-outline' as const, title: 'Detailed Analytics', titleKr: 'Insights', desc: 'In-depth learning statistics' },
  { icon: 'download-outline' as const, title: 'Offline Mode', titleKr: 'Offline', desc: 'Learn without internet connection' },
  { icon: 'color-palette-outline' as const, title: 'Custom Themes', titleKr: 'Themes', desc: 'Personalize your learning experience' },
];

export default function PremiumScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const topPad = insets.top + webTopInset;

  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    Analytics.premiumViewed('settings');
  }, []);

  const handleSubscribe = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const plan = PLANS.find(p => p.id === selectedPlan);
    if (!plan) return;

    if (!plan.polarProductId) {
      Alert.alert(
        'Coming Soon',
        'Premium subscriptions will be available soon. The payment system is being configured.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/polar/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: plan.polarProductId,
        }),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        await Linking.openURL(data.checkoutUrl);
      } else {
        Alert.alert('Error', 'Could not create checkout session. Please try again.');
      }
    } catch (error) {
      Alert.alert(
        'Connection Error',
        'Could not connect to the payment server. Please check your connection and try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Restore Purchases',
      'No previous purchases found. If you believe this is an error, please contact support.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Go Premium</Text>
        <Pressable onPress={handleRestore} style={styles.restoreButton}>
          <Text style={styles.restoreText}>Restore</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 + webBottomInset }}
      >
        <View style={styles.heroSection}>
          <View style={styles.crownCircle}>
            <Ionicons name="diamond" size={40} color={Colors.streak} />
          </View>
          <Text style={styles.heroTitle}>Twenty Korean Premium</Text>
          <Text style={styles.heroSubtitle}>Unlock the full Korean learning experience</Text>
        </View>

        <View style={styles.featuresSection}>
          {PREMIUM_FEATURES.map((feature, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={feature.icon} size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDesc}>{feature.desc}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            </View>
          ))}
        </View>

        <View style={styles.plansSection}>
          <Text style={styles.plansSectionTitle}>Choose Your Plan</Text>
          {PLANS.map((plan) => (
            <Pressable
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.planCardSelected,
                plan.popular && styles.planCardPopular,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedPlan(plan.id);
              }}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                </View>
              )}
              <View style={styles.planRadio}>
                <View style={[
                  styles.radioOuter,
                  selectedPlan === plan.id && styles.radioOuterSelected,
                ]}>
                  {selectedPlan === plan.id && <View style={styles.radioInner} />}
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.planName}>{plan.name} <Text style={styles.planNameKr}>{plan.nameKr}</Text></Text>
                {plan.savings ? (
                  <Text style={styles.planSavings}>{plan.savings}</Text>
                ) : null}
              </View>
              <View style={styles.planPricing}>
                <Text style={styles.planPrice}>{plan.price}</Text>
                <Text style={styles.planPeriod}>{plan.period}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[styles.subscribeButton, isLoading && styles.subscribeButtonDisabled]}
          onPress={handleSubscribe}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <>
              <Ionicons name="diamond" size={20} color="#000" />
              <Text style={styles.subscribeButtonText}>Start Premium</Text>
            </>
          )}
        </Pressable>

        <View style={styles.poweredBySection}>
          <Ionicons name="shield-checkmark-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.poweredByText}>Secure payment via Polar (MoR)</Text>
        </View>

        <Text style={styles.termsText}>
          Cancel anytime. Subscription auto-renews unless cancelled 24 hours before the end of the current period. Payments are processed securely by Polar as Merchant of Record.
        </Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  restoreButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  restoreText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 32,
  },
  crownCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.streak + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresSection: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.card,
    padding: 14,
    borderRadius: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  featureDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  plansSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  plansSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 14,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  planCardSelected: {
    borderColor: Colors.primary,
  },
  planCardPopular: {
    borderColor: Colors.streak + '60',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.streak,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
  },
  popularBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 0.5,
  },
  planRadio: {
    marginRight: 14,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  planNameKr: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  planSavings: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600',
    marginTop: 2,
  },
  planPricing: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  planPeriod: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  subscribeButtonDisabled: {
    opacity: 0.7,
  },
  subscribeButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#000',
  },
  poweredBySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 10,
  },
  poweredByText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  termsText: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 16,
  },
});
