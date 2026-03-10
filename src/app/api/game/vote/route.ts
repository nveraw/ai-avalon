import { addVote } from "@/lib/game/gameManager";
import type { VoteRequest } from "@/types/api.types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { humanVote }: VoteRequest = await req.json();

  const response = await addVote(humanVote);

  return NextResponse.json(response);
}
