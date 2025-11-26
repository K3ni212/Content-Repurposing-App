
import { Workflow, WorkflowNode, WorkflowEdge, NodeType, ContentFormat, BrandIntelligence } from '../types';
import { generateGenericContent, summarizeSourceText } from './geminiService';

// Helper to find parent nodes
const getParentNodes = (nodeId: string, nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
    const parentIds = edges.filter(edge => edge.target === nodeId).map(edge => edge.source);
    return nodes.filter(node => parentIds.includes(node.id));
};

// Helper to gather input data from parent nodes
const getInputsFromParents = (nodeId: string, nodes: WorkflowNode[], edges: WorkflowEdge[]): string => {
    const parents = getParentNodes(nodeId, nodes, edges);
    const inputs = parents.map(p => {
        if (typeof p.outputData === 'string') return p.outputData;
        if (typeof p.outputData === 'object' && p.outputData?.content) return p.outputData.content;
        return JSON.stringify(p.outputData || '');
    }).filter(Boolean);
    return inputs.join('\n\n--- NEXT INPUT ---\n\n');
};

const executeNode = async (node: WorkflowNode, inputData: string, brandIntelligence?: BrandIntelligence): Promise<any> => {
    // 1. INPUT NODES
    if (node.type === 'URLScraper') {
        if (!node.data.url) {
             throw new Error("URL is missing. Please configure the node with a valid URL.");
        }
        try {
            const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(node.data.url)}`);
            if (!response.ok) throw new Error("Failed to fetch URL");
            const html = await response.text();
             // Simple cleanup
            const text = html.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, "").replace(/<style[^>]*>([\S\s]*?)<\/style>/gmi, "").replace(/<[^>]+>/g, "").replace(/\s+/g, ' ').trim();
            const cleanText = text.substring(0, 5000); // Limit length
            
            if (!cleanText) throw new Error("No text content found at URL.");
            return cleanText;
        } catch (e) {
            console.error(e);
            throw new Error(`Error fetching URL: ${node.data.url}. The site might block scraping or CORS.`);
        }
    }
    
    if (node.type === 'YouTubeVimeoImport') {
        if (!node.data.videoUrl) {
            throw new Error("Video URL is missing. Please configure the node.");
        }
        return `[Transcript extracted from ${node.data.videoUrl}]\n\n(Simulated transcript): In this video, we discuss the importance of AI agents in modern workflows. Key points include efficiency gains, automated reasoning, and the future of work...`;
    }
    
    if (node.type === 'RSSFeed') {
        if (!node.data.rssUrl) {
            throw new Error("RSS Feed URL is missing.");
        }
        return `[RSS Feed Items from ${node.data.rssUrl}]\n\n1. AI Trends in 2024\n2. The Rise of LLMs\n3. Automation for Beginners`;
    }

    if (node.type === 'FileUpload' || node.type === 'FormIntake') {
        // Return manual text content if provided, else waiting for upload
        if (node.data.textContent) {
            return node.data.textContent;
        }
        throw new Error("No file selected or text content provided. Please upload a file or enter text in the node configuration.");
    }

    if (node.type === 'BrandMemoryLoader') {
        // If brand intelligence is available, output a summary of it for downstream use
        if (brandIntelligence) {
            let summary = "Brand Guidelines:\n";
            if (brandIntelligence.voiceDescriptors?.length) summary += `Voice: ${brandIntelligence.voiceDescriptors.join(', ')}\n`;
            if (brandIntelligence.brandDo?.length) summary += `Do: ${brandIntelligence.brandDo.join(', ')}\n`;
            if (brandIntelligence.brandDont?.length) summary += `Don't: ${brandIntelligence.brandDont.join(', ')}\n`;
            return summary;
        }
        return "No Brand Intelligence data found. Go to Settings > Brand to configure it.";
    }

    // 2. PROCESSING NODES
    if (node.type === 'Summarize') {
        if (!inputData) throw new Error("No input data available to summarize. Connect a source node.");
        const summaryType = node.data.summaryType || 'bullet';
        const instruction = summaryType === 'executive' ? 'Create a high-level executive summary.' : summaryType === 'paragraph' ? 'Summarize in a single coherent paragraph.' : 'Summarize as bullet points.';
        return await generateGenericContent(`${instruction}\n\nContent:\n${inputData}`);
    }

    if (node.type === 'AIRepurpose') {
        if (!inputData) throw new Error("No input data available to repurpose. Connect a source node.");
        const format = node.data.format || 'LinkedIn Post';
        
        let brandContext = '';
        if (brandIntelligence) {
            brandContext = `\n\n**Strictly adhere to the following Brand Guidelines:**\n`;
            if (brandIntelligence.voiceDescriptors?.length) brandContext += `- Voice Descriptors: ${brandIntelligence.voiceDescriptors.join(', ')}\n`;
            if (brandIntelligence.preferredCTAs?.length) brandContext += `- Preferred CTAs: ${brandIntelligence.preferredCTAs.join(', ')}\n`;
            if (brandIntelligence.ctaRules?.length) brandContext += `- CTA Rules: ${brandIntelligence.ctaRules.join(', ')}\n`;
            if (brandIntelligence.avoidCompetitors?.length) brandContext += `- Avoid Styles: ${brandIntelligence.avoidCompetitors.join(', ')}\n`;
            if (brandIntelligence.brandDo?.length) brandContext += `- DO: ${brandIntelligence.brandDo.join(', ')}\n`;
            if (brandIntelligence.brandDont?.length) brandContext += `- DON'T: ${brandIntelligence.brandDont.join(', ')}\n`;
            if (brandIntelligence.industryExpertise?.length) brandContext += `- Demonstrate Expertise In: ${brandIntelligence.industryExpertise.join(', ')}\n`;
        }

        // Merge custom user prompt with brand intelligence
        const customInstructions = node.data.prompt 
            ? `**Additional User Instructions:**\n${node.data.prompt}\n(Prioritize these instructions if they conflict with general guidelines).` 
            : '';

        const prompt = `Repurpose the following content into a ${format}. \n\n${brandContext} \n\n${customInstructions}\n\nContent:\n${inputData}`;
        return await generateGenericContent(prompt);
    }
    
    if (node.type === 'Translate') {
         if (!inputData) throw new Error("No input data available to translate.");
         const lang = node.data.language || 'Spanish';
         return await generateGenericContent(`Translate the following text into ${lang}:\n\n${inputData}`);
    }
    
    if (node.type === 'StyleTransfer') {
        if (!inputData) throw new Error("No input data for style transfer.");
        const style = node.data.targetStyle || "Professional";
        return await generateGenericContent(`Rewrite the following content in the style of: ${style}.\n\nContent:\n${inputData}`);
    }

    if (node.type === 'KeywordExtractor') {
        return await generateGenericContent(`Extract top 10 SEO keywords and 5 hashtags from this text:\n\n${inputData}`);
    }

    if (node.type === 'CTAGenerator') {
         let ctaContext = '';
         if (brandIntelligence?.ctaRules?.length) {
             ctaContext = `\nApply these CTA Rules: ${brandIntelligence.ctaRules.join(', ')}`;
         }
         return await generateGenericContent(`Generate 5 compelling Call To Actions (CTAs) for this content.${ctaContext}\n\n${inputData}`);
    }
    
    if (node.type === 'HookGenerator') {
         return await generateGenericContent(`Generate 3 viral hooks for this content:\n\n${inputData}`);
    }

    // 3. ANALYTICS NODES
    if (node.type === 'AnalyticsAgent') {
        if (!inputData) throw new Error("No content available for analysis.");
        
        const prompt = `
        Act as a Senior Data Analyst & Content Strategist.
        Analyze the following generated content pieces.
        
        Tasks:
        1. Predict the performance of each piece based on: 
           - Engagement Potential (Viral Hooks, Readability)
           - Reach Probability (Trend alignment, Keywords)
           - Conversion Score (CTA strength, Value prop)
        
        2. Identify the single "High-Performer" asset and explain why.
        
        3. Provide a brief "Optimization Strategy" to improve the lower-performing assets.
        
        Output the report in Markdown format.
        
        Content to Analyze:
        ---
        ${inputData}
        ---
        `;
        
        return await generateGenericContent(prompt);
    }

    // 4. OUTPUT NODES (Simulated)
    if (node.type === 'ExportToGoogleDocs') {
        return { success: true, message: "Exported to Google Docs", link: "https://docs.google.com/document/d/mock-doc-id" };
    }
    
    if (node.type === 'SocialMediaPublisher') {
        const platform = node.data.platform || 'Social Media';
        return { success: true, message: `Scheduled for publishing on ${platform}` };
    }

    if (node.type === 'EmailCampaign') {
        const subject = node.data.subjectLine || 'New Content';
        return { success: true, message: `Drafted email with subject: "${subject}"` };
    }

    // Default Fallback for other nodes
    if (!inputData && (node.type.includes('Export') || node.type.includes('Publish'))) {
         throw new Error("No input data to process for export/publish node.");
    }
    
    if (inputData) {
         // Generic pass-through or AI processing for undefined types
         return await generateGenericContent(`Process this content according to the task '${node.data.label}':\n\n${inputData}`);
    }

    return "Executed successfully.";
};

export const executeWorkflowGraph = async (
    nodes: WorkflowNode[], 
    edges: WorkflowEdge[], 
    updateNodeStatus: (id: string, status: 'idle' | 'running' | 'completed' | 'error', output?: any) => void,
    brandIntelligence?: BrandIntelligence
) => {
    // 1. Reset all statuses
    nodes.forEach(n => updateNodeStatus(n.id, 'idle'));

    // 2. Identify root nodes (nodes with no incoming edges)
    const incomingEdgesMap: Record<string, number> = {};
    nodes.forEach(n => incomingEdgesMap[n.id] = 0);
    edges.forEach(e => {
        if (incomingEdgesMap[e.target] !== undefined) incomingEdgesMap[e.target]++;
    });

    const queue = nodes.filter(n => incomingEdgesMap[n.id] === 0);
    const completedNodes = new Set<string>();

    // 3. Execution Loop (BFS-like)
    while (queue.length > 0) {
        const currentNode = queue.shift()!;
        
        // Skip if already processed (handle multi-path convergence simply for now)
        if (completedNodes.has(currentNode.id)) continue;
        
        // Check if all parents are completed
        const parents = getParentNodes(currentNode.id, nodes, edges);
        const allParentsComplete = parents.every(p => completedNodes.has(p.id));
        
        if (!allParentsComplete) {
            // Push back to queue if dependencies aren't met yet
             queue.push(currentNode);
             continue;
        }

        try {
            updateNodeStatus(currentNode.id, 'running');
            
            // Gather inputs
            const inputData = getInputsFromParents(currentNode.id, nodes, edges);
            
            // Execute
            const output = await executeNode(currentNode, inputData, brandIntelligence);
            
            // Update Node
            currentNode.outputData = output; 
            updateNodeStatus(currentNode.id, 'completed', output);
            completedNodes.add(currentNode.id);

            // Add children to queue
            const children = edges.filter(e => e.source === currentNode.id).map(e => nodes.find(n => n.id === e.target)).filter(Boolean) as WorkflowNode[];
            children.forEach(child => {
                if (!queue.find(q => q.id === child.id) && !completedNodes.has(child.id)) {
                    queue.push(child);
                }
            });

        } catch (error: any) {
            console.error(`Error executing node ${currentNode.id}:`, error);
            updateNodeStatus(currentNode.id, 'error', { error: String(error.message || error) });
        }
    }
};
