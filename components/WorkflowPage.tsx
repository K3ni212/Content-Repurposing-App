
import React from 'react';
import { Workflow, ContentFormat } from '../types';
import { WorkflowIcon } from './icons/WorkflowIcon';
import { VideoIcon } from './icons/VideoIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { EmailIcon } from './icons/EmailIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { FeatherIcon } from './icons/FeatherIcon';
import { XIcon } from './icons/XIcon';

interface WorkflowPageProps {
    workflows: Workflow[]; // Kept for type compatibility but unused in this view
    onSave: (workflow: Workflow) => void; // Unused
    onDelete: (workflowId: string) => void; // Unused
    brandIntelligence: any; // Unused
    onCreateProject: (initialData: any) => void; // Trigger for New Project Form with presets
}

const AUTOMATION_TEMPLATES = [
    {
        name: 'The "Omnipresent" Pack',
        description: 'Turn a single video into a full week of social content across 3 platforms.',
        icon: VideoIcon,
        color: 'from-pink-500 to-rose-500',
        bg: 'bg-pink-50 dark:bg-pink-900/10',
        formats: [ContentFormat.TikTok, ContentFormat.YouTubeShort, ContentFormat.XThread, ContentFormat.LinkedIn]
    },
    {
        name: 'Thought Leader Article',
        description: 'Convert raw notes or a blog into an authority-building LinkedIn series.',
        icon: BriefcaseIcon,
        color: 'from-blue-600 to-indigo-600',
        bg: 'bg-blue-50 dark:bg-blue-900/10',
        formats: [ContentFormat.LinkedIn, ContentFormat.Carousel, ContentFormat.Newsletter]
    },
    {
        name: 'Newsletter Repurpose',
        description: 'Extract key value from your newsletter for Twitter threads and LinkedIn.',
        icon: EmailIcon,
        color: 'from-orange-500 to-amber-500',
        bg: 'bg-orange-50 dark:bg-orange-900/10',
        formats: [ContentFormat.XThread, ContentFormat.LinkedIn, ContentFormat.Hook]
    },
    {
        name: 'Podcast Promo Kit',
        description: 'Everything you need to launch a new podcast episode.',
        icon: MicrophoneIcon,
        color: 'from-purple-600 to-violet-600',
        bg: 'bg-purple-50 dark:bg-purple-900/10',
        formats: [ContentFormat.InstagramReels, ContentFormat.XThread, ContentFormat.LinkedIn, ContentFormat.Email]
    },
    {
        name: 'Blog to Socials',
        description: 'Drive traffic to your blog with optimized social teasers.',
        icon: FeatherIcon,
        color: 'from-emerald-500 to-teal-500',
        bg: 'bg-emerald-50 dark:bg-emerald-900/10',
        formats: [ContentFormat.LinkedIn, ContentFormat.Facebook, ContentFormat.XThread]
    },
    {
        name: 'Viral Tweetstorm',
        description: 'Turn any idea into a high-engagement Twitter thread + hooks.',
        icon: XIcon,
        color: 'from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800',
        bg: 'bg-gray-50 dark:bg-gray-800/30',
        formats: [ContentFormat.XThread, ContentFormat.Hook, ContentFormat.Quote]
    }
];

export const WorkflowPage: React.FC<WorkflowPageProps> = ({ onCreateProject }) => {
    
    const handleRunTemplate = (template: typeof AUTOMATION_TEMPLATES[0]) => {
        // Triggers the New Project Modal with pre-filled formats
        onCreateProject({
            initialTemplate: template
        });
    };

    return (
        <div className="p-6 md:p-10 animate-fade-in relative min-h-full">
             {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-900/10 dark:to-transparent pointer-events-none -z-10"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 relative z-10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
                            <WorkflowIcon className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Automation Templates</h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-base max-w-xl">
                        Select a verified recipe to instantly transform your content. These templates are pre-configured with the best formats for maximum reach.
                    </p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                {AUTOMATION_TEMPLATES.map((template, index) => {
                    const Icon = template.icon;
                    return (
                        <button 
                            key={index} 
                            onClick={() => handleRunTemplate(template)}
                            className="group relative flex flex-col justify-between h-full p-1 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1"
                        >
                            {/* Card Background & Border */}
                            <div className="absolute inset-0 bg-white dark:bg-[#151725] rounded-3xl border border-gray-200 dark:border-white/5 group-hover:border-transparent transition-colors"></div>
                            
                            {/* Hover Gradient Border */}
                            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${template.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-[1px]`}></div>

                            <div className="relative z-10 flex flex-col h-full p-7">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${template.color} flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className="w-7 h-7"/>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
                                        <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full p-2">
                                            <ArrowRightIcon className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="text-left mb-6 flex-grow">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {template.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                        {template.description}
                                    </p>
                                </div>
                                
                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mt-auto">
                                    {template.formats.slice(0, 3).map((fmt, i) => (
                                        <span key={i} className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-transparent ${template.bg} text-gray-600 dark:text-gray-300 group-hover:border-gray-200 dark:group-hover:border-white/10 transition-colors`}>
                                            {fmt}
                                        </span>
                                    ))}
                                    {template.formats.length > 3 && (
                                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg ${template.bg} text-gray-600 dark:text-gray-300`}>
                                            +{template.formats.length - 3}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};
