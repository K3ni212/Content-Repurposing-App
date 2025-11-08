import { GoogleGenAI, Type, Part } from "@google/genai";
import { ALL_FORMATS, ContentFormat } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const contentPieceSchema = {
    type: Type.OBJECT,
    properties: {
        format: {
            type: Type.STRING,
            enum: ALL_FORMATS,
            description: 'The format of the content piece.',
        },
        title: {
            type: Type.STRING,
            description: 'A short, catchy title for this content piece.'
        },
        content: {
            type: Type.STRING,
            description: 'The full generated content for the specified format.'
        }
    },
    required: ['format', 'title', 'content'],
};

const generationSchema = {
    type: Type.ARRAY,
    items: contentPieceSchema,
};

export async function generateContentPieces(sourceText: string, brandVoice: string, formats: ContentFormat[], useSearchGrounding: boolean, generationInstructions: string): Promise<{ generatedPieces: any[], groundingMetadata: any }> {
    const prompt = `
    You are an expert content repurposing AI. Your task is to take the following long-form content and brand voice description and transform it into several short-form pieces for the specified formats.

    **Brand Voice:**
    ${brandVoice}

    **Source Content:**
    ---
    ${sourceText}
    ---

    **Requested Formats:**
    ${formats.join(', ')}
    
    ${generationInstructions ? `**Additional Instructions:**\n${generationInstructions}\n` : ''}
    
    ${useSearchGrounding ? "Use Google Search to ensure all information is accurate and up-to-date. Include recent data or examples where relevant." : ""}

    Please generate the content for each requested format. Ensure the output strictly adheres to the provided JSON schema.
    - For 'LinkedIn Post', write a professional post with relevant hashtags.
    - For 'X Thread', create a thread with numbered tweets (e.g., 1/5, 2/5).
    - For 'Email Snippet', write a concise and engaging email body.
    - For 'Carousel Outline', create a slide-by-slide outline for an Instagram-style carousel, starting with 'Slide 1:', 'Slide 2:', etc.
    - For 'Quote Graphic', extract one short, impactful quote from the text, ideally under 140 characters. The content should be only the quote itself.
    - For 'TikTok Script', write a short, punchy video script with visual cues.
    - For 'Instagram Reels Idea', provide a concept, audio suggestion, and caption for a Reel.
    - For 'Instagram Feed Post', write a caption for an image or carousel.
    - For 'Facebook Post', create an engaging post suitable for a Facebook audience.
    - For 'Ad Copy', generate a short piece of ad copy with a clear call-to-action.
    - For 'Blog Section', write a brief section that could be part of a larger blog post.
    - For 'YouTube Short Idea', outline a concept for a vertical video under 60 seconds.
    - For 'Podcast Snippet', create a short, compelling script that can be read aloud.
    `;

    try {
        const model = 'gemini-2.5-flash';
        const config: any = {
            thinkingConfig: { thinkingBudget: 24576 }
        };

        if (useSearchGrounding) {
            config.tools = [{ googleSearch: {} }];
        } else {
            config.responseMimeType = "application/json";
            config.responseSchema = generationSchema;
        }

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config,
        });
        
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

        let generatedPieces;
        try {
           generatedPieces = JSON.parse(response.text.trim());
        } catch (e) {
            // If the grounded model failed to return perfect JSON, ask another model to format it.
            console.warn("Initial JSON parsing failed, attempting to reformat.");
            const formattingResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Please format the following text into a valid JSON array of content pieces based on the requested formats (${formats.join(', ')}). The output must be a valid JSON array. The text is: \n\n ${response.text}`,
                config: {
                     responseMimeType: "application/json",
                     responseSchema: generationSchema
                }
            });
            generatedPieces = JSON.parse(formattingResponse.text.trim());
        }
        
        const filteredPieces = generatedPieces.filter((p: {format: ContentFormat}) => formats.includes(p.format));
        
        return { generatedPieces: filteredPieces, groundingMetadata };

    } catch (error) {
        console.error("Error generating content:", error);
        throw new Error("Failed to generate content from Gemini API.");
    }
}

export async function analyzeVideoFrames(frames: string[]) {
    try {
        const prompt = "Analyze these video frames. Provide a concise summary of the video's content and a list of key talking points. If there is speech, try to create a transcript.";
        
        const imageParts: Part[] = frames.map(frame => ({
            inlineData: {
                mimeType: 'image/jpeg',
                data: frame,
            }
        }));
        
        const textPart: Part = { text: prompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts: [textPart, ...imageParts] },
            config: {
                thinkingConfig: { thinkingBudget: 32768 }
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error analyzing video:", error);
        throw new Error("Failed to analyze video using Gemini API.");
    }
}


export async function performTextAction(action: 'rephrase' | 'shorten' | 'expand' | 'cta' | 'hashtags', text: string, tone?: string) {
     try {
        let prompt = '';
        switch(action) {
            case 'rephrase':
                prompt = `Rephrase the following text to have a more ${tone || 'neutral'} tone: "${text}"`;
                break;
            case 'shorten':
                prompt = `Shorten the following text while keeping its core message: "${text}"`;
                break;
            case 'expand':
                prompt = `Expand on the following text, adding more detail and context: "${text}"`;
                break;
            case 'cta':
                 prompt = `Generate 3 compelling call-to-action (CTA) ideas related to this content. Return them as a simple list separated by newlines: "${text}"`;
                break;
            case 'hashtags':
                prompt = `Generate 5 relevant and popular hashtags for the following content. Return them as a space-separated list (e.g., #tag1 #tag2): "${text}"`;
                break;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error(`Error performing ${action}:`, error);
        throw new Error(`Failed to ${action} text using Gemini API.`);
    }
}

export async function brainstormContentIdeas(sourceText: string, brandVoice: string): Promise<string> {
    const prompt = `
    You are an expert content strategist and brainstorming partner.
    Based on the following source content and brand voice, brainstorm 3-5 new and creative content ideas that could be generated from this asset.

    For each idea, provide a catchy title and a brief description of what it would be.
    Present the ideas as a markdown list.

    **Brand Voice:**
    ${brandVoice}

    **Source Content:**
    ---
    ${sourceText}
    ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error brainstorming content ideas:", error);
        throw new Error("Failed to brainstorm ideas using Gemini API.");
    }
}

export async function summarizeSourceText(sourceText: string): Promise<string> {
    const prompt = `
    You are an expert summarizer. Analyze the following text and provide a concise summary as a list of 3-5 key bullet points in markdown format. 
    Focus on the most important topics, arguments, and conclusions presented in the text.

    **Source Text:**
    ---
    ${sourceText}
    ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error summarizing source text:", error);
        throw new Error("Failed to summarize text using Gemini API.");
    }
}