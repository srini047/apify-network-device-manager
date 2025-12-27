import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, target_language_code } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const sarvamApiKey = process.env.SARVAM_API_KEY;
    if (!sarvamApiKey) {
      return NextResponse.json(
        { error: "Sarvam API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": sarvamApiKey,
      },
      body: JSON.stringify({
        text,
        target_language_code: target_language_code || "hi-IN",
        speaker: "anushka",
        enable_preprocessing: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Sarvam TTS failed");
    }

    // Sarvam returns base64 audio in some versions, or a URL.
    // Assuming base64 content for direct playback.
    return NextResponse.json({
      audio_content: data.audio_content,
    });
  } catch (error: any) {
    console.error("TTS Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
