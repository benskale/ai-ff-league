import { NextRequest, NextResponse } from "next/server";
import { sleeper } from "@/lib/sleeper/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: { leagueId: string; week: string } }
) {
  const { leagueId, week } = params;
  const weekNum = parseInt(week, 10);

  if (isNaN(weekNum) || weekNum < 1 || weekNum > 22) {
    return NextResponse.json(
      { error: "Week must be between 1 and 22" },
      { status: 400 }
    );
  }

  try {
    const matchups = await sleeper.getMatchups(leagueId, weekNum);

    // Enrich with player names for convenience
    const allPlayers = await sleeper.getAllPlayers();
    const enriched = matchups.map((m) => ({
      ...m,
      startersInfo: m.starters.map((pid) => {
        const p = allPlayers[pid];
        return p ? { id: pid, name: p.full_name, pos: p.position, team: p.team } : { id: pid, name: "Unknown" };
      }),
    }));

    return NextResponse.json({ matchups: enriched, week: weekNum });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch matchups", detail: String(err) },
      { status: 500 }
    );
  }
}
