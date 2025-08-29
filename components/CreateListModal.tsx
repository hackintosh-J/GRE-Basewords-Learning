import React, { useState, useEffect } from 'react';
import { XMarkIcon } from './icons';

interface CreateListModalProps {
  onClose: () => void;
  onCreate: (name: string) => boolean;
}

const CreateListModal: React.FC<CreateListModalProps> = ({ onClose, onCreate }) => {
  const [listName, setListName] = useState('');
  const [error, setError] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (listName.trim()) {
      const success = onCreate(listName.trim());
      if (success) {
        onClose();
      } else {
        setError('A list with this name already exists.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-lg shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Create New List</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <XMarkIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
          </button>
        </header>
        <form onSubmit={handleSubmit}>
          <main className="p-6">
            <label htmlFor="listName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">List Name</label>
            <input
              type="text"
              id="listName"
              value={listName}
              onChange={(e) => {
                  setListName(e.target.value);
                  setError('');
              }}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 'Words for Week 1'"
              autoFocus
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </main>
          <footer className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={!listName.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Create List
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default CreateListModal;
