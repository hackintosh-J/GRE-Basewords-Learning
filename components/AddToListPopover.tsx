import React from 'react';
import { CustomList } from '../types';
import { CheckIcon } from './icons';

interface AddToListPopoverProps {
  customLists: CustomList[];
  word: string;
  onToggleWordInList: (listName: string, word: string) => void;
  onClose: () => void;
}

const AddToListPopover: React.FC<AddToListPopoverProps> = ({ customLists, word, onToggleWordInList }) => {
  return (
    <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
      <div className="py-1">
        <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase">Add to list...</div>
        {customLists.length === 0 ? (
          <div className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400">No custom lists yet.</div>
        ) : (
          customLists.map(list => {
            const isInList = list.words.includes(word);
            return (
              <button
                key={list.name}
                onClick={() => onToggleWordInList(list.name, word)}
                className="w-full text-left flex items-center justify-between px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
              >
                <span>{list.name}</span>
                {isInList && <CheckIcon className="w-4 h-4 text-blue-500" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AddToListPopover;