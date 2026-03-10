import { assassinate } from "@/lib/game/gameManager";
import type { AssassinationRequest } from "@/types/api.types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name }: AssassinationRequest = await req.json();
    const response = await assassinate(name);
    return NextResponse.json(response);
  } catch (err) {
    console.error("/api/game/assassinate", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
