import React, { useState, useEffect, useRef } from 'react';
import { EnrichedVocabulary, Derivative, CustomList } from '../types';
import Badge from './Badge';
import CardSection from './CardSection';
import AddToListPopover from './AddToListPopover';
import { LightBulbIcon, BookOpenIcon, SparklesIcon, StarIcon, PlusCircleIcon, CheckCircleIcon } from './icons';

interface VocabularyCardProps {
  wordData: EnrichedVocabulary;
  customLists: CustomList[];
  onToggleFavorite: (word: string) => void;
  onToggleWordInList: (listName: string, word: string) => void;
  onMarkAsKnown: (word: string) => void;
}

const VocabularyCard: React.FC<VocabularyCardProps> = ({ wordData, customLists, onToggleFavorite, onToggleWordInList, onMarkAsKnown }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showAddToList, setShowAddToList] = useState(false);
  const addToListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsRevealed(false);
  }, [wordData]);
  
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

  const renderList = (items?: string[], color: 'blue' | 'green' | 'red' | 'yellow' | 'gray' = 'gray') => (
    <div className="flex flex-wrap gap-2">
      {items?.map((item, index) => <Badge key={index} color={color}>{item}</Badge>)}
    </div>
  );

  const renderDerivatives = (items?: Derivative[]) => (
    <ul className="list-disc pl-5 space-y-1">
      {items?.map((item, index) => (
        <li key={index}>
          <strong className="text-slate-800 dark:text-slate-200">{item.word}</strong> <em className="text-slate-500 dark:text-slate-400">({item.pos})</em>: {item.definition}
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 w-full min-h-[400px] flex flex-col transition-opacity ${wordData.isKnown ? 'opacity-60' : 'opacity-100'}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1 pr-4">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white">{wordData.word}</h2>
          <p className="text-lg text-blue-600 dark:text-blue-400 font-medium mt-1">{wordData.pos}</p>
        </div>
        <div className="flex items-center space-x-1">
             <button
                onClick={() => onMarkAsKnown(wordData.word)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label={wordData.isKnown ? 'Mark as not known' : 'Mark as known'}
            >
                <CheckCircleIcon className={`w-7 h-7 ${wordData.isKnown ? 'text-green-500' : 'text-slate-400'}`} />
            </button>
             <div className="relative" ref={addToListRef}>
                <button
                    onClick={() => setShowAddToList(prev => !prev)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Add to a custom list"
                >
                    <PlusCircleIcon className="w-7 h-7 text-slate-500 dark:text-slate-400" />
                </button>
                {showAddToList && (
                    <AddToListPopover
                        customLists={customLists}
                        word={wordData.word}
                        onToggleWordInList={onToggleWordInList}
                        onClose={() => setShowAddToList(false)}
                    />
                )}
            </div>
            <button
                onClick={() => onToggleFavorite(wordData.word)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label={wordData.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
                <StarIcon className={`w-7 h-7 ${wordData.isFavorite ? 'text-yellow-400' : 'text-slate-400'}`} solid={wordData.isFavorite} />
            </button>
            <button
                onClick={() => setIsRevealed(!isRevealed)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm ml-2"
            >
                {isRevealed ? 'Hide' : 'Reveal'}
            </button>
        </div>
      </div>

      <div className={`mt-6 transition-opacity duration-500 flex-grow ${isRevealed ? 'opacity-100' : 'opacity-0'}`}>
        {isRevealed && (
          <div className="space-y-4">
            <p className="text-xl text-slate-800 dark:text-slate-200">{wordData.definition}</p>
            
            {wordData.notes && (
                <CardSection title="Mnemonic Notes" icon={<LightBulbIcon className="w-5 h-5 text-yellow-500" />}>
                     <p className="italic">{wordData.notes}</p>
                </CardSection>
            )}

            {wordData.examples && wordData.examples.length > 0 && (
              <CardSection title="Examples" icon={<BookOpenIcon className="w-5 h-5 text-blue-500" />}>
                <ul className="list-disc pl-5 space-y-1">
                  {wordData.examples.map((ex, index) => <li key={index}>{ex}</li>)}
                </ul>
              </CardSection>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                {wordData.synonyms && wordData.synonyms.length > 0 && (
                    <CardSection title="Synonyms">{renderList(wordData.synonyms, 'green')}</CardSection>
                )}
                {wordData.antonyms && wordData.antonyms.length > 0 && (
                    <CardSection title="Antonyms">{renderList(wordData.antonyms, 'red')}</CardSection>
                )}
                {wordData.derivatives && wordData.derivatives.length > 0 && (
                    <CardSection title="Derivatives" icon={<SparklesIcon className="w-5 h-5 text-indigo-500" />}>{renderDerivatives(wordData.derivatives)}</CardSection>
                )}
                {wordData.distinctions && wordData.distinctions.length > 0 && (
                    <CardSection title="Distinctions">{renderList(wordData.distinctions, 'yellow')}</CardSection>
                )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default VocabularyCard;