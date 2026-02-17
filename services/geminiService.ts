import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL_VISION } from "../constants";
import { AnalysisResult } from "../types";

export const analyzeTireImage = async (base64Image: string): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze this tyre sidewall and tread image for health and material condition.
    Focus on:
    1. Color Hue: Check for "Blooming" (a green/bronze/brown protective wax layer), "Deep Black" (clean rubber), or "Faded Grey" (oxidized/dry).
    2. Surface Condition: Look for micro-cracking, dry rot, or smooth surfaces.
    3. Estimated Wear: Based on tread depth visual cues or sidewall smoothness.
    
    If you see a greenish or bronze tint, that is "Blooming" and is HEALTHY for a stored tyre.
    If you see faded grey, that is "Oxidation" and is unhealthy.
    If tread looks worn, estimate wear percentage.
  `;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_VISION,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', 
              data: base64Image
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hueColor: { type: Type.STRING, description: "Visual color description (e.g., 'Green/Bronze Bloom', 'Deep Black', 'Faded Grey')" },
            condition: { type: Type.STRING, description: "Text description of surface state and tread" },
            bloomDetected: { type: Type.BOOLEAN, description: "Whether protective wax bloom is visible" },
            cracksDetected: { type: Type.BOOLEAN, description: "Whether dry rot or cracks are visible" },
            estimatedWear: { type: Type.NUMBER, description: "Estimated percentage of wear (0-100)" },
            confidence: { type: Type.NUMBER, description: "Confidence score 0-1" }
          },
          required: ["hueColor", "condition", "bloomDetected", "cracksDetected", "estimatedWear", "confidence"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback or re-throw
    throw error;
  }
};