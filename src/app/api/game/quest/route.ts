import { setQuest } from "@/lib/game/gameManager";
import type { QuestRequest } from "@/types/api.types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { humanCard }: QuestRequest = await req.json();

  const response = setQuest(humanCard);

  return NextResponse.json(response);
}
