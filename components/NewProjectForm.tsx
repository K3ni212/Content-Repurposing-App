
import React, { useState } from 'react';
import { ContentFormat, ALL_FORMATS, ContentStatus, BrandVoice, BrandIntelligence, ContentGoal, CONTENT_GOALS } from '../types';
import { generateContentOutlines, analyzeVideoFrames, classifyContent } from '../services/geminiService';
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
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';

interface NewProjectFormProps {
    onClose: () => void;
    onProjectCreated: (newProject: any) => void;
    showToast: (message: string, type: 'success' | 'error') => void;
    brandVoices: BrandVoice[];
    onSaveBrandVoice: (voice: { name: string, description: string }) => void;
    brandIntelligence?: BrandIntelligence;
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
  [ContentFormat.Hook]: LightbulbIcon,
  [ContentFormat.Angle]: InfoIcon,
  [ContentFormat.CTA]: MegaphoneIcon,
  [ContentFormat.Newsletter]: EmailIcon,
};

// Content Packs defined in spec
const CONTENT_PACKS = [
    { 
        name: 'Twitter Pack', 
        icon: XIcon,
        description: 'Hook, Thread, CTA, Angles, Quotes',
        formats: [ContentFormat.Hook, ContentFormat.XThread, ContentFormat.CTA, ContentFormat.Angle, ContentFormat.Quote] 
    },
    { 
        name: 'LinkedIn Authority', 
        icon: LinkedInIcon,
        description: 'Narrative, Authority, Data posts + Carousel',
        formats: [ContentFormat.LinkedIn, ContentFormat.LinkedIn, ContentFormat.LinkedIn, ContentFormat.Carousel] 
    },
    { 
        name: 'YouTube Pack', 
        icon: YouTubeIcon,
        description: 'Title, SEO Desc, Hashtags, Captions',
        formats: [ContentFormat.YouTubeShort, ContentFormat.Angle, ContentFormat.Hook] 
    },
    { 
        name: 'Blog Repurpose', 
        icon: FeatherIcon,
        description: 'Multi-platform social distribution',
        formats: [ContentFormat.LinkedIn, ContentFormat.XThread, ContentFormat.Email, ContentFormat.Facebook] 
    },
];

export const NewProjectForm: React.FC<NewProjectFormProps> = ({ onClose, onProjectCreated, showToast, brandVoices, onSaveBrandVoice, brandIntelligence }) => {
    const [step, setStep] = useState(1);
    
    // Form State
    const [projectName, setProjectName] = useState('');
    const [brandVoice, setBrandVoice] = useState('');
    const [sourceText, setSourceText] = useState('');
    const [sourceUrl, setSourceUrl] = useState('');
    const [selectedFormats, setSelectedFormats] = useState<ContentFormat[]>([]);
    const [selectedGoal, setSelectedGoal] = useState<ContentGoal>('Thought Leadership');
    const [useSearchGrounding, setUseSearchGrounding] = useState(false);
    
    // UI State
    const [isProcessing, setIsProcessing] = useState(false);
    const [isAutoDetecting, setIsAutoDetecting] = useState(false);
    const [fileName, setFileName] = useState('');
    const [sourceType, setSourceType] = useState<'text' | 'document' | 'video' | 'url'>('text');
    const [generationInstructions, setGenerationInstructions] = useState('');
    const [selectedBrandVoiceId, setSelectedBrandVoiceId] = useState('custom');
    const [isAddBrandVoiceModalOpen, setIsAddBrandVoiceModalOpen] = useState(false);
    const [aiStrategy, setAiStrategy] = useState<string | null>(null);
    const [showAdvancedFormats, setShowAdvancedFormats] = useState(false);

    const handleFormatToggle = (format: ContentFormat) => {
        setSelectedFormats(prev => prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format]);
    };
    
    const handlePackSelect = (formats: ContentFormat[]) => {
        // If pack is already selected (subset match), toggle it off (clear selection) or just set it
        // For simplicity in this wizard: Clicking a pack Sets the selection to that pack.
        // Or we can add to selection. Let's SET for simplicity/clarity as "One-Click".
        setSelectedFormats(formats);
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

    const handleAutoDetect = async () => {
        if (!sourceText || sourceText.length < 50) {
            showToast('Please provide more source text first.', 'error');
            return;
        }
        setIsAutoDetecting(true);
        setAiStrategy(null);
        try {
            const classification = await classifyContent(sourceText);
            setSelectedFormats(classification.suggestedFormats);
            setAiStrategy(classification.repurposingStrategy);
            showToast(`Detected Topic: ${classification.topic}.`, 'success');
        } catch (error) {
            showToast('Failed to auto-detect formats.', 'error');
        } finally {
            setIsAutoDetecting(false);
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
                const frameCount = Math.min(duration, 10);
                for (let i = 1; i <= frameCount; i++) {
                    video.currentTime = (duration / (frameCount + 1)) * i;
                    await new Promise(resolve => { video.onseeked = resolve; });
                    context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    frames.push(dataUrl.split(',')[1]);
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
        doc.querySelectorAll('script, style, nav, header, footer, aside, [role="navigation"], [role="banner"], [role="contentinfo"]').forEach(el => el.remove());
        const articleElement = doc.querySelector('article, main, .main, #main, .post, #content');
        const content = (articleElement || doc.body).textContent || '';
        return content.replace(/\s\s+/g, ' ').trim();
    };

    const validateStep = (currentStep: number): boolean => {
        if (currentStep === 1) {
            if (!projectName.trim()) { showToast('Please enter a project name.', 'error'); return false; }
            if (sourceType === 'url' && !sourceUrl.trim()) { showToast('Please enter a valid URL.', 'error'); return false; }
            if (sourceType !== 'url' && !sourceText.trim()) { showToast('Please provide source text or a file.', 'error'); return false; }
        }
        if (currentStep === 2) {
            if (!brandVoice.trim()) { showToast('Brand Voice is required.', 'error'); return false; }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(s => s + 1);
        }
    };

    const handleBack = () => {
        setStep(s => s - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (selectedFormats.length === 0) {
            showToast('Please select at least one format.', 'error');
            return;
        }

        setIsProcessing(true);
        let finalSourceText = sourceText;

        if (sourceType === 'url') {
            try {
                showToast('Fetching content from URL...', 'success');
                const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(sourceUrl)}`);
                if (!response.ok) throw new Error(`Failed to fetch URL`);
                const html = await response.text();
                finalSourceText = parseArticleFromHtml(html);
                if (finalSourceText.length < 100) throw new Error("Could not extract content.");
                setSourceText(finalSourceText);
            } catch (error) {
                showToast('Failed to parse URL content.', 'error');
                setIsProcessing(false);
                return;
            }
        }

        try {
            // CHANGED: Call generateContentOutlines instead of full text generation
            const outlines = await generateContentOutlines(finalSourceText, brandVoice, selectedFormats, selectedGoal);
            
            const now = new Date().toISOString();
            const newProject = {
                id: `proj_${Date.now()}`, name: projectName, sourceText: finalSourceText, brandVoice: brandVoice, createdAt: now, lastModified: now,
                contentPieces: outlines.map((outline: any) => ({ 
                    id: `cp_${Date.now()}_${Math.random()}`, 
                    format: outline.format,
                    title: outline.title,
                    content: `**${outline.title}**\n\n*Hook:* ${outline.hook}\n\n*Angle:* ${outline.angle}\n\n*Key Points:*\n${outline.keyPoints.map((p:string) => `- ${p}`).join('\n')}`, 
                    status: ContentStatus.Draft, 
                    createdAt: now,
                    isOutline: true,
                    outlineData: outline
                })),
                groundingMetadata: {}, // Grounding happens on expand if needed
                goal: selectedGoal
            };
            onProjectCreated(newProject);
        } catch (error) {
            console.error(error);
            showToast('Failed to generate outlines.', 'error');
            setIsProcessing(false);
        }
    };

    const renderSourceInput = () => {
        switch(sourceType) {
            case 'document':
                return (
                    <div className="mt-4 animate-fade-in h-48">
                        <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-full border-2 border-gray-200 dark:border-gray-700 border-dashed rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadIcon className="w-8 h-8 mb-3 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-bold text-gray-700 dark:text-gray-200">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">TXT, PDF, DOCX</p>
                            </div>
                            <input id="file-upload" type="file" className="hidden" accept=".txt,.pdf,.doc,.docx" onChange={handleFileUpload} disabled={isProcessing} />
                        </label>
                        {fileName && <p className="mt-2 text-sm text-center text-indigo-600 dark:text-indigo-400 font-medium animate-fade-in">Selected: {fileName}</p>}
                    </div>
                );
            case 'video':
                return (
                    <div className="mt-4 animate-fade-in h-48">
                        <label htmlFor="video-upload" className="flex flex-col items-center justify-center w-full h-full border-2 border-gray-200 dark:border-gray-700 border-dashed rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <VideoIcon className="w-8 h-8 mb-3 text-gray-400 group-hover:text-pink-500 transition-colors" />
                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-bold text-gray-700 dark:text-gray-200">Click to upload video</span></p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">MP4, MOV (Max 50MB)</p>
                            </div>
                            <input id="video-upload" type="file" className="hidden" accept="video/*" onChange={handleVideoUpload} disabled={isProcessing} />
                        </label>
                        {fileName && <p className="mt-2 text-sm text-center text-indigo-600 dark:text-indigo-400 font-medium animate-fade-in">Selected: {fileName}</p>}
                    </div>
                );
            case 'url':
                 return (
                     <div className="mt-4 relative animate-fade-in h-48 flex flex-col justify-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="relative w-full">
                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                            <input 
                                type="url" 
                                placeholder="Paste a URL to an article or blog post..." 
                                className="w-full p-4 pl-12 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none" 
                                value={sourceUrl}
                                onChange={e => setSourceUrl(e.target.value)}
                                disabled={isProcessing}
                            />
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">Supported: Most article-based websites and blogs.</p>
                    </div>
                );
            case 'text':
            default:
                 return (
                    <textarea 
                        value={sourceText} 
                        onChange={(e) => setSourceText(e.target.value)} 
                        placeholder="Paste your long-form content here..."
                        className="w-full h-48 p-4 mt-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 animate-fade-in outline-none resize-none text-sm" 
                        required 
                        disabled={isProcessing}
                    />
                 );
        }
    }

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-300" onClick={onClose}>
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-0 max-w-2xl w-full transform transition-all animate-scale-in flex flex-col max-h-[90vh] relative overflow-hidden border border-gray-100 dark:border-gray-800" onClick={e => e.stopPropagation()}>
                    {/* Top Gradient Border */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient bg-200%"></div>

                    {/* Header with Stepper */}
                    <div className="px-8 pt-8 pb-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Create New Project</h2>
                            <button type="button" onClick={onClose} disabled={isProcessing} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <span className="sr-only">Close</span>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        {/* Progress Steps */}
                        <div className="flex items-center gap-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= step ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                            <span className={step >= 1 ? 'text-indigo-600 dark:text-indigo-400' : ''}>Source</span>
                            <span className={step >= 2 ? 'text-indigo-600 dark:text-indigo-400' : ''}>Strategy</span>
                            <span className={step >= 3 ? 'text-indigo-600 dark:text-indigo-400' : ''}>Formats</span>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                        {step === 1 && (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Project Name</label>
                                    <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="e.g., Q3 Marketing Report" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none" autoFocus />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Source Material</label>
                                    <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                                        {['text', 'document', 'video', 'url'].map(type => (
                                            <button 
                                                key={type}
                                                type="button"
                                                onClick={() => setSourceType(type as any)}
                                                className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${sourceType === type ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                    {renderSourceInput()}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Brand Voice</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-grow">
                                            <select 
                                                value={selectedBrandVoiceId} 
                                                onChange={handleBrandVoiceChange} 
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none appearance-none"
                                            >
                                                <option value="custom">Custom / New Voice</option>
                                                {brandVoices.map(bv => (
                                                    <option key={bv.id} value={bv.id}>{bv.name}</option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => setIsAddBrandVoiceModalOpen(true)}
                                            className="px-4 py-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                                            title="Save current voice"
                                        >
                                            <PlusIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                    
                                    <textarea 
                                        value={brandVoice} 
                                        onChange={e => { setBrandVoice(e.target.value); setSelectedBrandVoiceId('custom'); }} 
                                        placeholder="Describe your brand voice (e.g., Professional yet approachable, witty, authoritative)..."
                                        className="w-full h-32 p-4 mt-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Content Goal</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {CONTENT_GOALS.map(goal => (
                                            <button
                                                key={goal}
                                                type="button"
                                                onClick={() => setSelectedGoal(goal)}
                                                className={`px-4 py-3 rounded-xl text-sm font-medium text-left transition-all border ${selectedGoal === goal ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-indigo-300'}`}
                                            >
                                                {goal}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-8 animate-fade-in">
                                {/* AI Analysis Section */}
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-5 border border-indigo-100 dark:border-indigo-800">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-bold text-indigo-900 dark:text-indigo-100 text-sm flex items-center gap-2">
                                                <SparklesIcon className="w-4 h-4" />
                                                AI Recommendation
                                            </h3>
                                            <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1 leading-relaxed">
                                                {aiStrategy ? aiStrategy : "Let our AI analyze your source text to suggest the best formats and strategy."}
                                            </p>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={handleAutoDetect}
                                            disabled={isAutoDetecting}
                                            className="text-xs bg-white dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-3 py-1.5 rounded-lg font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                                        >
                                            {isAutoDetecting ? 'Analyzing...' : 'Auto-Detect'}
                                        </button>
                                    </div>
                                </div>

                                {/* Content Packs */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Quick Start Packs</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {CONTENT_PACKS.map((pack) => {
                                            const Icon = pack.icon;
                                            // Check if pack is selected (naive check: if all formats in pack are in selectedFormats)
                                            // Better check: exact match or if user clicked it. Simpler: just check if selectedFormats equals pack formats
                                            const isSelected = JSON.stringify(selectedFormats.sort()) === JSON.stringify([...pack.formats].sort());
                                            
                                            return (
                                                <button
                                                    key={pack.name}
                                                    type="button"
                                                    onClick={() => handlePackSelect(pack.formats)}
                                                    className={`p-4 rounded-xl border text-left transition-all hover:shadow-md group ${isSelected ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300'}`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-white dark:bg-indigo-900 text-indigo-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'} group-hover:text-indigo-600 transition-colors`}>
                                                            <Icon className="w-5 h-5" />
                                                        </div>
                                                        {isSelected && <div className="text-indigo-600"><CheckIcon className="w-5 h-5" /></div>}
                                                    </div>
                                                    <h4 className={`font-bold text-sm ${isSelected ? 'text-indigo-900 dark:text-white' : 'text-gray-900 dark:text-white'}`}>{pack.name}</h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{pack.description}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Individual Formats */}
                                <div>
                                    <button 
                                        type="button"
                                        onClick={() => setShowAdvancedFormats(!showAdvancedFormats)}
                                        className="flex items-center text-sm font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                    >
                                        {showAdvancedFormats ? <ChevronDownIcon className="w-4 h-4 mr-1"/> : <ChevronRightIcon className="w-4 h-4 mr-1"/>}
                                        Custom Selection
                                    </button>
                                    
                                    {showAdvancedFormats && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 animate-fade-in">
                                            {ALL_FORMATS.map(format => {
                                                const Icon = formatIcons[format] || MegaphoneIcon;
                                                return (
                                                    <button
                                                        key={format}
                                                        type="button"
                                                        onClick={() => handleFormatToggle(format)}
                                                        className={`flex items-center p-3 rounded-lg border text-xs font-medium text-left transition-all ${selectedFormats.includes(format) ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                                    >
                                                        <Icon className={`w-4 h-4 mr-2 ${selectedFormats.includes(format) ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />
                                                        <span className="truncate">{format}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <label className="flex items-center space-x-3 cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            checked={useSearchGrounding}
                                            onChange={(e) => setUseSearchGrounding(e.target.checked)}
                                            className="form-checkbox h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 transition duration-150 ease-in-out"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Use Google Search for up-to-date info</span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="px-8 py-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        {step > 1 ? (
                            <button type="button" onClick={handleBack} className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800">
                                Back
                            </button>
                        ) : (
                            <div></div>
                        )}
                        
                        {step < 3 ? (
                            <button type="button" onClick={handleNext} className="flex items-center gap-2 px-8 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/20 transition-transform hover:scale-[1.02] active:scale-95">
                                Next <ChevronRightIcon className="w-4 h-4" />
                            </button>
                        ) : (
                            <button type="submit" onClick={handleSubmit} disabled={isProcessing} className="flex items-center gap-2 px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 rounded-xl shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                                {isProcessing ? <SpinnerIcon className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                                {isProcessing ? 'Generating...' : 'Create Project'}
                            </button>
                        )}
                    </div>
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
