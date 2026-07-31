import { NextResponse } from "next/server";
import { sleeper } from "@/lib/sleeper/client";

export async function GET() {
  try {
    const state = await sleeper.getNFLState();
    return NextResponse.json(state);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch NFL state", detail: String(err) },
      { status: 500 }
    );
  }
}
