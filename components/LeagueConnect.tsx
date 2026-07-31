"use client";

import { useState } from "react";
import Link from "next/link";

interface TeamOption {
  rosterId: number;
  teamName: string;
  owner: string;
  record: string;
}

interface LeagueInfo {
  id: string;
  name: string;
  season: string;
  status: string;
  totalRosters: number;
}

export default function LeagueConnect() {
  const [leagueId, setLeagueId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [leagueInfo, setLeagueInfo] = useState<LeagueInfo | null>(null);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [selectedRoster, setSelectedRoster] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleLookup = async () => {
    setLoading(true);
    setError("");
    setLeagueInfo(null);
    setTeams([]);
    setSelectedRoster(null);

    try {
      const res = await fetch("/api/league/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leagueId }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      if (data.step === "select_roster") {
        setLeagueInfo(data.league);
        setTeams(data.teams);
      }
    } catch {
      setError("Network error. Check the league ID and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (selectedRoster === null) return;
    setConnecting(true);
    setError("");

    try {
      const res = await fetch("/api/league/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leagueId, rosterId: selectedRoster }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      if (data.success) {
        setConnected(true);
        // Reload the page to load real data
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch {
      setError("Failed to connect. Try again.");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl border border-ink-400 overflow-hidden relative bg-gradient-to-br from-accent/10 via-ink-800 to-ink-900">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent" />
        <div className="p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-white">Connect Your League</h1>
          <p className="text-sm text-gray-400 mt-2 max-w-md">
            Enter your Sleeper league ID to pull real rosters, standings, and matchups.
            Your AI agent will manage your team autonomously once the season starts.
          </p>
        </div>
      </div>

      {/* League lookup */}
      <div className="bg-ink-700 border border-ink-400 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
          Sleeper League ID
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={leagueId}
            onChange={(e) => setLeagueId(e.target.value)}
            placeholder="e.g., 9876543210123456"
            className="flex-1 px-3.5 py-2.5 rounded-lg border border-ink-400 bg-ink-800 text-gray-200 text-sm outline-none focus:border-accent font-mono"
            onKeyDown={(e) => e.key === "Enter" && leagueId && handleLookup()}
          />
          <button
            onClick={handleLookup}
            disabled={loading || !leagueId}
            className={`px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold flex-shrink-0 ${
              loading || !leagueId ? "opacity-50 cursor-not-allowed" : "hover:bg-accent-glow"
            }`}
          >
            {loading ? "Searching..." : "Find League"}
          </button>
        </div>
        {error && (
          <div className="mt-3 text-sm text-red-400">{error}</div>
        )}
        <div className="mt-2 text-xs text-gray-500">
          Find your league ID in the Sleeper app URL when viewing your league.
        </div>
      </div>

      {/* Team selection */}
      {leagueInfo && teams.length > 0 && (
        <div className="bg-ink-700 border border-ink-400 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                Select Your Team
              </h2>
              <div className="text-sm text-white mt-1">{leagueInfo.name}</div>
              <div className="text-xs text-gray-500">
                {leagueInfo.season} season - {teams.length} teams
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {teams.map((t) => (
              <button
                key={t.rosterId}
                onClick={() => setSelectedRoster(t.rosterId)}
                className={`p-3 rounded-lg text-left transition-colors border-2 ${
                  selectedRoster === t.rosterId
                    ? "border-accent bg-accent/10"
                    : "border-ink-400 bg-ink-800 hover:border-ink-300"
                }`}
              >
                <div className="text-sm font-medium text-white">{t.teamName}</div>
                <div className="text-xs text-gray-500">
                  {t.owner} - {t.record}
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleConnect}
              disabled={connecting || selectedRoster === null}
              className={`px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold ${
                connecting || selectedRoster === null
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-accent-glow"
              }`}
            >
              {connecting ? "Connecting..." : "Connect League"}
            </button>
            {connected && (
              <span className="text-sm text-field-bright font-medium">
                Connected! Reloading...
              </span>
            )}
          </div>
        </div>
      )}

      {/* Agent setup link */}
      <div className="bg-ink-700 border border-ink-400 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-2">
          Next Step: Agent Setup
        </h2>
        <p className="text-sm text-gray-500 mb-3">
          Once your league is connected, head to Agent Setup to connect your LLM and configure how your AI coach plays.
        </p>
        <Link
          href="/setup"
          className="inline-block text-sm text-accent hover:text-accent-glow font-medium"
        >
          Go to Agent Setup ->
        </Link>
      </div>
    </div>
  );
}
