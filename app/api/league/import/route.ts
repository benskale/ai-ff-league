import { NextRequest, NextResponse } from "next/server";
import { sleeper } from "@/lib/sleeper/client";

// Import/connect a Sleeper league by ID
// This fetches league data and returns it for display on the frontend

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leagueId } = body;

    if (!leagueId || typeof leagueId !== "string") {
      return NextResponse.json(
        { error: "leagueId is required" },
        { status: 400 }
      );
    }

    // Fetch full league context
    const context = await sleeper.getLeagueContext(leagueId);

    // Verify the league exists and has rosters
    if (!context.league || !context.league.league_id) {
      return NextResponse.json(
        { error: "League not found" },
        { status: 404 }
      );
    }

    // Fetch trending adds for the dashboard
    const trending = await sleeper.getTrending("add", 24, 10).catch(() => []);

    // Enrich trending with player names
    const allPlayers = await sleeper.getAllPlayers();
    const trendingEnriched = trending.map((t) => ({
      ...t,
      player: allPlayers[t.player_id]
        ? {
            name: allPlayers[t.player_id].full_name,
            position: allPlayers[t.player_id].position,
            team: allPlayers[t.player_id].team,
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      league: {
        id: context.league.league_id,
        name: context.league.name,
        season: context.league.season,
        status: context.league.status,
        totalRosters: context.league.total_rosters,
        scoringSettings: context.league.scoring_settings,
        rosterPositions: context.league.roster_positions,
        avatar: context.league.avatar,
      },
      rosters: context.rosters,
      standings: context.rosters
        .map((r) => ({
          rosterId: r.roster_id,
          teamName: r.owner_team_name,
          owner: r.owner_display_name,
          wins: r.settings.wins,
          losses: r.settings.losses,
          ties: r.settings.ties,
          pointsFor: r.settings.fpts + r.settings.fpts_decimal / 100,
          pointsAgainst: r.settings.fpts_against + r.settings.fpts_against_decimal / 100,
          streak: r.settings.streak_type
            ? `${r.settings.streak_type}${r.settings.streak_length}`
            : "-",
          waiverPosition: r.settings.waiver_position,
          waiverBudgetUsed: r.settings.waiver_budget_used,
        }))
        .sort((a, b) => {
          // Sort by wins desc, then points for desc
          if (b.wins !== a.wins) return b.wins - a.wins;
          return b.pointsFor - a.pointsFor;
        }),
      nflState: context.state,
      currentWeek: context.currentWeek,
      trending: trendingEnriched,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to import league", detail: String(err) },
      { status: 500 }
    );
  }
}
