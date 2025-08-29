import React, { useState, useEffect } from 'react';
import { XMarkIcon } from './icons';

interface Word {
  word: string;
  definition: string;
}

interface Theme {
  name: string;
  color: string;
  synonyms: Word[];
  antonyms: Word[];
  distinctions?: { word1: string; word2: string }[];
}

interface MindMapData {
  themes: Theme[];
}

interface MindMapModalProps {
  onClose: () => void;
}

const MindMapModal: React.FC<MindMapModalProps> = ({ onClose }) => {
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    const fetchMindMapData = async () => {
      try {
        const response = await fetch('./mindmap.json');
        if (!response.ok) {
          throw new Error('Failed to load mind map data.');
        }
        const data: MindMapData = await response.json();
        setMindMapData(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMindMapData();
  }, []);

  const WordBadge: React.FC<{ word: Word }> = ({ word }) => (
    <div className="relative group">
      <span className="inline-block px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-transform hover:scale-105 bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
        {word.word}
      </span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-slate-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        {word.definition}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900"></div>
      </div>
    </div>
  );

  const colorClasses = {
    base: 'border-l-4 p-4 rounded-r-lg mb-6 bg-white dark:bg-slate-800 shadow',
    blue: 'border-blue-500',
    red: 'border-red-500',
    indigo: 'border-indigo-500',
    yellow: 'border-yellow-500',
    purple: 'border-purple-500',
    pink: 'border-pink-500',
    teal: 'border-teal-500',
    orange: 'border-orange-500',
  };

  const getBorderColor = (color: string) => colorClasses[color as keyof typeof colorClasses] || 'border-slate-500';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-50 dark:bg-slate-900 w-full h-full max-w-6xl max-h-[90vh] rounded-lg shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 bg-white dark:bg-slate-800 rounded-t-lg">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Vocabulary Mind Map</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <XMarkIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
          </button>
        </header>

        <main className="flex-grow p-6 overflow-y-auto">
          {isLoading && <div className="text-center text-slate-500">Loading Mind Map...</div>}
          {error && <div className="text-center text-red-500">{error}</div>}
          {mindMapData && (
            <div>
              {mindMapData.themes.map((theme) => (
                <section key={theme.name} className={`${colorClasses.base} ${getBorderColor(theme.color)}`}>
                  <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-slate-100">{theme.name}</h3>
                  
                  {theme.synonyms.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold uppercase text-green-600 dark:text-green-400 mb-2">Synonyms</h4>
                      <div className="flex flex-wrap gap-2">
                        {theme.synonyms.map(word => <WordBadge key={word.word} word={word} />)}
                      </div>
                    </div>
                  )}

                  {theme.antonyms.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold uppercase text-red-600 dark:text-red-400 mb-2">Antonyms</h4>
                      <div className="flex flex-wrap gap-2">
                        {theme.antonyms.map(word => <WordBadge key={word.word} word={word} />)}
                      </div>
                    </div>
                  )}

                  {theme.distinctions && theme.distinctions.length > 0 && (
                     <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <h4 className="text-sm font-semibold uppercase text-yellow-600 dark:text-yellow-400 mb-2">Distinctions</h4>
                      <div className="flex flex-col items-start gap-2">
                         {theme.distinctions.map((pair, index) => (
                           <div key={index} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                             <span>{pair.word1}</span>
                             <span className="font-bold text-slate-400">vs.</span>
                             <span>{pair.word2}</span>
                           </div>
                         ))}
                      </div>
                    </div>
                  )}
                </section>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MindMapModal;