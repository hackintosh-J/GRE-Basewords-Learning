import React from 'react';
import { ArrowUpTrayIcon, ArrowDownTrayIcon, Cog6ToothIcon, Bars3Icon } from './icons';

interface AppHeaderProps {
  onImport: () => void;
  onExport: () => void;
  onSettings: () => void;
  onToggleSidebar: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onImport, onExport, onSettings, onToggleSidebar }) => {
  return (
    <header className="max-w-7xl mx-auto mb-8">
      <div className="flex justify-between items-center p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md gap-4">
        <div className="flex items-center gap-2">
            <button onClick={onToggleSidebar} className="p-2 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 md:hidden">
               <Bars3Icon className="w-6 h-6" />
            </button>
             <div>
              <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">GRE Vocabulary Builder</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Your intelligent flashcard study tool.</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={onImport} className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/80 transition-colors text-sm font-medium">
             <ArrowUpTrayIcon className="w-5 h-5"/>
             <span className="hidden sm:inline">Import</span>
           </button>
           <button onClick={onExport} className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/80 transition-colors text-sm font-medium">
             <ArrowDownTrayIcon className="w-5 h-5"/>
             <span className="hidden sm:inline">Export</span>
           </button>
           <button onClick={onSettings} className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium">
             <Cog6ToothIcon className="w-5 h-5"/>
             <span className="hidden sm:inline">Settings</span>
           </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;