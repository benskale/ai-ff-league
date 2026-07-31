import { NextRequest, NextResponse } from "next/server";
import { sleeper } from "@/lib/sleeper/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: { leagueId: string; week: string } }
) {
  const { leagueId, week } = params;
  const weekNum = parseInt(week, 10);

  try {
    const transactions = await sleeper.getTransactions(leagueId, weekNum);
    return NextResponse.json({ transactions, week: weekNum });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch transactions", detail: String(err) },
      { status: 500 }
    );
  }
}
