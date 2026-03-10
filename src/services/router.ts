import { GoogleGenerativeAI } from "@google/generative-ai";

// --- DEBUGGER: Verify the API Key is actually loaded ---
const rawKey = process.env.GEMINI_API_KEY;

if (!rawKey || rawKey.length < 5) {
  console.error("❌ CRITICAL: GEMINI_API_KEY is missing or too short in .env file!");
} else {
  // Check if you accidentally left brackets or quotes in the key
  if (rawKey.startsWith('[') || rawKey.startsWith('"') || rawKey.endsWith(']') || rawKey.endsWith('"')) {
    console.error("❌ ERROR: Your API Key in .env has quotes or brackets around it. Remove them!");
  } else {
    console.log(`✅ Gemini API Key detected (Starts with: ${rawKey.substring(0, 6)}...)`);
  }
}

const genAI = new GoogleGenerativeAI(rawKey || "");

export const routerService = {
  async getChatCompletion(params: { model: string, messages: any[], stream: boolean }) {
    // Force gemini-1.5-flash for the fastest/cheapest performance
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 1. Convert OpenAI-style messages to Gemini-style history
    const lastMessage = params.messages[params.messages.length - 1].content;
    const history = params.messages.slice(0, -1).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });

    if (params.stream) {
      // 2. Handle Streaming (Google SDK uses sendMessageStream)
      const result = await chat.sendMessageStream(lastMessage);
      return result.stream; 
    } else {
      // 3. Handle Regular (Non-streaming)
      const result = await chat.sendMessage(lastMessage);
      const response = await result.response;
      return response.text();
    }
  }
};