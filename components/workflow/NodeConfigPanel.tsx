
import React, { useState, useEffect } from 'react';
import { WorkflowNode, ContentFormat, ALL_FORMATS } from '../../types';
import { XCloseIcon } from '../icons/XCloseIcon';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { UploadIcon } from '../icons/UploadIcon';

interface NodeConfigPanelProps {
    node: WorkflowNode | undefined;
    onClose: () => void;
    onUpdate: (nodeId: string, data: Partial<WorkflowNode['data']>) => void;
}

export const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({ node, onClose, onUpdate }) => {
    const [label, setLabel] = useState('');
    const [trigger, setTrigger] = useState<'manual' | 'automated'>('manual');
    
    // Config fields
    const [url, setUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [rssUrl, setRssUrl] = useState('');
    const [textContent, setTextContent] = useState('');
    const [format, setFormat] = useState<ContentFormat | string>('');
    const [prompt, setPrompt] = useState('');
    const [language, setLanguage] = useState('');
    const [targetStyle, setTargetStyle] = useState('');
    const [summaryType, setSummaryType] = useState<'bullet' | 'paragraph' | 'executive'>('bullet');
    const [platform, setPlatform] = useState('');
    const [subjectLine, setSubjectLine] = useState('');

    useEffect(() => {
        if (node) {
            setLabel(node.data.label);
            setTrigger(node.data.trigger || 'manual');
            setUrl(node.data.url || '');
            setVideoUrl(node.data.videoUrl || '');
            setRssUrl(node.data.rssUrl || '');
            setTextContent(node.data.textContent || '');
            setFormat(node.data.format || '');
            setPrompt(node.data.prompt || '');
            setLanguage(node.data.language || '');
            setTargetStyle(node.data.targetStyle || '');
            setSummaryType(node.data.summaryType || 'bullet');
            setPlatform(node.data.platform || '');
            setSubjectLine(node.data.subjectLine || '');
        }
    }, [node]);
    
    const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLabel(e.target.value);
    };

    const handleBlur = () => {
        if (node && node.data.label !== label) {
            onUpdate(node.id, { label });
        }
    };
    
    const handleDataUpdate = (key: keyof WorkflowNode['data'], value: any) => {
        if(node) {
            onUpdate(node.id, { [key]: value });
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            setTextContent(text);
            handleDataUpdate('textContent', text);
        };
        reader.readAsText(file);
    };

    if (!node) {
        return null;
    }

    const renderSpecificConfigs = () => {
        switch(node.type) {
            case 'URLScraper':
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target URL</label>
                        <input 
                            type="url" 
                            value={url} 
                            onChange={e => setUrl(e.target.value)} 
                            onBlur={() => handleDataUpdate('url', url)}
                            placeholder="https://example.com/blog"
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                );
            case 'YouTubeVimeoImport':
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Video URL</label>
                        <input 
                            type="url" 
                            value={videoUrl} 
                            onChange={e => setVideoUrl(e.target.value)} 
                            onBlur={() => handleDataUpdate('videoUrl', videoUrl)}
                            placeholder="https://youtube.com/watch?v=..."
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                );
            case 'RSSFeed':
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">RSS Feed URL</label>
                        <input 
                            type="url" 
                            value={rssUrl} 
                            onChange={e => setRssUrl(e.target.value)} 
                            onBlur={() => handleDataUpdate('rssUrl', rssUrl)}
                            placeholder="https://example.com/feed.xml"
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                );
            case 'FileUpload':
            case 'FormIntake':
                return (
                     <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select File</label>
                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadIcon className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span></p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">TXT, MD (Text extraction)</p>
                                    </div>
                                    <input id="dropzone-file" type="file" className="hidden" onChange={handleFileUpload} accept=".txt,.md,.json,.csv" />
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Or Enter Text Manually</label>
                            <textarea 
                                value={textContent} 
                                onChange={e => setTextContent(e.target.value)} 
                                onBlur={() => handleDataUpdate('textContent', textContent)}
                                placeholder="Paste text content here..."
                                rows={4}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                );
            case 'AIRepurpose':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Output Format</label>
                            <select 
                                value={format} 
                                onChange={e => { setFormat(e.target.value); handleDataUpdate('format', e.target.value); }}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select Format...</option>
                                {ALL_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Custom Instructions</label>
                             <textarea 
                                value={prompt} 
                                onChange={e => setPrompt(e.target.value)} 
                                onBlur={() => handleDataUpdate('prompt', prompt)}
                                placeholder="E.g., Use a professional tone, focus on the second paragraph..."
                                rows={3}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                );
            case 'Translate':
                 return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Language</label>
                        <select 
                            value={language} 
                            onChange={e => { setLanguage(e.target.value); handleDataUpdate('language', e.target.value); }}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                            <option value="German">German</option>
                            <option value="Portuguese">Portuguese</option>
                            <option value="Chinese">Chinese (Simplified)</option>
                            <option value="Japanese">Japanese</option>
                        </select>
                    </div>
                );
            case 'StyleTransfer':
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Style / Persona</label>
                        <input 
                            type="text" 
                            value={targetStyle} 
                            onChange={e => setTargetStyle(e.target.value)} 
                            onBlur={() => handleDataUpdate('targetStyle', targetStyle)}
                            placeholder="e.g., Hemingway, TechCrunch, Elon Musk"
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                );
            case 'Summarize':
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Summary Type</label>
                        <select 
                            value={summaryType} 
                            onChange={e => { setSummaryType(e.target.value as any); handleDataUpdate('summaryType', e.target.value); }}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="bullet">Bullet Points</option>
                            <option value="paragraph">Single Paragraph</option>
                            <option value="executive">Executive Summary</option>
                        </select>
                    </div>
                );
            case 'SocialMediaPublisher':
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Platform</label>
                        <select 
                            value={platform} 
                            onChange={e => { setPlatform(e.target.value); handleDataUpdate('platform', e.target.value); }}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select Platform...</option>
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="Twitter">Twitter / X</option>
                            <option value="Instagram">Instagram</option>
                            <option value="Facebook">Facebook</option>
                        </select>
                    </div>
                );
            case 'EmailCampaign':
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Subject Line</label>
                        <input 
                            type="text" 
                            value={subjectLine} 
                            onChange={e => setSubjectLine(e.target.value)} 
                            onBlur={() => handleDataUpdate('subjectLine', subjectLine)}
                            placeholder="Enter subject line..."
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                );
            case 'KeywordExtractor':
            case 'CTAGenerator':
            case 'HookGenerator':
                 // No extra config needed usually, just implicit input
                 return <p className="text-xs text-gray-500 italic">This node processes input text automatically using AI.</p>;
            default:
                return null;
        }
    }

    return (
        <aside className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col p-4 transform transition-transform duration-300 ease-in-out h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Configure Node</h3>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <XCloseIcon className="w-5 h-5" />
                </button>
            </div>
            
            <div className="space-y-6">
                <div>
                    <label htmlFor="node-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Node Name</label>
                    <input
                        id="node-label"
                        type="text"
                        value={label}
                        onChange={handleLabelChange}
                        onBlur={handleBlur}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm font-bold focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Trigger Type</label>
                    <div className="flex space-x-1 rounded-lg bg-gray-200 dark:bg-gray-700 p-1 mt-1">
                        <button onClick={() => onUpdate(node.id, { trigger: 'manual'})} className={`w-full rounded-md py-1 text-sm font-medium ${node.data.trigger !== 'automated' ? 'bg-white dark:bg-gray-800 shadow text-blue-600' : 'hover:bg-white/50 dark:hover:bg-black/20'}`}>Manual</button>
                        <button onClick={() => onUpdate(node.id, { trigger: 'automated'})} className={`w-full rounded-md py-1 text-sm font-medium ${node.data.trigger === 'automated' ? 'bg-white dark:bg-gray-800 shadow text-blue-600' : 'hover:bg-white/50 dark:hover:bg-black/20'}`}>Automated</button>
                    </div>
                </div>

                {renderSpecificConfigs()}
                
                 <div>
                    <label htmlFor="node-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <textarea
                        id="node-desc"
                        rows={3}
                        defaultValue={node.data.description || ''}
                        onBlur={(e) => onUpdate(node.id, { description: e.target.value })}
                        placeholder="Add notes or instructions..."
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                
                {/* Result Section */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold mb-2">Execution Output</h4>
                    {node.executionStatus === 'running' ? (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm text-gray-500 animate-pulse">
                            Processing...
                        </div>
                    ) : node.executionStatus === 'error' ? (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600 border border-red-200">
                            {JSON.stringify(node.outputData)}
                        </div>
                    ) : node.outputData ? (
                         <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-lg max-h-60 overflow-y-auto text-xs font-mono">
                            {typeof node.outputData === 'string' ? (
                                <MarkdownRenderer content={node.outputData} />
                            ) : (
                                <pre className="whitespace-pre-wrap">{JSON.stringify(node.outputData, null, 2)}</pre>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 italic">Run the workflow to see results here.</p>
                    )}
                </div>
            </div>
        </aside>
    );
};
