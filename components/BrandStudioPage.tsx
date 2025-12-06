
import React from 'react';
import { BrandIntelligence, BrandVoice } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';

interface BrandStudioPageProps {
    brandVoices: BrandVoice[];
    brandIntelligence: BrandIntelligence;
}

export const BrandStudioPage: React.FC<BrandStudioPageProps> = ({ brandVoices, brandIntelligence }) => {
    return (
        <div className="p-6 md:p-10 min-h-full bg-[#FAFAFA] dark:bg-[#0B0C15] animate-fade-in relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                <SparklesIcon className="w-6 h-6"/>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Brand Studio</h1>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xl">
                            Configure your brand's DNA. Manage voice personas, style rules, and evergreen assets used by the AI.
                        </p>
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95">
                        <PlusIcon className="w-5 h-5" /> New Voice
                    </button>
                </div>

                {/* Brand DNA Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <div className="col-span-1 lg:col-span-2 space-y-8">
                        {/* Voice Cards */}
                        <section>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <MegaphoneIcon className="w-5 h-5 text-gray-400"/> Active Voices
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {brandVoices.length > 0 ? brandVoices.map(voice => (
                                    <div key={voice.id} className="group bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-2xl backdrop-blur-md hover:border-indigo-500/50 transition-all hover:shadow-lg relative cursor-pointer">
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                                                <TrashIcon className="w-4 h-4"/>
                                            </button>
                                        </div>
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mb-4 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                            {voice.name.charAt(0)}
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{voice.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{voice.description}</p>
                                    </div>
                                )) : (
                                    <div className="col-span-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                                        <p className="text-gray-500 dark:text-gray-400 font-medium">No custom voices yet.</p>
                                        <button className="text-indigo-600 dark:text-indigo-400 text-sm font-bold mt-2 hover:underline">Create your first voice</button>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Style Rules Sidebar */}
                    <div className="bg-white/80 dark:bg-[#151725]/80 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-2xl p-6 h-fit sticky top-24">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Global Style DNA</h3>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Voice Descriptors</label>
                                <div className="flex flex-wrap gap-2">
                                    {(brandIntelligence.voiceDescriptors || []).map((desc, i) => (
                                        <span key={i} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold border border-indigo-100 dark:border-indigo-800">
                                            {desc}
                                        </span>
                                    ))}
                                    <button className="px-3 py-1 border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-full text-xs hover:border-gray-400 hover:text-gray-700 transition-colors">+ Add</button>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2 block">Brand DOs</label>
                                <ul className="space-y-2">
                                    {(brandIntelligence.brandDo || []).map((rule, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                                            {rule}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2 block">Brand DON'Ts</label>
                                <ul className="space-y-2">
                                    {(brandIntelligence.brandDont || []).map((rule, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                                            {rule}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        
                        <button className="w-full mt-8 py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-bold text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            Edit Style Rules
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
