import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  SETTINGS: '@daily_korean_settings',
  PROGRESS: '@daily_korean_progress',
  DAILY_STATE: '@daily_korean_daily',
  BOOKMARKS: '@daily_korean_bookmarks',
};

export interface UserSettings {
  selectedLevel: string;
  wordsPerDay: number;
  showPronunciation: boolean;
}

export interface DailyState {
  date: string;
  currentWordIndex: number;
  learnedWordIds: string[];
  quizCompleted: boolean;
  quizScore: number;
  quizTotal: number;
}

export interface ProgressData {
  totalWordsLearned: number;
  totalQuizzesTaken: number;
  totalCorrectAnswers: number;
  streak: number;
  lastStudyDate: string;
  bestStreak: number;
  dailyHistory: { date: string; wordsLearned: number; quizScore: number; quizTotal: number }[];
  learnedWordIds: string[];
}

const DEFAULT_SETTINGS: UserSettings = {
  selectedLevel: 'topik1-1',
  wordsPerDay: 20,
  showPronunciation: true,
};

const DEFAULT_PROGRESS: ProgressData = {
  totalWordsLearned: 0,
  totalQuizzesTaken: 0,
  totalCorrectAnswers: 0,
  streak: 0,
  lastStudyDate: '',
  bestStreak: 0,
  dailyHistory: [],
  learnedWordIds: [],
};

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export async function getSettings(): Promise<UserSettings> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated));
  return updated;
}

export async function getProgress(): Promise<ProgressData> {
  try {
    const data = await AsyncStorage.getItem(KEYS.PROGRESS);
    return data ? { ...DEFAULT_PROGRESS, ...JSON.parse(data) } : DEFAULT_PROGRESS;
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export async function saveProgress(progress: ProgressData): Promise<void> {
  await AsyncStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
}

export async function getDailyState(): Promise<DailyState | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.DAILY_STATE);
    if (!data) return null;
    const state = JSON.parse(data) as DailyState;
    if (state.date !== getTodayString()) return null;
    return state;
  } catch {
    return null;
  }
}

export async function saveDailyState(state: DailyState): Promise<void> {
  await AsyncStorage.setItem(KEYS.DAILY_STATE, JSON.stringify(state));
}

export async function getBookmarks(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.BOOKMARKS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function toggleBookmark(wordId: string): Promise<string[]> {
  const bookmarks = await getBookmarks();
  const index = bookmarks.indexOf(wordId);
  if (index >= 0) {
    bookmarks.splice(index, 1);
  } else {
    bookmarks.push(wordId);
  }
  await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  return bookmarks;
}

export async function recordDayComplete(wordsLearned: number, quizScore: number, quizTotal: number): Promise<ProgressData> {
  const progress = await getProgress();
  const today = getTodayString();

  const existingIndex = progress.dailyHistory.findIndex(h => h.date === today);
  if (existingIndex >= 0) {
    progress.dailyHistory[existingIndex] = { date: today, wordsLearned, quizScore, quizTotal };
  } else {
    progress.dailyHistory.push({ date: today, wordsLearned, quizScore, quizTotal });
  }

  progress.totalWordsLearned += wordsLearned;
  progress.totalQuizzesTaken += 1;
  progress.totalCorrectAnswers += quizScore;

  if (progress.lastStudyDate) {
    const lastDate = new Date(progress.lastStudyDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      progress.streak += 1;
    } else if (diffDays > 1) {
      progress.streak = 1;
    }
  } else {
    progress.streak = 1;
  }

  if (progress.streak > progress.bestStreak) {
    progress.bestStreak = progress.streak;
  }

  progress.lastStudyDate = today;

  await saveProgress(progress);
  return progress;
}

export function getDayNumber(progress: ProgressData): number {
  return progress.dailyHistory.length + 1;
}
