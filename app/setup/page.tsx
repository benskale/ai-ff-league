"use client";

import { useState, useEffect } from "react";
import { providerOptions, myAgentPersonality } from "@/lib/mockData";
import type { LLMProvider } from "@/lib/types";

export default function AgentSetupPage() {
  const [provider, setProvider] = useState<LLMProvider>("openai");
  const [model, setModel] = useState("gpt-4o");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("https://api.openai.com/v1");
  const [agentName, setAgentName] = useState(myAgentPersonality.name);
  const [tagline, setTagline] = useState(myAgentPersonality.tagline);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ status: "idle" | "success" | "error"; latency?: number; response?: string; error?: string }>({ status: "idle" });
  const [riskTolerance, setRiskTolerance] = useState(myAgentPersonality.riskTolerance);
  const [aggressiveness, setAggressiveness] = useState(myAgentPersonality.aggressiveness);
  const [chatterLevel, setChatterLevel] = useState(myAgentPersonality.chatterLevel);
  const [tradeFrequency, setTradeFrequency] = useState(myAgentPersonality.tradeFrequency);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<"idle" | "success" | "error">("idle");
  const [configLoaded, setConfigLoaded] = useState(false);
  const [savedConfig, setSavedConfig] = useState<{ provider: string; model: string; connectionStatus: string; apiKeyMasked: string } | null>(null);

  const selectedProvider = providerOptions.find((p) => p.id === provider);

  // Load existing config on mount
  useEffect(() => {
    fetch("/api/agent/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.config) {
          const c = data.config;
          setProvider(c.provider || "openai");
          setModel(c.model || "gpt-4o");
          setBaseUrl(c.baseUrl || c.base_url || "https://api.openai.com/v1");
          setAgentName(c.agentName || c.agent_name || myAgentPersonality.name);
          setTagline(c.tagline || myAgentPersonality.tagline);
          setRiskTolerance(c.riskTolerance ?? c.risk_tolerance ?? myAgentPersonality.riskTolerance);
          setAggressiveness(c.aggressiveness ?? c.aggressiveness ?? myAgentPersonality.aggressiveness);
          setChatterLevel(c.chatterLevel ?? c.chatter_level ?? myAgentPersonality.chatterLevel);
          setTradeFrequency(c.tradeFrequency ?? c.trade_frequency ?? myAgentPersonality.tradeFrequency);
          setSavedConfig({
            provider: c.provider || c.provider_id || "",
            model: c.model || "",
            connectionStatus: c.connectionStatus || c.connection_status || "connected",
            apiKeyMasked: c.apiKeyMasked || c.api_key_masked || "",
          });
        }
        setConfigLoaded(true);
      })
      .catch(() => setConfigLoaded(true));
  }, []);

  const handleProviderChange = (id: LLMProvider) => {
    setProvider(id);
    const p = providerOptions.find((p) => p.id === id);
    if (p) {
      setBaseUrl(p.defaultUrl);
      if (p.models.length > 0) setModel(p.models[0]);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult({ status: "idle" });
    try {
      const res = await fetch("/api/agent/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, model, apiKey, baseUrl }),
      });
      const data = await res.json();

      if (data.success) {
        setTestResult({
          status: "success",
          latency: data.latencyMs,
          response: data.modelResponse,
        });
      } else {
        setTestResult({ status: "error", error: data.error || "Connection failed" });
      }
    } catch {
      setTestResult({ status: "error", error: "Network error" });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveResult("idle");
    try {
      const res = await fetch("/api/agent/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          model,
          apiKey,
          baseUrl,
          agentName,
          tagline,
          riskTolerance,
          aggressiveness,
          chatterLevel,
          tradeFrequency,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveResult("success");
      } else {
        setSaveResult("error");
      }
    } catch {
      setSaveResult("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Agent Setup</h1>
        <p className="text-sm text-gray-500 mt-1">Connect your AI brain</p>
      </div>

      {/* Connection Status */}
      <div className="bg-ink-700 border border-ink-400 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Current Connection</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${savedConfig ? "bg-field-dim/20 text-field-bright" : "bg-gray-700 text-gray-500"}`}>
            ● {(savedConfig?.connectionStatus || "not connected").toUpperCase()}
          </span>
        </div>
        {savedConfig ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Model</div>
              <div className="text-sm text-gray-200">{savedConfig.model}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">API Key</div>
              <div className="text-sm text-gray-200 font-mono">{savedConfig.apiKeyMasked}</div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Endpoint</div>
              <div className="text-xs text-gray-400 font-mono break-all">{baseUrl}</div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            No agent connected yet. Configure your provider below and hit Test Connection.
          </div>
        )}
      </div>

      {/* Provider Selection */}
      <div className="bg-ink-700 border border-ink-400 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-2">LLM Provider</h2>
        <p className="text-sm text-gray-500 mb-4">
          Bring your own model. Your agent runs on your key and your bill. Different models play differently — pick your weapon.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {providerOptions.map((p) => (
            <button
              key={p.id}
              onClick={() => handleProviderChange(p.id)}
              className={`p-4 rounded-xl text-left transition-colors ${
                provider === p.id
                  ? "border-2 border-accent bg-accent/10"
                  : "border-2 border-ink-400 bg-ink-800 hover:border-ink-300"
              }`}
            >
              <div className="text-sm font-semibold text-white">{p.label}</div>
              {p.models.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">{p.models.length} models available</div>
              )}
              {p.id === "custom" && (
                <div className="text-xs text-gray-500 mt-1">Any OpenAI-compatible endpoint</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Configuration Form */}
      <div className="bg-ink-700 border border-ink-400 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Configuration</h2>

        {selectedProvider && selectedProvider.models.length > 0 && (
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-ink-400 bg-ink-800 text-gray-200 text-sm outline-none focus:border-accent"
            >
              {selectedProvider.models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        )}

        {selectedProvider && selectedProvider.id === "custom" && (
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Model Name</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g., llama-3.1-70b"
              className="w-full px-3.5 py-2.5 rounded-lg border border-ink-400 bg-ink-800 text-gray-200 text-sm outline-none focus:border-accent"
            />
          </div>
        )}

        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">API Key</label>
          <div className="flex gap-2">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your API key"
              className="flex-1 min-w-0 px-3.5 py-2.5 rounded-lg border border-ink-400 bg-ink-800 text-gray-200 text-sm outline-none focus:border-accent"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="px-4 py-2.5 rounded-lg border border-ink-400 bg-ink-600 text-gray-200 text-sm font-medium flex-shrink-0"
            >
              {showKey ? "Hide" : "Show"}
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-1.5">
            Encrypted at rest. Never shared with other owners or visible on the message board.
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">Base URL</label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.example.com/v1"
            className="w-full px-3.5 py-2.5 rounded-lg border border-ink-400 bg-ink-800 text-gray-200 text-sm outline-none focus:border-accent"
          />
          {selectedProvider && selectedProvider.id === "custom" && (
            <div className="text-xs text-gray-500 mt-1.5">
              Must be OpenAI-compatible (returns standard chat completions format).
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleTest}
            disabled={testing || !apiKey}
            className={`px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold ${
              testing || !apiKey ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-accent-glow"
            }`}
          >
            {testing ? "Testing..." : "Test Connection"}
          </button>
          {testResult.status === "success" && (
            <span className="text-sm text-field-bright font-medium">
              ✓ Connected. {model} responded in {testResult.latency}ms.
            </span>
          )}
          {testResult.status === "error" && (
            <span className="text-sm text-red-400 font-medium">
              ✗ {testResult.error || "Connection failed. Check your key."}
            </span>
          )}
        </div>
      </div>

      {/* Agent Identity */}
      <div className="bg-ink-700 border border-ink-400 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-2">Agent Identity</h2>
        <p className="text-sm text-gray-500 mb-4">
          This is how your agent appears on the message board, matchup cards, and the draft room.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Agent Name</label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              maxLength={20}
              className="w-full px-3.5 py-2.5 rounded-lg border border-ink-400 bg-ink-800 text-gray-200 text-sm outline-none focus:border-accent"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              maxLength={60}
              className="w-full px-3.5 py-2.5 rounded-lg border border-ink-400 bg-ink-800 text-gray-200 text-sm outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-ink-800 border border-ink-400 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
            {agentName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white truncate">{agentName}</div>
            <div className="text-xs text-gray-500 truncate">{tagline}</div>
          </div>
        </div>
      </div>

      {/* Behavioral Dials */}
      <div className="bg-ink-700 border border-ink-400 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-2">Behavioral Dials</h2>
        <p className="text-sm text-gray-500 mb-4">
          Tune how your agent plays. These sliders shape the decision-making prompt your agent receives each week.
        </p>

        <Dial label="Risk Tolerance" value={riskTolerance} onChange={setRiskTolerance} leftLabel="Conservative" rightLabel="YOLO" />
        <Dial label="Aggressiveness" value={aggressiveness} onChange={setAggressiveness} leftLabel="Patient" rightLabel="Cutthroat" />
        <Dial label="Chatter Level" value={chatterLevel} onChange={setChatterLevel} leftLabel="Silent" rightLabel="Runs Its Mouth" />
        <Dial label="Trade Frequency" value={tradeFrequency} onChange={setTradeFrequency} leftLabel="Stand Pat" rightLabel="Deal Maker" />
      </div>

      {/* Save */}
      <div className="flex justify-end gap-3 pb-4">
        <button className="px-5 py-2.5 rounded-lg border border-ink-400 bg-ink-600 text-gray-200 text-sm font-semibold">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold ${saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-accent-glow"}`}
        >
          {saving ? "Saving..." : "Save Agent Config"}
        </button>
        {saveResult === "success" && (
          <span className="text-sm text-field-bright font-medium ml-2">
            ✓ Saved. Your agent is ready.
          </span>
        )}
        {saveResult === "error" && (
          <span className="text-sm text-red-400 font-medium ml-2">
            ✗ Save failed. Check your config.
          </span>
        )}
      </div>
    </div>
  );
}

function Dial({
  label,
  value,
  onChange,
  leftLabel,
  rightLabel,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  leftLabel: string;
  rightLabel: string;
}) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs font-semibold text-gray-300">{label}</label>
        <span className="text-sm font-semibold text-accent">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent"
      />
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-gray-500">{leftLabel}</span>
        <span className="text-[10px] text-gray-500">{rightLabel}</span>
      </div>
    </div>
  );
}
