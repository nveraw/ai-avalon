import { PlayerRole } from "@/types/game.types";
import { CompletedQuestStatus, VotedStatus } from "@/types/quest.types";

export type AgentPlayer = {
  name: string;
  role: PlayerRole;
  model?: any; // the actual LLM instance
  privateMemory?: string[];
};

type HistoryEntry = {
  leader: string;
  teams: string[];
  votes: Record<string, VotedStatus>;
  failCards: number;
  result: CompletedQuestStatus;
};

export interface GameState {
  players: AgentPlayer[];
  leaderIndex: number;
  round: number;
  rejectCount: number;
  questResults: CompletedQuestStatus[];
  selectedTeam: string[];
  stateHistory: Record<string, HistoryEntry>;
  summary: string; // rolling summary from summarizer AI
  summarizerModel: any;
}

// In-memory store — cleared on new game or server restart
let gameState: GameState | null = null;

export const getGameState = () => gameState;
export const setGameState = (state: GameState) => {
  gameState = state;
};

// nextjs hot reload fix
// const globalForGame = globalThis as typeof globalThis & {
//   gameState?: GameState;
// };

// export const getGameState = () => globalForGame.gameState ?? null;
// export const setGameState = (s: GameState) => {
//   globalForGame.gameState = s;
// };
