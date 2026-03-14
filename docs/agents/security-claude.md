# CLAUDE.md — Agent SECURITY
# Klexi: 20 Korean Words — 보안 + TypeScript 정리 에이전트

---

## 이 에이전트의 임무

**보안 취약점 해소 + TypeScript 에러 0개 달성 + 핵심 비즈니스 로직 단위 테스트 작성**

브랜치: `agent/security`
머지 대상: `main` (가장 먼저 머지됨)

---

## 절대 규칙

1. **TDD 필수**: 테스트 먼저, 구현 나중
2. **기능 변경 금지**: 이 에이전트는 기능을 추가/변경하지 않음. 오직 수정/정리만
3. **커밋 메시지**: `fix(security): ...` 또는 `test: ...` 형식
4. **다른 에이전트 영역 침범 금지**: 소셜 로그인, 알림, 애널리틱스 코드 건드리지 말 것

---

## 작업 목록

### 1. 보안 수정 (최우선)

```bash
# .gitignore 확인 및 보강
cat .gitignore
# 없으면 추가:
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo "*.aab" >> .gitignore
echo "*.apk" >> .gitignore
echo "*.ipa" >> .gitignore
echo "google-services.json" >> .gitignore
echo "GoogleService-Info.plist" >> .gitignore
```

```bash
# .env가 git에 추적되고 있으면 즉시 제거
git rm --cached .env 2>/dev/null || true
```

### 2. TypeScript 에러 수정

```bash
# 에러 목록 확인
npx tsc --noEmit 2>&1

# 예상 에러 1: settings.tsx:24 — ImpactFeedbackStyle.Warning
# 수정: .Warning → .Medium

# 예상 에러 18개: replit_integrations/ 폴더
# 수정: tsconfig.json exclude에 추가
```

**tsconfig.json 수정:**
```json
{
  "compilerOptions": { ... },
  "exclude": [
    "node_modules",
    "server/replit_integrations"
  ]
}
```

### 3. 핵심 비즈니스 로직 테스트 작성

테스트 작성 대상:
- `lib/srs.ts` — SM-2 알고리즘
- `lib/gamification.ts` — XP/레벨 계산
- `lib/vocabulary.ts` — 단어 필터링

---

## 테스트 스펙 (RED 먼저 작성)

### __tests__/lib/srs.test.ts

```typescript
import { updateSRSCard, createSRSCard, isDueForReview } from '../../lib/srs';

describe('SRS SM-2 Algorithm', () => {
  describe('createSRSCard', () => {
    it('초기 카드는 interval=1, easeFactor=2.5, repetitions=0', () => {
      const card = createSRSCard('word_001');
      expect(card.wordId).toBe('word_001');
      expect(card.interval).toBe(1);
      expect(card.easeFactor).toBeCloseTo(2.5);
      expect(card.repetitions).toBe(0);
    });
  });

  describe('updateSRSCard — 정답 시나리오', () => {
    it('첫 번째 정답: interval = 1일', () => {
      const card = createSRSCard('word_001');
      const updated = updateSRSCard(card, 4);
      expect(updated.interval).toBe(1);
      expect(updated.repetitions).toBe(1);
    });

    it('두 번째 연속 정답: interval = 6일', () => {
      let card = createSRSCard('word_001');
      card = updateSRSCard(card, 4);
      card = updateSRSCard(card, 4);
      expect(card.interval).toBe(6);
      expect(card.repetitions).toBe(2);
    });

    it('세 번째 정답: interval = 이전 × easeFactor (기하급수)', () => {
      let card = createSRSCard('word_001');
      card = updateSRSCard(card, 4);  // interval: 1
      card = updateSRSCard(card, 4);  // interval: 6
      card = updateSRSCard(card, 4);  // interval: 6 * 2.5 = 15
      expect(card.interval).toBeGreaterThan(6);
    });

    it('높은 품질(5) → easeFactor 증가', () => {
      const card = createSRSCard('word_001');
      const updated = updateSRSCard(card, 5);
      expect(updated.easeFactor).toBeGreaterThan(2.5);
    });
  });

  describe('updateSRSCard — 오답 시나리오', () => {
    it('오답(quality < 3) → repetitions 리셋, interval = 1', () => {
      let card = createSRSCard('word_001');
      card = updateSRSCard(card, 4);
      card = updateSRSCard(card, 4);
      // 진도: repetitions=2, interval=6
      const afterFail = updateSRSCard(card, 1);
      expect(afterFail.repetitions).toBe(0);
      expect(afterFail.interval).toBe(1);
    });

    it('낮은 품질(1) → easeFactor 감소 (최소 1.3 보장)', () => {
      let card = createSRSCard('word_001');
      // 여러 번 틀려도 1.3 미만으로 내려가지 않음
      for (let i = 0; i < 10; i++) {
        card = updateSRSCard(card, 0);
      }
      expect(card.easeFactor).toBeGreaterThanOrEqual(1.3);
    });
  });

  describe('isDueForReview', () => {
    it('nextReview가 오늘 이전이면 true', () => {
      const card = createSRSCard('word_001');
      // nextReview를 과거로 설정
      const pastCard = { ...card, nextReview: new Date(Date.now() - 86400000).toISOString() };
      expect(isDueForReview(pastCard)).toBe(true);
    });

    it('nextReview가 미래이면 false', () => {
      const card = createSRSCard('word_001');
      const futureCard = { ...card, nextReview: new Date(Date.now() + 86400000).toISOString() };
      expect(isDueForReview(futureCard)).toBe(false);
    });
  });
});
```

### __tests__/lib/gamification.test.ts

```typescript
import { addXP, calcLevel, checkAchievements } from '../../lib/gamification';

describe('Gamification System', () => {
  describe('addXP', () => {
    it('단어 학습: +20 XP', () => {
      const state = { xp: 0, level: 1, achievements: [], xpHistory: [] };
      const updated = addXP(state, 'word_learned');
      expect(updated.xp).toBeGreaterThan(0);
    });

    it('퀴즈 정답: +15 XP', () => {
      const state = { xp: 0, level: 1, achievements: [], xpHistory: [] };
      const updated = addXP(state, 'quiz_correct');
      expect(updated.xp).toBe(15);
    });

    it('퀴즈 만점: +50 XP 보너스', () => {
      const state = { xp: 0, level: 1, achievements: [], xpHistory: [] };
      const updated = addXP(state, 'quiz_perfect');
      expect(updated.xp).toBe(50);
    });
  });

  describe('calcLevel', () => {
    it('0 XP → Level 1', () => {
      expect(calcLevel(0)).toBe(1);
    });

    it('100 XP → Level 2', () => {
      expect(calcLevel(100)).toBe(2);
    });

    it('250 XP → Level 3', () => {
      expect(calcLevel(250)).toBe(3);
    });

    it('최대 레벨은 8', () => {
      expect(calcLevel(999999)).toBe(8);
    });
  });

  describe('checkAchievements', () => {
    it('첫 단어 학습 시 first_word 뱃지 획득', () => {
      const state = {
        xp: 20, level: 1, achievements: [],
        xpHistory: [{ date: new Date().toISOString(), amount: 20, action: 'word_learned' }]
      };
      const result = checkAchievements(state, { learnedWords: 1 });
      expect(result.newAchievements).toContain('first_word');
    });

    it('이미 획득한 뱃지는 중복 획득 안 됨', () => {
      const state = {
        xp: 40, level: 1, achievements: ['first_word'],
        xpHistory: []
      };
      const result = checkAchievements(state, { learnedWords: 2 });
      expect(result.newAchievements).not.toContain('first_word');
    });
  });
});
```

### __tests__/lib/vocabulary.test.ts

```typescript
import { getWordsByLevel, getDailyWords, filterByPartOfSpeech } from '../../lib/vocabulary';

describe('Vocabulary', () => {
  describe('getWordsByLevel', () => {
    it('Level 1 단어는 400개 이상 존재', () => {
      const words = getWordsByLevel(1);
      expect(words.length).toBeGreaterThanOrEqual(400);
    });

    it('모든 단어는 korean, english 필드를 가짐', () => {
      const words = getWordsByLevel(1);
      words.forEach(word => {
        expect(word.korean).toBeTruthy();
        expect(word.english).toBeTruthy();
        expect(word.level).toBe(1);
      });
    });

    it('유효하지 않은 레벨(0, 7)은 빈 배열 반환', () => {
      expect(getWordsByLevel(0)).toHaveLength(0);
      expect(getWordsByLevel(7)).toHaveLength(0);
    });
  });

  describe('getDailyWords', () => {
    it('요청한 개수만큼 반환', () => {
      const words = getDailyWords(1, 20, []);
      expect(words).toHaveLength(20);
    });

    it('이미 학습한 단어는 제외됨', () => {
      const allWords = getWordsByLevel(1).slice(0, 5);
      const learnedIds = allWords.map(w => w.id);
      const daily = getDailyWords(1, 20, learnedIds);
      daily.forEach(word => {
        expect(learnedIds).not.toContain(word.id);
      });
    });
  });
});
```

---

## 완료 기준 체크리스트

```
□ npx tsc --noEmit → 에러 0개
□ npm test → 모든 테스트 통과
□ git status에서 .env 파일이 추적되지 않음
□ .gitignore에 .env, *.aab, *.apk 포함
□ grep -r "replit_integrations" . (server 제외) → 결과 없음
□ __tests__/lib/srs.test.ts 작성 완료
□ __tests__/lib/gamification.test.ts 작성 완료
□ __tests__/lib/vocabulary.test.ts 작성 완료
□ git commit -m "fix(security): 보안 수정 + TypeScript 에러 해소 + 핵심 로직 테스트 추가"
```
