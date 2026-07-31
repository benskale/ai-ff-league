import { NextRequest, NextResponse } from "next/server";
import { sleeper } from "@/lib/sleeper/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: { leagueId: string } }
) {
  try {
    const rosters = await sleeper.getLeagueRosters(params.leagueId);
    return NextResponse.json({ rosters });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch rosters", detail: String(err) },
      { status: 500 }
    );
  }
}
