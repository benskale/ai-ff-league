import Link from "next/link";
import { decisions } from "@/lib/mockData";

const typeMeta: Record<string, { color: string; bg: string; label: string }> = {
  draft: { color: "text-gray-400", bg: "bg-gray-500/20", label: "DRAFT" },
  lineup: { color: "text-blue-400", bg: "bg-blue-500/20", label: "LINEUP" },
  waiver: { color: "text-field-bright", bg: "bg-field-dim/30", label: "WAIVER" },
  trade: { color: "text-orange-400", bg: "bg-orange-500/20", label: "TRADE" },
  strategy: { color: "text-accent-glow", bg: "bg-accent/20", label: "STRATEGY" },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function AgentPage() {
  return (
    <div className="space-y-6 fade-in pt-14 lg:pt-0">
      <div>
        <h1 className="text-2xl font-bold text-white">Agent Decision Log</h1>
        <p className="text-sm text-gray-500 mt-1">
          Every move COACH-Z has made this season, with full reasoning.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-ink-700 border border-ink-400 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{decisions.length}</div>
          <div className="text-xs text-gray-500">Total Decisions</div>
        </div>
        <div className="bg-ink-700 border border-ink-400 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-field-bright">
            {decisions.filter((d) => d.outcome === "win").length}
          </div>
          <div className="text-xs text-gray-500">Correct Calls</div>
        </div>
        <div className="bg-ink-700 border border-ink-400 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">
            {decisions.filter((d) => d.outcome === "pending").length}
          </div>
          <div className="text-xs text-gray-500">Pending</div>
        </div>
        <div className="bg-ink-700 border border-ink-400 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-accent-glow">
            {Math.round(decisions.reduce((a, d) => a + d.confidence, 0) / decisions.length)}%
          </div>
          <div className="text-xs text-gray-500">Avg Confidence</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-ink-400" />
        <div className="space-y-4">
          {decisions.map((d) => {
            const meta = typeMeta[d.type] || typeMeta.draft;
            return (
              <div key={d.id} className="relative pl-12">
                <div className={`absolute left-0 top-1 w-10 h-10 rounded-full ${meta.bg} border border-ink-400 flex items-center justify-center`}>
                  <span className={`text-[10px] font-mono font-bold ${meta.color}`}>
                    {meta.label.slice(0, 3)}
                  </span>
                </div>
                <div className="bg-ink-700 border border-ink-400 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${meta.bg} ${meta.color}`}>
                          {meta.label}
                        </span>
                        {d.outcome === "win" && (
                          <span className="text-xs text-field-bright flex items-center gap-1">
                            ✓ Correct
                          </span>
                        )}
                        {d.outcome === "pending" && (
                          <span className="text-xs text-yellow-400 flex items-center gap-1">
                            ⏳ Pending
                          </span>
                        )}
                        {d.outcome === "neutral" && (
                          <span className="text-xs text-gray-600">—</span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-white mt-2">{d.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{d.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-gray-500">Confidence</div>
                      <div className="text-lg font-bold font-mono text-white">{d.confidence}%</div>
                    </div>
                  </div>
                  <div className="bg-ink-800/60 rounded-lg p-3 mt-3">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span className="text-xs font-medium text-accent-glow">Agent Reasoning</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{d.reasoning}</p>
                  </div>
                  <div className="text-xs text-gray-600 mt-2">{formatDate(d.timestamp)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
