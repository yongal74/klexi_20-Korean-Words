export interface ThemeWord {
  korean: string;
  english: string;
  pronunciation: string;
  example: string;
  exampleTranslation: string;
}

export interface ThemeLessonMeta {
  id: string;
  title: string;
  titleKr: string;
  icon: string;
  color: string;
  description: string;
}

export interface ThemeWordWithLevel extends ThemeWord {
  level: number;
}

export interface ThemeLesson extends ThemeLessonMeta {
  words: ThemeWordWithLevel[];
}

import { KDRAMA_WORDS } from './theme-vocab/kdrama';
import { KPOP_WORDS } from './theme-vocab/kpop';
import { KFOOD_WORDS } from './theme-vocab/kfood';
import { TRAVEL_WORDS } from './theme-vocab/travel';
import { SLANG_WORDS } from './theme-vocab/slang';
import { MANNERS_WORDS } from './theme-vocab/manners';

export const THEME_META: ThemeLessonMeta[] = [
  {
    id: 'kdrama',
    title: 'K-Drama Expressions',
    titleKr: '드라마 표현',
    icon: 'film',
    color: '#FF6B6B',
    description: 'Popular phrases from Korean dramas',
  },
  {
    id: 'kpop',
    title: 'K-Pop Fan Talk',
    titleKr: '케이팝 팬 용어',
    icon: 'musical-notes',
    color: '#DDA0DD',
    description: 'Essential vocabulary for K-Pop fans',
  },
  {
    id: 'kfood',
    title: 'K-Food & Cooking',
    titleKr: '한국 음식',
    icon: 'restaurant',
    color: '#FFB347',
    description: 'Korean food, ingredients, and cooking',
  },
  {
    id: 'travel',
    title: 'Travel in Korea',
    titleKr: '한국 여행',
    icon: 'airplane',
    color: '#87CEEB',
    description: 'Essential travel vocabulary for Korea',
  },
  {
    id: 'slang',
    title: 'Internet Slang',
    titleKr: '인터넷 용어',
    icon: 'chatbubble-ellipses',
    color: '#98FB98',
    description: 'Modern Korean internet expressions',
  },
  {
    id: 'manners',
    title: 'Korean Manners',
    titleKr: '한국 예절',
    icon: 'heart',
    color: '#F0E68C',
    description: 'Etiquette and polite expressions',
  },
];

const THEME_WORDS_MAP: Record<string, Record<number, ThemeWord[]>> = {
  kdrama: KDRAMA_WORDS,
  kpop: KPOP_WORDS,
  kfood: KFOOD_WORDS,
  travel: TRAVEL_WORDS,
  slang: SLANG_WORDS,
  manners: MANNERS_WORDS,
};

export function getThemeWords(themeId: string, level?: number): ThemeWordWithLevel[] {
  const themeWords = THEME_WORDS_MAP[themeId];
  if (!themeWords) return [];
  if (level && themeWords[level]) return themeWords[level].map(w => ({ ...w, level }));
  return Object.entries(themeWords).flatMap(([lvl, words]) =>
    words.map(w => ({ ...w, level: Number(lvl) }))
  );
}

export function getThemeWordCount(themeId: string, level?: number): number {
  return getThemeWords(themeId, level).length;
}

export const THEME_LESSONS: ThemeLesson[] = THEME_META.map(meta => ({
  ...meta,
  words: getThemeWords(meta.id),
}));
