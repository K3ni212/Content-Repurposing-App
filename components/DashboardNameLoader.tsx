
import React from 'react';

export const DashboardNameLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAFAFA] dark:bg-[#0B0C15] animate-fade-in">
      <div className="text-center flex flex-col items-center">
        <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-glow animate-bounce animate-gradient bg-200%">
                R
            </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-indigo-600 to-gray-900 dark:from-white dark:via-indigo-300 dark:to-white animate-shimmer bg-[length:200%_auto]">
          RepurposeAI
        </h1>
        <div className="mt-8 flex justify-center space-x-2">
            <div className="w-2.5 h-2.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2.5 h-2.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2.5 h-2.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};