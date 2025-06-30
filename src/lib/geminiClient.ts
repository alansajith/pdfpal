import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;

export const gemini = new GoogleGenerativeAI(geminiApiKey);
