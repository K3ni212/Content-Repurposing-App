import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

export const CustomizingLoader: React.FC = () => (
    <div className="fixed inset-0 z-[60] bg-white dark:bg-gray-900 flex flex-col items-center justify-center text-center p-8 animate-fade-in">
        <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                 <SparklesIcon className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Customizing your dashboard...</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-4">
            Setting up your tools and workspace based on your preferences.
        </p>
    </div>
);