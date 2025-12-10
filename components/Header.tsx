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
        <header className="sticky top-0 z-30 w-full bg-transparent pointer-events-none">
            {/* Soft fade overlay to ensure readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#F3F4F6]/95 via-[#F3F4F6]/70 to-transparent dark:from-[#05050A]/95 dark:via-[#05050A]/70 dark:to-transparent backdrop-blur-[1px] h-32 pointer-events-none"></div>
            
            <div className="flex items-center justify-between h-24 px-6 md:px-10 relative pointer-events-auto">
                <div className="flex items-center gap-4 min-w-0">
                    <button
                        onClick={onToggleSidebar}
                        className="lg:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                        <span className="sr-only">Open sidebar</span>
                        <MenuIcon className="w-6 h-6" />
                    </button>
                    
                    <div className="hidden lg:block flex-1 min-w-0 animate-fade-in">
                        {currentProjectName && (
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate tracking-tight flex items-center gap-2">
                                <span className="text-gray-400 dark:text-gray-500 font-normal">/</span> {currentProjectName}
                            </h2>
                        )}
                    </div>
                </div>

                <div className="flex-1 flex justify-center px-6 max-w-xl">
                    <SearchBar projects={projects} workflows={workflows} onNavigate={onNavigate} />
                </div>

                <div className="hidden lg:block w-40 flex-shrink-0" />
            </div>
        </header>
    );
};