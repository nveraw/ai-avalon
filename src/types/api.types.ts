// ── Init Game: clean memory, role assign ──────────────────────────────────────────

import { ChatMessage } from "@/store/chat";
import { PlayerDetails, PlayerRole, PlayerTeam } from "./player.types";
import { CompletedQuestStatus } from "./quest.types";
import { VotedStatus } from "./vote.types";

export type InitGameRequest = {
  playerNames: string[]; // index 0 is always the human
};

export type InitGameResponse = {
  humanRole: PlayerRole; // e.g. "merlin"
  playerRevelation: string[];
  leader: string; // player name
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
  nextLeader: string | null; // null if vote passed
  rejectCount: number; // +1 if vote failed
  winner?: EndGameResponse;
};

// ── Quest ─────────────────────────────────────────

export type QuestRequest = {
  humanCard: CompletedQuestStatus | null; // null if human not on team
};

type EndGameResponse = {
  team?: PlayerTeam;
  players?: PlayerDetails[];
};

export type QuestResponse = {
  cards: Array<CompletedQuestStatus>; // shuffled, anonymous
  result: CompletedQuestStatus;
  nextLeader: string; // player name
  messages: ChatMessage[];
  winner?: EndGameResponse;
};

// ── Assassination ─────────────────────────────────────────

export type AssassinationRequest = {
  name: string;
};

export interface AssassinationResponse extends EndGameResponse {
  targetName: string;
  messages: ChatMessage[];
}

// export type EndGameResponse = {
//   messages: ChatMessage[];         // good-game messages
// };
