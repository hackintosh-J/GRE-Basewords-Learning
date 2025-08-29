
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
