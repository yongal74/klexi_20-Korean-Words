import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  SETTINGS: '@daily_korean_settings',
  PROGRESS: '@daily_korean_progress',
  DAILY_STATE: '@daily_korean_daily',
  BOOKMARKS: '@daily_korean_bookmarks',
  CUSTOM_WORDS: '@daily_korean_custom_words',
  WRONG_ANSWERS: '@daily_korean_wrong_answers',
  USER_PROFILE: '@daily_korean_user_profile',
};

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  provider: 'email' | 'google' | 'apple' | 'kakao';
  avatar?: string;
  createdAt: string;
}

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
}

export async function clearUserProfile(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.USER_PROFILE);
}

export interface UserSettings {
  selectedLevel: string;
  wordsPerDay: number;
  showPronunciation: boolean;
  courseMode: '20words' | '10words';
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

export interface CustomWord {
  id: string;
  korean: string;
  english: string;
  pronunciation: string;
  sentence: string;
  sentenceTranslation: string;
  createdAt: string;
}

export interface WrongAnswer {
  id: string;
  korean: string;
  english: string;
  pronunciation: string;
  example: string;
  exampleTranslation: string;
  wrongCount: number;
  lastWrongDate: string;
  sentence: string;
}

const DEFAULT_SETTINGS: UserSettings = {
  selectedLevel: 'topik1-1',
  wordsPerDay: 20,
  showPronunciation: true,
  courseMode: '20words',
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

export async function getCustomWords(): Promise<CustomWord[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.CUSTOM_WORDS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveCustomWord(word: CustomWord): Promise<CustomWord[]> {
  const words = await getCustomWords();
  words.push(word);
  await AsyncStorage.setItem(KEYS.CUSTOM_WORDS, JSON.stringify(words));
  return words;
}

export async function deleteCustomWord(id: string): Promise<CustomWord[]> {
  let words = await getCustomWords();
  words = words.filter(w => w.id !== id);
  await AsyncStorage.setItem(KEYS.CUSTOM_WORDS, JSON.stringify(words));
  return words;
}

export async function getWrongAnswers(): Promise<WrongAnswer[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.WRONG_ANSWERS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function addWrongAnswer(word: {
  korean: string; english: string; pronunciation: string; example: string; exampleTranslation: string;
}): Promise<WrongAnswer[]> {
  const wrongs = await getWrongAnswers();
  const existing = wrongs.find(w => w.korean === word.korean);
  if (existing) {
    existing.wrongCount += 1;
    existing.lastWrongDate = getTodayString();
  } else {
    wrongs.push({
      id: `wrong-${Date.now()}`,
      korean: word.korean,
      english: word.english,
      pronunciation: word.pronunciation,
      example: word.example,
      exampleTranslation: word.exampleTranslation,
      wrongCount: 1,
      lastWrongDate: getTodayString(),
      sentence: word.example,
    });
  }
  await AsyncStorage.setItem(KEYS.WRONG_ANSWERS, JSON.stringify(wrongs));
  return wrongs;
}

export async function removeWrongAnswer(id: string): Promise<WrongAnswer[]> {
  let wrongs = await getWrongAnswers();
  wrongs = wrongs.filter(w => w.id !== id);
  await AsyncStorage.setItem(KEYS.WRONG_ANSWERS, JSON.stringify(wrongs));
  return wrongs;
}

export async function clearWrongAnswers(): Promise<void> {
  await AsyncStorage.setItem(KEYS.WRONG_ANSWERS, JSON.stringify([]));
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
