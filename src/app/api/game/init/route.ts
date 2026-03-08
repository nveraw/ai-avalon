import { initGame } from "@/lib/game/gameManager";
import type { InitGameRequest, InitGameResponse } from "@/types/api.types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { playerNames }: InitGameRequest = await req.json();

  const response: InitGameResponse = initGame(playerNames);

  return NextResponse.json(response);
}
