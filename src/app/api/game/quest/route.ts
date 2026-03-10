import { setQuest } from "@/lib/game/gameManager";
import type { QuestRequest } from "@/types/api.types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { humanCard }: QuestRequest = await req.json();
    const response = await setQuest(humanCard);
    return NextResponse.json(response);
  } catch (err) {
    console.error("/api/game/quest", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
