import React from 'react';
import { HistoryIcon } from './icons/HistoryIcon';

export const HistoryPage: React.FC = () => {
    return (
        <div className="p-4 md:p-8 animate-fade-in h-full flex flex-col items-center justify-center text-center">
            <HistoryIcon className="w-16 h-16 text-gray-400 mb-4"/>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Project & Chat History</h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
                A comprehensive log of all your generated content and AI conversations will be available here soon.
            </p>
        </div>
    );
};