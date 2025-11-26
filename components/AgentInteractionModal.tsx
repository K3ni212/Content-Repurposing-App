
import React, { useState } from 'react';
import { Agent, BrandIntelligence } from '../types';
import { runAgentTask } from '../services/agentService';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { MarkdownRenderer } from './MarkdownRenderer';
import { XCloseIcon } from './icons/XCloseIcon';
import { CopyIcon } from './icons/CopyIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface AgentInteractionModalProps {
    agent: Agent;
    onClose: () => void;
    brandIntelligence: BrandIntelligence;
    showToast: (msg: string, type: 'success' | 'error') => void;
}

export const AgentInteractionModal: React.FC<AgentInteractionModalProps> = ({ agent, onClose, brandIntelligence, showToast }) => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedVoiceDescriptors, setSelectedVoiceDescriptors] = useState<string[]>([]);

    const handleRun = async () => {
        if (!input.trim()) return;
        setIsLoading(true);
        
        // Create a context object that prioritizes selected descriptors
        const context = {
            brandIntelligence: {
                ...brandIntelligence,
                // If user selected descriptors, prioritize them by putting them at the start or exclusively using them
                // depending on how the agent service uses this. For now, let's assume the service uses the whole array.
                // We'll prepend selected ones to emphasize them.
                voiceDescriptors: [
                    ...selectedVoiceDescriptors, 
                    ...(brandIntelligence.voiceDescriptors || []).filter(d => !selectedVoiceDescriptors.includes(d))
                ]
            }
        };

        try {
            const result = await runAgentTask(agent.id, input, context);
            setOutput(result);
        } catch (error) {
            showToast('Agent encountered an error.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        showToast('Copied to clipboard', 'success');
    };

    const toggleDescriptor = (descriptor: string) => {
        setSelectedVoiceDescriptors(prev => 
            prev.includes(descriptor) 
                ? prev.filter(d => d !== descriptor) 
                : [...prev, descriptor]
        );
    };

    const Icon = agent.icon;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${agent.color} text-white shadow-sm`}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{agent.name}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Role: {agent.role}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500">
                        <XCloseIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Input Side */}
                    <div className="w-full md:w-1/2 p-6 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800">
                        <div className="flex-1 flex flex-col">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Input Content / Instructions
                            </label>
                            <textarea 
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Paste your content here for the agent to analyze or process..."
                                className="flex-1 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Brand Voice Selection */}
                        {brandIntelligence.voiceDescriptors && brandIntelligence.voiceDescriptors.length > 0 && (
                            <div className="mt-4">
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <SparklesIcon className="w-3 h-3"/> Apply Brand Voice
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {brandIntelligence.voiceDescriptors.map((desc) => (
                                        <button
                                            key={desc}
                                            onClick={() => toggleDescriptor(desc)}
                                            className={`text-xs px-2 py-1 rounded-full border transition-all ${
                                                selectedVoiceDescriptors.includes(desc)
                                                    ? 'bg-indigo-100 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                                                    : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 hover:border-indigo-300'
                                            }`}
                                        >
                                            {desc}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-6 flex justify-end">
                            <button 
                                onClick={handleRun}
                                disabled={isLoading || !input.trim()}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-bold transition-all shadow-lg hover:scale-[1.02] active:scale-95 ${isLoading ? 'bg-gray-400' : `${agent.color} hover:brightness-110`}`}
                            >
                                {isLoading ? <SpinnerIcon className="w-5 h-5" /> : 'Run Agent'}
                            </button>
                        </div>
                    </div>

                    {/* Output Side */}
                    <div className="w-full md:w-1/2 p-6 flex flex-col bg-gray-50 dark:bg-gray-900 overflow-y-auto">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Agent Output
                            </label>
                            {output && (
                                <button onClick={handleCopy} className="text-xs flex items-center gap-1 text-blue-600 hover:underline">
                                    <CopyIcon className="w-3 h-3" /> Copy
                                </button>
                            )}
                        </div>
                        
                        <div className="flex-1 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-y-auto shadow-inner">
                            {isLoading ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <SpinnerIcon className="w-8 h-8 mb-2 text-blue-500" />
                                    <p className="text-sm animate-pulse">Agent is working...</p>
                                </div>
                            ) : output ? (
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <MarkdownRenderer content={output} />
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                                    Results will appear here.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
