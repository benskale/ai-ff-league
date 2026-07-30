import Link from "next/link";
import { teams, decisions, matchups, myTeamId, currentWeek } from "@/lib/mockData";

export default function DashboardPage() {
  const myTeam = teams.find((t) => t.id === myTeamId)!;
  const upcomingMatchup = matchups.find(
    (m) => m.status === "upcoming" && (m.homeTeamId === myTeamId || m.awayTeamId === myTeamId)
  );
  const opponent = upcomingMatchup
    ? teams.find(
        (t) => t.id === (upcomingMatchup.homeTeamId === myTeamId ? upcomingMatchup.awayTeamId : upcomingMatchup.homeTeamId)
      )
    : null;

  const sortedTeams = [...teams].sort((a, b) => {
    const pctA = a.wins / (a.wins + a.losses);
    const pctB = b.wins / (b.wins + b.losses);
    if (pctB !== pctA) return pctB - pctA;
    return b.pointsFor - a.pointsFor;
  });
  const myRank = sortedTeams.findIndex((t) => t.id === myTeamId) + 1;

  const recentDecisions = decisions.slice(0, 4);
  const injuredPlayers = myTeam.roster.filter(
    (s) => s.player?.status && s.player.status !== "healthy"
  );

  return (
    <div className="space-y-8 fade-in pt-14 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{myTeam.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Agent: <span className="text-accent-glow font-mono">{myTeam.agentName}</span> &middot; {myTeam.agentPersona}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div>
            <div className="text-2xl font-bold text-white">
              {myTeam.wins}-{myTeam.losses}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Record</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-field-bright">{myRank}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Rank</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-accent-glow">{myTeam.streak}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Streak</div>
          </div>
        </div>
      </div>

      {/* Top row: Agent status + Matchup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent status */}
        <div className="lg:col-span-2 bg-ink-700 border border-ink-400 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Agent Status</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-field-bright live-dot" />
              <span className="text-xs text-field-bright">Online</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm text-white">Scanning waivers for Week {currentWeek + 1} values</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Last decision: 2 hours ago &middot; Monitoring injury reports for 3 players
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-3">
              <div className="bg-ink-600/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white">{myTeam.faab}</div>
                <div className="text-xs text-gray-500">FAAB Left</div>
              </div>
              <div className="bg-ink-600/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white">#{myTeam.waiverPriority}</div>
                <div className="text-xs text-gray-500">Waiver Priority</div>
              </div>
              <div className="bg-ink-600/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white">{decisions.length}</div>
                <div className="text-xs text-gray-500">Total Moves</div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming matchup */}
        <div className="bg-ink-700 border border-ink-400 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Week {currentWeek} Matchup</h2>
          {opponent && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-3">vs</div>
                <div className="text-xl font-bold text-white">{opponent.name}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {opponent.wins}-{opponent.losses} &middot; Agent: {opponent.agentName}
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: myTeam.accentColor }}>
                    {myTeam.pointsFor.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">PF</div>
                </div>
                <div className="text-gray-600">-</div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: opponent.accentColor }}>
                    {opponent.pointsFor.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">PF</div>
                </div>
              </div>
              <Link
                href="/standings"
                className="block text-center text-xs text-accent hover:text-accent-glow pt-2"
              >
                View matchup details
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Injury alerts */}
      {injuredPlayers.length > 0 && (
        <div className="bg-ink-700 border border-yellow-500/30 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-wide mb-3">
            Injury Alerts
          </h2>
          <div className="space-y-2">
            {injuredPlayers.map((slot) => (
              <div key={slot.player!.id} className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  slot.player!.status === "questionable" ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"
                }`}>
                  {slot.player!.status?.toUpperCase()}
                </span>
                <span className="text-sm text-white">{slot.player!.name}</span>
                <span className="text-xs text-gray-500">{slot.player!.pos} &middot; {slot.player!.nflTeam}</span>
                <span className="text-xs text-gray-600 ml-auto">{slot.slot}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent decisions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Recent Agent Decisions</h2>
          <Link href="/agent" className="text-xs text-accent hover:text-accent-glow">
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {recentDecisions.map((d) => (
            <Link
              key={d.id}
              href="/agent"
              className="block bg-ink-700 border border-ink-400 rounded-lg p-4 hover:border-accent/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono ${
                    d.type === "lineup" ? "bg-blue-500/20 text-blue-400" :
                    d.type === "waiver" ? "bg-field-dim/30 text-field-bright" :
                    d.type === "trade" ? "bg-orange-500/20 text-orange-400" :
                    d.type === "strategy" ? "bg-accent/20 text-accent-glow" :
                    "bg-gray-500/20 text-gray-400"
                  }`}>
                    {d.type.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white">{d.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{d.description}</div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-xs text-gray-500">Confidence</div>
                  <div className="text-sm font-mono text-white">{d.confidence}%</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/draft" className="bg-ink-700 border border-ink-400 rounded-xl p-4 hover:border-accent/40 transition-colors text-center">
          <div className="text-2xl mb-1">📋</div>
          <div className="text-xs text-gray-400">Draft Board</div>
        </Link>
        <Link href="/strategy" className="bg-ink-700 border border-ink-400 rounded-xl p-4 hover:border-accent/40 transition-colors text-center">
          <div className="text-2xl mb-1">⚙️</div>
          <div className="text-xs text-gray-400">Strategy</div>
        </Link>
        <Link href="/agent" className="bg-ink-700 border border-ink-400 rounded-xl p-4 hover:border-accent/40 transition-colors text-center">
          <div className="text-2xl mb-1">🧠</div>
          <div className="text-xs text-gray-400">Agent Log</div>
        </Link>
        <Link href="/roster" className="bg-ink-700 border border-ink-400 rounded-xl p-4 hover:border-accent/40 transition-colors text-center">
          <div className="text-2xl mb-1">👥</div>
          <div className="text-xs text-gray-400">Roster</div>
        </Link>
      </div>
    </div>
  );
}
