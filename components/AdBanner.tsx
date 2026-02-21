import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

type AdSize = 'banner' | 'large' | 'inline';

interface AdBannerProps {
  size?: AdSize;
  style?: any;
}

export default function AdBanner({ size = 'banner', style }: AdBannerProps) {
  const height = size === 'large' ? 100 : size === 'inline' ? 80 : 60;

  return (
    <View style={[styles.container, { height }, style]}>
      <View style={styles.content}>
        <View style={styles.adLabel}>
          <Text style={styles.adLabelText}>AD</Text>
        </View>
        <View style={styles.placeholder}>
          <Ionicons name="megaphone-outline" size={size === 'banner' ? 18 : 22} color={Colors.textMuted} />
          <Text style={styles.placeholderText}>
            {size === 'large' ? 'Premium Ad Space' : 'Ad Space'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  adLabel: {
    position: 'absolute',
    top: 4,
    left: 6,
    backgroundColor: Colors.textMuted + '40',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  adLabelText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  placeholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});
