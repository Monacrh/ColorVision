// src/app/api/llm/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// 🔑 Initialize Gemini API
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { severity, deficiencyType, diagnosis } = body;

    // 🧩 Validate input
    if (!severity || !deficiencyType || !diagnosis) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields (severity, deficiencyType, diagnosis)",
        },
        { status: 400 }
      );
    }

    // 🪄 Improved prompt with strict formatting
    const prompt = `
You are a compassionate career counselor specializing in color vision deficiency. 
A person has just received their color vision test results and needs personalized career guidance.

TEST RESULTS:
- Diagnosis: ${diagnosis}
- Severity: ${severity}
- Deficiency Type: ${deficiencyType}

IMPORTANT: You MUST use EXACTLY this format with these exact section headers. Do not add extra sections or change the header names.

## **1. Personalized Assessment**
Start with a warm, empathetic greeting. Acknowledge their results and explain what they mean in simple terms. Reassure them that this doesn't limit their potential. Mention that approximately 8% of men and 0.5% of women have color vision deficiency. Keep this section to 150-200 words.

## **2. Understanding Your Condition**
Explain ${deficiencyType} in simple, clear terms. Describe how it affects daily life and what specific challenges they might face. Focus on practical examples and be encouraging. Keep this section to 100-150 words.

## **3. Career Paths - Highly Recommended (300-400 words)**
   - List 10-15 careers that are EXCELLENT matches
   - For each careers, provide:
    + For each career, use this format on a single bullet line:
    + - [Career Name]: Why it's suitable; Accessibility features.


## **4. Careers Requiring Accommodations**
List 5-8 careers that are possible with tools and accommodations. For each, explain the challenges and what accommodations can help. Use bullet points with - for each career. Keep this section to 150-200 words.

- Graphic Designer: Challenges with color selection. Accommodations: Color picker tools, colleague verification, accessibility plugins.
- UX/UI Designer: Challenges with color contrast. Accommodations: WCAG guidelines, contrast checkers, automated tools.
- Lab Technician: Challenges with color-coded tests. Accommodations: Digital instruments, labeled samples.

## **5. Careers to Avoid**
List 5-7 careers not recommended due to safety concerns or strict color vision requirements. Be honest but gentle in your explanation. Use bullet points with - for each career. Keep this section to 100-150 words.

- Commercial Pilot: Strict FAA color vision requirements for safety.
- Electrician: Color-coded wiring systems pose safety risks.
- Firefighter: Emergency situations require quick color identification.

## **6. Assistive Technology & Tools**
List helpful tools, apps, and technologies. Include mobile apps, browser extensions, and workplace accommodations. Use bullet points with - for each tool. Keep this section to 150-200 words.

- ColorBlind Pal: Mobile app that identifies colors using camera.
- Colorblindly: Browser extension that adjusts website colors.
- EnChroma Glasses: Special glasses that can enhance color perception for some users.

## **7. Success Strategies**
Provide actionable advice and strategies for success. Focus on strengths, communication, and confidence building. Use bullet points with - for each strategy. Keep this section to 100-150 words.

- Leverage your strengths in pattern recognition and attention to detail.
- Be proactive about discussing accommodations with employers.
- Use technology tools to assist with color-related tasks.

## **8. Closing Encouragement**
End with an inspirational, uplifting message. Mention famous successful people with color vision deficiency. Remind them that this doesn't define their potential. Keep this section to about 100 words.

Remember to:
- Use the EXACT section headers above
- Write in a warm, empathetic, professional tone
- Be specific with career names and tools
- Use bullet points with - for all lists
- Keep paragraphs concise and readable
- Balance realism with optimism

Begin your response now:
`;

    // 🤖 Call Gemini model (without generationConfig)
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    // 🧾 Get text from response and clean formatting
    const recommendation = response.text;

    if (!recommendation) {
      throw new Error("No response generated from AI model");
    }

    // Clean and format the response
    const cleanedRecommendation = recommendation
      .replace(/\*\*(.*?)\*\*/g, '**$1**') // Ensure bold formatting
      .replace(/###/g, '##') // Normalize headers
      .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
      .replace(/##\s+\*\*/g, '## **') // Ensure consistent spacing
      .trim();

    // Verify the response has the required sections
    const requiredSections = [
      '## **1. Personalized Assessment**',
      '## **2. Understanding Your Condition**',
      '## **3. Career Paths - Highly Recommended**',
      '## **4. Careers Requiring Accommodations**',
      '## **5. Careers to Avoid**',
      '## **6. Assistive Technology & Tools**',
      '## **7. Success Strategies**',
      '## **8. Closing Encouragement**'
    ];

    const hasAllSections = requiredSections.every(section => 
      cleanedRecommendation.includes(section)
    );

    if (!hasAllSections) {
      console.warn('LLM response missing some sections, but proceeding anyway');
    }

    return NextResponse.json(
      {
        success: true,
        recommendation: cleanedRecommendation,
        metadata: {
          model: "gemini-2.0-flash",
          generatedAt: new Date().toISOString(),
          sectionsPresent: hasAllSections,
          contentLength: cleanedRecommendation.length
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

// 🧭 GET endpoint for API status check
export async function GET() {
  try {
    const hasKey = !!process.env.GOOGLE_GEMINI_API_KEY;
    const apiStatus = hasKey ? "configured" : "missing_api_key";
    
    return NextResponse.json(
      {
        success: true,
        message: "Career recommendation API is active",
        status: apiStatus,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "API configuration error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}