import { ChatMessage } from "@/types/chat.types";
import { HumanMessage, SystemMessage } from "langchain";
import { AgentPlayer, GameState } from "../game/serverState";
import { ChatResponseOutput, ChatResponseSchema } from "./output.schema";
import { buildAgentSystemPrompt, buildChatPrompt } from "./prompts/builder";
import { triggerSummarization } from "./summarizer";
export async function runChatResponses(
  state: GameState,
  humanMessage: ChatMessage,
): Promise<ChatMessage[]> {
  const chats = state.players.map(async (player) => {
    const systemPrompt = buildAgentSystemPrompt(player.role, state);
    const userPrompt = `${humanMessage.from} just said: "${humanMessage.text}" ${buildChatPrompt()}`;

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

  await triggerSummarization(state, filtered);

  return filtered;
}

export async function runActionResponses(
  players: AgentPlayer[],
  state: GameState,
  prompt: string,
): Promise<ChatMessage[]> {
  const chats = players.map(async (player) => {
    const systemPrompt = buildAgentSystemPrompt(player.role, state);
    const userPrompt = `${prompt.replaceAll(player.name, `${player.name} (me)`)} ${buildChatPrompt()}`;

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

  return filtered;
}
