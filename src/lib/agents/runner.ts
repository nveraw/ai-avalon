import { ChatMessage } from "@/types/chat.types";
import { HumanMessage, SystemMessage } from "langchain";
import { AgentPlayer, GameState } from "../game/serverState";
import { ChatResponseOutput, ChatResponseSchema } from "./output.schema";
import { buildAgentSystemPrompt } from "./prompts/builder";
import { triggerSummarization } from "./summarizer";

export async function runChatResponses(
  state: GameState,
  humanMessage: ChatMessage,
): Promise<ChatMessage[]> {
  const chats = state.players.map(async (player) => {
    const systemPrompt = buildAgentSystemPrompt(player.role, state);
    const userPrompt = `${humanMessage.from} just said: "${humanMessage.text}"
Respond in character at the Round Table. 1–2 sentences. You may address the human or other players. Address yourself as first person to sound natural.`;

    const model = player.model;
    if (!model) return;
    const structured = model.withStructuredOutput(ChatResponseSchema);
    const output: ChatResponseOutput = await structured.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt),
    ]);

    return { from: player.name, text: output.publicMessage };
  });
  const messages = await Promise.all(chats);
  const filtered = messages.filter((msg) => !!msg);

  triggerSummarization(state, filtered);

  return filtered;
}

export async function runActionResponses(
  players: AgentPlayer[],
  state: GameState,
  prompt: string,
): Promise<ChatMessage[]> {
  const chats = players.map(async (player) => {
    return await runActionResponse(player, state, prompt);
  });
  const messages = await Promise.all(chats);
  const filtered = messages.filter((msg) => !!msg);

  triggerSummarization(state, filtered);

  return filtered;
}

async function runActionResponse(
  player: AgentPlayer,
  state: GameState,
  actionPrompt: string,
): Promise<ChatMessage | undefined> {
  const systemPrompt = buildAgentSystemPrompt(player.role, state);
  const userPrompt = `${actionPrompt}
Respond in character at the Round Table. 1–2 sentences. You may address the human or other players.`;

  const model = player.model;
  if (!model) return;
  const structured = model.withStructuredOutput(ChatResponseSchema);
  const output: ChatResponseOutput = await structured.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(userPrompt),
  ]);

  return { from: player.name, text: output.publicMessage };
}
