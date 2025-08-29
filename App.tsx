import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { VocabularyData, EnrichedVocabulary, WordStats, CustomList, UserData } from './types';
import Sidebar from './components/Sidebar';
import VocabularyCard from './components/VocabularyCard';
import AppHeader from './components/AppHeader';
import MindMapModal from './components/MindMapModal';
import QuizModal from './components/QuizModal';
import CreateListModal from './components/CreateListModal';
import SettingsModal from './components/SettingsModal';
import ReviewCalendarModal from './components/ReviewCalendarModal';
import { ChevronLeftIcon, ChevronRightIcon, SparklesIcon, AcademicCapIcon, XMarkIcon } from './components/icons';
import { handleCorrectAnswer, handleIncorrectAnswer, defaultSrsIntervals, calculateDifficulty } from './utils/srs';

const LOCAL_STORAGE_KEY = 'greVocabUserData';

const App: React.FC = () => {
  const [initialData, setInitialData] = useState<VocabularyData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<{ type: string; id: string | number }>({ type: 'section', id: 0 });
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  
  const [wordStats, setWordStats] = useState<Record<string, WordStats>>({});
  const [customLists, setCustomLists] = useState<CustomList[]>([]);
  const [srsIntervals, setSrsIntervals] = useState<{ [key: number]: number }>(defaultSrsIntervals);
  const [lastQuizState, setLastQuizState] = useState<{ type: string; id: string | number; word: string } | null>(null);

  const [showMindMap, setShowMindMap] = useState<boolean>(false);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [showCreateList, setShowCreateList] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [resumeNotification, setResumeNotification] = useState<{ type: string; id: string | number; word: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [expandedDifficultWord, setExpandedDifficultWord] = useState<string | null>(null);

  const defaultWordStat: WordStats = { isFavorite: false, correctCount: 0, incorrectCount: 0, srsLevel: 0, nextReview: null, isKnown: false, lastReviewed: null };

  // Load static vocabulary data
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/list.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const jsonData: VocabularyData = await response.json();
        if (!jsonData.sections || jsonData.sections.length === 0) throw new Error("No sections in list.json.");
        setInitialData(jsonData);
      } catch (e) {
        setError(e instanceof Error ? `Failed to load vocabulary: ${e.message}` : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);
  
  // Load user data from localStorage on initial render
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const parsedData: UserData = JSON.parse(savedData);
        if (parsedData.wordStats) setWordStats(parsedData.wordStats);
        if (parsedData.customLists) setCustomLists(parsedData.customLists);
        if (parsedData.srsIntervals) setSrsIntervals(parsedData.srsIntervals);
        if (parsedData.lastQuizState) {
            setLastQuizState(parsedData.lastQuizState);
            setResumeNotification(parsedData.lastQuizState);
        }
      }
    } catch (e) {
      console.error("Failed to load user data from localStorage", e);
    }
  }, []);

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    const dataToSave: UserData = {
      wordStats,
      customLists,
      srsIntervals,
      lastQuizState
    };
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error("Failed to save user data to localStorage", e);
    }
  }, [wordStats, customLists, srsIntervals, lastQuizState]);

   useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const allVocabulary = useMemo(() => 
    initialData?.sections.flatMap(s => s.vocabulary) || [], 
  [initialData]);

  const enrichedVocabularyMap = useMemo(() => {
    const map = new Map<string, EnrichedVocabulary>();
    allVocabulary.forEach(word => {
      map.set(word.word, {
        ...word,
        ...(wordStats[word.word] || defaultWordStat)
      });
    });
    return map;
  }, [allVocabulary, wordStats]);

  const enrichedSections = useMemo(() => {
    return initialData?.sections.map(section => ({
      ...section,
      vocabulary: section.vocabulary.map(word => enrichedVocabularyMap.get(word.word)!)
    })) || [];
  }, [initialData, enrichedVocabularyMap]);

  const favoritesList: EnrichedVocabulary[] = useMemo(() => 
    Array.from(enrichedVocabularyMap.values()).filter(v => v.isFavorite && !v.isKnown), 
  [enrichedVocabularyMap]);

  const difficultWordsList: EnrichedVocabulary[] = useMemo(() =>
    Array.from(enrichedVocabularyMap.values())
      .filter(v => (v.correctCount > 0 || v.incorrectCount > 0) && !v.isKnown)
      .sort((a,b) => calculateDifficulty(b) - calculateDifficulty(a)),
  [enrichedVocabularyMap]);
  
  const todaysReviewList: EnrichedVocabulary[] = useMemo(() => {
      const today = new Date().toISOString().split('T')[0];
      return Array.from(enrichedVocabularyMap.values()).filter(v => !v.isKnown && v.nextReview && v.nextReview <= today);
  }, [enrichedVocabularyMap]);

  const handleSelectView = (view: { type: string; id: string | number }) => {
    setActiveView(view);
    setCurrentWordIndex(0);
  };

  const currentList: EnrichedVocabulary[] = useMemo(() => {
    switch(activeView.type) {
        case 'review': return todaysReviewList;
        case 'favorites': return favoritesList;
        case 'difficult': return difficultWordsList;
        case 'section': return (enrichedSections[activeView.id as number]?.vocabulary || []).filter(v => !v.isKnown);
        case 'custom': {
            if (typeof activeView.id !== 'string') return [];
            const list = customLists.find(l => l.name === activeView.id);
            return list ? list.words.map(word => enrichedVocabularyMap.get(word)!).filter(v => v && !v.isKnown) : [];
        }
        default: return [];
    }
  }, [activeView, todaysReviewList, favoritesList, difficultWordsList, enrichedSections, customLists, enrichedVocabularyMap]);
  
  const currentSectionTitle: string = useMemo(() => {
    switch(activeView.type) {
        case 'review': return "Today's Review";
        case 'favorites': return 'My Favorites';
        case 'difficult': return 'Difficult Words';
        case 'section': return enrichedSections[activeView.id as number]?.title || '';
        case 'custom': return typeof activeView.id === 'string' ? activeView.id : '';
        default: return '';
    }
  }, [activeView, enrichedSections]);

  const handleNextWord = () => {
    if (currentList.length > 0) setCurrentWordIndex((prev) => (prev + 1) % currentList.length);
  };

  const handlePrevWord = () => {
    if (currentList.length > 0) setCurrentWordIndex((prev) => (prev - 1 + currentList.length) % currentList.length);
  };

  const handleToggleFavorite = (word: string) => {
    setWordStats(prev => ({ ...prev, [word]: { ...(prev[word] || defaultWordStat), isFavorite: !prev[word]?.isFavorite }}));
  };
  
  const handleMarkAsKnown = (word: string) => {
    setWordStats(prev => {
        const currentStat = prev[word] || defaultWordStat;
        return {
            ...prev,
            [word]: { ...currentStat, isKnown: !currentStat.isKnown }
        };
    });
  };

  const handleCreateList = (name: string): boolean => {
    if (customLists.some(list => list.name === name)) {
      return false;
    }
    setCustomLists(prev => [...prev, { name, words: [] }]);
    return true;
  };

  const handleToggleWordInList = (listName: string, word: string) => {
    setCustomLists(prev => prev.map(list => {
      if (list.name === listName) {
        const wordIndex = list.words.indexOf(word);
        if (wordIndex > -1) {
          return { ...list, words: list.words.filter(w => w !== word) };
        } else {
          return { ...list, words: [...list.words, word] };
        }
      }
      return list;
    }));
  };

  const handleQuizComplete = (results: Record<string, { correct: number, incorrect: number }>, quizState: { type: string; id: string | number; word: string } | null) => {
    setShowQuiz(false);
    setLastQuizState(quizState);
    setWordStats(prev => {
      const newStats = { ...prev };
      for (const word in results) {
        const currentStat = newStats[word] || defaultWordStat;
        const srsChange = results[word].correct > 0 
            ? handleCorrectAnswer(currentStat.srsLevel, srsIntervals) 
            : handleIncorrectAnswer(currentStat.srsLevel, srsIntervals);
        
        newStats[word] = {
          ...currentStat,
          correctCount: currentStat.correctCount + results[word].correct,
          incorrectCount: currentStat.incorrectCount + results[word].incorrect,
          srsLevel: srsChange.srsLevel,
          nextReview: srsChange.nextReview,
          lastReviewed: srsChange.lastReviewed,
        };
      }
      return newStats;
    });
  };

  const handleExportData = () => {
    try {
      const dataToExport: UserData = {
        wordStats,
        customLists,
        srsIntervals,
        lastQuizState
      };
      const dataStr = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gre_vocab_progress.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setNotification({ message: 'Data exported successfully!', type: 'success' });
    } catch (e) {
      setNotification({ message: 'Failed to export data.', type: 'error' });
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importedData = JSON.parse(event.target?.result as string) as UserData;
            // Basic validation
            if (typeof importedData.wordStats !== 'object' || !Array.isArray(importedData.customLists)) {
               throw new Error("Invalid data structure in imported file.");
            }
            setWordStats(importedData.wordStats || {});
            setCustomLists(importedData.customLists || []);
            setSrsIntervals(importedData.srsIntervals || defaultSrsIntervals);
            setLastQuizState(importedData.lastQuizState || null);
            setNotification({ message: 'Data imported successfully!', type: 'success' });
          } catch (err) {
            setNotification({ message: `Error importing data: ${err instanceof Error ? err.message : 'Invalid file'}`, type: 'error' });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleResumeSession = () => {
    if (!resumeNotification) return;

    const { type, id } = resumeNotification;
    let listToSearch: EnrichedVocabulary[] = [];

    switch(type) {
        case 'review': listToSearch = todaysReviewList; break;
        case 'favorites': listToSearch = favoritesList; break;
        case 'difficult': listToSearch = difficultWordsList; break;
        case 'section': listToSearch = (enrichedSections[id as number]?.vocabulary || []); break;
        case 'custom': {
            const list = customLists.find(l => l.name === id);
            listToSearch = list ? list.words.map(word => enrichedVocabularyMap.get(word)!).filter(Boolean) : [];
            break;
        }
    }
    
    const wordIndex = listToSearch.findIndex(v => v.word === resumeNotification.word);
    
    if (wordIndex !== -1) {
        setActiveView({ type, id });
        setCurrentWordIndex(wordIndex);
    }
    
    setResumeNotification(null);
  };


  if (isLoading) return <div className="flex items-center justify-center min-h-screen text-xl text-slate-500">Loading Vocabulary...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen text-center text-red-500 bg-red-50 p-4"><div className="max-w-md"><h2 className="text-2xl font-bold mb-2">Error</h2><p className="text-red-700">{error}</p></div></div>;
  if (!initialData) return <div className="flex items-center justify-center min-h-screen text-xl text-slate-500">No vocabulary data available.</div>;

  const currentWord = currentList[currentWordIndex];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      {notification && (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded-md shadow-lg text-white ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {notification.message}
        </div>
      )}
       {resumeNotification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 p-3 max-w-lg w-full bg-blue-600 text-white rounded-md shadow-lg flex items-center justify-between gap-4">
            <p className="text-sm">Welcome back! Last quiz was on <strong className="font-bold">{`'${resumeNotification.word}'`}</strong>. Resume?</p>
            <div className="flex gap-2">
                <button onClick={handleResumeSession} className="px-3 py-1 bg-white text-blue-700 rounded text-sm font-semibold hover:bg-blue-50">Resume</button>
                <button onClick={() => setResumeNotification(null)} className="p-1 hover:bg-blue-500/50 rounded-full"><XMarkIcon className="w-5 h-5"/></button>
            </div>
        </div>
      )}
      <AppHeader 
        onImport={handleImportData}
        onExport={handleExportData}
        onSettings={() => setShowSettings(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <main className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 relative">
        <Sidebar
          sections={initialData.sections}
          customLists={customLists}
          currentView={activeView}
          onSelectView={handleSelectView}
          todaysReviewCount={todaysReviewList.length}
          favoritesCount={favoritesList.length}
          difficultWordsCount={difficultWordsList.length}
          onOpenCreateListModal={() => setShowCreateList(true)}
          onOpenCalendar={() => setShowCalendar(true)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col gap-4">
          {activeView.type === 'difficult' ? (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 w-full flex-grow flex flex-col min-h-[400px]">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex-shrink-0">Difficult Words</h2>
              <div className="overflow-y-auto flex-grow">
                <div className="space-y-1">
                  {difficultWordsList.length > 0 ? difficultWordsList.map((word) => {
                    const difficulty = calculateDifficulty(word);
                    const isExpanded = expandedDifficultWord === word.word;
                    return (
                      <div key={word.word} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                        <button 
                          onClick={() => setExpandedDifficultWord(isExpanded ? null : word.word)} 
                          className="w-full text-left p-3 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150"
                          aria-expanded={isExpanded}
                        >
                          <span className="font-semibold text-lg text-slate-800 dark:text-slate-100">{word.word}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-mono text-slate-500 dark:text-slate-400">
                              Weight: {difficulty.toFixed(2)}
                            </span>
                            <ChevronRightIcon className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="p-3 pt-0 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50">
                            {word.definition}
                          </div>
                        )}
                      </div>
                    )
                  }) : (
                    <div className="flex items-center justify-center h-full text-slate-500">No difficult words yet. Take a quiz to populate this list!</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            currentWord ? (
              <VocabularyCard 
                key={`${activeView.type}-${activeView.id}-${currentWordIndex}`} 
                wordData={currentWord} 
                customLists={customLists}
                onToggleFavorite={handleToggleFavorite}
                onToggleWordInList={handleToggleWordInList}
                onMarkAsKnown={handleMarkAsKnown}
              />
            ) : (
              <div className="flex items-center justify-center flex-grow bg-white dark:bg-slate-800 rounded-lg shadow-lg min-h-[400px]">
                  <p className="text-slate-500 text-center p-4">This list is empty. Try another one, or start a quiz to populate your difficult words list!</p>
              </div>
            )
          )}
          
          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md flex-wrap gap-4">
            {activeView.type === 'difficult' ? (
              <div className="w-full flex justify-center items-center gap-4">
                  <span className="font-semibold text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                      {difficultWordsList.length} words to practice
                  </span>
                  <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={currentList.length === 0}>
                      <AcademicCapIcon className="w-5 h-5" />
                      <span className="hidden sm:inline">Quiz This List</span>
                  </button>
                  <button onClick={() => setShowMindMap(true)} className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={currentList.length === 0}>
                      <SparklesIcon className="w-5 h-5" />
                      <span className="hidden sm:inline">Mind Map</span>
                  </button>
              </div>
            ) : (
              <>
                <button onClick={handlePrevWord} className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={currentList.length <= 1}>
                  <ChevronLeftIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Previous</span>
                </button>
                <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
                    <div className="font-semibold text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                        {currentList.length > 0 ? `Word ${currentWordIndex + 1} of ${currentList.length}` : 'No words'}
                    </div>
                    <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={currentList.length === 0}>
                        <AcademicCapIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Quiz Me</span>
                    </button>
                    <button onClick={() => setShowMindMap(true)} className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={currentList.length === 0}>
                        <SparklesIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Mind Map</span>
                    </button>
                </div>
                <button onClick={handleNextWord} className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={currentList.length <= 1}>
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </main>
      {showMindMap && currentList.length > 0 && (
        <MindMapModal
          vocabulary={currentList}
          sectionTitle={currentSectionTitle}
          onClose={() => setShowMindMap(false)}
        />
      )}
       {showQuiz && currentList.length > 0 && (
        <QuizModal
          vocabulary={currentList}
          sectionTitle={currentSectionTitle}
          onClose={() => setShowQuiz(false)}
          onComplete={handleQuizComplete}
          activeView={activeView}
        />
      )}
      {showCreateList && (
        <CreateListModal
            onClose={() => setShowCreateList(false)}
            onCreate={handleCreateList}
        />
      )}
       {showSettings && (
        <SettingsModal
            currentIntervals={srsIntervals}
            onSave={setSrsIntervals}
            onClose={() => setShowSettings(false)}
        />
      )}
       {showCalendar && (
        <ReviewCalendarModal
            vocabularyMap={enrichedVocabularyMap}
            onClose={() => setShowCalendar(false)}
        />
      )}
    </div>
  );
};

export default App;