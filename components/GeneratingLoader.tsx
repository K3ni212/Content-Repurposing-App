
import React from 'react';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { XIcon } from './icons/XIcon';
import { EmailIcon } from './icons/EmailIcon';
import { SparklesIcon } from './icons/SparklesIcon';

export const GeneratingLoader: React.FC = () => (
    <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-[#0B0C15] relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>

        {/* Glass Container */}
        <div className="relative z-10 glass-panel p-12 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center max-w-sm w-full mx-4">
            {/* Purposeful Animation Container */}
            <div className="relative w-32 h-32 mb-10 flex items-center justify-center">
                {/* Center Source (Pulsing) */}
                <div className="absolute z-10 w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl shadow-glow flex items-center justify-center border border-white/20 animate-pulse">
                    <SparklesIcon className="w-8 h-8 text-white" />
                </div>

                {/* Orbiting Particles / Output Formats */}
                <div className="absolute w-full h-full animate-spin-slow">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 w-10 h-10 bg-blue-500/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-blue-400/30">
                        <LinkedInIcon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-6 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-white/20">
                        <XIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute left-0 top-1/2 -translate-x-6 -translate-y-1/2 w-10 h-10 bg-red-500/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-red-400/30">
                        <EmailIcon className="w-5 h-5 text-red-400" />
                    </div>
                </div>
                
                {/* Connection Lines (Visual Polish) */}
                <div className="absolute inset-0 border-2 border-dashed border-white/10 rounded-full animate-spin-reverse opacity-50"></div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Repurposing Content</h2>
            <div className="flex gap-1.5 items-center justify-center mb-6">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
            </div>
            <p className="text-gray-400 text-sm font-medium animate-pulse">
                Analyzing source &middot; Applying brand voice &middot; Formatting assets
            </p>
        </div>
    </div>
);
