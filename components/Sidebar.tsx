import React from 'react';
import { Section, CustomList } from '../types';
import { BookmarkIcon, ExclamationTriangleIcon, CalendarDaysIcon, PlusIcon } from './icons';

interface SidebarProps {
  sections: Section[];
  customLists: CustomList[];
  currentView: { type: string; id: string | number };
  onSelectView: (view: { type: string; id: string | number }) => void;
  todaysReviewCount: number;
  favoritesCount: number;
  difficultWordsCount: number;
  onOpenCreateListModal: () => void;
  onOpenCalendar: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    sections, 
    customLists,
    currentView, 
    onSelectView, 
    todaysReviewCount,
    favoritesCount, 
    difficultWordsCount,
    onOpenCreateListModal,
    onOpenCalendar,
    isOpen,
    onClose,
}) => {

  const smartLists = [
    {
      type: 'review',
      id: 'review',
      title: "Today's Review",
      count: todaysReviewCount,
      icon: <CalendarDaysIcon className="w-5 h-5 mr-3 text-green-500" />,
      action: onOpenCalendar,
    },
    {
      type: 'favorites',
      id: 'favorites',
      title: 'My Favorites',
      count: favoritesCount,
      icon: <BookmarkIcon className="w-5 h-5 mr-3 text-yellow-500" />,
    },
    {
      type: 'difficult',
      id: 'difficult',
      title: 'Difficult Words',
      count: difficultWordsCount,
      icon: <ExclamationTriangleIcon className="w-5 h-5 mr-3 text-red-500" />,
    },
  ];

  const getButtonClass = (isActive: boolean) =>
    `w-full text-left px-4 py-2.5 rounded-md transition-colors duration-200 flex items-center group ${
      isActive
        ? 'bg-blue-600 text-white font-semibold shadow-sm'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
    }`;
    
  const handleViewSelection = (view: { type: string; id: string | number }) => {
    onSelectView(view);
    onClose();
  }

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/40 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      <aside className={`fixed top-0 left-0 h-full w-80 flex-shrink-0 bg-white dark:bg-slate-800 p-4 shadow-lg md:shadow-md md:sticky md:top-8 md:self-start md:h-auto md:max-h-[calc(100vh-4rem)] overflow-y-auto transition-transform transform z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:rounded-lg`}>
      <nav className="flex flex-col h-full">
        <div>
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">Smart Lists</h2>
            <ul className="space-y-1">
            {smartLists.map((s) => (
                <li key={s.type} className="flex items-center gap-1">
                    <button
                        onClick={() => handleViewSelection({ type: s.type, id: s.id })}
                        className={`${getButtonClass(currentView.type === s.type)} flex-grow`}
                        disabled={s.type !== 'review' && s.count === 0}
                    >
                        {s.icon}
                        <span className="flex-grow">{s.title}</span>
                        <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${currentView.type === s.type ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-600'}`}>{s.count}</span>
                    </button>
                    {s.action && (
                       <button onClick={s.action} aria-label="Open Review Calendar" className="p-2 rounded-md text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-slate-300">
                           <CalendarDaysIcon className="w-5 h-5" />
                       </button>
                    )}
                </li>
            ))}
            </ul>
        </div>
        
        <div className="mt-6">
            <div className="flex justify-between items-center mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">My Lists</h3>
              <button onClick={onOpenCreateListModal} className="p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-slate-300">
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
            <ul className="space-y-1">
              {customLists.map((list) => (
                <li key={list.name}>
                  <button
                    onClick={() => handleViewSelection({ type: 'custom', id: list.name })}
                    className={getButtonClass(currentView.type === 'custom' && currentView.id === list.name)}
                  >
                    <span className="flex-grow">{list.name}</span>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${currentView.id === list.name ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-600'}`}>{list.words.length}</span>
                  </button>
                </li>
              ))}
            </ul>
        </div>
        
        <div className="mt-6 flex-grow flex flex-col min-h-0">
            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">Sections</h3>
            <ul className="space-y-1 overflow-y-auto">
            {sections.map((section, index) => (
                <li key={section.title}>
                <button
                    onClick={() => handleViewSelection({ type: 'section', id: index })}
                    className={getButtonClass(currentView.type === 'section' && currentView.id === index)}
                >
                    {section.title}
                </button>
                </li>
            ))}
            </ul>
        </div>
      </nav>
    </aside>
    </>
  );
};

export default Sidebar;