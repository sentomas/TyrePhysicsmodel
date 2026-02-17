import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL_VISION, MOCK_ANALYSIS_DELAY } from "../constants";
import { AnalysisResult } from "../types";

// Helper to safely access API Key without crashing in environments where 'process' is undefined
const getApiKey = (): string | undefined => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore reference errors
  }
  return undefined;
};

// Mock data generator for when API key is missing
const generateMockAnalysis = (): AnalysisResult => {
  const scenarios = [
    {
      hueColor: "Green/Bronze Bloom",
      condition: "Excellent. Visible protective antioxidant wax layer functioning as intended. No surface cracks.",
      bloomDetected: true,
      cracksDetected: false,
      estimatedWear: 5,
      confidence: 0.98
    },
    {
      hueColor: "Deep Black",
      condition: "Clean rubber surface. Active shedding phase. Minor sidewall scuffing detected.",
      bloomDetected: false,
      cracksDetected: false,
      estimatedWear: 25,
      confidence: 0.92
    },
    {
      hueColor: "Faded Grey",
      condition: "Signs of oxidation and UV damage. Material appears dry.",
      bloomDetected: false,
      cracksDetected: false,
      estimatedWear: 60,
      confidence: 0.85
    },
    {
      hueColor: "Grey/Brown",
      condition: "Critical dry rot detected near bead. Micro-cracks visible in tread grooves.",
      bloomDetected: false,
      cracksDetected: true,
      estimatedWear: 80,
      confidence: 0.95
    }
  ];

  // Return a random scenario
  return scenarios[Math.floor(Math.random() * scenarios.length)];
};

export const analyzeTireImage = async (base64Image: string): Promise<AnalysisResult> => {
  
  const apiKey = getApiKey();

  // 1. Check for API Key. If missing, use Mock Mode.
  if (!apiKey) {
    console.warn("TyreTwin: No API_KEY found. Running in MOCK SIMULATION mode.");
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, MOCK_ANALYSIS_DELAY));
    
    return generateMockAnalysis();
  }

  // 2. If Key exists, run real Gemini Analysis
  const ai = new GoogleGenAI({ apiKey: apiKey });
  
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
    // Fallback to mock if API fails
    return generateMockAnalysis();
  }
};