// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import clientPromise from '@/lib/mongodb'; // Import MongoDB client
import { ObjectId } from 'mongodb';      // Import ObjectId

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date; // Tambahkan timestamp
}

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    // 1. Terima resultId dari body request
    const { messages, context, resultId } = await request.json();
    const { deficiencyType, severity, diagnosis } = context;

    // --- SYSTEM PROMPT (STRICT SPECIALIST) ---
    const systemPrompt = `
      You are a specialized Color Vision Consultant for a medical application.
      
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

    let promptHistory = systemPrompt + "\n\nCurrent Conversation:\n";
    messages.forEach((msg: ChatMessage) => {
      promptHistory += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
    promptHistory += "Assistant:";

    // Generate AI Response
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: promptHistory,
    });

    const responseText = result.text;

    if (!responseText) {
      throw new Error("No response generated");
    }

    // 2. LOGIKA PENYIMPANAN KE DATABASE
    if (resultId && ObjectId.isValid(resultId)) {
      const client = await clientPromise;
      const db = client.db('colorvision_db');
      
      // Ambil pesan user terakhir dan balasan AI
      const lastUserMessage = messages[messages.length - 1];
      const newAiMessage = { role: 'assistant', content: responseText, timestamp: new Date() };
      
      // Tambahkan timestamp ke pesan user jika belum ada
      if (!lastUserMessage.timestamp) lastUserMessage.timestamp = new Date();

      // Update dokumen MongoDB ($push akan menambahkan ke array chatHistory)
      await db.collection('test_results').updateOne(
        { _id: new ObjectId(resultId) },
        { 
          $push: { 
            chatHistory: { 
              $each: [lastUserMessage, newAiMessage] 
            } 
          } as any // Casting any untuk menghindari strict typescript error pada operator $push kompleks
        }
      );
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