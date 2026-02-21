import level1Part1 from './vocab/level1-part1';
import level1Part2 from './vocab/level1-part2';
import level1Part3 from './vocab/level1-part3';
import level2Part1 from './vocab/level2-part1';
import level2Part2 from './vocab/level2-part2';
import level2Part3 from './vocab/level2-part3';
import level3Part1 from './vocab/level3-part1';
import level3Part2 from './vocab/level3-part2';
import level3Part3 from './vocab/level3-part3';
import level4Part1 from './vocab/level4-part1';
import level4Part2 from './vocab/level4-part2';
import level4Part3 from './vocab/level4-part3';
import level5Part1 from './vocab/level5-part1';
import level5Part2 from './vocab/level5-part2';
import level5Part3 from './vocab/level5-part3';
import level6Part1 from './vocab/level6-part1';
import level6Part2 from './vocab/level6-part2';
import level6Part3 from './vocab/level6-part3';

export interface Word {
  id: string;
  korean: string;
  english: string;
  pronunciation: string;
  partOfSpeech: string;
  example: string;
  exampleTranslation: string;
  category: string;
}

export interface TopikLevel {
  id: string;
  level: string;
  sublevel: string;
  title: string;
  description: string;
  color: string;
  days: string;
}

export const TOPIK_LEVELS: TopikLevel[] = [
  { id: 'topik1-1', level: 'TOPIK I', sublevel: 'Level 1', title: 'Complete Beginner', description: 'Hangeul basics, greetings, numbers, daily essentials', color: '#8BC34A', days: 'Days 1-60' },
  { id: 'topik1-2', level: 'TOPIK I', sublevel: 'Level 2', title: 'Elementary', description: 'Daily conversations, shopping, K-pop vocabulary', color: '#66BB9A', days: 'Days 61-120' },
  { id: 'topik2-3', level: 'TOPIK II', sublevel: 'Level 3', title: 'Pre-Intermediate', description: 'Social topics, K-drama expressions, travel', color: '#5BA8C8', days: 'Days 121-180' },
  { id: 'topik2-4', level: 'TOPIK II', sublevel: 'Level 4', title: 'Intermediate', description: 'News, culture, formal Korean, business', color: '#C98A5E', days: 'Days 181-240' },
  { id: 'topik2-5', level: 'TOPIK II', sublevel: 'Level 5', title: 'Upper Intermediate', description: 'Literature, media, abstract thinking, advanced grammar', color: '#B89B6A', days: 'Days 241-300' },
  { id: 'topik2-6', level: 'TOPIK II', sublevel: 'Level 6', title: 'Advanced', description: 'Academic writing, professional Korean, formal expressions', color: '#9B8EC4', days: 'Days 301-360' },
];

const VOCABULARY_DATA: Record<string, Word[]> = {
  'topik1-1': [...level1Part1, ...level1Part2, ...level1Part3],
  'topik1-2': [...level2Part1, ...level2Part2, ...level2Part3],
  'topik2-3': [...level3Part1, ...level3Part2, ...level3Part3],
  'topik2-4': [...level4Part1, ...level4Part2, ...level4Part3],
  'topik2-5': [...level5Part1, ...level5Part2, ...level5Part3],
  'topik2-6': [...level6Part1, ...level6Part2, ...level6Part3],
};

export function getWordsForLevel(levelId: string): Word[] {
  return VOCABULARY_DATA[levelId] || [];
}

export function getDailyWords(levelId: string, day: number, wordsPerDay: number = 20): Word[] {
  const allWords = getWordsForLevel(levelId);
  if (allWords.length === 0) return [];
  const startIndex = ((day - 1) * wordsPerDay) % allWords.length;
  const words: Word[] = [];
  for (let i = 0; i < wordsPerDay; i++) {
    words.push(allWords[(startIndex + i) % allWords.length]);
  }
  return words;
}

export function generateQuizOptions(correctWord: Word, allWords: Word[], count: number = 4): string[] {
  const options = [correctWord.english];
  const otherWords = allWords.filter(w => w.id !== correctWord.id);
  const shuffled = [...otherWords].sort(() => Math.random() - 0.5);
  for (const w of shuffled) {
    if (options.length >= count) break;
    if (!options.includes(w.english)) {
      options.push(w.english);
    }
  }
  while (options.length < count) {
    options.push(`Option ${options.length + 1}`);
  }
  return options.sort(() => Math.random() - 0.5);
}

export function getAllWords(): Word[] {
  return Object.values(VOCABULARY_DATA).flat();
}
