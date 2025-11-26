
import React from 'react';
import { MenuIcon } from './icons/MenuIcon';
import { Project, Workflow } from '../types';
import { SearchBar } from './SearchBar';

interface HeaderProps {
    onToggleSidebar: () => void;
    currentProjectName?: string;
    projects: Project[];
    workflows: Workflow[];
    onNavigate: (view: string, id?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, currentProjectName, projects, workflows, onNavigate }) => {
    return (
        <header className="sticky top-0 z-30 w-full bg-white/70 dark:bg-[#0B0C15]/70 backdrop-blur-md border-b border-gray-100/50 dark:border-gray-800/50 transition-all duration-300">
            <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 min-w-0">
                    {/* Mobile menu button */}
                    <button
                        onClick={onToggleSidebar}
                        className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <span className="sr-only">Open sidebar</span>
                        <MenuIcon className="w-6 h-6" />
                    </button>
                    
                    {/* Project Name (or placeholder) */}
                    <div className="hidden lg:block flex-1 min-w-0 animate-fade-in">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate tracking-tight">
                            {currentProjectName || 'Dashboard'}
                        </h2>
                    </div>
                </div>

                <div className="flex-1 flex justify-center px-6 max-w-2xl">
                    <SearchBar projects={projects} workflows={workflows} onNavigate={onNavigate} />
                </div>

                {/* Empty div for balance, or future user avatar */}
                <div className="hidden lg:block w-40 flex-shrink-0" />
            </div>
        </header>
    );
};