import { cookies } from "next/headers";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

// League persistence layer.
// On Vercel (serverless), we use cookies because the filesystem is ephemeral.
// For local dev, we also write to .data/ as backup.

export interface ActiveLeague {
  leagueId: string;
  leagueName: string;
  rosterId: number;
  ownerName: string;
  season: string;
}

const DATA_DIR = join(process.cwd(), ".data");
const LEAGUE_FILE = join(DATA_DIR, "active-league.json");

/**
 * Read active league from cookies (works on Vercel) with file fallback (local dev).
 */
export function getActiveLeague(): ActiveLeague | null {
  // Try cookies first (Vercel)
  try {
    const cookieStore = cookies();
    const leagueId = cookieStore.get("ff-league-id")?.value;
    const rosterId = cookieStore.get("ff-roster-id")?.value;
    if (leagueId && rosterId) {
      return {
        leagueId,
        leagueName: cookieStore.get("ff-league-name")?.value || "",
        rosterId: parseInt(rosterId, 10),
        ownerName: cookieStore.get("ff-owner-name")?.value || "",
        season: cookieStore.get("ff-season")?.value || new Date().getFullYear().toString(),
      };
    }
  } catch {
    // cookies() not available in this context (API route uses NextResponse.cookies)
  }

  // File fallback (local dev)
  if (existsSync(LEAGUE_FILE)) {
    try {
      const data = JSON.parse(readFileSync(LEAGUE_FILE, "utf-8"));
      if (data.leagueId && data.rosterId) return data as ActiveLeague;
    } catch {
      // ignore
    }
  }

  return null;
}

/**
 * Save active league to local file (for local dev).
 * On Vercel, cookies are set by the API route instead.
 */
export function setActiveLeague(league: ActiveLeague): void {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(LEAGUE_FILE, JSON.stringify(league, null, 2));
}

export function clearActiveLeague(): void {
  if (existsSync(LEAGUE_FILE)) {
    writeFileSync(LEAGUE_FILE, JSON.stringify({}));
  }
}
