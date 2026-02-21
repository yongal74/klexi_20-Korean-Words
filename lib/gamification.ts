import AsyncStorage from '@react-native-async-storage/async-storage';

const GAMIFICATION_KEY = '@daily_korean_gamification';

// XP Rewards Constants
export const XP_REWARDS = {
  WORD_LEARNED: 10,
  QUIZ_CORRECT: 15,
  QUIZ_PERFECT: 50,
  DAILY_COMPLETE: 30,
  STREAK_BONUS: 5,
  REVIEW_WORD: 8,
  SENTENCE_PRACTICE: 12,
  MISSION_COMPLETE: 20,
} as const;

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Ionicons name
  color: string;
  requirement: number;
  category: 'words' | 'streak' | 'quiz' | 'review' | 'practice' | 'milestone';
  unlockedAt?: string; // ISO date if unlocked
}

export interface GamificationData {
  totalXP: number;
  level: number;
  achievements: Record<string, string>; // achievementId -> unlockedAt date
  xpHistory: { date: string; amount: number; source: string }[];
}

// Achievement Colors
const ACHIEVEMENT_COLORS = {
  words: '#B8D43C',
  streak: '#E8B43C',
  quiz: '#D4864E',
  review: '#E85D5D',
  practice: '#5BA8C8',
  milestone: '#9B8EC4',
} as const;

// Achievement Icons
const ACHIEVEMENT_ICONS = {
  words: 'book',
  streak: 'flame',
  quiz: 'trophy',
  review: 'refresh-circle',
  practice: 'text',
  milestone: 'star',
} as const;

// Define all 15 achievements
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Learn your first word',
    icon: ACHIEVEMENT_ICONS.words,
    color: ACHIEVEMENT_COLORS.words,
    requirement: 1,
    category: 'words',
  },
  {
    id: 'word-explorer',
    title: 'Word Explorer',
    description: 'Learn 50 words',
    icon: ACHIEVEMENT_ICONS.words,
    color: ACHIEVEMENT_COLORS.words,
    requirement: 50,
    category: 'words',
  },
  {
    id: 'vocabulary-builder',
    title: 'Vocabulary Builder',
    description: 'Learn 100 words',
    icon: ACHIEVEMENT_ICONS.words,
    color: ACHIEVEMENT_COLORS.words,
    requirement: 100,
    category: 'words',
  },
  {
    id: 'word-master',
    title: 'Word Master',
    description: 'Learn 500 words',
    icon: ACHIEVEMENT_ICONS.words,
    color: ACHIEVEMENT_COLORS.words,
    requirement: 500,
    category: 'words',
  },
  {
    id: 'lexicon-legend',
    title: 'Lexicon Legend',
    description: 'Learn 1000 words',
    icon: ACHIEVEMENT_ICONS.words,
    color: ACHIEVEMENT_COLORS.words,
    requirement: 1000,
    category: 'words',
  },
  {
    id: 'quiz-starter',
    title: 'Quiz Starter',
    description: 'Complete first quiz',
    icon: ACHIEVEMENT_ICONS.quiz,
    color: ACHIEVEMENT_COLORS.quiz,
    requirement: 1,
    category: 'quiz',
  },
  {
    id: 'quiz-champion',
    title: 'Quiz Champion',
    description: 'Complete 20 quizzes',
    icon: ACHIEVEMENT_ICONS.quiz,
    color: ACHIEVEMENT_COLORS.quiz,
    requirement: 20,
    category: 'quiz',
  },
  {
    id: 'perfect-score',
    title: 'Perfect Score',
    description: 'Get 100% on a quiz',
    icon: ACHIEVEMENT_ICONS.quiz,
    color: ACHIEVEMENT_COLORS.quiz,
    requirement: -1, // Special case: checked separately
    category: 'quiz',
  },
  {
    id: 'on-fire',
    title: 'On Fire',
    description: '3 day streak',
    icon: ACHIEVEMENT_ICONS.streak,
    color: ACHIEVEMENT_COLORS.streak,
    requirement: 3,
    category: 'streak',
  },
  {
    id: 'dedicated',
    title: 'Dedicated',
    description: '7 day streak',
    icon: ACHIEVEMENT_ICONS.streak,
    color: ACHIEVEMENT_COLORS.streak,
    requirement: 7,
    category: 'streak',
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable',
    description: '30 day streak',
    icon: ACHIEVEMENT_ICONS.streak,
    color: ACHIEVEMENT_COLORS.streak,
    requirement: 30,
    category: 'streak',
  },
  {
    id: 'centurion',
    title: 'Centurion',
    description: '100 day streak',
    icon: ACHIEVEMENT_ICONS.streak,
    color: ACHIEVEMENT_COLORS.streak,
    requirement: 100,
    category: 'streak',
  },
  {
    id: 'reviewer',
    title: 'Reviewer',
    description: 'Review 10 wrong answers',
    icon: ACHIEVEMENT_ICONS.review,
    color: ACHIEVEMENT_COLORS.review,
    requirement: 10,
    category: 'review',
  },
  {
    id: 'practitioner',
    title: 'Practitioner',
    description: 'Complete 10 sentence practices',
    icon: ACHIEVEMENT_ICONS.practice,
    color: ACHIEVEMENT_COLORS.practice,
    requirement: 10,
    category: 'practice',
  },
  {
    id: 'rising-star',
    title: 'Rising Star',
    description: 'Reach level 10',
    icon: ACHIEVEMENT_ICONS.milestone,
    color: ACHIEVEMENT_COLORS.milestone,
    requirement: 10,
    category: 'milestone',
  },
];

const DEFAULT_GAMIFICATION_DATA: GamificationData = {
  totalXP: 0,
  level: 1,
  achievements: {},
  xpHistory: [],
};

/**
 * Calculate level information from total XP
 * Level formula: XP needed for level N = N * 100
 * Level 1: 0 XP (0-99)
 * Level 2: 200 XP total (100-299)
 * Level 3: 300 XP total (300-499)
 * etc.
 */
export function calculateLevel(totalXP: number): {
  level: number;
  currentXP: number;
  xpForNext: number;
  progress: number;
} {
  let level = 1;
  let xpUsed = 0;

  // Calculate which level we're on
  while (true) {
    const xpNeeded = level * 100;
    if (xpUsed + xpNeeded > totalXP) {
      break;
    }
    xpUsed += xpNeeded;
    level += 1;
  }

  const currentXP = totalXP - xpUsed;
  const xpForNext = level * 100;
  const progress = xpForNext > 0 ? currentXP / xpForNext : 0;

  return {
    level,
    currentXP,
    xpForNext,
    progress: Math.min(progress, 1), // Clamp to 0-1
  };
}

/**
 * Load gamification data from AsyncStorage
 */
export async function getGamificationData(): Promise<GamificationData> {
  try {
    const data = await AsyncStorage.getItem(GAMIFICATION_KEY);
    return data ? JSON.parse(data) : DEFAULT_GAMIFICATION_DATA;
  } catch {
    return DEFAULT_GAMIFICATION_DATA;
  }
}

/**
 * Save gamification data to AsyncStorage
 */
export async function saveGamificationData(data: GamificationData): Promise<void> {
  await AsyncStorage.setItem(GAMIFICATION_KEY, JSON.stringify(data));
}

/**
 * Add XP to user's total and check for level up
 */
export async function addXP(
  amount: number,
  source: string
): Promise<{ newTotal: number; levelUp: boolean; newLevel: number }> {
  const data = await getGamificationData();
  const oldLevel = data.level;

  data.totalXP += amount;

  // Add to XP history
  const today = new Date().toISOString().split('T')[0];
  data.xpHistory.push({
    date: today,
    amount,
    source,
  });

  // Recalculate level
  const levelInfo = calculateLevel(data.totalXP);
  data.level = levelInfo.level;

  await saveGamificationData(data);

  return {
    newTotal: data.totalXP,
    levelUp: data.level > oldLevel,
    newLevel: data.level,
  };
}

/**
 * Check if any achievements have been unlocked based on user stats
 */
export async function checkAchievements(stats: {
  wordsLearned: number;
  streak: number;
  quizzesTaken: number;
  perfectQuiz: boolean;
  reviewCount: number;
  practiceCount: number;
  level: number;
}): Promise<Achievement[]> {
  const data = await getGamificationData();
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    // Skip if already unlocked
    if (data.achievements[achievement.id]) {
      continue;
    }

    let shouldUnlock = false;

    switch (achievement.category) {
      case 'words':
        shouldUnlock = stats.wordsLearned >= achievement.requirement;
        break;
      case 'streak':
        shouldUnlock = stats.streak >= achievement.requirement;
        break;
      case 'quiz':
        if (achievement.id === 'perfect-score') {
          // Special case for perfect score
          shouldUnlock = stats.perfectQuiz;
        } else {
          shouldUnlock = stats.quizzesTaken >= achievement.requirement;
        }
        break;
      case 'review':
        shouldUnlock = stats.reviewCount >= achievement.requirement;
        break;
      case 'practice':
        shouldUnlock = stats.practiceCount >= achievement.requirement;
        break;
      case 'milestone':
        shouldUnlock = stats.level >= achievement.requirement;
        break;
    }

    if (shouldUnlock) {
      const now = new Date().toISOString();
      data.achievements[achievement.id] = now;
      newlyUnlocked.push({
        ...achievement,
        unlockedAt: now,
      });
    }
  }

  // Save updated data if any achievements were unlocked
  if (newlyUnlocked.length > 0) {
    await saveGamificationData(data);
  }

  return newlyUnlocked;
}

/**
 * Get all unlocked achievements with their unlock dates
 */
export async function getUnlockedAchievements(): Promise<Achievement[]> {
  const data = await getGamificationData();

  return ACHIEVEMENTS.filter((achievement) => achievement.id in data.achievements).map(
    (achievement) => ({
      ...achievement,
      unlockedAt: data.achievements[achievement.id],
    })
  );
}

/**
 * Get all achievements with their unlock status
 */
export function getAllAchievements(): Achievement[] {
  return ACHIEVEMENTS;
}
