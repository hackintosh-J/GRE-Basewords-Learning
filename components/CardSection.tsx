
import React from 'react';

interface CardSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const CardSection: React.FC<CardSectionProps> = ({ title, icon, children }) => {
  return (
    <div className="mt-4">
      <h4 className="text-md font-semibold text-slate-700 dark:text-slate-300 flex items-center mb-2">
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </h4>
      <div className="text-slate-600 dark:text-slate-400 text-sm space-y-2">
        {children}
      </div>
    </div>
  );
};

export default CardSection;
