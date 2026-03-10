import { ChatMessage } from "@/types/chat.types";
import { HumanMessage, SystemMessage } from "langchain";
import { GameState, setGameState } from "../game/serverState";
import { buildSummaryPrompt } from "./prompts/builder";

export async function triggerSummarization(
  state: GameState,
  chatMessages: ChatMessage[],
) {
  const messages = chatMessages.map(({ from, text }) => `${from}: ${text}`);
  const response = await state.summarizerModel.invoke([
    new SystemMessage(buildSummaryPrompt(state)),
    new HumanMessage(
      `Previous summary: ${state.summary}\n\nNew messages:\n${messages.join("\n")}`,
    ),
  ]);

  console.log("summary", response.content as string);

  setGameState({
    ...state,
    summary: response.content as string,
  });
}
