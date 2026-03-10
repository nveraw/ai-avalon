import { assassinate } from "@/lib/game/gameManager";
import type { AssassinationRequest } from "@/types/api.types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name }: AssassinationRequest = await req.json();

  const response = await assassinate(name);

  return NextResponse.json(response);
}
