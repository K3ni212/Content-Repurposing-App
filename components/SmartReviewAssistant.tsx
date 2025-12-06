
import React, { useState } from 'react';
import { Project, ContentStatus, SmartReviewResult } from '../types';
import { runSmartReview } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

interface SmartReviewAssistantProps {
    originalContent: string;
    projects: Project[];
    onAccept: (newContent: string) => void;
    onClose: () => void;
    showToast: (message: string, type: 'success' | 'error') => void;
}

const ToneButton: React.FC<{ tone: string; selected: boolean; onClick: () => void, disabled: boolean }> = ({ tone, selected, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            selected
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
    >
        {tone}
    </button>
);


export const SmartReviewAssistant: React.FC<SmartReviewAssistantProps> = ({ originalContent, projects, onAccept, onClose, showToast }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [reviewResult, setReviewResult] = useState<SmartReviewResult | null>(null);
    const [selectedTone, setSelectedTone] = useState<string | undefined>(undefined);

    const handleStartReview = async () => {
        setIsLoading(true);
        setReviewResult(null);

        const approvedExamples = projects
            .flatMap(p => p.contentPieces)
            .filter(cp => cp.status === ContentStatus.Approved)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
            .map(cp => cp.content);

        if (approvedExamples.length < 3) {
            showToast(`Using general best practices as fewer than 3 approved examples were found.`, 'success');
        }

        try {
            const result = await runSmartReview(originalContent, approvedExamples, selectedTone);
            setReviewResult(result);
        } catch (error) {
            console.error("Smart Review failed:", error);
            showToast('Failed to run Smart Review. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAccept = () => {
        if (reviewResult) {
            onAccept(reviewResult.revisedContent);
            onClose(); // Close the review pane after accepting
        }
    };
    
    if (!reviewResult && !isLoading) {
        return (
            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-[#0B0C15]">
                 <div className="p-6 bg-indigo-500/10 rounded-full mb-6 animate-pulse">
                    <SparklesIcon className="w-16 h-16 text-indigo-500" />
                 </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Smart Review Assistant</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-md text-base">
                    I will analyze your draft against your approved content history to match your brand's voice, tone, and style perfectly.
                </p>
                
                <div className="my-10 w-full max-w-lg">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 block">Target Tone (Optional)</label>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <ToneButton tone="Formal" selected={selectedTone === 'Formal'} onClick={() => setSelectedTone(t => t === 'Formal' ? undefined : 'Formal')} disabled={isLoading} />
                        <ToneButton tone="Conversational" selected={selectedTone === 'Conversational'} onClick={() => setSelectedTone(t => t === 'Conversational' ? undefined : 'Conversational')} disabled={isLoading} />
                        <ToneButton tone="Bold" selected={selectedTone === 'Bold'} onClick={() => setSelectedTone(t => t === 'Bold' ? undefined : 'Bold')} disabled={isLoading} />
                        <ToneButton tone="Empathetic" selected={selectedTone === 'Empathetic'} onClick={() => setSelectedTone(t => t === 'Empathetic' ? undefined : 'Empathetic')} disabled={isLoading} />
                    </div>
                </div>
                
                <button
                    onClick={handleStartReview}
                    className="flex items-center gap-3 px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl shadow-xl shadow-indigo-500/30 hover:scale-105 transition-all active:scale-95"
                >
                    <SparklesIcon className="w-6 h-6" />
                    Start Analysis
                </button>
            </div>
        );
    }
    
    if (isLoading) {
        return (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-gray-50 dark:bg-[#0B0C15]">
                <SpinnerIcon className="w-16 h-16 text-indigo-600 mb-6" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Analyzing Content</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 animate-pulse">Comparing against brand guidelines...</p>
            </div>
        );
    }

    if (reviewResult) {
        return (
            <div className="flex-grow flex flex-col overflow-hidden bg-white dark:bg-[#0B0C15]">
                <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-8">
                    
                    {/* Feedback Summary */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Feedback Summary</h3>
                        <div className="bg-gray-100 dark:bg-[#151725] border border-gray-200 dark:border-gray-800 rounded-xl p-5 text-gray-700 dark:text-gray-300 leading-relaxed text-sm shadow-sm">
                            {reviewResult.feedbackSummary}
                        </div>
                    </div>

                    {/* Comparison */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <h4 className="font-bold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">Original</h4>
                            <div className="flex-grow p-5 rounded-xl bg-gray-50 dark:bg-[#151725] border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-sm whitespace-pre-wrap font-mono leading-relaxed opacity-80">
                                {originalContent}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                                Revised <SparklesIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                            </h4>
                            <div className="flex-grow p-5 rounded-xl bg-indigo-50/50 dark:bg-[#151725] border border-indigo-200 dark:border-indigo-500/30 ring-1 ring-indigo-500/10 dark:ring-indigo-500/20 text-gray-900 dark:text-gray-200 text-sm whitespace-pre-wrap font-mono leading-relaxed shadow-sm dark:shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                                {reviewResult.revisedContent}
                            </div>
                        </div>
                    </div>

                    {/* Detailed Changes */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Detailed Changes</h3>
                        <div className="space-y-4">
                            {reviewResult.changes.map((change, index) => (
                                <div key={index} className="bg-white dark:bg-[#151725] border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
                                    <div className="mb-4">
                                        <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase block mb-1">REASON</span>
                                        <p className="text-gray-600 dark:text-gray-300 italic text-sm border-l-2 border-indigo-500/50 pl-3">
                                            "{change.reason}"
                                        </p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-gray-50 dark:bg-black/20 p-4 rounded-lg border border-gray-200 dark:border-white/5">
                                        <div className="flex-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300/80 p-3 rounded border border-red-200 dark:border-red-500/10 text-xs font-mono line-through leading-relaxed">
                                            {change.originalSnippet}
                                        </div>
                                        <ArrowRightIcon className="text-gray-400 dark:text-gray-600 w-5 h-5 flex-shrink-0 transform rotate-90 sm:rotate-0" />
                                        <div className="flex-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 p-3 rounded border border-emerald-200 dark:border-emerald-500/10 text-xs font-mono font-medium leading-relaxed">
                                            {change.revisedSnippet}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#151725] flex justify-end gap-4 flex-shrink-0 z-10">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-2.5 text-sm font-bold rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 transition-colors shadow-sm"
                    >
                        Discard
                    </button>
                    <button 
                        onClick={handleAccept} 
                        className="px-6 py-2.5 text-sm font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02]"
                    >
                        <CheckIcon className="w-5 h-5" /> Accept & Apply
                    </button>
                </div>
            </div>
        )
    }

    return null;
};
