import { PlayerRole } from "@/types/game.types";
import { CompletedQuestStatus } from "@/types/quest.types";
import { ChatMistralAI } from "@langchain/mistralai";

export type AgentPlayer = {
  name: string;
  role: PlayerRole;
  model?: ChatMistralAI; // the actual LLM instance
  privateMemory?: string[];
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

// In-memory store — cleared on new game or server restart
let gameState: GameState | null = null;

export const getGameState = () => gameState;
export const setGameState = (state: GameState) => {
  gameState = state;
};
