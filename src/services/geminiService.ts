import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function detectDisease(imageBase64: string, mimeType: string) {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Analyze this image of a crop, plant, or animal. 
    Identify if there is any disease, infection, or problem.
    Provide the following in a structured JSON format:
    {
      "problem": "Name of the disease or problem",
      "identified": boolean,
      "causes": ["cause 1", "cause 2"],
      "treatment": ["step 1", "step 2"],
      "prevention": ["method 1", "method 2"],
      "confidence": number (0-1)
    }
  `;

  const imagePart = {
    inlineData: {
      mimeType,
      data: imageBase64,
    },
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Detection Error:", error);
    throw error;
  }
}

export async function getFarmingRecommendations(data: {
  country: string;
  state: string;
  district: string;
  soilType: string;
  landSize: number;
  season: string;
}) {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Based on the following farming data:
    Location: ${data.district}, ${data.state}, ${data.country}
    Soil Type: ${data.soilType}
    Land Size: ${data.landSize} acres
    Current Season: ${data.season}

    Suggest suitable crops, plants, trees, and livestock.
    Provide efficient farming strategies for better yield.
    Return the response in JSON format:
    {
      "crops": ["crop 1", "crop 2"],
      "livestock": ["animal 1", "animal 2"],
      "strategies": ["strategy 1", "strategy 2"],
      "guidance": {
        "fertilizers": ["info 1"],
        "water": ["info 1"],
        "medicine": ["info 1"]
      }
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    throw error;
  }
}
