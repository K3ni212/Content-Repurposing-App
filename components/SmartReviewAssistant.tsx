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
        className={`px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            selected
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-blue-500'
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
            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-gray-900/50">
                 <SparklesIcon className="w-16 h-16 text-blue-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Ready to review your content?</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
                    The assistant will analyze your draft against approved posts to match your brand's voice and suggest improvements.
                </p>
                <div className="my-6">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Optionally, select a tone to guide the revision:</label>
                    <div className="flex flex-wrap gap-3 justify-center mt-3">
                        <ToneButton tone="Formal" selected={selectedTone === 'Formal'} onClick={() => setSelectedTone(t => t === 'Formal' ? undefined : 'Formal')} disabled={isLoading} />
                        <ToneButton tone="Conversational" selected={selectedTone === 'Conversational'} onClick={() => setSelectedTone(t => t === 'Conversational' ? undefined : 'Conversational')} disabled={isLoading} />
                        <ToneButton tone="Bold" selected={selectedTone === 'Bold'} onClick={() => setSelectedTone(t => t === 'Bold' ? undefined : 'Bold')} disabled={isLoading} />
                        <ToneButton tone="Empathetic" selected={selectedTone === 'Empathetic'} onClick={() => setSelectedTone(t => t === 'Empathetic' ? undefined : 'Empathetic')} disabled={isLoading} />
                    </div>
                </div>
                <button
                    onClick={handleStartReview}
                    className="flex items-center gap-2 px-6 py-3 text-base font-bold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-transform hover:scale-105"
                >
                    <SparklesIcon className="w-5 h-5" />
                    Start Review
                </button>
            </div>
        );
    }
    
    if (isLoading) {
        return (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-gray-50 dark:bg-gray-900/50">
                <SpinnerIcon className="w-12 h-12 text-blue-600" />
                <p className="text-gray-500 dark:text-gray-400 mt-4 animate-pulse">Analyzing content...</p>
            </div>
        );
    }

    if (reviewResult) {
        return (
            <div className="flex-grow flex flex-col">
              <div className="flex-grow p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Feedback Summary</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 mb-4">{reviewResult.feedbackSummary}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                          <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Original</h4>
                          <div className="text-sm h-48 overflow-y-auto p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 whitespace-pre-wrap font-sans">
                              {originalContent}
                          </div>
                      </div>
                       <div>
                          <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Revised</h4>
                          <div className="text-sm h-48 overflow-y-auto p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 whitespace-pre-wrap font-sans">
                              {reviewResult.revisedContent}
                          </div>
                      </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">Detailed Changes</h3>
                  <div className="space-y-3">
                      {reviewResult.changes.map((change, index) => (
                          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                             <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-2">Reason</p>
                             <p className="text-sm italic text-gray-600 dark:text-gray-300 mb-3">"{change.reason}"</p>
                              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                                  <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-2 rounded-lg line-through">{change.originalSnippet}</p>
                                  <ArrowRightIcon className="w-5 h-5 text-gray-400" />
                                  <p className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded-lg">{change.revisedSnippet}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900/50 flex justify-end gap-4">
                   <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200">
                      Discard
                  </button>
                  <button onClick={handleAccept} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2">
                      <CheckIcon className="w-5 h-5" /> Accept & Save
                  </button>
              </div>
            </div>
        )
    }

    return null;
};
