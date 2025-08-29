
import React, { useState, useEffect } from 'react';
import { Vocabulary, Derivative } from '../types';
import Badge from './Badge';
import CardSection from './CardSection';
import { LightBulbIcon, BookOpenIcon, SparklesIcon } from './icons';

interface VocabularyCardProps {
  wordData: Vocabulary;
}

const VocabularyCard: React.FC<VocabularyCardProps> = ({ wordData }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    setIsRevealed(false);
  }, [wordData]);

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
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 w-full min-h-[400px] flex flex-col">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white">{wordData.word}</h2>
          <p className="text-lg text-blue-600 dark:text-blue-400 font-medium mt-1">{wordData.pos}</p>
        </div>
        <button
          onClick={() => setIsRevealed(!isRevealed)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm"
        >
          {isRevealed ? 'Hide' : 'Reveal'}
        </button>
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
