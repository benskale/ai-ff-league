"use client";

import { useState } from "react";
import { strategyDials, dataSources, customRules } from "@/lib/mockData";

export default function StrategyClient() {
  const [dials, setDials] = useState(strategyDials);
  const [sources, setSources] = useState(dataSources);
  const [rules, setRules] = useState(customRules);
  const [newRule, setNewRule] = useState("");
  const [saved, setSaved] = useState(false);

  const updateDial = (key: string, value: number) => {
    setDials((prev) => prev.map((d) => (d.key === key ? { ...d, value } : d)));
    setSaved(false);
  };

  const toggleSource = (id: string) => {
    setSources((prev) => prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s)));
    setSaved(false);
  };

  const updateTrust = (id: string, trust: number) => {
    setSources((prev) => prev.map((s) => (s.id === id ? { ...s, trust } : s)));
    setSaved(false);
  };

  const addRule = () => {
    if (newRule.trim()) {
      setRules([...rules, newRule.trim()]);
      setNewRule("");
      setSaved(false);
    }
  };

  const removeRule = (idx: number) => {
    setRules(rules.filter((_, i) => i !== idx));
    setSaved(false);
  };

  return (
    <div className="space-y-8">
      {/* Tier 1: Strategy Dials */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-accent bg-accent/15 px-2 py-0.5 rounded uppercase tracking-wide">Tier 1</span>
          <h2 className="text-lg font-semibold text-white">Strategy Dials</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Eight sliders that define your agent's personality. Plain football language, no ML jargon.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dials.map((dial) => (
            <div key={dial.key} className="bg-ink-700 border border-ink-400 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-white">{dial.label}</label>
                <span className="text-xs font-mono text-accent-glow">{dial.value}</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">{dial.description}</p>
              <input
                type="range"
                min="0"
                max="100"
                value={dial.value}
                onChange={(e) => updateDial(dial.key, parseInt(e.target.value))}
                className="w-full"
                style={{
                  background: `linear-gradient(to right, #8957e5 ${dial.value}%, #252d3a ${dial.value}%)`,
                  borderRadius: "3px",
                }}
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-gray-600">{dial.leftLabel}</span>
                <span className="text-[10px] text-gray-600">{dial.rightLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tier 2: Data Diet */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-accent bg-accent/15 px-2 py-0.5 rounded uppercase tracking-wide">Tier 2</span>
          <h2 className="text-lg font-semibold text-white">Data Diet</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Select which intelligence sources your agent consumes and how much it trusts each one.
        </p>
        <div className="space-y-2">
          {sources.map((src) => (
            <div
              key={src.id}
              className={`flex items-center gap-4 bg-ink-700 border rounded-lg p-3 transition-colors ${
                src.selected ? "border-accent/30" : "border-ink-400"
              }`}
            >
              <button
                onClick={() => toggleSource(src.id)}
                className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                  src.selected ? "bg-accent" : "bg-ink-400"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    src.selected ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white">{src.name}</div>
                <div className="text-xs text-gray-500">{src.category}</div>
              </div>
              {src.selected && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-500">Trust</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={src.trust}
                    onChange={(e) => updateTrust(src.id, parseInt(e.target.value))}
                    className="w-20"
                    style={{
                      background: `linear-gradient(to right, #2ea043 ${src.trust}%, #252d3a ${src.trust}%)`,
                      borderRadius: "3px",
                    }}
                  />
                  <span className="text-xs font-mono text-gray-400 w-8 text-right">{src.trust}%</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tier 3: Custom Rules */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-accent bg-accent/15 px-2 py-0.5 rounded uppercase tracking-wide">Tier 3</span>
          <h2 className="text-lg font-semibold text-white">Custom Rules (Wildcard)</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Free-form rules parsed by your agent. Write in plain English. These override dials on conflict.
        </p>
        <div className="space-y-2 mb-3">
          {rules.map((rule, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-ink-700 border border-ink-400 rounded-lg p-3">
              <span className="text-accent-glow text-xs font-mono mt-0.5">#{idx + 1}</span>
              <p className="flex-1 text-sm text-gray-300">{rule}</p>
              <button
                onClick={() => removeRule(idx)}
                className="text-gray-600 hover:text-red-400 text-sm flex-shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addRule()}
            placeholder="e.g. Always stash the backup for my RB1 after Week 6"
            className="flex-1 bg-ink-700 border border-ink-400 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent/50"
          />
          <button
            onClick={addRule}
            className="px-4 py-2 bg-ink-600 border border-ink-300 rounded-lg text-sm text-white hover:bg-ink-500 transition-colors"
          >
            Add Rule
          </button>
        </div>
      </div>

      {/* Save bar */}
      <div className="sticky bottom-4 flex justify-end">
        <button
          onClick={() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
          }}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            saved
              ? "bg-field-dim text-white"
              : "bg-accent text-white hover:bg-accent-glow shadow-lg shadow-accent/20"
          }`}
        >
          {saved ? "Strategy Updated" : "Save Strategy"}
        </button>
      </div>
    </div>
  );
}
