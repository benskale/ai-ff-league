import { getActiveLeague } from "@/lib/leagueStore";
import { loadLeagueData } from "@/lib/sleeperAdapter";
import { teams as mockTeams, myTeamId as mockMyTeamId } from "@/lib/mockData";

export default async function StandingsPage() {
  const activeLeague = getActiveLeague();
  let teams = mockTeams;
  let myTeamId = mockMyTeamId;
  let leagueName = "Demo League";
  let isLive = false;

  if (activeLeague) {
    try {
      const data = await loadLeagueData(activeLeague.leagueId, activeLeague.rosterId);
      teams = data.teams;
      myTeamId = data.myTeamId;
      leagueName = data.league.name;
      isLive = true;
    } catch {
      // fallback to mock
    }
  }

  const sorted = [...teams].sort((a, b) => {
    const pctA = a.wins / Math.max(a.wins + a.losses + a.ties, 1);
    const pctB = b.wins / Math.max(b.wins + b.losses + b.ties, 1);
    if (pctB !== pctA) return pctB - pctA;
    return b.pointsFor - a.pointsFor;
  });

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <div className="text-xs text-gray-500 uppercase tracking-wide">
          {isLive ? "Live from Sleeper" : "Demo Data"}
        </div>
        <h1 className="text-2xl font-bold text-white mt-1">Standings</h1>
        <p className="text-sm text-gray-500 mt-0.5">{leagueName}</p>
      </div>

      {/* Standings table */}
      <div className="bg-ink-700 border border-ink-400 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-400 text-xs text-gray-500 uppercase tracking-wide">
              <th className="text-left py-3 px-3 sm:px-4">Rank</th>
              <th className="text-left py-3 px-2">Team</th>
              <th className="text-center py-3 px-2">Record</th>
              <th className="text-center py-3 px-2 hidden sm:table-cell">PCT</th>
              <th className="text-center py-3 px-2">PF</th>
              <th className="text-center py-3 px-2 hidden sm:table-cell">PA</th>
              <th className="text-center py-3 px-2 hidden md:table-cell">Streak</th>
              <th className="text-center py-3 px-2 hidden md:table-cell">Waiver</th>
              <th className="text-center py-3 px-2 hidden lg:table-cell">FAAB</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((team, idx) => {
              const isMe = team.id === myTeamId;
              const totalGames = team.wins + team.losses + team.ties;
              const pct = totalGames > 0 ? ((team.wins + team.ties * 0.5) / totalGames) : 0;
              return (
                <tr
                  key={team.id}
                  className={`border-b border-ink-400/50 transition-colors ${
                    isMe ? "bg-accent/5" : "hover:bg-ink-600/30"
                  }`}
                >
                  <td className="py-3 px-3 sm:px-4">
                    <span className="font-mono text-gray-500 font-bold">{idx + 1}</span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-1.5 h-9 rounded-full flex-shrink-0"
                        style={{ backgroundColor: team.accentColor }}
                      />
                      <div>
                        <div
                          className={`font-medium ${
                            isMe ? "text-white" : "text-gray-300"
                          }`}
                        >
                          {team.name}
                          {isMe && (
                            <span className="ml-2 text-[10px] font-bold text-accent-glow uppercase">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600">
                          {team.ownerName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-white">
                    {team.wins}-{team.losses}
                    {team.ties > 0 ? `-${team.ties}` : ""}
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-gray-500 hidden sm:table-cell">
                    {totalGames > 0 ? pct.toFixed(3).replace(/^0/, "") : "-"}
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-gray-300">
                    {team.pointsFor.toFixed(1)}
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-gray-500 hidden sm:table-cell">
                    {team.pointsAgainst.toFixed(1)}
                  </td>
                  <td className="py-3 px-2 text-center hidden md:table-cell">
                    <span
                      className={`font-mono text-xs ${
                        team.streak.startsWith("W")
                          ? "text-field-bright"
                          : team.streak.startsWith("L")
                          ? "text-red-400"
                          : "text-gray-500"
                      }`}
                    >
                      {team.streak}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-gray-500 hidden md:table-cell">
                    {team.waiverPriority > 0 ? `#${team.waiverPriority}` : "-"}
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-gray-400 hidden lg:table-cell">
                    ${team.faab}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Division leaders (top 4) */}
      <div>
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
          Playoff Picture (Top 4)
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {sorted.slice(0, 4).map((team, idx) => {
            const isMe = team.id === myTeamId;
            return (
              <div
                key={team.id}
                className={`rounded-xl p-4 border-2 ${
                  isMe
                    ? "border-accent/40 bg-accent/5"
                    : "border-ink-400 bg-ink-700"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-gray-600">#{idx + 1}</span>
                  <div
                    className="w-2 h-6 rounded-full"
                    style={{ backgroundColor: team.accentColor }}
                  />
                </div>
                <div className="text-sm font-medium text-white truncate">
                  {team.name}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {team.wins}-{team.losses} - {team.pointsFor.toFixed(1)} PF
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
