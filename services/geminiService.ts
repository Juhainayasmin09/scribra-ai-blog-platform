import { GoogleGenAI, Type } from "@google/genai";
import { AIActionType } from "../types";

// NOTE: In a real environment, this key should be secure.
// The API key must be obtained exclusively from process.env.API_KEY.
// We initialize the client with the key directly as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-3-flash-preview";

export const geminiService = {
  generateContent: async (
    action: AIActionType,
    context: string,
    additionalPrompt?: string
  ): Promise<string> => {
    if (!process.env.API_KEY) {
      throw new Error("API Key is missing. Please set process.env.API_KEY.");
    }

    let prompt = "";

    switch (action) {
      case 'OUTLINE':
        prompt = `Create a structured blog post outline for the topic: "${context}". 
        Use Markdown headings (##, ###). Keep it concise and actionable.`;
        break;
      case 'CONTINUE':
        prompt = `Continue writing this blog post. Pick up naturally where the text ends. 
        Maintain the tone and style. Here is the current content:\n\n${context}`;
        break;
      case 'IMPROVE':
        prompt = `Rewrite the following text to improve clarity, flow, and professional tone. 
        Do not change the core meaning. Text:\n\n${context}`;
        break;
      case 'SUMMARIZE':
        prompt = `Summarize the following blog post content into a short, engaging meta description (max 160 characters):\n\n${context}`;
        break;
      case 'SEO':
        // Schema handles the structure, so we just ask for the analysis.
        prompt = `Analyze the following blog content and provide SEO suggestions. Content:\n\n${context}`;
        break;
      default:
        prompt = context;
    }

    if (additionalPrompt) {
      prompt += `\n\nAdditional instructions: ${additionalPrompt}`;
    }

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                // For SEO, we enforce JSON via schema
                responseMimeType: action === 'SEO' ? "application/json" : undefined,
                responseSchema: action === 'SEO' ? {
                    type: Type.OBJECT,
                    properties: {
                        titleSuggestion: { type: Type.STRING },
                        keywords: { 
                            type: Type.ARRAY, 
                            items: { type: Type.STRING } 
                        },
                        improvementTips: { 
                            type: Type.ARRAY, 
                            items: { type: Type.STRING } 
                        }
                    }
                } : undefined,
            }
        });
        
        return response.text || "";
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to generate content. Please check your API key.");
    }
  }
};