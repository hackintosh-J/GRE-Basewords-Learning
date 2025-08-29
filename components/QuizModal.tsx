import React, { useState, useEffect, useMemo } from 'react';
import { EnrichedVocabulary } from '../types';
import { XMarkIcon } from './icons';

interface QuizModalProps {
  vocabulary: EnrichedVocabulary[];
  sectionTitle: string;
  onClose: () => void;
  onAnswer: (word: string, knewIt: boolean) => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ vocabulary, sectionTitle, onClose, onAnswer }) => {
  const [shuffledWords, setShuffledWords] = useState<EnrichedVocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Shuffling is done once when the component mounts
    setShuffledWords([...vocabulary].sort(() => Math.random() - 0.5));
  }, [vocabulary]);

  const handleUserAnswer = (knewIt: boolean) => {
    const word = shuffledWords[currentIndex];
    onAnswer(word.word, knewIt);
    if(knewIt) {
        setSessionCorrectCount(prev => prev + 1);
    }
    
    if (currentIndex + 1 >= shuffledWords.length) {
      setIsFinished(true);
    } else {
      setCurrentIndex(prev => prev + 1);
      setIsRevealed(false);
    }
  };


  const currentWord = shuffledWords[currentIndex];

  if (isFinished) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-lg shadow-2xl flex flex-col p-8 text-center items-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Quiz Complete!</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6">You reviewed {shuffledWords.length} words from "{sectionTitle}".</p>
                <div className="text-6xl font-bold text-green-500 mb-2">{sessionCorrectCount}</div>
                <div className="text-lg text-slate-700 dark:text-slate-200 mb-8">Correct Answers</div>
                <button onClick={onClose} className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm">
                    Done
                </button>
            </div>
        </div>
    )
  }

  if (!currentWord) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-2xl min-h-[50vh] rounded-lg shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Quiz: {sectionTitle}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Word {currentIndex + 1} of {shuffledWords.length}</p>
            </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <XMarkIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
          </button>
        </header>

        <main className="flex-grow p-6 flex flex-col items-center justify-center text-center">
            <h3 className="text-5xl font-bold text-slate-900 dark:text-white">{currentWord.word}</h3>
            <p className="text-lg text-blue-600 dark:text-blue-400 font-medium mt-2 mb-6">{currentWord.pos}</p>
            
            <div className="h-24">
                {isRevealed && (
                    <p className="text-xl text-slate-800 dark:text-slate-200 animate-fade-in">{currentWord.definition}</p>
                )}
            </div>
        </main>

        <footer className="p-4 border-t border-slate-200 dark:border-slate-700 flex flex-col items-center gap-4">
            {!isRevealed ? (
                 <button onClick={() => setIsRevealed(true)} className="w-full max-w-xs px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm">
                    Show Definition
                </button>
            ) : (
                <div className="w-full flex justify-center gap-4">
                    <button onClick={() => handleUserAnswer(false)} className="flex-1 px-6 py-3 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-900 transition-colors duration-200 font-semibold">
                        Didn't Know
                    </button>
                    <button onClick={() => handleUserAnswer(true)} className="flex-1 px-6 py-3 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900 transition-colors duration-200 font-semibold">
                        I Knew It
                    </button>
                </div>
            )}
        </footer>
      </div>
    </div>
  );
};

export default QuizModal;
