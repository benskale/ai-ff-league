import Link from "next/link";
import { getActiveLeague } from "@/lib/leagueStore";
import { loadLeagueData } from "@/lib/sleeperAdapter";
import LeagueConnect from "@/components/LeagueConnect";
import { teams, decisions, matchups, myTeamId, currentWeek } from "@/lib/mockData";

const typeMeta: Record<string, { color: string; bg: string; label: string }> = {
  draft: { color: "text-gray-400", bg: "bg-gray-500/20", label: "DRAFT" },
  lineup: { color: "text-blue-400", bg: "bg-blue-500/20", label: "LINEUP" },
  waiver: { color: "text-field-bright", bg: "bg-field-dim/30", label: "WAIVER" },
  trade: { color: "text-orange-400", bg: "bg-orange-500/20", label: "TRADE" },
  strategy: { color: "text-accent-glow", bg: "bg-accent/20", label: "STRATEGY" },
};

export default async function HomePage() {
  const activeLeague = getActiveLeague();

  // No league connected: show connect UI
  if (!activeLeague) {
    return <LeagueConnect />;
  }

  let data;
  let useFallback = false;

  try {
    data = await loadLeagueData(activeLeague.leagueId, activeLeague.rosterId);
  } catch {
    // If Sleeper API fails, fall back to mock data
    useFallback = true;
  }

  if (useFallback || !data) {
    return <FallbackHome />;
  }

  const { teams, currentWeek, matchups, myTeamId } = data;
  const myTeam = teams.find((t) => t.id === myTeamId);
  if (!myTeam) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-bold text-white">Team not found</h1>
        <p className="text-sm text-gray-500 mt-2">
          Roster ID {activeLeague.rosterId} not found in this league.
        </p>
        <Link href="/setup" className="text-sm text-accent hover:text-accent-glow mt-4 inline-block">
          Reconnect league ->
        </Link>
      </div>
    );
  }

  const upcomingMatchup = matchups.find(
    (m) => m.homeTeamId === myTeamId || m.awayTeamId === myTeamId
  );
  const opponent = upcomingMatchup
    ? teams.find(
        (t) =>
          t.id ===
          (upcomingMatchup.homeTeamId === myTeamId
            ? upcomingMatchup.awayTeamId
            : upcomingMatchup.homeTeamId)
      )
    : null;

  const sortedTeams = [...teams].sort((a, b) => {
    const pctA = a.wins / Math.max(a.wins + a.losses + a.ties, 1);
    const pctB = b.wins / Math.max(b.wins + b.losses + b.ties, 1);
    if (pctB !== pctA) return pctB - pctA;
    return b.pointsFor - a.pointsFor;
  });
  const myRank = sortedTeams.findIndex((t) => t.id === myTeamId) + 1;
  const injuredPlayers = myTeam.roster.filter(
    (s) => s.player?.status && s.player.status !== "healthy"
  );
  const isPreseason = data.state.week === 0 || data.state.season_type === "pre";

  return (
    <div className="space-y-6 fade-in sm:space-y-8">
      {/* Hero card */}
      <div
        className="rounded-2xl border border-ink-400 overflow-hidden relative"
        style={{
          background: `linear-gradient(135deg, ${myTeam.accentColor}22 0%, #161b22 55%, #0d1117 100%)`,
        }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5"
          style={{ backgroundColor: myTeam.accentColor }}
        />
        <div className="p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                {isPreseason ? "Preseason" : `Week ${currentWeek}`} - {data.league.name}
              </div>
              <h1 className="text-3xl font-bold text-white">{myTeam.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="font-mono text-sm"
                  style={{ color: myTeam.accentColor }}
                >
                  {myTeam.ownerName}
                </span>
                <span className="text-gray-600">-</span>
                <span className="text-sm text-gray-500">{activeLeague.leagueName}</span>
              </div>
            </div>
            <div className="flex items-center justify-center sm:justify-end gap-4 sm:gap-6 sm:gap-8">
              <div>
                <div className="text-3xl font-bold text-white">
                  {myTeam.wins}-{myTeam.losses}
                  {myTeam.ties > 0 ? `-${myTeam.ties}` : ""}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">
                  Record
                </div>
              </div>
              <div className="w-px h-12 bg-ink-400" />
              <div>
                <div
                  className="text-3xl font-bold"
                  style={{ color: myTeam.accentColor }}
                >
                  #{myRank}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">
                  Rank
                </div>
              </div>
              <div className="w-px h-12 bg-ink-400" />
              <div>
                <div className="text-3xl font-bold text-field-bright">
                  {myTeam.streak}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">
                  Streak
                </div>
              </div>
            </div>
          </div>
          {/* Quick stat strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="bg-ink-800/60 rounded-lg px-4 py-3 border border-ink-400/50">
              <div className="text-lg font-mono font-bold text-white">
                {myTeam.pointsFor.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">Points For</div>
            </div>
            <div className="bg-ink-800/60 rounded-lg px-4 py-3 border border-ink-400/50">
              <div className="text-lg font-mono font-bold text-gray-400">
                {myTeam.pointsAgainst.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">Points Against</div>
            </div>
            <div className="bg-ink-800/60 rounded-lg px-4 py-3 border border-ink-400/50">
              <div className="text-lg font-mono font-bold text-white">
                ${myTeam.faab}
              </div>
              <div className="text-xs text-gray-500">FAAB Left</div>
            </div>
            <div className="bg-ink-800/60 rounded-lg px-4 py-3 border border-ink-400/50">
              <div className="text-lg font-mono font-bold text-white">
                #{myTeam.waiverPriority}
              </div>
              <div className="text-xs text-gray-500">Waiver Priority</div>
            </div>
          </div>
        </div>
      </div>

      {/* Agent status + Matchup teaser */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent status */}
        <div className="lg:col-span-2 bg-ink-700 border border-ink-400 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
              Agent Status
            </h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-field-bright live-dot" />
              <span className="text-xs text-field-bright">Awaiting Season Start</span>
            </div>
          </div>
          <div className="flex items-start gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${myTeam.accentColor}20` }}
            >
              <svg
                className="w-5 h-5"
                style={{ color: myTeam.accentColor }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm text-white">
                {isPreseason
                  ? "Connected to your league. Agent will activate when the season starts."
                  : `Monitoring Week ${currentWeek + 1} waiver values`}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {myTeam.roster.filter((s) => s.player).length} players on roster -{" "}
                {injuredPlayers.length} injury concern{injuredPlayers.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {injuredPlayers.length > 0 ? (
              injuredPlayers.map((slot) => (
                <div
                  key={slot.player!.id}
                  className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-1.5"
                >
                  <span className="text-xs font-semibold text-yellow-400">
                    {slot.player!.status?.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-300">{slot.player!.name}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-600">No injury concerns</div>
            )}
          </div>
        </div>

        {/* Matchup teaser */}
        <div className="bg-ink-700 border border-ink-400 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">
            {isPreseason ? "Season Starts Soon" : `Week ${currentWeek} Matchup`}
          </h2>
          {opponent ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-10 rounded-full"
                    style={{ backgroundColor: myTeam.accentColor }}
                  />
                  <div>
                    <div className="text-sm font-medium text-white">
                      {myTeam.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {myTeam.wins}-{myTeam.losses}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono text-gray-600">VS</span>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      {opponent.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {opponent.wins}-{opponent.losses}
                    </div>
                  </div>
                  <div
                    className="w-2 h-10 rounded-full"
                    style={{ backgroundColor: opponent.accentColor }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-center gap-6 pt-2">
                <div className="text-center">
                  <div
                    className="text-2xl font-bold font-mono"
                    style={{ color: myTeam.accentColor }}
                  >
                    {myTeam.pointsFor.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-600">PF</div>
                </div>
                <div className="text-gray-700 text-sm">vs</div>
                <div className="text-center">
                  <div
                    className="text-2xl font-bold font-mono"
                    style={{ color: opponent.accentColor }}
                  >
                    {opponent.pointsFor.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-600">PF</div>
                </div>
              </div>
              <Link
                href="/matchup"
                className="block text-center text-xs font-medium text-accent hover:text-accent-glow pt-2 border-t border-ink-400"
              >
                View full matchup ->
              </Link>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              {isPreseason
                ? "No matchups scheduled yet. Draft must complete first."
                : "No matchup found for this week."}
            </div>
          )}
        </div>
      </div>

      {/* Standings table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
            League Standings
          </h2>
          <span className="text-xs text-gray-600">
            {teams.length} teams
          </span>
        </div>
        <div className="bg-ink-700 border border-ink-400 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-400 text-xs text-gray-500 uppercase tracking-wide">
                <th className="text-left py-3 px-4">#</th>
                <th className="text-left py-3 px-2">Team</th>
                <th className="text-left py-3 px-2 hidden sm:table-cell">Owner</th>
                <th className="text-center py-3 px-2">W-L</th>
                <th className="text-center py-3 px-2 hidden sm:table-cell">PF</th>
                <th className="text-center py-3 px-2 hidden md:table-cell">PA</th>
                <th className="text-center py-3 px-2">Streak</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((team, idx) => {
                const isMe = team.id === myTeamId;
                return (
                  <tr
                    key={team.id}
                    className={`border-b border-ink-400/50 transition-colors ${
                      isMe ? "bg-accent/5" : "hover:bg-ink-600/30"
                    }`}
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono text-gray-500">
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
                          <div
                            className={`font-medium ${
                              isMe ? "text-white" : "text-gray-300"
                            }`}
                          >
                            {team.name}
                            {isMe && (
                              <span className="ml-2 text-xs text-accent-glow">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 sm:hidden">
                            {team.ownerName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 hidden sm:table-cell">
                      <span className="font-mono text-xs text-gray-500">
                        {team.ownerName}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-white">
                      {team.wins}-{team.losses}
                      {team.ties > 0 ? `-${team.ties}` : ""}
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-gray-400 hidden sm:table-cell">
                      {team.pointsFor.toFixed(1)}
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-gray-500 hidden md:table-cell">
                      {team.pointsAgainst.toFixed(1)}
                    </td>
                    <td className="py-3 px-2 text-center">
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disconnect option */}
      <div className="text-center">
        <Link
          href="/setup"
          className="text-xs text-gray-600 hover:text-gray-400"
        >
          League settings
        </Link>
      </div>
    </div>
  );
}

// Fallback using mockData when Sleeper API is unavailable
function FallbackHome() {
  const myTeam = teams.find((t) => t.id === myTeamId)!;
  const sortedTeams = [...teams].sort((a, b) => {
    const pctA = a.wins / (a.wins + a.losses);
    const pctB = b.wins / (b.wins + b.losses);
    if (pctB !== pctA) return pctB - pctA;
    return b.pointsFor - a.pointsFor;
  });
  const myRank = sortedTeams.findIndex((t) => t.id === myTeamId) + 1;
  const recentDecisions = decisions.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-yellow-400">
        Live data unavailable. Showing demo data. Connect a league on the Setup page.
      </div>
      <div
        className="rounded-2xl border border-ink-400 overflow-hidden relative"
        style={{
          background: `linear-gradient(135deg, ${myTeam.accentColor}22 0%, #161b22 55%, #0d1117 100%)`,
        }}
      >
        <div className="p-6 sm:p-8">
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">
            Week {currentWeek} - Demo Data
          </div>
          <h1 className="text-3xl font-bold text-white">{myTeam.name}</h1>
          <Link href="/setup" className="text-sm text-accent hover:text-accent-glow mt-3 inline-block">
            Connect a real league ->
          </Link>
        </div>
      </div>
      <div>
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
          Demo Standings
        </h2>
        <div className="bg-ink-700 border border-ink-400 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {sortedTeams.slice(0, 5).map((team, idx) => (
                <tr key={team.id} className="border-b border-ink-400/50">
                  <td className="py-3 px-4 font-mono text-gray-600">{idx + 1}</td>
                  <td className="py-3 px-2 text-gray-300">{team.name}</td>
                  <td className="py-3 px-2 text-center font-mono text-gray-400">
                    {team.wins}-{team.losses}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
