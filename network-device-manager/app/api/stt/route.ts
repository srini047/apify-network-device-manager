import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob;
    const languageCode = (formData.get("language_code") as string) || "en-IN";

    if (!file) {
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400 }
      );
    }

    const sarvamApiKey = process.env.SARVAM_API_KEY;
    if (!sarvamApiKey) {
      return NextResponse.json(
        { error: "Sarvam API key not configured" },
        { status: 500 }
      );
    }

    // Call Sarvam STT API
    const sarvamFormData = new FormData();
    sarvamFormData.append("file", file, "audio.wav");
    sarvamFormData.append("model", "saarika:v2.5");
    sarvamFormData.append("language_code", languageCode);

    const response = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: {
        "api-subscription-key": sarvamApiKey,
      },
      body: sarvamFormData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Sarvam STT failed");
    }

    return NextResponse.json({
      transcript: data.transcript,
      confidence: data.confidence,
    });
  } catch (error: any) {
    console.error("[v0] STT Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
