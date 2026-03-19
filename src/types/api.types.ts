// ── Init Game: clean memory, role assign ──────────────────────────────────────────

import { ChatMessage } from "@/types/chat.types";
import { PlayerDetails, PlayerRole, PlayerTeam } from "./game.types";
import { CompletedQuestStatus, QuestStatus, VotedStatus } from "./quest.types";

type GameStatus = {
  questResults: QuestStatus[];
  rejectCount: number;
  round: number;
};

type EndGameResponse = {
  team?: PlayerTeam;
  players?: PlayerDetails[];
};

export type InitGameRequest = {
  playerNames: string[]; // index 0 is always the human
};

export type InitGameResponse = {
  humanRole: PlayerRole; // e.g. "merlin"
  playerRevelation: string[];
  leader: string; // player name
  state: GameStatus;
};

// ── Chat ─────────────────────────────────────────

export type ChatRequest = {
  message: ChatMessage; // human's message
};

export type ChatResponse = {
  messages: ChatMessage[];
};

// ── Team Selection ─────────────────────────────────────────

export type TeamSelectionRequest = {
  names: string[]; // player names, index 0 = human
};

export type TeamSelectionResponse = {
  proposedTeam: string[]; // player names, index 0 = leader
  messages: ChatMessage[];
};

// ── Voting ─────────────────────────────────────────

export type VoteRequest = {
  humanVote: VotedStatus;
};

export type VoteResponse = {
  votes: Record<string, VotedStatus>; // player name: all votes including human's
  result: VotedStatus; // majority
  leader: string | null; // null if vote passed
  winner?: EndGameResponse;
  state?: GameStatus;
  selectedTeam: string[];
};

// ── Quest ─────────────────────────────────────────

export type QuestRequest = {
  humanCard: CompletedQuestStatus | null; // null if human not on team
};

export type QuestResponse = {
  cards: Array<CompletedQuestStatus>; // shuffled, anonymous
  result: CompletedQuestStatus;
  leader: string; // player name
  messages: ChatMessage[];
  winner?: EndGameResponse;
  state?: GameStatus;
};

// ── Assassination ─────────────────────────────────────────

export type AssassinationRequest = {
  name: string;
};

export type AssassinationResponse = {
  targetName: string;
  messages: ChatMessage[];
  winner: EndGameResponse;
};
