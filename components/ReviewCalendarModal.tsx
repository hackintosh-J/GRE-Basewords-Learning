import React, { useState, useMemo, useEffect } from 'react';
import { EnrichedVocabulary } from '../types';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';

interface ReviewCalendarModalProps {
  vocabularyMap: Map<string, EnrichedVocabulary>;
  onClose: () => void;
}

const ReviewCalendarModal: React.FC<ReviewCalendarModalProps> = ({ vocabularyMap, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const reviewsByDate = useMemo(() => {
    const map = new Map<string, string[]>();
    vocabularyMap.forEach(word => {
      if (word.nextReview) {
        const date = word.nextReview;
        if (!map.has(date)) {
          map.set(date, []);
        }
        map.get(date)!.push(word.word);
      }
    });
    return map;
  }, [vocabularyMap]);

  const changeMonth = (amount: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + amount);
      return newDate;
    });
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date().toISOString().split('T')[0];

    const blanks = Array.from({ length: firstDay }, (_, i) => <div key={`blank-${i}`} className="p-2 border border-transparent"></div>);
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const reviewCount = reviewsByDate.get(dateStr)?.length || 0;
      const isToday = dateStr === today;
      const isSelected = dateStr === selectedDate;
      
      return (
        <div key={day} onClick={() => reviewCount > 0 && setSelectedDate(dateStr)}
             className={`p-2 border rounded-md text-center transition-colors ${reviewCount > 0 ? 'cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600' : 'text-slate-400 dark:text-slate-500'} 
             ${isToday ? 'border-blue-500' : 'border-slate-200 dark:border-slate-700'} ${isSelected ? 'bg-blue-200 dark:bg-blue-800' : 'bg-white dark:bg-slate-800'}`}>
          <div className={`font-bold ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>{day}</div>
          {reviewCount > 0 && <div className="text-xs font-mono mt-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full px-1">{reviewCount}</div>}
        </div>
      );
    });

    return [...blanks, ...days];
  };
  
  const selectedWords = useMemo(() => {
      if (!selectedDate) return [];
      return reviewsByDate.get(selectedDate) || [];
  }, [selectedDate, reviewsByDate])

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-50 dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-lg shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-t-lg">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Review Forecast</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <XMarkIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
          </button>
        </header>
        <main className="flex-grow p-4 flex flex-col md:flex-row gap-4 overflow-hidden">
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><ChevronLeftIcon className="w-6 h-6"/></button>
                    <h3 className="text-lg font-semibold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><ChevronRightIcon className="w-6 h-6"/></button>
                </div>
                <div className="grid grid-cols-7 gap-2 text-xs text-center font-bold text-slate-500">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>
                <div className="grid grid-cols-7 gap-2 mt-2 flex-grow">
                    {renderCalendar()}
                </div>
            </div>
             <aside className="w-full md:w-64 bg-white dark:bg-slate-800 p-4 rounded-lg flex flex-col">
                <h4 className="font-bold border-b border-slate-200 dark:border-slate-700 pb-2 mb-2 flex-shrink-0">
                    {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "Select a day"}
                </h4>
                {selectedDate ? (
                    <ul className="overflow-y-auto space-y-1 flex-grow min-h-0">
                       {selectedWords.map(word => (
                           <li key={word} className="text-sm p-2 rounded bg-slate-100 dark:bg-slate-700">{word}</li>
                       ))}
                    </ul>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-sm text-slate-500">Click on a day with reviews to see the words.</div>
                )}
            </aside>
        </main>
      </div>
    </div>
  );
};

export default ReviewCalendarModal;