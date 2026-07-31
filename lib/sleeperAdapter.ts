import { sleeper } from "./sleeper/client";
import type {
  SleeperLeague,
  SleeperRoster,
  SleeperUser,
  SleeperMatchup,
  SleeperPlayer,
  NFLState,
} from "./sleeper/types";
import type {
  Team,
  Player,
  RosterSlot,
  Matchup,
  Position,
} from "./types";

// Accent colors for teams (cycled deterministically)
const ACCENT_COLORS = [
  "#22d3ee", "#f59e0b", "#a78bfa", "#34d399", "#fb7185",
  "#60a5fa", "#f472b6", "#facc15", "#2dd4bf", "#c084fc",
  "#fb923c", "#4ade80", "#e879f9", "#38bdf8", "#fde047",
];

// Roster position labels for Sleeper's standard lineup
const SLOT_LABELS: Record<string, string> = {
  QB: "QB",
  RB: "RB1",
  WR: "WR1",
  TE: "TE",
  DEF: "D/ST",
  K: "K",
};

function colorForIndex(i: number): string {
  return ACCENT_COLORS[i % ACCENT_COLORS.length];
}

function mapStatus(injuryStatus: string | null): Player["status"] {
  if (!injuryStatus) return "healthy";
  const s = injuryStatus.toLowerCase();
  if (s === "out" || s === "ir" || s === "pup" || s === "sus") return "out";
  if (s.includes("quest")) return "questionable";
  if (s.includes("doubt")) return "out";
  return "healthy";
}

function buildPlayer(
  sp: SleeperPlayer,
  projected = 0
): Player {
  const pos = (sp.fantasy_positions?.[0] || sp.position || "RB") as Position;
  return {
    id: sp.player_id,
    name: sp.full_name || `${sp.first_name ?? ""} ${sp.last_name ?? ""}`.trim() || "Unknown",
    pos,
    nflTeam: sp.team || "FA",
    projected,
    actual: null,
    status: mapStatus(sp.injury_status),
    trending: "flat",
  };
}

export interface LeagueData {
  league: SleeperLeague;
  state: NFLState;
  currentWeek: number;
  teams: Team[];
  myTeamId: string;
  matchups: Matchup[];
  usersMap: Map<string, SleeperUser>;
  rostersMap: Map<number, SleeperRoster>;
  playersMap: Record<string, SleeperPlayer>;
}

/**
 * Fetch full league context from Sleeper and transform it into UI types.
 * This is the main data-loading function for all pages.
 */
export async function loadLeagueData(
  leagueId: string,
  myRosterId: number
): Promise<LeagueData> {
  const [league, rosters, users, state] = await Promise.all([
    sleeper.getLeague(leagueId),
    sleeper.getLeagueRosters(leagueId),
    sleeper.getLeagueUsers(leagueId),
    sleeper.getNFLState(),
  ]);

  const currentWeek = state.week > 0 ? state.week : 1;

  // Fetch matchups for current week (if season has started)
  const sleeperMatchups =
    state.week > 0
      ? await sleeper.getMatchups(leagueId, currentWeek).catch(() => [])
      : [];

  // Fetch all players for roster enrichment
  const playersMap = await sleeper.getAllPlayers().catch(() => ({}));

  // Build user lookup
  const usersMap = new Map<string, SleeperUser>();
  for (const u of users) {
    usersMap.set(u.user_id, u);
  }

  // Build roster lookup
  const rostersMap = new Map<number, SleeperRoster>();
  for (const r of rosters) {
    rostersMap.set(r.roster_id, r);
  }

  // Transform rosters into Team objects
  const rosterPositions = league.roster_positions || [];
  const teams: Team[] = rosters.map((roster, idx) => {
    const owner = usersMap.get(roster.owner_id);
    const teamName =
      owner?.metadata?.team_name || owner?.display_name || `Team ${roster.roster_id}`;

    // Build roster slots
    const starters = roster.starters || [];
    const allPlayers = roster.players || [];
    const benchPlayers = allPlayers.filter((p) => !starters.includes(p));

    const rosterSlots: RosterSlot[] = [];

    // Map starters to positions
    starters.forEach((playerId, slotIdx) => {
      const posLabel = rosterPositions[slotIdx] || "BENCH";
      const sp = playersMap[playerId];
      if (sp) {
        rosterSlots.push({
          slot: posLabel === "BN" || posLabel === "BENCH" ? "BENCH" : posLabel,
          player: buildPlayer(sp),
        });
      } else {
        rosterSlots.push({
          slot: posLabel === "BN" || posLabel === "BENCH" ? "BENCH" : posLabel,
          player: null,
        });
      }
    });

    // Add bench
    benchPlayers.forEach((playerId) => {
      const sp = playersMap[playerId];
      rosterSlots.push({
        slot: "BENCH",
        player: sp ? buildPlayer(sp) : null,
      });
    });

    const pf = roster.settings.fpts + roster.settings.fpts_decimal / 100;
    const pa =
      roster.settings.fpts_against + roster.settings.fpts_against_decimal / 100;
    const streakType = roster.settings.streak_type
      ? `${roster.settings.streak_type === "W" ? "W" : "L"}${
          roster.settings.streak_length ?? 1
        }`
      : "-";

    return {
      id: String(roster.roster_id),
      name: teamName,
      ownerName: owner?.display_name ?? "Unknown",
      agentName: `AI-${(idx + 1).toString().padStart(2, "0")}`,
      agentPersona: "Autonomous Coach",
      wins: roster.settings.wins,
      losses: roster.settings.losses,
      ties: roster.settings.ties,
      pointsFor: pf,
      pointsAgainst: pa,
      streak: streakType,
      waiverPriority: roster.settings.waiver_position,
      faab:
        (league.settings?.waiver_budget || 100) -
        (roster.settings.waiver_budget_used || 0),
      roster: rosterSlots,
      accentColor: colorForIndex(idx),
    };
  });

  // Sort teams by standings
  teams.sort((a, b) => {
    const pctA = a.wins / Math.max(a.wins + a.losses + a.ties, 1);
    const pctB = b.wins / Math.max(b.wins + b.losses + b.ties, 1);
    if (pctB !== pctA) return pctB - pctA;
    return b.pointsFor - a.pointsFor;
  });

  // Transform matchups
  const matchups: Matchup[] = transformMatchups(
    sleeperMatchups,
    rosters,
    teams,
    currentWeek
  );

  return {
    league,
    state,
    currentWeek,
    teams,
    myTeamId: String(myRosterId),
    matchups,
    usersMap,
    rostersMap,
    playersMap,
  };
}

function transformMatchups(
  sleeperMatchups: SleeperMatchup[],
  rosters: SleeperRoster[],
  teams: Team[],
  week: number
): Matchup[] {
  // Group matchups by matchup_id
  const byMatchupId = new Map<number, SleeperMatchup[]>();
  for (const m of sleeperMatchups) {
    const group = byMatchupId.get(m.matchup_id) || [];
    group.push(m);
    byMatchupId.set(m.matchup_id, group);
  }

  const teamByRosterId = new Map(teams.map((t) => [Number(t.id), t]));
  const hasScores = sleeperMatchups.some(
    (m) => m.points > 0 || m.custom_points !== null
  );

  const result: Matchup[] = [];
  for (const [, group] of byMatchupId) {
    if (group.length < 2) continue;
    const [home, away] = group;
    const homeTeam = teamByRosterId.get(home.roster_id);
    const awayTeam = teamByRosterId.get(away.roster_id);
    if (!homeTeam || !awayTeam) continue;

    result.push({
      week,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      homeScore: hasScores ? home.points + (home.custom_points ?? 0) : null,
      awayScore: hasScores ? away.points + (away.custom_points ?? 0) : null,
      status: hasScores ? "final" : "upcoming",
    });
  }

  return result;
}

/**
 * Simple standings data for the import flow — lighter than full loadLeagueData.
 */
export async function getLeagueStandings(
  leagueId: string
): Promise<{
  league: SleeperLeague;
  state: NFLState;
  rosters: Array<{
    rosterId: number;
    teamName: string;
    owner: string;
    wins: number;
    losses: number;
    ties: number;
    pointsFor: number;
  }>;
}> {
  const [league, rosters, users, state] = await Promise.all([
    sleeper.getLeague(leagueId),
    sleeper.getLeagueRosters(leagueId),
    sleeper.getLeagueUsers(leagueId),
    sleeper.getNFLState(),
  ]);

  const userMap = new Map(users.map((u) => [u.user_id, u]));

  const standingsData = rosters
    .map((r) => {
      const owner = userMap.get(r.owner_id);
      return {
        rosterId: r.roster_id,
        teamName:
          owner?.metadata?.team_name || owner?.display_name || `Team ${r.roster_id}`,
        owner: owner?.display_name ?? "Unknown",
        wins: r.settings.wins,
        losses: r.settings.losses,
        ties: r.settings.ties,
        pointsFor: r.settings.fpts + r.settings.fpts_decimal / 100,
      };
    })
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.pointsFor - a.pointsFor;
    });

  return { league, state, rosters: standingsData };
}
