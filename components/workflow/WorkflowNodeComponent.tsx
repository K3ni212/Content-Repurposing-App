
import React, { useRef, useState } from 'react';
import { WorkflowNode, NodeType } from '../../types';
import { DotsVerticalIcon } from '../icons/DotsVerticalIcon';
import { nodeInfo } from './DraggableNode';

// Import all icons
import { BriefcaseIcon } from '../icons/BriefcaseIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { UserIcon } from '../icons/UserIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { MegaphoneIcon } from '../icons/MegaphoneIcon';
import { LinkIcon } from '../icons/LinkIcon';
import { UploadIcon } from '../icons/UploadIcon';
import { GoogleIcon } from '../icons/GoogleIcon';
import { VideoIcon } from '../icons/VideoIcon';
import { ChatIcon } from '../icons/ChatIcon';
import { HistoryIcon } from '../icons/HistoryIcon';
import { ExportIcon } from '../icons/ExportIcon';
import { SettingsIcon } from '../icons/SettingsIcon';
import { LightbulbIcon } from '../icons/LightbulbIcon';
import { EyeIcon } from '../icons/EyeIcon';
import { InfoIcon } from '../icons/InfoIcon';
import { RSSIcon } from '../icons/RSSIcon';
import { BranchIcon } from '../icons/BranchIcon';
import { WebhookIcon } from '../icons/WebhookIcon';
import { MetricsIcon } from '../icons/MetricsIcon';
import { LogoutIcon } from '../icons/LogoutIcon';
import { ChecklistIcon } from '../icons/ChecklistIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { AgentIcon } from '../icons/AgentIcon';
import { TemplateIcon } from '../icons/TemplateIcon';
import { EmailIcon } from '../icons/EmailIcon';
import { MicrophoneIcon } from '../icons/MicrophoneIcon';
import { SearchIcon } from '../icons/SearchIcon';
import { SpinnerIcon } from '../icons/SpinnerIcon';
import { AnalyticsIcon } from '../icons/AnalyticsIcon';

const CalendarIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 12.75h.008v.008H12v-.008z" />
    </svg>
);

interface WorkflowNodeComponentProps {
    node: WorkflowNode;
    onDrag: (id: string, newPosition: { x: number, y: number }) => void;
    onSelect: (id: string) => void;
    isSelected: boolean;
    zoom?: number;
}

const nodeIcons: Record<NodeType, React.FC<any>> = {
    // Existing
    Project: BriefcaseIcon, ReviewAssistant: SparklesIcon, HumanReview: UserIcon, Finalize: CheckIcon, Schedule: CalendarIcon, Publish: MegaphoneIcon,
    // A. Input / Source Nodes
    URLScraper: LinkIcon, FileUpload: UploadIcon, GoogleDriveImport: GoogleIcon, YouTubeVimeoImport: VideoIcon, RSSFeed: RSSIcon, FormIntake: ChecklistIcon, BrandMemoryLoader: LightbulbIcon,
    // B. Processing / AI Nodes
    AIRepurpose: SparklesIcon, Summarize: ChatIcon, KeywordExtractor: SearchIcon, CTAGenerator: MegaphoneIcon, HookGenerator: LightbulbIcon, FactCheck: InfoIcon, Translate: TemplateIcon, StyleTransfer: AgentIcon,
    // C. Human-in-the-Loop Nodes
    EditorReview: UserIcon, FounderVoiceCheck: UserIcon, TeamCollaboration: UsersIcon, QCChecklist: ChecklistIcon, FeedbackCollector: ChatIcon,
    // D. Output / Distribution Nodes
    ExportToGoogleDocs: GoogleIcon, ExportToAirtableNotion: ExportIcon, ZapierWebhook: WebhookIcon, SocialMediaPublisher: MegaphoneIcon, EmailCampaign: EmailIcon, PreviewLink: EyeIcon, Archive: HistoryIcon,
    // E. Logic / Automation
    Trigger: SparklesIcon, Branch: BranchIcon, Merge: BranchIcon, TimerDelay: HistoryIcon, Webhook: WebhookIcon, Loop: HistoryIcon, DataParser: SettingsIcon, MetricsTracker: MetricsIcon,
    // F. Analytics
    EngagementTracker: MetricsIcon, SmartScore: LightbulbIcon, FormatInsight: InfoIcon, VoiceAccuracy: ChatIcon, TimeSavedCalculator: HistoryIcon, CostEfficiency: BriefcaseIcon, AnalyticsAgent: AnalyticsIcon,
    // G. Utility
    Authentication: UserIcon, UserData: UserIcon, PlatformProject: BriefcaseIcon, Notification: EmailIcon, Storage: GoogleIcon, Changelog: LogoutIcon,
    // H. Advanced
    PredictiveOptimization: SparklesIcon, TrendDetection: SearchIcon, AudiencePersona: UsersIcon, AdCopyABTest: MegaphoneIcon, AIVideoScript: VideoIcon, AIVoiceover: MicrophoneIcon,
};

export const WorkflowNodeComponent: React.FC<WorkflowNodeComponentProps> = ({ node, onDrag, onSelect, isSelected, zoom = 1 }) => {
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const nodeStartPos = useRef({ x: 0, y: 0 });

    const handleDragStart = (e: React.DragEvent) => {
        e.stopPropagation(); // Prevent canvas panning
        setIsDragging(true);
        dragStartPos.current = { x: e.clientX, y: e.clientY };
        nodeStartPos.current = { x: node.position.x, y: node.position.y };
        
        // Use empty drag image to prevent native ghosting which looks bad with zoom
        const img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        e.dataTransfer.setDragImage(img, 0, 0);
        
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', node.id);
    };
    
    const handleDrag = (e: React.DragEvent) => {
        if (!isDragging || e.clientX === 0) return; 
        
        // Adjust delta by zoom level so movement tracks mouse 1:1
        const dx = (e.clientX - dragStartPos.current.x) / zoom;
        const dy = (e.clientY - dragStartPos.current.y) / zoom;
        
        onDrag(node.id, {
            x: nodeStartPos.current.x + dx,
            y: nodeStartPos.current.y + dy
        });
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const Icon = nodeIcons[node.type];
    const info = nodeInfo[node.type];

    if (!Icon) {
        console.warn(`No icon for node type: ${node.type}`);
        return null;
    }

    const getStatusIndicator = () => {
        switch(node.executionStatus) {
            case 'running': return <SpinnerIcon className="w-4 h-4 text-blue-500 absolute -top-1.5 -right-1.5 bg-white rounded-full shadow-sm z-10"/>;
            case 'completed': return <CheckIcon className="w-5 h-5 text-white bg-emerald-500 rounded-full p-0.5 absolute -top-1.5 -right-1.5 shadow-sm z-10 animate-scale-in"/>;
            case 'error': return <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full absolute -top-1.5 -right-1.5 shadow-sm z-10 animate-scale-in">!</span>;
            default: return null;
        }
    }

    return (
        <div
            className={`node-element absolute w-[160px] bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl cursor-grab active:cursor-grabbing transition-shadow duration-200 ease-out group ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900 z-20' : 'ring-1 ring-gray-200 dark:ring-gray-700 hover:-translate-y-0.5'} ${isDragging ? 'opacity-80' : ''}`}
            draggable
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
            style={{ left: node.position.x, top: node.position.y }}
        >
            <div className="relative">
                {getStatusIndicator()}
                <div className="flex items-center p-3 border-b border-gray-100 dark:border-gray-700/50">
                    <div className={`p-1.5 rounded-lg mr-2 ${isSelected ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'} transition-colors duration-200`}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold flex-1 truncate text-gray-800 dark:text-gray-100">{node.data.label}</span>
                    <button className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-600">
                        <DotsVerticalIcon className="w-3 h-3" />
                    </button>
                </div>
            </div>
            <div className="p-3">
                <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider truncate mb-1">{node.type}</p>
                {node.outputData && node.executionStatus === 'completed' && <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 animate-fade-in"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Output Ready</p>}
            </div>
             {/* Connection Handles */}
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white dark:bg-gray-600 border-2 border-blue-400 dark:border-blue-400 cursor-crosshair hover:scale-150 hover:bg-blue-500 transition-all duration-200 z-30 shadow-sm" title="Input"/>
            <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white dark:bg-gray-600 border-2 border-blue-400 dark:border-blue-400 cursor-crosshair hover:scale-150 hover:bg-blue-500 transition-all duration-200 z-30 shadow-sm" title="Output"/>

            {/* Tooltip */}
            {info && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 dark:bg-black text-white text-[10px] rounded-lg shadow-xl z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                    {info.description}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-black"></div>
                </div>
            )}
        </div>
    );
};
