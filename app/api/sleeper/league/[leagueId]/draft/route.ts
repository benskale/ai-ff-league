import { NextRequest, NextResponse } from "next/server";
import { sleeper } from "@/lib/sleeper/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: { leagueId: string } }
) {
  try {
    const drafts = await sleeper.getLeagueDrafts(params.leagueId);

    // If there's a draft, fetch picks too
    let picks = null;
    if (drafts.length > 0 && drafts[0].draft_id) {
      picks = await sleeper.getDraftPicks(drafts[0].draft_id).catch(() => null);
    }

    return NextResponse.json({ drafts, picks });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch draft", detail: String(err) },
      { status: 500 }
    );
  }
}
