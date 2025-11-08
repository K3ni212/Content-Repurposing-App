import React from 'react';

export const GeneratingLoader: React.FC = () => (
    <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
        <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Repurposing in progress...</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
            Almost done cooking your drafts 🍳
        </p>
    </div>
);