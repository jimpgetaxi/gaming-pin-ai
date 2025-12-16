import { GoogleGenAI, Type, Schema } from "@google/genai";
import type { PinSuggestion } from "../types";

// Sync Vite environment variables to process.env for compatibility
// This ensures process.env.API_KEY is available as required by the library/guidelines
if (typeof process !== 'undefined' && process.env) {
    try {
        const viteEnv = (import.meta as any).env;
        if (viteEnv && viteEnv.VITE_API_KEY) {
            process.env.API_KEY = viteEnv.VITE_API_KEY;
        }
    } catch (e) {
        // Fallback or ignore if import.meta is not available
    }
}

// Safer initialization: Use a placeholder if key is missing to allow App to load
// The ErrorBoundary in index.tsx will catch the error if we try to use it later,
// OR we throw a specific error below when calling functions.
const apiKey = process.env.API_KEY || "missing-key-placeholder";
const ai = new GoogleGenAI({ apiKey: apiKey });

/**
 * Generates Pinterest pin metadata (Title, Description, SEO, Image Prompt)
 * based on blog post content.
 */
export const generatePinStrategy = async (
  title: string,
  summary: string
): Promise<Omit<PinSuggestion, 'id' | 'status'>[]> => {
  
  // Check for key validity before making request
  if (!process.env.API_KEY && apiKey === "missing-key-placeholder") {
    throw new Error("Missing API Key. Please add VITE_API_KEY to Vercel Environment Variables and Redeploy.");
  }

  const modelId = "gemini-2.5-flash"; 
  
  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Catchy Pinterest title" },
        description: { type: Type.STRING, description: "SEO optimized description with keywords" },
        altText: { type: Type.STRING, description: "Accessibility text describing the visual" },
        tags: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "5-10 relevant hashtags"
        },
        imagePrompt: { type: Type.STRING, description: "A highly detailed prompt for an AI image generator to create a vertical aesthetic gaming setup image. Mention lighting, colors, and specific objects." }
      },
      required: ["title", "description", "altText", "tags", "imagePrompt"]
    }
  };

  const prompt = `
    You are a Pinterest Marketing Expert for a Gaming Setup Aesthetic blog.
    
    Blog Post Title: ${title}
    Blog Summary/Content: ${summary}
    
    Create 3 distinct Pinterest Pin concepts for this post.
    1. One focused on "Inspiration".
    2. One focused on "Tips/How-to" or "Checklist".
    3. One focused on "Aesthetic/Vibe".
    
    Ensure the "imagePrompt" is highly detailed, specifying lighting (neon, soft), colors, camera angles, and objects (RGB keyboards, monitors, plants) suitable for the model 'gemini-2.5-flash-image'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are an expert social media manager specializing in gaming aesthetics.",
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned from Gemini");

    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating pin strategy:", error);
    throw error;
  }
};

/**
 * Generates an image using the "Nano Banana" (gemini-2.5-flash-image) model.
 */
export const generatePinImage = async (prompt: string): Promise<string> => {
  if (!process.env.API_KEY && apiKey === "missing-key-placeholder") {
    throw new Error("Missing API Key. Please add VITE_API_KEY to Vercel Environment Variables and Redeploy.");
  }

  const modelId = "gemini-2.5-flash-image";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {}
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
        for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
                return part.inlineData.data;
            }
        }
    }
    
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};