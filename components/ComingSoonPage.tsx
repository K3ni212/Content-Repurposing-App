import React from 'react';

interface ComingSoonPageProps {
    title: string;
    description: string;
    icon: React.ReactNode;
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ title, description, icon }) => {
    return (
        <div className="p-4 md:p-8 animate-fade-in h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 text-gray-400 mb-4">
                {icon}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
                {description}
            </p>
            <p className="text-sm text-blue-500 mt-2 font-semibold">Coming Soon!</p>
        </div>
    );
};
