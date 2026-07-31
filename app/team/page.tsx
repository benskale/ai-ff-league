import Link from "next/link";
import { getActiveLeague } from "@/lib/leagueStore";
import { loadLeagueData } from "@/lib/sleeperAdapter";
import { teams as mockTeams, myTeamId as mockMyTeamId } from "@/lib/mockData";
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
            className={`text-xs font-mono font-bold w-10 text-center px-1.5 py-1.5 rounded border ${posColor[player.pos] ?? posColor.DEF}`}
          >
            {player.pos}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white truncate">
                {player.name}
              </span>
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
          <div className="text-lg font-bold font-mono text-gray-500">
            {player.projected.toFixed(1)}
          </div>
          <div className="text-[10px] text-gray-600 uppercase tracking-wide">
            Proj
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function TeamPage() {
  const activeLeague = getActiveLeague();
  let myTeam = mockTeams.find((t) => t.id === mockMyTeamId)!;
  let isLive = false;
  let currentWeek = 1;

  if (activeLeague) {
    try {
      const data = await loadLeagueData(activeLeague.leagueId, activeLeague.rosterId);
      const found = data.teams.find((t) => t.id === data.myTeamId);
      if (found) {
        myTeam = found;
        isLive = true;
        currentWeek = data.currentWeek;
      }
    } catch {
      // fallback
    }
  }

  const starters = myTeam.roster.filter((s) => s.slot !== "BENCH" && s.slot !== "BN");
  const bench = myTeam.roster.filter((s) => s.slot === "BENCH" || s.slot === "BN");
  const filledStarters = starters.filter((s) => s.player);
  const filledBench = bench.filter((s) => s.player);

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            {isLive ? `Week ${currentWeek} Roster` : "Demo Roster"}
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">{myTeam.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Owned by{" "}
            <span className="font-mono" style={{ color: myTeam.accentColor }}>
              {myTeam.ownerName}
            </span>
            {" · "}
            {myTeam.wins}-{myTeam.losses}
            {myTeam.ties > 0 ? `-${myTeam.ties}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 justify-center sm:justify-end">
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Roster Size
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {filledStarters.length + filledBench.length}
            </div>
          </div>
          <div className="w-px h-10 bg-ink-400" />
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              FAAB Left
            </div>
            <div className="text-2xl font-bold font-mono text-field-bright">
              ${myTeam.faab}
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
            {filledStarters.length} starters
          </span>
        </div>
        {filledStarters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {starters.map((slot, idx) =>
              slot.player ? (
                <PlayerCard
                  key={slot.player.id}
                  player={slot.player}
                  slot={slot.slot}
                  accentColor={myTeam.accentColor}
                />
              ) : (
                <div
                  key={`empty-${idx}`}
                  className="bg-ink-700/50 border border-ink-400/50 border-dashed rounded-xl p-4 flex items-center justify-center text-xs text-gray-600"
                >
                  Empty slot - {slot.slot}
                </div>
              )
            )}
          </div>
        ) : (
          <div className="bg-ink-700/50 border border-ink-400/50 border-dashed rounded-xl p-8 text-center text-sm text-gray-500">
            {isLive
              ? "Roster not set yet. The draft may not have completed."
              : "No starters in demo data."}
          </div>
        )}
      </div>

      {/* Bench */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
            Bench
          </h2>
          <span className="text-xs text-gray-600">{filledBench.length} players</span>
        </div>
        {filledBench.length > 0 ? (
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
        ) : (
          <div className="bg-ink-700/50 border border-ink-400/50 border-dashed rounded-xl p-6 text-center text-xs text-gray-600">
            No bench players
          </div>
        )}
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
          href="/standings"
          className="bg-ink-700 border border-ink-400 rounded-xl p-4 hover:border-accent/40 transition-colors text-center"
        >
          <div className="text-xs text-gray-400">Standings</div>
        </Link>
      </div>
    </div>
  );
}
