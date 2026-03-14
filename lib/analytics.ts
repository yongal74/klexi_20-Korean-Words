export interface AnalyticsProvider {
  logEvent(name: string, params?: Record<string, unknown>): Promise<void>;
}

class FirebaseAnalytics implements AnalyticsProvider {
  private analytics: any = null;

  private async getAnalytics() {
    if (!this.analytics) {
      try {
        const { default: analytics } = await import('@react-native-firebase/analytics');
        this.analytics = analytics();
      } catch {
        return null;
      }
    }
    return this.analytics;
  }

  async logEvent(name: string, params?: Record<string, unknown>): Promise<void> {
    try {
      const analytics = await this.getAnalytics();
      if (analytics) {
        await analytics.logEvent(name, params);
      }
    } catch (error) {
      console.warn('[Analytics] logEvent failed:', name, error);
    }
  }
}

let provider: AnalyticsProvider = new FirebaseAnalytics();

export function setAnalyticsProvider(p: AnalyticsProvider) {
  provider = p;
}

function safeLog(name: string, params?: Record<string, unknown>): Promise<void> {
  return Promise.resolve(provider.logEvent(name, params)).catch((error) => {
    console.warn('[Analytics] logEvent failed:', name, error);
  });
}

export const Analytics = {
  wordLearned: (wordId: string, level: number, knew: boolean) =>
    safeLog('word_learned', { word_id: wordId, level, knew }),

  quizCompleted: (score: number, total: number, xpEarned: number, topikLevel: number) =>
    provider.logEvent('quiz_completed', { score, total, xp_earned: xpEarned, topik_level: topikLevel }),

  streakUpdated: (days: number) =>
    safeLog('streak_updated', { days }),

  srsReviewed: (wordId: string, quality: number) =>
    safeLog('srs_reviewed', { word_id: wordId, quality }),

  premiumViewed: (source: string) =>
    safeLog('premium_viewed', { source }),

  premiumPurchased: (plan: 'monthly' | 'yearly' | 'lifetime', amount: number) =>
    safeLog('premium_purchased', { plan, amount }),

  aiChatSent: (messageLength: number, topikLevel: number) =>
    safeLog('ai_chat_sent', { message_length: messageLength, topik_level: topikLevel }),

  levelUp: (fromLevel: number, toLevel: number, totalXP: number) =>
    safeLog('level_up', { from_level: fromLevel, to_level: toLevel, total_xp: totalXP }),

  achievementUnlocked: (achievementId: string) =>
    safeLog('achievement_unlocked', { achievement_id: achievementId }),

  featureUsed: (featureName: string) =>
    safeLog('feature_used', { feature_name: featureName }),
};
