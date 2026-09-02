import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Audio file is missing" },
        { status: 400 }
      );
    }

    const transcription =
      await openai.audio.transcriptions.create({
        file,
        model: "gpt-4o-mini-transcribe",
      });

    return NextResponse.json({
      text: transcription.text,
    });
  } catch (error) {
    console.error("TRANSCRIPTION ERROR:", error);

    return NextResponse.json(
      { error: "Transcription failed" },
      { status: 500 }
    );
  }
}