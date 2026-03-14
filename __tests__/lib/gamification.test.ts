/**
 * Gamification System Tests
 * Agent: SECURITY
 */

// 공식 async-storage mock 사용 (clear() 메서드 제공)
jest.mock('@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  calculateLevel,
  addXP,
  checkAchievements,
  getUnlockedAchievements,
  XP_REWARDS,
  ACHIEVEMENTS,
} from '../../lib/gamification';

beforeEach(async () => {
  await AsyncStorage.clear();
});

// ─────────────────────────────────────────────
// XP_REWARDS 상수
// ─────────────────────────────────────────────
describe('XP_REWARDS 상수', () => {
  it('WORD_LEARNED = 10', () => {
    expect(XP_REWARDS.WORD_LEARNED).toBe(10);
  });
  it('QUIZ_CORRECT = 15', () => {
    expect(XP_REWARDS.QUIZ_CORRECT).toBe(15);
  });
  it('QUIZ_PERFECT = 50', () => {
    expect(XP_REWARDS.QUIZ_PERFECT).toBe(50);
  });
  it('DAILY_COMPLETE = 30', () => {
    expect(XP_REWARDS.DAILY_COMPLETE).toBe(30);
  });
});

// ─────────────────────────────────────────────
// calculateLevel (순수 함수 — 가장 테스트하기 쉬움)
// ─────────────────────────────────────────────
describe('calculateLevel', () => {
  it('0 XP → Level 1', () => {
    expect(calculateLevel(0).level).toBe(1);
  });

  it('99 XP → 여전히 Level 1', () => {
    expect(calculateLevel(99).level).toBe(1);
  });

  it('100 XP → Level 2', () => {
    expect(calculateLevel(100).level).toBe(2);
  });

  it('300 XP → Level 3', () => {
    // Level 1: 100 XP, Level 2: 200 XP → 합계 300 XP에 Level 3
    expect(calculateLevel(300).level).toBe(3);
  });

  it('progress는 0~1 사이', () => {
    const result = calculateLevel(50);
    expect(result.progress).toBeGreaterThanOrEqual(0);
    expect(result.progress).toBeLessThanOrEqual(1);
  });

  it('currentXP는 현재 레벨 내에서의 XP', () => {
    const result = calculateLevel(150); // Level 2, 50 XP 진행
    expect(result.currentXP).toBe(50);
    expect(result.xpForNext).toBe(200); // Level 2 → 3 필요 XP
  });

  it('xpForNext는 항상 양수', () => {
    [0, 50, 100, 500, 9999].forEach(xp => {
      expect(calculateLevel(xp).xpForNext).toBeGreaterThan(0);
    });
  });
});

// ─────────────────────────────────────────────
// addXP
// ─────────────────────────────────────────────
describe('addXP', () => {
  it('XP가 누적됨', async () => {
    await addXP(10, 'word_learned');
    const result = await addXP(15, 'quiz_correct');
    expect(result.newTotal).toBe(25);
  });

  it('레벨업 감지', async () => {
    // Level 1→2: 100 XP 필요
    const result = await addXP(100, 'milestone');
    expect(result.levelUp).toBe(true);
    expect(result.newLevel).toBe(2);
  });

  it('레벨업 없으면 levelUp=false', async () => {
    const result = await addXP(10, 'word_learned');
    expect(result.levelUp).toBe(false);
  });

  it('XP 히스토리에 기록됨', async () => {
    await addXP(10, 'word_learned');
    const raw = await AsyncStorage.getItem('@daily_korean_gamification');
    const saved = JSON.parse(raw!);
    // 이전 테스트 데이터가 쌓일 수 있으므로 마지막 항목이 올바른지 확인
    const last = saved.xpHistory[saved.xpHistory.length - 1];
    expect(last.amount).toBe(10);
    expect(last.source).toBe('word_learned');
    expect(saved.xpHistory.length).toBeGreaterThanOrEqual(1);
  });

  it('0 XP 추가해도 throw 없음', async () => {
    const before = (await addXP(0, 'pre')).newTotal; // 현재 상태 기록
    const result = await addXP(0, 'no_op');
    expect(result.newTotal).toBe(before); // 0 추가 → 변화 없음
    expect(result.levelUp).toBe(false);
  });
});

// ─────────────────────────────────────────────
// checkAchievements
// ─────────────────────────────────────────────
describe('checkAchievements', () => {
  const baseStats = {
    wordsLearned: 0,
    streak: 0,
    quizzesTaken: 0,
    perfectQuiz: false,
    reviewCount: 0,
    practiceCount: 0,
    level: 1,
  };

  it('첫 단어 학습 → first-steps 뱃지 획득', async () => {
    const result = await checkAchievements({ ...baseStats, wordsLearned: 1 });
    expect(result.map(a => a.id)).toContain('first-steps');
  });

  it('50 단어 학습 → word-explorer 뱃지', async () => {
    const result = await checkAchievements({ ...baseStats, wordsLearned: 50 });
    expect(result.map(a => a.id)).toContain('word-explorer');
  });

  it('첫 퀴즈 완료 → quiz-starter 뱃지', async () => {
    const result = await checkAchievements({ ...baseStats, quizzesTaken: 1 });
    expect(result.map(a => a.id)).toContain('quiz-starter');
  });

  it('퀴즈 만점 → perfect-score 뱃지', async () => {
    const result = await checkAchievements({ ...baseStats, perfectQuiz: true, quizzesTaken: 1 });
    expect(result.map(a => a.id)).toContain('perfect-score');
  });

  it('3일 스트릭 → on-fire 뱃지', async () => {
    const result = await checkAchievements({ ...baseStats, streak: 3 });
    expect(result.map(a => a.id)).toContain('on-fire');
  });

  it('이미 획득한 뱃지는 다시 반환 안 됨', async () => {
    // 첫 번째 획득
    await checkAchievements({ ...baseStats, wordsLearned: 1 });
    // 두 번째 시도
    const second = await checkAchievements({ ...baseStats, wordsLearned: 1 });
    expect(second.map(a => a.id)).not.toContain('first-steps');
  });

  it('0 wordsLearned → first-steps 없음', async () => {
    const result = await checkAchievements(baseStats);
    expect(result.map(a => a.id)).not.toContain('first-steps');
  });

  it('반환된 뱃지에 unlockedAt 포함', async () => {
    // centurion(100일 스트릭)은 이전 테스트에서 절대 획득 안 됨
    const result = await checkAchievements({ ...baseStats, streak: 100 });
    expect(result.length).toBeGreaterThan(0);
    const centurion = result.find(a => a.id === 'centurion');
    expect(centurion).toBeDefined();
    expect(centurion!.unlockedAt).toBeTruthy();
  });
});

// ─────────────────────────────────────────────
// ACHIEVEMENTS 상수
// ─────────────────────────────────────────────
describe('ACHIEVEMENTS 상수', () => {
  it('총 15개 업적 정의', () => {
    expect(ACHIEVEMENTS.length).toBe(15);
  });

  it('모든 업적은 id, title, category를 가짐', () => {
    ACHIEVEMENTS.forEach(a => {
      expect(a.id).toBeTruthy();
      expect(a.title).toBeTruthy();
      expect(a.category).toBeTruthy();
    });
  });

  it('업적 ID는 중복 없음', () => {
    const ids = ACHIEVEMENTS.map(a => a.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});
