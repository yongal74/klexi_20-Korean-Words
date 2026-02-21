import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

interface PremiumGateProps {
  title?: string;
  description?: string;
  compact?: boolean;
}

export default function PremiumGate({ 
  title = 'Premium Feature', 
  description = 'Upgrade to Premium to unlock this content',
  compact = false,
}: PremiumGateProps) {
  const handleUpgrade = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/premium');
  };

  if (compact) {
    return (
      <Pressable style={styles.compactContainer} onPress={handleUpgrade}>
        <View style={styles.compactIconBg}>
          <Ionicons name="lock-closed" size={14} color={Colors.streak} />
        </View>
        <Text style={styles.compactText}>Premium</Text>
        <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconBg}>
        <Ionicons name="diamond" size={32} color={Colors.streak} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Pressable style={styles.upgradeBtn} onPress={handleUpgrade}>
        <Ionicons name="diamond-outline" size={18} color="#1A1A1A" />
        <Text style={styles.upgradeBtnText}>Upgrade to Premium</Text>
      </Pressable>
    </View>
  );
}

export function PremiumBadge() {
  return (
    <View style={styles.badge}>
      <Ionicons name="lock-closed" size={10} color={Colors.streak} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  iconBg: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Colors.streak + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.streak,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginTop: 8,
  },
  upgradeBtnText: {
    fontSize: 15,
    fontFamily: 'NotoSansKR_700Bold',
    color: '#1A1A1A',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.streak + '12',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.streak + '30',
  },
  compactIconBg: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: Colors.streak + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactText: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.streak,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.streak + '20',
    borderWidth: 1,
    borderColor: Colors.streak + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
