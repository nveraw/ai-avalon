import { initGame } from "@/lib/game/gameManager";
import type { InitGameRequest } from "@/types/api.types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { playerNames }: InitGameRequest = await req.json();
    const response = await initGame(playerNames);
    return NextResponse.json(response);
  } catch (err) {
    console.error("/api/game/init", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
