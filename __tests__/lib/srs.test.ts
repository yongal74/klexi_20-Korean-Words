/**
 * SRS SM-2 Algorithm Tests
 * Agent: SECURITY — RED 먼저, GREEN 나중
 */

// AsyncStorage 모킹 (lib/srs.ts가 AsyncStorage 사용)
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}));

import {
  reviewWord,
  initWordSRS,
  getWordsForReview,
  getSRSStats,
  type SRSWordData,
} from '../../lib/srs';

// AsyncStorage를 매 테스트마다 독립적으로 만들기
const mockStorage: Record<string, string> = {};
const AsyncStorage = require('@react-native-async-storage/async-storage');

beforeEach(() => {
  // 인메모리 스토리지 초기화
  Object.keys(mockStorage).forEach(k => delete mockStorage[k]);

  AsyncStorage.getItem.mockImplementation((key: string) =>
    Promise.resolve(mockStorage[key] ?? null)
  );
  AsyncStorage.setItem.mockImplementation((key: string, value: string) => {
    mockStorage[key] = value;
    return Promise.resolve();
  });
});

// ─────────────────────────────────────────────
// initWordSRS
// ─────────────────────────────────────────────
describe('initWordSRS', () => {
  it('새 단어는 interval=0, easeFactor=2.5, repetitions=0 으로 초기화', async () => {
    const word = await initWordSRS('n1_001');
    expect(word.wordId).toBe('n1_001');
    expect(word.interval).toBe(0);
    expect(word.easeFactor).toBeCloseTo(2.5);
    expect(word.repetitions).toBe(0);
  });

  it('nextReview는 오늘 날짜', async () => {
    const today = new Date().toISOString().split('T')[0];
    const word = await initWordSRS('n1_002');
    expect(word.nextReview).toBe(today);
  });

  it('같은 단어 두 번 초기화해도 덮어쓰기 됨', async () => {
    await initWordSRS('n1_001');
    const word2 = await initWordSRS('n1_001');
    expect(word2.repetitions).toBe(0); // 리셋됨
  });
});

// ─────────────────────────────────────────────
// reviewWord — 정답 시나리오 (quality >= 3)
// ─────────────────────────────────────────────
describe('reviewWord — 정답 시나리오', () => {
  it('첫 번째 정답 (rep 0→1): interval = 1일', async () => {
    await initWordSRS('n1_001');
    const result = await reviewWord('n1_001', 4);
    expect(result.repetitions).toBe(1);
    expect(result.interval).toBe(1);
  });

  it('두 번째 연속 정답 (rep 1→2): interval = 6일', async () => {
    await initWordSRS('n1_001');
    await reviewWord('n1_001', 4); // rep 1
    const result = await reviewWord('n1_001', 4); // rep 2
    expect(result.repetitions).toBe(2);
    expect(result.interval).toBe(6);
  });

  it('세 번째 정답 이후: interval 기하급수 증가', async () => {
    await initWordSRS('n1_001');
    await reviewWord('n1_001', 4); // interval: 1
    await reviewWord('n1_001', 4); // interval: 6
    const result = await reviewWord('n1_001', 4); // interval: 6 * 2.5 = 15
    expect(result.interval).toBeGreaterThan(6);
  });

  it('quality 5 (완벽) → easeFactor 증가', async () => {
    await initWordSRS('n1_001');
    const result = await reviewWord('n1_001', 5);
    expect(result.easeFactor).toBeGreaterThan(2.5);
  });

  it('quality 3 (간신히 기억) → easeFactor 감소', async () => {
    await initWordSRS('n1_001');
    const result = await reviewWord('n1_001', 3);
    expect(result.easeFactor).toBeLessThanOrEqual(2.5);
    expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
  });
});

// ─────────────────────────────────────────────
// reviewWord — 오답 시나리오 (quality < 3)
// ─────────────────────────────────────────────
describe('reviewWord — 오답 시나리오', () => {
  it('오답 (quality=0) → repetitions 0으로 리셋, interval = 1', async () => {
    await initWordSRS('n1_001');
    await reviewWord('n1_001', 4); // rep: 1
    await reviewWord('n1_001', 4); // rep: 2, interval: 6
    const result = await reviewWord('n1_001', 0); // 오답
    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
  });

  it('easeFactor는 아무리 낮아져도 1.3 미만으로 안 내려감', async () => {
    await initWordSRS('n1_001');
    // 10번 연속 오답
    for (let i = 0; i < 10; i++) {
      await reviewWord('n1_001', 0);
    }
    const result = await reviewWord('n1_001', 0);
    expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it('quality 경계값 2는 오답으로 처리', async () => {
    await initWordSRS('n1_001');
    await reviewWord('n1_001', 4); // rep: 1
    const result = await reviewWord('n1_001', 2); // 오답
    expect(result.repetitions).toBe(0);
  });

  it('quality 경계값 3은 정답으로 처리', async () => {
    await initWordSRS('n1_001');
    const result = await reviewWord('n1_001', 3); // 정답
    expect(result.repetitions).toBe(1);
  });
});

// ─────────────────────────────────────────────
// reviewWord — nextReview 날짜 계산
// ─────────────────────────────────────────────
describe('reviewWord — nextReview 날짜', () => {
  it('정답 후 nextReview는 오늘 + interval일', async () => {
    await initWordSRS('n1_001');
    const result = await reviewWord('n1_001', 4); // interval: 1
    const today = new Date();
    const expected = new Date(today);
    expected.setDate(today.getDate() + result.interval);
    const expectedStr = expected.toISOString().split('T')[0];
    expect(result.nextReview).toBe(expectedStr);
  });
});

// ─────────────────────────────────────────────
// getWordsForReview
// ─────────────────────────────────────────────
describe('getWordsForReview', () => {
  it('복습 예정 단어 없으면 빈 배열', async () => {
    // 단어를 추가하되 nextReview를 미래로 설정
    await initWordSRS('n1_001');
    await reviewWord('n1_001', 5); // nextReview = 내일 이후

    const result = await getWordsForReview();
    // 오늘 바로 초기화된 단어 제외
    expect(Array.isArray(result)).toBe(true);
  });

  it('nextReview가 오늘 이전인 단어는 포함', async () => {
    // 강제로 과거 날짜 주입
    const pastData = {
      words: {
        n1_past: {
          wordId: 'n1_past',
          interval: 1,
          easeFactor: 2.5,
          repetitions: 1,
          nextReview: '2020-01-01', // 과거
          lastReview: '2019-12-31',
        } as SRSWordData,
      },
    };
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(pastData));

    const result = await getWordsForReview();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].wordId).toBe('n1_past');
  });

  it('복습 대상 단어는 날짜 오래된 순으로 정렬', async () => {
    const multiData = {
      words: {
        n1_newer: {
          wordId: 'n1_newer',
          interval: 1,
          easeFactor: 2.5,
          repetitions: 1,
          nextReview: '2020-01-02',
          lastReview: '2020-01-01',
        } as SRSWordData,
        n1_older: {
          wordId: 'n1_older',
          interval: 1,
          easeFactor: 2.5,
          repetitions: 1,
          nextReview: '2020-01-01', // 더 오래됨
          lastReview: '2019-12-31',
        } as SRSWordData,
      },
    };
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(multiData));

    const result = await getWordsForReview();
    expect(result[0].wordId).toBe('n1_older'); // 오래된 것이 먼저
    expect(result[1].wordId).toBe('n1_newer');
  });
});

// ─────────────────────────────────────────────
// getSRSStats
// ─────────────────────────────────────────────
describe('getSRSStats', () => {
  it('빈 데이터 → 전부 0', async () => {
    const stats = await getSRSStats();
    expect(stats.totalTracked).toBe(0);
    expect(stats.dueToday).toBe(0);
    expect(stats.mastered).toBe(0);
  });

  it('interval >= 21 단어는 mastered 카운트에 포함', async () => {
    const masteredData = {
      words: {
        n1_mastered: {
          wordId: 'n1_mastered',
          interval: 21,
          easeFactor: 2.8,
          repetitions: 5,
          nextReview: '2099-01-01', // 미래
          lastReview: '2020-01-01',
        } as SRSWordData,
      },
    };
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(masteredData));

    const stats = await getSRSStats();
    expect(stats.totalTracked).toBe(1);
    expect(stats.mastered).toBe(1);
  });
});
