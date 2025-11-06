import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// 🔑 Inisialisasi Gemini API
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { severity, deficiencyType, diagnosis } = body;

    // 🧩 Validasi input
    if (!severity || !deficiencyType || !diagnosis) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields (severity, deficiencyType, diagnosis)",
        },
        { status: 400 }
      );
    }

    // 🪄 Prompt lengkap untuk AI
    const prompt = `
You are a compassionate career counselor specializing in color vision deficiency. 
A person has just received their color vision test results and needs personalized career guidance.

TEST RESULTS:
- Diagnosis: ${diagnosis}
- Severity: ${severity}
- Deficiency Type: ${deficiencyType}

Please provide a comprehensive, empathetic, and structured career consultation that includes:

1. **Personalized Assessment (150-200 words)**
   - Acknowledge their results with empathy
   - Explain what their specific condition means
   - Reassure them that this doesn't limit their potential
   - Mention statistics (8% men, 0.5% women have color deficiency)

2. **Understanding Your Condition (100-150 words)**
   - Explain ${deficiencyType} in simple terms
   - How it affects daily life
   - Common challenges they might face

3. **Career Paths - Highly Recommended (300-400 words)**
   - List 10-15 careers that are EXCELLENT matches
   - Group by categories (Technology, Business, Healthcare, Education, etc.)
   - For 2-3 top careers, provide:
     * Why it's suitable
     * Salary range
     * Growth potential
     * Accessibility features available

4. **Careers Requiring Accommodations (150-200 words)**
   - List 5-8 careers that are POSSIBLE but need tools/accommodations
   - For each, explain:
     * What challenges they'll face
     * What tools/accommodations can help
     * Success rate with accommodations

5. **Careers to Avoid (100-150 words)**
   - List 5-7 careers NOT recommended
   - Brief explanation why (safety, regulations, high color dependency)
   - Be honest but gentle

6. **Assistive Technology & Tools (150-200 words)**
   - Mobile apps (ColorBlind Pal, Color Name AR, etc.)
   - Browser extensions (Colorblindly, etc.)
   - Hardware solutions if applicable
   - Workplace accommodations

7. **Success Strategies (100-150 words)**
   - How to leverage their strengths
   - Communication tips with employers
   - Building confidence
   - Advocacy resources

8. **Closing Encouragement (100 words)**
   - Inspirational message
   - Famous people with color deficiency who succeeded
   - Reminder that this doesn't define them

FORMAT REQUIREMENTS:
- Use clear section headers with emojis
- Write in a warm, conversational, yet professional tone
- Be specific with career names and tools
- Include practical, actionable advice
- Balance realism with optimism
- Use bullet points for lists
- Keep paragraphs short and readable

TONE: Empathetic, encouraging, honest, professional, supportive
LENGTH: Aim for 1500-2000 words total

Begin your consultation:
`;

    // 🤖 Panggil model Gemini terbaru
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // bisa ganti "gemini-2.0-pro" untuk hasil lebih detail
      contents: prompt,
    });

    // 🧾 Ambil hasil teks dari response
    const recommendation = response.text;

    return NextResponse.json(
      {
        success: true,
        recommendation,
        metadata: {
          model: "gemini-2.5-flash",
          generatedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating career recommendation:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate career recommendation",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// 🧭 GET endpoint opsional untuk cek status API
export async function GET() {
  try {
    const hasKey = !!process.env.GOOGLE_GEMINI_API_KEY;
    return NextResponse.json(
      {
        success: true,
        message: "Career recommendation API is active",
        configured: hasKey,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "API configuration error",
      },
      { status: 500 }
    );
  }
}
