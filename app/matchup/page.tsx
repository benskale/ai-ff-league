import Link from "next/link";
import { teams, matchups, myTeamId, currentWeek } from "@/lib/mockData";
import type { Player, RosterSlot } from "@/lib/types";

const posColor: Record<string, string> = {
  QB: "text-blue-400 bg-blue-500/15",
  RB: "text-field-bright bg-field-dim/20",
  WR: "text-orange-400 bg-orange-500/15",
  TE: "text-purple-400 bg-purple-500/15",
  K: "text-yellow-400 bg-yellow-500/15",
  DEF: "text-cyan-400 bg-cyan-500/15",
};

// Demo opponent roster (only my team ships full roster data in mockData).
// Built to match Tensor Titans / DEEP BLUE 2's "heavy matchup-weighter" persona.
const opponentRoster: RosterSlot[] = [
  { slot: "QB", player: { id: "o1", name: "Jordan Love", pos: "QB", nflTeam: "GB", projected: 18.6, actual: null, status: "healthy", trending: "up" } },
  { slot: "RB1", player: { id: "o2", name: "Breece Hall", pos: "RB", nflTeam: "NYJ", projected: 18.4, actual: null, status: "healthy", trending: "up" } },
  { slot: "RB2", player: { id: "o3", name: "James Conner", pos: "RB", nflTeam: "ARI", projected: 13.2, actual: null, status: "healthy", trending: "flat" } },
  { slot: "WR1", player: { id: "o4", name: "Mike Evans", pos: "WR", nflTeam: "TB", projected: 15.6, actual: null, status: "healthy", trending: "flat" } },
  { slot: "WR2", player: { id: "o5", name: "Cooper Kupp", pos: "WR", nflTeam: "LAR", projected: 16.8, actual: null, status: "questionable", trending: "down" } },
  { slot: "TE", player: { id: "o6", name: "Trey McBride", pos: "TE", nflTeam: "ARI", projected: 9.8, actual: null, status: "healthy", trending: "up" } },
  { slot: "FLEX", player: { id: "o7", name: "Raheem Mostert", pos: "RB", nflTeam: "MIA", projected: 12.4, actual: null, status: "healthy", trending: "up" } },
  { slot: "D/ST", player: { id: "o8", name: "Bills D/ST", pos: "DEF", nflTeam: "BUF", projected: 9.0, actual: null, status: "healthy", trending: "flat" } },
  { slot: "K", player: { id: "o9", name: "Harrison Butker", pos: "K", nflTeam: "KC", projected: 9.6, actual: null, status: "healthy", trending: "flat" } },
];

type Side = "me" | "opp" | "tie";

function advantageFor(myProj: number, oppProj: number): Side {
  const diff = myProj - oppProj;
  if (Math.abs(diff) < 0.75) return "tie";
  return diff > 0 ? "me" : "opp";
}

function advantageLabel(side: Side): { text: string; color: string } {
  if (side === "me") return { text: "▲ Edge", color: "text-field-bright" };
  if (side === "opp") return { text: "▼ Disadv.", color: "text-red-400" };
  return { text: "≈ Even", color: "text-gray-500" };
}

export default function MatchupPage() {
  const myTeam = teams.find((t) => t.id === myTeamId)!;
  const upcoming = matchups.find(
    (m) =>
      m.status === "upcoming" &&
      (m.homeTeamId === myTeamId || m.awayTeamId === myTeamId)
  );
  const opponent = upcoming
    ? teams.find(
        (t) =>
          t.id ===
          (upcoming.homeTeamId === myTeamId
            ? upcoming.awayTeamId
            : upcoming.homeTeamId)
      )!
    : null;

  if (!opponent) {
    return (
      <div className="pt-14 lg:pt-0">
        <h1 className="text-2xl font-bold text-white">No upcoming matchup</h1>
        <p className="text-sm text-gray-500 mt-2">
          Check back when the next week&apos;s schedule is set.
        </p>
      </div>
    );
  }

  const myStarters = myTeam.roster.filter((s) => s.slot !== "BENCH");
  const oppStarters = opponentRoster.filter((s) => s.slot !== "BENCH");

  const myTotal = myStarters.reduce(
    (sum, s) => sum + (s.player?.projected ?? 0),
    0
  );
  const oppTotal = oppStarters.reduce(
    (sum, s) => sum + (s.player?.projected ?? 0),
    0
  );
  const totalDiff = myTotal - oppTotal;

  // Align slots position-by-position
  const slotOrder = ["QB", "RB1", "RB2", "WR1", "WR2", "TE", "FLEX", "D/ST", "K"];
  const findPlayer = (slots: RosterSlot[], slot: string) =>
    slots.find((s) => s.slot === slot)?.player ?? null;

  let myWins = 0;
  let oppWins = 0;
  let ties = 0;

  const rows = slotOrder.map((slot) => {
    const me = findPlayer(myStarters, slot);
    const opp = findPlayer(oppStarters, slot);
    const side =
      me && opp ? advantageFor(me.projected, opp.projected) : "tie";
    if (side === "me") myWins++;
    else if (side === "opp") oppWins++;
    else ties++;
    return { slot, me, opp, side };
  });

  const winProb = Math.round(
    (myWins / (myWins + oppWins + ties)) * 100
  );

  return (
    <div className="space-y-6 fade-in pt-14 lg:pt-0">
      {/* Header */}
      <div>
        <div className="text-xs text-gray-500 uppercase tracking-wide">
          Week {currentWeek} · Head to Head
        </div>
        <h1 className="text-2xl font-bold text-white mt-1">Matchup Preview</h1>
      </div>

      {/* Side-by-side team banner */}
      <div className="bg-ink-700 border border-ink-400 rounded-2xl p-6">
        <div className="flex items-center justify-between gap-4">
          {/* My team */}
          <div className="flex-1 text-center">
            <div
              className="w-3 h-12 rounded-full mx-auto mb-2"
              style={{ backgroundColor: myTeam.accentColor }}
            />
            <div className="text-lg font-bold text-white">{myTeam.name}</div>
            <div className="text-sm text-gray-500 mt-0.5">
              {myTeam.wins}-{myTeam.losses}
            </div>
            <div
              className="text-xs font-mono mt-1"
              style={{ color: myTeam.accentColor }}
            >
              {myTeam.agentName}
            </div>
          </div>

          {/* Center — projected */}
          <div className="text-center px-4">
            <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">
              Projected
            </div>
            <div className="flex items-center gap-3">
              <span
                className="text-2xl font-bold font-mono"
                style={{ color: myTeam.accentColor }}
              >
                {myTotal.toFixed(1)}
              </span>
              <span className="text-gray-700">-</span>
              <span
                className="text-2xl font-bold font-mono"
                style={{ color: opponent.accentColor }}
              >
                {oppTotal.toFixed(1)}
              </span>
            </div>
            <div
              className={`text-xs font-mono mt-1 ${
                totalDiff >= 0 ? "text-field-bright" : "text-red-400"
              }`}
            >
              {totalDiff >= 0 ? "+" : ""}
              {totalDiff.toFixed(1)} {totalDiff >= 0 ? "favored" : "underdog"}
            </div>
          </div>

          {/* Opponent */}
          <div className="flex-1 text-center">
            <div
              className="w-3 h-12 rounded-full mx-auto mb-2"
              style={{ backgroundColor: opponent.accentColor }}
            />
            <div className="text-lg font-bold text-white">{opponent.name}</div>
            <div className="text-sm text-gray-500 mt-0.5">
              {opponent.wins}-{opponent.losses}
            </div>
            <div
              className="text-xs font-mono mt-1"
              style={{ color: opponent.accentColor }}
            >
              {opponent.agentName}
            </div>
          </div>
        </div>

        {/* Win probability bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span style={{ color: myTeam.accentColor }}>
              {myTeam.name} · {winProb}%
            </span>
            <span style={{ color: opponent.accentColor }}>
              {100 - winProb}% · {opponent.name}
            </span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden flex bg-ink-600">
            <div
              className="h-full transition-all"
              style={{
                width: `${winProb}%`,
                backgroundColor: myTeam.accentColor,
              }}
            />
            <div
              className="h-full transition-all"
              style={{
                width: `${100 - winProb}%`,
                backgroundColor: opponent.accentColor,
              }}
            />
          </div>
          <div className="flex items-center justify-center gap-6 mt-3 text-xs">
            <span className="text-field-bright font-mono">
              {myWins} edges
            </span>
            <span className="text-gray-600 font-mono">{ties} even</span>
            <span className="text-red-400 font-mono">
              {oppWins} disadv.
            </span>
          </div>
        </div>
      </div>

      {/* Position-by-position */}
      <div className="bg-ink-700 border border-ink-400 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-ink-400">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
            Position by Position
          </h2>
        </div>
        <div className="divide-y divide-ink-400/50">
          {rows.map(({ slot, me, opp, side }) => {
            const label = advantageLabel(side);
            return (
              <div
                key={slot}
                className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3"
              >
                {/* My player */}
                <div className="flex items-center justify-end gap-2 text-right">
                  {me ? (
                    <>
                      <div>
                        <div
                          className={`text-sm ${
                            side === "me" ? "text-white font-medium" : "text-gray-400"
                          }`}
                        >
                          {me.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {me.nflTeam}
                        </div>
                      </div>
                      <div
                        className={`text-sm font-mono font-bold w-12 text-right ${
                          side === "me" ? "text-white" : "text-gray-500"
                        }`}
                      >
                        {me.projected.toFixed(1)}
                      </div>
                    </>
                  ) : (
                    <span className="text-xs text-gray-700">Empty</span>
                  )}
                </div>

                {/* Center slot */}
                <div className="flex flex-col items-center gap-1 px-1">
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      posColor[me?.pos ?? "QB"] ?? "bg-gray-500/15 text-gray-400"
                    }`}
                  >
                    {slot}
                  </span>
                  <span className={`text-[10px] font-mono ${label.color}`}>
                    {label.text}
                  </span>
                </div>

                {/* Opponent player */}
                <div className="flex items-center gap-2">
                  {opp ? (
                    <>
                      <div
                        className={`text-sm font-mono font-bold w-12 ${
                          side === "opp" ? "text-white" : "text-gray-500"
                        }`}
                      >
                        {opp.projected.toFixed(1)}
                      </div>
                      <div>
                        <div
                          className={`text-sm ${
                            side === "opp"
                              ? "text-white font-medium"
                              : "text-gray-400"
                          }`}
                        >
                          {opp.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {opp.nflTeam}
                        </div>
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
        <div className="px-4 py-2.5 border-t border-ink-400 text-xs text-gray-600">
          Edge = projected difference of 0.75+ points
        </div>
      </div>

      {/* Season comparison */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Points For", me: myTeam.pointsFor, opp: opponent.pointsFor },
          {
            label: "Points Against",
            me: myTeam.pointsAgainst,
            opp: opponent.pointsAgainst,
          },
          { label: "Win %", me: myTeam.wins / (myTeam.wins + myTeam.losses) * 100, opp: opponent.wins / (opponent.wins + opponent.losses) * 100 },
          { label: "FAAB Left", me: myTeam.faab, opp: opponent.faab },
        ].map((stat) => {
          const meBetter =
            stat.label === "Points Against"
              ? stat.me < stat.opp
              : stat.me > stat.opp;
          const fmt = (v: number) =>
            stat.label === "Win %" ? `${v.toFixed(0)}%` : v.toFixed(1);
          return (
            <div
              key={stat.label}
              className="bg-ink-700 border border-ink-400 rounded-xl p-4"
            >
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                {stat.label}
              </div>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <div
                    className="text-lg font-mono font-bold"
                    style={{
                      color: meBetter ? myTeam.accentColor : "#484f58",
                    }}
                  >
                    {fmt(stat.me)}
                  </div>
                  <div className="text-[10px] text-gray-600">You</div>
                </div>
                <div className="text-right">
                  <div
                    className="text-lg font-mono font-bold"
                    style={{
                      color: !meBetter ? opponent.accentColor : "#484f58",
                    }}
                  >
                    {fmt(stat.opp)}
                  </div>
                  <div className="text-[10px] text-gray-600">Opp</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Link
        href="/team"
        className="block text-center text-xs font-medium text-accent hover:text-accent-glow"
      >
        ← Back to roster
      </Link>
    </div>
  );
}
