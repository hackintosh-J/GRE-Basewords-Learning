
import React from 'react';
import { Section } from '../types';

interface SidebarProps {
  sections: Section[];
  currentSectionIndex: number;
  onSelectSection: (index: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sections, currentSectionIndex, onSelectSection }) => {
  return (
    <aside className="w-full md:w-64 flex-shrink-0 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md md:sticky md:top-8 md:self-start max-h-[30vh] md:max-h-[calc(100vh-4rem)] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">Sections</h2>
      <nav>
        <ul>
          {sections.map((section, index) => (
            <li key={section.title}>
              <button
                onClick={() => onSelectSection(index)}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors duration-200 ${
                  currentSectionIndex === index
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {section.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
