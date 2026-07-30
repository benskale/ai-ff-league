export type Position = "QB" | "RB" | "WR" | "TE" | "K" | "DEF";

export interface Player {
  id: string;
  name: string;
  pos: Position;
  nflTeam: string;
  projected: number;
  actual?: number | null;
  status?: "healthy" | "questionable" | "out" | "IR";
  trending?: "up" | "down" | "flat";
}

export interface RosterSlot {
  slot: string;
  player: Player | null;
}

export interface Team {
  id: string;
  name: string;
  ownerName: string;
  agentName: string;
  agentPersona: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  streak: string;
  waiverPriority: number;
  faab: number;
  roster: RosterSlot[];
  accentColor: string;
}

export interface DraftPick {
  overall: number;
  round: number;
  pickInRound: number;
  teamId: string;
  teamName: string;
  player: Player;
  reasoning: string;
  confidence: number;
  reachOrValue: "reach" | "value" | "fair";
}

export interface AgentDecision {
  id: string;
  timestamp: string;
  type: "draft" | "lineup" | "waiver" | "trade" | "strategy";
  title: string;
  description: string;
  reasoning: string;
  confidence: number;
  outcome?: "win" | "loss" | "pending" | "neutral";
}

export interface StrategyDial {
  key: string;
  label: string;
  description: string;
  value: number;
  leftLabel: string;
  rightLabel: string;
}

export interface Matchup {
  week: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: "final" | "live" | "upcoming";
}

export interface DataSource {
  id: string;
  name: string;
  category: string;
  selected: boolean;
  trust: number;
}

export interface FreeAgent {
  id: string;
  name: string;
  pos: Position;
  nflTeam: string;
  projected: number;
  lastWeek: number;
  trend: number;
  ownership: number;
  agentRecommendation: "high" | "medium" | "low" | "pass";
  agentNote: string;
  suggestedBid: number;
}

export interface Message {
  id: string;
  teamId: string;
  teamName: string;
  agentName: string;
  accentColor: string;
  author: "owner" | "agent";
  authorName: string;
  text: string;
  timestamp: string;
  likes: number;
  likedByMe: boolean;
  replies?: Message[];
}

export type LLMProvider = "openai" | "anthropic" | "zai" | "custom";

export interface AgentConnection {
  provider: LLMProvider;
  label: string;
  model: string;
  apiKeyMasked: string;
  baseUrl: string;
  status: "connected" | "disconnected" | "error";
  lastPing: string;
  monthlySpend: number;
  tokensUsed: number;
}

export interface AgentPersonality {
  name: string;
  tagline: string;
  riskTolerance: number;
  aggressiveness: number;
  chatterLevel: number;
  tradeFrequency: number;
}
