// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Definisi interface untuk tipe pesan agar tidak terkena error 'any'
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json();
    const { deficiencyType, severity, diagnosis } = context;

    // UPDATE SYSTEM PROMPT INI:
    const systemPrompt = `
      You are an expert AI assistant embedded in a Color Vision Test application.
      
      User Context:
      - Diagnosis: ${diagnosis}
      - Type: ${deficiencyType}
      - Severity: ${severity}

      Your STRICT Instructions:
      1. Your ONLY purpose is to interpret the user's color vision test results and answer questions related to Color Vision Deficiency (CVD), eye health, and how it impacts daily life or careers.
      2. If the user asks about ANY topic unrelated to vision (e.g., technology, sports, coding, general knowledge like "Chrome vs Edge"), you MUST politely DECLINE to answer.
      3. Say something like: "I apologize, but my expertise is strictly limited to color vision analysis. I cannot assist with general topics."
      4. DO NOT attempt to answer the general question even briefly.
      5. Keep your tone professional, medical, and supportive.
    `;

    // Format history pesan untuk Gemini
    let promptHistory = systemPrompt + "\n\nCurrent Conversation:\n";
    
    // PERBAIKAN 1: Menggunakan tipe 'ChatMessage' alih-alih 'any'
    messages.forEach((msg: ChatMessage) => {
      promptHistory += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
    
    promptHistory += "Assistant:";

    // PERBAIKAN 2: Menggunakan pola 'ai.models.generateContent' langsung
    // (Menyesuaikan dengan pola yang berhasil di llm/route.ts)
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: promptHistory,
    });

    // Mengambil text dari response (sesuai SDK @google/genai terbaru)
    const responseText = result.text; 

    if (!responseText) {
      throw new Error("No response generated");
    }

    return NextResponse.json({ success: true, reply: responseText });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate reply" },
      { status: 500 }
    );
  }
}