import Link from "next/link";
import { teams, myTeamId } from "@/lib/mockData";
import type { Player } from "@/lib/types";

const posColor: Record<string, string> = {
  QB: "text-blue-400 bg-blue-500/15 border-blue-500/20",
  RB: "text-field-bright bg-field-dim/20 border-field-dim/20",
  WR: "text-orange-400 bg-orange-500/15 border-orange-500/20",
  TE: "text-purple-400 bg-purple-500/15 border-purple-500/20",
  K: "text-yellow-400 bg-yellow-500/15 border-yellow-500/20",
  DEF: "text-cyan-400 bg-cyan-500/15 border-cyan-500/20",
};

function statusBadge(status?: string) {
  if (!status || status === "healthy") return null;
  const cls =
    status === "questionable"
      ? "bg-yellow-500/20 text-yellow-400"
      : status === "out" || status === "IR"
      ? "bg-red-500/20 text-red-400"
      : "bg-gray-500/20 text-gray-400";
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${cls}`}>
      {status.toUpperCase()}
    </span>
  );
}

function trendIcon(trend?: string) {
  if (trend === "up")
    return <span className="text-xs text-field-bright">▲</span>;
  if (trend === "down")
    return <span className="text-xs text-red-400">▼</span>;
  return <span className="text-xs text-gray-600">—</span>;
}

function PlayerCard({
  player,
  slot,
  accentColor,
}: {
  player: Player;
  slot: string;
  accentColor: string;
}) {
  return (
    <div
      className="bg-ink-700 border border-ink-400 rounded-xl p-4 hover:border-ink-300 transition-colors"
      style={{ borderLeftColor: accentColor, borderLeftWidth: 3 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`text-xs font-mono font-bold w-10 text-center px-1.5 py-1.5 rounded border ${posColor[player.pos]}`}
          >
            {player.pos}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white truncate">
                {player.name}
              </span>
              {trendIcon(player.trending)}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-500">{player.nflTeam}</span>
              <span className="text-xs text-gray-700">·</span>
              <span className="text-[10px] text-gray-600 uppercase tracking-wide">
                {slot}
              </span>
              {statusBadge(player.status)}
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-bold font-mono text-white">
            {player.projected.toFixed(1)}
          </div>
          <div className="text-[10px] text-gray-600 uppercase tracking-wide">
            Proj
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink-400/50">
        <div>
          <div className="text-[10px] text-gray-600 uppercase tracking-wide">
            Last Score
          </div>
          <div
            className={`text-sm font-mono ${
              player.actual != null ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {player.actual != null ? player.actual.toFixed(1) : "—"}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-gray-600 uppercase tracking-wide">
            Trend
          </div>
          <div
            className={`text-sm font-mono ${
              player.trending === "up"
                ? "text-field-bright"
                : player.trending === "down"
                ? "text-red-400"
                : "text-gray-500"
            }`}
          >
            {player.trending === "up"
              ? "Rising"
              : player.trending === "down"
              ? "Falling"
              : "Steady"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const myTeam = teams.find((t) => t.id === myTeamId)!;
  const starters = myTeam.roster.filter((s) => s.slot !== "BENCH");
  const bench = myTeam.roster.filter((s) => s.slot === "BENCH");

  const totalProjected = starters.reduce(
    (sum, s) => sum + (s.player?.projected ?? 0),
    0
  );
  const totalActual = starters.reduce(
    (sum, s) => sum + (s.player?.actual ?? 0),
    0
  );

  // Group bench by position for depth chart
  const benchByPos = (["QB", "RB", "WR", "TE", "K", "DEF"] as const).map(
    (pos) => ({
      pos,
      players: bench.filter((s) => s.player?.pos === pos),
    })
  );

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{myTeam.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Roster managed by{" "}
            <span
              className="font-mono"
              style={{ color: myTeam.accentColor }}
            >
              {myTeam.agentName}
            </span>{" "}
            · {myTeam.agentPersona}
          </p>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 justify-center sm:justify-end">
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Week 6 Proj
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {totalProjected.toFixed(1)}
            </div>
          </div>
          <div className="w-px h-10 bg-ink-400" />
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Week 5 Actual
            </div>
            <div className="text-2xl font-bold font-mono text-field-bright">
              {totalActual.toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Starting lineup */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
            Starting Lineup
          </h2>
          <span className="text-xs text-gray-600">
            {starters.length} starters
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {starters.map((slot) =>
            slot.player ? (
              <PlayerCard
                key={slot.player.id}
                player={slot.player}
                slot={slot.slot}
                accentColor={myTeam.accentColor}
              />
            ) : null
          )}
        </div>
      </div>

      {/* Bench */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
            Bench
          </h2>
          <span className="text-xs text-gray-600">{bench.length} players</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {bench.map((slot) =>
            slot.player ? (
              <PlayerCard
                key={slot.player.id}
                player={slot.player}
                slot={slot.slot}
                accentColor="#484f58"
              />
            ) : null
          )}
        </div>
      </div>

      {/* Positional depth */}
      <div className="bg-ink-700 border border-ink-400 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">
          Positional Depth
        </h2>
        <div className="space-y-3">
          {(["QB", "RB", "WR", "TE", "K", "DEF"] as const).map((pos) => {
            const players = myTeam.roster
              .filter((s) => s.player?.pos === pos)
              .sort((a, b) => b.player!.projected - a.player!.projected);
            if (players.length === 0) return null;
            return (
              <div key={pos}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${posColor[pos]}`}
                  >
                    {pos}
                  </span>
                  <span className="text-xs text-gray-500">
                    {players.length} on roster
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {players.map((s) => (
                    <div
                      key={s.player!.id}
                      className="bg-ink-600/50 rounded-lg px-3 py-1.5 border border-ink-400/50"
                    >
                      <span className="text-xs text-gray-300">
                        {s.player!.name}
                      </span>
                      <span className="text-xs text-gray-600 ml-2 font-mono">
                        {s.player!.projected.toFixed(1)}
                      </span>
                      {s.slot === "BENCH" && (
                        <span className="text-[10px] text-gray-700 ml-1.5">
                          BENCH
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Link
          href="/matchup"
          className="bg-ink-700 border border-ink-400 rounded-xl p-4 hover:border-accent/40 transition-colors text-center"
        >
          <div className="text-xs text-gray-400">View Matchup</div>
        </Link>
        <Link
          href="/free-agents"
          className="bg-ink-700 border border-ink-400 rounded-xl p-4 hover:border-accent/40 transition-colors text-center"
        >
          <div className="text-xs text-gray-400">Waiver Wire</div>
        </Link>
        <Link
          href="/strategy"
          className="bg-ink-700 border border-ink-400 rounded-xl p-4 hover:border-accent/40 transition-colors text-center"
        >
          <div className="text-xs text-gray-400">Strategy Dials</div>
        </Link>
      </div>
    </div>
  );
}
