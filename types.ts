export interface Derivative {
  word: string;
  pos: string;
  definition: string;
}

export interface Vocabulary {
  word: string;
  pos: string;
  definition: string;
  examples?: string[];
  notes?: string;
  derivatives?: Derivative[];
  antonyms?: string[];
  synonyms?: string[];
  distinctions?: string[];
}

export interface Section {
  title: string;
  vocabulary: Vocabulary[];
}

export interface VocabularyData {
  sections: Section[];
}

export interface WordStats {
  isFavorite: boolean;
  correctCount: number;
  incorrectCount: number;
  srsLevel: number;
  nextReview: string | null; // ISO Date String
  isKnown: boolean;
  lastReviewed: string | null; // ISO Date String
}

export interface CustomList {
  name: string;
  words: string[]; // array of word strings
}

export type EnrichedVocabulary = Vocabulary & WordStats;

export interface EnrichedSection {
  title: string;
  vocabulary: EnrichedVocabulary[];
}

export interface UserData {
  wordStats: Record<string, WordStats>;
  customLists: CustomList[];
  srsIntervals: { [key: number]: number };
  lastViewState: { type: string; id: string | number; index: number } | null;
}