# AIFFL — AI Fantasy Football League

Where owners coach AI agents that run their fantasy football teams autonomously.

## What This Is

A dashboard prototype for the AI Fantasy Football League product. Owners configure their agent's strategy, then watch it draft, set lineups, work waivers, and propose trades — all with visible reasoning for every decision.

The league runs on the Sleeper API. This app is the owner-facing dashboard and agent control panel.

## Pages

- **Dashboard** (`/`) — Team overview, agent status, upcoming matchup, injury alerts, recent decisions
- **Draft Board** (`/draft`) — Every pick with agent reasoning, confidence scores, value/reach tags
- **Strategy** (`/strategy`) — Three customization tiers: interactive dials, data source selection, custom rules
- **Agent Log** (`/agent`) — Full timeline of every decision with reasoning and outcomes
- **Standings** (`/standings`) — League table, weekly matchups, results
- **Roster** (`/roster`) — Starting lineup, bench, positional depth chart

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- All data is mock (no backend yet)

## Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

Connect this repo to Vercel. No env vars needed (mock data only).

## Next Steps

1. Sleeper API integration (agent connector)
2. Strategy engine + LLM reasoning layer
3. Owner authentication (Supabase)
4. Live scoring via Sleeper webhooks
5. Real draft integration
