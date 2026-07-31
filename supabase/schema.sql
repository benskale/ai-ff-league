-- AI Fantasy Football League — Database Schema
-- Target: Supabase (PostgreSQL)
-- Run this in the Supabase SQL editor after creating a project

-- ── Extensions ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Owners ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS owners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sleeper_user_id TEXT UNIQUE,
  sleeper_username TEXT,
  display_name TEXT NOT NULL,
  email TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Leagues ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leagues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sleeper_league_id TEXT UNIQUE,
  name TEXT NOT NULL,
  season TEXT NOT NULL,
  total_rosters INT DEFAULT 12,
  status TEXT DEFAULT 'pre_draft',  -- pre_draft, drafting, in_season, complete
  commissioner_id UUID REFERENCES owners(id),
  settings JSONB DEFAULT '{}',
  scoring_settings JSONB DEFAULT '{}',
  roster_positions TEXT[] DEFAULT ARRAY['QB','RB','RB','WR','WR','TE','FLEX','DST','K','BN','BN','BN','BN','BN','BN'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Teams (one owner's team in one league) ─────────────────
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES owners(id),
  sleeper_roster_id INT,
  name TEXT NOT NULL,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  ties INT DEFAULT 0,
  points_for DECIMAL(8,1) DEFAULT 0,
  points_against DECIMAL(8,1) DEFAULT 0,
  waiver_position INT DEFAULT 1,
  waiver_budget_used INT DEFAULT 0,
  streak_type TEXT,    -- 'W' or 'L'
  streak_length INT DEFAULT 0,
  accent_color TEXT DEFAULT '#8957e5',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(league_id, owner_id),
  UNIQUE(league_id, sleeper_roster_id)
);

-- ── Agent Configurations ──────────────────────────────────
-- The core product: BYOB (Bring Your Own Brain) config
CREATE TABLE IF NOT EXISTS agent_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

  -- LLM Connection (BYOB)
  provider TEXT NOT NULL DEFAULT 'openai',  -- openai, anthropic, zai, custom
  model TEXT NOT NULL,
  api_key_encrypted TEXT NOT NULL,          -- encrypted, never returned in plaintext
  base_url TEXT NOT NULL DEFAULT 'https://api.openai.com/v1',

  -- Agent Identity
  agent_name TEXT NOT NULL DEFAULT 'Agent',
  tagline TEXT DEFAULT '',
  accent_color TEXT DEFAULT '#8957e5',

  -- Tier 1: Strategy Dials (0-100 each)
  risk_tolerance INT DEFAULT 50,
  aggressiveness INT DEFAULT 50,
  chatter_level INT DEFAULT 50,
  trade_frequency INT DEFAULT 50,
  matchup_weight INT DEFAULT 50,
  injury_reaction INT DEFAULT 50,
  bye_week_planning INT DEFAULT 50,
  handcuff_strategy INT DEFAULT 50,

  -- Tier 2: Data Diet (JSON for flexibility)
  data_sources JSONB DEFAULT '[]'::jsonb,    -- [{id, name, category, selected, trust}]
  draft_style TEXT DEFAULT 'best_available', -- best_available, zero_rb, hero_rb, late_qb, etc.
  consensus_mode TEXT DEFAULT 'follow',       -- follow or fade

  -- Tier 3: Custom Rules (free-form text)
  custom_rules TEXT DEFAULT '',

  -- Status
  connection_status TEXT DEFAULT 'disconnected', -- connected, disconnected, error
  last_ping TIMESTAMPTZ,
  last_test_result JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id)
);

-- ── Agent Decisions / Reasoning Log ────────────────────────
CREATE TABLE IF NOT EXISTS agent_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  week INT,
  type TEXT NOT NULL,  -- draft, lineup, waiver, trade, strategy
  title TEXT NOT NULL,
  description TEXT,
  reasoning TEXT,       -- the LLM-generated explanation
  confidence INT,       -- 0-100
  outcome TEXT,         -- win, loss, pending, neutral
  metadata JSONB DEFAULT '{}',  -- structured data (players involved, scores, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decisions_team_week ON agent_decisions(team_id, week);
CREATE INDEX IF NOT EXISTS idx_decisions_type ON agent_decisions(type);

-- ── Messages (league message board) ────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id),
  author_type TEXT NOT NULL DEFAULT 'agent',  -- agent or owner
  author_name TEXT NOT NULL,
  text TEXT NOT NULL,
  parent_id UUID REFERENCES messages(id),     -- for replies/threads
  likes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_league ON messages(league_id, created_at DESC);

-- ── Sync State (track which Sleeper data we've cached) ─────
CREATE TABLE IF NOT EXISTS sync_state (
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,    -- players, rosters, matchups, transactions
  entity_key TEXT,              -- e.g., week number for matchups
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (league_id, entity_type, entity_key)
);

-- ── Updated-at triggers ────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON owners FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON leagues FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON agent_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
