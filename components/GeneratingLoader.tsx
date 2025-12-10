import React from 'react';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { XIcon } from './icons/XIcon';
import { EmailIcon } from './icons/EmailIcon';
import { InstagramIcon } from './icons/InstagramIcon';
import { FacebookIcon } from './icons/FacebookIcon';
import { YouTubeIcon } from './icons/YouTubeIcon';
import { TikTokIcon } from './icons/TikTokIcon';
import { FileDocIcon } from './icons/FileDocIcon';

export const GeneratingLoader: React.FC = () => (
    <div className="flex-grow flex flex-col items-center justify-center text-center p-8 relative overflow-hidden h-full w-full">
        {/* Ambient Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>

        {/* Glass Container */}
        <div className="relative z-10 glass-panel p-12 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 bg-white/5 backdrop-blur-xl">
            {/* Animation Container */}
            <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
                
                {/* Central Note Icon */}
                <div className="relative z-20 w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-glow-lg flex items-center justify-center border border-white/20 animate-float">
                    <FileDocIcon className="w-12 h-12 text-white" />
                    {/* Ripple Effect */}
                    <div className="absolute inset-0 rounded-3xl bg-white/30 animate-ping opacity-20"></div>
                </div>

                {/* Floating Platform Icons */}
                
                {/* Top Left - Email */}
                <div className="absolute top-4 left-8 animate-float" style={{ animationDelay: '0s', animationDuration: '4s' }}>
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-lg text-red-400">
                        <EmailIcon className="w-6 h-6" />
                    </div>
                </div>

                {/* Top Right - LinkedIn */}
                <div className="absolute top-0 right-10 animate-float" style={{ animationDelay: '1s', animationDuration: '5s' }}>
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-lg text-blue-500">
                        <LinkedInIcon className="w-6 h-6" />
                    </div>
                </div>

                {/* Right - Instagram */}
                <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 animate-float" style={{ animationDelay: '2s', animationDuration: '4.5s' }}>
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-lg text-pink-500">
                        <InstagramIcon className="w-6 h-6" />
                    </div>
                </div>

                {/* Bottom Right - YouTube */}
                <div className="absolute bottom-4 right-6 animate-float" style={{ animationDelay: '0.5s', animationDuration: '5.5s' }}>
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-lg text-red-600">
                        <YouTubeIcon className="w-6 h-6" />
                    </div>
                </div>

                {/* Bottom Left - TikTok */}
                <div className="absolute bottom-0 left-10 animate-float" style={{ animationDelay: '1.5s', animationDuration: '4s' }}>
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-lg text-white">
                        <TikTokIcon className="w-6 h-6" />
                    </div>
                </div>

                {/* Left - X (Twitter) */}
                <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 animate-float" style={{ animationDelay: '2.5s', animationDuration: '5s' }}>
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-lg text-white">
                        <XIcon className="w-6 h-6" />
                    </div>
                </div>
                 
                 {/* Top Center - Facebook */}
                 <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 animate-float" style={{ animationDelay: '1.2s', animationDuration: '6s' }}>
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-lg text-blue-600">
                        <FacebookIcon className="w-6 h-6" />
                    </div>
                </div>

            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Repurposing Content</h2>
            <div className="flex gap-1.5 items-center justify-center mb-6">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium animate-pulse">
                Analyzing source &middot; Crafting formats &middot; Polishing output
            </p>
        </div>
    </div>
);