import { teams, myTeamId } from "@/lib/mockData";

const posColor: Record<string, string> = {
  QB: "text-blue-400 bg-blue-500/15",
  RB: "text-field-bright bg-field-dim/20",
  WR: "text-orange-400 bg-orange-500/15",
  TE: "text-purple-400 bg-purple-500/15",
  K: "text-yellow-400 bg-yellow-500/15",
  DEF: "text-cyan-400 bg-cyan-500/15",
};

export default function RosterPage() {
  const myTeam = teams.find((t) => t.id === myTeamId)!;
  const starters = myTeam.roster.filter((s) => s.slot !== "BENCH");
  const bench = myTeam.roster.filter((s) => s.slot === "BENCH");

  const totalProjected = starters.reduce((sum, s) => sum + (s.player?.projected ?? 0), 0);
  const totalActual = starters.reduce((sum, s) => sum + (s.player?.actual ?? 0), 0);

  const renderPlayerRow = (slot: typeof starters[0]) => {
    const p = slot.player!;
    return (
      <div key={p.id} className="flex items-center gap-3 py-2.5 border-b border-ink-400/50 last:border-0">
        <span className={`text-xs font-mono font-bold w-8 text-center px-1.5 py-1 rounded ${posColor[p.pos] || "text-gray-400 bg-gray-500/15"}`}>
          {p.pos}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white truncate">{p.name}</span>
            {p.trending === "up" && <span className="text-xs text-field-bright">▲</span>}
            {p.trending === "down" && <span className="text-xs text-red-400">▼</span>}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-500">{p.nflTeam}</span>
            {p.status && p.status !== "healthy" && (
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                p.status === "questionable" ? "bg-yellow-500/20 text-yellow-400" :
                "bg-red-500/20 text-red-400"
              }`}>
                {p.status?.toUpperCase()}
              </span>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-xs text-gray-600">Proj / Act</div>
          <div className="font-mono text-sm">
            <span className="text-gray-400">{p.projected.toFixed(1)}</span>
            <span className="text-gray-700 mx-1">/</span>
            <span className={p.actual != null ? "text-white" : "text-gray-700"}>
              {p.actual != null ? p.actual.toFixed(1) : "--"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{myTeam.name} Roster</h1>
          <p className="text-sm text-gray-500 mt-1">Managed by {myTeam.agentName}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Week 6 Projection</div>
          <div className="text-2xl font-bold font-mono text-white">{totalProjected.toFixed(1)}</div>
        </div>
      </div>

      {/* Starters */}
      <div className="bg-ink-700 border border-ink-400 rounded-xl p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Starting Lineup</h2>
          <span className="text-xs text-gray-500 font-mono">
            Actual: {totalActual > 0 ? totalActual.toFixed(1) : "—"}
          </span>
        </div>
        {starters.map((slot) => (
          <div key={slot.slot}>
            <div className="text-[10px] text-gray-600 uppercase tracking-wider mt-3 mb-0.5">{slot.slot}</div>
            {renderPlayerRow(slot)}
          </div>
        ))}
      </div>

      {/* Bench */}
      <div className="bg-ink-700 border border-ink-400 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-2">Bench</h2>
        {bench.map((slot) => (
          <div key={slot.player!.id}>
            <div className="text-[10px] text-gray-600 uppercase tracking-wider mt-3 mb-0.5">{slot.slot}</div>
            {renderPlayerRow(slot)}
          </div>
        ))}
      </div>

      {/* Depth chart visualization */}
      <div className="bg-ink-700 border border-ink-400 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Positional Depth</h2>
        <div className="space-y-3">
          {["QB", "RB", "WR", "TE"].map((pos) => {
            const players = myTeam.roster
              .filter((s) => s.player?.pos === pos)
              .sort((a, b) => (b.player!.projected - a.player!.projected));
            return (
              <div key={pos}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${posColor[pos]}`}>
                    {pos}
                  </span>
                  <span className="text-xs text-gray-500">{players.length} on roster</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {players.map((s) => (
                    <div key={s.player!.id} className="bg-ink-600/50 rounded-lg px-3 py-1.5">
                      <span className="text-xs text-gray-300">{s.player!.name}</span>
                      <span className="text-xs text-gray-600 ml-2 font-mono">{s.player!.projected.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
