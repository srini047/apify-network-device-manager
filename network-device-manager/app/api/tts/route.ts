import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, targetLocale } = await req.json();

    if (!text || !targetLocale) {
      return NextResponse.json(
        { error: "Text and targetLocale are required" },
        { status: 400 }
      );
    }

    const sarvamApiKey = process.env.SARVAM_API_KEY;
    if (sarvamApiKey) {
      // Check if Sarvam has translation API
      // Otherwise, fall through to mock response
    }

    console.log(`Translation requested: "${text}" to ${targetLocale}`);

    // Simple mock - in real app, use proper translation API
    const mockTranslations: Record<string, string> = {
      hi: `[HI] ${text}`,
      gu: `[GU] ${text}`,
      mr: `[MR] ${text}`,
    };

    return NextResponse.json({
      translatedText: mockTranslations[targetLocale] || text,
      note: "Using mock translation - integrate real API for production",
    });
  } catch (error: any) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: error.message || "Translation failed" },
      { status: 500 }
    );
  }
}
