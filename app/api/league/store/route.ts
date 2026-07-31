import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { setActiveLeague, clearActiveLeague } from "@/lib/leagueStore";
import { getLeagueStandings } from "@/lib/sleeperAdapter";

// Cookie config — 1 year expiry, works on Vercel
const COOKIE_OPTS = {
  httpOnly: false,
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
};

// GET — check if league is connected
export async function GET() {
  const cookieStore = cookies();
  const leagueId = cookieStore.get("ff-league-id")?.value;

  if (!leagueId) {
    return NextResponse.json({ league: null });
  }

  return NextResponse.json({
    league: {
      leagueId,
      leagueName: cookieStore.get("ff-league-name")?.value || "",
      rosterId: parseInt(cookieStore.get("ff-roster-id")?.value || "0", 10),
      ownerName: cookieStore.get("ff-owner-name")?.value || "",
      season: cookieStore.get("ff-season")?.value || "",
    },
  });
}

// POST — connect a league
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leagueId, rosterId } = body;

    if (!leagueId || typeof leagueId !== "string") {
      return NextResponse.json(
        { error: "leagueId is required" },
        { status: 400 }
      );
    }

    // Fetch league + standings to validate
    const { league, rosters } = await getLeagueStandings(leagueId);

    if (!league || !league.league_id) {
      return NextResponse.json({ error: "League not found" }, { status: 404 });
    }

    // If no rosterId yet, return the team list for selection
    if (rosterId === undefined || rosterId === null) {
      return NextResponse.json({
        success: true,
        step: "select_roster",
        league: {
          id: league.league_id,
          name: league.name,
          season: league.season,
          status: league.status,
          totalRosters: league.total_rosters,
        },
        teams: rosters.map((r) => ({
          rosterId: r.rosterId,
          teamName: r.teamName,
          owner: r.owner,
          record: `${r.wins}-${r.losses}${r.ties > 0 ? `-${r.ties}` : ""}`,
        })),
      });
    }

    // Save with chosen roster
    const selectedTeam = rosters.find((r) => r.rosterId === rosterId);
    if (!selectedTeam) {
      return NextResponse.json(
        { error: "Invalid rosterId for this league" },
        { status: 400 }
      );
    }

    const leagueData = {
      leagueId: league.league_id,
      leagueName: league.name,
      rosterId,
      ownerName: selectedTeam.owner,
      season: league.season,
    };

    // Write to file (local dev backup)
    setActiveLeague(leagueData);

    // Set cookies (works on Vercel serverless)
    const res = NextResponse.json({
      success: true,
      step: "connected",
      league: {
        id: league.league_id,
        name: league.name,
        rosterId,
        teamName: selectedTeam.teamName,
        owner: selectedTeam.owner,
      },
    });

    res.cookies.set("ff-league-id", leagueData.leagueId, COOKIE_OPTS);
    res.cookies.set("ff-league-name", leagueData.leagueName, COOKIE_OPTS);
    res.cookies.set("ff-roster-id", String(leagueData.rosterId), COOKIE_OPTS);
    res.cookies.set("ff-owner-name", leagueData.ownerName, COOKIE_OPTS);
    res.cookies.set("ff-season", leagueData.season, COOKIE_OPTS);

    return res;
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to connect league", detail: String(err) },
      { status: 500 }
    );
  }
}

// DELETE — disconnect league
export async function DELETE() {
  clearActiveLeague();
  const res = NextResponse.json({ success: true });
  res.cookies.delete("ff-league-id");
  res.cookies.delete("ff-league-name");
  res.cookies.delete("ff-roster-id");
  res.cookies.delete("ff-owner-name");
  res.cookies.delete("ff-season");
  return res;
}
