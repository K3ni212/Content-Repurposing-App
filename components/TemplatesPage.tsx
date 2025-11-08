import React from 'react';
import { TemplateIcon } from './icons/TemplateIcon';

export const TemplatesPage: React.FC = () => {
    return (
        <div className="p-4 md:p-8 animate-fade-in h-full flex flex-col items-center justify-center text-center">
            <TemplateIcon className="w-16 h-16 text-gray-400 mb-4"/>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Template Library</h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
                A marketplace for pre-built content strategies and generation templates is coming soon.
            </p>
        </div>
    );
};