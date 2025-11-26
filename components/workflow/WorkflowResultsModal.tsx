
import React, { useState } from 'react';
import { WorkflowNode, Project, ContentPiece, ContentStatus, ContentFormat } from '../../types';
import { XCloseIcon } from '../icons/XCloseIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { SpinnerIcon } from '../icons/SpinnerIcon';
import { BriefcaseIcon } from '../icons/BriefcaseIcon';
import { CopyIcon } from '../icons/CopyIcon';
import { DownloadIcon } from '../icons/DownloadIcon';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { ExportIcon } from '../icons/ExportIcon';
import { v4 as uuidv4 } from 'uuid';

interface WorkflowResultsModalProps {
    nodes: WorkflowNode[];
    onClose: () => void;
    onCreateProject?: (project: any) => void;
}

export const WorkflowResultsModal: React.FC<WorkflowResultsModalProps> = ({ nodes, onClose, onCreateProject }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Filter for nodes that have actually run or are running
    const executedNodes = nodes.filter(n => n.executionStatus === 'completed' || n.executionStatus === 'error' || n.executionStatus === 'running');
    
    const handleCopyAll = () => {
        const text = executedNodes
            .filter(n => n.outputData)
            .map(n => {
                const content = typeof n.outputData === 'string' ? n.outputData : JSON.stringify(n.outputData, null, 2);
                return `### ${n.data.label} (${n.type})\n${content}`;
            })
            .join('\n\n---\n\n');
            
        navigator.clipboard.writeText(text);
        setIsMenuOpen(false);
    };

    const handleDownloadPDF = () => {
        // Simple print-to-pdf trigger
        window.print();
        setIsMenuOpen(false);
    };

    const handleSendToProject = () => {
        if (!onCreateProject) return;

        const contentPieces: ContentPiece[] = executedNodes.map(node => {
            let content = '';
            if (typeof node.outputData === 'string') content = node.outputData;
            else if (node.outputData && typeof node.outputData === 'object') {
                if (node.outputData.content) content = node.outputData.content;
                else content = JSON.stringify(node.outputData, null, 2);
            } else {
                return null;
            }

            return {
                id: uuidv4(),
                format: (node.data.format as ContentFormat) || ContentFormat.LinkedIn,
                title: node.data.label,
                content: content,
                status: ContentStatus.Draft,
                createdAt: new Date().toISOString(),
            };
        }).filter((c): c is ContentPiece => c !== null && c.content.length > 0);

        if (contentPieces.length === 0) {
            alert("No valid content outputs to save.");
            return;
        }

        const newProject: Project = {
            id: `proj_${Date.now()}`,
            name: `Workflow Run: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
            sourceText: contentPieces[0]?.content || 'Generated via Workflow',
            brandVoice: 'Custom', // Default
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            contentPieces: contentPieces
        };

        onCreateProject(newProject);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <style>{`
                @media print {
                    body > *:not(.modal-root) { display: none !important; }
                    .modal-root { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: white; }
                    .no-print { display: none !important; }
                }
            `}</style>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-fade-in border border-gray-200 dark:border-gray-800 relative overflow-hidden modal-root" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Execution Results</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Output from {executedNodes.length} steps
                        </p>
                    </div>
                    <div className="flex items-center gap-3 no-print">
                        <div className="relative">
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition-colors"
                            >
                                <ExportIcon className="w-4 h-4"/>
                                Export Results
                                <ChevronDownIcon className="w-4 h-4"/>
                            </button>
                            {isMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-fade-in">
                                    {onCreateProject && (
                                        <button onClick={handleSendToProject} className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left">
                                            <BriefcaseIcon className="w-4 h-4 mr-3"/>
                                            Send to Projects
                                        </button>
                                    )}
                                    <button onClick={handleDownloadPDF} className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left">
                                        <DownloadIcon className="w-4 h-4 mr-3"/>
                                        Download as PDF
                                    </button>
                                    <button onClick={handleCopyAll} className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left border-t border-gray-100 dark:border-gray-700">
                                        <CopyIcon className="w-4 h-4 mr-3"/>
                                        Copy All Text
                                    </button>
                                </div>
                            )}
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                            <XCloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F9FAFB] dark:bg-[#0B0C15]">
                    {executedNodes.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <SpinnerIcon className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">No results yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Run the workflow to see outputs here.</p>
                        </div>
                    ) : (
                        executedNodes.map(node => (
                            <div key={node.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                                <div className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between ${node.executionStatus === 'error' ? 'bg-red-50 dark:bg-red-900/10' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                                    <div className="flex items-center gap-3">
                                        {node.executionStatus === 'completed' ? (
                                            <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-1 rounded-full">
                                                <CheckIcon className="w-4 h-4" />
                                            </div>
                                        ) : node.executionStatus === 'error' ? (
                                            <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-1 rounded-full font-bold w-6 h-6 flex items-center justify-center text-xs">
                                                !
                                            </div>
                                        ) : (
                                            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-1 rounded-full">
                                                <SpinnerIcon className="w-4 h-4" />
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">{node.data.label}</h4>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{node.type}</span>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                                        node.executionStatus === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                        node.executionStatus === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                    }`}>
                                        {node.executionStatus === 'completed' ? 'Success' : node.executionStatus}
                                    </span>
                                </div>
                                
                                <div className="p-4">
                                    {node.outputData ? (
                                        <div className="text-sm text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none">
                                            {typeof node.outputData === 'string' ? (
                                                <div className="max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                                    <MarkdownRenderer content={node.outputData} />
                                                </div>
                                            ) : (
                                                <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto font-mono text-xs whitespace-pre-wrap max-h-60 custom-scrollbar">
                                                    {JSON.stringify(node.outputData, null, 2)}
                                                </pre>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">No output data generated.</p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
                
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex justify-end no-print">
                    <button onClick={onClose} className="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
