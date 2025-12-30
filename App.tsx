
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Language, VocabularyWord, Lesson } from './types';
import { generateLesson, getPronunciation, decodeAudioData } from './services/geminiService';
import WordCard from './components/WordCard';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const [currentLesson, setCurrentLesson] = useState<VocabularyWord[]>([]);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number>(0);
  const [history, setHistory] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [topic, setTopic] = useState('');

  const audioContextRef = useRef<AudioContext | null>(null);

  const fetchNewLesson = useCallback(async () => {
    setIsLoading(true);
    try {
      const words = await generateLesson(language, topic);
      if (words.length > 0) {
        setCurrentLesson(words);
        setSelectedWordIndex(0);
        
        const newLesson: Lesson = {
          id: Math.random().toString(36).substr(2, 9),
          topic: topic || 'Tổng hợp',
          words: words,
          timestamp: Date.now()
        };
        setHistory(prev => [newLesson, ...prev.slice(0, 4)]);
      }
    } catch (error) {
      console.error("Failed to fetch lesson:", error);
    } finally {
      setIsLoading(false);
    }
  }, [language, topic]);

  useEffect(() => {
    fetchNewLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const handlePlayAudio = async (text: string) => {
    setIsAudioLoading(true);
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      const audioBytes = await getPronunciation(text, language);
      const audioBuffer = await decodeAudioData(audioBytes, ctx);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start();
    } catch (error) {
      console.error("Audio playback failed:", error);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const currentWord = currentLesson[selectedWordIndex];

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8 bg-slate-50">
      {/* Header */}
      <header className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">LingoFlow AI</h1>
            <p className="text-slate-500 text-xs font-medium">Học 10 từ vựng mỗi bài học</p>
          </div>
        </div>

        <div className="flex bg-slate-200 p-1 rounded-xl shadow-inner">
          <button 
            onClick={() => setLanguage(Language.ENGLISH)}
            className={`px-5 py-1.5 rounded-lg text-sm font-bold transition-all ${language === Language.ENGLISH ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            English
          </button>
          <button 
            onClick={() => setLanguage(Language.CHINESE)}
            className={`px-5 py-1.5 rounded-lg text-sm font-bold transition-all ${language === Language.CHINESE ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            中文 (Giản thể)
          </button>
        </div>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Lesson Navigation & Search */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <div className="relative mb-4">
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Chủ đề (vd: Travel, Tech...)"
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 font-medium placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button 
              onClick={fetchNewLesson}
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-indigo-100"
            >
              {isLoading ? 'Đang tạo bài học...' : 'Tạo bài học 10 từ'}
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col flex-grow">
            <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Danh sách từ vựng</h2>
              <span className="text-xs font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                {selectedWordIndex + 1}/10
              </span>
            </div>
            <div className="overflow-y-auto max-h-[500px] p-2 space-y-1">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-12 w-full bg-slate-100 animate-pulse rounded-xl"></div>
                ))
              ) : currentLesson.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedWordIndex(idx)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedWordIndex === idx ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100' : 'hover:bg-slate-50 text-slate-600'}`}
                >
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${selectedWordIndex === idx ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {idx + 1}
                  </span>
                  <div className="text-left">
                    <p className="font-bold text-sm leading-none mb-1">{word.word}</p>
                    <p className="text-[10px] opacity-70 truncate w-40">{word.meaning}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Word Details */}
        <div className="lg:col-span-8">
          {isLoading ? (
            <div className="w-full h-full min-h-[500px] bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <p className="text-slate-400 font-medium">AI đang biên soạn bài học cho bạn...</p>
            </div>
          ) : currentWord ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <WordCard 
                word={currentWord} 
                language={language} 
                onPlayAudio={() => handlePlayAudio(currentWord.word)}
                isAudioLoading={isAudioLoading}
              />
              
              {/* Navigation buttons for words */}
              <div className="flex justify-between items-center px-4">
                <button 
                  disabled={selectedWordIndex === 0}
                  onClick={() => setSelectedWordIndex(prev => prev - 1)}
                  className="px-6 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-30 transition-all flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Từ trước
                </button>
                <button 
                  disabled={selectedWordIndex === currentLesson.length - 1}
                  onClick={() => setSelectedWordIndex(prev => prev + 1)}
                  className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-30 transition-all flex items-center gap-2"
                >
                  Từ tiếp theo
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {/* History Section */}
      <section className="w-full max-w-6xl mt-16 border-t border-slate-200 pt-8">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Bài học cũ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {history.length === 0 ? (
            <p className="text-slate-400 text-sm col-span-full italic">Chưa có lịch sử bài học.</p>
          ) : history.map((h) => (
            <button 
              key={h.id}
              onClick={() => {
                setCurrentLesson(h.words);
                setSelectedWordIndex(0);
              }}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-left group"
            >
              <p className="text-xs text-slate-400 mb-1">{new Date(h.timestamp).toLocaleDateString('vi-VN')}</p>
              <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">{h.topic}</p>
              <p className="text-[10px] text-slate-500 mt-2">{h.words.length} từ vựng</p>
            </button>
          ))}
        </div>
      </section>

      <footer className="mt-20 text-slate-400 text-xs text-center pb-8">
        <p>© 2024 LingoFlow AI. Công cụ học tập được hỗ trợ bởi Gemini API.</p>
      </footer>
    </div>
  );
};

export default App;
