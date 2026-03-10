import { addVote } from "@/lib/game/gameManager";
import type { VoteRequest } from "@/types/api.types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { humanVote }: VoteRequest = await req.json();
    const response = await addVote(humanVote);
    return NextResponse.json(response);
  } catch (err) {
    console.error("/api/game/vote", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
