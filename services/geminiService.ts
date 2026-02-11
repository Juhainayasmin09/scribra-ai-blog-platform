import { GoogleGenAI, Type } from "@google/genai";
import { AIActionType } from "../types";

const MODEL_NAME = "gemini-3-flash-preview";

export const geminiService = {
  generateContent: async (
    action: AIActionType,
    context: string,
    additionalPrompt?: string
  ): Promise<string> => {
    // Fix: Initialize GoogleGenAI instance right before the API call to ensure it always uses the most up-to-date API key from the environment.
    if (!process.env.API_KEY) {
      throw new Error("API Key is missing. Please set process.env.API_KEY.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
                    },
                    propertyOrdering: ["titleSuggestion", "keywords", "improvementTips"]
                } : undefined,
            }
        });
        
        // Fix: Access the text property directly instead of calling it as a method.
        return response.text || "";
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to generate content. Please check your API key.");
    }
  }
};
