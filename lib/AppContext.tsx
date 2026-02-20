import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import {
  UserSettings, ProgressData, DailyState,
  getSettings, saveSettings,
  getProgress, saveProgress,
  getDailyState, saveDailyState,
  getBookmarks, toggleBookmark as toggleBookmarkStorage,
  recordDayComplete, getDayNumber,
} from './storage';
import { getDailyWords, Word } from './vocabulary';

interface AppContextValue {
  settings: UserSettings;
  progress: ProgressData;
  dailyState: DailyState | null;
  bookmarks: string[];
  todayWords: Word[];
  dayNumber: number;
  isLoading: boolean;
  updateSettings: (s: Partial<UserSettings>) => Promise<void>;
  markWordLearned: (wordId: string) => Promise<void>;
  completeQuiz: (score: number, total: number) => Promise<void>;
  toggleBookmark: (wordId: string) => Promise<void>;
  resetDaily: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>({
    selectedLevel: 'topik1-1',
    wordsPerDay: 20,
    showPronunciation: true,
  });
  const [progress, setProgress] = useState<ProgressData>({
    totalWordsLearned: 0,
    totalQuizzesTaken: 0,
    totalCorrectAnswers: 0,
    streak: 0,
    lastStudyDate: '',
    bestStreak: 0,
    dailyHistory: [],
    learnedWordIds: [],
  });
  const [dailyState, setDailyState] = useState<DailyState | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [s, p, d, b] = await Promise.all([
        getSettings(),
        getProgress(),
        getDailyState(),
        getBookmarks(),
      ]);
      setSettings(s);
      setProgress(p);
      setDailyState(d);
      setBookmarks(b);
      setIsLoading(false);
    })();
  }, []);

  const dayNumber = getDayNumber(progress);

  const todayWords = useMemo(() => {
    return getDailyWords(settings.selectedLevel, dayNumber, settings.wordsPerDay);
  }, [settings.selectedLevel, dayNumber, settings.wordsPerDay]);

  const updateSettings = useCallback(async (s: Partial<UserSettings>) => {
    const updated = await saveSettings(s);
    setSettings(updated);
  }, []);

  const markWordLearned = useCallback(async (wordId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const current = dailyState || {
      date: today,
      currentWordIndex: 0,
      learnedWordIds: [],
      quizCompleted: false,
      quizScore: 0,
      quizTotal: 0,
    };

    if (!current.learnedWordIds.includes(wordId)) {
      current.learnedWordIds.push(wordId);
    }
    current.currentWordIndex = Math.min(current.currentWordIndex + 1, todayWords.length - 1);
    current.date = today;

    await saveDailyState(current);
    setDailyState({ ...current });
  }, [dailyState, todayWords.length]);

  const completeQuiz = useCallback(async (score: number, total: number) => {
    const today = new Date().toISOString().split('T')[0];
    const current = dailyState || {
      date: today,
      currentWordIndex: 0,
      learnedWordIds: [],
      quizCompleted: false,
      quizScore: 0,
      quizTotal: 0,
    };

    current.quizCompleted = true;
    current.quizScore = score;
    current.quizTotal = total;
    current.date = today;

    await saveDailyState(current);
    setDailyState({ ...current });

    const learnedCount = current.learnedWordIds.length;
    const updatedProgress = await recordDayComplete(learnedCount, score, total);
    setProgress(updatedProgress);
  }, [dailyState]);

  const toggleBookmarkCb = useCallback(async (wordId: string) => {
    const updated = await toggleBookmarkStorage(wordId);
    setBookmarks([...updated]);
  }, []);

  const resetDaily = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    const newState: DailyState = {
      date: today,
      currentWordIndex: 0,
      learnedWordIds: [],
      quizCompleted: false,
      quizScore: 0,
      quizTotal: 0,
    };
    await saveDailyState(newState);
    setDailyState(newState);
  }, []);

  const value = useMemo(() => ({
    settings,
    progress,
    dailyState,
    bookmarks,
    todayWords,
    dayNumber,
    isLoading,
    updateSettings,
    markWordLearned,
    completeQuiz,
    toggleBookmark: toggleBookmarkCb,
    resetDaily,
  }), [settings, progress, dailyState, bookmarks, todayWords, dayNumber, isLoading, updateSettings, markWordLearned, completeQuiz, toggleBookmarkCb, resetDaily]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
