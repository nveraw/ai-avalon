import { roleList } from "@/constants/playerRoles";
import { setGameState } from "@/lib/game/gameStore";
import {
  AssassinationResponse,
  ChatResponse,
  InitGameResponse,
  QuestResponse,
  TeamSelectionResponse,
  VoteResponse,
} from "@/types/api.types";
import { CompletedQuestStatus } from "@/types/quest.types";
import { VotedStatus } from "@/types/vote.types";
import { buildKnowledge } from "@/utils/knowledge";
import { randomRoleToAssign } from "@/utils/shuffle";
import { ChatMistralAI } from "@langchain/mistralai";
import { createLlmModel } from "../agents/agentManager";

export const initGame = (playerNames: string[]): InitGameResponse => {
  const activeRoles = roleList.slice(0, playerNames.length);
  const shuffled = randomRoleToAssign(activeRoles);
  const humanRole = shuffled[0];

  const players = createLlmModel(playerNames.slice(1), shuffled.slice(1));
  const leaderIndex = Math.floor(Math.random() * playerNames.length);

  setGameState({
    players,
    leaderIndex,
    round: 1,
    rejectCount: 0,
    questResults: [],
    selectedTeam: [],
    summary: "",
    summarizerModel: new ChatMistralAI({
      model: "mistral-small-latest",
    }),
  });

  return {
    humanRole,
    playerRevelation:
      buildKnowledge(
        humanRole,
        [...players].map((agent) => ({ name: agent.name, role: agent.role })),
      ).map((player) => player.name) || [],
    leader: playerNames[leaderIndex],
  };
};

export const addChat = (message: string): ChatResponse => {
  return {
    messages: [],
  };
};
export const setTeam = (names: string[]): TeamSelectionResponse => {
  // if (names.length) aiPickTeam();
  return {
    proposedTeam: [],
    messages: [],
  };
};
export const addVote = (humanVote: VotedStatus): VoteResponse => {
  return {
    nextLeader: "",
    rejectCount: 0,
    result: "approve",
    votes: {},
    messages: [],
  };
};
export const setQuest = (
  humanCard: CompletedQuestStatus | null,
): QuestResponse => {
  return {
    cards: [],
    nextLeader: "",
    questResults: [],
    result: "success",
    messages: [],
    winner: {
      team: "good",
      players: [],
    },
  };
};
export const assassinate = (name: string): AssassinationResponse => {
  // if (!name) aiPickTarget();
  return {
    targetName: "",
    messages: [],
    team: "good",
    players: [],
  };
};
