import { ChatMessage } from "@/types/chat.types";
import { HumanMessage, SystemMessage } from "langchain";
import { GameState, setGameState } from "../game/serverState";
import { SummaryOutput, SummarySchema } from "./output.schema";
import { buildSummaryPrompt } from "./prompts/builder";

export async function triggerSummarization(
  state: GameState,
  chatMessages: ChatMessage[],
) {
  const messages = chatMessages.map(({ from, text }) => `${from}: ${text}`);

  const structured = state.summarizerModel.withStructuredOutput(SummarySchema);
  const response: SummaryOutput = await structured.invoke([
    new SystemMessage(buildSummaryPrompt(state)),
    new HumanMessage(
      `Previous summary: ${state.summary}\n\nNew messages:\n${messages.join("\n")}`,
    ),
  ]);
  state.summary = `${state.summary}\n${response.newSummary}`;

  console.log("summary", response.previousSummary, response.newSummary);

  setGameState(state);
}
