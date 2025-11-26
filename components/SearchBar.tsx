
import React, { useState, useEffect, useRef } from 'react';
import { Project, Workflow } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { XCloseIcon } from './icons/XCloseIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { WorkflowIcon } from './icons/WorkflowIcon';

interface SearchBarProps {
    projects: Project[];
    workflows: Workflow[];
    onNavigate: (view: string, id?: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ projects, workflows, onNavigate }) => {
    const [query, setQuery] = useState('');
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [filteredWorkflows, setFilteredWorkflows] = useState<Workflow[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (query.length > 1) {
            const lowerCaseQuery = query.toLowerCase();
            setFilteredProjects(projects.filter(p => p.name.toLowerCase().includes(lowerCaseQuery)));
            setFilteredWorkflows(workflows.filter(w => w.name.toLowerCase().includes(lowerCaseQuery)));
        } else {
            setFilteredProjects([]);
            setFilteredWorkflows([]);
        }
    }, [query, projects, workflows]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleResultClick = (id: string, type: 'project' | 'workflow') => {
        if (type === 'project') {
            onNavigate('kanban', id);
        } else {
            onNavigate('workflow', id);
        }
        setQuery('');
        setIsFocused(false);
    };

    const hasResults = filteredProjects.length > 0 || filteredWorkflows.length > 0;

    return (
        <div className="relative w-full" ref={searchRef}>
            <div className={`relative group transition-all duration-200 ${isFocused ? 'scale-[1.02]' : ''}`}>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <SearchIcon className={`h-4 w-4 transition-colors ${isFocused ? 'text-indigo-500' : 'text-gray-400'}`} />
                </div>
                <input
                    type="text"
                    placeholder="Search projects, workflows..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    className="block w-full rounded-xl border-0 bg-gray-100 dark:bg-gray-800/50 py-3 pl-11 pr-10 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:shadow-lg transition-all duration-200 font-medium"
                />
                {query ? (
                    <button onClick={() => setQuery('')} className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <XCloseIcon className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
                    </button>
                ) : (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <span className="text-xs text-gray-400 font-mono border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5">/</span>
                    </div>
                )}
            </div>
            
            {isFocused && query.length > 1 && (
                <div className="absolute z-50 mt-2 w-full origin-top-right rounded-xl bg-white dark:bg-[#151725] shadow-2xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-none overflow-hidden animate-fade-in max-h-[60vh] overflow-y-auto custom-scrollbar border border-gray-100 dark:border-gray-800">
                    {!hasResults ? (
                        <div className="p-8 text-center">
                            <SearchIcon className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">No results found for "{query}"</p>
                        </div>
                    ) : (
                        <div className="py-2">
                            {filteredProjects.length > 0 && (
                                <div className="mb-2">
                                    <div className="px-4 py-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800/50">
                                        <BriefcaseIcon className="w-3 h-3" /> Projects
                                    </div>
                                    {filteredProjects.map(project => (
                                        <button
                                            key={project.id}
                                            onClick={() => handleResultClick(project.id, 'project')}
                                            className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors group border-b border-gray-50 dark:border-gray-800/30 last:border-0"
                                        >
                                            <div className="p-2.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 mr-3 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform shadow-sm">
                                                <BriefcaseIcon className="h-4 w-4" />
                                            </div>
                                            <div className="text-left flex-1 min-w-0">
                                                <span className="font-semibold group-hover:text-indigo-700 dark:group-hover:text-white block truncate">{project.name}</span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500 truncate block mt-0.5">
                                                    {project.contentPieces?.length || 0} assets • Updated {new Date(project.lastModified).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {filteredWorkflows.length > 0 && (
                                <div>
                                    <div className="px-4 py-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800/50 border-t">
                                        <WorkflowIcon className="w-3 h-3" /> Workflows
                                    </div>
                                    {filteredWorkflows.map(workflow => (
                                        <button
                                            key={workflow.id}
                                            onClick={() => handleResultClick(workflow.id, 'workflow')}
                                            className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors group border-b border-gray-50 dark:border-gray-800/30 last:border-0"
                                        >
                                            <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 mr-3 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform shadow-sm">
                                                <WorkflowIcon className="h-4 w-4" />
                                            </div>
                                            <div className="text-left flex-1 min-w-0">
                                                <span className="font-semibold group-hover:text-emerald-700 dark:group-hover:text-white block truncate">{workflow.name}</span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500 truncate block mt-0.5">
                                                    {workflow.nodes?.length || 0} nodes • Created {new Date(workflow.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
