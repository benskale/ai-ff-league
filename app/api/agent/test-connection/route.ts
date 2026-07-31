import { NextRequest, NextResponse } from "next/server";
import { testLLMConnection } from "@/lib/agent/llm-test";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, model, apiKey, baseUrl } = body;

    if (!provider || !model || !apiKey || !baseUrl) {
      return NextResponse.json(
        { error: "Missing required fields: provider, model, apiKey, baseUrl" },
        { status: 400 }
      );
    }

    const result = await testLLMConnection({ provider, model, apiKey, baseUrl });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Request failed", detail: String(err) },
      { status: 500 }
    );
  }
}
