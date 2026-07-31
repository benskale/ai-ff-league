import { NextRequest, NextResponse } from "next/server";
import { sleeper } from "@/lib/sleeper/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: { leagueId: string } }
) {
  try {
    const users = await sleeper.getLeagueUsers(params.leagueId);
    return NextResponse.json({ users });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch users", detail: String(err) },
      { status: 500 }
    );
  }
}
