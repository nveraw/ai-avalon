import { addChat } from "@/lib/game/gameManager";
import type { ChatRequest } from "@/types/api.types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message }: ChatRequest = await req.json();
    const response = await addChat(message);
    return NextResponse.json(response);
  } catch (err) {
    console.error("/api/game/chat", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
