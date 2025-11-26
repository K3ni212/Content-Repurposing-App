import React from 'react';
import { NodeType } from '../../types';

// Import existing icons
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

// Import new icons
import { RSSIcon } from '../icons/RSSIcon';
import { BranchIcon } from '../icons/BranchIcon';
import { WebhookIcon } from '../icons/WebhookIcon';
import { MetricsIcon } from '../icons/MetricsIcon';
import { LogoutIcon } from '../icons/LogoutIcon'; // For changelog
// Fix: Import missing icons to resolve 'used before declaration' errors.
import { ChecklistIcon } from '../icons/ChecklistIcon';
import { SearchIcon } from '../icons/SearchIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { AgentIcon } from '../icons/AgentIcon';
import { TemplateIcon } from '../icons/TemplateIcon';
import { EmailIcon } from '../icons/EmailIcon';
import { MicrophoneIcon } from '../icons/MicrophoneIcon';
import { AnalyticsIcon } from '../icons/AnalyticsIcon';

interface DraggableNodeProps {
    type: NodeType;
}

const CalendarIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 12.75h.008v.008H12v-.008z" />
    </svg>
);


export const nodeInfo: Record<NodeType, { icon: React.FC<any>, label: string, description: string }> = {
    // Existing
    Project: { icon: BriefcaseIcon, label: 'Project', description: 'Starts with project data.' },
    ReviewAssistant: { icon: SparklesIcon, label: 'Smart Review', description: 'AI-powered tone check.' },
    HumanReview: { icon: UserIcon, label: 'Human Review', description: 'Assign to a team member.' },
    Finalize: { icon: CheckIcon, label: 'Finalize', description: 'Final quality checks.' },
    Schedule: { icon: CalendarIcon, label: 'Schedule', description: 'Add to calendar.' },
    Publish: { icon: MegaphoneIcon, label: 'Publish', description: 'Distribute to channels.' },

    // A. Input / Source Nodes
    URLScraper: { icon: LinkIcon, label: 'URL Scraper', description: 'Fetch content from a webpage.' },
    FileUpload: { icon: UploadIcon, label: 'File Upload', description: 'Upload DOCX, PDF, TXT, MP4.' },
    GoogleDriveImport: { icon: GoogleIcon, label: 'Google Drive', description: 'Import from Google Drive.' },
    YouTubeVimeoImport: { icon: VideoIcon, label: 'Video Import', description: 'Extract video transcript.' },
    RSSFeed: { icon: RSSIcon, label: 'RSS Feed', description: 'Fetch from an RSS feed.' },
    FormIntake: { icon: ChecklistIcon, label: 'Form Intake', description: 'Collect info from a form.' },
    BrandMemoryLoader: { icon: LightbulbIcon, label: 'Brand Memory', description: 'Load stored brand voice.' },

    // B. Processing / AI Nodes
    AIRepurpose: { icon: SparklesIcon, label: 'AI Repurpose', description: 'Convert long-form to short-form.' },
    Summarize: { icon: ChatIcon, label: 'Summarize', description: 'Generate TL;DR summaries.' },
    KeywordExtractor: { icon: SearchIcon, label: 'Keyword Extractor', description: 'Extract keywords & hashtags.' },
    CTAGenerator: { icon: MegaphoneIcon, label: 'CTA Generator', description: 'Create compelling call-to-actions.' },
    HookGenerator: { icon: LightbulbIcon, label: 'Hook Generator', description: 'Suggest viral opening lines.' },
    FactCheck: { icon: InfoIcon, label: 'Fact-Check', description: 'Verify factual inconsistencies.' },
    Translate: { icon: TemplateIcon, label: 'Translate', description: 'Adapt for regional audiences.' },
    StyleTransfer: { icon: AgentIcon, label: 'Style Transfer', description: 'Apply another brand’s tone.' },
    
    // C. Human-in-the-Loop Nodes
    EditorReview: { icon: UserIcon, label: 'Editor Review', description: 'Allow human approval and edits.' },
    FounderVoiceCheck: { icon: UserIcon, label: 'Founder Voice Check', description: 'Enable 1-click approval.' },
    TeamCollaboration: { icon: UsersIcon, label: 'Team Collaboration', description: 'Tag members, add comments.' },
    QCChecklist: { icon: ChecklistIcon, label: 'QC Checklist', description: 'Confirm compliance.' },
    FeedbackCollector: { icon: ChatIcon, label: 'Feedback Collector', description: 'Capture revisions for retraining.' },
    
    // D. Output / Distribution Nodes
    ExportToGoogleDocs: { icon: GoogleIcon, label: 'Export to GDocs', description: 'Auto-save drafts to Google Docs.' },
    ExportToAirtableNotion: { icon: ExportIcon, label: 'Export to DB', description: 'Sync status to Airtable/Notion.' },
    ZapierWebhook: { icon: WebhookIcon, label: 'Zapier Webhook', description: 'Trigger external workflows.' },
    SocialMediaPublisher: { icon: MegaphoneIcon, label: 'Social Publisher', description: 'Post to LinkedIn, X, etc.' },
    EmailCampaign: { icon: EmailIcon, label: 'Email Campaign', description: 'Send to ConvertKit/Mailchimp.' },
    PreviewLink: { icon: EyeIcon, label: 'Preview Link', description: 'Generate a shareable preview.' },
    Archive: { icon: HistoryIcon, label: 'Archive', description: 'Store in Evergreen Library.' },

    // E. Logic / Automation
    Trigger: { icon: SparklesIcon, label: 'Trigger', description: 'Event-based actions.' },
    Branch: { icon: BranchIcon, label: 'Condition/Branch', description: 'If-Else logic for workflows.' },
    Merge: { icon: BranchIcon, label: 'Merge', description: 'Combine multiple branches.' },
    TimerDelay: { icon: HistoryIcon, label: 'Timer/Delay', description: 'Pause automation.' },
    Webhook: { icon: WebhookIcon, label: 'Webhook', description: 'Connect to external APIs.' },
    Loop: { icon: HistoryIcon, label: 'Loop', description: 'Iterate across assets or tasks.' },
    DataParser: { icon: SettingsIcon, label: 'Data Parser', description: 'Clean or reformat text.' },
    MetricsTracker: { icon: MetricsIcon, label: 'Metrics Tracker', description: 'Log time saved, revisions, etc.' },
    
    // F. Analytics
    EngagementTracker: { icon: MetricsIcon, label: 'Engagement Tracker', description: 'Pull CTR, reach, likes.' },
    SmartScore: { icon: LightbulbIcon, label: 'Smart Score', description: 'Predict post performance (0-100).' },
    FormatInsight: { icon: InfoIcon, label: 'Format Insight', description: 'Identify best formats.' },
    VoiceAccuracy: { icon: ChatIcon, label: 'Voice Accuracy', description: 'Compare tone match vs. memory.' },
    TimeSavedCalculator: { icon: HistoryIcon, label: 'Time Saved Calc', description: 'Quantify AI efficiency.' },
    CostEfficiency: { icon: BriefcaseIcon, label: 'Cost Efficiency', description: 'Show human editing time saved.' },
    AnalyticsAgent: { icon: AnalyticsIcon, label: 'Analytics Agent', description: 'Analyze & predict performance.' },

    // G. Utility
    Authentication: { icon: UserIcon, label: 'Authentication', description: 'Manage OAuth, Google Sign-In.' },
    UserData: { icon: UserIcon, label: 'User Data', description: 'Store preferences, brand tone.' },
    PlatformProject: { icon: BriefcaseIcon, label: 'Project Node', description: 'Create, duplicate, delete projects.' },
    Notification: { icon: EmailIcon, label: 'Notification', description: 'Send alerts to email, Slack.' },
    Storage: { icon: GoogleIcon, label: 'Storage', description: 'Handle DB or Google Drive storage.' },
    Changelog: { icon: LogoutIcon, label: 'Changelog', description: 'Auto-update changelog.md.' },
    
    // H. Advanced
    PredictiveOptimization: { icon: SparklesIcon, label: 'Predictive Opt.', description: 'Suggest best content type.' },
    TrendDetection: { icon: SearchIcon, label: 'Trend Detection', description: 'Identify trending topics.' },
    AudiencePersona: { icon: UsersIcon, label: 'Audience Persona', description: 'Auto-generate buyer personas.' },
    AdCopyABTest: { icon: MegaphoneIcon, label: 'A/B Test Ad Copy', description: 'Generate and test ad variations.' },
    AIVideoScript: { icon: VideoIcon, label: 'AI Video Script', description: 'Convert text to video script.' },
    AIVoiceover: { icon: MicrophoneIcon, label: 'AI Voiceover', description: 'Generate AI narration.' },
};

export const DraggableNode: React.FC<DraggableNodeProps> = ({ type }) => {
    const onDragStart = (event: React.DragEvent) => {
        event.dataTransfer.setData('application/node', type);
        event.dataTransfer.effectAllowed = 'move';
    };

    const info = nodeInfo[type];
    if (!info) {
        console.warn(`No info found for node type: ${type}`);
        return null;
    }
    const Icon = info.icon;

    return (
        <div 
            draggable 
            onDragStart={onDragStart} 
            className="flex items-center p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-grab hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        >
            <Icon className="w-6 h-6 mr-3 text-gray-500 flex-shrink-0" />
            <div>
                <p className="font-semibold text-sm">{info.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{info.description}</p>
            </div>
        </div>
    );
};