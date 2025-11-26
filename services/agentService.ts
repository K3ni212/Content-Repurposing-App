
import { GoogleGenAI, Type } from "@google/genai";
import { Agent } from '../types';
import { BriefcaseIcon } from '../components/icons/BriefcaseIcon';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { CheckIcon } from '../components/icons/CheckIcon';
import { WebhookIcon } from '../components/icons/WebhookIcon';
import { ChatIcon } from '../components/icons/ChatIcon';
import { MegaphoneIcon } from '../components/icons/MegaphoneIcon';
import { AnalyticsIcon } from '../components/icons/AnalyticsIcon';
import { SearchIcon } from '../components/icons/SearchIcon';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const AGENTS: Agent[] = [
    {
        id: 'intake',
        name: 'Content Intake',
        role: 'Strategist',
        description: 'Breaks down long content into usable parts, detecting voice, tone, and angles.',
        capabilities: ['Extract Key Points', 'Detect Tone & Voice', 'Identify Angles', 'Create Content Map'],
        icon: BriefcaseIcon,
        color: 'bg-purple-500',
        status: 'active'
    },
    {
        id: 'repurposing',
        name: 'Repurposing',
        role: 'Creator',
        description: 'Turns one piece of content into many assets formatted for specific platforms.',
        capabilities: ['Blog to Social', 'Video to Script', 'Snippet Generation', 'Platform Formatting'],
        icon: SparklesIcon,
        color: 'bg-blue-500',
        status: 'active'
    },
    {
        id: 'brand',
        name: 'Brand Consistency',
        role: 'Guardian',
        description: 'Enforces style guides, terminology, and brand DNA across all outputs.',
        capabilities: ['Tone Check', 'Terminology Enforcement', 'Style Guide Audit', 'Brand DNA Align'],
        icon: CheckIcon,
        color: 'bg-emerald-500',
        status: 'active'
    },
    {
        id: 'seo',
        name: 'SEO Specialist',
        role: 'Optimizer',
        description: 'Analyzes content for search engine visibility, suggesting keywords, meta tags, and ranking strategies.',
        capabilities: ['Keyword Research', 'Meta Tags', 'Content Optimization', 'SERP Analysis'],
        icon: SearchIcon,
        color: 'bg-lime-500',
        status: 'active'
    },
    {
        id: 'automation',
        name: 'Workflow Automation',
        role: 'Connector',
        description: 'Connects your content to other tools like Google Docs, Notion, and Zapier.',
        capabilities: ['Export to Docs', 'Sync to Notion', 'Trigger Webhooks', 'Auto-Folder Organization'],
        icon: WebhookIcon,
        color: 'bg-orange-500',
        status: 'active'
    },
    {
        id: 'review',
        name: 'Review & Feedback',
        role: 'Editor',
        description: 'Acts as a smart editor, rating clarity, tone, and suggesting improvements.',
        capabilities: ['Grammar Check', 'Clarity Rating', 'Tone Deviation Alert', 'Improvement Suggestions'],
        icon: ChatIcon,
        color: 'bg-pink-500',
        status: 'active'
    },
    {
        id: 'distribution',
        name: 'Distribution',
        role: 'Publisher',
        description: 'Prepares content for publishing with metadata, thumbnails, and scheduling.',
        capabilities: ['Schedule Posts', 'Generate Metadata', 'Thumbnail Ideas', 'Cross-Platform Push'],
        icon: MegaphoneIcon,
        color: 'bg-indigo-500',
        status: 'beta'
    },
    {
        id: 'analytics',
        name: 'Analytics',
        role: 'Analyst',
        description: 'Analyzes performance patterns to guide your future content strategy.',
        capabilities: ['Engagement Analysis', 'Top Performer Detection', 'Strategy Suggestions', 'Trend Prediction'],
        icon: AnalyticsIcon,
        color: 'bg-cyan-500',
        status: 'beta'
    }
];

export async function runAgentTask(agentId: string, input: string, additionalContext?: any): Promise<string> {
    let systemInstruction = '';
    let prompt = input;
    let model = 'gemini-2.5-flash';
    
    switch (agentId) {
        case 'intake':
            systemInstruction = `You are an expert Content Strategist Agent. Your goal is to dissect content and provide a structured "Content Map".`;
            prompt = `
            Analyze the following source content.
            
            Tasks:
            1. Extract the top 3-5 key takeaways.
            2. Identify the primary Tone and Voice used.
            3. Define the ideal target audience for this content.
            4. List 3 unique "Angles" or perspectives to repurpose this content.
            
            Return the result as a clean Markdown report.
            
            Source Content:
            ${input}
            `;
            break;

        case 'repurposing':
            systemInstruction = `You are a creative Content Repurposing Agent. You specialize in adapting content for social media.`;
            prompt = `
            Repurpose the following source text into a "Multi-Platform Pack".
            
            Create:
            1. A LinkedIn Post (Professional, structured).
            2. A Twitter/X Thread (Hook + 3-5 tweets).
            3. An Instagram Caption (Casual, engaging, hashtags).
            4. A Newsletter Snippet (Value-driven summary).
            
            Format each section clearly with headers.
            
            Source Text:
            ${input}
            `;
            break;

        case 'brand':
            systemInstruction = `You are the Brand Consistency Agent. Your job is to enforce brand rules and ensure high-quality writing.`;
            const brandRules = additionalContext?.brandIntelligence ? 
                JSON.stringify(additionalContext.brandIntelligence) : 
                "Use a professional, authoritative, yet accessible tone.";
            
            prompt = `
            Audit the following text against these Brand Rules:
            ${brandRules}
            
            Tasks:
            1. Highlight any words or phrases that sound "off-brand".
            2. Suggest specific rewrites to align with the brand voice.
            3. Rate the "Brand Alignment Score" from 0-100.
            4. Provide a polished version of the text.
            
            Text to Audit:
            ${input}
            `;
            break;

        case 'seo':
            systemInstruction = `You are an elite SEO Strategist Agent. Your goal is to maximize organic search visibility.`;
            prompt = `
            Perform a comprehensive SEO audit and optimization on the following content.

            1. **Keyword Strategy**: Identify the primary keyword and 3-5 long-tail variations relevant to this topic.
            2. **Meta Data**: Generate a compelling Title Tag (50-60 chars) and Meta Description (150-160 chars).
            3. **Content Optimization**: Suggest specific structural changes (headers, paragraph length) and semantic terms to include to rank higher.
            4. **Technical Check**: Flag any readability issues, passive voice overuse, or keyword stuffing risks.

            Content to Analyze:
            ${input}
            `;
            break;

        case 'automation':
            systemInstruction = `You are an Automation Architect Agent. You don't execute code, but you structure data for automation tools.`;
            prompt = `
            Analyze the following content and prepare a JSON payload structure that could be sent to a webhook (like Zapier).
            
            The payload should include fields for: title, summary, platforms, hashtags, and a 'ready_to_publish' boolean.
            
            Also, suggest 3 automation workflows that would benefit this type of content (e.g., "If blog post -> Create Tweet draft").
            
            Content:
            ${input}
            `;
            break;

        case 'review':
            systemInstruction = `You are a senior Copy Editor Agent. You provide brutal but constructive feedback.`;
            prompt = `
            Review the following draft.
            
            Provide:
            1. A Clarity Score (1-10).
            2. An Engagement Score (1-10).
            3. 3 specific suggestions to make it more punchy or persuasive.
            4. Fix any grammatical errors or awkward phrasing.
            
            Draft:
            ${input}
            `;
            break;

        case 'distribution':
            systemInstruction = `You are a Social Media Distribution Agent.`;
            prompt = `
            Prepare a distribution checklist for the following content.
            
            1. Write SEO Title & Description.
            2. Suggest 5 high-traffic hashtags.
            3. Describe 2 visual asset ideas (Thumbnails/Images) to pair with this.
            4. Recommend the best time of day to post this based on general best practices for LinkedIn and Twitter.
            
            Content:
            ${input}
            `;
            break;

        case 'analytics':
            systemInstruction = `You are a Data Analyst Agent.`;
            prompt = `
            Based on the following text (which represents a content topic or draft), predict its potential performance and suggest a strategy.
            
            1. Identify the "Viral Factor" (Low/Med/High) and explain why.
            2. Suggest which metric to track for this specific piece (e.g., Shares, Clicks, Leads).
            3. Recommend a "Follow-up" piece of content to sustain engagement if this performs well.
            
            Context/Content:
            ${input}
            `;
            break;
            
        default:
            return "Agent ID not found.";
    }

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction
            }
        });
        return response.text || "No response generated.";
    } catch (error) {
        console.error("Agent execution failed:", error);
        return "Error: The agent encountered an issue processing your request.";
    }
}
