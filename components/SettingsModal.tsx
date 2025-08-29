import React, { useState, useEffect } from 'react';
import { XMarkIcon, ArrowUpTrayIcon, ArrowDownTrayIcon } from './icons';
import { defaultSrsIntervals } from '../utils/srs';

interface SettingsModalProps {
  currentIntervals: { [key: number]: number };
  onSave: (newIntervals: { [key: number]: number }) => void;
  onClose: () => void;
  onImport: () => void;
  onExport: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ currentIntervals, onSave, onClose, onImport, onExport }) => {
  const [intervals, setIntervals] = useState(currentIntervals);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleIntervalChange = (level: number, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      setIntervals(prev => ({ ...prev, [level]: numValue }));
    }
  };

  const handleSave = () => {
    onSave(intervals);
    onClose();
  };
  
  const handleReset = () => {
    setIntervals(defaultSrsIntervals);
  }

  const sortedLevels = Object.keys(intervals).map(Number).sort((a, b) => a - b);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-lg shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Settings</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <XMarkIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
          </button>
        </header>
        <main className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">SRS Intervals</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Customize the Spaced Repetition System (SRS) intervals. This determines how many days you'll wait before reviewing a word again after a correct answer in a quiz.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {sortedLevels.map(level => (
                <div key={level}>
                  <label htmlFor={`srs-level-${level}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Level {level}
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                      <input
                        type="number"
                        id={`srs-level-${level}`}
                        value={intervals[level]}
                        onChange={(e) => handleIntervalChange(level, e.target.value)}
                        className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                      />
                      <span className="text-sm text-slate-500 dark:text-slate-400">days</span>
                  </div>
                </div>
              ))}
            </div>
             <div className="mt-4">
                <button onClick={handleReset} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  Reset to Default
                </button>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-700" />

          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Data Management</h3>
             <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Save your progress to a file or load it from a previous session.
            </p>
            <div className="flex gap-4">
              <button onClick={onImport} className="flex items-center justify-center gap-2 px-4 py-2 w-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/80 transition-colors text-sm font-medium">
                <ArrowUpTrayIcon className="w-5 h-5"/>
                <span>Import Data</span>
              </button>
              <button onClick={onExport} className="flex items-center justify-center gap-2 px-4 py-2 w-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/80 transition-colors text-sm font-medium">
                <ArrowDownTrayIcon className="w-5 h-5"/>
                <span>Export Data</span>
              </button>
            </div>
          </div>

        </main>
        <footer className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end items-center">
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Save Changes
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SettingsModal;