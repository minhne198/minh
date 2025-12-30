
export enum Language {
  ENGLISH = 'en',
  CHINESE = 'zh'
}

export interface VocabularyWord {
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  example_translation: string;
  part_of_speech: string;
  tags: string[];
}

export interface Lesson {
  id: string;
  topic: string;
  words: VocabularyWord[];
  timestamp: number;
}

export interface AppState {
  currentLanguage: Language;
  currentLesson: VocabularyWord[] | null;
  history: Lesson[];
  isLoading: boolean;
}
