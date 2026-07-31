import type {
  NFLState,
  SleeperUser,
  SleeperLeague,
  SleeperRoster,
  SleeperMatchup,
  SleeperPlayer,
  TrendingPlayer,
  SleeperTransaction,
  SleeperDraft,
  DraftPick,
  BracketMatchup,
} from "./types";

const BASE_URL = "https://api.sleeper.app/v1";

// In-memory cache. On Vercel serverless each invocation is fresh,
// but this helps within a single request batch and local dev.
const cache = new Map<string, { data: unknown; expiry: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && entry.expiry > Date.now()) {
    return entry.data as T;
  }
  return null;
}

function setCached(key: string, data: unknown, ttlMs: number) {
  cache.set(key, { data, expiry: Date.now() + ttlMs });
}

async function fetchJson<T>(endpoint: string, ttlMs = 60_000): Promise<T> {
  const cached = getCached<T>(endpoint);
  if (cached) return cached;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { Accept: "application/json" },
    // Next.js fetch caching
    next: { revalidate: ttlMs / 1000 },
  });

  if (!res.ok) {
    throw new Error(`Sleeper API error ${res.status}: ${endpoint}`);
  }

  const data = (await res.json()) as T;
  setCached(endpoint, data, ttlMs);
  return data;
}

export const sleeper = {
  // ── NFL State ──────────────────────────────────────────────
  getNFLState(): Promise<NFLState> {
    // Changes infrequently — cache 5 min
    return fetchJson<NFLState>("/state/nfl", 300_000);
  },

  // ── Users ──────────────────────────────────────────────────
  getUser(usernameOrId: string): Promise<SleeperUser> {
    return fetchJson<SleeperUser>(`/user/${usernameOrId}`, 60_000);
  },

  getUserLeagues(userId: string, season: string): Promise<SleeperLeague[]> {
    return fetchJson<SleeperLeague[]>(`/user/${userId}/leagues/nfl/${season}`, 60_000);
  },

  getUserDrafts(userId: string, season: string): Promise<SleeperDraft[]> {
    return fetchJson<SleeperDraft[]>(`/user/${userId}/drafts/nfl/${season}`, 60_000);
  },

  // ── Leagues ────────────────────────────────────────────────
  getLeague(leagueId: string): Promise<SleeperLeague> {
    return fetchJson<SleeperLeague>(`/league/${leagueId}`, 60_000);
  },

  getLeagueRosters(leagueId: string): Promise<SleeperRoster[]> {
    return fetchJson<SleeperRoster[]>(`/league/${leagueId}/rosters`, 60_000);
  },

  getLeagueUsers(leagueId: string): Promise<SleeperUser[]> {
    return fetchJson<SleeperUser[]>(`/league/${leagueId}/users`, 60_000);
  },

  getMatchups(leagueId: string, week: number): Promise<SleeperMatchup[]> {
    // During live games, cache shorter
    return fetchJson<SleeperMatchup[]>(`/league/${leagueId}/matchups/${week}`, 30_000);
  },

  getTransactions(leagueId: string, week: number): Promise<SleeperTransaction[]> {
    return fetchJson<SleeperTransaction[]>(`/league/${leagueId}/transactions/${week}`, 60_000);
  },

  getTradedPicks(leagueId: string): Promise<TradedPickImport[]> {
    return fetchJson<TradedPickImport[]>(`/league/${leagueId}/traded_picks`, 300_000);
  },

  getWinnersBracket(leagueId: string): Promise<BracketMatchup[]> {
    return fetchJson<BracketMatchup[]>(`/league/${leagueId}/winners_bracket`, 120_000);
  },

  getLosersBracket(leagueId: string): Promise<BracketMatchup[]> {
    return fetchJson<BracketMatchup[]>(`/league/${leagueId}/losers_bracket`, 120_000);
  },

  getLeagueDrafts(leagueId: string): Promise<SleeperDraft[]> {
    return fetchJson<SleeperDraft[]>(`/league/${leagueId}/drafts`, 300_000);
  },

  // ── Drafts ─────────────────────────────────────────────────
  getDraft(draftId: string): Promise<SleeperDraft> {
    return fetchJson<SleeperDraft>(`/draft/${draftId}`, 120_000);
  },

  getDraftPicks(draftId: string): Promise<DraftPick[]> {
    return fetchJson<DraftPick[]>(`/draft/${draftId}/picks`, 120_000);
  },

  getDraftTradedPicks(draftId: string): Promise<unknown[]> {
    return fetchJson<unknown[]>(`/draft/${draftId}/traded_picks`, 300_000);
  },

  // ── Player Database ────────────────────────────────────────
  // This is the big one — ~12K players, ~5MB. Cache aggressively.
  async getAllPlayers(): Promise<Record<string, SleeperPlayer>> {
    const cached = getCached<Record<string, SleeperPlayer>>("players:all");
    if (cached) return cached;

    const res = await fetch(`${BASE_URL}/players/nfl`, {
      next: { revalidate: 3600 }, // 1 hour
    });
    if (!res.ok) {
      throw new Error(`Sleeper API error ${res.status}: /players/nfl`);
    }
    const data = (await res.json()) as Record<string, SleeperPlayer>;
    // Cache for 1 hour — player DB updates infrequently
    setCached("players:all", data, 3_600_000);
    return data;
  },

  async getPlayer(playerId: string): Promise<SleeperPlayer | null> {
    const all = await this.getAllPlayers();
    return all[playerId] ?? null;
  },

  async searchPlayers(query: string, limit = 20): Promise<SleeperPlayer[]> {
    const all = await this.getAllPlayers();
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const results: { player: SleeperPlayer; score: number }[] = [];

    for (const player of Object.values(all)) {
      if (!player.active) continue;
      const name = player.search_full_name ?? player.full_name?.toLowerCase() ?? "";
      if (name.includes(q)) {
        // Exact starts-with gets highest score, then by search_rank (lower = more popular)
        let score = player.search_rank;
        if (name.startsWith(q)) score -= 1_000_000;
        results.push({ player, score });
      }
    }

    return results
      .sort((a, b) => a.score - b.score)
      .slice(0, limit)
      .map((r) => r.player);
  },

  // ── Trending ───────────────────────────────────────────────
  getTrending(type: "add" | "drop" = "add", lookbackHours = 24, limit = 25): Promise<TrendingPlayer[]> {
    return fetchJson<TrendingPlayer[]>(
      `/players/nfl/trending/${type}?lookback_hours=${lookbackHours}&limit=${limit}`,
      300_000, // 5 min
    );
  },

  // ── Batch helpers ──────────────────────────────────────────
  /**
   * Fetch full league context in parallel: league info, rosters, users, current week matchups.
   * Returns a rich object the frontend can consume directly.
   */
  async getLeagueContext(leagueId: string, week?: number) {
    const [league, rosters, users, state] = await Promise.all([
      this.getLeague(leagueId),
      this.getLeagueRosters(leagueId),
      this.getLeagueUsers(leagueId),
      this.getNFLState(),
    ]);

    const currentWeek = week ?? state.week;

    // Fetch matchups only if season has started
    const matchups = currentWeek > 0
      ? await this.getMatchups(leagueId, currentWeek).catch(() => [])
      : [];

    // Build roster_id -> user mapping
    const userByOwnerId = new Map<string, SleeperUser>();
    for (const user of users) {
      userByOwnerId.set(user.user_id, user);
    }

    // Enrich rosters with owner display info
    const enrichedRosters = rosters.map((roster) => {
      const owner = userByOwnerId.get(roster.owner_id);
      return {
        ...roster,
        owner_display_name: owner?.display_name ?? "Unknown",
        owner_team_name: owner?.metadata?.team_name ?? owner?.display_name ?? `Team ${roster.roster_id}`,
        owner_avatar: owner?.avatar ?? null,
      };
    });

    return {
      league,
      rosters: enrichedRosters,
      users,
      matchups,
      state,
      currentWeek,
    };
  },
};

// Internal type for traded picks import
interface TradedPickImport {
  season: string;
  round: number;
  roster_id: number;
  previous_owner_id: number;
  owner_id: number;
}
