import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import {
  UserSettings, ProgressData, DailyState, CustomWord, WrongAnswer, UserProfile,
  getSettings, saveSettings,
  getProgress, saveProgress,
  getDailyState, saveDailyState,
  getBookmarks, toggleBookmark as toggleBookmarkStorage,
  getCustomWords, saveCustomWord as saveCustomWordStorage, deleteCustomWord as deleteCustomWordStorage,
  getWrongAnswers, addWrongAnswer as addWrongAnswerStorage, removeWrongAnswer as removeWrongAnswerStorage, clearWrongAnswers as clearWrongAnswersStorage,
  recordDayComplete, getDayNumber,
  getUserProfile, saveUserProfile, clearUserProfile,
  getPremiumStatus, savePremiumStatus,
} from './storage';
import { supabase } from './supabase';
import { pushSyncData, pullSyncData } from './sync';
import { getDailyWords, Word } from './vocabulary';
import { getSRSData, SRSData, reviewWord, getWordsForReview, getReviewCount, initWordSRS, SRSWordData } from './srs';
import { getGamificationData, GamificationData, addXP, checkAchievements, XP_REWARDS, calculateLevel, Achievement } from './gamification';

interface AppContextValue {
  settings: UserSettings;
  progress: ProgressData;
  dailyState: DailyState | null;
  bookmarks: string[];
  todayWords: Word[];
  dayNumber: number;
  isLoading: boolean;
  customWords: CustomWord[];
  wrongAnswers: WrongAnswer[];
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  updateSettings: (s: Partial<UserSettings>) => Promise<void>;
  markWordLearned: (wordId: string) => Promise<void>;
  completeQuiz: (score: number, total: number) => Promise<void>;
  toggleBookmark: (wordId: string) => Promise<void>;
  resetDaily: () => Promise<void>;
  addCustomWord: (word: CustomWord) => Promise<void>;
  removeCustomWord: (id: string) => Promise<void>;
  addWrongAnswer: (word: { korean: string; english: string; pronunciation: string; example: string; exampleTranslation: string }) => Promise<void>;
  removeWrongAnswer: (id: string) => Promise<void>;
  clearWrongAnswers: () => Promise<void>;
  signIn: (profile: UserProfile) => Promise<void>;
  signOut: () => Promise<void>;
  srsData: SRSData;
  gamification: GamificationData;
  reviewCount: number;
  userLevel: { level: number; currentXP: number; xpForNext: number; progress: number };
  reviewSRSWord: (wordId: string, quality: number) => Promise<void>;
  initSRSWord: (wordId: string) => Promise<void>;
  earnXP: (amount: number, source: string) => Promise<{ levelUp: boolean; newLevel: number }>;
  refreshGamification: () => Promise<void>;
  getWordsForSRSReview: () => Promise<SRSWordData[]>;
  isPremium: boolean;
  setPremiumStatus: (status: boolean) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>({
    selectedLevel: 'topik1-1',
    wordsPerDay: 20,
    showPronunciation: true,
    courseMode: '20words',
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
  const [customWords, setCustomWords] = useState<CustomWord[]>([]);
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [srsData, setSrsData] = useState<SRSData>({ words: {} });
  const [gamification, setGamification] = useState<GamificationData>({ totalXP: 0, level: 1, achievements: {}, xpHistory: [] });
  const [reviewCount, setReviewCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [s, p, d, b, cw, wa, srs, gam, prem] = await Promise.all([
        getSettings(),
        getProgress(),
        getDailyState(),
        getBookmarks(),
        getCustomWords(),
        getWrongAnswers(),
        getSRSData(),
        getGamificationData(),
        getPremiumStatus(),
      ]);
      setSettings(s);
      setProgress(p);
      setDailyState(d);
      setBookmarks(b);
      setCustomWords(cw);
      setWrongAnswers(wa);
      setSrsData(srs);
      setGamification(gam);
      setIsPremium(prem);
      const count = await getReviewCount();
      setReviewCount(count);

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profile) {
          setUserProfile({
            id: profile.id,
            name: profile.name || '',
            email: profile.email || '',
            provider: profile.provider,
            createdAt: profile.created_at,
          });
        } else {
          setUserProfile({
            id: session.user.id,
            name: 'User',
            email: session.user.email || '',
            provider: 'email',
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        setUserProfile(null);
      }
      
      // After getting initial profile, pull remote sync data if it exists
      if (session?.user) {
        await pullSyncData();
      }

      // Re-fetch everything to ensure components see latest state
      const [s2, p2, d2, b2, cw2, wa2, srs2, gam2, prem2] = await Promise.all([
        getSettings(), getProgress(), getDailyState(), getBookmarks(), getCustomWords(), getWrongAnswers(), getSRSData(), getGamificationData(), getPremiumStatus()
      ]);
      setSettings(s2); setProgress(p2); setDailyState(d2); setBookmarks(b2); setCustomWords(cw2); setWrongAnswers(wa2); setSrsData(srs2); setGamification(gam2); setIsPremium(prem2);
      
      const count2 = await getReviewCount();
      setReviewCount(count2);
      setIsLoading(false);
    })();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profile) {
          setUserProfile({
            id: profile.id,
            name: profile.name || '',
            email: profile.email || '',
            provider: profile.provider,
            createdAt: profile.created_at,
          });
        }
        if (event === 'SIGNED_IN') {
           // Pull data from cloud when signed in 
           await pullSyncData();
           
           const [s, p, d, b, cw, wa, srs, gam, prem] = await Promise.all([
             getSettings(), getProgress(), getDailyState(), getBookmarks(), getCustomWords(), getWrongAnswers(), getSRSData(), getGamificationData(), getPremiumStatus()
           ]);
           setSettings(s); setProgress(p); setDailyState(d); setBookmarks(b); setCustomWords(cw); setWrongAnswers(wa); setSrsData(srs); setGamification(gam); setIsPremium(prem);
        }
      } else {
        setUserProfile(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const dayNumber = getDayNumber(progress);

  const wordsPerDay = settings.courseMode === '10words' ? 10 : 20;

  const todayWords = useMemo(() => {
    return getDailyWords(settings.selectedLevel, dayNumber, wordsPerDay);
  }, [settings.selectedLevel, dayNumber, wordsPerDay]);

  const updateSettings = useCallback(async (s: Partial<UserSettings>) => {
    const updated = await saveSettings(s);
    setSettings(updated);
    pushSyncData();
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

    await initWordSRS(wordId);
    const srsUpdated = await getSRSData();
    setSrsData(srsUpdated);
    pushSyncData();
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
    pushSyncData();
  }, [dailyState]);

  const toggleBookmarkCb = useCallback(async (wordId: string) => {
    const updated = await toggleBookmarkStorage(wordId);
    setBookmarks([...updated]);
    pushSyncData();
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
    pushSyncData();
  }, []);

  const addCustomWordCb = useCallback(async (word: CustomWord) => {
    const updated = await saveCustomWordStorage(word);
    setCustomWords([...updated]);
    pushSyncData();
  }, []);

  const removeCustomWordCb = useCallback(async (id: string) => {
    const updated = await deleteCustomWordStorage(id);
    setCustomWords([...updated]);
    pushSyncData();
  }, []);

  const addWrongAnswerCb = useCallback(async (word: { korean: string; english: string; pronunciation: string; example: string; exampleTranslation: string }) => {
    const updated = await addWrongAnswerStorage(word);
    setWrongAnswers([...updated]);
    pushSyncData();
  }, []);

  const removeWrongAnswerCb = useCallback(async (id: string) => {
    const updated = await removeWrongAnswerStorage(id);
    setWrongAnswers([...updated]);
    pushSyncData();
  }, []);

  const clearWrongAnswersCb = useCallback(async () => {
    await clearWrongAnswersStorage();
    setWrongAnswers([]);
    pushSyncData();
  }, []);

  const signInCb = useCallback(async (profile: UserProfile) => {
    setUserProfile(profile);
  }, []);

  const signOutCb = useCallback(async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
    await clearUserProfile();
  }, []);

  const isAuthenticated = !!userProfile;

  const userLevel = useMemo(() => calculateLevel(gamification.totalXP), [gamification.totalXP]);

  const reviewSRSWordCb = useCallback(async (wordId: string, quality: number) => {
    await reviewWord(wordId, quality);
    const updated = await getSRSData();
    setSrsData(updated);
    const count = await getReviewCount();
    setReviewCount(count);
    pushSyncData();
  }, []);

  const initSRSWordCb = useCallback(async (wordId: string) => {
    await initWordSRS(wordId);
    const updated = await getSRSData();
    setSrsData(updated);
    pushSyncData();
  }, []);

  const earnXPCb = useCallback(async (amount: number, source: string) => {
    const result = await addXP(amount, source);
    const updated = await getGamificationData();
    setGamification(updated);
    pushSyncData();
    return { levelUp: result.levelUp, newLevel: result.newLevel };
  }, []);

  const refreshGamificationCb = useCallback(async () => {
    const updated = await getGamificationData();
    setGamification(updated);
    const count = await getReviewCount();
    setReviewCount(count);
    pushSyncData();
  }, []);

  const getWordsForSRSReviewCb = useCallback(async () => {
    return await getWordsForReview();
  }, []);

  const setPremiumStatusCb = useCallback(async (status: boolean) => {
    await savePremiumStatus(status);
    setIsPremium(status);
  }, []);

  const value = useMemo(() => ({
    settings,
    progress,
    dailyState,
    bookmarks,
    todayWords,
    dayNumber,
    isLoading,
    customWords,
    wrongAnswers,
    userProfile,
    isAuthenticated,
    updateSettings,
    markWordLearned,
    completeQuiz,
    toggleBookmark: toggleBookmarkCb,
    resetDaily,
    addCustomWord: addCustomWordCb,
    removeCustomWord: removeCustomWordCb,
    addWrongAnswer: addWrongAnswerCb,
    removeWrongAnswer: removeWrongAnswerCb,
    clearWrongAnswers: clearWrongAnswersCb,
    signIn: signInCb,
    signOut: signOutCb,
    srsData,
    gamification,
    reviewCount,
    userLevel,
    reviewSRSWord: reviewSRSWordCb,
    initSRSWord: initSRSWordCb,
    earnXP: earnXPCb,
    refreshGamification: refreshGamificationCb,
    getWordsForSRSReview: getWordsForSRSReviewCb,
    isPremium,
    setPremiumStatus: setPremiumStatusCb,
  }), [settings, progress, dailyState, bookmarks, todayWords, dayNumber, isLoading, customWords, wrongAnswers, userProfile, isAuthenticated, updateSettings, markWordLearned, completeQuiz, toggleBookmarkCb, resetDaily, addCustomWordCb, removeCustomWordCb, addWrongAnswerCb, removeWrongAnswerCb, clearWrongAnswersCb, signInCb, signOutCb, srsData, gamification, reviewCount, userLevel, reviewSRSWordCb, initSRSWordCb, earnXPCb, refreshGamificationCb, getWordsForSRSReviewCb, isPremium, setPremiumStatusCb]);

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
