import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", 
  tools: [
    {
      googleSearch: {}, 
    } as any, 
  ],
});

export const cleanGeminiJson = (text: string) => {
  try {
    let cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const startIndex = cleanText.indexOf('{');
    const endIndex = cleanText.lastIndexOf('}');

    if (startIndex !== -1 && endIndex !== -1) {
      return cleanText.substring(startIndex, endIndex + 1);
    }

    return cleanText;
  } catch (e) {
    return text; 
  }
};