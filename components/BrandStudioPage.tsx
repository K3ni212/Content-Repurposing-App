import React from 'react';
import { BrandIntelligence, BrandVoice } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ExclamationCircleIcon } from './icons/ExclamationCircleIcon';

interface BrandStudioPageProps {
    brandVoices: BrandVoice[];
    brandIntelligence: BrandIntelligence;
}

export const BrandStudioPage: React.FC<BrandStudioPageProps> = ({ brandVoices, brandIntelligence }) => {
    return (
        <div className="p-6 md:p-10 min-h-full animate-fade-in relative overflow-hidden">
            
            <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-140px)]">
                
                {/* Left: Voice Synthesizer / Studio Deck */}
                <div className="lg:w-2/3 flex flex-col gap-6">
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Brand Studio</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Configure your brand's AI persona.</p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-105">
                            <PlusIcon className="w-4 h-4" /> New Voice
                        </button>
                    </div>

                    {/* Visualizer Area */}
                    <div className="relative bg-white dark:bg-[#151725] rounded-3xl border border-gray-200 dark:border-white/10 p-8 flex items-center justify-center min-h-[300px] overflow-hidden group shadow-lg dark:shadow-none">
                        {/* Simulated Waveform Visualizer */}
                        <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-20 dark:opacity-40 group-hover:opacity-30 dark:group-hover:opacity-60 transition-opacity">
                            {[...Array(40)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className="w-1.5 bg-indigo-500 rounded-full animate-pulse" 
                                    style={{ 
                                        height: `${Math.random() * 100 + 20}%`, 
                                        animationDelay: `${i * 0.05}s`,
                                        animationDuration: '1s'
                                    }} 
                                />
                            ))}
                        </div>
                        
                        {/* Active Voice Card in Center */}
                        <div className="relative z-10 bg-white/80 dark:bg-black/40 backdrop-blur-md border border-gray-200 dark:border-white/10 p-6 rounded-2xl text-center shadow-xl max-w-sm w-full transform transition-transform hover:scale-105">
                            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-glow-lg text-white">
                                <MicrophoneIcon className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Primary Voice</h2>
                            <p className="text-sm text-indigo-600 dark:text-indigo-300 font-medium mb-4">"Professional & Authoritative"</p>
                            
                            <div className="flex flex-wrap justify-center gap-2">
                                {(brandIntelligence.voiceDescriptors || ['Confident', 'Clear']).map((desc, i) => (
                                    <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-white/10 rounded-md text-xs font-mono text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/5">
                                        {desc}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Voice Presets Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar">
                        {brandVoices.length > 0 ? brandVoices.map(voice => (
                            <div key={voice.id} className="group bg-white dark:bg-[#1A1C29] border border-gray-200 dark:border-white/5 p-5 rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="text-gray-400 hover:text-red-500 transition-colors"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-50 dark:bg-white/5 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        {voice.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">{voice.name}</h3>
                                        <p className="text-xs text-gray-500 line-clamp-1">{voice.description}</p>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-2 border border-dashed border-gray-300 dark:border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-white/5">
                                <p className="text-gray-500 text-sm">No custom voices saved yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: DNA Configuration Panel */}
                <div className="lg:w-1/3 bg-white dark:bg-[#151725] border border-gray-200 dark:border-white/5 rounded-3xl flex flex-col overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <SparklesIcon className="w-5 h-5 text-indigo-500"/>
                            Global Style DNA
                        </h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-white dark:bg-transparent">
                        {/* Rules Section */}
                        <div>
                            <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <CheckCircleIcon className="w-4 h-4"/> Must Do
                            </h4>
                            <div className="space-y-3">
                                {(brandIntelligence.brandDo || ['Use active voice', 'Cite data sources']).map((rule, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-xl">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0 shadow-[0_0_5px_#10b981]"></div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{rule}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <ExclamationCircleIcon className="w-4 h-4"/> Never Do
                            </h4>
                            <div className="space-y-3">
                                {(brandIntelligence.brandDont || ['Use jargon', 'Be passive']).map((rule, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10 rounded-xl">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0 shadow-[0_0_5px_#ef4444]"></div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{rule}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Forbidden Terms</h4>
                            <div className="flex flex-wrap gap-2">
                                {brandIntelligence.forbidden_terms?.map((term, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-xs text-gray-600 dark:text-gray-400 font-mono line-through decoration-red-500/50">
                                        {term}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#0B0C15]">
                        <button className="w-full py-3 rounded-xl bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm font-bold transition-all shadow-sm">
                            Edit Rules
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};