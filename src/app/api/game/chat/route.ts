import { addChat } from "@/lib/game/gameManager";
import type { ChatRequest } from "@/types/api.types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { message }: ChatRequest = await req.json();

  const response = await addChat(message);

  return NextResponse.json(response);
}
