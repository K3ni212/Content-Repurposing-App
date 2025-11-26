
import React, { useState, useEffect } from 'react';
import { Project, ContentPiece } from '../types';
import { ContentCard } from './ContentCard';
import { performTextAction } from '../services/geminiService';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface UniversalEditorProps {
    project: Project;
    onUpdateProject: (updates: Partial<Project>) => void;
    onUpdateContent: (updatedContent: ContentPiece) => void;
    onCardClick: (content: ContentPiece) => void;
    showToast: (message: string, type: 'success' | 'error') => void;
}

export const UniversalEditor: React.FC<UniversalEditorProps> = ({ project, onUpdateProject, onUpdateContent, onCardClick, showToast }) => {
    const [sourceText, setSourceText] = useState(project.sourceText);
    const [isSavingSource, setIsSavingSource] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        setSourceText(project.sourceText);
    }, [project.sourceText]);

    const handleSaveSource = () => {
        setIsSavingSource(true);
        setTimeout(() => {
            onUpdateProject({ sourceText });
            setIsSavingSource(false);
            showToast('Source text updated.', 'success');
        }, 800);
    };

    const handleSourceAction = async (action: 'shorten' | 'expand' | 'rephrase' | 'fix_clarity') => {
        setIsActionLoading(true);
        try {
            let prompt = '';
            if (action === 'fix_clarity') prompt = `Rewrite the following text to improve clarity and readability: "${sourceText}"`;
            else prompt = action; // 'shorten', 'expand', 'rephrase' are handled by performTextAction or similar
            
            const newText = await performTextAction(action as any, sourceText);
            setSourceText(newText);
            showToast('Source text updated by AI.', 'success');
        } catch (error) {
            showToast('Failed to process text.', 'error');
        } finally {
            setIsActionLoading(false);
        }
    };

    return (
        <div className="flex h-full gap-6 p-6 animate-fade-in">
            {/* Left Pane: Input / Source */}
            <div className="w-1/2 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors duration-300">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">Source Input</h3>
                    <div className="flex gap-2">
                         <button onClick={() => handleSourceAction('shorten')} disabled={isActionLoading} className="text-xs px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-indigo-300 transition-all active:scale-95">Shorten</button>
                         <button onClick={() => handleSourceAction('expand')} disabled={isActionLoading} className="text-xs px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-indigo-300 transition-all active:scale-95">Expand</button>
                         <button onClick={() => handleSourceAction('fix_clarity')} disabled={isActionLoading} className="text-xs px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-indigo-300 transition-all active:scale-95">Fix Clarity</button>
                    </div>
                </div>
                <div className="flex-1 relative group">
                    <textarea 
                        value={sourceText}
                        onChange={(e) => setSourceText(e.target.value)}
                        className="w-full h-full p-4 resize-none focus:outline-none bg-transparent dark:text-gray-200 font-mono text-sm transition-colors duration-200 group-hover:bg-gray-50/50 dark:group-hover:bg-gray-800/50 focus:bg-white dark:focus:bg-gray-800"
                    />
                    {isActionLoading && (
                        <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center backdrop-blur-sm transition-opacity">
                            <SpinnerIcon className="w-8 h-8 text-blue-600"/>
                        </div>
                    )}
                </div>
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button 
                        onClick={handleSaveSource}
                        disabled={isSavingSource || sourceText === project.sourceText}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-md disabled:opacity-50 transition-all active:scale-95 shadow-md hover:shadow-lg"
                    >
                        {isSavingSource ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Right Pane: Output Cards */}
            <div className="w-1/2 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-xl text-gray-800 dark:text-white">Generated Assets ({project.contentPieces.length})</h3>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                    {project.contentPieces.map(content => (
                        <ContentCard 
                            key={content.id} 
                            content={content} 
                            onClick={() => onCardClick(content)} 
                        />
                    ))}
                    {project.contentPieces.length === 0 && (
                        <div className="text-center py-10 text-gray-400">
                            No content generated yet. Use a template or workflow to start.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};