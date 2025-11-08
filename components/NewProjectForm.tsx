import React, { useState } from 'react';
import { ContentFormat, ALL_FORMATS, ContentStatus, BrandVoice } from '../types';
import { generateContentPieces, analyzeVideoFrames } from '../services/geminiService';
import { UploadIcon } from './icons/UploadIcon';
import { FileDocIcon } from './icons/FileDocIcon';
import { VideoIcon } from './icons/VideoIcon';
import { LinkIcon } from './icons/LinkIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { InfoIcon } from './icons/InfoIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { XIcon } from './icons/XIcon';
import { EmailIcon } from './icons/EmailIcon';
import { CarouselIcon } from './icons/CarouselIcon';
import { QuoteIcon } from './icons/QuoteIcon';
import { TikTokIcon } from './icons/TikTokIcon';
import { InstagramIcon } from './icons/InstagramIcon';
import { FacebookIcon } from './icons/FacebookIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import { FeatherIcon } from './icons/FeatherIcon';
import { YouTubeIcon } from './icons/YouTubeIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { PlusIcon } from './icons/PlusIcon';
import { AddBrandVoiceModal } from './AddBrandVoiceModal';

interface NewProjectFormProps {
    onClose: () => void;
    onProjectCreated: (newProject: any) => void;
    showToast: (message: string, type: 'success' | 'error') => void;
    brandVoices: BrandVoice[];
    onSaveBrandVoice: (voice: { name: string, description: string }) => void;
}

const formatIcons: Record<string, React.FC<{className?: string}>> = {
  [ContentFormat.LinkedIn]: LinkedInIcon,
  [ContentFormat.XThread]: XIcon,
  [ContentFormat.Email]: EmailIcon,
  [ContentFormat.Carousel]: CarouselIcon,
  [ContentFormat.Quote]: QuoteIcon,
  [ContentFormat.TikTok]: TikTokIcon,
  [ContentFormat.InstagramReels]: InstagramIcon,
  [ContentFormat.InstagramFeed]: InstagramIcon,
  [ContentFormat.Facebook]: FacebookIcon,
  [ContentFormat.Ads]: MegaphoneIcon,
  [ContentFormat.Blog]: FeatherIcon,
  [ContentFormat.YouTubeShort]: YouTubeIcon,
  [ContentFormat.PodcastSnippet]: MicrophoneIcon,
};


export const NewProjectForm: React.FC<NewProjectFormProps> = ({ onClose, onProjectCreated, showToast, brandVoices, onSaveBrandVoice }) => {
    const [projectName, setProjectName] = useState('');
    const [brandVoice, setBrandVoice] = useState('');
    const [sourceText, setSourceText] = useState('');
    const [sourceUrl, setSourceUrl] = useState('');
    const [selectedFormats, setSelectedFormats] = useState<ContentFormat[]>([]);
    const [useSearchGrounding, setUseSearchGrounding] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [fileName, setFileName] = useState('');
    const [sourceType, setSourceType] = useState<'text' | 'document' | 'video' | 'url'>('text');
    const [generationInstructions, setGenerationInstructions] = useState('');
    const [selectedBrandVoiceId, setSelectedBrandVoiceId] = useState('custom');
    const [isAddBrandVoiceModalOpen, setIsAddBrandVoiceModalOpen] = useState(false);

    const handleFormatToggle = (format: ContentFormat) => {
        setSelectedFormats(prev =>
            prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format]
        );
    };
    
    const handleBrandVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedBrandVoiceId(id);
        if (id === 'custom') {
            setBrandVoice('');
        } else {
            const selectedVoice = brandVoices.find(bv => bv.id === id);
            if (selectedVoice) {
                setBrandVoice(selectedVoice.description);
            }
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        
        if (file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target?.result as string;
                setSourceText(text);
                showToast('Text file loaded successfully!', 'success');
            };
            reader.onerror = () => {
                showToast('Failed to read the file.', 'error');
                setFileName('');
            };
            reader.readAsText(file);
        } else if (file.type === 'application/pdf' || file.type.includes('wordprocessingml')) {
             showToast('PDF and DOCX parsing is coming soon. Please upload a .txt file for now.', 'error');
             setFileName('');
        } else {
            showToast('Unsupported file type. Please upload a .txt, .pdf, or .docx file.', 'error');
            setFileName('');
        }
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setIsProcessing(true);
        showToast('Analyzing video, this may take a moment...', 'success');

        try {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.src = URL.createObjectURL(file);
            
            const frames: string[] = [];
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            video.onloadeddata = async () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const duration = video.duration;
                const frameCount = Math.min(duration, 10); // Capture up to 10 frames or 1 per second
                for (let i = 1; i <= frameCount; i++) {
                    video.currentTime = (duration / (frameCount + 1)) * i;
                    await new Promise(resolve => { video.onseeked = resolve; });
                    context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    frames.push(dataUrl.split(',')[1]); // get base64 part
                }
                
                const analysisResult = await analyzeVideoFrames(frames);
                setSourceText(analysisResult);
                showToast('Video analysis complete!', 'success');
                setIsProcessing(false);
            };

            video.onerror = () => { throw new Error("Video file could not be loaded."); };
        } catch (error) {
            console.error('Video processing failed', error);
            showToast('Failed to analyze video.', 'error');
            setFileName('');
            setIsProcessing(false);
        }
    };

    const parseArticleFromHtml = (htmlString: string): string => {
        const doc = new DOMParser().parseFromString(htmlString, 'text/html');
        // Remove script, style, and common non-content elements
        doc.querySelectorAll('script, style, nav, header, footer, aside, [role="navigation"], [role="banner"], [role="contentinfo"]').forEach(el => el.remove());
        
        // Try to find common main content containers
        const articleElement = doc.querySelector('article, main, .main, #main, .post, #content');
        const content = (articleElement || doc.body).textContent || '';
        
        // Clean up whitespace
        return content.replace(/\s\s+/g, ' ').trim();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!projectName.trim() || selectedFormats.length === 0) {
            showToast('Please fill all required fields and select at least one format.', 'error');
            return;
        }

        if (!brandVoice.trim()) {
            showToast('Brand Voice is a required field. Please describe your brand voice or select a saved one.', 'error');
            return;
        }

        setIsProcessing(true);
        let finalSourceText = sourceText;

        if (sourceType === 'url') {
            if (!sourceUrl.trim() || !sourceUrl.startsWith('http')) {
                showToast('Please enter a valid URL.', 'error');
                setIsProcessing(false);
                return;
            }
            try {
                showToast('Fetching content from URL...', 'success');
                // Using a CORS proxy to fetch the content client-side
                const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(sourceUrl)}`);
                if (!response.ok) throw new Error(`Failed to fetch URL, status: ${response.status}`);
                
                const html = await response.text();
                finalSourceText = parseArticleFromHtml(html);

                if (finalSourceText.length < 100) { // Arbitrary threshold for meaningful content
                    throw new Error("Could not extract meaningful content from the URL.");
                }

                setSourceText(finalSourceText);
                showToast('Successfully parsed content from URL!', 'success');
            } catch (error) {
                console.error(error);
                showToast('Failed to get content from URL. Please try another or paste text manually.', 'error');
                setIsProcessing(false);
                return;
            }
        }
        
        if (!finalSourceText.trim()) {
            showToast('Source content is empty. Please provide text, a file, or a valid URL.', 'error');
            setIsProcessing(false);
            return;
        }

        try {
            const { generatedPieces, groundingMetadata } = await generateContentPieces(finalSourceText, brandVoice, selectedFormats, useSearchGrounding, generationInstructions);
            const newProject = {
                id: `proj_${Date.now()}`, name: projectName, sourceText: finalSourceText, brandVoice: brandVoice, createdAt: new Date().toISOString(),
                contentPieces: generatedPieces.map((p: any) => ({ ...p, id: `cp_${Date.now()}_${Math.random()}`, status: ContentStatus.Draft, createdAt: new Date().toISOString() })),
                groundingMetadata
            };
            onProjectCreated(newProject);
        } catch (error) {
            console.error(error);
            showToast('Failed to generate content. Please try again.', 'error');
            setIsProcessing(false);
        }
    };

    const renderSourceInput = () => {
        const fileInputArea = (handler: (e: React.ChangeEvent<HTMLInputElement>) => void, acceptedTypes: string, description: string) => (
             <div className="mt-4">
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadIcon className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span></p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                    </div>
                    <input id="file-upload" type="file" className="hidden" accept={acceptedTypes} onChange={handler} disabled={isProcessing} />
                </label>
                {fileName && <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-300">File: {fileName}</p>}
            </div>
        );

        switch(sourceType) {
            case 'document':
                return fileInputArea(handleFileUpload, '.txt,.pdf,.doc,.docx', 'TXT, PDF, DOCX');
            case 'video':
                return fileInputArea(handleVideoUpload, 'video/*', 'MP4, MOV, WEBM (MAX. 50MB)');
            case 'url':
                 return (
                     <div className="mt-4 relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                        <input 
                            type="url" 
                            placeholder="Paste a URL to an article or blog post" 
                            className="w-full p-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500" 
                            value={sourceUrl}
                            onChange={e => setSourceUrl(e.target.value)}
                            disabled={isProcessing}
                        />
                    </div>
                );
            case 'text':
            default:
                 return (
                    <textarea value={sourceText} onChange={(e) => setSourceText(e.target.value)} placeholder="Paste your long-form content here..."
                        className="w-full h-40 p-2 mt-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700" required disabled={isProcessing}
                    />
                 );
        }
    }

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-3xl w-full transform transition-all animate-fade-in" onClick={e => e.stopPropagation()}>
                    <form onSubmit={handleSubmit}>
                         <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Project</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Start by providing a source, then select your desired formats.</p>
                            </div>
                            <button type="button" onClick={onClose} disabled={isProcessing} className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-3xl leading-none">&times;</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col">
                                <div className="mb-4">
                                    <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project Name</label>
                                    <input type="text" id="project-name" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="e.g., Q3 Marketing Report" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required disabled={isProcessing} />
                                </div>
                               
                                <div className="mb-4">
                                    <label htmlFor="brand-voice-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Brand Voice <span className="text-red-500">*</span></label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <select
                                            id="brand-voice-select"
                                            value={selectedBrandVoiceId}
                                            onChange={handleBrandVoiceChange}
                                            className="flex-grow block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            disabled={isProcessing}
                                        >
                                            <option value="custom">-- Custom --</option>
                                            {brandVoices.map(bv => (
                                                <option key={bv.id} value={bv.id}>{bv.name}</option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setIsAddBrandVoiceModalOpen(true)}
                                            className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                                            aria-label="Add new brand voice"
                                            disabled={isProcessing}
                                        >
                                            <PlusIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <textarea
                                        value={brandVoice}
                                        onChange={(e) => setBrandVoice(e.target.value)}
                                        placeholder="Describe your brand's tone and style, or select a saved voice..."
                                        className="w-full h-24 p-2 mt-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 disabled:bg-gray-200 dark:disabled:bg-gray-600"
                                        required
                                        disabled={isProcessing || selectedBrandVoiceId !== 'custom'}
                                    />
                                </div>
                               
                                <div className="flex-grow flex flex-col">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Source Content</label>
                                     <div className="flex space-x-1 rounded-lg bg-gray-200 dark:bg-gray-700 p-1 mt-1">
                                        <button type="button" onClick={() => { setSourceType('text'); setFileName(''); }} className={`w-full rounded-md py-1 text-sm font-medium ${sourceType === 'text' ? 'bg-white dark:bg-gray-800 shadow text-blue-600' : 'hover:bg-white/50 dark:hover:bg-black/20'}`}><FileDocIcon className="w-4 h-4 inline mr-1"/>Paste</button>
                                        <button type="button" onClick={() => { setSourceType('document'); setFileName(''); }} className={`w-full rounded-md py-1 text-sm font-medium ${sourceType === 'document' ? 'bg-white dark:bg-gray-800 shadow text-blue-600' : 'hover:bg-white/50 dark:hover:bg-black/20'}`}><UploadIcon className="w-4 h-4 inline mr-1"/>Upload</button>
                                        <button type="button" onClick={() => { setSourceType('video'); setFileName(''); }} className={`w-full rounded-md py-1 text-sm font-medium ${sourceType === 'video' ? 'bg-white dark:bg-gray-800 shadow text-blue-600' : 'hover:bg-white/50 dark:hover:bg-black/20'}`}><VideoIcon className="w-4 h-4 inline mr-1"/>Video</button>
                                        <button type="button" onClick={() => { setSourceType('url'); setFileName(''); }} className={`w-full rounded-md py-1 text-sm font-medium ${sourceType === 'url' ? 'bg-white dark:bg-gray-800 shadow text-blue-600' : 'hover:bg-white/50 dark:hover:bg-black/20'}`}><LinkIcon className="w-4 h-4 inline mr-1"/>URL</button>
                                    </div>
                                   {renderSourceInput()}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Formats to Generate</label>
                                 <div className="mt-2 grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
                                    {ALL_FORMATS.map(format => {
                                        const Icon = formatIcons[format];
                                        const isSelected = selectedFormats.includes(format);
                                        return (
                                            <button
                                                key={format}
                                                type="button"
                                                onClick={() => handleFormatToggle(format)}
                                                disabled={isProcessing}
                                                className={`flex items-center p-3 text-left rounded-lg border-2 transition-colors ${
                                                    isSelected
                                                        ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-500'
                                                        : 'bg-gray-50 dark:bg-gray-700/50 border-transparent hover:border-gray-300 dark:hover:border-gray-500'
                                                }`}
                                            >
                                                {Icon && <Icon className="w-5 h-5 mr-3 flex-shrink-0 text-gray-600 dark:text-gray-300" />}
                                                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{format}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                 <div className="mt-4">
                                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                        <div>
                                            <label htmlFor="search-grounding" className="text-sm font-medium text-gray-800 dark:text-gray-100 cursor-pointer">
                                                Use Google Search Grounding
                                            </label>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">For up-to-date and accurate information.</p>
                                        </div>
                                        <button
                                            id="search-grounding"
                                            type="button"
                                            role="switch"
                                            aria-checked={useSearchGrounding}
                                            onClick={() => setUseSearchGrounding(!useSearchGrounding)}
                                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors disabled:opacity-50 ${
                                                useSearchGrounding ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                                            }`}
                                            disabled={isProcessing}
                                        >
                                            <span
                                                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                                                    useSearchGrounding ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                                 <div className="mt-4">
                                    <label htmlFor="generation-instructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        AI-Powered Suggestions (Optional)
                                    </label>
                                    <textarea
                                        id="generation-instructions"
                                        value={generationInstructions}
                                        onChange={e => setGenerationInstructions(e.target.value)}
                                        rows={4}
                                        placeholder="Add specific instructions to guide the AI, e.g., 'Focus on the section about AI ethics' or 'Make the X thread more controversial.'"
                                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        disabled={isProcessing}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button type="button" onClick={onClose} disabled={isProcessing} className="mr-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600">
                                Cancel
                            </button>
                            <button type="submit" disabled={isProcessing || selectedFormats.length === 0} className="flex items-center justify-center min-w-[120px] px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed">
                                {isProcessing ? <SpinnerIcon className="w-5 h-5" /> : 'Generate Content'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <AddBrandVoiceModal
                isOpen={isAddBrandVoiceModalOpen}
                onClose={() => setIsAddBrandVoiceModalOpen(false)}
                onSave={onSaveBrandVoice}
            />
        </>
    );
};