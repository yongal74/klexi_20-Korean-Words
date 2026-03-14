/**
 * Analytics Tests
 * Agent: ANALYTICS
 */

import { Analytics, setAnalyticsProvider, AnalyticsProvider } from '../../lib/analytics';

describe('Analytics 이벤트', () => {
  let mockProvider: jest.Mocked<AnalyticsProvider>;

  beforeEach(() => {
    mockProvider = {
      logEvent: jest.fn().mockResolvedValue(undefined),
    };
    setAnalyticsProvider(mockProvider);
  });

  describe('wordLearned', () => {
    it('올바른 파라미터로 logEvent 호출', async () => {
      await Analytics.wordLearned('n1_001', 1, true);
      expect(mockProvider.logEvent).toHaveBeenCalledWith('word_learned', {
        word_id: 'n1_001',
        level: 1,
        knew: true,
      });
    });
  });

  describe('quizCompleted', () => {
    it('점수, 총 문제, XP, 레벨 포함', async () => {
      await Analytics.quizCompleted(8, 10, 120, 2);
      expect(mockProvider.logEvent).toHaveBeenCalledWith('quiz_completed', {
        score: 8,
        total: 10,
        xp_earned: 120,
        topik_level: 2,
      });
    });
  });

  describe('streakUpdated', () => {
    it('days 파라미터 포함', async () => {
      await Analytics.streakUpdated(7);
      expect(mockProvider.logEvent).toHaveBeenCalledWith('streak_updated', { days: 7 });
    });
  });

  describe('srsReviewed', () => {
    it('wordId와 quality 포함', async () => {
      await Analytics.srsReviewed('n1_001', 4);
      expect(mockProvider.logEvent).toHaveBeenCalledWith('srs_reviewed', {
        word_id: 'n1_001',
        quality: 4,
      });
    });
  });

  describe('premiumViewed', () => {
    it('source 포함', async () => {
      await Analytics.premiumViewed('settings');
      expect(mockProvider.logEvent).toHaveBeenCalledWith('premium_viewed', { source: 'settings' });
    });
  });

  describe('premiumPurchased', () => {
    it('플랜과 금액 포함', async () => {
      await Analytics.premiumPurchased('yearly', 49.99);
      expect(mockProvider.logEvent).toHaveBeenCalledWith('premium_purchased', {
        plan: 'yearly',
        amount: 49.99,
      });
    });
  });

  describe('aiChatSent', () => {
    it('messageLength와 topikLevel 포함', async () => {
      await Analytics.aiChatSent(50, 2);
      expect(mockProvider.logEvent).toHaveBeenCalledWith('ai_chat_sent', {
        message_length: 50,
        topik_level: 2,
      });
    });
  });

  describe('levelUp', () => {
    it('fromLevel, toLevel, totalXP 포함', async () => {
      await Analytics.levelUp(2, 3, 300);
      expect(mockProvider.logEvent).toHaveBeenCalledWith('level_up', {
        from_level: 2,
        to_level: 3,
        total_xp: 300,
      });
    });
  });

  describe('achievementUnlocked', () => {
    it('achievementId 포함', async () => {
      await Analytics.achievementUnlocked('first-steps');
      expect(mockProvider.logEvent).toHaveBeenCalledWith('achievement_unlocked', {
        achievement_id: 'first-steps',
      });
    });
  });

  describe('featureUsed', () => {
    it('featureName 포함', async () => {
      await Analytics.featureUsed('hangeul');
      expect(mockProvider.logEvent).toHaveBeenCalledWith('feature_used', {
        feature_name: 'hangeul',
      });
    });
  });

  describe('에러 처리', () => {
    it('logEvent 실패해도 throw 안 함 (mock provider)', async () => {
      mockProvider.logEvent.mockRejectedValue(new Error('Network error'));
      await expect(Analytics.wordLearned('n1_001', 1, true)).resolves.not.toThrow();
    });
  });

  describe('PII 없음 확인', () => {
    it('quizCompleted 파라미터에 개인정보 없음', async () => {
      await Analytics.quizCompleted(8, 10, 120, 2);
      const callArgs = mockProvider.logEvent.mock.calls[0][1];
      expect(callArgs).not.toHaveProperty('email');
      expect(callArgs).not.toHaveProperty('name');
      expect(callArgs).not.toHaveProperty('phone');
    });
  });
});
