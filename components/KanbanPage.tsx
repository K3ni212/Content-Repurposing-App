
import React, { useState, useMemo } from 'react';
import { Project, ContentPiece, ContentStatus } from '../types';
import { KanbanColumn } from './KanbanColumn';
import { UniversalEditor } from './UniversalEditor';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { brainstormContentIdeas, summarizeSourceText } from '../services/geminiService';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { SwitchVerticalIcon } from './icons/SwitchVerticalIcon';
import { TemplateIcon } from './icons/TemplateIcon'; // Using as 'Editor' icon proxy
import { BriefcaseIcon } from './icons/BriefcaseIcon'; // Using as 'Board' icon proxy

interface KanbanPageProps {
    project: Project;
    onBack: () => void;
    onDrop: (contentId: string, targetStatus: ContentStatus) => void;
    onCardClick: (content: ContentPiece) => void;
    onUpdateProject: (updates: Partial<Project>) => void;
}

export const KanbanPage: React.FC<KanbanPageProps> = ({ project, onBack, onDrop, onCardClick, onUpdateProject }) => {
    const [viewMode, setViewMode] = useState<'board' | 'editor'>('board');
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
        } finally {
            setIsSummaryLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full animate-fade-in bg-[#FAFAFA] dark:bg-[#0B0C15]">
             <div className="px-6 pt-6 pb-4 md:px-10 md:pt-10">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{project.name}</h1>
                    </div>
                    
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                        <button 
                            onClick={() => setViewMode('board')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${viewMode === 'board' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                        >
                            <BriefcaseIcon className="w-4 h-4"/> Board
                        </button>
                        <button 
                            onClick={() => setViewMode('editor')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${viewMode === 'editor' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                        >
                            <TemplateIcon className="w-4 h-4"/> Editor
                        </button>
                    </div>
                </div>

                {viewMode === 'board' && (
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            {project.contentPieces.length} assets in pipeline
                        </p>
                        <div className="flex items-center gap-3">
                             <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
                                <label htmlFor="sort-by" className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sort:</label>
                                <select 
                                    id="sort-by"
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value as any)}
                                    className="bg-transparent text-sm font-medium text-gray-900 dark:text-white focus:outline-none cursor-pointer"
                                >
                                    <option value="createdAt">Date</option>
                                    <option value="title">Title</option>
                                    <option value="format">Format</option>
                                </select>
                                <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200">
                                    {sortOrder === 'desc' ? <ArrowDownIcon className="w-4 h-4" /> : <ArrowUpIcon className="w-4 h-4" />}
                                </button>
                            </div>
                            <button
                                onClick={handleBrainstormClick}
                                disabled={isBrainstorming}
                                className="flex items-center gap-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 font-semibold py-1.5 px-4 rounded-lg transition-colors text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800"
                            >
                                <LightbulbIcon className="w-4 h-4" />
                                <span>Brainstorm</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {viewMode === 'editor' ? (
                <UniversalEditor 
                    project={project}
                    onUpdateProject={onUpdateProject}
                    onUpdateContent={(updatedContent) => {
                         // Handled via modal for now
                    }}
                    onCardClick={onCardClick}
                    showToast={(msg, type) => console.log(msg, type)} 
                />
            ) : (
                <div className="flex-1 flex flex-col px-6 md:px-10 pb-6 overflow-hidden">
                    {/* Minimal Summary Card */}
                    <div className="mb-6 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex-shrink-0 transition-all hover:shadow-md">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                    <ClipboardListIcon className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Source Summary</h3>
                            </div>
                            {!project.summary && !isSummaryLoading && (
                                <button 
                                    onClick={handleGenerateSummary} 
                                    className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg font-medium transition-colors"
                                >
                                    Generate AI Summary
                                </button>
                            )}
                        </div>
                        <div className="pl-11">
                            {project.summary ? (
                                <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                    <MarkdownRenderer content={project.summary} />
                                </div>
                            ) : isSummaryLoading ? (
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                                    <SpinnerIcon className="w-4 h-4 mr-2" />
                                    Analyzing source text...
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">Click generate to get a quick overview of your source text.</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex flex-1 gap-6 overflow-x-auto pb-4">
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
                </div>
            )}
            
            {showBrainstormModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowBrainstormModal(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-2xl w-full transform transition-all animate-scale-in border border-gray-100 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Creative Spark</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fresh angles based on your source material.</p>
                            </div>
                            <button type="button" onClick={() => setShowBrainstormModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                <span className="sr-only">Close</span>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {isBrainstorming && (
                                <div className="flex flex-col items-center justify-center text-center py-12">
                                    <div className="relative w-16 h-16 mb-4">
                                        <div className="absolute inset-0 border-4 border-gray-100 dark:border-gray-700 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-t-yellow-400 rounded-full animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center text-xl">💡</div>
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">Thinking of brilliant ideas...</p>
                                </div>
                            )}
                            {brainstormIdeas && (
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                     <MarkdownRenderer content={brainstormIdeas} />
                                </div>
                            )}
                        </div>

                         <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <button onClick={() => setShowBrainstormModal(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700">
                                Close
                            </button>
                            <button onClick={handleBrainstormClick} disabled={isBrainstorming} className="flex items-center gap-2 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold py-2.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50">
                                {isBrainstorming ? <SpinnerIcon className="w-4 h-4" /> : 'Regenerate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
