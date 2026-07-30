import { draftPicks } from "@/lib/mockData";

export default function DraftPage() {
  const totalRounds = 2;
  const teamsPerRound = 10;

  return (
    <div className="space-y-6 fade-in pt-14 lg:pt-0">
      <div>
        <h1 className="text-2xl font-bold text-white">Draft Board</h1>
        <p className="text-sm text-gray-500 mt-1">
          Every pick with agent reasoning &middot; {draftPicks.length} total selections shown
        </p>
      </div>

      {/* Round tabs */}
      <div className="flex gap-2">
        {[1, 2].map((r) => (
          <button
            key={r}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              r === 1 ? "bg-ink-600 text-white border border-ink-300" : "bg-ink-700 text-gray-400 border border-ink-400 hover:text-white"
            }`}
          >
            Round {r}
          </button>
        ))}
      </div>

      {/* Draft grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px] space-y-3">
          {Array.from({ length: totalRounds }, (_, roundIdx) => {
            const round = roundIdx + 1;
            const picks = draftPicks.filter((p) => p.round === round);
            const isSnake = round % 2 === 0;
            const orderedPicks = isSnake ? [...picks].reverse() : picks;

            return (
              <div key={round}>
                <div className="text-xs text-gray-600 uppercase tracking-wider mb-2">
                  Round {round} {isSnake && "(snake)"}
                </div>
                <div className="grid grid-cols-[auto_1fr_1fr] gap-x-4 gap-y-2 bg-ink-700 border border-ink-400 rounded-xl p-4">
                  {orderedPicks.map((pick) => (
                    <div key={pick.overall} className="contents">
                      <div className="flex items-center gap-2 py-2">
                        <span className="text-xs font-mono text-gray-500 w-8">#{pick.overall}</span>
                      </div>
                      <div className="py-2 pr-3 border-r border-ink-400">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-mono font-bold w-7 ${pick.player.pos === "QB" ? "text-blue-400" : pick.player.pos === "RB" ? "text-field-bright" : pick.player.pos === "WR" ? "text-orange-400" : "text-purple-400"}`}>
                            {pick.player.pos}
                          </span>
                          <span className="text-sm text-white font-medium">{pick.player.name}</span>
                          <span className="text-xs text-gray-500">{pick.player.nflTeam}</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5">{pick.teamName}</div>
                      </div>
                      <div className="py-2 pl-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">Confidence</span>
                          <div className="flex-1 h-1 bg-ink-400 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pick.confidence >= 90 ? "bg-field-bright" :
                                pick.confidence >= 80 ? "bg-field-dim" :
                                pick.confidence >= 70 ? "bg-yellow-500" :
                                "bg-orange-500"
                              }`}
                              style={{ width: `${pick.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono text-gray-400 w-8">{pick.confidence}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {pick.reachOrValue === "value" && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-field-dim/30 text-field-bright font-medium">VALUE</span>
                          )}
                          {pick.reachOrValue === "reach" && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-medium">REACH</span>
                          )}
                          <p className="text-xs text-gray-500 line-clamp-2">{pick.reasoning}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Best value picks */}
      <div>
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">Best Value Picks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {draftPicks
            .filter((p) => p.reachOrValue === "value")
            .slice(0, 3)
            .map((pick) => (
              <div key={pick.overall} className="bg-ink-700 border border-field-dim/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-field-dim/30 text-field-bright font-medium">VALUE</span>
                  <span className="text-xs text-gray-500">Pick #{pick.overall}</span>
                </div>
                <div className="text-sm font-medium text-white">{pick.player.name}</div>
                <div className="text-xs text-gray-500">{pick.player.pos} &middot; {pick.player.nflTeam}</div>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">{pick.reasoning}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
