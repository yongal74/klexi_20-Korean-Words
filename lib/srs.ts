import AsyncStorage from '@react-native-async-storage/async-storage';

const SRS_KEY = '@daily_korean_srs_data';

export interface SRSWordData {
  wordId: string;
  interval: number; // days until next review
  easeFactor: number; // difficulty multiplier (min 1.3)
  repetitions: number; // consecutive correct answers
  nextReview: string; // ISO date string
  lastReview: string; // ISO date string
}

export interface SRSData {
  words: Record<string, SRSWordData>;
}

/**
 * Get today's date as an ISO date string (YYYY-MM-DD)
 */
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Add days to a date string and return new date string
 */
function addDaysToDateString(dateString: string, days: number): string {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * Load SRS data from AsyncStorage
 */
export async function getSRSData(): Promise<SRSData> {
  try {
    const data = await AsyncStorage.getItem(SRS_KEY);
    return data ? JSON.parse(data) : { words: {} };
  } catch {
    return { words: {} };
  }
}

/**
 * Save SRS data to AsyncStorage
 */
export async function saveSRSData(data: SRSData): Promise<void> {
  try {
    await AsyncStorage.setItem(SRS_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save SRS data:', error);
  }
}

/**
 * Initialize a new word with SRS tracking
 * interval=0, easeFactor=2.5, repetitions=0, nextReview=today
 */
export async function initWordSRS(wordId: string): Promise<SRSWordData> {
  const today = getTodayString();
  const srsData = await getSRSData();

  const wordData: SRSWordData = {
    wordId,
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
    nextReview: today,
    lastReview: today,
  };

  srsData.words[wordId] = wordData;
  await saveSRSData(srsData);

  return wordData;
}

/**
 * Process a word review using SM-2 algorithm
 * quality: 0-5 scale where 0=complete blackout, 5=perfect
 * quality >= 3 is considered correct
 */
export async function reviewWord(wordId: string, quality: number): Promise<SRSWordData> {
  const srsData = await getSRSData();
  const today = getTodayString();

  // Get existing word data or initialize it
  let wordData = srsData.words[wordId];
  if (!wordData) {
    wordData = {
      wordId,
      interval: 0,
      easeFactor: 2.5,
      repetitions: 0,
      nextReview: today,
      lastReview: today,
    };
  }

  // Update last review date
  wordData.lastReview = today;

  // Clamp quality to 0-5 range
  const clampedQuality = Math.max(0, Math.min(5, quality));

  if (clampedQuality >= 3) {
    // Correct answer
    wordData.repetitions += 1;

    // Calculate interval based on repetitions
    if (wordData.repetitions === 1) {
      wordData.interval = 1;
    } else if (wordData.repetitions === 2) {
      wordData.interval = 6;
    } else {
      // rep 2+: interval = Math.round(prevInterval * easeFactor)
      wordData.interval = Math.round(wordData.interval * wordData.easeFactor);
    }

    // Calculate new ease factor
    const newEF =
      wordData.easeFactor +
      (0.1 - (5 - clampedQuality) * (0.08 + (5 - clampedQuality) * 0.02));
    wordData.easeFactor = Math.max(1.3, newEF); // Clamp to minimum 1.3
  } else {
    // Incorrect answer - reset
    wordData.interval = 1;
    wordData.repetitions = 0;
    // Ease factor stays the same or decreases slightly
    const newEF =
      wordData.easeFactor +
      (0.1 - (5 - clampedQuality) * (0.08 + (5 - clampedQuality) * 0.02));
    wordData.easeFactor = Math.max(1.3, newEF);
  }

  // Calculate next review date
  wordData.nextReview = addDaysToDateString(today, wordData.interval);

  // Save updated data
  srsData.words[wordId] = wordData;
  await saveSRSData(srsData);

  return wordData;
}

/**
 * Get all words due for review (nextReview <= today), sorted by oldest first
 */
export async function getWordsForReview(): Promise<SRSWordData[]> {
  const srsData = await getSRSData();
  const today = getTodayString();

  const wordsForReview = Object.values(srsData.words).filter(
    word => word.nextReview <= today
  );

  // Sort by nextReview date (oldest first)
  wordsForReview.sort(
    (a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime()
  );

  return wordsForReview;
}

/**
 * Get count of words due for review
 */
export async function getReviewCount(): Promise<number> {
  const wordsForReview = await getWordsForReview();
  return wordsForReview.length;
}

/**
 * Get SRS statistics
 * mastered = interval >= 21 (roughly 3 weeks)
 */
export async function getSRSStats(): Promise<{
  totalTracked: number;
  dueToday: number;
  mastered: number;
}> {
  const srsData = await getSRSData();
  const wordsForReview = await getWordsForReview();

  const totalTracked = Object.keys(srsData.words).length;
  const dueToday = wordsForReview.length;
  const mastered = Object.values(srsData.words).filter(
    word => word.interval >= 21
  ).length;

  return {
    totalTracked,
    dueToday,
    mastered,
  };
}
