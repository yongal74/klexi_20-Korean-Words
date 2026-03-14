# CLAUDE.md — Agent ANALYTICS
# Klexi: 20 Korean Words — Firebase Analytics 에이전트

---

## 이 에이전트의 임무

**Firebase Analytics 연동으로 마케팅/제품 의사결정 데이터 수집**

브랜치: `agent/analytics`
머지 대상: `main`

---

## 절대 규칙

1. **TDD 필수**: analytics 래퍼 함수는 반드시 테스트 가능하게 설계
2. **PII 수집 금지**: 이름, 이메일, 전화번호 등 개인정보는 이벤트에 포함 금지
3. **커밋 메시지**: `feat(analytics): ...`
4. **성능 영향 최소화**: analytics 호출은 async, 실패해도 앱 동작에 영향 없어야 함

---

## 수집할 핵심 이벤트 10개

| 이벤트명 | 트리거 | 파라미터 |
|---------|--------|---------|
| `word_learned` | 단어 학습 완료 | wordId, level, knew(bool) |
| `quiz_completed` | 퀴즈 완료 | score, total, xpEarned, topikLevel |
| `streak_updated` | 스트릭 증가 | days |
| `srs_reviewed` | SRS 복습 완료 | wordId, quality(0-5) |
| `premium_viewed` | 프리미엄 화면 진입 | source(어디서 왔는지) |
| `premium_purchased` | 결제 완료 | plan(monthly/yearly/lifetime), amount |
| `ai_chat_sent` | AI 메시지 전송 | messageLength, topikLevel |
| `level_up` | 레벨업 | fromLevel, toLevel, totalXP |
| `achievement_unlocked` | 뱃지 획득 | achievementId |
| `feature_used` | 기능 사용 | featureName(hangeul/grammar/theme 등) |

---

## 작업 순서

### Phase 1: 테스트 작성 (RED)

```
__tests__/lib/analytics.test.ts
```

### Phase 2: Firebase 프로젝트 설정 (수동 — 사용자 직접)

```
1. console.firebase.google.com → 새 프로젝트 "klexi-app"
2. Android 앱 추가: com.klexi.twentykorean (app.json의 bundleIdentifier)
3. google-services.json 다운로드 → 프로젝트 루트에 저장
4. iOS 앱 추가 (필요 시)
5. GoogleService-Info.plist 다운로드
```

### Phase 3: 의존성 설치

```bash
npx expo install @react-native-firebase/app
npx expo install @react-native-firebase/analytics

# app.json에 플러그인 추가
```

### Phase 4: analytics 래퍼 구현

### Phase 5: 앱 전체에 이벤트 추가

---

## 구현 스펙

### lib/analytics.ts

```typescript
// Firebase 모킹이 쉽도록 인터페이스 분리
export interface AnalyticsProvider {
  logEvent(name: string, params?: Record<string, any>): Promise<void>;
}

// 실제 Firebase 구현
class FirebaseAnalytics implements AnalyticsProvider {
  private analytics: any = null;

  private async getAnalytics() {
    if (!this.analytics) {
      const { default: analytics } = await import('@react-native-firebase/analytics');
      this.analytics = analytics();
    }
    return this.analytics;
  }

  async logEvent(name: string, params?: Record<string, any>): Promise<void> {
    try {
      const analytics = await this.getAnalytics();
      await analytics.logEvent(name, params);
    } catch (error) {
      // 절대 throw 하지 않음 — analytics 실패가 앱 동작에 영향 주면 안 됨
      console.warn('[Analytics] logEvent failed:', name, error);
    }
  }
}

// 싱글톤
let provider: AnalyticsProvider = new FirebaseAnalytics();

// 테스트에서 교체 가능하도록 setter 제공
export function setAnalyticsProvider(p: AnalyticsProvider) {
  provider = p;
}

// ────────────────────────────────────
// 타입-안전 이벤트 함수들
// ────────────────────────────────────

export const Analytics = {
  wordLearned: (wordId: string, level: number, knew: boolean) =>
    provider.logEvent('word_learned', { word_id: wordId, level, knew }),

  quizCompleted: (score: number, total: number, xpEarned: number, topikLevel: number) =>
    provider.logEvent('quiz_completed', { score, total, xp_earned: xpEarned, topik_level: topikLevel }),

  streakUpdated: (days: number) =>
    provider.logEvent('streak_updated', { days }),

  srsReviewed: (wordId: string, quality: number) =>
    provider.logEvent('srs_reviewed', { word_id: wordId, quality }),

  premiumViewed: (source: string) =>
    provider.logEvent('premium_viewed', { source }),

  premiumPurchased: (plan: 'monthly' | 'yearly' | 'lifetime', amount: number) =>
    provider.logEvent('premium_purchased', { plan, amount }),

  aiChatSent: (messageLength: number, topikLevel: number) =>
    provider.logEvent('ai_chat_sent', { message_length: messageLength, topik_level: topikLevel }),

  levelUp: (fromLevel: number, toLevel: number, totalXP: number) =>
    provider.logEvent('level_up', { from_level: fromLevel, to_level: toLevel, total_xp: totalXP }),

  achievementUnlocked: (achievementId: string) =>
    provider.logEvent('achievement_unlocked', { achievement_id: achievementId }),

  featureUsed: (featureName: string) =>
    provider.logEvent('feature_used', { feature_name: featureName }),
};
```

### app.json 업데이트

```json
{
  "expo": {
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/analytics"
    ],
    "android": {
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

### 이벤트 추가 위치 (각 화면)

```typescript
// app/word-learn.tsx — 단어 학습 완료 시
Analytics.wordLearned(word.id, settings.level, knew);

// app/(tabs)/quiz.tsx — 퀴즈 완료 시
Analytics.quizCompleted(score, total, xpEarned, settings.level);

// lib/AppContext.tsx — 스트릭 업데이트 시
Analytics.streakUpdated(newStreak);

// app/premium.tsx — 화면 진입 시
Analytics.premiumViewed(route.params?.source || 'settings');

// app/ai-chat.tsx — 메시지 전송 시
Analytics.aiChatSent(message.length, settings.level);
```

---

## 테스트 스펙

### __tests__/lib/analytics.test.ts

```typescript
import { Analytics, setAnalyticsProvider, AnalyticsProvider } from '../../lib/analytics';

describe('Analytics', () => {
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

  describe('premiumPurchased', () => {
    it('플랜과 금액 포함', async () => {
      await Analytics.premiumPurchased('yearly', 49.99);
      expect(mockProvider.logEvent).toHaveBeenCalledWith('premium_purchased', {
        plan: 'yearly',
        amount: 49.99,
      });
    });
  });

  describe('에러 처리', () => {
    it('logEvent 실패해도 throw 안 함', async () => {
      mockProvider.logEvent.mockRejectedValue(new Error('Network error'));
      // 에러 없이 완료되어야 함
      await expect(Analytics.wordLearned('n1_001', 1, true)).resolves.not.toThrow();
    });
  });

  describe('PII 없음 확인', () => {
    it('이메일, 이름 등 개인정보 파라미터 없음', async () => {
      await Analytics.quizCompleted(8, 10, 120, 2);
      const callArgs = mockProvider.logEvent.mock.calls[0][1];
      expect(callArgs).not.toHaveProperty('email');
      expect(callArgs).not.toHaveProperty('name');
      expect(callArgs).not.toHaveProperty('phone');
    });
  });
});
```

---

## 완료 기준

```
□ npm test -- --testPathPattern="analytics" → 모든 테스트 통과
□ lib/analytics.ts 생성
□ 10개 핵심 이벤트 함수 구현
□ word-learn, quiz, premium, ai-chat 화면에 이벤트 추가
□ Firebase Console에서 DebugView로 이벤트 수신 확인
□ analytics 실패 시 앱 crash 없음 확인
□ git commit -m "feat(analytics): Firebase Analytics 10개 핵심 이벤트 구현"
```
