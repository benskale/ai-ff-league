import { NextRequest, NextResponse } from "next/server";
import { sleeper } from "@/lib/sleeper/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { leagueId: string } }
) {
  const { searchParams } = new URL(req.url);
  const include = searchParams.get("include"); // rosters,users,matchups,transactions,draft
  const week = searchParams.get("week");
  const leagueId = params.leagueId;

  try {
    // If requesting full context (rosters + users + matchups)
    if (include === "all" || include === "context") {
      const context = await sleeper.getLeagueContext(
        leagueId,
        week ? parseInt(week, 10) : undefined
      );
      return NextResponse.json(context);
    }

    // Otherwise just return league info
    const league = await sleeper.getLeague(leagueId);
    return NextResponse.json(league);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch league", detail: String(err) },
      { status: 500 }
    );
  }
}
