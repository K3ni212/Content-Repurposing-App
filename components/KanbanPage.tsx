import React, { useState, useMemo } from 'react';
import { Project, ContentPiece, ContentStatus } from '../types';
import { KanbanColumn } from './KanbanColumn';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { brainstormContentIdeas, summarizeSourceText } from '../services/geminiService';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { SwitchVerticalIcon } from './icons/SwitchVerticalIcon';


interface KanbanPageProps {
    project: Project;
    onBack: () => void;
    onDrop: (contentId: string, targetStatus: ContentStatus) => void;
    onCardClick: (content: ContentPiece) => void;
    onUpdateProject: (updates: Partial<Project>) => void;
}

export const KanbanPage: React.FC<KanbanPageProps> = ({ project, onBack, onDrop, onCardClick, onUpdateProject }) => {
    const [sortBy, setSortBy] = useState<'createdAt' | 'title' | 'format'>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    
    const [isBrainstorming, setIsBrainstorming] = useState(false);
    const [brainstormIdeas, setBrainstormIdeas] = useState<string | null>(null);
    const [showBrainstormModal, setShowBrainstormModal] = useState(false);
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);

    const sortedContentPieces = useMemo(() => {
        return [...project.contentPieces].sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'title' || sortBy === 'format') {
                comparison = a[sortBy].localeCompare(b[sortBy]);
            } else if (sortBy === 'createdAt') {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                comparison = dateA - dateB;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [project.contentPieces, sortBy, sortOrder]);

    const columns = Object.values(ContentStatus).map(status => ({
        status,
        contentPieces: sortedContentPieces.filter(cp => cp.status === status),
    }));

    const handleBrainstormClick = async () => {
        setShowBrainstormModal(true);
        setIsBrainstorming(true);
        setBrainstormIdeas(null);
        try {
            const ideas = await brainstormContentIdeas(project.sourceText, project.brandVoice);
            setBrainstormIdeas(ideas);
        } catch (error) {
            console.error(error);
            setBrainstormIdeas("Sorry, I couldn't come up with ideas right now. Please try again.");
        } finally {
            setIsBrainstorming(false);
        }
    };

    const handleGenerateSummary = async () => {
        if (project.summary || isSummaryLoading) return;
        setIsSummaryLoading(true);
        try {
            const summary = await summarizeSourceText(project.sourceText);
            onUpdateProject({ summary });
        } catch (error) {
            console.error("Failed to generate summary", error);
            // In a real app, might want to show a toast here.
        } finally {
            setIsSummaryLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 animate-fade-in h-full flex flex-col">
            <div className="mb-4">
                <button onClick={onBack} className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    <ChevronLeftIcon className="w-4 h-4 mr-1" />
                    Back to all projects
                </button>
            </div>
            <div className="flex flex-wrap justify-between items-start gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{project.name}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Drag and drop cards to change their status, or click a card to edit.</p>
                </div>
                 <div className="flex items-center justify-end gap-2 flex-shrink-0">
                    <button
                        onClick={handleBrainstormClick}
                        disabled={isBrainstorming}
                        className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-2 px-4 rounded-md transition-colors text-sm disabled:opacity-70"
                    >
                        <LightbulbIcon className="w-5 h-5" />
                        <span>Brainstorm Ideas</span>
                    </button>
                    <label htmlFor="sort-by" className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</label>
                    <select 
                        id="sort-by"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as any)}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-blue-600 focus:border-blue-600 text-sm"
                    >
                        <option value="createdAt">Date Created</option>
                        <option value="title">Title</option>
                        <option value="format">Format</option>
                    </select>
                    <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                        {sortOrder === 'desc' ? <ArrowDownIcon className="w-5 h-5" /> : <ArrowUpIcon className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <ClipboardListIcon className="w-6 h-6 text-gray-500 dark:text-gray-400 mr-3" />
                        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Key Points Summary</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {!project.summary && !isSummaryLoading && (
                            <button 
                                onClick={handleGenerateSummary} 
                                className="text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900 px-3 py-1 rounded-md font-semibold"
                            >
                                Generate
                            </button>
                        )}
                        <button className="cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Drag to reorder">
                            <SwitchVerticalIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="mt-3 pl-9">
                    {project.summary ? (
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            <MarkdownRenderer content={project.summary} />
                        </div>
                    ) : isSummaryLoading ? (
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <SpinnerIcon className="w-5 h-5 mr-2" />
                            <span>Generating summary...</span>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Generate a quick bulleted summary of the source text to get an overview.</p>
                    )}
                </div>
            </div>
            
            <div className="flex flex-1 flex-col md:flex-row gap-4 overflow-x-auto pt-4 pb-4">
                {columns.map(({ status, contentPieces }) => (
                    <KanbanColumn
                        key={status}
                        status={status}
                        contentPieces={contentPieces}
                        onDrop={onDrop}
                        onCardClick={onCardClick}
                    />
                ))}
            </div>
            
            {showBrainstormModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={() => setShowBrainstormModal(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-2xl w-full transform transition-all animate-fade-in" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Content Ideas</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Here are a few ideas based on your project's source content.</p>
                            </div>
                            <button type="button" onClick={() => setShowBrainstormModal(false)} className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-3xl leading-none">&times;</button>
                        </div>
                        
                        <div className="max-h-[60vh] overflow-y-auto pr-4">
                            {isBrainstorming && (
                                <div className="flex flex-col items-center justify-center text-center p-8">
                                    <SpinnerIcon className="w-12 h-12 text-blue-600" />
                                    <p className="text-gray-500 dark:text-gray-400 mt-4">Brainstorming...</p>
                                </div>
                            )}
                            {brainstormIdeas && (
                                <div className="space-y-2">
                                     <MarkdownRenderer content={brainstormIdeas} />
                                </div>
                            )}
                        </div>

                         <div className="mt-6 flex justify-end gap-4">
                            <button onClick={() => setShowBrainstormModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600">
                                Close
                            </button>
                            <button onClick={handleBrainstormClick} disabled={isBrainstorming} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50">
                                {isBrainstorming ? <SpinnerIcon className="w-5 h-5" /> : 'Regenerate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};