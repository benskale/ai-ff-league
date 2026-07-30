"use client";

import { useState, useMemo } from "react";
import { freeAgents, teams, myTeamId } from "@/lib/mockData";
import type { Position } from "@/lib/types";

const posColor: Record<string, string> = {
  QB: "text-blue-400 bg-blue-500/15",
  RB: "text-field-bright bg-field-dim/20",
  WR: "text-orange-400 bg-orange-500/15",
  TE: "text-purple-400 bg-purple-500/15",
  K: "text-yellow-400 bg-yellow-500/15",
  DEF: "text-cyan-400 bg-cyan-500/15",
};

const recMeta: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  high: { label: "TARGET", color: "text-field-bright", bg: "bg-field-dim/30" },
  medium: {
    label: "WATCH",
    color: "text-yellow-400",
    bg: "bg-yellow-500/15",
  },
  low: {
    label: "STASH",
    color: "text-gray-400",
    bg: "bg-gray-500/15",
  },
  pass: { label: "PASS", color: "text-red-400", bg: "bg-red-500/15" },
};

const FILTERS: ("ALL" | Position)[] = [
  "ALL",
  "QB",
  "RB",
  "WR",
  "TE",
  "K",
  "DEF",
];

export default function FreeAgentsPage() {
  const [filter, setFilter] = useState<"ALL" | Position>("ALL");
  const myTeam = teams.find((t) => t.id === myTeamId)!;

  const filtered = useMemo(() => {
    const list =
      filter === "ALL"
        ? freeAgents
        : freeAgents.filter((fa) => fa.pos === filter);
    // Sort: agent recommendation priority then projected
    const order: Record<string, number> = {
      high: 0,
      medium: 1,
      low: 2,
      pass: 3,
    };
    return [...list].sort((a, b) => {
      if (order[a.agentRecommendation] !== order[b.agentRecommendation]) {
        return order[a.agentRecommendation] - order[b.agentRecommendation];
      }
      return b.projected - a.projected;
    });
  }, [filter]);

  const highValue = freeAgents.filter(
    (fa) => fa.agentRecommendation === "high"
  );

  return (
    <div className="space-y-6 fade-in pt-14 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Waiver Wire</h1>
          <p className="text-sm text-gray-500 mt-1">
            <span
              className="font-mono"
              style={{ color: myTeam.accentColor }}
            >
              {myTeam.agentName}
            </span>{" "}
            recommends {highValue.length} targets · ${myTeam.faab} FAAB
            available · Priority #{myTeam.waiverPriority}
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              filter === f
                ? "bg-accent/20 text-accent-glow border-accent/40"
                : "bg-ink-700 text-gray-400 border-ink-400 hover:text-white hover:border-ink-300"
            }`}
          >
            {f === "ALL" ? "All Positions" : f}
          </button>
        ))}
      </div>

      {/* Agent picks highlight */}
      {filter === "ALL" && highValue.length > 0 && (
        <div className="bg-ink-700 border border-field-dim/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-field-bright">⚡</span>
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
              COACH-Z Top Targets
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {highValue.map((fa) => (
              <div
                key={fa.id}
                className="bg-ink-600/50 border border-ink-400/50 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${posColor[fa.pos]}`}
                  >
                    {fa.pos}
                  </span>
                  <span className="text-xs font-mono text-field-bright">
                    Bid ${fa.suggestedBid}
                  </span>
                </div>
                <div className="text-sm font-medium text-white">{fa.name}</div>
                <div className="text-xs text-gray-500">{fa.nflTeam}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Player list */}
      <div className="space-y-3">
        {filtered.map((fa) => {
          const rec = recMeta[fa.agentRecommendation];
          const trendUp = fa.trend > 0;
          const trendFlat = Math.abs(fa.trend) < 0.01;
          return (
            <div
              key={fa.id}
              className="bg-ink-700 border border-ink-400 rounded-xl p-4 hover:border-ink-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Position badge */}
                <span
                  className={`text-xs font-mono font-bold w-10 text-center px-1.5 py-2 rounded flex-shrink-0 ${posColor[fa.pos]}`}
                >
                  {fa.pos}
                </span>

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-white">
                      {fa.name}
                    </span>
                    <span className="text-xs text-gray-500">{fa.nflTeam}</span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${rec.bg} ${rec.color}`}
                    >
                      {rec.label}
                    </span>
                  </div>
                  {/* Trend row */}
                  <div className="flex items-center gap-4 mt-1.5">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-gray-600 uppercase tracking-wide">
                        Trend
                      </span>
                      <span
                        className={`text-xs font-mono ${
                          trendFlat
                            ? "text-gray-500"
                            : trendUp
                            ? "text-field-bright"
                            : "text-red-400"
                        }`}
                      >
                        {trendFlat
                          ? "—"
                          : `${trendUp ? "+" : ""}${fa.trend.toFixed(1)}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-gray-600 uppercase tracking-wide">
                        Own
                      </span>
                      <span className="text-xs font-mono text-gray-400">
                        {fa.ownership}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-gray-600 uppercase tracking-wide">
                        Last
                      </span>
                      <span className="text-xs font-mono text-gray-400">
                        {fa.lastWeek.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  {/* Agent note */}
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    <span style={{ color: myTeam.accentColor }}>
                      {myTeam.agentName}:
                    </span>{" "}
                    {fa.agentNote}
                  </p>
                </div>

                {/* Right rail: proj + bid */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-lg font-bold font-mono text-white">
                    {fa.projected.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-gray-600 uppercase tracking-wide">
                    Proj
                  </div>
                  <div className="mt-2 bg-ink-600/60 rounded-lg px-2 py-1 border border-ink-400/50">
                    <div className="text-[9px] text-gray-600 uppercase tracking-wide">
                      Bid
                    </div>
                    <div
                      className={`text-sm font-mono font-bold ${
                        fa.suggestedBid >= 5
                          ? "text-field-bright"
                          : fa.suggestedBid > 0
                          ? "text-white"
                          : "text-gray-600"
                      }`}
                    >
                      ${fa.suggestedBid}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-sm text-gray-600">
          No free agents at this position.
        </div>
      )}
    </div>
  );
}
