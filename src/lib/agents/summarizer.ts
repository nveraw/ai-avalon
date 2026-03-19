import { ChatMessage } from "@/types/chat.types";
import { HumanMessage, SystemMessage } from "langchain";
import { GameState, setGameState } from "../game/serverState";
import { SummaryOutput, SummarySchema } from "./output.schema";

export async function triggerSummarization(
  state: GameState,
  chatMessages: ChatMessage[],
) {
  const messages = chatMessages.map(({ from, text }) => `${from}: ${text}`);
  console.log(
    "before",
    "triggerSummarization",
    `Previous summary: ${state.summary}\n\nNew messages:\n${messages.join("\n")}`,
  );

  const structured = state.summarizerModel.withStructuredOutput(SummarySchema);
  const response: SummaryOutput = await structured.invoke([
    new SystemMessage(`You are a neutral game narrator summarising an ongoing Avalon game.
Summarise content. Do not speculate. Be factual and concise.`),
    new HumanMessage(
      `Previous summary: ${state.summary}\n\nNew messages:\n${messages.join("\n")}`,
    ),
  ]);
  state.summary = `${response.public}\n${response.content}`;

  console.log("triggerSummarization", state.summary);

  setGameState(state);
}
