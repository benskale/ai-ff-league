"use client";

import { useState, useEffect } from "react";

export default function LeagueStatus() {
  const [league, setLeague] = useState<{
    leagueId: string;
    leagueName: string;
    rosterId: number;
    ownerName: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    fetch("/api/league/store")
      .then((res) => res.json())
      .then((data) => {
        setLeague(data.league);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await fetch("/api/league/store", { method: "DELETE" });
      setLeague(null);
      setTimeout(() => window.location.reload(), 500);
    } catch {
      setDisconnecting(false);
    }
  };

  if (loading) return null;

  if (!league) {
    return (
      <div className="bg-ink-700 border border-ink-400 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-2">
          League Connection
        </h2>
        <p className="text-sm text-gray-500">
          No league connected. Go to the home page to connect your Sleeper league.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-ink-700 border border-ink-400 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
          League Connection
        </h2>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-field-dim/20 text-field-bright">
          ● CONNECTED
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">League</div>
          <div className="text-sm text-gray-200">{league.leagueName}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Your Team</div>
          <div className="text-sm text-gray-200">{league.ownerName}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Roster ID</div>
          <div className="text-sm text-gray-200 font-mono">{league.rosterId}</div>
        </div>
      </div>
      <button
        onClick={handleDisconnect}
        disabled={disconnecting}
        className="mt-4 text-xs text-gray-500 hover:text-red-400 transition-colors"
      >
        {disconnecting ? "Disconnecting..." : "Disconnect league"}
      </button>
    </div>
  );
}
