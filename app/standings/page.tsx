import { teams, matchups, myTeamId } from "@/lib/mockData";

export default function StandingsPage() {
  const sorted = [...teams].sort((a, b) => {
    const pctA = a.wins / (a.wins + a.losses);
    const pctB = b.wins / (b.wins + b.losses);
    if (pctB !== pctA) return pctB - pctA;
    return b.pointsFor - a.pointsFor;
  });

  const week6Matchups = matchups.filter((m) => m.week === 6);
  const week5Matchups = matchups.filter((m) => m.week === 5);

  return (
    <div className="space-y-8 fade-in pt-14 lg:pt-0">
      <div>
        <h1 className="text-2xl font-bold text-white">League Standings</h1>
        <p className="text-sm text-gray-500 mt-1">10 teams &middot; Week 6 of 14</p>
      </div>

      {/* Standings table */}
      <div className="bg-ink-700 border border-ink-400 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-400 text-xs text-gray-500 uppercase tracking-wide">
              <th className="text-left py-3 px-4">#</th>
              <th className="text-left py-3 px-2">Team</th>
              <th className="text-left py-3 px-2 hidden sm:table-cell">Agent</th>
              <th className="text-center py-3 px-2">W-L</th>
              <th className="text-center py-3 px-2 hidden sm:table-cell">PF</th>
              <th className="text-center py-3 px-2 hidden md:table-cell">PA</th>
              <th className="text-center py-3 px-2">Streak</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((team, idx) => {
              const isMe = team.id === myTeamId;
              const isPlayoff = idx < 6;
              return (
                <tr
                  key={team.id}
                  className={`border-b border-ink-400/50 transition-colors ${
                    isMe ? "bg-accent/5" : "hover:bg-ink-600/30"
                  }`}
                >
                  <td className="py-3 px-4">
                    <span className={`font-mono ${isPlayoff ? "text-field-bright" : "text-gray-600"}`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-8 rounded-full flex-shrink-0"
                        style={{ backgroundColor: team.accentColor }}
                      />
                      <div>
                        <div className={`font-medium ${isMe ? "text-white" : "text-gray-300"}`}>
                          {team.name}
                          {isMe && <span className="ml-2 text-xs text-accent-glow">YOU</span>}
                        </div>
                        <div className="text-xs text-gray-600 sm:hidden">{team.agentName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2 hidden sm:table-cell">
                    <span className="font-mono text-xs text-gray-500">{team.agentName}</span>
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-white">
                    {team.wins}-{team.losses}
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-gray-400 hidden sm:table-cell">
                    {team.pointsFor.toFixed(1)}
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-gray-500 hidden md:table-cell">
                    {team.pointsAgainst.toFixed(1)}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className={`font-mono text-xs ${
                      team.streak.startsWith("W") ? "text-field-bright" :
                      team.streak.startsWith("L") ? "text-red-400" : "text-gray-500"
                    }`}>
                      {team.streak}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="px-4 py-2 text-xs text-gray-600 border-t border-ink-400">
          Top 6 qualify for playoffs
        </div>
      </div>

      {/* Week 6 schedule */}
      <div>
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">Week 6 Schedule</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {week6Matchups.map((m) => {
            const home = teams.find((t) => t.id === m.homeTeamId)!;
            const away = teams.find((t) => t.id === m.awayTeamId)!;
            const involvesMe = m.homeTeamId === myTeamId || m.awayTeamId === myTeamId;
            return (
              <div
                key={`${m.week}-${m.homeTeamId}-${m.awayTeamId}`}
                className={`bg-ink-700 border rounded-lg p-4 ${
                  involvesMe ? "border-accent/30" : "border-ink-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-6 rounded-full" style={{ backgroundColor: away.accentColor }} />
                    <div>
                      <div className="text-sm text-white">{away.name}</div>
                      <div className="text-xs text-gray-600">{away.wins}-{away.losses}</div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600">@</span>
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="text-sm text-white text-right">{home.name}</div>
                      <div className="text-xs text-gray-600 text-right">{home.wins}-{home.losses}</div>
                    </div>
                    <div className="w-2 h-6 rounded-full" style={{ backgroundColor: home.accentColor }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Week 5 results */}
      <div>
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">Week 5 Results</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {week5Matchups.map((m) => {
            const home = teams.find((t) => t.id === m.homeTeamId)!;
            const away = teams.find((t) => t.id === m.awayTeamId)!;
            const homeWon = (m.homeScore ?? 0) > (m.awayScore ?? 0);
            const involvesMe = m.homeTeamId === myTeamId || m.awayTeamId === myTeamId;
            return (
              <div
                key={`w5-${m.homeTeamId}-${m.awayTeamId}`}
                className={`bg-ink-700 border rounded-lg p-4 ${
                  involvesMe ? "border-accent/30" : "border-ink-400"
                }`}
              >
                <div className="space-y-1">
                  <div className={`flex items-center justify-between ${homeWon ? "" : "opacity-50"}`}>
                    <span className="text-sm text-white">{home.name}</span>
                    <span className="font-mono text-sm text-white">{m.homeScore?.toFixed(1)}</span>
                  </div>
                  <div className={`${!homeWon ? "" : "opacity-50"} flex items-center justify-between`}>
                    <span className="text-sm text-gray-400">{away.name}</span>
                    <span className="font-mono text-sm text-gray-400">{m.awayScore?.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
