
import React, { useState } from 'react';
import { Workflow, WorkflowNode, WorkflowEdge, BrandIntelligence } from '../types';
import { WorkflowBuilder } from './workflow/WorkflowBuilder';
import { WorkflowIcon } from './icons/WorkflowIcon';
import { PlusIcon } from './icons/PlusIcon';
import { v4 as uuidv4 } from 'uuid';
import { FeatherIcon } from './icons/FeatherIcon';
import { VideoIcon } from './icons/VideoIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { EmailIcon } from './icons/EmailIcon';

interface WorkflowPageProps {
    workflows: Workflow[];
    onSave: (workflow: Workflow) => void;
    onDelete: (workflowId: string) => void;
    brandIntelligence: BrandIntelligence;
    onCreateProject: (project: any) => void;
}

const TEMPLATES: { name: string, description: string, icon: React.FC<any>, nodes: any[], edges: any[] }[] = [
    {
        name: 'Blog → Authority Pack',
        description: 'Convert a blog post into LinkedIn, X Thread, and Email.',
        icon: FeatherIcon,
        nodes: [
            { id: '1', type: 'URLScraper', position: { x: 50, y: 150 }, data: { label: 'Blog URL Source', trigger: 'manual', url: 'https://example.com/blog/future-of-ai-content' } },
            { id: '2', type: 'Summarize', position: { x: 300, y: 50 }, data: { label: 'Key Takeaways', trigger: 'automated' } },
            { id: '3', type: 'AIRepurpose', position: { x: 300, y: 250 }, data: { label: 'LinkedIn Authority Post', trigger: 'automated', format: 'LinkedIn Post' } },
            { id: '4', type: 'AIRepurpose', position: { x: 550, y: 250 }, data: { label: 'X Thread (5 Tweets)', trigger: 'automated', format: 'X Thread' } },
            { id: '5', type: 'EmailCampaign', position: { x: 800, y: 150 }, data: { label: 'Newsletter Draft', trigger: 'automated' } }
        ],
        edges: [
            { id: 'e1', source: '1', target: '2' },
            { id: 'e2', source: '1', target: '3' },
            { id: 'e3', source: '3', target: '4' },
            { id: 'e4', source: '2', target: '5' }
        ]
    },
    {
        name: 'YouTube → 15 Social Posts',
        description: 'Generate comprehensive social coverage from one video.',
        icon: VideoIcon,
        nodes: [
            { id: '1', type: 'YouTubeVimeoImport', position: { x: 50, y: 200 }, data: { label: 'YouTube Video', trigger: 'manual' } },
            { id: '2', type: 'AIRepurpose', position: { x: 350, y: 100 }, data: { label: '5 Shorts Scripts', trigger: 'automated', format: 'TikTok Script' } },
            { id: '3', type: 'AIRepurpose', position: { x: 350, y: 300 }, data: { label: '10 Tweets', trigger: 'automated', format: 'X Thread' } },
            { id: '4', type: 'SocialMediaPublisher', position: { x: 650, y: 200 }, data: { label: 'Schedule All', trigger: 'manual' } }
        ],
        edges: [
            { id: 'e1', source: '1', target: '2' },
            { id: 'e2', source: '1', target: '3' },
            { id: 'e3', source: '2', target: '4' },
            { id: 'e4', source: '3', target: '4' }
        ]
    },
    {
        name: 'Podcast → Clips & Tweets',
        description: 'Extract quotes and create a tweetstorm from audio.',
        icon: MicrophoneIcon,
        nodes: [
            { id: '1', type: 'FileUpload', position: { x: 50, y: 200 }, data: { label: 'Audio File', trigger: 'manual' } },
            { id: '2', type: 'KeywordExtractor', position: { x: 300, y: 100 }, data: { label: 'Extract Quotes', trigger: 'automated' } },
            { id: '3', type: 'AIRepurpose', position: { x: 300, y: 300 }, data: { label: '30 Clips Ideas', trigger: 'automated', format: 'Instagram Reels Idea' } },
            { id: '4', type: 'AIRepurpose', position: { x: 550, y: 300 }, data: { label: '10 Tweets', trigger: 'automated', format: 'X Thread' } }
        ],
        edges: [
            { id: 'e1', source: '1', target: '2' },
            { id: 'e2', source: '1', target: '3' },
            { id: 'e3', source: '3', target: '4' }
        ]
    },
    {
        name: 'Raw Notes → Article',
        description: 'Structure messy notes into a polished article.',
        icon: BriefcaseIcon,
        nodes: [
            { id: '1', type: 'FileUpload', position: { x: 50, y: 200 }, data: { label: 'Upload Notes', trigger: 'manual' } },
            { id: '2', type: 'Summarize', position: { x: 300, y: 200 }, data: { label: 'Structure Outline', trigger: 'automated' } },
            { id: '3', type: 'AIRepurpose', position: { x: 550, y: 200 }, data: { label: 'Draft Article', trigger: 'automated', format: 'Blog Section' } },
            { id: '4', type: 'ReviewAssistant', position: { x: 800, y: 200 }, data: { label: 'Proofread', trigger: 'manual' } }
        ],
        edges: [
            { id: 'e1', source: '1', target: '2' },
            { id: 'e2', source: '2', target: '3' },
            { id: 'e3', source: '3', target: '4' }
        ]
    },
    {
        name: 'LinkedIn → Carousel + Thread',
        description: 'Expand a high-performing post into visual formats.',
        icon: LinkedInIcon,
        nodes: [
            { id: '1', type: 'URLScraper', position: { x: 50, y: 200 }, data: { label: 'LinkedIn Post URL', trigger: 'manual', url: 'https://linkedin.com/post/example' } },
            { id: '2', type: 'AIRepurpose', position: { x: 300, y: 150 }, data: { label: 'Carousel Script', trigger: 'automated', format: 'Carousel Outline' } },
            { id: '3', type: 'AIRepurpose', position: { x: 300, y: 350 }, data: { label: 'Twitter Thread', trigger: 'automated', format: 'X Thread' } },
            { id: '4', type: 'ExportToAirtableNotion', position: { x: 600, y: 250 }, data: { label: 'Save Assets', trigger: 'automated' } }
        ],
        edges: [
            { id: 'e1', source: '1', target: '2' },
            { id: 'e2', source: '1', target: '3' },
            { id: 'e3', source: '2', target: '4' },
            { id: 'e4', source: '3', target: '4' }
        ]
    },
    {
        name: 'Newsletter → Multi-Post',
        description: 'Break down a newsletter into a week of content.',
        icon: EmailIcon,
        nodes: [
            { id: '1', type: 'FileUpload', position: { x: 50, y: 200 }, data: { label: 'Newsletter PDF/Text', trigger: 'manual', textContent: 'Weekly Newsletter Issue #42: The Rise of AI Agents...' } },
            { id: '2', type: 'AIRepurpose', position: { x: 300, y: 100 }, data: { label: '3 LinkedIn Posts', trigger: 'automated', format: 'LinkedIn Post' } },
            { id: '3', type: 'AIRepurpose', position: { x: 300, y: 300 }, data: { label: '5 Tweets', trigger: 'automated', format: 'X Thread' } },
            { id: '4', type: 'AIRepurpose', position: { x: 550, y: 200 }, data: { label: 'IG Story Script', trigger: 'automated', format: 'Instagram Reels Idea' } }
        ],
        edges: [
            { id: 'e1', source: '1', target: '2' },
            { id: 'e2', source: '1', target: '3' },
            { id: 'e3', source: '1', target: '4' }
        ]
    }
];

export const WorkflowPage: React.FC<WorkflowPageProps> = ({ workflows, onSave, onDelete, brandIntelligence, onCreateProject }) => {
    const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

    const handleCreateNewWorkflow = () => {
        const newWorkflow: Workflow = {
            id: `wf_${Date.now()}`,
            name: 'Untitled Workflow',
            createdAt: new Date().toISOString(),
            nodes: [],
            edges: [],
        };
        onSave(newWorkflow);
        setSelectedWorkflow(newWorkflow);
    };

    const handleCreateFromTemplate = (template: typeof TEMPLATES[0]) => {
         const idMap: Record<string, string> = {};
         const newNodes: WorkflowNode[] = template.nodes.map(n => {
             const newId = uuidv4();
             idMap[n.id] = newId;
             return { ...n, id: newId };
         });
         
         const newEdges: WorkflowEdge[] = template.edges.map(e => ({
             id: uuidv4(),
             source: idMap[e.source],
             target: idMap[e.target]
         }));

         const newWorkflow: Workflow = {
            id: `wf_${Date.now()}`,
            name: template.name,
            createdAt: new Date().toISOString(),
            nodes: newNodes,
            edges: newEdges,
        };
        onSave(newWorkflow);
        setSelectedWorkflow(newWorkflow);
    }

    if (selectedWorkflow) {
        return (
            <WorkflowBuilder
                workflow={selectedWorkflow}
                onSave={onSave}
                onClose={() => setSelectedWorkflow(null)}
                brandIntelligence={brandIntelligence}
                onCreateProject={onCreateProject}
            />
        );
    }

    return (
        <div className="p-6 md:p-10 animate-fade-in relative min-h-full">
             {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-50/80 to-transparent dark:from-indigo-900/20 dark:to-transparent pointer-events-none -z-10"></div>

            <div className="flex justify-between items-end mb-10 relative z-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Workflows</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Automate your content production with node-based pipelines.</p>
                </div>
                <button
                    onClick={handleCreateNewWorkflow}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 flex items-center"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    New Workflow
                </button>
            </div>
            
            <div className="mb-12 relative z-10">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300 p-1.5 rounded-lg"><WorkflowIcon className="w-5 h-5"/></span>
                    Start from Template
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TEMPLATES.map((template, index) => {
                        const Icon = template.icon;
                        return (
                             <button 
                                key={index} 
                                onClick={() => handleCreateFromTemplate(template)}
                                className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 text-left hover:shadow-xl hover:shadow-indigo-500/10 transition-all group flex flex-col justify-between h-full relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-gray-100 to-transparent dark:from-gray-700/30 rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                        <Icon className="w-6 h-6"/>
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{template.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{template.description}</p>
                                </div>
                                <div className="mt-6 flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                    Use Template <span className="ml-2">→</span>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 relative z-10">My Workflows</h2>
            {workflows.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10">
                    {workflows.map(wf => (
                        <div key={wf.id} onClick={() => setSelectedWorkflow(wf)} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 cursor-pointer hover:shadow-xl hover:shadow-blue-600/10 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between border border-transparent hover:border-blue-500/20 group">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{wf.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {wf.nodes.length} node{wf.nodes.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700/50">
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                                    {new Date(wf.createdAt).toLocaleDateString()}
                                </p>
                                <button onClick={(e) => { e.stopPropagation(); onDelete(wf.id); }} className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 relative z-10">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <WorkflowIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">No custom workflows yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Create your first workflow or pick a template above.</p>
                </div>
            )}
        </div>
    );
};
