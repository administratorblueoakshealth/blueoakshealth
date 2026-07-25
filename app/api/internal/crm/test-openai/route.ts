import { NextResponse } from "next/server";
import { openai } from "@/lib/ai/openai";

export const runtime = "nodejs";

export async function GET() {
  try {
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: 'Return only this JSON: {"status":"openai_connected"}',
    });

    return NextResponse.json({
      ok: true,
      result: response.output_text,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown OpenAI error",
      },
      { status: 500 }
    );
  }
}