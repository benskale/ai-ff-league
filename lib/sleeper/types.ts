// Sleeper API type definitions
// Source: https://docs.sleeper.com/

/** Current NFL state (week, season, etc.) */
export interface NFLState {
  week: number;
  leg: number;
  season: string;
  season_type: "pre" | "regular" | "post";
  league_season: string;
  previous_season: string;
  season_start_date: string;
  display_week: number;
  league_create_season: string;
  season_has_scores: boolean;
}

/** A Sleeper user account */
export interface SleeperUser {
  user_id: string;
  username: string;
  display_name: string;
  avatar: string | null;
  is_owner?: boolean;
  metadata?: {
    team_name?: string;
    [key: string]: string | undefined;
  };
}

/** A Sleeper league */
export interface SleeperLeague {
  league_id: string;
  name: string;
  season: string;
  season_type: string;
  sport: string;
  status: "pre_draft" | "drafting" | "in_season" | "complete";
  total_rosters: number;
  draft_id: string | null;
  avatar: string | null;
  previous_league_id: string | null;
  settings: LeagueSettings;
  scoring_settings: ScoringSettings;
  roster_positions: string[];
}

export interface LeagueSettings {
  max_keepers?: number;
  draft_hours_per_pick?: number;
  draft_rounds?: number;
  waiver_budget?: number;
  waiver_type?: string;
  waiver_clear_days?: number;
  playoff_week_start?: number;
  playoff_teams?: number;
  num_teams?: number;
  reserve_slots?: number;
  trade_deadline?: number;
  daily_waivers_hour?: number;
  last_scored_leg?: number;
  [key: string]: number | string | undefined;
}

export interface ScoringSettings {
  [key: string]: number;
}

/** A roster (team) within a league */
export interface SleeperRoster {
  roster_id: number;
  owner_id: string;
  league_id: string;
  players: string[];
  starters: string[];
  reserve: string[];
  taxi?: string[];
  settings: {
    wins: number;
    losses: number;
    ties: number;
    fpts: number;
    fpts_decimal: number;
    fpts_against: number;
    fpts_against_decimal: number;
    streak_length?: number;
    streak_type?: string;
    total_moves?: number;
    waiver_position: number;
    waiver_budget_used: number;
    [key: string]: number | string | undefined;
  };
}

/** Matchup data for a given week */
export interface SleeperMatchup {
  matchup_id: number;
  roster_id: number;
  starters: string[];
  players: string[];
  points: number;
  custom_points: number | null;
}

/** Player database entry (from the big player DB) */
export interface SleeperPlayer {
  player_id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  position: string | null;
  fantasy_positions: string[];
  team: string | null;
  number: number | null;
  height: string | null;
  weight: string | null;
  age: number | null;
  years_exp: number | null;
  college: string | null;
  active: boolean;
  status: string | null;
  injury_status: string | null;
  injury_body_part: string | null;
  injury_notes: string | null;
  injury_start_date: string | null;
  practice_participation: string | null;
  practice_description: string | null;
  news_updated: number | null;
  depth_chart_position: string | null;
  depth_chart_order: number | null;
  search_rank: number;
  espn_id: number | null;
  yahoo_id: number | null;
  sportradar_id: string | null;
  gsis_id: string | null;
  metadata?: Record<string, string>;
  hashtag: string | null;
  search_full_name: string | null;
  search_first_name: string | null;
  search_last_name: string | null;
}

/** Trending player entry */
export interface TrendingPlayer {
  player_id: string;
  count: number;
}

/** Transaction (trade, waiver, free agent add/drop) */
export interface SleeperTransaction {
  transaction_id: string;
  type: "trade" | "free_agent" | "waiver" | "commissioner";
  status: "complete" | "pending" | "failed";
  status_updated: number;
  leg: number;
  roster_ids: number[];
  creator: string;
  created: number;
  consenter_ids: number[];
  adds: Record<string, number> | null;
  drops: Record<string, number> | null;
  draft_picks: TradedPick[];
  waiver_budget: WaiverBudgetChange[];
  settings: Record<string, number | string> | null;
  metadata: Record<string, string> | null;
}

export interface TradedPick {
  season: string;
  round: number;
  roster_id: number;
  previous_owner_id: number;
  owner_id: number;
}

export interface WaiverBudgetChange {
  sender: number;
  receiver: number;
  amount: number;
}

/** Draft information */
export interface SleeperDraft {
  draft_id: string;
  league_id: string;
  name: string;
  season: string;
  season_type: string;
  sport: string;
  status: "pre_draft" | "drafting" | "complete";
  type: "snake" | "linear" | "auction";
  start_time: number | null;
  settings: {
    teams: number;
    rounds: number;
    pick_timer: number;
    slots_qb: number;
    slots_rb: number;
    slots_wr: number;
    slots_te: number;
    slots_k: number;
    slots_def: number;
    slots_flex: number;
    slots_super_flex: number;
    slots_bn: number;
    [key: string]: number;
  };
  draft_order: Record<string, number> | null;
  slot_counts: number;
  last_picked: number | null;
  last_message_time: number | null;
  created: number;
}

/** A single draft pick */
export interface DraftPick {
  player_id: string;
  round: number;
  draft_slot: number;
  pick_no: number;
  metadata?: {
    position?: string;
    team?: string;
    [key: string]: string | undefined;
  };
  draft_id: string;
  is_keeper: boolean;
  picked_by: string;
  picked_at: number;
  roster_id: number;
}

/** Playoff bracket matchup */
export interface BracketMatchup {
  r: number;
  m: number;
  t1: number | null;
  t2: number | null;
  w: number | null;
  l: number | null;
  t1_from?: { w?: number; l?: number };
  t2_from?: { w?: number; l?: number };
  p?: number;
}
