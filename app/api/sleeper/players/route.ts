import { NextRequest, NextResponse } from "next/server";
import { sleeper } from "@/lib/sleeper/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const playerId = searchParams.get("playerId");
  const activeOnly = searchParams.get("active") !== "false";

  try {
    // Single player lookup
    if (playerId) {
      const player = await sleeper.getPlayer(playerId);
      if (!player) {
        return NextResponse.json({ error: "Player not found" }, { status: 404 });
      }
      return NextResponse.json(player);
    }

    // Search players
    if (search) {
      const results = await sleeper.searchPlayers(search, 30);
      return NextResponse.json({ players: results, count: results.length });
    }

    // Return full player DB (large response, ~5MB)
    // Frontend should use search or playerId params for normal usage
    return NextResponse.json({
      error:
        "Full player DB is too large for this endpoint. Use ?search=<name> or ?playerId=<id>",
    }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch players", detail: String(err) },
      { status: 500 }
    );
  }
}
