import React, { useState, useEffect, useRef } from 'react';
import { EnrichedVocabulary, CustomList } from '../types';
import { Cog6ToothIcon, Bars3Icon, StarIcon, PlusCircleIcon, CheckCircleIcon } from './icons';
import AddToListPopover from './AddToListPopover';

interface AppHeaderProps {
  currentWord: EnrichedVocabulary | null;
  customLists: CustomList[];
  onToggleFavorite: (word: string) => void;
  onMarkAsKnown: (word: string) => void;
  onToggleWordInList: (listName: string, word: string) => void;
  onSettings: () => void;
  onToggleSidebar: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ 
  currentWord, 
  customLists,
  onToggleFavorite, 
  onMarkAsKnown,
  onToggleWordInList,
  onSettings, 
  onToggleSidebar 
}) => {
  const [showAddToList, setShowAddToList] = useState(false);
  const addToListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addToListRef.current && !addToListRef.current.contains(event.target as Node)) {
        setShowAddToList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const wordActionsDisabled = !currentWord;
  
  return (
    <header className="max-w-7xl mx-auto mb-8">
      <div className="flex justify-between items-center p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md gap-4">
        <div className="flex items-center gap-2">
            <button onClick={onToggleSidebar} className="p-2 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 md:hidden">
               <Bars3Icon className="w-6 h-6" />
            </button>
             <div>
              <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">GRE</h1>
            </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
            <button
                onClick={() => currentWord && onMarkAsKnown(currentWord.word)}
                disabled={wordActionsDisabled}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={currentWord?.isKnown ? 'Mark as not known' : 'Mark as known'}
            >
                <CheckCircleIcon className={`w-6 h-6 transition-colors ${currentWord?.isKnown ? 'text-green-500 hover:text-green-600' : 'text-slate-400 hover:text-slate-500'}`} />
            </button>
            <div className="relative" ref={addToListRef}>
                <button
                    onClick={() => setShowAddToList(prev => !prev)}
                    disabled={wordActionsDisabled}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Add to a custom list"
                >
                    <PlusCircleIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                </button>
                {showAddToList && currentWord && (
                    <AddToListPopover
                        customLists={customLists}
                        word={currentWord.word}
                        onToggleWordInList={onToggleWordInList}
                        onClose={() => setShowAddToList(false)}
                    />
                )}
            </div>
            <button
                onClick={() => currentWord && onToggleFavorite(currentWord.word)}
                disabled={wordActionsDisabled}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={currentWord?.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
                <StarIcon className={`w-6 h-6 ${currentWord?.isFavorite ? 'text-yellow-400' : 'text-slate-400'}`} solid={currentWord?.isFavorite} />
            </button>

           <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>

           <button onClick={onSettings} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
             <Cog6ToothIcon className="w-6 h-6"/>
           </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
