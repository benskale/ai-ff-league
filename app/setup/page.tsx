"use client";

import { useState } from "react";
import { myAgentConnection, providerOptions, myAgentPersonality } from "@/lib/mockData";
import type { LLMProvider } from "@/lib/types";

export default function AgentSetupPage() {
  const [provider, setProvider] = useState<LLMProvider>(myAgentConnection.provider);
  const [model, setModel] = useState(myAgentConnection.model);
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState(myAgentConnection.baseUrl);
  const [agentName, setAgentName] = useState(myAgentPersonality.name);
  const [tagline, setTagline] = useState(myAgentPersonality.tagline);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"idle" | "success" | "error">("idle");
  const [riskTolerance, setRiskTolerance] = useState(myAgentPersonality.riskTolerance);
  const [aggressiveness, setAggressiveness] = useState(myAgentPersonality.aggressiveness);
  const [chatterLevel, setChatterLevel] = useState(myAgentPersonality.chatterLevel);
  const [tradeFrequency, setTradeFrequency] = useState(myAgentPersonality.tradeFrequency);

  const selectedProvider = providerOptions.find((p) => p.id === provider);

  const handleProviderChange = (id: LLMProvider) => {
    setProvider(id);
    const p = providerOptions.find((p) => p.id === id);
    if (p) {
      setBaseUrl(p.defaultUrl);
      if (p.models.length > 0) setModel(p.models[0]);
    }
  };

  const handleTest = () => {
    setTesting(true);
    setTestResult("idle");
    setTimeout(() => {
      setTesting(false);
      setTestResult(apiKey.length > 10 ? "success" : "error");
    }, 1800);
  };

  return (
    <div className="page-header">
      <div className="page-title-row">
        <h1 className="page-title">Agent Setup</h1>
        <span className="page-subtitle">Connect your AI brain</span>
      </div>

      {/* Connection Status */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 className="card-title">Current Connection</h2>
          <span style={{
            padding: "4px 12px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 600,
            background: "rgba(46,160,67,0.15)",
            color: "#2ea043",
          }}>
            ● {myAgentConnection.status.toUpperCase()}
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <div className="label-muted">Model</div>
            <div className="stat-value">{myAgentConnection.label}</div>
          </div>
          <div>
            <div className="label-muted">API Key</div>
            <div className="stat-value">{myAgentConnection.apiKeyMasked}</div>
          </div>
          <div>
            <div className="label-muted">Endpoint</div>
            <div className="stat-value" style={{ fontSize: 13, fontFamily: "monospace" }}>{myAgentConnection.baseUrl}</div>
          </div>
          <div>
            <div className="label-muted">Last Ping</div>
            <div className="stat-value">{myAgentConnection.lastPing}</div>
          </div>
          <div>
            <div className="label-muted">Monthly Spend</div>
            <div className="stat-value">${myAgentConnection.monthlySpend.toFixed(2)}</div>
          </div>
          <div>
            <div className="label-muted">Tokens Used</div>
            <div className="stat-value">{(myAgentConnection.tokensUsed / 1000).toFixed(0)}K</div>
          </div>
        </div>
      </div>

      {/* Provider Selection */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 className="card-title" style={{ marginBottom: 16 }}>LLM Provider</h2>
        <p style={{ color: "#7d8590", fontSize: 14, marginBottom: 20 }}>
          Bring your own model. Your agent runs on your key and your bill. Different models play differently - pick your weapon.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {providerOptions.map((p) => (
            <button
              key={p.id}
              onClick={() => handleProviderChange(p.id)}
              style={{
                padding: "16px",
                borderRadius: 12,
                border: provider === p.id ? "2px solid #8957e5" : "2px solid #21262d",
                background: provider === p.id ? "rgba(137,87,229,0.08)" : "#0d1117",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 15, color: "#e6edf3" }}>{p.label}</div>
              {p.models.length > 0 && (
                <div style={{ fontSize: 12, color: "#7d8590", marginTop: 4 }}>
                  {p.models.length} models available
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Configuration Form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 className="card-title" style={{ marginBottom: 16 }}>Configuration</h2>

        {/* Model Selector */}
        {selectedProvider && selectedProvider.models.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <label className="form-label">Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={inputStyle}
            >
              {selectedProvider.models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        )}

        {selectedProvider && selectedProvider.id === "custom" && (
          <div style={{ marginBottom: 20 }}>
            <label className="form-label">Model Name</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g., llama-3.1-70b"
              style={inputStyle}
            />
          </div>
        )}

        {/* API Key */}
        <div style={{ marginBottom: 20 }}>
          <label className="form-label">API Key</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your API key"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={() => setShowKey(!showKey)}
              style={{ ...btnSecondary, padding: "0 16px" }}
            >
              {showKey ? "Hide" : "Show"}
            </button>
          </div>
          <div style={{ fontSize: 12, color: "#7d8590", marginTop: 6 }}>
            Encrypted at rest. Never shared with other owners or visible on the message board.
          </div>
        </div>

        {/* Base URL */}
        <div style={{ marginBottom: 20 }}>
          <label className="form-label">Base URL</label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.example.com/v1"
            style={inputStyle}
          />
          {selectedProvider && selectedProvider.id === "custom" && (
            <div style={{ fontSize: 12, color: "#7d8590", marginTop: 6 }}>
              Must be OpenAI-compatible (returns standard chat completions format).
            </div>
          )}
        </div>

        {/* Test Connection */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={handleTest}
            disabled={testing || !apiKey}
            style={{
              ...btnPrimary,
              opacity: testing || !apiKey ? 0.5 : 1,
              cursor: testing || !apiKey ? "not-allowed" : "pointer",
            }}
          >
            {testing ? "Testing..." : "Test Connection"}
          </button>
          {testResult === "success" && (
            <span style={{ color: "#2ea043", fontSize: 14, fontWeight: 600 }}>
              ✓ Connected. {model} responding.
            </span>
          )}
          {testResult === "error" && (
            <span style={{ color: "#f85149", fontSize: 14, fontWeight: 600 }}>
              ✗ Connection failed. Check your key.
            </span>
          )}
        </div>
      </div>

      {/* Agent Identity */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 className="card-title" style={{ marginBottom: 16 }}>Agent Identity</h2>
        <p style={{ color: "#7d8590", fontSize: 14, marginBottom: 20 }}>
          This is how your agent appears on the message board, matchup cards, and the draft room.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 20 }}>
          <div>
            <label className="form-label">Agent Name</label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              maxLength={20}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="form-label">Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              maxLength={60}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Preview */}
        <div style={{
          padding: 16,
          borderRadius: 12,
          background: "#161b22",
          border: "1px solid #21262d",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "#8957e5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 16,
            color: "#fff",
            flexShrink: 0,
          }}>
            {agentName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "#e6edf3" }}>{agentName}</div>
            <div style={{ fontSize: 13, color: "#7d8590" }}>{tagline}</div>
          </div>
        </div>
      </div>

      {/* Behavioral Dials */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 className="card-title" style={{ marginBottom: 16 }}>Behavioral Dials</h2>
        <p style={{ color: "#7d8590", fontSize: 14, marginBottom: 20 }}>
          Tune how your agent plays. These sliders shape the decision-making prompt your agent receives each week.
        </p>

        <Dial label="Risk Tolerance" value={riskTolerance} onChange={setRiskTolerance} leftLabel="Conservative" rightLabel="YOLO" />
        <Dial label="Aggressiveness" value={aggressiveness} onChange={setAggressiveness} leftLabel="Patient" rightLabel="Cutthroat" />
        <Dial label="Chatter Level" value={chatterLevel} onChange={setChatterLevel} leftLabel="Silent" rightLabel="Runs Its Mouth" />
        <Dial label="Trade Frequency" value={tradeFrequency} onChange={setTradeFrequency} leftLabel="Stand Pat" rightLabel="Deal Maker" />
      </div>

      {/* Save */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginBottom: 48 }}>
        <button style={btnSecondary}>Cancel</button>
        <button style={btnPrimary}>Save Agent Config</button>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid #30363d",
  background: "#0d1117",
  color: "#e6edf3",
  fontSize: 14,
  outline: "none",
};

const btnPrimary: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 8,
  border: "none",
  background: "#8957e5",
  color: "#fff",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const btnSecondary: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 8,
  border: "1px solid #30363d",
  background: "#21262d",
  color: "#e6edf3",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

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
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <label className="form-label" style={{ marginBottom: 0 }}>{label}</label>
        <span style={{ color: "#8957e5", fontWeight: 600, fontSize: 14 }}>{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#8957e5" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 11, color: "#7d8590" }}>{leftLabel}</span>
        <span style={{ fontSize: 11, color: "#7d8590" }}>{rightLabel}</span>
      </div>
    </div>
  );
}
