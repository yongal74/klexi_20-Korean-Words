/**
 * Vocabulary Tests
 * Agent: SECURITY
 */

import {
  getWordsForLevel,
  getDailyWords,
  generateQuizOptions,
  getAllWords,
  TOPIK_LEVELS,
  type Word,
} from '../../lib/vocabulary';

// ─────────────────────────────────────────────
// TOPIK_LEVELS
// ─────────────────────────────────────────────
describe('TOPIK_LEVELS', () => {
  it('총 6개 레벨', () => {
    expect(TOPIK_LEVELS.length).toBe(6);
  });

  it('모든 레벨은 id, level, color 필드를 가짐', () => {
    TOPIK_LEVELS.forEach(lvl => {
      expect(lvl.id).toBeTruthy();
      expect(lvl.level).toBeTruthy();
      expect(lvl.color).toMatch(/^#/);
    });
  });
});

// ─────────────────────────────────────────────
// getWordsForLevel
// ─────────────────────────────────────────────
describe('getWordsForLevel', () => {
  it('topik1-1 단어는 100개 이상', () => {
    const words = getWordsForLevel('topik1-1');
    expect(words.length).toBeGreaterThanOrEqual(100);
  });

  it('모든 레벨에 단어 존재', () => {
    TOPIK_LEVELS.forEach(lvl => {
      const words = getWordsForLevel(lvl.id);
      expect(words.length).toBeGreaterThan(0);
    });
  });

  it('유효하지 않은 레벨 ID → 빈 배열', () => {
    expect(getWordsForLevel('invalid-level')).toEqual([]);
    expect(getWordsForLevel('')).toEqual([]);
  });

  it('모든 단어는 필수 필드를 가짐', () => {
    const words = getWordsForLevel('topik1-1').slice(0, 10);
    words.forEach(w => {
      expect(w.id).toBeTruthy();
      expect(w.korean).toBeTruthy();
      expect(w.english).toBeTruthy();
      expect(w.partOfSpeech).toBeTruthy();
    });
  });

  it('단어 ID는 레벨 내에서 중복 없음', () => {
    const words = getWordsForLevel('topik1-1');
    const ids = words.map(w => w.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

// ─────────────────────────────────────────────
// getDailyWords
// ─────────────────────────────────────────────
describe('getDailyWords', () => {
  it('wordsPerDay=20이면 정확히 20개 반환', () => {
    const words = getDailyWords('topik1-1', 1, 20);
    expect(words).toHaveLength(20);
  });

  it('wordsPerDay=10이면 정확히 10개 반환', () => {
    const words = getDailyWords('topik1-1', 1, 10);
    expect(words).toHaveLength(10);
  });

  it('day가 달라지면 다른 단어 반환', () => {
    const day1 = getDailyWords('topik1-1', 1, 20).map(w => w.id);
    const day2 = getDailyWords('topik1-1', 2, 20).map(w => w.id);
    // 완전히 같지는 않아야 함
    expect(day1).not.toEqual(day2);
  });

  it('잘못된 레벨 ID → 빈 배열', () => {
    expect(getDailyWords('invalid', 1, 20)).toEqual([]);
  });

  it('반환된 단어 배열 내 중복 없음 (같은 날)', () => {
    const words = getDailyWords('topik1-1', 1, 20);
    const ids = words.map(w => w.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

// ─────────────────────────────────────────────
// generateQuizOptions
// ─────────────────────────────────────────────
describe('generateQuizOptions', () => {
  const allWords = getWordsForLevel('topik1-1');
  const correct = allWords[0];

  it('항상 4개 옵션 반환', () => {
    const options = generateQuizOptions(correct, allWords, 4);
    expect(options).toHaveLength(4);
  });

  it('정답이 반드시 옵션 중에 포함', () => {
    const options = generateQuizOptions(correct, allWords, 4);
    expect(options).toContain(correct.english);
  });

  it('중복 옵션 없음', () => {
    const options = generateQuizOptions(correct, allWords, 4);
    const unique = new Set(options);
    expect(unique.size).toBe(options.length);
  });

  it('단어 수가 부족해도 4개 옵션 채움', () => {
    const tinyPool: Word[] = [correct]; // 1개짜리 풀
    const options = generateQuizOptions(correct, tinyPool, 4);
    expect(options).toHaveLength(4);
  });
});

// ─────────────────────────────────────────────
// getAllWords
// ─────────────────────────────────────────────
describe('getAllWords', () => {
  it('전체 단어 1200개 이상 (6레벨 × 200개+)', () => {
    const all = getAllWords();
    expect(all.length).toBeGreaterThanOrEqual(1200);
  });

  it('전체 단어 ID 중복 없음', () => {
    const all = getAllWords();
    const ids = all.map(w => w.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});
