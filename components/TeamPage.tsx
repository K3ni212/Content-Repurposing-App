import React from 'react';
import { UsersIcon } from './icons/UsersIcon';

export const TeamPage: React.FC = () => {
    return (
        <div className="p-4 md:p-8 animate-fade-in h-full flex flex-col items-center justify-center text-center">
            <UsersIcon className="w-16 h-16 text-gray-400 mb-4"/>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Team & Collaboration</h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
                Invite your team members, assign roles, and collaborate on content. This feature is coming soon!
            </p>
        </div>
    );
};