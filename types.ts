
import React from 'react';

export enum ContentFormat {
    LinkedIn = 'LinkedIn Post',
    XThread = 'X Thread',
    Email = 'Email Snippet',
    Carousel = 'Carousel Outline',
    Quote = 'Quote Graphic',
    TikTok = 'TikTok Script',
    InstagramReels = 'Instagram Reels Idea',
    InstagramFeed = 'Instagram Feed Post',
    Facebook = 'Facebook Post',
    Ads = 'Ad Copy',
    Blog = 'Blog Section',
    YouTubeShort = 'YouTube Short Idea',
    PodcastSnippet = 'Podcast Snippet',
    Hook = 'Viral Hook',
    Angle = 'Content Angle',
    CTA = 'Call to Action',
    Newsletter = 'Newsletter',
}

export const ALL_FORMATS = Object.values(ContentFormat);

export type ContentGoal = 
    | 'Reach & Awareness' 
    | 'Lead Generation' 
    | 'Thought Leadership' 
    | 'Conversion & Sales' 
    | 'Engagement & Community' 
    | 'Retention & Nurture';

export const CONTENT_GOALS: ContentGoal[] = [
    'Reach & Awareness',
    'Lead Generation',
    'Thought Leadership',
    'Conversion & Sales',
    'Engagement & Community',
    'Retention & Nurture'
];

export enum ContentStatus {
    Draft = 'Draft',
    Editing = 'Editing',
    Approved = 'Approved',
    ReadyToSchedule = 'Ready to Schedule',
    Exported = 'Exported',
}

export interface Comment {
    id: string;
    author: string;
    text: string;
    createdAt: string; // ISO string
}

export interface ContentPiece {
    id: string;
    format: ContentFormat;
    title: string;
    content: string;
    status: ContentStatus;
    createdAt: string; // ISO string
    smartScore?: number; // From 1-100
    comments?: Comment[];
    scheduledDate?: string; // ISO date string (YYYY-MM-DD)
    imageUrl?: string; // Base64 string for generated image
    
    // Progressive Generation Fields
    isOutline?: boolean; 
    outlineData?: {
        hook: string;
        angle: string;
        keyPoints: string[];
    };
}

export interface BrandVoice {
    id: string;
    name: string;
    description: string;
}

export interface Project {
    id: string;
    name: string;
    sourceText: string;
    brandVoice: string;
    goal?: ContentGoal; // Added Goal
    createdAt: string; // ISO string
    lastModified: string; // ISO string
    contentPieces: ContentPiece[];
    groundingMetadata?: any;
    summary?: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string; // ISO string
  messages: ChatMessage[];
}

export type SubscriptionTier = 'FREE' | 'PRO' | 'PRO_PLUS' | 'TEAM';

export interface UserSubscription {
    tier: SubscriptionTier;
    seats: number;
    workflowEnabled: boolean;
    complianceEnabled: boolean;
}

export interface Settings {
    theme: 'light' | 'dark';
    hasCompletedOnboarding: boolean;
    userRole: string;
    companySize: string;
    goals: string[];
    companyName: string;
    companyUrl: string;
    connectedTools: string[];
    enabledFeatures: string[]; // List of feature IDs enabled by the user
    industry?: string;
    primaryContentType?: string;
    platforms?: string[];
    bottlenecks?: string[];
    // New fields
    teamMembers: { id: string; email: string; role: string; status: 'Active' | 'Pending' }[];
    aiConfig: { creativity: number; model: string; language: string };
    notificationPreferences: { email: boolean; inApp: boolean };
    integrationStatus: Record<string, boolean>;
    billing: { plan: string; creditsUsed: number; creditsLimit: number };
    
    // B2B Configs
    avgEditorHourlyRate?: number; // For ROI Calc
}

// Brand Shield Profile
export interface BrandProfile {
    voice_rules: string[];
    forbidden_terms: string[];
    compliance_threshold: number; // 0-100
    default_cta: string;
}

export interface BrandIntelligence extends BrandProfile {
    voiceDescriptors: string[];
    preferredCTAs: string[];
    preferredHashtags: string[];
    toneSamples: string[];
    contentSamples: { name: string, content: string }[];
    vocabulary: string[];
    avoidCompetitors: string[];
    brandDo: string[];
    brandDont: string[];
    ctaRules: string[]; 
    industryExpertise: string[]; 
}


export interface SmartReviewChange {
    originalSnippet: string;
    revisedSnippet: string;
    reason: string;
}

export interface SmartReviewResult {
    revisedContent: string;
    feedbackSummary: string;
    changes: SmartReviewChange[];
}

// Types for Workflow Builder
export type NodeType = 
    // Original Nodes
    | 'Project' | 'ReviewAssistant' | 'HumanReview' | 'Finalize' | 'Schedule' | 'Publish'
    // A. Input / Source Nodes
    | 'URLScraper' | 'FileUpload' | 'GoogleDriveImport' | 'YouTubeVimeoImport' | 'RSSFeed' | 'FormIntake' | 'BrandMemoryLoader'
    // B. Processing / AI Nodes
    | 'AIRepurpose' | 'Summarize' | 'KeywordExtractor' | 'CTAGenerator' | 'HookGenerator' | 'FactCheck' | 'Translate' | 'StyleTransfer'
    // C. Human-in-the-Loop Nodes
    | 'EditorReview' | 'FounderVoiceCheck' | 'TeamCollaboration' | 'QCChecklist' | 'FeedbackCollector'
    // D. Output / Distribution Nodes
    | 'ExportToGoogleDocs' | 'ExportToAirtableNotion' | 'ZapierWebhook' | 'SocialMediaPublisher' | 'EmailCampaign' | 'PreviewLink' | 'Archive'
    // E. Logic / Automation Tools
    | 'Trigger' | 'Branch' | 'Merge' | 'TimerDelay' | 'Webhook' | 'Loop' | 'DataParser' | 'MetricsTracker'
    // F. Analytics & Insight Nodes
    | 'EngagementTracker' | 'SmartScore' | 'FormatInsight' | 'VoiceAccuracy' | 'TimeSavedCalculator' | 'CostEfficiency' | 'AnalyticsAgent'
    // G. Utility / Platform Nodes
    | 'Authentication' | 'UserData' | 'PlatformProject' | 'Notification' | 'Storage' | 'Changelog'
    // H. Advanced Future Nodes
    | 'PredictiveOptimization' | 'TrendDetection' | 'AudiencePersona' | 'AdCopyABTest' | 'AIVideoScript' | 'AIVoiceover';


export interface WorkflowNode {
    id: string;
    type: NodeType;
    position: { x: number, y: number };
    data: {
        label: string;
        trigger?: 'manual' | 'automated';
        description?: string;
        // Node Specific Configs
        url?: string; // For URLScraper
        videoUrl?: string; // For YouTubeVimeoImport
        rssUrl?: string; // For RSSFeed
        textContent?: string; // For FileUpload / Manual Input
        format?: ContentFormat; // For AIRepurpose
        prompt?: string; // Custom instructions
        language?: string; // For Translate
        targetStyle?: string; // For StyleTransfer
        summaryType?: 'bullet' | 'paragraph' | 'executive'; // For Summarize
        platform?: string; // For SocialMediaPublisher
        subjectLine?: string; // For EmailCampaign
    };
    executionStatus?: 'idle' | 'running' | 'completed' | 'error';
    outputData?: any; // The result of the execution
}

export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
}

export interface Workflow {
    id: string;
    name: string;
    createdAt: string; // ISO string
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
}

// Types for AI Agents
export interface Agent {
    id: string;
    name: string;
    role: string;
    description: string;
    capabilities: string[];
    icon: React.FC<any>;
    color: string;
    status: 'active' | 'beta' | 'coming_soon';
}
