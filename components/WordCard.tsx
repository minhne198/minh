
import React from 'react';
import { VocabularyWord, Language } from '../types';

interface WordCardProps {
  word: VocabularyWord;
  language: Language;
  onPlayAudio: () => void;
  isAudioLoading: boolean;
}

const WordCard: React.FC<WordCardProps> = ({ word, language, onPlayAudio, isAudioLoading }) => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 transition-all duration-300 hover:shadow-2xl">
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
              {word.part_of_speech}
            </span>
            <h1 className={`mt-4 text-6xl font-bold text-slate-900 ${language === Language.CHINESE ? 'font-serif' : ''}`}>
              {word.word}
            </h1>
            <p className="mt-2 text-xl text-slate-500 font-medium">
              {word.phonetic}
            </p>
          </div>
          <button 
            onClick={onPlayAudio}
            disabled={isAudioLoading}
            className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
            title="Nghe phát âm"
          >
            {isAudioLoading ? (
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-2">Định nghĩa</h3>
            <p className="text-2xl text-slate-800 leading-relaxed">
              {word.meaning}
            </p>
          </section>

          <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">Ví dụ</h3>
            <p className="text-lg text-slate-700 italic mb-2">"{word.example}"</p>
            <p className="text-md text-slate-500">{word.example_translation}</p>
          </section>

          <div className="flex flex-wrap gap-2">
            {word.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-slate-200 text-slate-600 text-sm rounded-lg">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordCard;
