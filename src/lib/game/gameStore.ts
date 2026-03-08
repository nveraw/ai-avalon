import { PlayerRole } from "@/types/player.types";
import { CompletedQuestStatus } from "@/types/quest.types";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage } from "langchain";

export type AgentPlayer = {
  name: string;
  role: PlayerRole;
  model: ChatMistralAI; // the actual LLM instance
  privateMemory: string[];
};

export interface GameState {
  players: AgentPlayer[];
  leaderIndex: number;
  round: number;
  rejectCount: number;
  questResults: CompletedQuestStatus[];
  selectedTeam: string[];
  summary: string; // rolling summary from summarizer AI
  summarizerModel: ChatMistralAI;
}

// nextjs hot reload fix
// const globalForGame = globalThis as typeof globalThis & { gameState?: GameState };

// export const getGameState = () => globalForGame.gameState ?? null;
// export const setGameState = (s: GameState) => { globalForGame.gameState = s; };

// In-memory store — cleared on new game or server restart
let gameState: GameState | null = null;

export const getGameState = () => gameState;
export const setGameState = (s: GameState) => {
  gameState = s;
};
export const clearGameState = () => {
  gameState = null;
};

export async function triggerSummarization(
  state: GameState,
  messages: string[],
) {
  const response = await state.summarizerModel.invoke([
    new SystemMessage(
      "You summarize Avalon game chat. Be concise. Keep: key accusations, trust signals, voting patterns, quest outcomes.",
    ),
    new HumanMessage(
      `Previous summary: ${state.summary}\n\nNew messages:\n${messages.join("\n --- \n")}`,
    ),
  ]);

  state.summary = response.content as string;
}
