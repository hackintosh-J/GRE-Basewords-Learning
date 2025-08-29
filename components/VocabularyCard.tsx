import React, { useState, useEffect } from 'react';
import { EnrichedVocabulary, Derivative } from '../types';
import Badge from './Badge';
import CardSection from './CardSection';
import { LightBulbIcon, BookOpenIcon, SparklesIcon } from './icons';

interface VocabularyCardProps {
  wordData: EnrichedVocabulary;
}

const VocabularyCard: React.FC<VocabularyCardProps> = ({ wordData }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    setIsRevealed(false);
  }, [wordData]);

  const getWordFontSize = (word: string) => {
    const length = word.length;
    if (length > 17) {
      return 'text-3xl';
    }
    if (length > 13) {
      return 'text-4xl';
    }
    return 'text-5xl';
  };

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

  const CardDetails = () => (
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
  );

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 w-full h-[520px] flex flex-col transition-opacity ${wordData.isKnown ? 'opacity-50' : 'opacity-100'}`}>
      <div className="flex justify-between items-start flex-shrink-0">
        <div className="flex-1 pr-4 min-w-0">
          <h2 className={`${getWordFontSize(wordData.word)} font-bold text-slate-900 dark:text-white break-words`}>{wordData.word}</h2>
          <p className="text-xl text-blue-600 dark:text-blue-400 font-medium mt-1">{wordData.pos}</p>
        </div>
      </div>
      
      <div
        className="mt-4 flex-grow [perspective:1000px] cursor-pointer"
        onClick={() => setIsRevealed(!isRevealed)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsRevealed(!isRevealed)}
        aria-label={isRevealed ? "Hide definition" : "Reveal definition"}
      >
        <div className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${isRevealed ? '[transform:rotateY(180deg)]' : ''}`}>
          {/* Front side */}
          <div className="absolute w-full h-full [backface-visibility:hidden] flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
              <div className="text-center p-4">
                  <span className="text-xl font-semibold text-blue-600 dark:text-blue-400">Reveal</span>
              </div>
          </div>
          {/* Back side */}
          <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white dark:bg-slate-800 rounded-lg overflow-y-auto p-6 border border-slate-200 dark:border-slate-700">
             <CardDetails />
          </div>
        </div>
      </div>

    </div>
  );
};

export default VocabularyCard;
