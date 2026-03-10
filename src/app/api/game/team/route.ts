import { setTeam } from "@/lib/game/gameManager";
import type { TeamSelectionRequest } from "@/types/api.types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { names }: TeamSelectionRequest = await req.json();
    const response = await setTeam(names);
    return NextResponse.json(response);
  } catch (err) {
    console.error("/api/game/team", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
