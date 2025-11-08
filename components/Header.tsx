
import React from 'react';
import { MenuIcon } from './icons/MenuIcon';
import { UserIcon } from './icons/UserIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

interface HeaderProps {
    onToggleSidebar: () => void;
    currentProjectName?: string;
    isDarkMode: boolean;
    toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, currentProjectName, isDarkMode, toggleTheme }) => {
    return (
        <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
                {/* Mobile menu button */}
                <button
                    onClick={onToggleSidebar}
                    className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                    <span className="sr-only">Open sidebar</span>
                    <MenuIcon className="w-6 h-6" />
                </button>
                
                {/* Project Name (or placeholder) */}
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white truncate">
                        {currentProjectName || 'Dashboard'}
                    </h2>
                </div>

                {/* Right side icons */}
                <div className="flex items-center space-x-4">
                    <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                        {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                    </button>
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-gray-500" />
                    </div>
                </div>
            </div>
        </header>
    );
};
