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
