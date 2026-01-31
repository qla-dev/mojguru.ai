
import { GoogleGenAI, Type } from "@google/genai";
import { MealPreferences } from "../types";

const cleanJsonResponse = (text: string) => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const identifyIngredientsFromImage = async (base64Image: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: "Analyze this image and identify all food ingredients. Return a comma-separated list. MANDATORY: Prefix EVERY single item with a unique relevant emoji (e.g. '🥬 Spinach, 🥚 Eggs, 🥓 Bacon'). Return ONLY the list." }
      ]
    }
  });
  const text = response.text || "";
  return text.split(',').map(i => i.trim()).filter(i => i.length > 0);
};

export const generateThreeRecipeSuggestions = async (ingredients: string[], prefs: MealPreferences) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Based on: ${ingredients.join(', ')}. Generate 3 ${prefs.mealType} recipes (${prefs.diet}, ${prefs.difficulty}).
  Target calories: ${prefs.calorieRange}.
  MANDATORY RULES: 
  1. EVERY ingredient in the array MUST have an emoji (e.g., '🍅 1 cup tomato sauce').
  2. EVERY direction step MUST start with a relevant action emoji (e.g., '🔪 Chop the onions').
  3. The title MUST include an emoji at the end (e.g., 'Spicy Tuna Roll 🍣').
  4. The category MUST have an emoji (e.g., '🔥 Quick & Easy').
  Include: title, calories (number), protein, carbs, fat, ingredients (array), directions (array), and category.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            protein: { type: Type.STRING },
            carbs: { type: Type.STRING },
            fat: { type: Type.STRING },
            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            directions: { type: Type.ARRAY, items: { type: Type.STRING } },
            category: { type: Type.STRING }
          },
          required: ["title", "calories", "protein", "carbs", "fat", "ingredients", "directions", "category"]
        }
      }
    }
  });

  try {
    return JSON.parse(cleanJsonResponse(response.text || '[]'));
  } catch (e) {
    return [];
  }
};

export const suggestVariations = async (title: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Suggest 3 creative variations for "${title}". MANDATORY: Prefix variation names with an emoji. Highlight must be one sentence.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            variationName: { type: Type.STRING },
            highlight: { type: Type.STRING }
          },
          required: ["variationName", "highlight"]
        }
      }
    }
  });
  try {
    return JSON.parse(cleanJsonResponse(response.text || '[]'));
  } catch (e) {
    return [];
  }
};

export const getAIPostCaption = async (base64Image: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: "What is this dish? Give it a short, catchy, trending title. MANDATORY: Start with an emoji. Max 5 words." }
      ]
    }
  });
  return response.text?.trim() || "🥘 Delicious Creation";
};

/**
 * Generates a realistic photo of the dish using gemini-2.5-flash-image.
 * Strictly excludes raw ingredients, cans, or packaging.
 */
export const generateMealImage = async (title: string, ingredients: string[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `High-end professional food photography of the FINISHED, plated gourmet meal: ${title}. The dish is ready to be served, presented elegantly on a clean restaurant table. ABSOLUTELY NO raw ingredients, NO tin cans, NO open food packaging, NO supermarket plastic, and NO raw meat or raw fish should be visible. Focus solely on the appetizing, fully cooked result. 8k resolution, cinematic soft lighting, shallow depth of field.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};
