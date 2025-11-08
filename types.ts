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
}

export const ALL_FORMATS = Object.values(ContentFormat);

export enum ContentStatus {
    Draft = 'Draft',
    Editing = 'Editing',
    Approved = 'Approved',
    ReadyToSchedule = 'Ready to Schedule',
    Exported = 'Exported',
}

export interface ContentPiece {
    id: string;
    format: ContentFormat;
    title: string;
    content: string;
    status: ContentStatus;
    createdAt: string; // ISO string
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
    createdAt: string; // ISO string
    contentPieces: ContentPiece[];
    groundingMetadata?: any;
    summary?: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export interface Settings {
    theme: 'light' | 'dark';
    hasCompletedOnboarding: boolean;
    userRole: string;
    companySize: string;
    goals: string[];
}