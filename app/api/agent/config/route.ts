import { NextRequest, NextResponse } from "next/server";
import { encryptApiKey, decryptApiKey, maskApiKey } from "@/lib/agent/crypto";

// Agent config save/load
// Uses Supabase when configured. Falls back to a local JSON file for dev.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), ".data");
const CONFIG_FILE = join(DATA_DIR, "agent-config.json");

interface AgentConfigInput {
  provider: string;
  model: string;
  apiKey: string;
  baseUrl: string;
  agentName: string;
  tagline: string;
  riskTolerance: number;
  aggressiveness: number;
  chatterLevel: number;
  tradeFrequency: number;
}

// ── Local file fallback (dev only, no Supabase needed) ─────
function loadLocal(): AgentConfigInput | null {
  if (!existsSync(CONFIG_FILE)) return null;
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
  } catch {
    return null;
  }
}

function saveLocal(config: AgentConfigInput) {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// ── Routes ──────────────────────────────────────────────────

export async function GET() {
  // Try Supabase first
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      // For MVP, single-team demo — first config row
      const { data, error } = await supabase
        .from("agent_configs")
        .select("*")
        .limit(1)
        .single();

      if (error || !data) {
        return NextResponse.json({ config: null });
      }

      return NextResponse.json({
        config: {
          ...data,
          apiKeyMasked: data.api_key_encrypted ? maskApiKey(decryptApiKey(data.api_key_encrypted)) : null,
          api_key_encrypted: undefined, // never expose ciphertext either
        },
      });
    } catch {
      // Fall through to local
    }
  }

  // Local fallback
  const config = loadLocal();
  if (!config) return NextResponse.json({ config: null });

  return NextResponse.json({
    config: {
      ...config,
      apiKeyMasked: maskApiKey(config.apiKey),
      apiKey: undefined,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AgentConfigInput;

    // Validate
    if (!body.provider || !body.model) {
      return NextResponse.json(
        { error: "Provider and model are required" },
        { status: 400 }
      );
    }

    // Try Supabase first
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const encryptedKey = encryptApiKey(body.apiKey);

        // Upsert into agent_configs (single team for MVP)
        const { error } = await supabase
          .from("agent_configs")
          .upsert({
            provider: body.provider,
            model: body.model,
            api_key_encrypted: encryptedKey,
            base_url: body.baseUrl,
            agent_name: body.agentName,
            tagline: body.tagline,
            risk_tolerance: body.riskTolerance,
            aggressiveness: body.aggressiveness,
            chatter_level: body.chatterLevel,
            trade_frequency: body.tradeFrequency,
            connection_status: "connected",
            last_ping: new Date().toISOString(),
          });

        if (error) throw error;

        return NextResponse.json({ success: true, stored: "supabase" });
      } catch (err) {
        console.error("Supabase save failed, falling back to local:", err);
      }
    }

    // Local fallback (dev)
    saveLocal(body);
    return NextResponse.json({ success: true, stored: "local" });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to save config", detail: String(err) },
      { status: 500 }
    );
  }
}
