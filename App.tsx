
import React, { useState, useEffect, useCallback } from 'react';
import { Section, VocabularyData } from './types';
import Sidebar from './components/Sidebar';
import VocabularyCard from './components/VocabularyCard';
import { ChevronLeftIcon, ChevronRightIcon, SparklesIcon } from './components/icons';
import MindMapModal from './components/MindMapModal';

const App: React.FC = () => {
  const [data, setData] = useState<VocabularyData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [showMindMap, setShowMindMap] = useState<boolean>(false);

  const fetchVocabulary = useCallback(async () => {
    try {
      const response = await fetch('/list.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonData: VocabularyData = await response.json();
      if (!jsonData.sections || jsonData.sections.length === 0) {
          throw new Error("No sections found in list.json. Please add your vocabulary data.");
      }
      setData(jsonData);
    } catch (e) {
      if (e instanceof Error) {
        setError(`Failed to load vocabulary: ${e.message}. Please make sure 'public/list.json' exists and is correctly formatted.`);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVocabulary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectSection = (index: number) => {
    setCurrentSectionIndex(index);
    setCurrentWordIndex(0);
  };

  const handleNextWord = () => {
    if (data) {
      const currentSection = data.sections[currentSectionIndex];
      if (currentSection.vocabulary.length === 0) return;
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % currentSection.vocabulary.length);
    }
  };

  const handlePrevWord = () => {
    if (data) {
      const currentSection = data.sections[currentSectionIndex];
      if (currentSection.vocabulary.length === 0) return;
      setCurrentWordIndex((prevIndex) => (prevIndex - 1 + currentSection.vocabulary.length) % currentSection.vocabulary.length);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl text-slate-500">
        Loading Vocabulary...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-center text-red-500 bg-red-50 p-4">
        <div className="max-w-md">
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
        <div className="flex items-center justify-center min-h-screen text-xl text-slate-500">
            No vocabulary data available.
        </div>
    );
  }

  const currentSection: Section = data.sections[currentSectionIndex];
  const currentWord = currentSection.vocabulary[currentWordIndex];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          GRE Vocabulary Builder
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Your personalized flashcard study tool.
        </p>
      </header>
      <main className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        <Sidebar
          sections={data.sections}
          currentSectionIndex={currentSectionIndex}
          onSelectSection={handleSelectSection}
        />
        <div className="flex-1 flex flex-col gap-4">
          {currentWord ? (
            <VocabularyCard key={`${currentSectionIndex}-${currentWordIndex}`} wordData={currentWord} />
          ) : (
            <div className="flex items-center justify-center flex-grow bg-white dark:bg-slate-800 rounded-lg shadow-lg min-h-[400px]">
                <p className="text-slate-500">This section has no words.</p>
            </div>
          )}
          
          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md">
            <button onClick={handlePrevWord} className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={currentSection.vocabulary.length <= 1}>
              <ChevronLeftIcon className="w-5 h-5" />
              Previous
            </button>
            <div className="flex items-center gap-4">
                <div className="font-semibold text-slate-600 dark:text-slate-400">
                    {currentSection.vocabulary.length > 0 ? `Word ${currentWordIndex + 1} of ${currentSection.vocabulary.length}` : 'No words'}
                </div>
                <button onClick={() => setShowMindMap(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={currentSection.vocabulary.length === 0}>
                    <SparklesIcon className="w-5 h-5" />
                    Mind Map
                </button>
            </div>
            <button onClick={handleNextWord} className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={currentSection.vocabulary.length <= 1}>
              Next
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
      {showMindMap && currentSection.vocabulary.length > 0 && (
        <MindMapModal
          vocabulary={currentSection.vocabulary}
          sectionTitle={currentSection.title}
          onClose={() => setShowMindMap(false)}
        />
      )}
    </div>
  );
};

export default App;
