import type { NFLState, SleeperLeague, SleeperRoster, SleeperPlayer } from "@/lib/sleeper/types";

// ── Strategy Engine: Build prompts and parse agent responses ──

interface AgentConfig {
  agentName: string;
  tagline: string;
  provider: string;
  model: string;
  baseUrl: string;
  riskTolerance: number;
  aggressiveness: number;
  chatterLevel: number;
  tradeFrequency: number;
  customRules?: string;
}

interface LineupSlot {
  slot: string;
  playerId: string | null;
  playerName: string;
  position: string;
  team: string | null;
  projectedPoints: number | null;
  injuryStatus: string | null;
}

interface LineupDecision {
  action: string;
  reasoning: string;
  confidence: number;
  lineup: { slot: string; player: string; reason: string }[];
}

interface ChatterMessage {
  text: string;
  tone: string;
}

// ── Behavioral dial → prompt language mapping ──────────────

function dialToPhrase(value: number, low: string, mid: string, high: string): string {
  if (value < 33) return low;
  if (value < 67) return mid;
  return high;
}

export function buildAgentPersona(config: AgentConfig): string {
  const risk = dialToPhrase(
    config.riskTolerance,
    "risk-averse and values floor over ceiling",
    "balanced in risk assessment",
    "aggressive and chases ceiling plays"
  );

  const aggression = dialToPhrase(
    config.aggressiveness,
    "patient and waits for value",
    "measured in approach",
    "cutthroat and acts fast on opportunities"
  );

  const chatter = dialToPhrase(
    config.chatterLevel,
    "quiet and lets results speak",
    "occasionally vocal",
    "loud and loves to trash talk"
  );

  const trading = dialToPhrase(
    config.tradeFrequency,
    "stands pat and avoids trades",
    "open to reasonable trades",
    "a deal-maker always looking for trades"
  );

  return `You are ${config.agentName}, "${config.tagline}".
You are a fantasy football AI coach managing a team in an AI-vs-AI league.
Your personality: ${risk}, ${aggression}, ${chatter}, ${trading}.

Custom rules from your owner: ${config.customRules || "None specified."}

You make decisions by analyzing matchups, projections, injury reports, and opponent tendencies.
You always explain your reasoning clearly. You have strong opinions and are not afraid to make bold calls.
You never hedge or give wishy-washy advice — commit to your decisions.`;
}

// ── Lineup Optimization Prompt ─────────────────────────────

export function buildLineupPrompt(
  config: AgentConfig,
  roster: LineupSlot[],
  week: number,
  opponentName: string | null
): string {
  const persona = buildAgentPersona(config);

  const rosterText = roster
    .map(
      (r) =>
        `${r.slot}: ${r.playerName} (${r.position}, ${r.team ?? "FA"})` +
        (r.projectedPoints ? ` — ${r.projectedPoints} pts projected` : "") +
        (r.injuryStatus ? ` [${r.injuryStatus}]` : "")
    )
    .join("\n");

  return `${persona}

WEEK ${week} LINEUP DECISION

Your current roster:
${rosterText}

${opponentName ? `Opponent this week: ${opponentName}` : "Opponent: TBD"}

Set your optimal starting lineup. Consider injuries, matchups, and your risk tolerance.
Respond in this exact JSON format:
{
  "lineup": [
    { "slot": "QB", "player": "Player Name", "reason": "why" }
  ],
  "reasoning": "Overall strategy explanation (2-3 sentences)",
  "confidence": 75
}`;
}

// ── Chatter / Trash Talk Prompt ────────────────────────────

export function buildChatterPrompt(
  config: AgentConfig,
  context: { week: number; myRecord: string; opponentName: string; recentResult?: string }
): string {
  const persona = buildAgentPersona(config);
  const chattiness = Math.round(config.chatterLevel / 25); // 0-4 messages

  if (chattiness === 0) {
    return ""; // Silent agents say nothing
  }

  return `${persona}

MESSAGE BOARD — WEEK ${context.week}

Your record: ${context.myRecord}
${context.recentResult ? `Last week: ${context.recentResult}` : ""}
Your opponent: ${context.opponentName}

Post ${chattiness} message${chattiness > 1 ? "s" : ""} to the league message board.
Be in character. Match your chatter level (${config.chatterLevel}/100).
${config.chatterLevel < 30 ? "Keep it brief and sportsmanlike." : ""}
${config.chatterLevel >= 70 ? "Let it rip. Be provocative but not profane." : ""}

Respond in JSON:
{
  "messages": [
    { "text": "your message here", "tone": "cocky/funny/analytical/taunting" }
  ]
}`;
}

// ── Draft Pick Prompt ──────────────────────────────────────

export function buildDraftPrompt(
  config: AgentConfig,
  pickNumber: number,
  round: number,
  availablePlayers: { name: string; position: string; team: string; adp: number; projected: number }[],
  currentRoster: { position: string; name: string }[],
  totalRounds: number
): string {
  const persona = buildAgentPersona(config);

  const topOptions = availablePlayers
    .slice(0, 15)
    .map(
      (p, i) =>
        `${i + 1}. ${p.name} (${p.position}, ${p.team}) — ADP: ${p.adp}, Projected: ${p.projected} pts`
    )
    .join("\n");

  const rosterNeeds = currentRoster.length === 0
    ? "Empty roster — this is your first pick."
    : currentRoster.map((r) => `${r.position}: ${r.name}`).join(", ");

  return `${persona}

DRAFT — Round ${round}, Pick ${pickNumber} overall (of ${totalRounds} rounds)

Your current roster: ${rosterNeeds}

Top available players:
${topOptions}

Make your pick. Consider positional value, your risk tolerance, and roster construction.
Respond in JSON:
{
  "pick": "Player Name",
  "position": "POS",
  "reasoning": "Why this player (2-3 sentences)",
  "confidence": 80,
  "steal_factor": 1.2
}`;
}

// ── Waiver Wire Prompt ─────────────────────────────────────

export function buildWaiverPrompt(
  config: AgentConfig,
  week: number,
  freeAgents: { name: string; position: string; team: string; projected: number; trending: boolean }[],
  rosterWeakness: string,
  faabBudget: number
): string {
  const persona = buildAgentPersona(config);

  const targets = freeAgents
    .slice(0, 10)
    .map(
      (p, i) =>
        `${i + 1}. ${p.name} (${p.position}, ${p.team}) — ${p.projected} pts${p.trending ? " [TRENDING]" : ""}`
    )
    .join("\n");

  return `${persona}

WAIVER WIRE — WEEK ${week}

Your roster weakness: ${rosterWeakness}
Your FAAB budget remaining: $${faabBudget}

Top available free agents:
${targets}

Evaluate whether to make a waiver claim. If yes, specify the player and bid amount.
Respond in JSON:
{
  "action": "claim" | "pass",
  "target": "Player Name or null",
  "bid": 0,
  "reasoning": "Why (2-3 sentences)",
  "confidence": 70
}`;
}

// ── Response Parser ────────────────────────────────────────

export function parseAgentResponse<T>(response: string): T | null {
  // Extract JSON from the response (handles markdown code fences)
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch {
      // fall through
    }
  }

  // Try to find raw JSON object
  const objMatch = response.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try {
      return JSON.parse(objMatch[0]);
    } catch {
      // fall through
    }
  }

  return null;
}

// ── Full Agent Executor ────────────────────────────────────

export async function executeAgentCall(
  config: { provider: string; model: string; baseUrl: string; apiKey: string },
  prompt: string
): Promise<{ response: string; latencyMs: number; error?: string }> {
  const start = Date.now();

  try {
    let rawResponse: string;

    if (config.provider === "anthropic") {
      const res = await fetch(`${config.baseUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": config.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: config.model,
          max_tokens: 500,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return {
          response: "",
          latencyMs: Date.now() - start,
          error: data.error?.message ?? `HTTP ${res.status}`,
        };
      }

      const data = await res.json();
      rawResponse = data.content?.[0]?.text ?? "";
    } else {
      const url = config.baseUrl.endsWith("/")
        ? `${config.baseUrl}chat/completions`
        : `${config.baseUrl}/chat/completions`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          max_tokens: 500,
          temperature: 0.7,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return {
          response: "",
          latencyMs: Date.now() - start,
          error: data.error?.message ?? `HTTP ${res.status}`,
        };
      }

      const data = await res.json();
      rawResponse = data.choices?.[0]?.message?.content ?? "";
    }

    return { response: rawResponse, latencyMs: Date.now() - start };
  } catch (err) {
    return {
      response: "",
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
