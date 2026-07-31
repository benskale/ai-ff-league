import { NextRequest, NextResponse } from "next/server";
import { sleeper } from "@/lib/sleeper/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") as "add" | "drop") || "add";
  const lookback = parseInt(searchParams.get("lookback") || "24", 10);
  const limit = parseInt(searchParams.get("limit") || "25", 10);

  try {
    const trending = await sleeper.getTrending(type, lookback, limit);

    // Enrich with player names
    const allPlayers = await sleeper.getAllPlayers();
    const enriched = trending.map((t) => ({
      ...t,
      player: allPlayers[t.player_id]
        ? {
            name: allPlayers[t.player_id].full_name,
            position: allPlayers[t.player_id].position,
            team: allPlayers[t.player_id].team,
            injury_status: allPlayers[t.player_id].injury_status,
          }
        : null,
    }));

    return NextResponse.json({ trending: enriched });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch trending players", detail: String(err) },
      { status: 500 }
    );
  }
}
