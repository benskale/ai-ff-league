import Link from "next/link";
import { getActiveLeague } from "@/lib/leagueStore";
import { loadLeagueData } from "@/lib/sleeperAdapter";
import { teams as mockTeams, matchups as mockMatchups, myTeamId as mockMyTeamId, currentWeek as mockWeek } from "@/lib/mockData";
import type { RosterSlot } from "@/lib/types";

const posColor: Record<string, string> = {
  QB: "text-blue-400 bg-blue-500/15",
  RB: "text-field-bright bg-field-dim/20",
  WR: "text-orange-400 bg-orange-500/15",
  TE: "text-purple-400 bg-purple-500/15",
  K: "text-yellow-400 bg-yellow-500/15",
  DEF: "text-cyan-400 bg-cyan-500/15",
};

type Side = "me" | "opp" | "tie";

function advantageFor(myProj: number, oppProj: number): Side {
  const diff = myProj - oppProj;
  if (Math.abs(diff) < 0.75) return "tie";
  return diff > 0 ? "me" : "opp";
}

function advantageLabel(side: Side): { text: string; color: string } {
  if (side === "me") return { text: "Edge", color: "text-field-bright" };
  if (side === "opp") return { text: "Disadv.", color: "text-red-400" };
  return { text: "Even", color: "text-gray-500" };
}

export default async function MatchupPage() {
  const activeLeague = getActiveLeague();
  let teams = mockTeams;
  let matchups = mockMatchups;
  let myTeamId = mockMyTeamId;
  let currentWeek = mockWeek;
  let isLive = false;

  if (activeLeague) {
    try {
      const data = await loadLeagueData(activeLeague.leagueId, activeLeague.rosterId);
      teams = data.teams;
      matchups = data.matchups;
      myTeamId = data.myTeamId;
      currentWeek = data.currentWeek;
      isLive = true;
    } catch {
      // fallback
    }
  }

  const myTeam = teams.find((t) => t.id === myTeamId);
  if (!myTeam) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-bold text-white">Team not found</h1>
        <Link href="/" className="text-sm text-accent hover:text-accent-glow mt-4 inline-block">
          Back to home
        </Link>
      </div>
    );
  }

  const upcoming = matchups.find(
    (m) => m.homeTeamId === myTeamId || m.awayTeamId === myTeamId
  );
  const opponent = upcoming
    ? teams.find(
        (t) =>
          t.id ===
          (upcoming.homeTeamId === myTeamId
            ? upcoming.awayTeamId
            : upcoming.homeTeamId)
      )
    : null;

  if (!opponent) {
    return (
      <div className="space-y-6">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            {isLive ? `Week ${currentWeek}` : "Demo"} - Head to Head
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Matchup Preview</h1>
        </div>
        <div className="bg-ink-700 border border-ink-400 rounded-xl p-8 text-center">
          <div className="text-sm text-gray-500">
            {isLive && (currentWeek === 0 || currentWeek === 1)
              ? "Season hasn't started yet. Matchups will appear here once games begin."
              : "No upcoming matchup found. Check back when the next week's schedule is set."}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Points For", value: myTeam.pointsFor },
            { label: "Points Against", value: myTeam.pointsAgainst },
            { label: "Record", value: `${myTeam.wins}-${myTeam.losses}` },
            { label: "FAAB Left", value: myTeam.faab },
          ].map((stat) => (
            <div key={stat.label} className="bg-ink-700 border border-ink-400 rounded-xl p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                {stat.label}
              </div>
              <div className="text-lg font-mono font-bold text-white">
                {typeof stat.value === "number" ? stat.value.toFixed(1) : stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const myStarters = myTeam.roster.filter(
    (s) => s.slot !== "BENCH" && s.slot !== "BN" && s.player
  );
  const oppStarters = opponent.roster.filter(
    (s) => s.slot !== "BENCH" && s.slot !== "BN" && s.player
  );

  const myTotal = myStarters.reduce(
    (sum, s) => sum + (s.player?.projected ?? 0),
    0
  );
  const oppTotal = oppStarters.reduce(
    (sum, s) => sum + (s.player?.projected ?? 0),
    0
  );
  const totalDiff = myTotal - oppTotal;

  const slotOrder = ["QB", "RB1", "RB2", "RB", "WR1", "WR2", "WR", "TE", "FLEX", "D/ST", "DEF", "K"];
  const findPlayer = (slots: RosterSlot[], slot: string) =>
    slots.find((s) => s.slot === slot)?.player ?? null;

  let myWins = 0;
  let oppWins = 0;
  let ties = 0;

  // Build position comparison from available data
  const maxLen = Math.max(myStarters.length, oppStarters.length);
  const rows = Array.from({ length: maxLen }, (_, i) => {
    const me = myStarters[i]?.player ?? null;
    const opp = oppStarters[i]?.player ?? null;
    const side = me && opp ? advantageFor(me.projected, opp.projected) : "tie";
    if (side === "me") myWins++;
    else if (side === "opp") oppWins++;
    else ties++;
    return {
      slot: myStarters[i]?.slot ?? oppStarters[i]?.slot ?? `Slot ${i + 1}`,
      me,
      opp,
      side,
    };
  });

  const winProb = myWins + oppWins + ties > 0
    ? Math.round((myWins / (myWins + oppWins + ties)) * 100)
    : 50;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <div className="text-xs text-gray-500 uppercase tracking-wide">
          {isLive ? `Week ${currentWeek}` : `Week ${currentWeek}`} - Head to Head
        </div>
        <h1 className="text-2xl font-bold text-white mt-1">Matchup Preview</h1>
      </div>

      {/* Side-by-side team banner */}
      <div className="bg-ink-700 border border-ink-400 rounded-2xl p-6">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* My team */}
          <div className="flex-1 text-center min-w-0">
            <div
              className="w-2 h-10 sm:w-3 sm:h-12 rounded-full mx-auto mb-2"
              style={{ backgroundColor: myTeam.accentColor }}
            />
            <div className="text-sm sm:text-lg font-bold text-white truncate">{myTeam.name}</div>
            <div className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {myTeam.wins}-{myTeam.losses}
            </div>
          </div>

          {/* Center */}
          <div className="text-center px-2 sm:px-4 flex-shrink-0">
            <div className="text-[9px] sm:text-[10px] text-gray-600 uppercase tracking-wider mb-1">
              Roster PF
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span
                className="text-xl sm:text-2xl font-bold font-mono"
                style={{ color: myTeam.accentColor }}
              >
                {myTeam.pointsFor.toFixed(1)}
              </span>
              <span className="text-gray-700 text-sm">-</span>
              <span
                className="text-xl sm:text-2xl font-bold font-mono"
                style={{ color: opponent.accentColor }}
              >
                {opponent.pointsFor.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Opponent */}
          <div className="flex-1 text-center min-w-0">
            <div
              className="w-2 h-10 sm:w-3 sm:h-12 rounded-full mx-auto mb-2"
              style={{ backgroundColor: opponent.accentColor }}
            />
            <div className="text-sm sm:text-lg font-bold text-white truncate">{opponent.name}</div>
            <div className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {opponent.wins}-{opponent.losses}
            </div>
          </div>
        </div>

        {/* Win probability bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span style={{ color: myTeam.accentColor }}>
              {myTeam.name} - {winProb}%
            </span>
            <span style={{ color: opponent.accentColor }}>
              {100 - winProb}% - {opponent.name}
            </span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden flex bg-ink-600">
            <div
              className="h-full transition-all"
              style={{ width: `${winProb}%`, backgroundColor: myTeam.accentColor }}
            />
            <div
              className="h-full transition-all"
              style={{ width: `${100 - winProb}%`, backgroundColor: opponent.accentColor }}
            />
          </div>
        </div>
      </div>

      {/* Position-by-position */}
      {rows.length > 0 && (
        <div className="bg-ink-700 border border-ink-400 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-ink-400">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
              Position by Position
            </h2>
          </div>
          <div className="divide-y divide-ink-400/50">
            {rows.map(({ slot, me, opp, side }, idx) => {
              const label = advantageLabel(side);
              return (
                <div
                  key={`${slot}-${idx}`}
                  className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3"
                >
                  {/* My player */}
                  <div className="flex items-center justify-end gap-2 text-right min-w-0">
                    {me ? (
                      <>
                        <div className="min-w-0">
                          <div className={`text-xs sm:text-sm truncate ${side === "me" ? "text-white font-medium" : "text-gray-400"}`}>
                            {me.name}
                          </div>
                          <div className="text-xs text-gray-600">{me.nflTeam}</div>
                        </div>
                        <span className={`text-[9px] font-mono px-1 py-0.5 rounded ${posColor[me.pos] ?? posColor.DEF}`}>
                          {me.pos}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-700">Empty</span>
                    )}
                  </div>

                  {/* Center */}
                  <div className="flex flex-col items-center gap-1 px-0.5 flex-shrink-0">
                    <span className="text-[9px] font-mono text-gray-600">{slot}</span>
                    <span className={`text-[9px] font-mono ${label.color}`}>{label.text}</span>
                  </div>

                  {/* Opponent player */}
                  <div className="flex items-center gap-2 min-w-0">
                    {opp ? (
                      <>
                        <span className={`text-[9px] font-mono px-1 py-0.5 rounded ${posColor[opp.pos] ?? posColor.DEF}`}>
                          {opp.pos}
                        </span>
                        <div className="min-w-0">
                          <div className={`text-xs sm:text-sm truncate ${side === "opp" ? "text-white font-medium" : "text-gray-400"}`}>
                            {opp.name}
                          </div>
                          <div className="text-xs text-gray-600">{opp.nflTeam}</div>
                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-gray-700">Empty</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Season comparison */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Points For", me: myTeam.pointsFor, opp: opponent.pointsFor },
          { label: "Points Against", me: myTeam.pointsAgainst, opp: opponent.pointsAgainst },
          { label: "Win %", me: myTeam.wins / Math.max(myTeam.wins + myTeam.losses, 1) * 100, opp: opponent.wins / Math.max(opponent.wins + opponent.losses, 1) * 100 },
          { label: "FAAB Left", me: myTeam.faab, opp: opponent.faab },
        ].map((stat) => {
          const meBetter = stat.label === "Points Against" ? stat.me < stat.opp : stat.me > stat.opp;
          const fmt = (v: number) => stat.label === "Win %" ? `${v.toFixed(0)}%` : v.toFixed(1);
          return (
            <div key={stat.label} className="bg-ink-700 border border-ink-400 rounded-xl p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                {stat.label}
              </div>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <div className="text-lg font-mono font-bold" style={{ color: meBetter ? myTeam.accentColor : "#484f58" }}>
                    {fmt(stat.me)}
                  </div>
                  <div className="text-[10px] text-gray-600">You</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-mono font-bold" style={{ color: !meBetter ? opponent.accentColor : "#484f58" }}>
                    {fmt(stat.opp)}
                  </div>
                  <div className="text-[10px] text-gray-600">Opp</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Link href="/team" className="block text-center text-xs font-medium text-accent hover:text-accent-glow">
        Back to roster
      </Link>
    </div>
  );
}
