import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { getSettings, getProgress, getDailyState, getBookmarks, getCustomWords, getWrongAnswers } from './storage';
import { getGamificationData } from './gamification';
import { getSRSData } from './srs';

// Keys from storage files
const KEYS = {
  SETTINGS: '@daily_korean_settings',
  PROGRESS: '@daily_korean_progress',
  DAILY_STATE: '@daily_korean_daily',
  BOOKMARKS: '@daily_korean_bookmarks',
  CUSTOM_WORDS: '@daily_korean_custom_words',
  WRONG_ANSWERS: '@daily_korean_wrong_answers',
  GAMIFICATION: '@daily_korean_gamification',
  SRS: '@daily_korean_srs_data',
};

/**
 * Push all local state to Supabase for the current user
 */
export async function pushSyncData() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return;

  const [
    settings,
    progress,
    dailyState,
    bookmarks,
    customWords,
    wrongAnswers,
    gamification,
    srs,
  ] = await Promise.all([
    getSettings(),
    getProgress(),
    getDailyState(),
    getBookmarks(),
    getCustomWords(),
    getWrongAnswers(),
    getGamificationData(),
    getSRSData(),
  ]);

  const payload = {
    user_id: session.user.id,
    settings,
    progress,
    daily_state: dailyState,
    bookmarks,
    custom_words: customWords,
    wrong_answers: wrongAnswers,
    gamification,
    srs,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('sync_data').upsert(payload, { onConflict: 'user_id' });
  if (error) {
    console.error('Failed to sync to Supabase:', error);
  }
}

/**
 * Pull cloud state from Supabase and overwrite local AsyncStorage
 */
export async function pullSyncData() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return false;

  const { data, error } = await supabase.from('sync_data').select('*').eq('user_id', session.user.id).single();
  if (error || !data) {
    // If no remote data exists, we just push our current (potentially empty) state so it initializes
    if (error?.code === 'PGRST116') { // not found
      await pushSyncData();
    }
    return false;
  }

  // Save the retrieved data cleanly into AsyncStorage
  const updates: [string, string][] = [];
  if (data.settings) updates.push([KEYS.SETTINGS, JSON.stringify(data.settings)]);
  if (data.progress) updates.push([KEYS.PROGRESS, JSON.stringify(data.progress)]);
  if (data.daily_state) updates.push([KEYS.DAILY_STATE, JSON.stringify(data.daily_state)]);
  if (data.bookmarks) updates.push([KEYS.BOOKMARKS, JSON.stringify(data.bookmarks)]);
  if (data.custom_words) updates.push([KEYS.CUSTOM_WORDS, JSON.stringify(data.custom_words)]);
  if (data.wrong_answers) updates.push([KEYS.WRONG_ANSWERS, JSON.stringify(data.wrong_answers)]);
  if (data.gamification) updates.push([KEYS.GAMIFICATION, JSON.stringify(data.gamification)]);
  if (data.srs) updates.push([KEYS.SRS, JSON.stringify(data.srs)]);

  if (updates.length > 0) {
    await AsyncStorage.multiSet(updates);
    return true; // indicates state was updated
  }
  return false;
}
